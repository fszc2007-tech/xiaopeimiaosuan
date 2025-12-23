/**
 * Axios 实例配置
 */

import axios from 'axios';
import type { AxiosError, AxiosResponse } from 'axios';
import { storage } from '../utils/storage';
import type { ApiResponse } from '../types';

// 创建 Axios 实例
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：自动添加 Token
api.interceptors.request.use(
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

// 响应拦截器：统一处理错误
api.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    // 如果响应格式符合 ApiResponse，直接返回
    if (response.data && typeof response.data.success === 'boolean') {
      return response;
    }
    // 否则包装一下
    return {
      ...response,
      data: {
        success: true,
        data: response.data,
      },
    };
  },
  (error: AxiosError<ApiResponse>) => {
    // 处理 401 未授权
    if (error.response?.status === 401) {
      storage.clear();
      window.location.href = '/login';
    }

    // 处理其他错误
    const errorMessage =
      error.response?.data?.error?.message ||
      error.message ||
      '请求失败';

    return Promise.reject({
      message: errorMessage,
      code: error.response?.data?.error?.code || 'UNKNOWN_ERROR',
      status: error.response?.status,
    });
  }
);

export default api;

