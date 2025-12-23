"use strict";
/**
 * AI 解讀次數限制服務
 *
 * 功能：
 * 1. 檢查用戶每日 AI 解讀次數限制
 * 2. 跨天自動重置計數
 * 3. 區分會員/非會員、首日/次日邏輯
 *
 * 遵循文檔：會員訂閱與AI解讀次數限制-優化方案.md（精簡技術方案 v1）
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiLimitReachedError = void 0;
exports.isProValid = isProValid;
exports.isFirstDay = isFirstDay;
exports.getDailyLimit = getDailyLimit;
exports.resetAiCallsIfNeeded = resetAiCallsIfNeeded;
exports.checkAndCountAIUsage = checkAndCountAIUsage;
exports.getAIUsageStatus = getAIUsageStatus;
const dayjs_1 = __importDefault(require("dayjs"));
const connection_1 = require("../../database/connection");
// ===== 常量配置 =====
const PRO_DAILY_LIMIT = 100; // 會員每日上限
const FREE_FIRST_DAY_LIMIT = 10; // 非會員首日上限
const FREE_DAILY_LIMIT = 5; // 非會員次日上限
// ===== 錯誤類型 =====
class AiLimitReachedError extends Error {
    constructor(limit) {
        super(`AI_DAILY_LIMIT_REACHED:${limit}`);
        this.name = 'AiLimitReachedError';
        this.limit = limit;
    }
}
exports.AiLimitReachedError = AiLimitReachedError;
// ===== 工具函式 =====
/**
 * 判斷 Pro 是否有效
 */
function isProValid(user) {
    if (!user.is_pro)
        return false;
    if (!user.pro_expires_at)
        return false;
    return (0, dayjs_1.default)(user.pro_expires_at).isAfter((0, dayjs_1.default)());
}
/**
 * 判斷是否註冊首日
 */
function isFirstDay(user) {
    const created = (0, dayjs_1.default)(user.created_at);
    const today = (0, dayjs_1.default)();
    return created.isSame(today, 'day');
}
/**
 * 計算今日上限
 */
function getDailyLimit(user) {
    if (isProValid(user)) {
        return PRO_DAILY_LIMIT;
    }
    if (isFirstDay(user)) {
        return FREE_FIRST_DAY_LIMIT;
    }
    return FREE_DAILY_LIMIT;
}
/**
 * 跨天重置次數
 */
function resetAiCallsIfNeeded(user) {
    const todayStr = (0, dayjs_1.default)().format('YYYY-MM-DD');
    if (user.ai_calls_date !== todayStr) {
        user.ai_calls_date = todayStr;
        user.ai_calls_today = 0;
    }
}
/**
 * 檢查 & 累計 AI 使用次數
 *
 * @param userId 用戶 ID
 * @throws {AiLimitReachedError} 當達到每日上限時拋出
 * @throws {Error} 當用戶不存在時拋出
 */
async function checkAndCountAIUsage(userId) {
    const pool = (0, connection_1.getPool)();
    // 1. 查詢用戶
    const [rows] = await pool.execute(`SELECT user_id, is_pro, pro_expires_at, pro_plan, created_at, 
            ai_calls_today, ai_calls_date 
     FROM users 
     WHERE user_id = ?`, [userId]);
    if (rows.length === 0) {
        throw new Error('USER_NOT_FOUND');
    }
    const user = rows[0];
    // 2. 跨天重置
    resetAiCallsIfNeeded(user);
    // 3. 計算今日上限
    const limit = getDailyLimit(user);
    // 4. 檢查是否超限
    if (user.ai_calls_today >= limit) {
        console.log(`[AiQuota] User ${userId} reached daily limit: ${user.ai_calls_today}/${limit}`);
        throw new AiLimitReachedError(limit);
    }
    // 5. 累計次數 +1
    user.ai_calls_today += 1;
    // 6. 更新資料庫
    await pool.execute(`UPDATE users 
     SET ai_calls_today = ?, ai_calls_date = ?, updated_at = NOW()
     WHERE user_id = ?`, [user.ai_calls_today, user.ai_calls_date, userId]);
    console.log(`[AiQuota] User ${userId} AI usage: ${user.ai_calls_today}/${limit}`);
}
/**
 * 獲取用戶當前 AI 使用狀態（不累計次數）
 *
 * @param userId 用戶 ID
 * @returns AI 使用狀態
 */
async function getAIUsageStatus(userId) {
    const pool = (0, connection_1.getPool)();
    const [rows] = await pool.execute(`SELECT user_id, is_pro, pro_expires_at, pro_plan, created_at, 
            ai_calls_today, ai_calls_date 
     FROM users 
     WHERE user_id = ?`, [userId]);
    if (rows.length === 0) {
        throw new Error('USER_NOT_FOUND');
    }
    const user = rows[0];
    // 跨天重置（但不寫回資料庫，只是計算）
    const todayStr = (0, dayjs_1.default)().format('YYYY-MM-DD');
    const aiCallsToday = user.ai_calls_date === todayStr ? user.ai_calls_today : 0;
    // 計算今日上限
    const aiDailyLimit = getDailyLimit(user);
    return {
        aiCallsToday,
        aiDailyLimit,
        aiRemaining: Math.max(0, aiDailyLimit - aiCallsToday),
    };
}
//# sourceMappingURL=aiQuotaService.js.map