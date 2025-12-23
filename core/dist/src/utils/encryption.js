"use strict";
/**
 * 加密工具
 *
 * 用于 LLM API Key 的加密存储
 *
 * 使用 AES-256-GCM 算法
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptApiKey = encryptApiKey;
exports.decryptApiKey = decryptApiKey;
exports.generateRandomPassword = generateRandomPassword;
const crypto_1 = __importDefault(require("crypto"));
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;
// 从环境变量获取加密密钥
const ENCRYPTION_KEY = process.env.XIAOPEI_ENCRYPTION_KEY;
if (!ENCRYPTION_KEY) {
    console.warn('[Encryption] XIAOPEI_ENCRYPTION_KEY not set. Encryption will fail.');
}
/**
 * 派生密钥（从环境变量的密钥字符串派生 32 字节密钥）
 */
function deriveKey(password, salt) {
    return crypto_1.default.pbkdf2Sync(password, salt, 100000, KEY_LENGTH, 'sha256');
}
/**
 * 加密 API Key
 *
 * @param apiKey 原始 API Key
 * @returns 加密后的字符串（格式：salt:iv:tag:encrypted）
 */
function encryptApiKey(apiKey) {
    if (!ENCRYPTION_KEY) {
        throw new Error('[Encryption] ENCRYPTION_KEY not configured');
    }
    // 生成随机 salt 和 IV
    const salt = crypto_1.default.randomBytes(SALT_LENGTH);
    const iv = crypto_1.default.randomBytes(IV_LENGTH);
    // 派生密钥
    const key = deriveKey(ENCRYPTION_KEY, salt);
    // 创建加密器
    const cipher = crypto_1.default.createCipheriv(ALGORITHM, key, iv);
    // 加密
    let encrypted = cipher.update(apiKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    // 获取认证标签
    const tag = cipher.getAuthTag();
    // 返回格式：salt:iv:tag:encrypted
    return [
        salt.toString('hex'),
        iv.toString('hex'),
        tag.toString('hex'),
        encrypted,
    ].join(':');
}
/**
 * 解密 API Key
 *
 * @param encrypted 加密后的字符串（格式：salt:iv:tag:encrypted）
 * @returns 原始 API Key
 */
function decryptApiKey(encrypted) {
    if (!ENCRYPTION_KEY) {
        throw new Error('[Encryption] ENCRYPTION_KEY not configured');
    }
    // 解析加密字符串
    const parts = encrypted.split(':');
    if (parts.length !== 4) {
        throw new Error('[Encryption] Invalid encrypted format');
    }
    const salt = Buffer.from(parts[0], 'hex');
    const iv = Buffer.from(parts[1], 'hex');
    const tag = Buffer.from(parts[2], 'hex');
    const encryptedText = parts[3];
    // 派生密钥
    const key = deriveKey(ENCRYPTION_KEY, salt);
    // 创建解密器
    const decipher = crypto_1.default.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    // 解密
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
/**
 * 生成随机密码
 *
 * @param length 密码长度（默认 16）
 * @returns 随机密码
 */
function generateRandomPassword(length = 16) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    const randomBytes = crypto_1.default.randomBytes(length);
    for (let i = 0; i < length; i++) {
        password += charset[randomBytes[i] % charset.length];
    }
    return password;
}
//# sourceMappingURL=encryption.js.map