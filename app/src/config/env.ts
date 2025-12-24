/**
 * 环境配置
 * 
 * 环境变量优先级：
 * - EXPO_PUBLIC_API_BASE_URL: EAS Build 时注入的 API 地址
 * - EXPO_PUBLIC_ENV: 当前环境标识（development/preview/production）
 */

// 当前环境
const APP_ENV = process.env.EXPO_PUBLIC_ENV || 'development';

// API Base URL：生产环境从环境变量读取，开发环境默认 localhost
const getApiBaseUrl = (): string => {
  // 1. 优先使用环境变量（EAS Build 注入）
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL;
  }
  
  // 2. 开发环境默认使用 localhost
  return 'http://localhost:3000';
};

export const ENV = {
  // 当前环境标识
  APP_ENV,
  
  // API 地址
  API_BASE_URL: getApiBaseUrl(),
  API_TIMEOUT: 30000, // 30秒
  
  // 日志开关：开发和预览环境开启，生产环境关闭
  ENABLE_LOG: APP_ENV !== 'production',
  
  // iOS 订阅 Mock 开关（仅开发模式有效）
  MOCK_IOS_SUBSCRIPTION: process.env.EXPO_PUBLIC_MOCK_IOS_SUBSCRIPTION === '1',
};

// 启动时打印环境配置（用于调试）
if (ENV.ENABLE_LOG) {
  console.log('[ENV Config] 🌍 当前环境:', ENV.APP_ENV);
  console.log('[ENV Config] 🔗 API Base URL:', ENV.API_BASE_URL);
  console.log('[ENV Config] 📝 EXPO_PUBLIC_API_BASE_URL:', process.env.EXPO_PUBLIC_API_BASE_URL || '未设置');
  console.log('[ENV Config] 🎭 Mock iOS 订阅:', ENV.MOCK_IOS_SUBSCRIPTION ? '✅ 开启' : '❌ 关闭');
}

// ⚠️ P0 诊断：生产环境也强制打印一次（用于排查）
// 使用 console.warn 确保在 React Native 日志中可见
console.warn('[ENV DIAGNOSTIC] 🔍 API_BASE_URL:', ENV.API_BASE_URL);
console.warn('[ENV DIAGNOSTIC] 🔍 EXPO_PUBLIC_API_BASE_URL:', process.env.EXPO_PUBLIC_API_BASE_URL || '❌ 未设置');
console.warn('[ENV DIAGNOSTIC] 🔍 APP_ENV:', ENV.APP_ENV);

