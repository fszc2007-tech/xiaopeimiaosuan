/**
 * API DTO 定义（单一真相源）
 *
 * 原则：
 * 1. 所有对外 API 响应必须使用这里定义的 DTO
 * 2. 所有字段使用 camelCase
 * 3. 禁止在 service 层手搓字段映射
 * 4. 使用 FieldMapper 进行数据库 → DTO 转换
 */
export interface UserDto {
    userId: string;
    phone?: string;
    email?: string;
    username?: string;
    appRegion: 'CN' | 'HK';
    nickname: string;
    avatarUrl?: string;
    isPro: boolean;
    proExpiresAt?: string;
    proPlan?: 'yearly' | 'monthly' | 'quarterly' | 'lifetime';
    inviteCode: string;
    invitedBy?: string;
    createdAt: string;
    updatedAt: string;
    lastLoginAt?: string;
    aiCallsToday?: number;
    aiCallsDate?: string;
    status?: 'ACTIVE' | 'PENDING_DELETE' | 'DELETED';
    deleteScheduledAt?: string;
}
export interface LoginResponseDto {
    token: string;
    user: UserDto;
}
export interface ThirdPartyLoginResponseDto {
    token: string;
    user: UserDto;
    first_login?: boolean;
    request_id?: string;
}
export interface ChartProfileDto {
    chartProfileId: string;
    userId: string;
    name: string;
    relationType: 'self' | 'partner' | 'parent' | 'child' | 'friend' | 'other';
    birthday: string;
    birthTime?: string;
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
    createdAt: string;
    updatedAt: string;
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
    result: any;
    needsUpdate: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface ComputeChartResponseDto {
    chartId: string;
    chartProfileId: string;
    result: any;
}
export interface ConversationItemDto {
    conversationId: string;
    masterId: string;
    masterName: string;
    topic?: string;
    firstQuestion: string;
    lastMessagePreview: string;
    createdAt: string;
    updatedAt: string;
    dateLabel: string;
}
export interface ConversationDetailDto {
    conversation: {
        conversationId: string;
        masterId: string;
        masterName: string;
        topic?: string;
        createdAt: string;
    };
    messages: MessageDto[];
    total: number;
}
export interface MessageDto {
    messageId: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
}
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
export interface RequestOtpResponseDto {
    message: string;
    retryAfter?: number;
}
export interface PaginatedResponseDto<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
}
export interface MessageResponseDto {
    message: string;
}
export interface ProStatusDto {
    isPro: boolean;
    expiresAt?: string;
    plan?: 'yearly' | 'monthly' | 'lifetime';
    features: string[];
}
export interface SubscriptionPlanDto {
    plan: 'yearly' | 'monthly' | 'lifetime';
    name: string;
    price: number;
    currency: string;
    duration?: number;
    features: string[];
    isPopular: boolean;
}
export interface SubscriptionDto {
    subscriptionId: number;
    userId: string;
    plan: 'yearly' | 'monthly' | 'lifetime';
    status: 'active' | 'canceled' | 'expired';
    startedAt: string;
    expiresAt?: string;
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
export interface AdminUserDto {
    adminId: string;
    username: string;
    email?: string;
    role: 'super_admin' | 'admin';
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    lastLoginAt?: string;
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
    password?: string;
    nickname: string;
    isPro: boolean;
    createdAt: string;
    exists: boolean;
}
export interface LLMConfigDto {
    provider: 'deepseek' | 'chatgpt' | 'qwen';
    hasApiKey: boolean;
    apiKeyMasked?: string;
    baseUrl: string;
    modelName: string;
    enableStream: boolean;
    enableThinking?: boolean;
    temperature: number;
    maxTokens: number;
    isEnabled: boolean;
    isDefault: boolean;
    testStatus: 'success' | 'failed' | 'not_tested';
    testMessage?: string;
}
export interface UpdateLLMConfigRequestDto {
    apiKey?: string;
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
    responseTime?: number;
}
//# sourceMappingURL=dto.d.ts.map