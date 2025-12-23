/**
 * 用户反馈服务
 * 
 * 负责处理用户反馈的提交、查询和管理
 */

import { getPool } from '../../database/connection';
import { v4 as uuidv4 } from 'uuid';

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
export async function createFeedback(data: CreateFeedbackDto): Promise<FeedbackDto> {
  const pool = getPool();
  const id = uuidv4();
  
  console.log('[FeedbackService] 创建反馈:', { id, ...data });
  
  await pool.execute(
    `INSERT INTO feedbacks 
     (feedback_id, user_id, type, content, contact_info, images_json, status) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.userId,
      data.type,
      data.content,
      data.contact || null,
      data.imagesJson ? JSON.stringify(data.imagesJson) : null,
      'pending'
    ]
  );
  
  // 查询刚创建的记录
  const [rows]: any = await pool.execute(
    'SELECT * FROM feedbacks WHERE feedback_id = ?',
    [id]
  );
  
  if (rows.length === 0) {
    throw new Error('创建反馈失败');
  }
  
  return mapRowToDto(rows[0]);
}

/**
 * 获取反馈列表（支持分页和筛选）
 */
export async function getFeedbackList(query: FeedbackListQuery): Promise<{
  items: FeedbackDto[];
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
  
  if (query.type) {
    conditions.push('type = ?');
    params.push(query.type);
  }
  
  if (query.status) {
    conditions.push('status = ?');
    params.push(query.status);
  }
  
  if (query.userId) {
    conditions.push('user_id = ?');
    params.push(query.userId);
  }
  
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  
  // 查询总数
  const [countRows]: any = await pool.execute(
    `SELECT COUNT(*) as total FROM feedbacks ${whereClause}`,
    params
  );
  const total = countRows[0].total;
  
  // 查询列表 - 使用字符串拼接而不是参数绑定（LIMIT/OFFSET需要是数字字面量）
  let sql = `SELECT * FROM feedbacks ${whereClause} ORDER BY created_at DESC LIMIT ${pageSize} OFFSET ${offset}`;
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
 * 获取单个反馈详情
 */
export async function getFeedbackById(id: string): Promise<FeedbackDto | null> {
  const pool = getPool();
  
  const [rows]: any = await pool.execute(
    'SELECT * FROM feedbacks WHERE feedback_id = ?',
    [id]
  );
  
  if (rows.length === 0) {
    return null;
  }
  
  return mapRowToDto(rows[0]);
}

/**
 * 更新反馈（管理员操作）
 */
export async function updateFeedback(id: string, data: UpdateFeedbackDto): Promise<FeedbackDto> {
  const pool = getPool();
  
  const updateFields: string[] = [];
  const params: any[] = [];
  
  if (data.status) {
    updateFields.push('status = ?');
    params.push(data.status);
  }
  
  if (data.adminReply !== undefined) {
    updateFields.push('admin_reply = ?');
    params.push(data.adminReply);
  }
  
  if (updateFields.length === 0) {
    throw new Error('没有需要更新的字段');
  }
  
  params.push(id);
  
  await pool.execute(
    `UPDATE feedbacks SET ${updateFields.join(', ')} WHERE feedback_id = ?`,
    params
  );
  
  // 查询更新后的记录
  const updated = await getFeedbackById(id);
  if (!updated) {
    throw new Error('更新失败，反馈不存在');
  }
  
  return updated;
}

/**
 * 删除反馈
 */
export async function deleteFeedback(id: string): Promise<void> {
  const pool = getPool();
  
  await pool.execute(
    'DELETE FROM feedbacks WHERE feedback_id = ?',
    [id]
  );
}

/**
 * 将数据库行映射为 DTO
 */
function mapRowToDto(row: any): FeedbackDto {
  // 解析 images_json
  let imagesJson: string[] | undefined;
  if (row.images_json) {
    try {
      imagesJson = JSON.parse(row.images_json);
    } catch (e) {
      console.error('[FeedbackService] Failed to parse images_json:', e);
      imagesJson = undefined;
    }
  }

  return {
    id: row.feedback_id,
    userId: row.user_id,
    type: row.type,
    content: row.content,
    contact: row.contact_info || undefined,
    imagesJson,
    status: row.status,
    adminReply: row.admin_reply || undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

