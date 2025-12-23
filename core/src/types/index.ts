/**
 * Core 后端类型定义
 */

// ===== API 响应类型 =====

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// ===== 用户类型 =====

export interface User {
  user_id: string;
  nickname?: string;
  phone?: string;
  email?: string;
  password_hash?: string;
  avatar?: string;
  app_region: 'cn' | 'hk';
  is_pro: boolean;
  pro_expire_at?: Date;
  created_at: Date;
  updated_at: Date;
}

// ===== 命盘类型 =====

export interface ChartProfile {
  chart_profile_id: string;
  user_id: string;
  name: string;
  relation_type: string;
  gender: 'male' | 'female';
  gregorian_birth: string;
  birth_time: string;
  birth_place?: string;
  timezone?: string;
  created_at: Date;
  updated_at: Date;
}

export interface BaziChart {
  chart_id: string;
  chart_profile_id: string;
  result_json: any; // 完整的八字计算结果（400+ 字段）
  engine_version: string;
  needs_update: boolean;
  created_at: Date;
  updated_at: Date;
}

// ===== 出生信息类型 =====

export interface BirthInfo {
  sex: 'male' | 'female';
  calendar_type: '公历' | '农历';
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  tz?: string;
  use_tst?: boolean;
  hour_ref?: 'midnight' | 'sunrise';
  place?: string;
  isLeap?: boolean;
}

// ===== LLM 相关类型 =====

export type LLMModel = 'deepseek' | 'chatgpt' | 'qwen';

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMRequest {
  model: LLMModel;
  messages: LLMMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface LLMResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// ===== 解读相关类型 =====

export interface ReadingRequest {
  scene: string; // 解读场景（如 'shensha', 'overview', 'general'）
  chart_id: string;
  message: string;
  options?: Record<string, any>;
}

export interface ReadingResult {
  display_text: string; // 给用户看的文本
  json?: any; // 结构化数据（可选）
  meta?: any; // 元数据（可选）
}

