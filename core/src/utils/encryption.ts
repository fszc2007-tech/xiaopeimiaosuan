/**
 * 加密工具
 * 
 * 用于 LLM API Key 的加密存储
 * 
 * 使用 AES-256-GCM 算法
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

/**
 * 获取加密密钥（延迟获取，确保环境变量已加载）
 */
function getEncryptionKey(): string {
  const key = process.env.XIAOPEI_ENCRYPTION_KEY;
  if (!key) {
    throw new Error('[Encryption] XIAOPEI_ENCRYPTION_KEY not configured. Please set the environment variable.');
  }
  return key;
}

/**
 * 派生密钥（从环境变量的密钥字符串派生 32 字节密钥）
 */
function deriveKey(password: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(password, salt, 100000, KEY_LENGTH, 'sha256');
}

/**
 * 加密 API Key
 * 
 * @param apiKey 原始 API Key
 * @returns 加密后的字符串（格式：salt:iv:tag:encrypted）
 */
export function encryptApiKey(apiKey: string): string {
  const ENCRYPTION_KEY = getEncryptionKey();
  
  // 生成随机 salt 和 IV
  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);
  
  // 派生密钥
  const key = deriveKey(ENCRYPTION_KEY, salt);
  
  // 创建加密器
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
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
export function decryptApiKey(encrypted: string): string {
  const ENCRYPTION_KEY = getEncryptionKey();
  
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
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
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
export function generateRandomPassword(length: number = 16): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  const randomBytes = crypto.randomBytes(length);
  
  for (let i = 0; i < length; i++) {
    password += charset[randomBytes[i] % charset.length];
  }
  
  return password;
}
