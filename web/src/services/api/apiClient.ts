/**
 * API 客戶端（Web 版）
 * 
 * ✅ 與 App 端邏輯完全一致
 * ✅ 自動添加 Token
 * ✅ 統一錯誤處理
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import type { ApiResponse } from '@/types/api';
import { storage } from '@/utils/storage';
import { useAuthStore } from '@/store';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

/**
 * 創建 axios 實例
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 請求攔截器：自動添加 Token
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * 響應攔截器：統一錯誤處理
 */
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Token 過期或無效
    if (error.response?.status === 401) {
      const { isAuthenticated } = useAuthStore.getState();
      // ✅ 只有在声称已登录时才需要清空 + 跳转
      if (isAuthenticated) {
        storage.clear();
        window.location.href = '/login';
      }
      // 未登录状态收到 401 是正常的（例如探测请求），静默处理
    }
    return Promise.reject(error);
  }
);

/**
 * GET 請求
 */
export async function get<T = any>(url: string, params?: any): Promise<T> {
  const response = await apiClient.get<ApiResponse<T>>(url, { params });
  
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'API 錯誤');
  }
  
  return response.data.data as T;
}

/**
 * POST 請求
 */
export async function post<T = any>(url: string, data?: any): Promise<T> {
  const response = await apiClient.post<ApiResponse<T>>(url, data);
  
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'API 錯誤');
  }
  
  return response.data.data as T;
}

/**
 * PUT 請求
 */
export async function put<T = any>(url: string, data?: any): Promise<T> {
  const response = await apiClient.put<ApiResponse<T>>(url, data);
  
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'API 錯誤');
  }
  
  return response.data.data as T;
}

/**
 * DELETE 請求
 */
export async function del<T = any>(url: string): Promise<T> {
  const response = await apiClient.delete<ApiResponse<T>>(url);
  
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'API 錯誤');
  }
  
  return response.data.data as T;
}

export default apiClient;

