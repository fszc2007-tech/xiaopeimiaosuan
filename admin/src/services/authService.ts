/**
 * 认证 API 服务
 */

import api from './api';
import type { ApiResponse, LoginRequest, LoginResponse } from '../types';

/**
 * Admin 登录
 */
export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await api.post<ApiResponse<LoginResponse>>(
    '/api/admin/v1/auth/login',
    data
  );
  return response.data.data!;
}

/**
 * 检查 Token 有效性（可选）
 */
export async function verifyToken(): Promise<boolean> {
  try {
    await api.get('/api/admin/v1/auth/verify');
    return true;
  } catch {
    return false;
  }
}

