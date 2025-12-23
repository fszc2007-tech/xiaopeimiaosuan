"use strict";
/**
 * 聊天消息路由
 *
 * 路径：/api/v1/chat/messages/*
 *
 * 参考文档：
 * - app.doc/API接口统一规范.md
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const connection_1 = require("../database/connection");
const apiDocs_1 = require("../utils/apiDocs");
const uuid_1 = require("uuid");
const feedbackConstants_1 = require("../modules/chat/feedbackConstants");
const router = (0, express_1.Router)();
// 所有消息路由都需要认证
router.use(auth_1.authMiddleware);
// 注册 API 文档
(0, apiDocs_1.registerApi)({
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
router.post('/:messageId/feedback', async (req, res, next) => {
    const userId = req.userId;
    const { messageId } = req.params;
    const { conversationId, rating, reasons, comment, model, appVersion, deviceInfo } = req.body;
    const pool = (0, connection_1.getPool)();
    try {
        // 1. 验证必填字段
        if (!conversationId || !rating) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_INPUT',
                    message: '缺少必要参数：conversationId, rating',
                },
            });
        }
        // 2. 验证 rating
        if (rating !== 'up' && rating !== 'down') {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_RATING',
                    message: 'rating 必须是 up 或 down',
                },
            });
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
                });
            }
            // 验证 reasons 中的值是否在允许的枚举中
            const invalidReasons = reasons.filter((r) => !feedbackConstants_1.DISLIKE_REASONS.includes(r));
            if (invalidReasons.length > 0) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_REASONS',
                        message: `无效的 reason: ${invalidReasons.join(', ')}`,
                    },
                });
            }
        }
        // 4. 验证消息是否存在且属于当前用户
        const [messageRows] = await pool.query(`SELECT m.message_id, m.role, m.conversation_id, c.user_id
       FROM messages m
       INNER JOIN conversations c ON m.conversation_id = c.conversation_id
       WHERE m.message_id = ? AND c.user_id = ?`, [messageId, userId]);
        if (messageRows.length === 0) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'MESSAGE_NOT_FOUND',
                    message: '消息不存在或无权访问',
                },
            });
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
            });
        }
        // 6. 验证 conversationId 是否匹配
        if (message.conversation_id !== conversationId) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_CONVERSATION',
                    message: 'conversationId 与消息所属对话不匹配',
                },
            });
        }
        // 7. 检查是否已存在反馈
        const [existingRows] = await pool.query(`SELECT feedback_id FROM chat_message_feedback 
       WHERE user_id = ? AND message_id = ?`, [userId, messageId]);
        const finalReasons = rating === 'up' ? JSON.stringify([]) : JSON.stringify(reasons || []);
        if (existingRows.length > 0) {
            // 更新已存在的反馈
            await pool.query(`UPDATE chat_message_feedback 
         SET rating = ?, reasons = ?, comment = ?, model = ?, app_version = ?, device_info = ?, updated_at = NOW()
         WHERE user_id = ? AND message_id = ?`, [
                rating,
                finalReasons,
                comment || null,
                model || null,
                appVersion || null,
                deviceInfo || null,
                userId,
                messageId,
            ]);
        }
        else {
            // 插入新反馈
            const feedbackId = (0, uuid_1.v4)();
            await pool.query(`INSERT INTO chat_message_feedback 
         (feedback_id, user_id, conversation_id, message_id, rating, reasons, comment, model, app_version, device_info, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`, [
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
            ]);
        }
        res.json({
            success: true,
            data: {},
        });
    }
    catch (error) {
        console.error('[Chat Feedback] Error:', error);
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=chatMessages.js.map