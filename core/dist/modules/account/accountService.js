"use strict";
/**
 * 帳號管理服務
 *
 * 功能：
 * - 發起註銷申請（進入 7 天寬限期）
 * - 查詢刪除狀態
 * - 撤銷註銷申請
 *
 * 參考文檔：app.doc/features/註銷賬號功能設計方案.md v1.1
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestDeletion = requestDeletion;
exports.getDeletionStatus = getDeletionStatus;
exports.cancelDeletion = cancelDeletion;
exports.getUserStatus = getUserStatus;
exports.validateTokenVersion = validateTokenVersion;
exports.getTokenVersion = getTokenVersion;
const connection_1 = require("../../database/connection");
const ApiError_1 = require("../../utils/ApiError");
// ===== 服務函數 =====
/**
 * 發起註銷申請（進入 7 天寬限期）
 *
 * 行為（冪等）：
 * 1. 若 status=ACTIVE：更新為 PENDING_DELETE，設置計劃刪除時間
 * 2. 若 status=PENDING_DELETE：不重置時間，返回既有 deleteScheduledAt
 *
 * @param userId 用戶 ID
 */
async function requestDeletion(userId) {
    const pool = (0, connection_1.getPool)();
    // 1. 查詢當前用戶狀態
    const [rows] = await pool.execute(`SELECT user_id, status, delete_scheduled_at FROM users WHERE user_id = ?`, [userId]);
    if (rows.length === 0) {
        throw ApiError_1.ApiError.notFound('用戶不存在', 'USER_NOT_FOUND');
    }
    const user = rows[0];
    // 2. 根據當前狀態處理
    if (user.status === 'DELETED') {
        throw ApiError_1.ApiError.badRequest('帳號已刪除', 'ACCOUNT_ALREADY_DELETED');
    }
    if (user.status === 'PENDING_DELETE') {
        // 冪等：已在寬限期，返回現有的計劃刪除時間
        return {
            status: 'PENDING_DELETE',
            deleteScheduledAt: formatISODate(user.delete_scheduled_at),
        };
    }
    // 3. 狀態為 ACTIVE，發起註銷
    // 使用 UTC_TIMESTAMP() 確保時區一致性
    const [result] = await pool.execute(`UPDATE users SET 
      status = 'PENDING_DELETE',
      delete_requested_at = UTC_TIMESTAMP(),
      delete_scheduled_at = DATE_ADD(UTC_TIMESTAMP(), INTERVAL 7 DAY),
      token_version = token_version + 1
    WHERE user_id = ? AND status = 'ACTIVE'`, [userId]);
    if (result.affectedRows === 0) {
        // 並發情況：狀態已被其他請求改變
        throw ApiError_1.ApiError.conflict('狀態已改變，請重試', 'STATE_CHANGED');
    }
    // 4. 查詢更新後的計劃刪除時間
    const [updatedRows] = await pool.execute(`SELECT delete_scheduled_at FROM users WHERE user_id = ?`, [userId]);
    const deleteScheduledAt = updatedRows[0].delete_scheduled_at;
    console.log(`[Account] ✅ 用戶 ${userId} 已發起註銷，計劃刪除時間: ${deleteScheduledAt}`);
    // TODO: 記錄審計日誌 DELETION_REQUEST
    return {
        status: 'PENDING_DELETE',
        deleteScheduledAt: formatISODate(deleteScheduledAt),
    };
}
/**
 * 查詢刪除狀態（Blocking page 用）
 *
 * @param userId 用戶 ID
 */
async function getDeletionStatus(userId) {
    const pool = (0, connection_1.getPool)();
    const [rows] = await pool.execute(`SELECT status, delete_scheduled_at FROM users WHERE user_id = ?`, [userId]);
    if (rows.length === 0) {
        throw ApiError_1.ApiError.notFound('用戶不存在', 'USER_NOT_FOUND');
    }
    const user = rows[0];
    return {
        status: user.status,
        deleteScheduledAt: user.delete_scheduled_at
            ? formatISODate(user.delete_scheduled_at)
            : null,
        serverNow: new Date().toISOString(),
    };
}
/**
 * 撤銷註銷申請
 *
 * 只允許在 PENDING_DELETE 狀態且未過期時撤銷
 * 使用條件更新確保原子性
 *
 * @param userId 用戶 ID
 */
async function cancelDeletion(userId) {
    const pool = (0, connection_1.getPool)();
    // 1. 使用條件更新確保原子性
    // 只有滿足條件（PENDING_DELETE 且未過期）才會更新
    const [result] = await pool.execute(`UPDATE users SET 
      status = 'ACTIVE',
      delete_requested_at = NULL,
      delete_scheduled_at = NULL,
      token_version = token_version + 1
    WHERE 
      user_id = ? 
      AND status = 'PENDING_DELETE' 
      AND delete_scheduled_at > UTC_TIMESTAMP()`, [userId]);
    if (result.affectedRows === 0) {
        // 撤銷失敗，需要判斷原因
        const [rows] = await pool.execute(`SELECT status, delete_scheduled_at FROM users WHERE user_id = ?`, [userId]);
        if (rows.length === 0) {
            throw ApiError_1.ApiError.notFound('用戶不存在', 'USER_NOT_FOUND');
        }
        const user = rows[0];
        if (user.status === 'ACTIVE') {
            // 用戶已經是 ACTIVE，不需要撤銷
            throw ApiError_1.ApiError.conflict('帳號狀態正常，無需撤銷', 'CANNOT_CANCEL_DELETION_INVALID_STATE');
        }
        if (user.status === 'DELETED') {
            throw ApiError_1.ApiError.conflict('帳號已刪除，無法撤銷', 'CANNOT_CANCEL_DELETION_INVALID_STATE');
        }
        if (user.status === 'PENDING_DELETE') {
            // 狀態是 PENDING_DELETE 但更新失敗，說明已過期
            throw ApiError_1.ApiError.conflict('已超過可撤銷期限', 'CANNOT_CANCEL_DELETION_EXPIRED');
        }
        // 其他情況
        throw ApiError_1.ApiError.conflict('無法撤銷註銷', 'CANNOT_CANCEL_DELETION_INVALID_STATE');
    }
    console.log(`[Account] ✅ 用戶 ${userId} 已撤銷註銷`);
    // TODO: 記錄審計日誌 DELETION_CANCEL
    return {
        status: 'ACTIVE',
    };
}
/**
 * 檢查用戶是否可以訪問受限 API
 *
 * PENDING_DELETE 用戶只能訪問白名單內的 API
 *
 * @param userId 用戶 ID
 */
async function getUserStatus(userId) {
    const pool = (0, connection_1.getPool)();
    const [rows] = await pool.execute(`SELECT status FROM users WHERE user_id = ?`, [userId]);
    if (rows.length === 0) {
        throw ApiError_1.ApiError.notFound('用戶不存在', 'USER_NOT_FOUND');
    }
    return rows[0].status;
}
/**
 * 驗證 token_version
 *
 * @param userId 用戶 ID
 * @param tokenVersion JWT 中的 token_version
 */
async function validateTokenVersion(userId, tokenVersion) {
    const pool = (0, connection_1.getPool)();
    const [rows] = await pool.execute(`SELECT token_version FROM users WHERE user_id = ?`, [userId]);
    if (rows.length === 0) {
        return false;
    }
    return rows[0].token_version === tokenVersion;
}
/**
 * 獲取用戶的 token_version
 *
 * @param userId 用戶 ID
 */
async function getTokenVersion(userId) {
    const pool = (0, connection_1.getPool)();
    const [rows] = await pool.execute(`SELECT token_version FROM users WHERE user_id = ?`, [userId]);
    if (rows.length === 0) {
        throw ApiError_1.ApiError.notFound('用戶不存在', 'USER_NOT_FOUND');
    }
    return rows[0].token_version;
}
// ===== 輔助函數 =====
/**
 * 格式化日期為 ISO 8601 格式（UTC）
 */
function formatISODate(date) {
    if (!date)
        return '';
    const d = date instanceof Date ? date : new Date(date);
    return d.toISOString();
}
//# sourceMappingURL=accountService.js.map