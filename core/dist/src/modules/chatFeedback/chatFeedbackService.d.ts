/**
 * 聊天消息反馈服务
 *
 * 负责处理聊天消息反馈的查询和管理
 */
export interface ChatFeedbackDto {
    id: string;
    userId: string;
    rating: 'up' | 'down';
    reasons: string[];
    comment?: string;
    model?: string;
    conversationId: string;
    messageId: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface ChatFeedbackListQuery {
    rating?: 'up' | 'down';
    userId?: string;
    startTime?: string;
    endTime?: string;
    page?: number;
    pageSize?: number;
}
/**
 * 获取聊天反馈列表（支持分页和筛选）
 *
 * 特性：
 * - 默认查询最近30天
 * - 默认按 created_at DESC 排序
 * - reasons 容错处理（NULL、空数组、未知字符串）
 */
export declare function getChatFeedbackList(query: ChatFeedbackListQuery): Promise<{
    items: ChatFeedbackDto[];
    total: number;
    page: number;
    pageSize: number;
}>;
//# sourceMappingURL=chatFeedbackService.d.ts.map