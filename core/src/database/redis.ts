/**
 * Redis 连接管理
 */

import { createClient, RedisClientType } from 'redis';

let client: RedisClientType | null = null;

/**
 * 创建 Redis 连接
 * 
 * ✅ 必须配置 XIAOPEI_REDIS_URL 环境变量，否则启动报错
 */
export async function createRedisConnection(): Promise<RedisClientType> {
  if (client) {
    try {
      // 检查连接是否可用
      await client.ping();
      return client;
    } catch (error) {
      // 连接已断开，重新创建
      client = null;
    }
  }

  const redisUrl = process.env.XIAOPEI_REDIS_URL;
  
  // ✅ 必填检查：禁止硬编码预设值
  if (!redisUrl) {
    throw new Error(
      '[Redis] ❌ 环境变量 XIAOPEI_REDIS_URL 未配置！\n' +
      '请在 .env 文件中添加：XIAOPEI_REDIS_URL=redis://localhost:6379'
    );
  }
  
  client = createClient({
    url: redisUrl,
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 10) {
          console.error('[Redis] Max reconnection attempts reached');
          return new Error('Max reconnection attempts reached');
        }
        return Math.min(retries * 100, 3000);
      },
    },
  });

  // 错误处理
  client.on('error', (err) => {
    console.error('[Redis] Client error:', err);
  });

  client.on('connect', () => {
    console.log('[Redis] Connecting...');
  });

  client.on('ready', () => {
    console.log('[Redis] Client ready');
  });

  client.on('reconnecting', () => {
    console.log('[Redis] Reconnecting...');
  });

  // 连接 Redis
  try {
    await client.connect();
    console.log('[Redis] Connection established');
  } catch (error) {
    console.error('[Redis] Failed to connect:', error);
    throw error;
  }

  return client;
}

/**
 * 获取 Redis 客户端
 */
export function getRedisClient(): RedisClientType {
  if (!client) {
    throw new Error('[Redis] Client not initialized. Call createRedisConnection() first.');
  }
  return client;
}

/**
 * 关闭 Redis 连接
 */
export async function closeRedisConnection(): Promise<void> {
  if (client) {
    try {
      await client.quit();
    } catch (error) {
      console.error('[Redis] Error closing connection:', error);
    } finally {
      client = null;
      console.log('[Redis] Connection closed');
    }
  }
}

