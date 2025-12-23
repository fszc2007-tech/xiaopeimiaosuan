/**
 * 对话管理服务
 *
 * 负责对话的查询、删除、筛选等功能
 *
 * 参考文档：
 * - app.doc/features/我的-二级-内容查看页面设计文档.md
 * - app.doc/features/聊天页设计文档（公共组件版）.md
 */
/**
 * 对话项类型
 */
export interface ConversationItem {
    conversationId: string;
    masterId: string;
    masterName: string;
    topic?: string;
    firstQuestion: string;
    lastMessagePreview: string;
    createdAt: Date;
    updatedAt: Date;
    dateLabel: string;
}
/**
 * 获取对话列表
 */
export declare function getConversations(params: {
    userId: string;
    masterIds?: string[];
    dateFilter?: 'today' | 'week' | 'month' | 'all';
    page?: number;
    pageSize?: number;
}): Promise<{
    items: ConversationItem[];
    total: number;
}>;
/**
 * 获取对话详情（消息列表）
 */
export declare function getConversationDetail(params: {
    userId: string;
    conversationId: string;
    page?: number;
    pageSize?: number;
}): Promise<{
    conversation: {
        conversationId: string;
        masterId: string;
        masterName: string;
        topic?: string;
        createdAt: Date;
    };
    messages: Array<{
        messageId: string;
        role: 'user' | 'assistant';
        content: string;
        timestamp: Date;
    }>;
    total: number;
}>;
/**
 * 删除对话
 */
export declare function deleteConversation(params: {
    userId: string;
    conversationId: string;
}): Promise<void>;
/**
 * 获取命主列表（用于筛选）
 */
export declare function getMastersForFilter(params: {
    userId: string;
}): Promise<Array<{
    masterId: string;
    masterName: string;
    conversationCount: number;
}>>;
//# sourceMappingURL=conversationService.d.ts.map