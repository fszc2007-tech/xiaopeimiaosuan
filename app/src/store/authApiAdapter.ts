/**
 * API Client 认证适配器
 * 
 * 职责：
 * - 将 useAuthStore 适配为 ApiAuthConfig
 * - 在应用启动时初始化 apiClient 的认证能力
 * 
 * 注意：
 * - 此文件不会被 apiClient 导入，避免循环依赖
 * - 只被 App.tsx 导入一次，用于初始化
 */

import { configureApiAuth } from '@/services/api/apiClient';
import { useAuthStore } from './authStore';

/**
 * 初始化 API Client 的认证配置
 * 
 * 必须在应用启动时（任何 API 调用之前）调用一次
 * 
 * 调用位置：App.tsx 的 useEffect 中，在 initializeAuth() 之后
 */
export function initApiAuth() {
  configureApiAuth({
    getToken: () => {
      return useAuthStore.getState().token;
    },
    
    getIsAuthenticated: () => {
      return useAuthStore.getState().isAuthenticated;
    },
    
    getAppRegion: () => {
      return useAuthStore.getState().appRegion;
    },
    
    logout: async () => {
      // 直接调用 store 的 logout 方法（它已经是 async）
      await useAuthStore.getState().logout();
    },
  });
  
  if (__DEV__) {
    console.log('[authApiAdapter] ✅ API Client 认证配置已初始化');
  }
}


