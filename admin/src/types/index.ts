/**
 * Admin 后台 TypeScript 类型定义
 */

// ===== API 响应格式 =====
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// ===== 认证相关 =====
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  admin: AdminUser;
}

export interface AdminUser {
  id: string;
  username: string;
  role: string;
  createdAt: string;
}

// ===== 用户管理 =====
export interface User {
  userId: string;  // 后端返回 userId
  phone?: string;
  email?: string;
  appRegion: 'CN' | 'HK';
  isPro: boolean;
  proExpiresAt?: string;
  proPlan?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface UserListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  isPro?: boolean;
  appRegion?: 'CN' | 'HK';
}

export interface UserListResponse {
  users: User[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateTestUserRequest {
  phone?: string;
  email?: string;
  password: string;
  appRegion: 'CN' | 'HK';
}

export interface CursorTestAccount {
  userId: string;
  phone: string;
  email: string;
  password: string;
  appRegion: 'CN' | 'HK';
  createdAt: string;
}

// ===== LLM 配置 =====
export interface LLMConfig {
  provider: 'deepseek' | 'chatgpt' | 'qwen';
  hasApiKey: boolean;
  apiKeyMasked?: string;
  baseUrl: string;
  modelName: string;
  enableStream: boolean;
  enableThinking?: boolean; // DeepSeek 专用
  temperature: number;
  maxTokens: number;
  isEnabled: boolean;
  isDefault: boolean;
  testStatus: 'success' | 'failed' | 'not_tested';
  testMessage?: string;
  updatedAt?: string;
}

export interface UpdateLLMConfigRequest {
  isEnabled?: boolean;
  apiKey?: string;
  temperature?: number;
  maxTokens?: number;
  enableThinking?: boolean; // DeepSeek 专用
}

export interface TestLLMResponse {
  status: 'success' | 'failed';
  message: string;
  responseTime?: number;
}

// ===== 系统设置 =====
export interface SystemSettings {
  rateLimitEnabled: {
    bazi_compute: boolean;
    chat: boolean;
  };
  proFeatureGate: {
    shensha: boolean;
    overview: boolean;
    advanced_chat: boolean;
  };
  rateLimitConfig: {
    bazi_compute_daily_limit: number;
    bazi_compute_daily_limit_pro: number;
    chat_daily_limit: number;
    chat_daily_limit_pro: number;
  };
}

export interface UpdateRateLimitRequest {
  bazi_compute: boolean;
  chat: boolean;
}

export interface UpdateProFeatureGateRequest {
  shensha: boolean;
  overview: boolean;
  advanced_chat: boolean;
}

export interface UpdateRateLimitConfigRequest {
  bazi_compute_daily_limit: number;
  bazi_compute_daily_limit_pro: number;
  chat_daily_limit: number;
  chat_daily_limit_pro: number;
}

// ===== 反馈管理 =====
export interface Feedback {
  id: string;
  userId: string;
  type: 'suggest' | 'problem';
  content: string;
  contact?: string;
  imagesJson?: string[];
  status: 'pending' | 'processing' | 'resolved';
  adminReply?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackListParams {
  page?: number;
  pageSize?: number;
  type?: 'suggest' | 'problem';
  status?: 'pending' | 'processing' | 'resolved';
  userId?: string;
}

export interface FeedbackListResponse {
  items: Feedback[];
  total: number;
  page: number;
  pageSize: number;
}

export interface UpdateFeedbackRequest {
  status?: 'pending' | 'processing' | 'resolved';
  adminReply?: string;
}

// ===== 會員管理 =====
export interface MembershipUserListItem {
  userId: string;
  phone?: string;
  createdAt: string;
  isPro: boolean;
  proPlan?: 'monthly' | 'quarterly' | 'yearly' | 'lifetime';
  proExpiresAt?: string;
  aiCallsToday: number;
  aiDailyLimit: number;
}

export interface MembershipUserListParams {
  page?: number;
  pageSize?: number;
  q?: string;  // 搜尋關鍵字（手機或 userId）
  isPro?: boolean;  // 會員狀態篩選
}

export interface MembershipUserListResponse {
  items: MembershipUserListItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

export interface MembershipUserDetail {
  userId: string;
  phone?: string;
  createdAt: string;
  isPro: boolean;
  proPlan?: 'monthly' | 'quarterly' | 'yearly' | 'lifetime';
  proExpiresAt?: string;
  aiCallsToday: number;
  aiCallsDate: string;
  aiDailyLimit: number;
}

export interface GrantMembershipRequest {
  plan: 'monthly' | 'quarterly' | 'yearly';
  mode: 'extend' | 'fromNow';
}

export interface GrantMembershipResponse {
  isPro: boolean;
  proPlan: string | null;
  proExpiresAt: string | null;
}

export interface RevokeMembershipResponse {
  isPro: boolean;
  proPlan: string | null;
  proExpiresAt: string | null;
}

export interface ResetAiTodayResponse {
  aiCallsToday: number;
  aiCallsDate: string;
}
