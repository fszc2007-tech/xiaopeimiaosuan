/**
 * 聊天消息反馈服务
 * 
 * 负责处理聊天消息反馈的查询和管理
 */

import { getPool } from '../../database/connection';

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
  startTime?: string; // ISO 8601 格式
  endTime?: string;   // ISO 8601 格式
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
export async function getChatFeedbackList(query: ChatFeedbackListQuery): Promise<{
  items: ChatFeedbackDto[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const pool = getPool();
  const page = parseInt(String(query.page || 1));
  const pageSize = parseInt(String(query.pageSize || 20));
  const offset = (page - 1) * pageSize;
  
  // 构建查询条件
  const conditions: string[] = [];
  const params: any[] = [];
  
  // 默认查询最近30天（如果没有传 startTime/endTime）
  if (!query.startTime && !query.endTime) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    conditions.push('created_at >= ?');
    params.push(thirtyDaysAgo.toISOString().slice(0, 19).replace('T', ' '));
  } else {
    if (query.startTime) {
      conditions.push('created_at >= ?');
      params.push(query.startTime);
    }
    if (query.endTime) {
      conditions.push('created_at <= ?');
      params.push(query.endTime);
    }
  }
  
  if (query.rating) {
    conditions.push('rating = ?');
    params.push(query.rating);
  }
  
  if (query.userId) {
    conditions.push('user_id = ?');
    params.push(query.userId);
  }
  
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  
  // 查询总数
  const [countRows]: any = await pool.execute(
    `SELECT COUNT(*) as total FROM chat_message_feedback ${whereClause}`,
    params
  );
  const total = countRows[0].total;
  
  // 查询列表 - 默认按 created_at DESC 排序
  let sql = `SELECT * FROM chat_message_feedback ${whereClause} ORDER BY created_at DESC LIMIT ${pageSize} OFFSET ${offset}`;
  const [rows]: any = await pool.execute(sql, params);
  
  const items = rows.map(mapRowToDto);
  
  return {
    items,
    total,
    page,
    pageSize,
  };
}

/**
 * 将数据库行映射为 DTO
 * 
 * 包含 reasons 容错处理：
 * - NULL → []
 * - 非数组 → []
 * - 数组但包含未知字符串 → 保留原值（前端会显示原字符串）
 */
function mapRowToDto(row: any): ChatFeedbackDto {
  // reasons 容错处理
  let reasons: string[] = [];
  if (row.reasons) {
    try {
      // 尝试解析 JSON
      const parsed = typeof row.reasons === 'string' 
        ? JSON.parse(row.reasons) 
        : row.reasons;
      
      // 确保是数组
      if (Array.isArray(parsed)) {
        reasons = parsed;
      }
    } catch (e) {
      // 解析失败，使用空数组
      console.warn('[ChatFeedbackService] Failed to parse reasons:', e);
      reasons = [];
    }
  }
  
  return {
    id: row.feedback_id,
    userId: row.user_id,
    rating: row.rating,
    reasons,
    comment: row.comment || undefined,
    model: row.model || undefined,
    conversationId: row.conversation_id,
    messageId: row.message_id,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}


