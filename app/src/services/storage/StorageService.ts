/**
 * 本地存储服务
 * 
 * 封装 AsyncStorage，提供类型安全的存储接口
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

class StorageService {
  /**
   * 存储数据
   */
  async set(key: string, value: any): Promise<void> {
    try {
      const stringValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, stringValue);
    } catch (error) {
      console.error(`[Storage] Failed to set ${key}:`, error);
      throw error;
    }
  }

  /**
   * 获取数据
   */
  async get<T = any>(key: string): Promise<T | null> {
    try {
      const stringValue = await AsyncStorage.getItem(key);
      if (stringValue === null) {
        return null;
      }
      return JSON.parse(stringValue) as T;
    } catch (error) {
      console.error(`[Storage] Failed to get ${key}:`, error);
      return null;
    }
  }

  /**
   * 删除数据
   */
  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`[Storage] Failed to remove ${key}:`, error);
      throw error;
    }
  }

  /**
   * 清空所有数据
   */
  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('[Storage] Failed to clear:', error);
      throw error;
    }
  }

  /**
   * 获取所有 keys
   */
  async getAllKeys(): Promise<string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('[Storage] Failed to get all keys:', error);
      return [];
    }
  }
}

export const storage = new StorageService();
export default storage;

