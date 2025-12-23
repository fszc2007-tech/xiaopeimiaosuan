/**
 * 认证初始化
 * 
 * 在 App 启动时恢复 Token 和用户信息
 * 
 * 逻辑与 Web 端保持一致：
 * 1. 同时检查 token 和 user 的完整性
 * 2. 如果只有 token 或只有 user，清理脏数据
 * 3. 只有两者都存在时才恢复登录状态
 */

import { tokenStorage } from './tokenStorage';
import { useAuthStore } from '@/store';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * 初始化认证状态
 * 在 App 启动时调用，恢复保存的 Token 和用户信息
 */
export async function initializeAuth(): Promise<void> {
  console.log('[InitializeAuth] ==================== 开始初始化认证 ====================');
  
  try {
    // 1. 从 AsyncStorage 恢复 Token
    const token = await tokenStorage.load();
    
    // 2. 从 Zustand persist 恢复用户信息（通过 authStore 的 persist 机制）
    // 注意：Zustand persist 会在 store 初始化时自动恢复，这里我们只需要等待
    // 但为了确保数据一致性，我们手动检查一下
    const persistedState = await AsyncStorage.getItem('xiaopei-auth-storage');
    let user = null;
    
    if (persistedState) {
      try {
        const parsed = JSON.parse(persistedState);
        user = parsed.state?.user || null;
      } catch (e) {
        console.warn('[InitializeAuth] 解析持久化状态失败:', e);
      }
    }
    
    // 3. 数据完整性检查（与 Web 端逻辑一致）
    if (token && user) {
      console.log('[InitializeAuth] ✅ 发现完整的登录信息，恢复登录状态', {
        hasToken: !!token,
        hasUser: !!user,
        userId: user?.userId,
      });
      
      // 更新 authStore（确保状态一致）
      useAuthStore.setState({
        token,
        user,
        isAuthenticated: true,
        appRegion: user.appRegion || 'CN',
        _hasHydrated: true,
      });
      
      console.log('[InitializeAuth] ✅ 登录状态已恢复');
    } else if (token || user) {
      // ⚠️ 数据不一致：只有 token 或只有 user，清理脏数据
      console.warn('[InitializeAuth] ⚠️ 发现不完整的登录数据，自动清理', {
        hasToken: !!token,
        hasUser: !!user,
      });
      
      // 清除不完整的数据
      if (token) {
        await tokenStorage.clear();
      }
      if (user) {
        await AsyncStorage.removeItem('xiaopei-auth-storage');
      }
      
      // 确保状态为未登录
      useAuthStore.setState({
        token: null,
        isAuthenticated: false,
        user: null,
        _hasHydrated: true,
      });
      
      console.log('[InitializeAuth] ✅ 脏数据已清理，状态已重置为未登录');
    } else {
      console.log('[InitializeAuth] ⚠️ 未找到保存的登录信息，用户需要登录');
      
      // 确保状态为未登录
      useAuthStore.setState({
        token: null,
        isAuthenticated: false,
        user: null,
        _hasHydrated: true,
      });
    }
  } catch (error) {
    console.error('[InitializeAuth] ❌ 初始化认证失败:', error);
    
    // 出错时清空状态
    useAuthStore.setState({
      token: null,
      isAuthenticated: false,
      user: null,
      _hasHydrated: true,
    });
  }
  
  console.log('[InitializeAuth] ==================== 认证初始化完成 ====================');
}

