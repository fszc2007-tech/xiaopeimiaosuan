/**
 * 短信限流服务
 *
 * 使用 Redis + Lua 脚本实现三层限流：
 * - 1 分钟：1 条
 * - 1 小时：5 条
 * - 24 小时：10 条
 */
/**
 * 限流检查结果
 */
export interface RateLimitResult {
    allowed: boolean;
    errorCode?: 'RATE_LIMITED_1M' | 'RATE_LIMITED_1H' | 'RATE_LIMITED_24H' | 'RATE_LIMITED_IP';
    current?: number;
    limit?: number;
    ttl?: number;
    retryAfter?: number;
}
/**
 * 检查手机号发送限流（三层）
 *
 * @param phone E.164 格式手机号
 * @param scene 场景（如 "login"）
 * @returns 限流检查结果
 */
export declare function checkPhoneRateLimit(phone: string, scene: string): Promise<RateLimitResult>;
/**
 * 检查 IP 发送限流（1 小时：20 条）
 *
 * @param ip 客户端 IP
 * @returns 限流检查结果
 */
export declare function checkIpRateLimit(ip: string): Promise<RateLimitResult>;
/**
 * 回滚限流计数器（发送失败时调用）
 *
 * 注意：根据安全策略，通常不建议回滚，以防止被利用
 * 此函数仅在特殊场景下使用（如系统错误，而非短信服务商错误）
 */
export declare function rollbackRateLimit(phone: string, scene: string): Promise<void>;
/**
 * 获取当前限流状态（用于调试）
 */
export declare function getRateLimitStatus(phone: string, scene: string): Promise<{
    window1m: number;
    window1h: number;
    window24h: number;
}>;
//# sourceMappingURL=rateLimitService.d.ts.map