/**
 * 認證狀態管理（Web 版）
 * 
 * ✅ 與 App 端邏輯完全一致
 * ✅ 使用 Zustand
 * ✅ 使用 localStorage 替代 AsyncStorage
 */

import { create } from 'zustand';
import type { User } from '@/types/user';
import { storage } from '@/utils/storage';

interface AuthState {
  // ===== State =====
  user: User | null;
  token: string | null;
  appRegion: 'CN' | 'HK';
  isAuthenticated: boolean;
  
  // ===== Actions =====
  /**
   * 登錄
   */
  login: (user: User, token: string) => void;
  
  /**
   * 登出
   */
  logout: () => void;
  
  /**
   * 更新用戶信息
   */
  updateUser: (user: Partial<User>) => void;
  
  /**
   * 設置 app_region
   */
  setAppRegion: (region: 'CN' | 'HK') => void;
  
  /**
   * 初始化（從 localStorage 恢復）
   */
  initialize: () => void;
}

const initialState = {
  user: null,
  token: null,
  appRegion: 'CN' as const,
  isAuthenticated: false,
};

export const useAuthStore = create<AuthState>((set, get) => ({
  ...initialState,
  
  login: (user, token) => {
    console.log('[AuthStore] 登錄', { userId: user.userId, hasToken: !!token });
    
    if (!token || token.length === 0) {
      console.error('[AuthStore] Token 為空，登錄失敗');
      return;
    }
    
    // 保存到 localStorage
    storage.saveToken(token);
    storage.saveUser(user);
    
    // 更新狀態
    set({
      user,
      token,
      isAuthenticated: true,
      appRegion: user.appRegion,
    });
    
    console.log('[AuthStore] 登錄成功');
  },
  
  logout: () => {
    console.log('[AuthStore] 登出');
    
    // 清除 localStorage
    storage.clear();
    
    // 重置狀態
    set(initialState);
    
    console.log('[AuthStore] 登出成功');
  },
  
  updateUser: (userUpdate) => {
    const currentUser = get().user;
    if (!currentUser) return;
    
    const updatedUser = { ...currentUser, ...userUpdate };
    storage.saveUser(updatedUser);
    
    set({ user: updatedUser });
  },
  
  setAppRegion: (region) => {
    set({ appRegion: region });
  },
  
  initialize: () => {
    console.log('[AuthStore] 初始化');
    
    const token = storage.getToken();
    const user = storage.getUser();
    
    // ✅ 自动修复：数据完整性检查
    if (token && user) {
      console.log('[AuthStore] 發現已保存的登錄信息');
      set({
        token,
        user,
        isAuthenticated: true,
        appRegion: user.appRegion,
      });
    } else if (token || user) {
      // ⚠️ 数据不一致：只有 token 或只有 user，清理脏数据
      console.warn('[AuthStore] 發現不完整的登錄數據，自動清理');
      storage.clear();
      set(initialState);
    } else {
      console.log('[AuthStore] 未找到登錄信息');
    }
  },
}));

