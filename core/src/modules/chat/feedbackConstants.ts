/**
 * 聊天消息反馈相关常量
 */

/**
 * 点踩原因枚举（后端权威定义）
 * 前端必须与此完全对齐
 */
export const DISLIKE_REASONS = [
  'understand_wrong',      // 理解错题意
  'not_professional',      // 命理解读不准／不专业
  'too_generic',           // 内容太空泛，没有帮助
  'incorrect',             // 内容有错误或前后矛盾
  'expression_bad',        // 文字表达不好（太长／看不懂）
  'other',                 // 其他
] as const;

export type DislikeReason = (typeof DISLIKE_REASONS)[number];

/**
 * 反馈评分类型
 */
export type FeedbackRating = 'up' | 'down';

