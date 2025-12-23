/**
 * 限流中间件
 *
 * 功能：
 * - 支持动态开关（通过 Admin 配置）
 * - Pro 用户自动跳过限流
 * - 非 Pro 用户按日限流
 * - 友好的错误提示
 */
import { Request, Response, NextFunction } from 'express';
type ApiType = 'bazi_compute' | 'chat';
/**
 * 创建限流中间件
 */
export declare function createRateLimitMiddleware(apiType: ApiType): (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * 获取用户当前限流状态（工具函数）
 */
export declare function getRateLimitStatus(userId: string, apiType: ApiType): Promise<{
    limit: number;
    used: number;
    remaining: number;
    resetAt: string;
    isPro: boolean;
}>;
export {};
//# sourceMappingURL=rateLimit.d.ts.map