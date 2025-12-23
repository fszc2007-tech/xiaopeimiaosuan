/**
 * 🔥 紧急修复工具：清除认证缓存
 * 
 * 用途：修复 isAuthenticated 类型错误（string -> boolean）
 * 
 * 使用方法：
 * 1. 在 App.tsx 中导入并调用一次
 * 2. 或在开发者菜单中手动触发
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { tokenStorage } from './tokenStorage';

export async function clearAuthCache(): Promise<void> {
  try {
    console.log('🔥 [clearAuthCache] 开始清除认证缓存...');
    
    // 1. 清除 Token
    await tokenStorage.clear();
    console.log('✅ [clearAuthCache] Token 已清除');
    
    // 2. 清除 Zustand 持久化数据
    await AsyncStorage.removeItem('xiaopei-auth-storage');
    console.log('✅ [clearAuthCache] Zustand store 已清除');
    
    // 3. 可选：清除所有 AsyncStorage（谨慎使用）
    // await AsyncStorage.clear();
    
    console.log('✅ [clearAuthCache] 认证缓存清除完成！');
    console.log('💡 [clearAuthCache] 请完全关闭并重启应用');
    
    return;
  } catch (error) {
    console.error('❌ [clearAuthCache] 清除缓存失败:', error);
    throw error;
  }
}

/**
 * 检查是否需要清除缓存
 */
export async function checkAndClearIfNeeded(): Promise<boolean> {
  try {
    const authData = await AsyncStorage.getItem('xiaopei-auth-storage');
    
    if (!authData) {
      console.log('✅ [checkAndClearIfNeeded] 无缓存数据');
      return false;
    }
    
    const parsed = JSON.parse(authData);
    const isAuthenticated = parsed?.state?.isAuthenticated;
    
    // 检测类型错误
    if (typeof isAuthenticated === 'string') {
      console.error('🚨 [checkAndClearIfNeeded] 检测到类型错误：isAuthenticated 是字符串');
      console.log('🔥 [checkAndClearIfNeeded] 自动清除缓存...');
      await clearAuthCache();
      return true;
    }
    
    console.log('✅ [checkAndClearIfNeeded] 缓存数据类型正常');
    return false;
  } catch (error) {
    console.error('❌ [checkAndClearIfNeeded] 检查失败:', error);
    return false;
  }
}

