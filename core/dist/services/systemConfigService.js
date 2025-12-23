"use strict";
/**
 * 系统配置服务
 *
 * 功能：
 * - 读取系统配置（带缓存）
 * - 更新系统配置
 * - 配置变更通知
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSystemSetting = getSystemSetting;
exports.updateSystemSetting = updateSystemSetting;
exports.isRateLimitEnabled = isRateLimitEnabled;
exports.isProFeatureGated = isProFeatureGated;
exports.getRateLimitConfig = getRateLimitConfig;
exports.clearConfigCache = clearConfigCache;
exports.getAllSystemSettings = getAllSystemSettings;
const connection_1 = require("../database/connection");
const node_cache_1 = __importDefault(require("node-cache"));
// 配置缓存（TTL 5 分钟）
const configCache = new node_cache_1.default({ stdTTL: 300, checkperiod: 60 });
/**
 * 获取系统配置
 */
async function getSystemSetting(key) {
    // 1. 尝试从缓存读取
    const cached = configCache.get(key);
    if (cached !== undefined) {
        return cached;
    }
    // 2. 从数据库读取
    const pool = (0, connection_1.getPool)();
    const [rows] = await pool.query('SELECT setting_value FROM system_settings WHERE setting_key = ?', [key]);
    if (rows.length === 0) {
        return null;
    }
    const value = rows[0].setting_value;
    // 3. 写入缓存
    configCache.set(key, value);
    return value;
}
/**
 * 更新系统配置
 */
async function updateSystemSetting(key, value, updatedBy) {
    const pool = (0, connection_1.getPool)();
    await pool.query(`INSERT INTO system_settings (setting_key, setting_value, updated_at, updated_by)
     VALUES (?, ?, NOW(), ?)
     ON DUPLICATE KEY UPDATE
       setting_value = VALUES(setting_value),
       updated_at = NOW(),
       updated_by = VALUES(updated_by)`, [key, JSON.stringify(value), updatedBy || null]);
    // 清除缓存
    configCache.del(key);
}
/**
 * 检查限流是否启用
 */
async function isRateLimitEnabled(apiType) {
    const config = await getSystemSetting('rate_limit_enabled');
    if (!config) {
        return true; // 默认启用
    }
    return config[apiType] !== false;
}
/**
 * 检查功能是否需要 Pro
 */
async function isProFeatureGated(featureKey) {
    const config = await getSystemSetting('pro_feature_gate');
    if (!config) {
        return false; // 默认不需要 Pro
    }
    return config[featureKey] === true;
}
/**
 * 获取限流配置
 */
async function getRateLimitConfig() {
    const config = await getSystemSetting('rate_limit_config');
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
function clearConfigCache() {
    configCache.flushAll();
}
/**
 * 获取所有系统配置
 */
async function getAllSystemSettings() {
    const pool = (0, connection_1.getPool)();
    const [rows] = await pool.query('SELECT setting_key, setting_value, description, updated_at, updated_by FROM system_settings');
    return rows.map((row) => ({
        key: row.setting_key,
        value: row.setting_value,
        description: row.description,
        updatedAt: row.updated_at,
        updatedBy: row.updated_by,
    }));
}
//# sourceMappingURL=systemConfigService.js.map