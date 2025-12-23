/**
 * 认证相关 API
 * 
 * 包含登录、注册、获取用户信息等接口
 */

import { get, post } from './apiClient';

// ===== 类型定义 =====

export interface LoginOrRegisterParams {
  phone?: string;
  email?: string;
  code: string;
  channel: string;
}

export interface LoginOrRegisterResponse {
  token: string;
  user: {
    userId: string;
    phone?: string;
    email?: string;
    isPro: boolean;
    proExpiresAt?: string;
    proType?: 'monthly' | 'annual' | 'lifetime';
  };
}

export interface GetMeResponse {
  userId: string;
  phone?: string;
  email?: string;
  isPro: boolean;
  proExpiresAt?: string;
  proType?: 'monthly' | 'annual' | 'lifetime';
}

// ===== API 方法 =====

/**
 * 登录或注册
 * POST /api/v1/auth/login_or_register
 */
export const loginOrRegister = async (params: LoginOrRegisterParams): Promise<LoginOrRegisterResponse> => {
  return await post<LoginOrRegisterResponse>('/api/v1/auth/login_or_register', params);
};

/**
 * 获取当前用户信息
 * GET /api/v1/auth/me
 */
export const getMe = async (): Promise<GetMeResponse> => {
  return await get<GetMeResponse>('/api/v1/auth/me');
};

/**
 * 发送验证码
 * POST /api/v1/auth/send_code
 */
export const sendCode = async (params: { phone?: string; email?: string }): Promise<any> => {
  return await post<any>('/api/v1/auth/send_code', params);
};

