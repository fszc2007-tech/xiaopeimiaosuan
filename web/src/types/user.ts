/**
 * 用戶相關類型定義
 * 
 * ✅ 與 App 端保持完全一致
 * ✅ 與 Core 後端的 UserDto 保持一致
 */

export interface User {
  userId: string;
  phone?: string;
  email?: string;
  username?: string;           // H5 用戶名登錄（新增）
  appRegion: 'CN' | 'HK';
  nickname: string;
  avatarUrl?: string;
  isPro: boolean;
  proExpiresAt?: string; // ISO 8601
  proPlan?: 'yearly' | 'monthly' | 'lifetime';
  inviteCode: string;
  invitedBy?: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  lastLoginAt?: string; // ISO 8601
}

export interface LoginResponse {
  token: string;
  user: User;
}

// ===== 手機號登錄（現有，與 App 一致） =====

export interface LoginRequest {
  phone?: string;
  email?: string;
  code: string;
  channel: 'cn' | 'hk';
}

export interface RequestOtpRequest {
  phone?: string;
  email?: string;
  region: 'cn' | 'hk';
}

export interface RequestOtpResponse {
  message: string;
  retryAfter?: number; // 秒數
}

// ===== 用戶名登錄（新增，H5 專用） =====

export interface RegisterUsernameRequest {
  username: string;
  password: string;
  confirmPassword: string;
}

export interface LoginUsernameRequest {
  username: string;
  password: string;
}


