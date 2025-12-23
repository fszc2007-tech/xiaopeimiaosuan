/**
 * Pro 订阅服务
 *
 * 功能：
 * 1. 模拟订阅（无真实支付）
 * 2. 订阅状态同步（users + subscriptions）
 * 3. 到期时间计算
 * 4. 查询 Pro 状态
 *
 * 遵循文档：
 * - app.doc/features/小佩Pro-订阅页面设计文档.md
 * - app.doc/features/小佩Pro-功能与服务说明文档.md
 * - Phase 4 需求确认（最终版）
 */
import type { SubscribeResponseDto, ProStatusDto } from '../../types/dto';
/**
 * 订阅 Pro（模拟接口）
 *
 * @param userId 用户 ID
 * @param plan 订阅方案
 * @returns 订阅信息
 */
export declare function subscribe(userId: string, plan: 'yearly' | 'monthly' | 'quarterly' | 'lifetime'): Promise<SubscribeResponseDto>;
/**
 * 获取用户的 Pro 状态
 *
 * @param userId 用户 ID
 * @returns Pro 状态
 */
export declare function getProStatus(userId: string): Promise<ProStatusDto>;
/**
 * 获取用户的订阅历史
 *
 * @param userId 用户 ID
 * @returns 订阅记录列表
 */
export declare function getSubscriptionHistory(userId: string): Promise<import("../../types/dto").SubscriptionDto[]>;
/**
 * Admin 手动设置用户 Pro 状态
 *
 * @param userId 用户 ID
 * @param plan 订阅方案
 * @param duration 持续天数（仅 yearly/monthly 需要，lifetime 忽略）
 */
export declare function adminSetProStatus(userId: string, plan: 'yearly' | 'monthly' | 'quarterly' | 'lifetime', duration?: number): Promise<SubscribeResponseDto>;
//# sourceMappingURL=proService.d.ts.map