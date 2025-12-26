"use strict";
/**
 * 帳號刪除 Job
 *
 * 功能：
 * 1. 掃描 PENDING_DELETE 且已到期的用戶
 * 2. 按順序刪除用戶數據
 * 3. 匿名化 subscriptions
 * 4. 設置 tombstone 狀態
 *
 * 參考文檔：app.doc/features/註銷賬號功能設計方案.md v1.1 第 7 節
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BATCH_SIZE = void 0;
exports.executeAccountDeletionJob = executeAccountDeletionJob;
exports.deleteUserData = deleteUserData;
exports.anonymizeSubscriptions = anonymizeSubscriptions;
exports.setUserTombstone = setUserTombstone;
const uuid_1 = require("uuid");
const crypto_1 = __importDefault(require("crypto"));
const connection_1 = require("../database/connection");
// ===== 配置 =====
/** 每批處理的用戶數量 */
const BATCH_SIZE = 200;
exports.BATCH_SIZE = BATCH_SIZE;
/** 匿名化密鑰（應從環境變量讀取） */
const ANONYMIZATION_SECRET = process.env.XIAOPEI_ANONYMIZATION_SECRET || 'default-secret-change-me';
// ===== 主函數 =====
/**
 * 執行帳號刪除 Job
 *
 * 掃描所有 PENDING_DELETE 且 delete_scheduled_at <= NOW() 的用戶
 */
async function executeAccountDeletionJob() {
    const jobLog = {
        jobId: (0, uuid_1.v4)(),
        startTime: new Date(),
        totalUsers: 0,
        successCount: 0,
        failureCount: 0,
        errors: [],
    };
    console.log(`[AccountDeletionJob] ========== 開始執行 Job ${jobLog.jobId} ==========`);
    const pool = (0, connection_1.getPool)();
    try {
        // 1. 掃描待刪除用戶（分批處理）
        const [rows] = await pool.execute(`SELECT user_id FROM users 
       WHERE status = 'PENDING_DELETE' 
         AND delete_scheduled_at <= UTC_TIMESTAMP()
       LIMIT ?`, [BATCH_SIZE]);
        jobLog.totalUsers = rows.length;
        if (rows.length === 0) {
            console.log(`[AccountDeletionJob] 沒有待刪除的用戶`);
            jobLog.endTime = new Date();
            return jobLog;
        }
        console.log(`[AccountDeletionJob] 找到 ${rows.length} 個待刪除用戶`);
        // 2. 逐個處理用戶
        for (const row of rows) {
            const userId = row.user_id;
            try {
                await deleteUserData(userId);
                jobLog.successCount++;
                console.log(`[AccountDeletionJob] ✅ 用戶 ${userId} 刪除成功`);
            }
            catch (error) {
                jobLog.failureCount++;
                jobLog.errors.push({
                    userId,
                    errorCode: error.code || 'UNKNOWN_ERROR',
                    errorMessage: error.message || '未知錯誤',
                });
                console.error(`[AccountDeletionJob] ❌ 用戶 ${userId} 刪除失敗:`, error.message);
            }
        }
    }
    catch (error) {
        console.error(`[AccountDeletionJob] Job 執行失敗:`, error);
        throw error;
    }
    finally {
        jobLog.endTime = new Date();
        const duration = jobLog.endTime.getTime() - jobLog.startTime.getTime();
        console.log(`[AccountDeletionJob] ========== Job 完成 ==========`);
        console.log(`[AccountDeletionJob] 總計: ${jobLog.totalUsers} 用戶, 成功: ${jobLog.successCount}, 失敗: ${jobLog.failureCount}`);
        console.log(`[AccountDeletionJob] 耗時: ${duration}ms`);
    }
    return jobLog;
}
/**
 * 刪除單個用戶的所有數據
 *
 * 使用事務確保原子性，按順序刪除：
 * 1. 聊天消息 (messages)
 * 2. 對話 (conversations)
 * 3. 解讀記錄 (readings)
 * 4. 八字結果 (bazi_charts) - 通過 chart_profiles 級聯刪除
 * 5. 命盤檔案 (chart_profiles)
 * 6. 用戶設置 (user_settings)
 * 7. 限流記錄 (rate_limits)
 * 8. 匿名化訂閱 (subscriptions)
 * 9. 設置 tombstone (users)
 */
async function deleteUserData(userId) {
    const pool = (0, connection_1.getPool)();
    const connection = await pool.getConnection();
    const startTime = Date.now();
    try {
        await connection.beginTransaction();
        // 使用 FOR UPDATE 鎖定用戶行，防止並發
        const [userRows] = await connection.execute(`SELECT user_id, status, delete_scheduled_at, phone, email 
       FROM users 
       WHERE user_id = ? 
       FOR UPDATE`, [userId]);
        if (userRows.length === 0) {
            throw new Error('用戶不存在');
        }
        const user = userRows[0];
        // 再次確認狀態和時間（防止 cancel 競爭）
        if (user.status !== 'PENDING_DELETE') {
            throw new Error(`用戶狀態不正確: ${user.status}`);
        }
        const deleteScheduledAt = new Date(user.delete_scheduled_at);
        if (deleteScheduledAt > new Date()) {
            throw new Error('用戶尚未到期');
        }
        // 刪除計數
        const counts = {
            messages: 0,
            conversations: 0,
            charts: 0,
            readings: 0,
            settings: 0,
            rateLimits: 0,
        };
        // ===== 1. 刪除聊天消息 =====
        // 先獲取用戶的所有對話 ID
        const [conversationRows] = await connection.execute(`SELECT conversation_id FROM conversations WHERE user_id = ?`, [userId]);
        if (conversationRows.length > 0) {
            const conversationIds = conversationRows.map((r) => r.conversation_id);
            // 刪除消息（分批刪除避免超大事務）
            for (const convId of conversationIds) {
                const [result] = await connection.execute(`DELETE FROM messages WHERE conversation_id = ?`, [convId]);
                counts.messages += result.affectedRows;
            }
        }
        // ===== 2. 刪除對話 =====
        const [convResult] = await connection.execute(`DELETE FROM conversations WHERE user_id = ?`, [userId]);
        counts.conversations = convResult.affectedRows;
        // ===== 3. 刪除解讀記錄 =====
        const [readingResult] = await connection.execute(`DELETE FROM readings WHERE user_id = ?`, [userId]);
        counts.readings = readingResult.affectedRows;
        // ===== 4 & 5. 刪除命盤（bazi_charts 會通過外鍵級聯刪除） =====
        // 先統計 bazi_charts 數量
        const [chartRows] = await connection.execute(`SELECT COUNT(*) as count FROM bazi_charts bc
       INNER JOIN chart_profiles cp ON bc.chart_profile_id = cp.chart_profile_id
       WHERE cp.user_id = ?`, [userId]);
        counts.charts = chartRows[0].count;
        // 刪除 chart_profiles（級聯刪除 bazi_charts）
        await connection.execute(`DELETE FROM chart_profiles WHERE user_id = ?`, [userId]);
        // ===== 6. 刪除用戶設置 =====
        const [settingsResult] = await connection.execute(`DELETE FROM user_settings WHERE user_id = ?`, [userId]);
        counts.settings = settingsResult.affectedRows;
        // ===== 7. 刪除限流記錄 =====
        const [rateLimitResult] = await connection.execute(`DELETE FROM rate_limits WHERE user_id = ?`, [userId]);
        counts.rateLimits = rateLimitResult.affectedRows;
        // ===== 8. 匿名化訂閱 =====
        await anonymizeSubscriptions(connection, userId);
        // ===== 9. 設置 tombstone =====
        // 注意：users 表已删除 email 字段（migration 008），只传递 phone
        await setUserTombstone(connection, userId, user.phone);
        // ===== 10. 記錄審計日誌 =====
        const duration = Date.now() - startTime;
        await recordAuditLog(connection, userId, 'DELETION_EXECUTED', 'SUCCESS', null, null, counts, duration);
        await connection.commit();
        console.log(`[AccountDeletionJob] 用戶 ${userId} 數據刪除完成:`, counts);
    }
    catch (error) {
        await connection.rollback();
        // 記錄失敗的審計日誌（在新事務中）
        try {
            const duration = Date.now() - startTime;
            await recordAuditLogStandalone(userId, 'DELETION_EXECUTED', 'FAILED', error.code, error.message, null, duration);
        }
        catch (logError) {
            console.error(`[AccountDeletionJob] 審計日誌記錄失敗:`, logError);
        }
        throw error;
    }
    finally {
        connection.release();
    }
}
/**
 * 匿名化用戶的訂閱記錄
 *
 * 使用 HMAC-SHA256 生成不可逆的匿名化鍵
 */
async function anonymizeSubscriptions(connection, userId) {
    // 生成匿名化鍵
    const anonymizedKey = crypto_1.default
        .createHmac('sha256', ANONYMIZATION_SECRET)
        .update(`user:${userId}`)
        .digest('hex');
    // 更新訂閱記錄
    await connection.execute(`UPDATE subscriptions 
     SET anonymized_user_key = ?,
         user_id = NULL
     WHERE user_id = ?`, [anonymizedKey, userId]);
    console.log(`[AccountDeletionJob] 用戶 ${userId} 訂閱已匿名化`);
}
/**
 * 設置用戶為 tombstone 狀態
 *
 * - 狀態改為 DELETED
 * - 清除所有 PII
 * - 保留 user_id 和 deleted_at
 */
// 注意：users 表已删除 email 字段（migration 008），只处理 phone
async function setUserTombstone(connection, userId, originalPhone) {
    // 生成佔位符（確保唯一性）
    const randomSuffix = crypto_1.default.randomBytes(8).toString('hex');
    const phoneReplacement = `deleted_${userId.substring(0, 8)}_${randomSuffix}`;
    // 注意：users 表已删除 email 字段（migration 008），只保留 phone
    await connection.execute(`UPDATE users SET
      status = 'DELETED',
      deleted_at = UTC_TIMESTAMP(),
      delete_requested_at = NULL,
      delete_scheduled_at = NULL,
      -- 清除 PII
      phone = ?,
      nickname = NULL,
      avatar = NULL,
      password_hash = NULL,
      username = NULL,
      -- 保留 token_version 並增加（確保舊 token 失效）
      token_version = token_version + 1
    WHERE user_id = ?`, [
        originalPhone ? phoneReplacement : null,
        userId
    ]);
    console.log(`[AccountDeletionJob] 用戶 ${userId} 已設置為 tombstone`);
}
/**
 * 記錄審計日誌（在事務內）
 */
async function recordAuditLog(connection, userId, action, result, errorCode, errorMessage, counts, durationMs) {
    await connection.execute(`INSERT INTO account_audit_logs (
      log_id, user_id, action, result, error_code, error_message,
      deleted_messages_count, deleted_conversations_count,
      deleted_charts_count, deleted_readings_count,
      duration_ms
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        (0, uuid_1.v4)(),
        userId,
        action,
        result,
        errorCode,
        errorMessage,
        counts?.messages || null,
        counts?.conversations || null,
        counts?.charts || null,
        counts?.readings || null,
        durationMs,
    ]);
}
/**
 * 記錄審計日誌（獨立事務，用於錯誤情況）
 */
async function recordAuditLogStandalone(userId, action, result, errorCode, errorMessage, counts, durationMs) {
    const pool = (0, connection_1.getPool)();
    await pool.execute(`INSERT INTO account_audit_logs (
      log_id, user_id, action, result, error_code, error_message,
      deleted_messages_count, deleted_conversations_count,
      deleted_charts_count, deleted_readings_count,
      duration_ms
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
        (0, uuid_1.v4)(),
        userId,
        action,
        result,
        errorCode,
        errorMessage,
        counts?.messages || null,
        counts?.conversations || null,
        counts?.charts || null,
        counts?.readings || null,
        durationMs,
    ]);
}
//# sourceMappingURL=accountDeletionJob.js.map