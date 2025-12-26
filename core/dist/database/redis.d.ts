/**
 * Redis 连接管理
 */
import { RedisClientType } from 'redis';
/**
 * 创建 Redis 连接
 *
 * ✅ 必须配置 XIAOPEI_REDIS_URL 环境变量，否则启动报错
 */
export declare function createRedisConnection(): Promise<RedisClientType>;
/**
 * 获取 Redis 客户端
 *
 * @returns Redis 客户端，如果未初始化则返回 null（用于降级处理）
 */
export declare function getRedisClient(): RedisClientType | null;
/**
 * 关闭 Redis 连接
 */
export declare function closeRedisConnection(): Promise<void>;
//# sourceMappingURL=redis.d.ts.map