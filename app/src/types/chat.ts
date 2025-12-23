/**
 * 聊天相关类型定义
 * 
 * 注意：与 Core 后端的 ConversationDto、MessageDto 保持一致
 */

export interface Conversation {
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

// 对话列表项（与后端 DTO 对应）
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

// 对话详情（与后端 DTO 对应）
export interface ConversationDetailDto {
  conversation: {
    conversationId: string;
    masterId: string;
    masterName: string;
    topic?: string;
    createdAt: string; // ISO 8601
  };
  messages: ChatMessage[];
  total: number;
}

export interface ChatMessage {
  messageId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string; // ISO 8601
}

export interface SendMessageRequest {
  conversationId?: string;
  masterId: string;
  message: string;
  topic?: string;
  context?: any;
}

export interface SendMessageResponse {
  conversationId: string;
  message: ChatMessage;
  followUpSuggestions?: string[];
}

/**
 * 聊天页入口来源
 * 用于追踪用户从哪里进入聊天页
 */
export type ChatEntrySource =
  | 'xiaopei_topic_button'      // 小佩主页话题按钮
  | 'xiaopei_common_question'   // 小佩主页大家常问
  | 'xiaopei_free_input'        // 小佩主页自由输入
  | 'overview_card'             // 命盘总览一键解读
  | 'shen_sha_popup'           // 神煞解读弹窗
  | 'history';                 // 历史对话入口

/**
 * 话题类型
 */
export type TopicKey =
  | 'marriage'     // 婚姻
  | 'career'       // 事业
  | 'wealth'       // 财富
  | 'health'       // 健康
  | 'relationship' // 人际关系
  | 'fortune';     // 运势

