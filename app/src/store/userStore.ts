/**
 * 用户状态管理
 * 
 * 使用 Zustand 管理用户状态
 */

import { create } from 'zustand';
import { User } from '../types';

interface UserState {
  // 状态
  user: User | null;
  isAuthenticated: boolean;
  currentChartId: string | null;
  appRegion: 'cn' | 'hk';
  
  // 操作
  setUser: (user: User) => void;
  clearUser: () => void;
  setCurrentChartId: (chartId: string) => void;
  setAppRegion: (region: 'cn' | 'hk') => void;
  updateProStatus: (isPro: boolean, proExpireAt?: string) => void;
}

export const useUserStore = create<UserState>((set) => ({
  // 初始状态
  user: null,
  isAuthenticated: false,
  currentChartId: null,
  appRegion: 'cn',
  
  // 设置用户信息
  setUser: (user) => set({ 
    user, 
    isAuthenticated: true,
    appRegion: user.appRegion,
  }),
  
  // 清除用户信息（登出）
  clearUser: () => set({ 
    user: null, 
    isAuthenticated: false,
    currentChartId: null,
  }),
  
  // 设置当前命主 ID
  setCurrentChartId: (chartId) => set({ currentChartId: chartId }),
  
  // 设置 App 区域
  setAppRegion: (region) => set({ appRegion: region }),
  
  // 更新 Pro 状态
  updateProStatus: (isPro, proExpireAt) => set((state) => ({
    user: state.user ? { ...state.user, isPro, proExpireAt } : null,
  })),
}));

