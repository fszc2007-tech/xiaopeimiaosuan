/**
 * API 服务统一导出
 */

export * from './apiClient';
export * as authApi from './authApi';
export * as baziApi from './baziApi';
export * as chartService from './baziApi';  // ✅ chartService 是 baziApi 的别名
export { authService } from './authService';
export { chatService } from './chatService';
export { feedbackService } from './feedbackService';
export * as accountService from './accountService';
