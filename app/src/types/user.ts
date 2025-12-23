/**
 * 用户相关类型定义
 * 
 * 注意：与 Core 后端的 UserDto 保持一致
 */

import { UserStatus } from '@/services/api/accountService';

export interface User {
  userId: string;
  phone?: string;
  email?: string;
  appRegion: 'CN' | 'HK';
  nickname: string;
  avatarUrl?: string;
  isPro: boolean;
  proExpiresAt?: string; // ISO 8601
  proPlan?: 'monthly' | 'quarterly' | 'yearly' | 'lifetime';
  inviteCode: string;
  invitedBy?: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  lastLoginAt?: string; // ISO 8601
  status?: UserStatus; // 帳號狀態：ACTIVE | PENDING_DELETE | DELETED
  deleteScheduledAt?: string; // 計劃刪除時間（ISO 8601）
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  phone?: string;
  email?: string;
  otp?: string;
  password?: string;
  appRegion: 'CN' | 'HK';
}

export interface RequestOtpRequest {
  phone?: string;
  email?: string;
  purpose: 'login' | 'reset_password';
}

export interface RequestOtpResponse {
  message: string;
  retryAfter?: number; // 秒数
}

export interface ThirdPartyLoginRequest {
  provider: 'google' | 'apple';
  idToken: string;
  app_region: 'CN' | 'HK';
}

export interface ThirdPartyLoginResponse {
  token: string;
  user: User;  // 使用完整的 User 类型，包含 status 和 deleteScheduledAt
  first_login?: boolean;
  request_id?: string;
}

