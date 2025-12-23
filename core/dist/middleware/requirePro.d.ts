/**
 * Pro 权限中间件
 *
 * 功能：
 * 1. 检查用户是否为 Pro 用户
 * 2. 验证 Pro 是否在有效期内
 * 3. 使用缓存机制减少数据库查询
 *
 * 遵循文档：
 * - app.doc/features/小佩Pro-功能与服务说明文档.md
 * - Phase 4 需求确认（最终版）
 *
 * Pro 状态判断逻辑：
 * - pro_plan = 'lifetime' → 永久 Pro（但需 is_pro = TRUE）
 * - 否则：当前时间 < pro_expires_at 且 is_pro = TRUE
 */
import { Request, Response, NextFunction } from 'express';
/**
 * Pro 权限中间件
 *
 * 必须在用户认证中间件之后使用（即 req.userId 已存在）
 */
export declare function requirePro(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * Pro 状态判断（可复用的工具函数）
 *
 * @param isPro 用户的 is_pro 字段
 * @param proExpiresAt 用户的 pro_expires_at 字段
 * @param proPlan 用户的 pro_plan 字段
 * @returns 是否为有效 Pro 用户
 *
 * 判断逻辑：
 * 1. lifetime 用户：必须 is_pro = TRUE 且 pro_plan = 'lifetime'
 * 2. 非 lifetime 用户：必须 is_pro = TRUE 且当前时间 < pro_expires_at
 */
export declare function checkProStatus(isPro: boolean, proExpiresAt?: Date | null, proPlan?: 'yearly' | 'monthly' | 'quarterly' | 'lifetime' | null): boolean;
/**
 * 清除用户的 Pro 状态缓存（在订阅/取消订阅时调用）
 *
 * @param userId 用户 ID
 */
export declare function clearProStatusCache(userId: string): void;
//# sourceMappingURL=requirePro.d.ts.map