/**
 * 手机号规范化工具
 * 
 * 使用 libphonenumber-js 将任意格式的手机号转换为 E.164 国际标准格式
 * 例如：
 * - "91234567" + countryCode="+852" → "+85291234567"
 * - "138 0013 8000" + countryCode="+86" → "+8613800138000"
 * - "+852-9123-4567" → "+85291234567"
 */

import { parsePhoneNumber, CountryCode } from 'libphonenumber-js';
import type { Region } from '../../config/sms';

/**
 * 国家代码映射到 libphonenumber-js 的 CountryCode
 */
const countryCodeMap: Record<string, CountryCode> = {
  '+86': 'CN',
  '+852': 'HK',
  '+853': 'MO',
  '+886': 'TW',
  '+65': 'SG',
  '+1': 'US',
  '+44': 'GB',
  '+61': 'AU',
  // 可以继续扩展更多国家
};

/**
 * 手机号规范化结果
 */
export interface NormalizedPhoneResult {
  success: boolean;
  e164Phone?: string;      // E.164 格式手机号（如 "+85291234567"）
  detectedRegion?: Region; // 检测到的地区
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
export function normalizePhone(
  rawPhone: string,
  countryCode: string,
  expectedRegion?: Region
): NormalizedPhoneResult {
  try {
    // 1. 拼接完整手机号
    // 如果用户输入已包含国家代码（如 "+852 9123 4567"），直接使用
    // 否则拼接 countryCode + rawPhone
    const fullPhone = rawPhone.trim().startsWith('+') 
      ? rawPhone 
      : `${countryCode}${rawPhone}`;
    
    // 2. 获取对应的 CountryCode（用于 libphonenumber-js）
    const defaultCountry = countryCodeMap[countryCode];
    
    // 3. 解析手机号
    const phoneNumber = parsePhoneNumber(fullPhone, defaultCountry);
    
    // 4. 验证手机号有效性
    if (!phoneNumber || !phoneNumber.isValid()) {
      return {
        success: false,
        errorCode: 'INVALID_PHONE',
        errorMessage: 'Phone number is not valid',
      };
    }
    
    // 5. 获取 E.164 格式
    const e164Phone = phoneNumber.format('E.164');
    
    // 6. 检测实际地区
    const detectedCountryCode = phoneNumber.countryCallingCode;
    const detectedRegion = getRegionFromDetectedCode(`+${detectedCountryCode}`);
    
    // 7. 验证地区是否匹配（可选）
    if (expectedRegion && detectedRegion !== expectedRegion) {
      // 如果用户选择的地区与检测到的地区不一致
      // 例如：用户选择 "hk"，但输入的是 +86 开头的号码
      console.warn(
        `[phoneNormalizer] Region mismatch: expected=${expectedRegion}, detected=${detectedRegion}, phone=${e164Phone}`
      );
      
      // 严格模式：返回错误（可选，暂时不启用，让后端自动修正）
      // return {
      //   success: false,
      //   errorCode: 'PHONE_REGION_MISMATCH',
      //   errorMessage: `Expected region ${expectedRegion}, but detected ${detectedRegion}`,
      // };
    }
    
    // 8. 返回成功结果
    return {
      success: true,
      e164Phone,
      detectedRegion,
    };
    
  } catch (error) {
    console.error('[phoneNormalizer] Parse failed:', error);
    return {
      success: false,
      errorCode: 'INVALID_PHONE',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * 从检测到的国家代码获取地区类型
 */
function getRegionFromDetectedCode(detectedCode: string): Region {
  const mapping: Record<string, Region> = {
    '+86': 'cn',
    '+852': 'hk',
    '+853': 'mo',
    '+886': 'tw',
  };
  
  return mapping[detectedCode] || 'intl';
}

/**
 * 验证手机号格式（快速验证，不依赖 libphonenumber-js）
 * 用于基础参数校验
 */
export function isValidPhoneFormat(phone: string): boolean {
  // 基础验证：非空，且只包含数字、空格、+、-、() 等字符
  if (!phone || typeof phone !== 'string') {
    return false;
  }
  
  const trimmed = phone.trim();
  if (trimmed.length === 0) {
    return false;
  }
  
  // 允许的字符：数字、+、空格、-、()
  const validPattern = /^[\d\s+\-()]+$/;
  return validPattern.test(trimmed);
}

/**
 * 验证国家代码格式
 */
export function isValidCountryCode(countryCode: string): boolean {
  if (!countryCode || typeof countryCode !== 'string') {
    return false;
  }
  
  // 格式：+ 开头，后跟 1-4 位数字
  const pattern = /^\+\d{1,4}$/;
  return pattern.test(countryCode);
}

