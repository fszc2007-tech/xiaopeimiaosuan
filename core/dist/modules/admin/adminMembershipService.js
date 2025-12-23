"use strict";
/**
 * Admin 會員管理服務
 *
 * 功能：
 * 1. 獲取會員用戶列表（搜尋、篩選、分頁）
 * 2. 獲取用戶會員詳情（含 AI 次數狀態）
 * 3. 手動開通 / 延長會員
 * 4. 取消會員
 * 5. 重置今日 AI 次數
 *
 * 遵循文檔：
 * - Admin會員管理設計方案 v1（與現有系統對齊）
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMembershipUserList = getMembershipUserList;
exports.getMembershipUserDetail = getMembershipUserDetail;
exports.grantMembership = grantMembership;
exports.revokeMembership = revokeMembership;
exports.resetTodayAiCalls = resetTodayAiCalls;
const dayjs_1 = __importDefault(require("dayjs"));
const connection_1 = require("../../database/connection");
const aiQuotaService_1 = require("../ai/aiQuotaService");
// ===== 服務函數 =====
/**
 * 獲取會員用戶列表
 *
 * @param page 頁碼（從 1 開始）
 * @param pageSize 每頁數量
 * @param q 搜尋關鍵字（手機或 userId）
 * @param isPro 會員狀態篩選（可選）
 * @returns 用戶列表
 */
async function getMembershipUserList(page = 1, pageSize = 20, q, isPro) {
    const pool = (0, connection_1.getPool)();
    const safePageSize = Math.max(1, Math.min(Number(pageSize) || 20, 100));
    const offset = Math.max(0, (page - 1) * safePageSize);
    // 構建查詢條件
    let whereClause = '1=1';
    const params = [];
    // 搜尋條件
    if (q) {
        whereClause += ' AND (phone LIKE ? OR user_id LIKE ?)';
        const keywordPattern = `%${q}%`;
        params.push(keywordPattern, keywordPattern);
    }
    // 會員狀態篩選
    if (isPro !== undefined) {
        whereClause += ' AND is_pro = ?';
        params.push(isPro ? 1 : 0);
    }
    // 查詢總數
    const [countRows] = await pool.query(`SELECT COUNT(*) as total FROM users WHERE ${whereClause}`, params);
    const total = countRows[0].total;
    // 查詢列表（只查需要的字段）
    const [rows] = await pool.query(`SELECT user_id, phone, created_at, is_pro, pro_plan, pro_expires_at, 
            ai_calls_today, ai_calls_date 
     FROM users 
     WHERE ${whereClause} 
     ORDER BY created_at DESC 
     LIMIT ${safePageSize} OFFSET ${offset}`, params);
    // 轉換為 DTO
    const items = rows.map((row) => {
        const user = row;
        // 跨天重置檢查（但不寫回 DB，只是計算）
        (0, aiQuotaService_1.resetAiCallsIfNeeded)(user);
        // 計算今日上限
        const aiDailyLimit = (0, aiQuotaService_1.getDailyLimit)(user);
        // 獲取今日次數（如果日期不匹配，則為 0）
        const todayStr = (0, dayjs_1.default)().format('YYYY-MM-DD');
        const aiCallsToday = user.ai_calls_date === todayStr ? user.ai_calls_today : 0;
        return {
            userId: user.user_id,
            phone: user.phone,
            createdAt: user.created_at.toISOString(),
            isPro: user.is_pro,
            proPlan: user.pro_plan || undefined,
            proExpiresAt: user.pro_expires_at ? user.pro_expires_at.toISOString() : undefined,
            aiCallsToday,
            aiDailyLimit,
        };
    });
    return {
        items,
        total,
        page,
        pageSize: safePageSize,
    };
}
/**
 * 獲取用戶會員詳情
 *
 * @param userId 用戶 ID
 * @returns 用戶詳情
 */
async function getMembershipUserDetail(userId) {
    const pool = (0, connection_1.getPool)();
    // 1. 查詢用戶
    const [rows] = await pool.query(`SELECT user_id, phone, created_at, is_pro, pro_plan, pro_expires_at, 
            ai_calls_today, ai_calls_date 
     FROM users 
     WHERE user_id = ?`, [userId]);
    if (rows.length === 0) {
        throw new Error('USER_NOT_FOUND');
    }
    const user = rows[0];
    // 2. 跨天重置（如有變化需寫回 DB）
    const beforeReset = {
        date: user.ai_calls_date,
        today: user.ai_calls_today,
    };
    (0, aiQuotaService_1.resetAiCallsIfNeeded)(user);
    // 如果重置了，更新資料庫
    if (beforeReset.date !== user.ai_calls_date) {
        await pool.execute(`UPDATE users 
       SET ai_calls_today = ?, ai_calls_date = ?, updated_at = NOW()
       WHERE user_id = ?`, [user.ai_calls_today, user.ai_calls_date, userId]);
    }
    // 3. 計算今日上限
    const aiDailyLimit = (0, aiQuotaService_1.getDailyLimit)(user);
    // 4. 獲取今日次數
    const todayStr = (0, dayjs_1.default)().format('YYYY-MM-DD');
    const aiCallsToday = user.ai_calls_date === todayStr ? user.ai_calls_today : 0;
    return {
        userId: user.user_id,
        phone: user.phone,
        createdAt: user.created_at.toISOString(),
        isPro: user.is_pro,
        proPlan: user.pro_plan || undefined,
        proExpiresAt: user.pro_expires_at ? user.pro_expires_at.toISOString() : undefined,
        aiCallsToday,
        aiCallsDate: user.ai_calls_date || todayStr,
        aiDailyLimit,
    };
}
/**
 * Admin 開通 / 延長會員
 *
 * @param userId 用戶 ID
 * @param plan 方案
 * @param mode 模式：extend（從原到期日延長）或 fromNow（從現在起算）
 * @returns 更新後的會員狀態
 */
async function grantMembership(userId, plan, mode) {
    const pool = (0, connection_1.getPool)();
    // 1. 查詢用戶
    const [rows] = await pool.query(`SELECT user_id, is_pro, pro_expires_at, pro_plan 
     FROM users 
     WHERE user_id = ?`, [userId]);
    if (rows.length === 0) {
        throw new Error('USER_NOT_FOUND');
    }
    const user = rows[0];
    const now = (0, dayjs_1.default)();
    // 2. 計算月數
    const months = plan === 'monthly' ? 1 :
        plan === 'quarterly' ? 3 :
            12; // yearly
    // 3. 計算基準時間
    let base = now;
    if (mode === 'extend' && user.pro_expires_at) {
        const expiresAt = (0, dayjs_1.default)(user.pro_expires_at);
        if (expiresAt.isAfter(now)) {
            base = expiresAt;
        }
    }
    // 4. 計算新到期時間
    const newExpiresAt = base.add(months, 'month');
    // 5. 更新資料庫
    await pool.execute(`UPDATE users 
     SET is_pro = true, 
         pro_plan = ?, 
         pro_expires_at = ?, 
         updated_at = NOW()
     WHERE user_id = ?`, [plan, newExpiresAt.toISOString(), userId]);
    return {
        isPro: true,
        proPlan: plan,
        proExpiresAt: newExpiresAt.toISOString(),
    };
}
/**
 * Admin 取消會員
 *
 * @param userId 用戶 ID
 * @returns 更新後的會員狀態
 */
async function revokeMembership(userId) {
    const pool = (0, connection_1.getPool)();
    // 1. 查詢用戶
    const [rows] = await pool.query(`SELECT user_id FROM users WHERE user_id = ?`, [userId]);
    if (rows.length === 0) {
        throw new Error('USER_NOT_FOUND');
    }
    // 2. 更新資料庫
    await pool.execute(`UPDATE users 
     SET is_pro = false, 
         pro_plan = NULL, 
         pro_expires_at = NULL, 
         updated_at = NOW()
     WHERE user_id = ?`, [userId]);
    return {
        isPro: false,
        proPlan: null,
        proExpiresAt: null,
    };
}
/**
 * Admin 重置今日 AI 次數
 *
 * @param userId 用戶 ID
 * @returns 重置後的 AI 次數狀態
 */
async function resetTodayAiCalls(userId) {
    const pool = (0, connection_1.getPool)();
    // 1. 查詢用戶
    const [rows] = await pool.query(`SELECT user_id FROM users WHERE user_id = ?`, [userId]);
    if (rows.length === 0) {
        throw new Error('USER_NOT_FOUND');
    }
    // 2. 重置為今天
    const todayStr = (0, dayjs_1.default)().format('YYYY-MM-DD');
    await pool.execute(`UPDATE users 
     SET ai_calls_today = 0, 
         ai_calls_date = ?, 
         updated_at = NOW()
     WHERE user_id = ?`, [todayStr, userId]);
    return {
        aiCallsToday: 0,
        aiCallsDate: todayStr,
    };
}
//# sourceMappingURL=adminMembershipService.js.map