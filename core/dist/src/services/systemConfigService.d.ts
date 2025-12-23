/**
 * 系统配置服务
 *
 * 功能：
 * - 读取系统配置（带缓存）
 * - 更新系统配置
 * - 配置变更通知
 */
/**
 * 获取系统配置
 */
export declare function getSystemSetting<T = any>(key: string): Promise<T | null>;
/**
 * 更新系统配置
 */
export declare function updateSystemSetting(key: string, value: any, updatedBy?: string): Promise<void>;
/**
 * 检查限流是否启用
 */
export declare function isRateLimitEnabled(apiType: 'bazi_compute' | 'chat'): Promise<boolean>;
/**
 * 检查功能是否需要 Pro
 */
export declare function isProFeatureGated(featureKey: 'shensha' | 'overview' | 'advanced_chat'): Promise<boolean>;
/**
 * 获取限流配置
 */
export declare function getRateLimitConfig(): Promise<{
    baziComputeDailyLimit: number;
    baziComputeDailyLimitPro: number;
    chatDailyLimit: number;
    chatDailyLimitPro: number;
}>;
/**
 * 清除所有配置缓存（Admin 更新配置时调用）
 */
export declare function clearConfigCache(): void;
/**
 * 获取所有系统配置
 */
export declare function getAllSystemSettings(): Promise<Array<{
    key: string;
    value: any;
    description: string;
    updatedAt: string;
    updatedBy: string | null;
}>>;
//# sourceMappingURL=systemConfigService.d.ts.map