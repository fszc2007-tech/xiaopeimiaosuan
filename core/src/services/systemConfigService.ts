/**
 * 系统配置服务
 * 
 * 功能：
 * - 读取系统配置（带缓存）
 * - 更新系统配置
 * - 配置变更通知
 */

import { getPool } from '../database/connection';
import NodeCache from 'node-cache';

// 配置缓存（TTL 5 分钟）
const configCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

/**
 * 获取系统配置
 */
export async function getSystemSetting<T = any>(key: string): Promise<T | null> {
  // 1. 尝试从缓存读取
  const cached = configCache.get<T>(key);
  if (cached !== undefined) {
    return cached;
  }

  // 2. 从数据库读取
  const pool = getPool();
  const [rows]: any = await pool.query(
    'SELECT setting_value FROM system_settings WHERE setting_key = ?',
    [key]
  );

  if (rows.length === 0) {
    return null;
  }

  const value = rows[0].setting_value as T;

  // 3. 写入缓存
  configCache.set(key, value);

  return value;
}

/**
 * 更新系统配置
 */
export async function updateSystemSetting(
  key: string,
  value: any,
  updatedBy?: string
): Promise<void> {
  const pool = getPool();

  await pool.query(
    `INSERT INTO system_settings (setting_key, setting_value, updated_at, updated_by)
     VALUES (?, ?, NOW(), ?)
     ON DUPLICATE KEY UPDATE
       setting_value = VALUES(setting_value),
       updated_at = NOW(),
       updated_by = VALUES(updated_by)`,
    [key, JSON.stringify(value), updatedBy || null]
  );

  // 清除缓存
  configCache.del(key);
}

/**
 * 检查限流是否启用
 */
export async function isRateLimitEnabled(apiType: 'bazi_compute' | 'chat'): Promise<boolean> {
  const config = await getSystemSetting<{ bazi_compute?: boolean; chat?: boolean }>('rate_limit_enabled');
  if (!config) {
    return true; // 默认启用
  }
  return config[apiType] !== false;
}

/**
 * 检查功能是否需要 Pro
 */
export async function isProFeatureGated(
  featureKey: 'shensha' | 'overview' | 'advanced_chat'
): Promise<boolean> {
  const config = await getSystemSetting<Record<string, boolean>>('pro_feature_gate');
  if (!config) {
    return false; // 默认不需要 Pro
  }
  return config[featureKey] === true;
}

/**
 * 获取限流配置
 */
export async function getRateLimitConfig(): Promise<{
  baziComputeDailyLimit: number;
  baziComputeDailyLimitPro: number;
  chatDailyLimit: number;
  chatDailyLimitPro: number;
}> {
  const config = await getSystemSetting<any>('rate_limit_config');
  if (!config) {
    // 返回默认值
    return {
      baziComputeDailyLimit: 5,
      baziComputeDailyLimitPro: 9999,
      chatDailyLimit: 50,
      chatDailyLimitPro: 9999,
    };
  }

  return {
    baziComputeDailyLimit: config.bazi_compute_daily_limit || 5,
    baziComputeDailyLimitPro: config.bazi_compute_daily_limit_pro || 9999,
    chatDailyLimit: config.chat_daily_limit || 50,
    chatDailyLimitPro: config.chat_daily_limit_pro || 9999,
  };
}

/**
 * 清除所有配置缓存（Admin 更新配置时调用）
 */
export function clearConfigCache(): void {
  configCache.flushAll();
}

/**
 * 获取所有系统配置
 */
export async function getAllSystemSettings(): Promise<Array<{
  key: string;
  value: any;
  description: string;
  updatedAt: string;
  updatedBy: string | null;
}>> {
  const pool = getPool();
  const [rows]: any = await pool.query(
    'SELECT setting_key, setting_value, description, updated_at, updated_by FROM system_settings'
  );

  return rows.map((row: any) => ({
    key: row.setting_key,
    value: row.setting_value,
    description: row.description,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by,
  }));
}

