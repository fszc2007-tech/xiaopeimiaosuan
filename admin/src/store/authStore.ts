/**
 * 认证状态管理（Zustand）
 */

import { create } from 'zustand';
import { storage } from '../utils/storage';
import type { AdminUser } from '../types';

interface AuthState {
  token: string | null;
  adminUser: AdminUser | null;
  isAuthenticated: boolean;

  // Actions
  setAuth: (token: string, adminUser: AdminUser) => void;
  logout: () => void;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  adminUser: null,
  isAuthenticated: false,

  // 设置认证信息
  setAuth: (token, adminUser) => {
    storage.setToken(token);
    storage.setAdminUser(adminUser);
    set({ token, adminUser, isAuthenticated: true });
  },

  // 退出登录
  logout: () => {
    storage.clear();
    set({ token: null, adminUser: null, isAuthenticated: false });
  },

  // 初始化认证状态（从 LocalStorage 读取）
  initAuth: () => {
    const token = storage.getToken();
    const adminUser = storage.getAdminUser();

    if (token && adminUser) {
      set({ token, adminUser, isAuthenticated: true });
    } else {
      set({ token: null, adminUser: null, isAuthenticated: false });
    }
  },
}));

