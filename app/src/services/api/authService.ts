/**
 * 认证相关 API
 */

import { get, post } from './apiClient';
import { 
  LoginResponse, 
  LoginRequest, 
  RequestOtpRequest, 
  RequestOtpResponse,
  ThirdPartyLoginRequest,
  ThirdPartyLoginResponse
} from '@/types';

export const authService = {
  /**
   * 登录或注册
   */
  async loginOrRegister(params: LoginRequest): Promise<LoginResponse> {
    return post<LoginResponse>('/api/v1/auth/login_or_register', params);
  },

  /**
   * 请求验证码
   */
  async requestOtp(params: RequestOtpRequest): Promise<RequestOtpResponse> {
    // 添加 region 参数
    const requestParams = {
      ...params,
      region: params.region || 'cn', // 默认使用 cn
    };
    
    // ⚠️ P0 诊断：打印请求参数（用于排查）
    console.warn('[SMS REQUEST DIAGNOSTIC] 📱 请求参数:', JSON.stringify(requestParams));
    console.warn('[SMS REQUEST DIAGNOSTIC] 🔗 API Base URL:', process.env.EXPO_PUBLIC_API_BASE_URL || '❌ 未设置');
    
    return post<RequestOtpResponse>('/api/v1/auth/request-otp', requestParams);
  },

  /**
   * 第三方登录（Google / Apple）
   */
  async thirdPartyLogin(params: ThirdPartyLoginRequest): Promise<ThirdPartyLoginResponse> {
    return post<ThirdPartyLoginResponse>('/api/v1/auth/third_party_login', params);
  },

  /**
   * 刷新 Token
   */
  async refreshToken(refreshToken: string): Promise<{ token: string }> {
    return post<{ token: string }>('/api/v1/auth/refresh', { refreshToken });
  },
};

