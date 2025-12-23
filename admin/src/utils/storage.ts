/**
 * LocalStorage 封装
 */

const TOKEN_KEY = 'admin_token';
const ADMIN_USER_KEY = 'admin_user';

export const storage = {
  // Token 操作
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  },

  // Admin 用户信息
  getAdminUser(): any {
    const user = localStorage.getItem(ADMIN_USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  setAdminUser(user: any): void {
    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
  },

  removeAdminUser(): void {
    localStorage.removeItem(ADMIN_USER_KEY);
  },

  // 清空所有
  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
  },
};

