/**
 * API 路径常量
 * 
 * 规范：
 * - 所有 API 路径使用 /api/v1/ 前缀
 * - 路径参数使用 chartId（而不是 id）
 */

const API_V1 = '/api/v1';

export const API_ENDPOINTS = {
  // 认证相关
  AUTH: {
    LOGIN_OR_REGISTER: `${API_V1}/auth/login_or_register`,
    REQUEST_OTP: `${API_V1}/auth/request-otp`,
    RESET_PASSWORD: `${API_V1}/auth/reset-password`,
    LOGOUT: `${API_V1}/auth/logout`,
  },
  
  // 账号管理相关
  ACCOUNT: {
    DELETION_REQUEST: `${API_V1}/account/deletion-request`,
    DELETION_STATUS: `${API_V1}/account/deletion-status`,
    DELETION_CANCEL: `${API_V1}/account/deletion-cancel`,
  },
  
  // 用户相关
  USER: {
    PROFILE: `${API_V1}/user/profile`,
    UPDATE_PROFILE: `${API_V1}/user/profile`,
    CURRENT_CHART_MASTER: `${API_V1}/user/current-chart-master`,
    SET_CURRENT_MASTER: `${API_V1}/user/set-current-master`,
  },
  
  // 命盘相关
  BAZI: {
    COMPUTE: `${API_V1}/bazi/chart`,
    CHARTS: `${API_V1}/bazi/charts`,
    CHART_DETAIL: (chartId: string) => `${API_V1}/bazi/charts/${chartId}`,
    SET_DEFAULT: (chartId: string) => `${API_V1}/bazi/charts/${chartId}/set-default`,
    DELETE_CHART: (chartId: string) => `${API_V1}/bazi/charts/${chartId}`,
    SHEN_SHA: (code: string) => `${API_V1}/bazi/shensha/${code}`,
    SHI_SHEN: (code: string) => `${API_V1}/bazi/shishen/${code}`,
    DAY_STEM: (stem: string) => `${API_V1}/bazi/day-stem/${stem}`,
  },
  
  // 解读相关
  READING: {
    GET_READING: `${API_V1}/bazi/reading`,
    ASK_QUESTION: `${API_V1}/bazi/ask`,
  },
  
  // 对话相关
  CHAT: {
    CONVERSATIONS: `${API_V1}/chat/conversations`,
    CONVERSATION_DETAIL: (conversationId: string) => `${API_V1}/chat/conversations/${conversationId}`,
    SEND_MESSAGE: (conversationId: string) => `${API_V1}/chat/conversations/${conversationId}/messages`,
    DELETE_CONVERSATION: (conversationId: string) => `${API_V1}/chat/conversations/${conversationId}`,
  },
  
  // Pro 订阅相关
  PRO: {
    STATUS: `${API_V1}/pro/status`,
    PLANS: `${API_V1}/pro/plans`,
    SUBSCRIBE: `${API_V1}/pro/subscribe`,
    CANCEL: `${API_V1}/pro/cancel`,
  },
  
  // 设置相关
  SETTINGS: {
    GET: `${API_V1}/settings`,
    UPDATE: `${API_V1}/settings`,
  },
  
  // 反馈相关
  FEEDBACK: {
    SUBMIT: `${API_V1}/feedback`,
  },
} as const;

export default API_ENDPOINTS;

