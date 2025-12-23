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
export interface MembershipUserListItemDto {
    userId: string;
    phone?: string;
    createdAt: string;
    isPro: boolean;
    proPlan?: 'monthly' | 'quarterly' | 'yearly' | 'lifetime';
    proExpiresAt?: string;
    aiCallsToday: number;
    aiDailyLimit: number;
}
export interface MembershipUserListDto {
    items: MembershipUserListItemDto[];
    page: number;
    pageSize: number;
    total: number;
}
export interface MembershipUserDetailDto {
    userId: string;
    phone?: string;
    createdAt: string;
    isPro: boolean;
    proPlan?: 'monthly' | 'quarterly' | 'yearly' | 'lifetime';
    proExpiresAt?: string;
    aiCallsToday: number;
    aiCallsDate: string;
    aiDailyLimit: number;
}
export interface GrantMembershipRequestDto {
    plan: 'monthly' | 'quarterly' | 'yearly';
    mode: 'extend' | 'fromNow';
}
export interface GrantMembershipResponseDto {
    isPro: boolean;
    proPlan: string | null;
    proExpiresAt: string | null;
}
export interface RevokeMembershipResponseDto {
    isPro: boolean;
    proPlan: string | null;
    proExpiresAt: string | null;
}
export interface ResetAiTodayResponseDto {
    aiCallsToday: number;
    aiCallsDate: string;
}
/**
 * 獲取會員用戶列表
 *
 * @param page 頁碼（從 1 開始）
 * @param pageSize 每頁數量
 * @param q 搜尋關鍵字（手機或 userId）
 * @param isPro 會員狀態篩選（可選）
 * @returns 用戶列表
 */
export declare function getMembershipUserList(page?: number, pageSize?: number, q?: string, isPro?: boolean): Promise<MembershipUserListDto>;
/**
 * 獲取用戶會員詳情
 *
 * @param userId 用戶 ID
 * @returns 用戶詳情
 */
export declare function getMembershipUserDetail(userId: string): Promise<MembershipUserDetailDto>;
/**
 * Admin 開通 / 延長會員
 *
 * @param userId 用戶 ID
 * @param plan 方案
 * @param mode 模式：extend（從原到期日延長）或 fromNow（從現在起算）
 * @returns 更新後的會員狀態
 */
export declare function grantMembership(userId: string, plan: 'monthly' | 'quarterly' | 'yearly', mode: 'extend' | 'fromNow'): Promise<GrantMembershipResponseDto>;
/**
 * Admin 取消會員
 *
 * @param userId 用戶 ID
 * @returns 更新後的會員狀態
 */
export declare function revokeMembership(userId: string): Promise<RevokeMembershipResponseDto>;
/**
 * Admin 重置今日 AI 次數
 *
 * @param userId 用戶 ID
 * @returns 重置後的 AI 次數狀態
 */
export declare function resetTodayAiCalls(userId: string): Promise<ResetAiTodayResponseDto>;
//# sourceMappingURL=adminMembershipService.d.ts.map