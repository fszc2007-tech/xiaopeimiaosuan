/**
 * 国家/地区代码配置
 * 
 * 用于手机号登录的国家代码选择器
 */

export interface CountryCode {
  code: string;           // 国家代码（如 "+852"）
  name: string;           // 地区名称（繁体中文）
  nameSimplified: string; // 简体中文
  nameEn: string;         // 英文名称
  flag: string;           // 旗帜 emoji
  region: 'cn' | 'hk' | 'mo' | 'tw' | 'intl'; // 地区类型
  placeholder: string;    // 输入框示例（繁体）
  placeholderSimplified: string; // 输入框示例（简体）
  pattern?: string;       // 号码格式正则（可选）
}

/**
 * 支持的国家/地区列表
 * 按优先级排序：香港 > 大陆 > 澳门 > 台湾 > 国际
 */
export const COUNTRY_CODES: CountryCode[] = [
  {
    code: '+852',
    name: '香港',
    nameSimplified: '香港',
    nameEn: 'Hong Kong',
    flag: '🇭🇰',
    region: 'hk',
    placeholder: '9123 4567',
    placeholderSimplified: '9123 4567',
    pattern: '^[5-9]\\d{7}$', // 8位数字，5-9开头
  },
  {
    code: '+86',
    name: '中國大陸',
    nameSimplified: '中国大陆',
    nameEn: 'China',
    flag: '🇨🇳',
    region: 'cn',
    placeholder: '138 0013 8000',
    placeholderSimplified: '138 0013 8000',
    pattern: '^1[3-9]\\d{9}$', // 11位数字，1开头
  },
  {
    code: '+853',
    name: '澳門',
    nameSimplified: '澳门',
    nameEn: 'Macau',
    flag: '🇲🇴',
    region: 'mo',
    placeholder: '6234 5678',
    placeholderSimplified: '6234 5678',
    pattern: '^6\\d{7}$', // 8位数字，6开头
  },
  {
    code: '+886',
    name: '台灣',
    nameSimplified: '台湾',
    nameEn: 'Taiwan',
    flag: '🇹🇼',
    region: 'tw',
    placeholder: '912 345 678',
    placeholderSimplified: '912 345 678',
    pattern: '^9\\d{8}$', // 9位数字，9开头
  },
  {
    code: '+65',
    name: '新加坡',
    nameSimplified: '新加坡',
    nameEn: 'Singapore',
    flag: '🇸🇬',
    region: 'intl',
    placeholder: '9123 4567',
    placeholderSimplified: '9123 4567',
    pattern: '^[89]\\d{7}$', // 8位数字，8或9开头
  },
  {
    code: '+1',
    name: '美國/加拿大',
    nameSimplified: '美国/加拿大',
    nameEn: 'US/Canada',
    flag: '🇺🇸',
    region: 'intl',
    placeholder: '(555) 123-4567',
    placeholderSimplified: '(555) 123-4567',
  },
  {
    code: '+44',
    name: '英國',
    nameSimplified: '英国',
    nameEn: 'UK',
    flag: '🇬🇧',
    region: 'intl',
    placeholder: '7700 900123',
    placeholderSimplified: '7700 900123',
  },
  {
    code: '+61',
    name: '澳洲',
    nameSimplified: '澳洲',
    nameEn: 'Australia',
    flag: '🇦🇺',
    region: 'intl',
    placeholder: '412 345 678',
    placeholderSimplified: '412 345 678',
  },
  {
    code: '+81',
    name: '日本',
    nameSimplified: '日本',
    nameEn: 'Japan',
    flag: '🇯🇵',
    region: 'intl',
    placeholder: '90 1234 5678',
    placeholderSimplified: '90 1234 5678',
  },
  {
    code: '+82',
    name: '韓國',
    nameSimplified: '韩国',
    nameEn: 'South Korea',
    flag: '🇰🇷',
    region: 'intl',
    placeholder: '10 1234 5678',
    placeholderSimplified: '10 1234 5678',
  },
];

/**
 * 默认国家代码（香港）
 */
export const DEFAULT_COUNTRY_CODE = COUNTRY_CODES[0]; // +852 香港

/**
 * 根据代码查找国家/地区信息
 */
export function findCountryCode(code: string): CountryCode | undefined {
  return COUNTRY_CODES.find(c => c.code === code);
}

/**
 * 根据 region 查找国家/地区信息
 */
export function findCountryCodeByRegion(region: 'cn' | 'hk' | 'mo' | 'tw' | 'intl'): CountryCode | undefined {
  return COUNTRY_CODES.find(c => c.region === region);
}

/**
 * 格式化手机号显示（添加空格）
 */
export function formatPhoneNumber(phone: string, countryCode: CountryCode): string {
  // 简单格式化：每4位添加空格
  const cleaned = phone.replace(/\s/g, '');
  
  if (countryCode.code === '+86') {
    // 大陆：138 0013 8000
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1 $2 $3');
  } else if (countryCode.code === '+852' || countryCode.code === '+853') {
    // 香港/澳门：9123 4567
    return cleaned.replace(/(\d{4})(\d{4})/, '$1 $2');
  } else if (countryCode.code === '+886') {
    // 台湾：912 345 678
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
  }
  
  // 其他：保持原样
  return phone;
}

/**
 * 验证手机号格式（基础验证）
 */
export function validatePhoneNumber(phone: string, countryCode: CountryCode): boolean {
  if (!phone || !countryCode.pattern) {
    return phone.length > 0; // 如果没有 pattern，只要非空即可
  }
  
  const cleaned = phone.replace(/\s/g, ''); // 移除空格
  const regex = new RegExp(countryCode.pattern);
  return regex.test(cleaned);
}

