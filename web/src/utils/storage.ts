/**
 * 本地存儲工具（Web 版）
 * 
 * ✅ 對應 App 端的 AsyncStorage
 * ✅ 使用 localStorage 實現
 */

const STORAGE_PREFIX = 'XIAOPEI_';

export const storage = {
  /**
   * 保存 Token
   */
  saveToken: (token: string): void => {
    localStorage.setItem(`${STORAGE_PREFIX}TOKEN`, token);
  },

  /**
   * 讀取 Token
   */
  getToken: (): string | null => {
    return localStorage.getItem(`${STORAGE_PREFIX}TOKEN`);
  },

  /**
   * 刪除 Token
   */
  removeToken: (): void => {
    localStorage.removeItem(`${STORAGE_PREFIX}TOKEN`);
  },

  /**
   * 保存用戶信息
   */
  saveUser: (user: any): void => {
    localStorage.setItem(`${STORAGE_PREFIX}USER`, JSON.stringify(user));
  },

  /**
   * 讀取用戶信息
   */
  getUser: (): any | null => {
    const userStr = localStorage.getItem(`${STORAGE_PREFIX}USER`);
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * 刪除用戶信息
   */
  removeUser: (): void => {
    localStorage.removeItem(`${STORAGE_PREFIX}USER`);
  },

  /**
   * 清空所有數據
   */
  clear: (): void => {
    localStorage.removeItem(`${STORAGE_PREFIX}TOKEN`);
    localStorage.removeItem(`${STORAGE_PREFIX}USER`);
  },
};


