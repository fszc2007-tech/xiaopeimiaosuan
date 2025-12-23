/**
 * 手机号规范化工具
 *
 * 使用 libphonenumber-js 将任意格式的手机号转换为 E.164 国际标准格式
 * 例如：
 * - "91234567" + countryCode="+852" → "+85291234567"
 * - "138 0013 8000" + countryCode="+86" → "+8613800138000"
 * - "+852-9123-4567" → "+85291234567"
 */
import type { Region } from '../../config/sms';
/**
 * 手机号规范化结果
 */
export interface NormalizedPhoneResult {
    success: boolean;
    e164Phone?: string;
    detectedRegion?: Region;
    errorCode?: 'INVALID_PHONE' | 'PHONE_REGION_MISMATCH';
    errorMessage?: string;
}
/**
 * 规范化手机号
 *
 * @param rawPhone 用户输入的手机号（任意格式）
 * @param countryCode 国家代码（如 "+852"）
 * @param expectedRegion 期望的地区（可选，用于验证）
 * @returns 规范化结果
 */
export declare function normalizePhone(rawPhone: string, countryCode: string, expectedRegion?: Region): NormalizedPhoneResult;
/**
 * 验证手机号格式（快速验证，不依赖 libphonenumber-js）
 * 用于基础参数校验
 */
export declare function isValidPhoneFormat(phone: string): boolean;
/**
 * 验证国家代码格式
 */
export declare function isValidCountryCode(countryCode: string): boolean;
//# sourceMappingURL=phoneNormalizer.d.ts.map