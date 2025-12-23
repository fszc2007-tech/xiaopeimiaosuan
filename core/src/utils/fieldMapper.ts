/**
 * 字段映射器（FieldMapper）
 * 
 * 职责：将数据库行（snake_case）转换为 API DTO（camelCase）
 * 
 * 原则：
 * 1. 所有对外 API 响应必须通过 FieldMapper
 * 2. 禁止在 service 层手搓字段映射
 * 3. 使用 TypeScript 类型约束，避免字段遗漏或错误
 * 4. 单一真相源：DTO 定义是唯一标准
 */

import type {
  UserRow,
  ChartProfileRow,
  BaziChartRow,
  ConversationRow,
  MessageRow,
  ReadingRow,
  SubscriptionRow,
  AdminUserRow,
  LlmApiConfigRow,
} from '../types/database';

import type {
  UserDto,
  ChartProfileDto,
  BaziChartDto,
  ConversationItemDto,
  MessageDto,
  SubscriptionDto,
  AdminUserDto,
  LLMConfigDto,
} from '../types/dto';

/**
 * 日期格式化工具
 */
function formatDate(date: Date | string | undefined): string | undefined {
  if (!date) return undefined;
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString();
}

function formatDateOnly(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0]; // YYYY-MM-DD
}

/**
 * 智能日期标签
 */
function formatDateLabel(date: Date | string): string {
  const now = new Date();
  const inputDate = typeof date === 'string' ? new Date(date) : date;
  
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const inputDay = new Date(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate());
  
  if (inputDay.getTime() === today.getTime()) {
    return '今天';
  } else if (inputDay.getTime() === yesterday.getTime()) {
    return '昨天';
  } else {
    const month = inputDate.getMonth() + 1;
    const day = inputDate.getDate();
    return `${month}月${day}日`;
  }
}

/**
 * 字段映射器
 */
export class FieldMapper {
  // ===== 用户相关 =====
  
  static mapUser(row: UserRow): UserDto {
    return {
      userId: row.user_id,
      phone: row.phone,
      email: row.email,
      username: row.username,         // H5 用戶名登錄（新增）
      appRegion: row.app_region,
      nickname: row.nickname,
      avatarUrl: row.avatar_url,
      isPro: row.is_pro,
      proExpiresAt: formatDate(row.pro_expires_at),
      proPlan: row.pro_plan,
      inviteCode: row.invite_code,
      invitedBy: row.invited_by,
      createdAt: formatDate(row.created_at)!,
      updatedAt: formatDate(row.updated_at)!,
      lastLoginAt: formatDate(row.last_login_at),
      aiCallsToday: row.ai_calls_today,
      aiCallsDate: row.ai_calls_date || undefined,
      status: row.status || 'ACTIVE',  // 賬號狀態（註銷功能）
      deleteScheduledAt: formatDate(row.delete_scheduled_at),  // 計劃刪除時間
    };
  }
  
  // ===== 命盘相关 =====
  
  static mapChartProfile(row: ChartProfileRow): ChartProfileDto {
    return {
      chartProfileId: row.id,
      userId: row.user_id,
      name: row.name,
      relationType: row.relation_type,
      birthday: formatDateOnly(row.birthday),
      birthTime: row.birth_time,
      timeAccuracy: row.time_accuracy,
      location: row.location,
      timezone: row.timezone,
      useTrueSolarTime: row.use_true_solar_time,
      gender: row.gender,
      calendarType: row.calendar_type,
      lunarMonth: row.lunar_month,
      lunarDay: row.lunar_day,
      isLeapMonth: row.is_leap_month,
      baziChartId: row.bazi_chart_id,
      oneLineSummary: row.one_line_summary,
      isCurrent: row.is_current,
      createdAt: formatDate(row.created_at)!,
      updatedAt: formatDate(row.updated_at)!,
    };
  }
  
  static mapBaziChart(row: BaziChartRow): BaziChartDto {
    const birthInfo = JSON.parse(row.birth_info_json);
    const result = JSON.parse(row.result_json);
    
    return {
      chartId: row.id,
      chartProfileId: row.chart_profile_id,
      engineVersion: row.engine_version,
      birthInfo,
      result,
      needsUpdate: row.needs_update,
      createdAt: formatDate(row.created_at)!,
      updatedAt: formatDate(row.updated_at)!,
    };
  }
  
  // ===== 对话相关 =====
  
  static mapConversationItem(row: ConversationRow & { master_name: string }): ConversationItemDto {
    return {
      conversationId: row.conversation_id,
      masterId: row.chart_profile_id,
      masterName: row.master_name,
      topic: row.topic,
      firstQuestion: row.first_question,
      lastMessagePreview: row.last_message_preview,
      createdAt: formatDate(row.created_at)!,
      updatedAt: formatDate(row.updated_at)!,
      dateLabel: formatDateLabel(row.created_at),
    };
  }
  
  static mapMessage(row: MessageRow): MessageDto {
    return {
      messageId: row.message_id,
      role: row.role,
      content: row.content,
      timestamp: formatDate(row.created_at)!,
    };
  }
  
  // ===== 批量映射 =====
  
  static mapUsers(rows: UserRow[]): UserDto[] {
    return rows.map(row => this.mapUser(row));
  }
  
  static mapChartProfiles(rows: ChartProfileRow[]): ChartProfileDto[] {
    return rows.map(row => this.mapChartProfile(row));
  }
  
  static mapBaziCharts(rows: BaziChartRow[]): BaziChartDto[] {
    return rows.map(row => this.mapBaziChart(row));
  }
  
  static mapConversationItems(rows: (ConversationRow & { master_name: string })[]): ConversationItemDto[] {
    return rows.map(row => this.mapConversationItem(row));
  }
  
  static mapMessages(rows: MessageRow[]): MessageDto[] {
    return rows.map(row => this.mapMessage(row));
  }
  
  // ===== 订阅相关 =====
  
  static mapSubscription(row: SubscriptionRow): SubscriptionDto {
    return {
      subscriptionId: row.id,
      userId: row.user_id,
      plan: row.plan,
      status: row.status,
      startedAt: formatDate(row.started_at)!,
      expiresAt: formatDate(row.expires_at),
      createdAt: formatDate(row.created_at)!,
      updatedAt: formatDate(row.updated_at)!,
    };
  }
  
  static mapSubscriptions(rows: SubscriptionRow[]): SubscriptionDto[] {
    return rows.map(row => this.mapSubscription(row));
  }
  
  // ===== Admin 用户相关 =====
  
  static mapAdminUser(row: AdminUserRow): AdminUserDto {
    return {
      adminId: row.admin_id,
      username: row.username,
      email: row.email,
      role: row.role,
      isActive: row.is_active,
      createdAt: formatDate(row.created_at)!,
      updatedAt: formatDate(row.updated_at)!,
      lastLoginAt: formatDate(row.last_login_at),
    };
  }
  
  // ===== LLM 配置相关 =====
  
  static mapLLMConfig(row: LlmApiConfigRow, decryptedKey?: string): LLMConfigDto {
    return {
      provider: row.model, // 数据库列名是 model
      hasApiKey: !!row.api_key_encrypted,
      apiKeyMasked: row.api_key_encrypted ? maskApiKey(decryptedKey || '') : undefined,
      baseUrl: row.api_url, // 数据库列名是 api_url
      modelName: row.model_name || '',
      enableStream: Boolean(row.enable_stream),
      enableThinking: Boolean(row.thinking_mode), // 数据库列名是 thinking_mode
      temperature: Number(row.temperature || 0.7),
      maxTokens: row.max_tokens || 4000,
      isEnabled: Boolean(row.is_enabled),
      isDefault: Boolean(row.is_default),
      testStatus: row.test_status || 'not_tested',
      testMessage: row.test_message || undefined,
    };
  }
}

/**
 * 掩码 API Key（仅显示后 4 位）
 */
function maskApiKey(apiKey: string): string {
  if (!apiKey || apiKey.length <= 4) {
    return '****';
  }
  const last4 = apiKey.slice(-4);
  return '*'.repeat(Math.max(apiKey.length - 4, 12)) + last4;
}

