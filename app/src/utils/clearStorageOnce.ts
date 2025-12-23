/**
 * 清除 AsyncStorage 中损坏的数据（仅执行一次）
 * 
 * 用于修复从字符串类型到布尔类型的迁移问题
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const CLEAR_FLAG_KEY = '@xiaopei/storage_cleared_v1';

/**
 * 清除 AsyncStorage 中的旧数据（仅第一次启动时执行）
 */
export async function clearStorageOnce(): Promise<void> {
  try {
    // 检查是否已经清除过
    const hasCleared = await AsyncStorage.getItem(CLEAR_FLAG_KEY);
    
    if (hasCleared === 'true') {
      console.log('[ClearStorage] 已经清除过，跳过');
      return;
    }
    
    console.log('[ClearStorage] ========================================');
    console.log('[ClearStorage] 开始清除旧的 AsyncStorage 数据...');
    console.log('[ClearStorage] ========================================');
    
    // 获取所有 key
    const allKeys = await AsyncStorage.getAllKeys();
    console.log('[ClearStorage] 找到的所有 keys:', allKeys);
    
    // 只清除 Zustand persist 的数据（包含 auth-storage）
    const keysToRemove = allKeys.filter(key => 
      key.includes('auth-storage') || 
      key.includes('zustand') ||
      key.includes('@xiaopei/auth_token')
    );
    
    if (keysToRemove.length > 0) {
      console.log('[ClearStorage] 准备清除的 keys:', keysToRemove);
      await AsyncStorage.multiRemove(keysToRemove);
      console.log('[ClearStorage] ✅ 已清除损坏的数据');
    } else {
      console.log('[ClearStorage] 没有需要清除的数据');
    }
    
    // 标记已清除
    await AsyncStorage.setItem(CLEAR_FLAG_KEY, 'true');
    console.log('[ClearStorage] ✅ 已标记为已清除');
    console.log('[ClearStorage] ========================================');
    
  } catch (error) {
    console.error('[ClearStorage] ❌ 清除数据失败:', error);
  }
}

/**
 * 强制清除所有数据（仅用于测试/调试）
 */
export async function forceClearAll(): Promise<void> {
  try {
    console.log('[ClearStorage] ⚠️ 强制清除所有 AsyncStorage 数据...');
    await AsyncStorage.clear();
    console.log('[ClearStorage] ✅ 已清除所有数据');
  } catch (error) {
    console.error('[ClearStorage] ❌ 强制清除失败:', error);
  }
}

