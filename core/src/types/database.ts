/**
 * 数据库行类型定义
 * 
 * 原则：
 * 1. 字段名与数据库完全一致（snake_case）
 * 2. 仅用于内部数据库查询结果类型标注
 * 3. 对外响应必须转换为 DTO（通过 FieldMapper）
 */

import { RowDataPacket } from 'mysql2';

// ===== 用户表 =====

export interface UserRow extends RowDataPacket {
  user_id: string;
  phone?: string;
  // 注意：email 字段已删除（migration 008），不再使用
  username?: string;              // H5 用戶名登錄
  password_hash?: string;
  password_set: boolean;          // 是否已設置密碼
  app_region: 'CN' | 'HK';
  nickname: string;
  avatar_url?: string;
  is_pro: boolean;
  pro_expires_at?: Date;
  pro_plan?: 'yearly' | 'monthly' | 'quarterly' | 'lifetime';
  invite_code: string;
  invited_by?: string;
  created_at: Date;
  updated_at: Date;
  last_login_at?: Date;
  ai_calls_today: number;        // 今日已使用 AI 解讀次數
  ai_calls_date: string;         // AI 次數計數日期 (YYYY-MM-DD)
  status?: 'ACTIVE' | 'PENDING_DELETE' | 'DELETED';  // 賬號狀態
  delete_scheduled_at?: Date;    // 計劃刪除時間
}

// ===== 命盘档案表 =====

export interface ChartProfileRow extends RowDataPacket {
  id: string;
  user_id: string;
  name: string;
  gender: 'male' | 'female';
  is_default: boolean;
  is_current: boolean;
  birthday: Date;
  birth_time?: string;
  time_accuracy?: 'exact' | 'approx' | 'unknown';
  location?: string;
  timezone?: string;
  use_true_solar_time: boolean;
  calendar_type: 'solar' | 'lunar';
  lunar_month?: number;
  lunar_day?: number;
  is_leap_month?: boolean;
  bazi_chart_id?: string;
  relation_type: 'self' | 'partner' | 'parent' | 'child' | 'friend' | 'other';
  relation_label?: string;
  notes?: string;
  one_line_summary?: string;
  created_at: Date;
  updated_at: Date;
}

// ===== 八字命盘表 =====

export interface BaziChartRow extends RowDataPacket {
  id: string;
  chart_profile_id: string;
  engine_version: string;
  birth_info_json: string;
  result_json: string;
  needs_update: boolean;
  created_at: Date;
  updated_at: Date;
}

// ===== 对话表 =====

export interface ConversationRow extends RowDataPacket {
  conversation_id: string;
  user_id: string;
  chart_profile_id: string;
  topic?: string;
  first_question: string;
  last_message_preview: string;
  message_count: number;
  is_archived: boolean;
  created_at: Date;
  updated_at: Date;
}

// ===== 消息表 =====

export interface MessageRow extends RowDataPacket {
  message_id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  tokens_used?: number;
  model_used?: string;
  created_at: Date;
}

// ===== 解读表 =====

export interface ReadingRow extends RowDataPacket {
  reading_id: string;
  user_id: string;
  chart_profile_id: string;
  reading_type: string;
  content_json: string;
  is_cached: boolean;
  created_at: Date;
  updated_at: Date;
}

// ===== 订阅表 =====

export interface SubscriptionRow extends RowDataPacket {
  id: number;
  user_id: string;
  plan: 'yearly' | 'monthly' | 'lifetime';
  status: 'active' | 'canceled' | 'expired';
  platform?: 'ios' | 'android' | 'web';
  transaction_id?: string;
  original_transaction_id?: string;
  started_at: Date;
  expires_at?: Date;
  created_at: Date;
  updated_at: Date;
}

// ===== Admin 用户表 =====

export interface AdminUserRow extends RowDataPacket {
  admin_id: string;
  username: string;
  email?: string;
  password_hash: string;
  role: 'super_admin' | 'admin';
  is_active: boolean;
  last_login_at?: Date;
  created_at: Date;
  updated_at: Date;
}

// ===== LLM 配置表 =====

export interface LlmApiConfigRow extends RowDataPacket {
  config_id: string;
  model: 'deepseek' | 'chatgpt' | 'qwen';
  model_name?: string;
  api_key_encrypted?: string;
  api_url: string;
  is_enabled: boolean;
  is_default: boolean;
  enable_stream: boolean;
  thinking_mode: boolean;
  temperature?: number;
  max_tokens?: number;
  test_status?: 'success' | 'failed' | 'not_tested';
  test_message?: string;
  created_at: Date;
  updated_at: Date;
}

// ===== 神煞解读表 =====

export interface ShenshaReadingRow extends RowDataPacket {
  reading_id: string;
  shensha_code: string;
  pillar_type: 'year' | 'month' | 'day' | 'hour';
  name: string;
  badge_text: string;
  type: 'auspicious' | 'inauspicious' | 'neutral';
  short_title: string;
  summary: string;
  bullet_points: string[];
  for_this_position: string;
  recommended_questions: string[];
  is_active: boolean;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}

// ===== 日主天干解读表 =====

export interface DayStemReadingRow extends RowDataPacket {
  stem: string;
  element: string;
  yin_yang: string;
  title: string;
  description: string;
  created_at: Date;
  updated_at: Date;
}
