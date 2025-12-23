"use strict";
/**
 * 认证模块配置
 *
 * 原则：
 * 1. 所有策略参数化配置，不写死在业务代码中
 * 2. 配置项应与设计文档对应
 * 3. 修改策略时只需更改此文件，无需改动业务逻辑
 *
 * 参考文档：
 * - app.doc/features/注册登录设计文档.md
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.regionConfig = exports.rateLimitConfig = exports.passwordConfig = exports.jwtConfig = exports.otpConfig = void 0;
exports.validateAuthConfig = validateAuthConfig;
// ===== 验证码策略配置 =====
/**
 * 验证码配置
 *
 * 产品策略来源：
 * - 设计文档：app.doc/features/注册登录设计文档.md
 * - 节：4.2 验证码策略
 */
exports.otpConfig = {
    /**
     * 验证码长度
     *
     * 当前实现：6 位数字
     * 产品策略：推荐 6 位，平衡安全性和用户体验
     */
    length: 6,
    /**
     * 验证码有效期（分钟）
     *
     * 当前实现：10 分钟
     * 产品策略：10 分钟内有效，超时需重新发送
     */
    ttlMinutes: 10,
    /**
     * 发送间隔（秒）
     *
     * 当前实现：60 秒
     * 产品策略：防止频繁发送，60 秒内只能发送一次
     */
    sendIntervalSeconds: 60,
    /**
     * 每小时发送次数限制
     *
     * 当前实现：5 次/小时
     * 产品策略：防止滥用，每个手机号每小时最多 5 次
     */
    hourlyLimit: 5,
    /**
     * 每日发送次数限制
     *
     * 当前实现：10 次/天
     * 产品策略：防止滥用，每个手机号/邮箱每天最多 10 次
     */
    dailyLimit: 10,
    /**
     * 验证码字符集
     *
     * 当前实现：纯数字 0-9
     * 产品策略：纯数字便于用户输入
     */
    charset: '0123456789',
};
// ===== JWT Token 配置 =====
/**
 * JWT Token 配置
 *
 * 产品策略来源：
 * - 安全文档：app.doc/security/前端开发安全规范.md
 */
exports.jwtConfig = {
    /**
     * Token 有效期（天）
     *
     * 当前实现：30 天
     * 产品策略：普通用户 30 天，Pro 用户可能更长
     */
    expiresInDays: 30,
    /**
     * Token 刷新阈值（天）
     *
     * 当前实现：7 天
     * 产品策略：剩余 7 天时自动刷新
     */
    refreshThresholdDays: 7,
};
// ===== 密码策略配置（预留）=====
/**
 * 密码策略配置
 *
 * 注意：当前版本主要使用验证码登录，密码功能预留
 */
exports.passwordConfig = {
    /**
     * 最小长度
     */
    minLength: 8,
    /**
     * 最大长度
     */
    maxLength: 32,
    /**
     * 是否要求包含数字
     */
    requireDigit: true,
    /**
     * 是否要求包含字母
     */
    requireLetter: true,
    /**
     * 是否要求包含特殊字符
     */
    requireSpecialChar: false,
};
// ===== 限流配置 =====
/**
 * API 限流配置
 *
 * 产品策略来源：
 * - 数据库设计：core.doc/数据库与API设计方案.md
 * - 节：V. 已确认的策略 → API 限流
 */
exports.rateLimitConfig = {
    /**
     * 非 Pro 用户每日排盘次数限制
     *
     * 当前实现：5 次/天
     * 产品策略：非付费用户 5 次/天，Pro 用户无限制
     */
    baziComputeDailyLimit: 5,
    /**
     * Pro 用户每日排盘次数限制
     *
     * 当前实现：不限制（9999）
     * 产品策略：Pro 用户不限制
     */
    baziComputeDailyLimitPro: 9999,
};
// ===== 区域配置 =====
/**
 * 应用区域配置
 *
 * 产品策略来源：
 * - 设计文档：app.doc/features/注册登录设计文档.md
 * - 节：2. 版本与语言绑定规则
 */
exports.regionConfig = {
    /**
     * CN 区域配置
     */
    CN: {
        defaultLanguage: 'zh-CN',
        loginMethods: ['phone', 'wechat'],
        requirePhone: true,
        requireEmail: false,
    },
    /**
     * HK 区域配置
     */
    HK: {
        defaultLanguage: 'zh-HK',
        loginMethods: ['email', 'phone'],
        requirePhone: false,
        requireEmail: true,
    },
};
// ===== 配置验证 =====
/**
 * 在应用启动时验证配置
 */
function validateAuthConfig() {
    // 验证 OTP 配置
    if (exports.otpConfig.length < 4 || exports.otpConfig.length > 8) {
        throw new Error('[Auth Config] OTP length must be between 4 and 8');
    }
    if (exports.otpConfig.ttlMinutes < 1 || exports.otpConfig.ttlMinutes > 60) {
        throw new Error('[Auth Config] OTP TTL must be between 1 and 60 minutes');
    }
    if (exports.otpConfig.sendIntervalSeconds < 30 || exports.otpConfig.sendIntervalSeconds > 300) {
        throw new Error('[Auth Config] Send interval must be between 30 and 300 seconds');
    }
    if (exports.otpConfig.dailyLimit < 1 || exports.otpConfig.dailyLimit > 100) {
        throw new Error('[Auth Config] Daily limit must be between 1 and 100');
    }
    console.log('[Auth Config] Validation passed');
}
//# sourceMappingURL=auth.js.map