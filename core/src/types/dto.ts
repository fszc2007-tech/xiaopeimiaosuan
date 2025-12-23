/**
 * API DTO 定义（单一真相源）
 * 
 * 原则：
 * 1. 所有对外 API 响应必须使用这里定义的 DTO
 * 2. 所有字段使用 camelCase
 * 3. 禁止在 service 层手搓字段映射
 * 4. 使用 FieldMapper 进行数据库 → DTO 转换
 */

// ===== 用户相关 DTO =====

export interface UserDto {
  userId: string;
  phone?: string;
  email?: string;
  username?: string;              // H5 用戶名登錄（新增）
  appRegion: 'CN' | 'HK';
  nickname: string;
  avatarUrl?: string;
  isPro: boolean;
  proExpiresAt?: string; // ISO 8601
  proPlan?: 'yearly' | 'monthly' | 'quarterly' | 'lifetime';
  inviteCode: string;
  invitedBy?: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  lastLoginAt?: string; // ISO 8601
  aiCallsToday?: number;          // 今日已使用 AI 解讀次數
  aiCallsDate?: string;           // AI 次數計數日期 (YYYY-MM-DD)
  status?: 'ACTIVE' | 'PENDING_DELETE' | 'DELETED';  // 賬號狀態（註銷功能）
  deleteScheduledAt?: string;     // 計劃刪除時間（ISO 8601）
}

export interface LoginResponseDto {
  token: string;
  user: UserDto;
}

export interface ThirdPartyLoginResponseDto {
  token: string;
  user: UserDto;  // 使用完整的 UserDto，包含 status 和 deleteScheduledAt
  first_login?: boolean;
  request_id?: string;
}

// ===== 命盘相关 DTO =====

export interface ChartProfileDto {
  chartProfileId: string;
  userId: string;
  name: string;
  relationType: 'self' | 'partner' | 'parent' | 'child' | 'friend' | 'other';
  birthday: string; // YYYY-MM-DD
  birthTime?: string; // HH:mm:ss
  timeAccuracy?: 'exact' | 'approx' | 'unknown';
  location?: string;
  timezone?: string;
  useTrueSolarTime: boolean;
  gender: 'male' | 'female';
  calendarType: 'solar' | 'lunar';
  lunarMonth?: number;
  lunarDay?: number;
  isLeapMonth?: boolean;
  baziChartId?: string;
  oneLineSummary?: string;
  isCurrent: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface BaziChartDto {
  chartId: string;
  chartProfileId: string;
  engineVersion: string;
  birthInfo: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    timezone: string;
    calendarType: 'solar' | 'lunar';
  };
  result: any; // 八字引擎计算结果（JSON）
  needsUpdate: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface ComputeChartResponseDto {
  chartId: string;
  chartProfileId: string;
  result: any; // 八字引擎结果
}

// ===== 对话相关 DTO =====

export interface ConversationItemDto {
  conversationId: string;
  masterId: string;
  masterName: string;
  topic?: string;
  firstQuestion: string;
  lastMessagePreview: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  dateLabel: string; // "今天"、"昨天"、"MM月DD日"
}

export interface ConversationDetailDto {
  conversation: {
    conversationId: string;
    masterId: string;
    masterName: string;
    topic?: string;
    createdAt: string; // ISO 8601
  };
  messages: MessageDto[];
  total: number;
}

export interface MessageDto {
  messageId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string; // ISO 8601
}

// ===== 解读相关 DTO =====

export interface ReadingResultDto {
  displayText: string;
  json?: any;
  meta?: {
    model?: string;
    thinkingMode?: boolean;
    thinkingContent?: string;
  };
}

export interface FollowUpQuestionsDto {
  questions: string[];
}

// ===== 验证码相关 DTO =====

export interface RequestOtpResponseDto {
  message: string;
  retryAfter?: number; // 秒数，表示需要等待多久才能重试
}

// ===== 分页响应 DTO =====

export interface PaginatedResponseDto<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ===== 通用响应 DTO =====

export interface MessageResponseDto {
  message: string;
}

// ===== Pro 订阅相关 DTO =====

export interface ProStatusDto {
  isPro: boolean;
  expiresAt?: string; // ISO 8601（lifetime 时为 null）
  plan?: 'yearly' | 'monthly' | 'lifetime';
  features: string[];
}

export interface SubscriptionPlanDto {
  plan: 'yearly' | 'monthly' | 'lifetime';
  name: string;
  price: number;
  currency: string;
  duration?: number; // 天数（lifetime 为 null）
  features: string[];
  isPopular: boolean;
}

export interface SubscriptionDto {
  subscriptionId: number;
  userId: string;
  plan: 'yearly' | 'monthly' | 'lifetime';
  status: 'active' | 'canceled' | 'expired';
  startedAt: string; // ISO 8601
  expiresAt?: string; // ISO 8601（lifetime 为 null）
  createdAt: string;
  updatedAt: string;
}

export interface SubscribeRequestDto {
  plan: 'yearly' | 'monthly' | 'lifetime';
}

export interface SubscribeResponseDto {
  subscription: SubscriptionDto;
  user: {
    isPro: boolean;
    proExpiresAt?: string;
    proPlan?: string;
  };
}

// ===== Admin 相关 DTO =====

export interface AdminUserDto {
  adminId: string;
  username: string;
  email?: string;
  role: 'super_admin' | 'admin';
  isActive: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  lastLoginAt?: string; // ISO 8601
}

export interface AdminLoginRequestDto {
  username: string;
  password: string;
}

export interface AdminLoginResponseDto {
  token: string;
  admin: AdminUserDto;
}

export interface AdminUserListDto {
  items: UserDto[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AdminUserDetailDto {
  user: UserDto;
  charts: ChartProfileDto[];
  stats: {
    chartCount: number;
    conversationCount: number;
    lastActiveAt?: string;
  };
}

export interface AdminCreateUserRequestDto {
  phone?: string;
  email?: string;
  password: string;
  nickname?: string;
  appRegion: 'CN' | 'HK';
  isPro?: boolean;
}

export interface CursorTestAccountDto {
  userId: string;
  phone?: string;
  email?: string;
  password?: string; // 仅首次创建或重置时返回
  nickname: string;
  isPro: boolean;
  createdAt: string;
  exists: boolean; // 是否已存在
}

// ===== LLM 配置相关 DTO =====

export interface LLMConfigDto {
  provider: 'deepseek' | 'chatgpt' | 'qwen';
  hasApiKey: boolean; // 是否已配置过 Key
  apiKeyMasked?: string; // 显示后 4 位，如 '************abcd'
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
}

export interface UpdateLLMConfigRequestDto {
  apiKey?: string; // 如果提供，会加密存储
  baseUrl?: string;
  modelName?: string;
  enableStream?: boolean;
  enableThinking?: boolean;
  temperature?: number;
  maxTokens?: number;
  isEnabled?: boolean;
}

export interface LLMStrategyDto {
  defaultProvider: 'deepseek' | 'chatgpt' | 'qwen';
  fallbackProviders: ('deepseek' | 'chatgpt' | 'qwen')[];
}

export interface TestLLMConnectionDto {
  status: 'success' | 'failed';
  message: string;
  responseTime?: number; // 毫秒
}

