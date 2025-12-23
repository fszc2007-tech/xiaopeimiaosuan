/**
 * 聊天消息路由
 * 
 * 路径：/api/v1/chat/messages/*
 * 
 * 参考文档：
 * - app.doc/API接口统一规范.md
 */

import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middleware/auth';
import { getPool } from '../database/connection';
import { ApiResponse } from '../types';
import { registerApi } from '../utils/apiDocs';
import { v4 as uuidv4 } from 'uuid';
import { DISLIKE_REASONS, DislikeReason } from '../modules/chat/feedbackConstants';

const router = Router();

// 所有消息路由都需要认证
router.use(authMiddleware);

// 注册 API 文档
registerApi({
  method: 'POST',
  path: '/api/v1/chat/messages/:messageId/feedback',
  description: '提交消息反馈（点赞/点踩）',
  auth: true,
  request: {
    params: {
      messageId: '消息ID',
    },
    body: {
      conversationId: '对话ID',
      rating: 'up 或 down',
      reasons: '点踩原因列表（仅在 rating 为 down 时，可选）',
      comment: '用户自由文字备注（可选）',
      model: '当前使用的大模型标识（可选）',
      appVersion: 'App版本号（可选）',
      deviceInfo: '设备信息（可选）',
    },
  },
  response: {
    success: { message: '反馈提交成功' },
    error: ['TOKEN_REQUIRED', 'MESSAGE_NOT_FOUND', 'INVALID_RATING', 'INVALID_REASONS', 'ONLY_ASSISTANT_ALLOWED'],
  },
  example: `curl -X POST "http://localhost:3000/api/v1/chat/messages/message_123/feedback" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"conversationId":"conv_123","rating":"down","reasons":["too_generic"],"comment":"内容太空泛"}'`,
});

/**
 * POST /api/v1/chat/messages/:messageId/feedback
 * 提交消息反馈
 */
router.post('/:messageId/feedback', async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.userId!;
  const { messageId } = req.params;
  const { conversationId, rating, reasons, comment, model, appVersion, deviceInfo } = req.body;
  
  const pool = getPool();
  
  try {
    // 1. 验证必填字段
    if (!conversationId || !rating) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: '缺少必要参数：conversationId, rating',
        },
      } as ApiResponse);
    }
    
    // 2. 验证 rating
    if (rating !== 'up' && rating !== 'down') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_RATING',
          message: 'rating 必须是 up 或 down',
        },
      } as ApiResponse);
    }
    
    // 3. 验证 reasons（如果 rating 为 down，reasons 必须存在且为数组）
    if (rating === 'down') {
      if (!Array.isArray(reasons)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_REASONS',
            message: 'rating 为 down 时，reasons 必须为数组',
          },
        } as ApiResponse);
      }
      
      // 验证 reasons 中的值是否在允许的枚举中
      const invalidReasons = reasons.filter((r: string) => !DISLIKE_REASONS.includes(r as DislikeReason));
      if (invalidReasons.length > 0) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_REASONS',
            message: `无效的 reason: ${invalidReasons.join(', ')}`,
          },
        } as ApiResponse);
      }
    }
    
    // 4. 验证消息是否存在且属于当前用户
    const [messageRows] = await pool.query<any[]>(
      `SELECT m.message_id, m.role, m.conversation_id, c.user_id
       FROM messages m
       INNER JOIN conversations c ON m.conversation_id = c.conversation_id
       WHERE m.message_id = ? AND c.user_id = ?`,
      [messageId, userId]
    );
    
    if (messageRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'MESSAGE_NOT_FOUND',
          message: '消息不存在或无权访问',
        },
      } as ApiResponse);
    }
    
    const message = messageRows[0];
    
    // 5. 只允许对 assistant 消息提交反馈
    if (message.role !== 'assistant') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ONLY_ASSISTANT_ALLOWED',
          message: '只能对助手消息提交反馈',
        },
      } as ApiResponse);
    }
    
    // 6. 验证 conversationId 是否匹配
    if (message.conversation_id !== conversationId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CONVERSATION',
          message: 'conversationId 与消息所属对话不匹配',
        },
      } as ApiResponse);
    }
    
    // 7. 检查是否已存在反馈
    const [existingRows] = await pool.query<any[]>(
      `SELECT feedback_id FROM chat_message_feedback 
       WHERE user_id = ? AND message_id = ?`,
      [userId, messageId]
    );
    
    const finalReasons = rating === 'up' ? JSON.stringify([]) : JSON.stringify(reasons || []);
    
    if (existingRows.length > 0) {
      // 更新已存在的反馈
      await pool.query(
        `UPDATE chat_message_feedback 
         SET rating = ?, reasons = ?, comment = ?, model = ?, app_version = ?, device_info = ?, updated_at = NOW()
         WHERE user_id = ? AND message_id = ?`,
        [
          rating,
          finalReasons,
          comment || null,
          model || null,
          appVersion || null,
          deviceInfo || null,
          userId,
          messageId,
        ]
      );
    } else {
      // 插入新反馈
      const feedbackId = uuidv4();
      await pool.query(
        `INSERT INTO chat_message_feedback 
         (feedback_id, user_id, conversation_id, message_id, rating, reasons, comment, model, app_version, device_info, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          feedbackId,
          userId,
          conversationId,
          messageId,
          rating,
          finalReasons,
          comment || null,
          model || null,
          appVersion || null,
          deviceInfo || null,
        ]
      );
    }
    
    res.json({
      success: true,
      data: {},
    } as ApiResponse);
  } catch (error: any) {
    console.error('[Chat Feedback] Error:', error);
    next(error);
  }
});

export default router;

