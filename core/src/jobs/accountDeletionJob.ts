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

import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import mysql from 'mysql2/promise';
import { getPool } from '../database/connection';

type PoolConnection = mysql.PoolConnection;

// ===== 配置 =====

/** 每批處理的用戶數量 */
const BATCH_SIZE = 200;

/** 匿名化密鑰（應從環境變量讀取） */
const ANONYMIZATION_SECRET = process.env.XIAOPEI_ANONYMIZATION_SECRET || 'default-secret-change-me';

// ===== 類型定義 =====

/** Job 執行日誌 */
interface JobLog {
  jobId: string;
  startTime: Date;
  endTime?: Date;
  totalUsers: number;
  successCount: number;
  failureCount: number;
  errors: Array<{
    userId: string;
    errorCode: string;
    errorMessage: string;
  }>;
}

/** 單用戶刪除計數 */
interface DeletionCounts {
  messages: number;
  conversations: number;
  charts: number;
  readings: number;
  settings: number;
  rateLimits: number;
}

// ===== 主函數 =====

/**
 * 執行帳號刪除 Job
 * 
 * 掃描所有 PENDING_DELETE 且 delete_scheduled_at <= NOW() 的用戶
 */
export async function executeAccountDeletionJob(): Promise<JobLog> {
  const jobLog: JobLog = {
    jobId: uuidv4(),
    startTime: new Date(),
    totalUsers: 0,
    successCount: 0,
    failureCount: 0,
    errors: [],
  };
  
  console.log(`[AccountDeletionJob] ========== 開始執行 Job ${jobLog.jobId} ==========`);
  
  const pool = getPool();
  
  try {
    // 1. 掃描待刪除用戶（分批處理）
    const [rows]: any = await pool.execute(
      `SELECT user_id FROM users 
       WHERE status = 'PENDING_DELETE' 
         AND delete_scheduled_at <= UTC_TIMESTAMP()
       LIMIT ?`,
      [BATCH_SIZE]
    );
    
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
      } catch (error: any) {
        jobLog.failureCount++;
        jobLog.errors.push({
          userId,
          errorCode: error.code || 'UNKNOWN_ERROR',
          errorMessage: error.message || '未知錯誤',
        });
        console.error(`[AccountDeletionJob] ❌ 用戶 ${userId} 刪除失敗:`, error.message);
      }
    }
    
  } catch (error: any) {
    console.error(`[AccountDeletionJob] Job 執行失敗:`, error);
    throw error;
  } finally {
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
async function deleteUserData(userId: string): Promise<void> {
  const pool = getPool();
  const connection = await pool.getConnection();
  const startTime = Date.now();
  
  try {
    await connection.beginTransaction();
    
    // 使用 FOR UPDATE 鎖定用戶行，防止並發
    const [userRows]: any = await connection.execute(
      `SELECT user_id, status, delete_scheduled_at, phone, email 
       FROM users 
       WHERE user_id = ? 
       FOR UPDATE`,
      [userId]
    );
    
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
    const counts: DeletionCounts = {
      messages: 0,
      conversations: 0,
      charts: 0,
      readings: 0,
      settings: 0,
      rateLimits: 0,
    };
    
    // ===== 1. 刪除聊天消息 =====
    // 先獲取用戶的所有對話 ID
    const [conversationRows]: any = await connection.execute(
      `SELECT conversation_id FROM conversations WHERE user_id = ?`,
      [userId]
    );
    
    if (conversationRows.length > 0) {
      const conversationIds = conversationRows.map((r: any) => r.conversation_id);
      
      // 刪除消息（分批刪除避免超大事務）
      for (const convId of conversationIds) {
        const [result]: any = await connection.execute(
          `DELETE FROM messages WHERE conversation_id = ?`,
          [convId]
        );
        counts.messages += result.affectedRows;
      }
    }
    
    // ===== 2. 刪除對話 =====
    const [convResult]: any = await connection.execute(
      `DELETE FROM conversations WHERE user_id = ?`,
      [userId]
    );
    counts.conversations = convResult.affectedRows;
    
    // ===== 3. 刪除解讀記錄 =====
    const [readingResult]: any = await connection.execute(
      `DELETE FROM readings WHERE user_id = ?`,
      [userId]
    );
    counts.readings = readingResult.affectedRows;
    
    // ===== 4 & 5. 刪除命盤（bazi_charts 會通過外鍵級聯刪除） =====
    // 先統計 bazi_charts 數量
    const [chartRows]: any = await connection.execute(
      `SELECT COUNT(*) as count FROM bazi_charts bc
       INNER JOIN chart_profiles cp ON bc.chart_profile_id = cp.chart_profile_id
       WHERE cp.user_id = ?`,
      [userId]
    );
    counts.charts = chartRows[0].count;
    
    // 刪除 chart_profiles（級聯刪除 bazi_charts）
    await connection.execute(
      `DELETE FROM chart_profiles WHERE user_id = ?`,
      [userId]
    );
    
    // ===== 6. 刪除用戶設置 =====
    const [settingsResult]: any = await connection.execute(
      `DELETE FROM user_settings WHERE user_id = ?`,
      [userId]
    );
    counts.settings = settingsResult.affectedRows;
    
    // ===== 7. 刪除限流記錄 =====
    const [rateLimitResult]: any = await connection.execute(
      `DELETE FROM rate_limits WHERE user_id = ?`,
      [userId]
    );
    counts.rateLimits = rateLimitResult.affectedRows;
    
    // ===== 8. 匿名化訂閱 =====
    await anonymizeSubscriptions(connection, userId);
    
    // ===== 9. 設置 tombstone =====
    await setUserTombstone(connection, userId, user.phone, user.email);
    
    // ===== 10. 記錄審計日誌 =====
    const duration = Date.now() - startTime;
    await recordAuditLog(connection, userId, 'DELETION_EXECUTED', 'SUCCESS', null, null, counts, duration);
    
    await connection.commit();
    
    console.log(`[AccountDeletionJob] 用戶 ${userId} 數據刪除完成:`, counts);
    
  } catch (error: any) {
    await connection.rollback();
    
    // 記錄失敗的審計日誌（在新事務中）
    try {
      const duration = Date.now() - startTime;
      await recordAuditLogStandalone(userId, 'DELETION_EXECUTED', 'FAILED', error.code, error.message, null, duration);
    } catch (logError) {
      console.error(`[AccountDeletionJob] 審計日誌記錄失敗:`, logError);
    }
    
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * 匿名化用戶的訂閱記錄
 * 
 * 使用 HMAC-SHA256 生成不可逆的匿名化鍵
 */
async function anonymizeSubscriptions(connection: PoolConnection, userId: string): Promise<void> {
  // 生成匿名化鍵
  const anonymizedKey = crypto
    .createHmac('sha256', ANONYMIZATION_SECRET)
    .update(`user:${userId}`)
    .digest('hex');
  
  // 更新訂閱記錄
  await connection.execute(
    `UPDATE subscriptions 
     SET anonymized_user_key = ?,
         user_id = NULL
     WHERE user_id = ?`,
    [anonymizedKey, userId]
  );
  
  console.log(`[AccountDeletionJob] 用戶 ${userId} 訂閱已匿名化`);
}

/**
 * 設置用戶為 tombstone 狀態
 * 
 * - 狀態改為 DELETED
 * - 清除所有 PII
 * - 保留 user_id 和 deleted_at
 */
async function setUserTombstone(
  connection: PoolConnection, 
  userId: string,
  originalPhone?: string,
  originalEmail?: string
): Promise<void> {
  // 生成佔位符（確保唯一性）
  const randomSuffix = crypto.randomBytes(8).toString('hex');
  const phoneReplacement = `deleted_${userId.substring(0, 8)}_${randomSuffix}`;
  const emailReplacement = `deleted_${userId.substring(0, 8)}_${randomSuffix}@deleted.invalid`;
  
  await connection.execute(
    `UPDATE users SET
      status = 'DELETED',
      deleted_at = UTC_TIMESTAMP(),
      delete_requested_at = NULL,
      delete_scheduled_at = NULL,
      -- 清除 PII
      phone = ?,
      email = ?,
      nickname = NULL,
      avatar = NULL,
      password_hash = NULL,
      username = NULL,
      -- 保留 token_version 並增加（確保舊 token 失效）
      token_version = token_version + 1
    WHERE user_id = ?`,
    [
      originalPhone ? phoneReplacement : null,
      originalEmail ? emailReplacement : null,
      userId
    ]
  );
  
  console.log(`[AccountDeletionJob] 用戶 ${userId} 已設置為 tombstone`);
}

/**
 * 記錄審計日誌（在事務內）
 */
async function recordAuditLog(
  connection: PoolConnection,
  userId: string,
  action: 'DELETION_REQUEST' | 'DELETION_CANCEL' | 'DELETION_EXECUTED',
  result: 'SUCCESS' | 'FAILED',
  errorCode: string | null,
  errorMessage: string | null,
  counts: DeletionCounts | null,
  durationMs: number
): Promise<void> {
  await connection.execute(
    `INSERT INTO account_audit_logs (
      log_id, user_id, action, result, error_code, error_message,
      deleted_messages_count, deleted_conversations_count,
      deleted_charts_count, deleted_readings_count,
      duration_ms
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      uuidv4(),
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
    ]
  );
}

/**
 * 記錄審計日誌（獨立事務，用於錯誤情況）
 */
async function recordAuditLogStandalone(
  userId: string,
  action: 'DELETION_REQUEST' | 'DELETION_CANCEL' | 'DELETION_EXECUTED',
  result: 'SUCCESS' | 'FAILED',
  errorCode: string | null,
  errorMessage: string | null,
  counts: DeletionCounts | null,
  durationMs: number
): Promise<void> {
  const pool = getPool();
  await pool.execute(
    `INSERT INTO account_audit_logs (
      log_id, user_id, action, result, error_code, error_message,
      deleted_messages_count, deleted_conversations_count,
      deleted_charts_count, deleted_readings_count,
      duration_ms
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      uuidv4(),
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
    ]
  );
}

// ===== 導出 =====

export {
  deleteUserData,
  anonymizeSubscriptions,
  setUserTombstone,
  BATCH_SIZE,
};

