/**
 * 用户反馈服务
 *
 * 负责处理用户反馈的提交、查询和管理
 */
export interface FeedbackDto {
    id: string;
    userId: string;
    type: 'suggest' | 'problem';
    content: string;
    contact?: string;
    imagesJson?: string[];
    status: 'pending' | 'processing' | 'resolved';
    adminReply?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface CreateFeedbackDto {
    userId: string;
    type: 'suggest' | 'problem';
    content: string;
    contact?: string;
    imagesJson?: string[];
}
export interface UpdateFeedbackDto {
    status?: 'pending' | 'processing' | 'resolved';
    adminReply?: string;
}
export interface FeedbackListQuery {
    type?: 'suggest' | 'problem';
    status?: 'pending' | 'processing' | 'resolved';
    userId?: string;
    page?: number;
    pageSize?: number;
}
/**
 * 提交反馈
 */
export declare function createFeedback(data: CreateFeedbackDto): Promise<FeedbackDto>;
/**
 * 获取反馈列表（支持分页和筛选）
 */
export declare function getFeedbackList(query: FeedbackListQuery): Promise<{
    items: FeedbackDto[];
    total: number;
    page: number;
    pageSize: number;
}>;
/**
 * 获取单个反馈详情
 */
export declare function getFeedbackById(id: string): Promise<FeedbackDto | null>;
/**
 * 更新反馈（管理员操作）
 */
export declare function updateFeedback(id: string, data: UpdateFeedbackDto): Promise<FeedbackDto>;
/**
 * 删除反馈
 */
export declare function deleteFeedback(id: string): Promise<void>;
//# sourceMappingURL=feedbackService.d.ts.map