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
import type { UserRow } from '../../types/database';
export declare class AiLimitReachedError extends Error {
    limit: number;
    constructor(limit: number);
}
/**
 * 判斷 Pro 是否有效
 */
export declare function isProValid(user: UserRow): boolean;
/**
 * 判斷是否註冊首日
 */
export declare function isFirstDay(user: UserRow): boolean;
/**
 * 計算今日上限
 */
export declare function getDailyLimit(user: UserRow): number;
/**
 * 跨天重置次數
 */
export declare function resetAiCallsIfNeeded(user: UserRow): void;
/**
 * 檢查 & 累計 AI 使用次數
 *
 * @param userId 用戶 ID
 * @throws {AiLimitReachedError} 當達到每日上限時拋出
 * @throws {Error} 當用戶不存在時拋出
 */
export declare function checkAndCountAIUsage(userId: string): Promise<void>;
/**
 * 獲取用戶當前 AI 使用狀態（不累計次數）
 *
 * @param userId 用戶 ID
 * @returns AI 使用狀態
 */
export declare function getAIUsageStatus(userId: string): Promise<{
    aiCallsToday: number;
    aiDailyLimit: number;
    aiRemaining: number;
}>;
//# sourceMappingURL=aiQuotaService.d.ts.map