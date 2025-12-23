/**
 * 加密工具
 *
 * 用于 LLM API Key 的加密存储
 *
 * 使用 AES-256-GCM 算法
 */
/**
 * 加密 API Key
 *
 * @param apiKey 原始 API Key
 * @returns 加密后的字符串（格式：salt:iv:tag:encrypted）
 */
export declare function encryptApiKey(apiKey: string): string;
/**
 * 解密 API Key
 *
 * @param encrypted 加密后的字符串（格式：salt:iv:tag:encrypted）
 * @returns 原始 API Key
 */
export declare function decryptApiKey(encrypted: string): string;
/**
 * 生成随机密码
 *
 * @param length 密码长度（默认 16）
 * @returns 随机密码
 */
export declare function generateRandomPassword(length?: number): string;
//# sourceMappingURL=encryption.d.ts.map