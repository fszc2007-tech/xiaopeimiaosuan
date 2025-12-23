/**
 * 認證相關 API（Web 版）
 * 
 * ✅ 與 App 端接口完全一致
 * ✅ 新增用戶名登錄接口
 */

import { get, post } from './apiClient';
import type {
  LoginResponse,
  LoginRequest,
  RequestOtpRequest,
  RequestOtpResponse,
  RegisterUsernameRequest,
  LoginUsernameRequest,
} from '@/types/user';

export const authService = {
  // ===== 現有接口（與 App 一致） =====

  /**
   * 請求驗證碼
   */
  async requestOtp(params: RequestOtpRequest): Promise<RequestOtpResponse> {
    return post<RequestOtpResponse>('/api/v1/auth/request-otp', params);
  },

  /**
   * 登錄或註冊（手機號）
   */
  async loginOrRegister(params: LoginRequest): Promise<LoginResponse> {
    return post<LoginResponse>('/api/v1/auth/login_or_register', params);
  },

  // ===== 新增接口（H5 專用） =====

  /**
   * 用戶名註冊
   */
  async registerUsername(params: RegisterUsernameRequest): Promise<LoginResponse> {
    return post<LoginResponse>('/api/v1/auth/register_username', params);
  },

  /**
   * 用戶名登錄
   */
  async loginUsername(params: LoginUsernameRequest): Promise<LoginResponse> {
    return post<LoginResponse>('/api/v1/auth/login_username', params);
  },

  /**
   * 獲取當前用戶信息
   */
  async getMe(): Promise<any> {
    return get<any>('/api/v1/auth/me');
  },

  /**
   * 登出
   */
  async logout(): Promise<void> {
    return post<void>('/api/v1/auth/logout');
  },
};


