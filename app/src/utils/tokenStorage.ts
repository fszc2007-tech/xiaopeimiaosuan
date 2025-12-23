/**
 * Token 存储管理
 * 
 * 使用独立的 AsyncStorage 管理，完全绕过 Zustand persist 的潜在问题
 * 
 * 职责：
 * - 保存 Token 到 AsyncStorage
 * - 恢复 Token 从 AsyncStorage
 * - 清除 Token
 * - 详细日志追踪
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ✅ 使用与 client.ts 一致的 key
const TOKEN_STORAGE_KEY = '@xiaopei/auth_token';

export const tokenStorage = {
  /**
   * 保存 Token
   */
  async save(token: string): Promise<void> {
    try {
      console.log('[TokenStorage] 开始保存 Token:', {
        tokenLength: token.length,
        tokenPreview: token.substring(0, 30) + '...',
      });
      
      await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
      
      // 立即验证保存结果
      const saved = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
      if (saved === token) {
        console.log('[TokenStorage] ✅ Token 保存成功并验证通过');
      } else {
        console.error('[TokenStorage] ❌ Token 保存后验证失败！');
      }
    } catch (error) {
      console.error('[TokenStorage] ❌ 保存 Token 失败:', error);
      throw error;
    }
  },

  /**
   * 读取 Token
   */
  async load(): Promise<string | null> {
    try {
      console.log('[TokenStorage] 开始读取 Token...');
      
      const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
      
      if (token) {
        console.log('[TokenStorage] ✅ Token 读取成功:', {
          tokenLength: token.length,
          tokenPreview: token.substring(0, 30) + '...',
        });
      } else {
        console.log('[TokenStorage] ⚠️ Token 不存在');
      }
      
      return token;
    } catch (error) {
      console.error('[TokenStorage] ❌ 读取 Token 失败:', error);
      return null;
    }
  },

  /**
   * 清除 Token
   */
  async clear(): Promise<void> {
    try {
      console.log('[TokenStorage] 开始清除 Token...');
      await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
      console.log('[TokenStorage] ✅ Token 已清除');
    } catch (error) {
      console.error('[TokenStorage] ❌ 清除 Token 失败:', error);
      throw error;
    }
  },

  /**
   * 检查 Token 是否存在
   */
  async exists(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
      return token !== null;
    } catch (error) {
      console.error('[TokenStorage] ❌ 检查 Token 失败:', error);
      return false;
    }
  },
};

