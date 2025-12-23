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
/** 帳號狀態 */
export type UserStatus = 'ACTIVE' | 'PENDING_DELETE' | 'DELETED';
/** 發起註銷響應 */
export interface DeletionRequestResponse {
    status: UserStatus;
    deleteScheduledAt: string;
}
/** 查詢刪除狀態響應 */
export interface DeletionStatusResponse {
    status: UserStatus;
    deleteScheduledAt: string | null;
    serverNow: string;
}
/** 撤銷註銷響應 */
export interface DeletionCancelResponse {
    status: UserStatus;
}
/**
 * 發起註銷申請（進入 7 天寬限期）
 *
 * 行為（冪等）：
 * 1. 若 status=ACTIVE：更新為 PENDING_DELETE，設置計劃刪除時間
 * 2. 若 status=PENDING_DELETE：不重置時間，返回既有 deleteScheduledAt
 *
 * @param userId 用戶 ID
 */
export declare function requestDeletion(userId: string): Promise<DeletionRequestResponse>;
/**
 * 查詢刪除狀態（Blocking page 用）
 *
 * @param userId 用戶 ID
 */
export declare function getDeletionStatus(userId: string): Promise<DeletionStatusResponse>;
/**
 * 撤銷註銷申請
 *
 * 只允許在 PENDING_DELETE 狀態且未過期時撤銷
 * 使用條件更新確保原子性
 *
 * @param userId 用戶 ID
 */
export declare function cancelDeletion(userId: string): Promise<DeletionCancelResponse>;
/**
 * 檢查用戶是否可以訪問受限 API
 *
 * PENDING_DELETE 用戶只能訪問白名單內的 API
 *
 * @param userId 用戶 ID
 */
export declare function getUserStatus(userId: string): Promise<UserStatus>;
/**
 * 驗證 token_version
 *
 * @param userId 用戶 ID
 * @param tokenVersion JWT 中的 token_version
 */
export declare function validateTokenVersion(userId: string, tokenVersion: number): Promise<boolean>;
/**
 * 獲取用戶的 token_version
 *
 * @param userId 用戶 ID
 */
export declare function getTokenVersion(userId: string): Promise<number>;
//# sourceMappingURL=accountService.d.ts.map