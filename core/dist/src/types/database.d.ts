/**
 * 数据库行类型定义
 *
 * 原则：
 * 1. 字段名与数据库完全一致（snake_case）
 * 2. 仅用于内部数据库查询结果类型标注
 * 3. 对外响应必须转换为 DTO（通过 FieldMapper）
 */
export interface UserRow {
    user_id: string;
    phone?: string;
    email?: string;
    username?: string;
    password_hash?: string;
    password_set: boolean;
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
    ai_calls_today: number;
    ai_calls_date: string;
    status?: 'ACTIVE' | 'PENDING_DELETE' | 'DELETED';
    delete_scheduled_at?: Date;
}
export interface ChartProfileRow {
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
export interface BaziChartRow {
    id: string;
    chart_profile_id: string;
    engine_version: string;
    birth_info_json: string;
    result_json: string;
    needs_update: boolean;
    created_at: Date;
    updated_at: Date;
}
export interface ConversationRow {
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
export interface MessageRow {
    message_id: string;
    conversation_id: string;
    role: 'user' | 'assistant';
    content: string;
    tokens_used?: number;
    model_used?: string;
    created_at: Date;
}
export interface ReadingRow {
    reading_id: string;
    user_id: string;
    chart_profile_id: string;
    reading_type: string;
    content_json: string;
    is_cached: boolean;
    created_at: Date;
    updated_at: Date;
}
export interface SubscriptionRow {
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
export interface AdminUserRow {
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
export interface LlmApiConfigRow {
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
export interface ShenshaReadingRow {
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
export interface DayStemReadingRow {
    stem: string;
    element: string;
    yin_yang: string;
    title: string;
    description: string;
    created_at: Date;
    updated_at: Date;
}
//# sourceMappingURL=database.d.ts.map