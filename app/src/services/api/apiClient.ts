/**
 * API Client 统一配置
 * 
 * 功能：
 * - 自动添加 Authorization、X-App-Region、X-Request-ID 等 header
 * - 统一错误处理（401 跳登录、403 提示升级 Pro、429 限流等）
 * - 统一响应格式处理
 */

import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ENV } from '@/config/env';
import { generateRequestId } from '@/utils/requestId';

// ===== 响应类型定义 =====
export interface ApiResponse<T> {
  success: true;
  data: T;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

// ===== 认证配置接口 =====
export type AppRegion = 'CN' | 'HK' | null;

export interface ApiAuthConfig {
  getToken: () => string | null;
  getIsAuthenticated: () => boolean;
  getAppRegion: () => AppRegion;
  logout: () => void | Promise<void>;
}

// 内部保存一份全局配置
let authConfig: ApiAuthConfig | null = null;

/**
 * 配置 API Client 的认证能力
 * 必须在应用启动时（任何 API 调用之前）调用一次
 */
export function configureApiAuth(config: ApiAuthConfig) {
  authConfig = config;
  if (__DEV__) {
    console.log('[apiClient] ✅ ApiAuthConfig 已配置');
  }
}

// 内部统一读取，保证没配置时直接 fail-fast
function getAuthConfig(): ApiAuthConfig {
  if (!authConfig) {
    // 开发环境明确报错，避免默默不带 token
    const error = new Error(
      '[apiClient] ApiAuthConfig not configured. Did you forget to call configureApiAuth() in App.tsx?'
    );
    console.error(error);
    throw error;
  }
  return authConfig;
}

// ===== 创建 axios 实例 =====
// API Base URL 从 ENV 读取，支持开发/预览/生产环境切换
const API_BASE_URL = ENV.API_BASE_URL;

// 启动时打印（用于调试）
if (ENV.ENABLE_LOG) {
  console.log('[apiClient] 🌍 环境:', ENV.APP_ENV);
  console.log('[apiClient] 🔗 创建 axios 实例，baseURL:', API_BASE_URL);
}

// ⚠️ P0 诊断：生产环境也强制打印一次（用于排查）
console.warn('[API CLIENT DIAGNOSTIC] 🔗 baseURL:', API_BASE_URL);
console.warn('[API CLIENT DIAGNOSTIC] 🌍 环境:', ENV.APP_ENV);

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: ENV.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ===== 请求拦截器 =====
apiClient.interceptors.request.use(
  (config) => {
    // 1. 自动添加 Authorization（仅在有 token 时）
    const { getToken, getIsAuthenticated, getAppRegion } = getAuthConfig();
    const token = getToken();
    const isAuthenticated = getIsAuthenticated();
    
    if (token) {
      // 有 token：正常添加
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[API Client] ✅ Token 已添加到请求头');
    } else {
      // 没有 token：判断是否应该有
      if (isAuthenticated) {
        // 🔥 已登录但读不到 token = 真正的异常
        console.error('[API Client] ❌ 已登录但未读到 Token！', {
          url: config.url,
          method: config.method,
          isAuthenticated,
        });
      } else {
        // ✅ 未登录阶段的请求（登录、注册、验证码等）= 正常
        console.log('[API Client] 📝 未登录状态请求:', config.url);
      }
    }
    
    // 2. 自动添加 X-App-Region
    const appRegion = getAppRegion();
    if (appRegion) {
      config.headers['X-App-Region'] = appRegion;
    }
    
    // 3. 自动添加 X-Request-ID
    config.headers['X-Request-ID'] = generateRequestId();
    
    // 4. 日志（仅开发环境）
    if (ENV.ENABLE_LOG) {
      const fullUrl = config.baseURL + config.url;
      console.log('[API Request]', config.method?.toUpperCase(), fullUrl, {
        hasToken: !!token,
        hasAuthHeader: !!config.headers.Authorization,
        data: config.data,
      });
    }
    
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// ===== 响应拦截器 =====
apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<any>>) => {
    // 日志（仅开发环境）
    if (ENV.ENABLE_LOG) {
      console.log('[API Response]', response.config.url, response.data);
    }
    
    // 统一处理成功响应
    if (response.data.success) {
      return response;
    }
    
    // 如果 success: false，视为业务错误
    return Promise.reject(response.data.error);
  },
  async (error: AxiosError<ErrorResponse>) => {
    // 详细错误日志
    const errorInfo = {
      message: error.message,
      code: error.code,
      url: error.config?.url || error.response?.config?.url,
      baseURL: error.config?.baseURL || error.response?.config?.baseURL,
      method: error.config?.method || error.response?.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      isNetworkError: !error.response, // 网络错误（无响应）
    };
    
    console.error('[API Response Error]', errorInfo);
    
    // 如果是网络错误，提供更详细的诊断信息
    if (!error.response) {
      const isTimeout = error.code === 'ECONNABORTED' || error.message.includes('timeout');
      const baseURL = error.config?.baseURL || ENV.API_BASE_URL;
      const fullUrl = `${baseURL}${error.config?.url || ''}`;
      
      console.error('[API Network Error] 网络连接失败，请检查：');
      console.error('  1. API Base URL:', baseURL);
      console.error('  2. 请求 URL:', error.config?.url);
      console.error('  3. 完整 URL:', fullUrl);
      console.error('  4. 错误代码:', error.code);
      console.error('  5. 错误消息:', error.message);
      
      // 超时错误的特殊提示
      if (isTimeout) {
        console.error('  ⚠️ 请求超时，可能原因：');
        console.error('     - 后端服务未运行或无法访问');
        console.error('     - 网络连接问题（真机测试时，localhost 无法访问，请设置 EXPO_PUBLIC_API_BASE_URL 为电脑的局域网 IP）');
        console.error('     - 后端处理时间过长（Google Token 验证可能需要更长时间）');
        console.error('  💡 解决方案：');
        if (baseURL.includes('localhost')) {
          console.error('     - 真机测试：在 app/.env.local 中设置 EXPO_PUBLIC_API_BASE_URL=http://<你的电脑IP>:3000');
          console.error('     - 获取电脑 IP：运行 ifconfig | grep "inet " | grep -v 127.0.0.1');
        }
        console.error('     - 检查后端服务：curl http://localhost:3000/health');
      }
    }
    
    // 统一错误处理
    await handleApiError(error);
    
    return Promise.reject(error);
  }
);

// ===== 统一错误处理函数 =====
async function handleApiError(error: AxiosError<ErrorResponse>) {
  const { response } = error;
  
  // 1. 网络错误（无响应）
  if (!response) {
    showToast('网络连接失败，请检查您的网络设置', 'error');
    return;
  }
  
  const { status, data } = response;
  
  // 2. 401 未授权 → 跳转登录
  if (status === 401) {
    const { getIsAuthenticated, logout } = getAuthConfig();
    const isAuthenticated = getIsAuthenticated();
    // ✅ 只有在声称已登录时才需要 logout + toast
    if (isAuthenticated) {
      showToast('登入已過期，請重新登入', 'warning');
      await logout();
    }
    // 未登录状态收到 401 是正常的（例如探测请求），静默处理
    return;
  }
  
  // 3. 403 权限不足 → 提示升级 Pro
  if (status === 403 && data?.error?.code === 'PRO_REQUIRED') {
    showToast('此功能需要升級 Pro 才能使用', 'warning');
    return;
  }
  
  // 4. 429 频率限制 / AI 次数限制
  if (status === 429) {
    // AI 解读次数限制
    if (data?.error?.code === 'AI_DAILY_LIMIT_REACHED') {
      showAiLimitReachedDialog(data.error);
      return;
    }
    
    // 一般频率限制
    if (data?.error?.code === 'RATE_LIMIT_EXCEEDED') {
      const message = data?.error?.message || '操作過於頻繁，請稍後再試';
      showToast(message, 'warning');
      return;
    }
    
    // 其他 429 错误
    const message = data?.error?.message || '操作過於頻繁，請稍後再試';
    showToast(message, 'warning');
    return;
  }
  
  // 5. 422 验证错误
  if (status === 422) {
    const message = data?.error?.message || '輸入數據有誤，請檢查';
    showToast(message, 'error');
    return;
  }
  
  // 6. 500 服务器错误
  if (status >= 500) {
    showToast('伺服器開小差了，請稍後再試', 'error');
    return;
  }
  
  // 7. 其他错误
  const message = data?.error?.message || '請求失敗，請稍後再試';
  showToast(message, 'error');
}

// ===== Toast 显示函数（临时实现）=====
function showToast(message: string, type: 'success' | 'error' | 'warning' | 'info') {
  // TODO: 集成 Toast 组件
  console.log(`[Toast ${type.toUpperCase()}]`, message);
  // Alert.alert(type.toUpperCase(), message);
}

// ===== AI 次数限制对话框 =====
function showAiLimitReachedDialog(error: {
  code: string;
  message: string;
  details?: {
    limit: number;
    used: number;
    remaining: number;
  };
}) {
  // 动态导入 Alert 和 navigation
  import('react-native').then(({ Alert }) => {
    const { limit, used } = error.details || {};
    
    const title = '今日解讀次數已用完';
    const message = `您今日的 AI 解讀次數已達上限（${used || limit || 5} 次）\n\n升級成小佩會員，每天可使用 100 次 AI 解讀與問答。`;
    
    Alert.alert(
      title,
      message,
      [
        {
          text: '稍後再說',
          style: 'cancel',
        },
        {
          text: '去開通會員',
          onPress: () => {
            // 跳转到订阅页面
            navigateToSubscription();
          },
        },
      ]
    );
  });
}

// ===== 跳转到订阅页面 =====
function navigateToSubscription() {
  // 使用全局导航引用
  // 注意：需要在 App.tsx 中设置 navigationRef
  try {
    const { navigationRef } = require('@/navigation/navigationRef');
    const { SCREEN_NAMES } = require('@/constants/routes');
    
    if (navigationRef.current) {
      navigationRef.current.navigate(SCREEN_NAMES.PRO_SUBSCRIPTION as never);
    }
  } catch (error) {
    console.error('[apiClient] 无法跳转到订阅页面:', error);
  }
}

// ===== 导出类型化的请求方法 =====
export async function get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.get<ApiResponse<T>>(url, config);
  return response.data.data;
}

export async function post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.post<ApiResponse<T>>(url, data, config);
  return response.data.data;
}

export async function put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.put<ApiResponse<T>>(url, data, config);
  return response.data.data;
}

export async function del<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.delete<ApiResponse<T>>(url, config);
  return response.data.data;
}

