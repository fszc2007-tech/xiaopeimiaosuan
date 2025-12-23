/**
 * 聊天消息反馈相关常量
 */
/**
 * 点踩原因枚举（后端权威定义）
 * 前端必须与此完全对齐
 */
export declare const DISLIKE_REASONS: readonly ["understand_wrong", "not_professional", "too_generic", "incorrect", "expression_bad", "other"];
export type DislikeReason = (typeof DISLIKE_REASONS)[number];
/**
 * 反馈评分类型
 */
export type FeedbackRating = 'up' | 'down';
//# sourceMappingURL=feedbackConstants.d.ts.map