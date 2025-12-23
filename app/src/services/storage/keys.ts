/**
 * 存储 Key 常量
 */

export const STORAGE_KEYS = {
  // 认证相关
  AUTH_TOKEN: '@xiaopei/auth_token',
  USER_INFO: '@xiaopei/user_info',
  APP_REGION: '@xiaopei/app_region', // 'cn' | 'hk'
  
  // 用户偏好
  CURRENT_CHART_ID: '@xiaopei/current_chart_id',
  LANGUAGE: '@xiaopei/language', // 'zh-CN' | 'zh-HK'
  
  // 其他
  FIRST_LAUNCH: '@xiaopei/first_launch',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

