/**
 * 认证状态管理
 * 
 * 职责：
 * - 用户信息管理
 * - 登录状态管理
 * - Token 管理
 * - app_region（CN/HK）管理
 * 
 * 遵循规范：
 * - Store 命名：useAuthStore
 * - Action 命名：set/update/clear/reset
 * - 持久化：是
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types/user';
import { logger } from '@/utils/logger';
import { tokenStorage } from '@/utils/tokenStorage';

interface AuthState {
  // ===== State =====
  user: User | null;
  token: string | null;
  appRegion: 'CN' | 'HK';
  isAuthenticated: boolean;
  _hasHydrated: boolean; // 标记是否已从 AsyncStorage 恢复数据
  
  // ===== Actions =====
  // 登录
  login: (user: User, token: string) => Promise<void>;
  
  // 登出
  logout: () => Promise<void>;
  
  // 更新用户信息
  updateUser: (user: Partial<User>) => void;
  
  // 设置 app_region
  setAppRegion: (region: 'CN' | 'HK') => void;
  
  // 设置 token
  setToken: (token: string | null) => void;
  
  // 内部方法：设置 hydration 状态
  _setHasHydrated: (hasHydrated: boolean) => void;
  
  // 清空所有数据
  reset: () => void;
  
  // 🔥 强制清除缓存并重置（用于修复类型错误）
  clearStorageAndReset: () => Promise<void>;
}

const initialState = {
  user: null,
  token: null,
  appRegion: 'CN' as const,
  isAuthenticated: false,
  _hasHydrated: false,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => {
      return {
      ...initialState,
      
      login: async (user, token) => {
        logger.auth('开始登录', {
          userId: user.userId,
          phone: user.phone,
          hasToken: !!token,
          tokenLength: token?.length,
        });
        
        if (!token || token.length === 0) {
          logger.error('auth', 'Token 为空，登录失败', { token });
          return;
        }
        
        set({
          user,
          token: token,
          isAuthenticated: true,
          appRegion: user.appRegion,
        });
        
        // 🔥 手动保存 Token 到 AsyncStorage
        try {
          await tokenStorage.save(token);
          logger.auth('✅ Token 已手动保存到 AsyncStorage');
        } catch (error) {
          logger.error('auth', '❌ 手动保存 Token 失败', error);
        }
        
        logger.auth('登录成功，状态已更新', {
          userId: user.userId,
          isAuthenticated: true,
          tokenLength: token.length,
        });
      },
      
      logout: async () => {
        const currentState = useAuthStore.getState();
        logger.auth('开始退出登录', {
          wasAuthenticated: currentState.isAuthenticated,
          hadUser: !!currentState.user,
          hadToken: !!currentState.token,
        });
        
        // 🔥 手动清除 Token
        try {
          await tokenStorage.clear();
          logger.auth('✅ Token 已手动清除');
        } catch (error) {
          logger.error('auth', '❌ 清除 Token 失败', error);
        }
        
        // 规则 4.1：登出时清空 AI 使用状态
        try {
          const { useProStore } = await import('./proStore');
          useProStore.getState().resetAiUsage();
          logger.auth('✅ AI 使用状态已清空');
        } catch (error) {
          logger.error('auth', '❌ 清空 AI 状态失败', error);
        }
        
        set({
          ...initialState,
          _hasHydrated: true, // ✅ 保持 hydrated 状态，避免卡在 Loading
        });
        
        logger.auth('退出登录完成', {
          isAuthenticated: false,
          clearedUser: true,
          clearedToken: true,
        });
      },
      
      updateUser: (userData) => set((state) => ({
        user: state.user ? { ...state.user, ...userData } : null,
      })),
      
      setAppRegion: (region) => set({ appRegion: region }),
      
      setToken: (token) => set({ token }),
      
      _setHasHydrated: (hasHydrated) => set({ _hasHydrated: hasHydrated }),
      
      reset: () => set(initialState),
      
      // 🔥 强制清除 AsyncStorage 并重置 store
      clearStorageAndReset: async () => {
        try {
          logger.auth('🔥 强制清除缓存并重置 store');
          
          // 清除 Token
          await tokenStorage.clear();
          
          // 清除 Zustand 持久化数据
          await AsyncStorage.removeItem('xiaopei-auth-storage');
          
          // 重置 store
          set({
            ...initialState,
            _hasHydrated: true,
          });
          
          logger.auth('✅ 缓存清除完成，store 已重置');
        } catch (error) {
          logger.error('auth', '❌ 清除缓存失败', error);
        }
      },
    };
    },
    {
      name: 'xiaopei-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // 数据恢复完成的回调
      onRehydrateStorage: () => {
        console.log('[authStore] ==================== 开始 Rehydrate ====================');
        console.log('[authStore] 当前时间:', new Date().toISOString());
        return (state, error) => {
          if (error) {
            console.error('[authStore] ❌ 恢复数据失败:', error);
            return;
          }
          
          console.log('[authStore] ✅ 数据恢复完成:', {
            hasUser: !!state?.user,
            userId: state?.user?.userId,
            phone: state?.user?.phone,
            hasToken: !!state?.token,
            tokenLength: state?.token?.length || 0,
            tokenPreview: state?.token ? state.token.substring(0, 50) + '...' : '无',
            isAuthenticated: state?.isAuthenticated,
            isAuthenticatedType: typeof state?.isAuthenticated,
            appRegion: state?.appRegion,
          });
          
          // ✅ 自动修复：如果声称已登录但缺少关键数据，强制登出
          if (state?.isAuthenticated && (!state?.token || !state?.user)) {
            console.error('[authStore] ⚠️ 数据不一致：isAuthenticated=true 但缺少 token/user，自动修复');
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
            console.log('[authStore] ✅ 已自动修复为未登录状态');
          }
          
          // ✅ 反向检查：有 token 但说没登录，也修复一致性
          if (state?.token && state?.user && !state?.isAuthenticated) {
            console.warn('[authStore] ⚠️ 有 token/user 但 isAuthenticated=false，自动修复');
            state.isAuthenticated = true;
            console.log('[authStore] ✅ 已自动修复为已登录状态');
          }
          
          // 🔥 修复无限循环：直接设置内部状态，不触发更新
          if (state) {
            (state as any)._hasHydrated = true;
          }
          console.log('[authStore] ==================== Rehydrate 完成 ====================');
        };
      },
      // 🔥🔥🔥 迁移函数：强制清空所有旧数据（修复类型错误）
      migrate: (persistedState: any, version: number) => {
        console.log('[authStore] migrate v4：强制清空所有旧数据');
        console.log('[authStore] migrate 旧版本:', version);
        console.log('[authStore] migrate 旧数据类型:', persistedState ? typeof persistedState.isAuthenticated : 'null');
        
        // 🔥 无论什么情况，都返回初始状态（彻底清空）
        console.log('[authStore] ✅ 返回初始状态，用户需要重新登录');
        return initialState;
      },
      version: 4, // 🔥 再次提升版本号，强制清空所有旧数据
    }
  )
);

/**
 * 🔥 安全获取 isAuthenticated（非 Hook 版本，用于组件外部）
 * 确保即使在 AsyncStorage 数据损坏时也返回正确的布尔值
 */
export const getIsAuthenticated = (): boolean => {
  const state = useAuthStore.getState();
  const isAuthenticated = state.isAuthenticated;
  
  // 🔥 类型保护：处理字符串类型
  if (typeof isAuthenticated === 'string') {
    return isAuthenticated === 'true' || isAuthenticated === '1';
  }
  
  // 🔥 类型保护：处理数字类型
  if (typeof isAuthenticated === 'number') {
    return isAuthenticated === 1;
  }
  
  // 🔥 严格布尔值检查
  if (typeof isAuthenticated === 'boolean') {
    return isAuthenticated === true;
  }
  
  // 其他类型：返回 false
  return false;
};

/**
 * 检查 store 是否已从 AsyncStorage 恢复数据
 */
export const useHasHydrated = (): boolean => {
  const hasHydrated = useAuthStore((state) => state._hasHydrated);
  // 确保返回布尔值，防止类型错误
  return Boolean(hasHydrated);
};

/**
 * 安全获取 isAuthenticated 的辅助 hook
 * 🔥 确保始终返回严格的布尔值，即使存储中的数据是字符串或其他类型
 */
export const useIsAuthenticated = (): boolean => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  // 🔥 类型保护：处理字符串类型（AsyncStorage 可能返回字符串）
  if (typeof isAuthenticated === 'string') {
    const normalized = isAuthenticated === 'true' || isAuthenticated === '1';
    if (__DEV__) {
      console.warn(
        '[authStore] ⚠️ isAuthenticated 是字符串类型，已转换为布尔值:',
        { original: isAuthenticated, normalized }
      );
    }
    return normalized;
  }
  
  // 🔥 类型保护：处理数字类型
  if (typeof isAuthenticated === 'number') {
    const normalized = isAuthenticated === 1;
    if (__DEV__) {
      console.warn(
        '[authStore] ⚠️ isAuthenticated 是数字类型，已转换为布尔值:',
        { original: isAuthenticated, normalized }
      );
    }
    return normalized;
  }
  
  // 🔥 严格布尔值检查：只有明确的 true 才返回 true
  if (typeof isAuthenticated === 'boolean') {
    return isAuthenticated === true;
  }
  
  // 🔥 其他类型：统一返回 false（安全默认值）
  if (__DEV__ && isAuthenticated != null) {
    console.error(
      '[authStore] ❌ isAuthenticated 类型异常，返回 false:',
      { type: typeof isAuthenticated, value: isAuthenticated }
    );
  }
  
  return false;
};

