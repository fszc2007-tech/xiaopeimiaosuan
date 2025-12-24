/**
 * 短信限流服务
 * 
 * 使用 Redis + Lua 脚本实现三层限流：
 * - 1 分钟：1 条
 * - 1 小时：5 条
 * - 24 小时：10 条
 */

import { getRedisClient } from '../../database/redis';
import { otpConfig } from '../../config/auth';

/**
 * 限流检查结果
 */
export interface RateLimitResult {
  allowed: boolean;
  errorCode?: 'RATE_LIMITED_1M' | 'RATE_LIMITED_1H' | 'RATE_LIMITED_24H' | 'RATE_LIMITED_IP';
  current?: number;  // 当前计数
  limit?: number;    // 限制数量
  ttl?: number;      // 剩余时间（秒）
  retryAfter?: number; // 重試等待秒數
}

/**
 * Lua 脚本：原子性地检查和增加计数器
 * 
 * KEYS[1]: Redis key
 * ARGV[1]: 限制数量
 * ARGV[2]: TTL（秒）
 * 
 * 返回：{ok, current}
 * - ok: 1 表示通过，0 表示超限
 * - current: 当前计数
 */
const RATE_LIMIT_SCRIPT = `
local key = KEYS[1]
local limit = tonumber(ARGV[1])
local ttl = tonumber(ARGV[2])

local current = redis.call("INCR", key)

if current == 1 then
  redis.call("EXPIRE", key, ttl)
end

if current > limit then
  return {0, current}
end

return {1, current}
`;

/**
 * 检查手机号发送限流（三层）
 * 
 * @param phone E.164 格式手机号
 * @param scene 场景（如 "login"）
 * @returns 限流检查结果
 */
export async function checkPhoneRateLimit(
  phone: string,
  scene: string
): Promise<RateLimitResult> {
  // ✅ 开发环境跳过限流，方便测试
  const isDev = process.env.NODE_ENV !== 'production';
  if (isDev) {
    console.log(`[rateLimitService] 🔧 开发环境：跳过手机号限流检查 (${phone})`);
    return { allowed: true };
  }
  
  const redis = getRedisClient();
  
  // ✅ Redis 不可用时降级处理：允许请求通过（避免短信发送失败）
  if (!redis) {
    console.warn(`[rateLimitService] ⚠️ Redis 未初始化，跳过限流检查 (${phone})`);
    return { allowed: true };
  }
  
  // 1 分钟限流：1 条
  const key1m = `sms:rl:1m:${scene}:${phone}`;
  const result1m = await executeRateLimitScript(redis, key1m, 1, 60);
  
  if (!result1m.allowed) {
    return {
      allowed: false,
      errorCode: 'RATE_LIMITED_1M',
      current: result1m.current,
      limit: 1,
      ttl: 60,
      retryAfter: 60, // 60 秒後重試
    };
  }
  
  // 1 小时限流：5 条
  const key1h = `sms:rl:1h:${scene}:${phone}`;
  const result1h = await executeRateLimitScript(redis, key1h, otpConfig.hourlyLimit || 5, 3600);
  
  if (!result1h.allowed) {
    return {
      allowed: false,
      errorCode: 'RATE_LIMITED_1H',
      current: result1h.current,
      limit: otpConfig.hourlyLimit || 5,
      ttl: 3600,
      retryAfter: 3600, // 1 小時後重試
    };
  }
  
  // 24 小时限流：10 条
  const key24h = `sms:rl:24h:${scene}:${phone}`;
  const result24h = await executeRateLimitScript(redis, key24h, otpConfig.dailyLimit || 10, 86400);
  
  if (!result24h.allowed) {
    return {
      allowed: false,
      errorCode: 'RATE_LIMITED_24H',
      current: result24h.current,
      limit: otpConfig.dailyLimit || 10,
      ttl: 86400,
      retryAfter: 86400, // 24 小時後重試
    };
  }
  
  // 通过所有限流检查
  return {
    allowed: true,
  };
}

/**
 * 检查 IP 发送限流（1 小时：20 条）
 * 
 * @param ip 客户端 IP
 * @returns 限流检查结果
 */
export async function checkIpRateLimit(ip: string): Promise<RateLimitResult> {
  // ✅ 开发环境跳过限流，方便测试
  const isDev = process.env.NODE_ENV !== 'production';
  if (isDev) {
    console.log(`[rateLimitService] 🔧 开发环境：跳过 IP 限流检查 (${ip})`);
    return { allowed: true };
  }
  
  const redis = getRedisClient();
  
  // ✅ Redis 不可用时降级处理：允许请求通过
  if (!redis) {
    console.warn(`[rateLimitService] ⚠️ Redis 未初始化，跳过 IP 限流检查 (${ip})`);
    return { allowed: true };
  }
  
  const key = `sms:rl:ip:1h:${ip}`;
  const limit = 20;  // 可以从配置读取
  const ttl = 3600;
  
  const result = await executeRateLimitScript(redis, key, limit, ttl);
  
  if (!result.allowed) {
    return {
      allowed: false,
      errorCode: 'RATE_LIMITED_IP',
      current: result.current,
      limit,
      ttl,
      retryAfter: ttl, // 1 小時後重試
    };
  }
  
  return {
    allowed: true,
  };
}

/**
 * 执行 Lua 限流脚本
 */
async function executeRateLimitScript(
  redis: any,
  key: string,
  limit: number,
  ttl: number
): Promise<RateLimitResult> {
  try {
    // 使用 redis@4 的 eval 方法
    const result = await redis.eval(RATE_LIMIT_SCRIPT, {
      keys: [key],
      arguments: [limit.toString(), ttl.toString()],
    }) as number[];
    
    const [ok, current] = result;
    
    return {
      allowed: ok === 1,
      current,
    };
    
  } catch (error) {
    console.error('[rateLimitService] Lua script execution failed:', error);
    
    // 发生错误时，默认允许通过（避免因 Redis 故障导致功能不可用）
    // 生产环境可以考虑更严格的策略
    return {
      allowed: true,
    };
  }
}

/**
 * 回滚限流计数器（发送失败时调用）
 * 
 * 注意：根据安全策略，通常不建议回滚，以防止被利用
 * 此函数仅在特殊场景下使用（如系统错误，而非短信服务商错误）
 */
export async function rollbackRateLimit(phone: string, scene: string): Promise<void> {
  const redis = getRedisClient();
  
  const keys = [
    `sms:rl:1m:${scene}:${phone}`,
    `sms:rl:1h:${scene}:${phone}`,
    `sms:rl:24h:${scene}:${phone}`,
  ];
  
  for (const key of keys) {
    try {
      await redis.decr(key);
    } catch (error) {
      console.error(`[rateLimitService] Failed to rollback ${key}:`, error);
    }
  }
  
  console.log(`[rateLimitService] Rate limit rolled back for ${phone}`);
}

/**
 * 获取当前限流状态（用于调试）
 */
export async function getRateLimitStatus(
  phone: string,
  scene: string
): Promise<{ window1m: number; window1h: number; window24h: number }> {
  const redis = getRedisClient();
  
  const key1m = `sms:rl:1m:${scene}:${phone}`;
  const key1h = `sms:rl:1h:${scene}:${phone}`;
  const key24h = `sms:rl:24h:${scene}:${phone}`;
  
  const [count1m, count1h, count24h] = await Promise.all([
    redis.get(key1m).then((v: string | null) => (v ? parseInt(v, 10) : 0)),
    redis.get(key1h).then((v: string | null) => (v ? parseInt(v, 10) : 0)),
    redis.get(key24h).then((v: string | null) => (v ? parseInt(v, 10) : 0)),
  ]);
  
  return {
    window1m: count1m,
    window1h: count1h,
    window24h: count24h,
  };
}

