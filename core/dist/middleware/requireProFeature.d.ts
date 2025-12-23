/**
 * Pro 功能门禁中间件
 *
 * 功能：
 * - 检查特定功能是否需要 Pro 权限
 * - 支持通过 Admin 动态配置
 * - 友好的错误提示和升级引导
 */
import { Request, Response, NextFunction } from 'express';
type FeatureKey = 'shensha' | 'overview' | 'advanced_chat';
/**
 * 创建 Pro 功能检查中间件
 */
export declare function requireProFeature(featureKey: FeatureKey): (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * 获取用户可用功能列表（工具函数）
 */
export declare function getUserAvailableFeatures(userId: string): Promise<{
    isPro: boolean;
    availableFeatures: string[];
    lockedFeatures: string[];
}>;
export {};
//# sourceMappingURL=requireProFeature.d.ts.map