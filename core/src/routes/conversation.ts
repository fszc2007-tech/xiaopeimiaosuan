/**
 * 对话路由
 * 
 * 路径：/api/v1/chat/conversations/*
 * 
 * 参考文档：
 * - app.doc/features/我的-二级-内容查看页面设计文档.md
 * - app.doc/API接口统一规范.md
 */

import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middleware/auth';
import { createRateLimitMiddleware } from '../middleware/rateLimit';
import * as conversationService from '../modules/conversation/conversationService';
import * as aiService from '../modules/ai/aiService';
import * as readingService from '../modules/reading/readingService';
import * as promptTemplates from '../modules/prompt/promptTemplates';
import { resolveFollowupScene } from '../modules/prompt/followups/followupScenes';
import { buildFallbackFollowups, FollowupQuestion } from '../modules/prompt/followups/buildFollowupPrompt';
import { getPool } from '../database/connection';
import { ApiResponse } from '../types';
import { registerApi } from '../utils/apiDocs';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// 取消标志存储（内存 Map）
const cancelFlags = new Map<string, boolean>();

// 所有对话路由都需要认证
router.use(authMiddleware);

// 注册 API 文档
registerApi({
  method: 'GET',
  path: '/api/v1/chat/conversations',
  description: '获取对话列表',
  auth: true,
  request: {
    query: {
      masterIds: '命主ID列表（逗号分隔，可选）',
      dateFilter: 'today/week/month/all（可选，默认all）',
      page: '页码（可选，默认1）',
      pageSize: '每页数量（可选，默认20）',
    },
  },
  response: {
    success: {
      items: [
        {
          conversationId: 'string',
          masterId: 'string',
          masterName: 'string',
          topic: 'string',
          firstQuestion: 'string',
          lastMessagePreview: 'string',
          createdAt: 'Date',
          updatedAt: 'Date',
          dateLabel: '今天/昨天/11月15日',
        },
      ],
      total: 100,
    },
    error: ['TOKEN_REQUIRED', 'INVALID_TOKEN'],
  },
  example: `curl -X GET "http://localhost:3000/api/v1/chat/conversations?page=1&pageSize=20" \\
  -H "Authorization: Bearer YOUR_TOKEN"`,
});

registerApi({
  method: 'GET',
  path: '/api/v1/chat/conversations/:conversationId',
  description: '获取对话详情（消息列表）',
  auth: true,
  request: {
    params: {
      conversationId: '对话ID',
    },
    query: {
      page: '页码（可选，默认1）',
      pageSize: '每页数量（可选，默认50）',
    },
  },
  response: {
    success: {
      conversation: {
        conversationId: 'string',
        masterId: 'string',
        masterName: 'string',
        topic: 'string',
        createdAt: 'Date',
      },
      messages: [
        {
          messageId: 'string',
          role: 'user/assistant',
          content: 'string',
          timestamp: 'Date',
        },
      ],
      total: 50,
    },
    error: ['TOKEN_REQUIRED', 'CONVERSATION_NOT_FOUND'],
  },
});

registerApi({
  method: 'DELETE',
  path: '/api/v1/chat/conversations/:conversationId',
  description: '删除对话',
  auth: true,
  request: {
    params: {
      conversationId: '对话ID',
    },
  },
  response: {
    success: { message: '删除成功' },
    error: ['TOKEN_REQUIRED', 'CONVERSATION_NOT_FOUND', 'PERMISSION_DENIED'],
  },
});

registerApi({
  method: 'GET',
  path: '/api/v1/chat/conversations/filters/masters',
  description: '获取命主列表（用于筛选）',
  auth: true,
  response: {
    success: {
      masters: [
        {
          masterId: 'string',
          masterName: 'string',
          conversationCount: 10,
        },
      ],
    },
    error: ['TOKEN_REQUIRED'],
  },
});

registerApi({
  method: 'POST',
  path: '/api/v1/chat/conversations/:conversationId/messages',
  description: '发送消息（SSE 流式响应）',
  auth: true,
  request: {
    params: {
      conversationId: '对话ID（如果为 "new"，则创建新对话）',
    },
    body: {
      message: '用户消息内容',
      chartId: '命盘ID',
      topic: '话题（可选）',
      source: '入口来源（可选）',
      sectionKey: '命盘总览sectionKey（一键解读时传入）',
      shenShaCode: '神煞代码（神煞解读时传入）',
    },
  },
  response: {
    success: 'SSE 流式数据：data: {"type":"chunk","content":"..."}\\ndata: {"type":"done","conversationId":"...","messageId":"..."}',
    error: ['TOKEN_REQUIRED', 'CHART_NOT_FOUND', 'RATE_LIMIT_EXCEEDED'],
  },
  example: `curl -X POST "http://localhost:3000/api/v1/chat/conversations/new/messages" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"message":"我今年桃花运怎么样？","chartId":"chart_123","topic":"peach"}' \\
  --no-buffer`,
});

/**
 * GET /api/v1/conversations
 * 获取对话列表
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const { masterIds, dateFilter, page, pageSize } = req.query;
    
    // 解析 masterIds（逗号分隔）
    const masterIdArray = masterIds 
      ? (masterIds as string).split(',').filter(id => id.trim())
      : [];
    
    const result = await conversationService.getConversations({
      userId,
      masterIds: masterIdArray,
      dateFilter: (dateFilter as any) || 'all',
      page: page ? parseInt(page as string) : 1,
      pageSize: pageSize ? parseInt(pageSize as string) : 20,
    });
    
    res.json({
      success: true,
      data: result,
    } as ApiResponse);
  } catch (error: any) {
    next(error);
  }
});

/**
 * GET /api/v1/conversations/:conversationId
 * 获取对话详情（消息列表）
 */
router.get('/:conversationId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const { conversationId } = req.params;
    const { page, pageSize } = req.query;
    
    const result = await conversationService.getConversationDetail({
      userId,
      conversationId,
      page: page ? parseInt(page as string) : 1,
      pageSize: pageSize ? parseInt(pageSize as string) : 50,
    });
    
    res.json({
      success: true,
      data: result,
    } as ApiResponse);
  } catch (error: any) {
    if (error.message === '对话不存在或无权访问') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CONVERSATION_NOT_FOUND',
          message: '对话不存在或无权访问',
        },
      } as ApiResponse);
    }
    next(error);
  }
});

/**
 * DELETE /api/v1/conversations/:conversationId
 * 删除对话
 */
router.delete('/:conversationId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const { conversationId } = req.params;
    
    await conversationService.deleteConversation({
      userId,
      conversationId,
    });
    
    res.json({
      success: true,
      data: {
        message: '删除成功',
      },
    } as ApiResponse);
  } catch (error: any) {
    if (error.message === '对话不存在或无权删除') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CONVERSATION_NOT_FOUND',
          message: '对话不存在或无权删除',
        },
      } as ApiResponse);
    }
    next(error);
  }
});

/**
 * GET /api/v1/conversations/filters/masters
 * 获取命主列表（用于筛选）
 */
router.get('/filters/masters', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    
    const masters = await conversationService.getMastersForFilter({ userId });
    
    res.json({
      success: true,
      data: { masters },
    } as ApiResponse);
  } catch (error: any) {
    next(error);
  }
});

/**
 * POST /api/v1/chat/conversations/:conversationId/cancel
 * 取消正在生成的对话
 */
router.post('/:conversationId/cancel', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { conversationId } = req.params;
    const userId = req.userId!;
    
    // 验证对话是否属于当前用户
    const pool = getPool();
    const [convRows] = await pool.query<any[]>(
      'SELECT conversation_id FROM conversations WHERE conversation_id = ? AND user_id = ?',
      [conversationId, userId]
    );
    
    if (convRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CONVERSATION_NOT_FOUND',
          message: '对话不存在或无权访问',
        },
      } as ApiResponse);
    }
    
    // 设置取消标志
    cancelFlags.set(conversationId, true);
    console.log(`[Chat] Cancel flag set for conversation ${conversationId}`);
    
    res.json({
      success: true,
      data: { message: '取消请求已发送' },
    } as ApiResponse);
  } catch (error: any) {
    next(error);
  }
});

/**
 * POST /api/v1/chat/conversations/:conversationId/messages
 * 发送消息（SSE 流式响应，含限流）
 */
router.post('/:conversationId/messages', createRateLimitMiddleware('chat'), async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.userId!;
  const { conversationId: conversationIdParam } = req.params;
  const { message, chartId, topic, source, sectionKey, shenShaCode } = req.body;
  
  if (!message || !chartId) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_INPUT',
        message: '缺少必要参数：message, chartId',
      },
    } as ApiResponse);
  }
  
  const pool = getPool();
  let conversationId = conversationIdParam;
  let userMessageId: string;
  let assistantMessageId: string;
  
  try {
    // 1. 验证命盘是否存在且属于当前用户
    const [chartRows] = await pool.query<any[]>(
      `SELECT cp.chart_profile_id, cp.user_id, cp.name 
       FROM chart_profiles cp 
       WHERE cp.chart_profile_id = ? AND cp.user_id = ?`,
      [chartId, userId]
    );
    
    if (chartRows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CHART_NOT_FOUND',
          message: '命盘不存在或无权访问',
        },
      } as ApiResponse);
    }
    
    const chartProfile = chartRows[0];
    
    // 2. 创建或获取对话
    if (conversationId === 'new') {
      conversationId = uuidv4();
      const title = message.substring(0, 50) + (message.length > 50 ? '...' : '');
      
      // ✅ 完整处理：字段已通过 Migration 043 添加，直接使用
      await pool.query(
        `INSERT INTO conversations 
        (conversation_id, user_id, chart_profile_id, topic, source, first_question, title, created_at, updated_at, last_message_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())`,
        [conversationId, userId, chartId, topic || null, source || null, message, title]
      );
    } else {
      // 验证对话是否存在且属于当前用户
      const [convRows] = await pool.query<any[]>(
        'SELECT conversation_id FROM conversations WHERE conversation_id = ? AND user_id = ?',
        [conversationId, userId]
      );
      
      if (convRows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'CONVERSATION_NOT_FOUND',
            message: '对话不存在或无权访问',
          },
        } as ApiResponse);
      }
    }
    
    // 3. 存储用户消息
    userMessageId = uuidv4();
    await pool.query(
      `INSERT INTO messages (message_id, conversation_id, role, content, created_at) 
       VALUES (?, ?, 'user', ?, NOW())`,
      [userMessageId, conversationId, message]
    );
    
    // 4. 更新对话的最后消息时间
    await pool.query(
      'UPDATE conversations SET last_message_at = NOW(), updated_at = NOW() WHERE conversation_id = ?',
      [conversationId]
    );
    
    // 5. 设置 SSE 响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // 禁用 nginx 缓冲
    res.flushHeaders();
    
    // 6. 获取命盘数据
    const [chartDataRows] = await pool.query<any[]>(
      'SELECT result_json FROM bazi_charts WHERE chart_profile_id = ?',
      [chartId]
    );
    
    if (chartDataRows.length === 0) {
      // 发送错误事件
      res.write(`data: ${JSON.stringify({ type: 'error', message: '命盘数据不存在' })}\n\n`);
      res.end();
      return;
    }
    
    const chartResult = JSON.parse(chartDataRows[0].result_json);
    
    // 7. 获取对话历史（排除当前刚插入的用户消息）
    const [historyRows]: any = await pool.query(
      `SELECT role, content FROM messages 
       WHERE conversation_id = ? AND message_id != ?
       ORDER BY created_at ASC
       LIMIT 20`,
      [conversationId, userMessageId]
    );
    
    const conversationHistory = historyRows.map((row: any) => ({
      role: row.role,
      content: row.content,
    }));
    
    // 8. 构建 LLM 消息（使用统一的 prompt 模板）
    // 如果有 sectionKey 或 shenShaCode，使用卡片模式；否则根据 topic 选择模式
    let userPrompt: string;
    let systemPrompt: string;
    
    // 调试日志：确认模式选择
    console.log(`[Chat] Mode selection - topic: ${topic}, sectionKey: ${sectionKey}, shenShaCode: ${shenShaCode}, message: ${message.substring(0, 50)}...`);
    
    // 判断是否为恋爱专线（支持 'love' 和 'LOVE' 两种格式）
    const isLoveTopic = topic && (topic.toLowerCase() === 'love' || topic === 'LOVE');
    
    // 判断是否为考试专线（支持 'exam' 和 'EXAM' 两种格式）
    const isExamTopic = topic && (topic.toLowerCase() === 'exam' || topic === 'EXAM');
    
    // 判断是否为婚姻专线（支持 'marriage' 和 'MARRIAGE' 两种格式）
    const isMarriageTopic = topic && (topic.toLowerCase() === 'marriage' || topic === 'MARRIAGE');
    
    // 判断是否为婆媳关系专线（支持 'family'、'FAMILY'、'inlaw' 和 'INLAW' 四种格式）
    const isInLawTopic = topic && (
      topic.toLowerCase() === 'family' || 
      topic === 'FAMILY' || 
      topic.toLowerCase() === 'inlaw' || 
      topic === 'INLAW'
    );
    
    // 判断是否为工作跳槽专线（支持 'job'、'JOB'、'jobchange' 和 'JOBCHANGE' 四种格式）
    const isJobChangeTopic = topic && (
      topic.toLowerCase() === 'job' || 
      topic === 'JOB' || 
      topic.toLowerCase() === 'jobchange' || 
      topic === 'JOBCHANGE'
    );
    
    // 判断是否为投资理财专线（支持 'invest'、'INVEST'、'wealth'、'WEALTH' 四种格式）
    const isInvestTopic = topic && (
      topic.toLowerCase() === 'invest' || 
      topic === 'INVEST' || 
      topic.toLowerCase() === 'wealth' || 
      topic === 'WEALTH'
    );
    
    if (isLoveTopic) {
      // 恋爱专线模式：使用恋爱专用 prompt
      console.log(`[Chat] Using LOVE topic mode`);
      
      // 判断是否为首次消息
      const [messageCountRows]: any = await pool.query(
        `SELECT COUNT(*) as count FROM messages 
         WHERE conversation_id = ? AND role = 'user' AND message_id != ?`,
        [conversationId, userMessageId]
      );
      const isFirstMessage = messageCountRows[0].count === 0;
      
      // 使用 LoveDataService 构建 LoveChatContext
      const { buildLoveChatContextForChart } = await import('../modules/love/loveDataService');
      const loveChatContext = await buildLoveChatContextForChart({
        chartProfileId: chartId,
        userQuestion: message,
      });
      
      // 构建恋爱专线 prompt
      userPrompt = promptTemplates.XIAOPEI_PROMPT_LOVE
        .replace('{{LOVE_CHAT_CONTEXT_JSON}}', JSON.stringify(loveChatContext, null, 2))
        .replace('{{USER_QUESTION}}', message)
        .replace('{{IS_FIRST_MESSAGE}}', isFirstMessage ? 'true' : 'false');
      
      systemPrompt = promptTemplates.XIAOPEI_SYSTEM_PROMPT_CHAT;
      // ❌ 不再拼接 XIAOPEI_OUTPUT_STYLE（恋爱专线已有内置格式要求）
    } else if (isExamTopic) {
      // 考试专线模式：使用考试专用 prompt
      console.log(`[Chat] Using EXAM topic mode`);
      
      // 判断是否为首次消息
      const [messageCountRows]: any = await pool.query(
        `SELECT COUNT(*) as count FROM messages 
         WHERE conversation_id = ? AND role = 'user' AND message_id != ?`,
        [conversationId, userMessageId]
      );
      const isFirstMessage = messageCountRows[0].count === 0;
      
      // 使用 ExamDataService 构建 ExamChatContext
      const { buildExamChatContextForChart } = await import('../modules/exam/examDataService');
      const examChatContext = await buildExamChatContextForChart({
        chartProfileId: chartId,
        userQuestion: message,
      });
      
      // 构建考试专线 prompt
      userPrompt = promptTemplates.XIAOPEI_PROMPT_EXAM
        .replace('{{EXAM_CHAT_CONTEXT_JSON}}', JSON.stringify(examChatContext, null, 2))
        .replace('{{USER_QUESTION}}', message)
        .replace('{{IS_FIRST_MESSAGE}}', isFirstMessage ? 'true' : 'false');
      
      systemPrompt = promptTemplates.XIAOPEI_SYSTEM_PROMPT_CHAT;
      // ❌ 不再拼接 XIAOPEI_OUTPUT_STYLE（考试专线已有内置格式要求）
    } else if (isMarriageTopic) {
      // 婚姻专线模式：使用婚姻专用 prompt
      console.log(`[Chat] Using MARRIAGE topic mode`);
      
      // 判断是否为首次消息
      const [messageCountRows]: any = await pool.query(
        `SELECT COUNT(*) as count FROM messages 
         WHERE conversation_id = ? AND role = 'user' AND message_id != ?`,
        [conversationId, userMessageId]
      );
      const isFirstMessage = messageCountRows[0].count === 0;
      
      // 使用 MarriageDataService 构建 MarriageChatContext
      const { buildMarriageChatContextForChart } = await import('../modules/marriage/marriageDataService');
      const marriageChatContext = await buildMarriageChatContextForChart({
        chartProfileId: chartId,
        userQuestion: message,
      });
      
      // 构建婚姻专线 prompt
      userPrompt = promptTemplates.XIAOPEI_PROMPT_MARRIAGE
        .replace('{{MARRIAGE_CHAT_CONTEXT_JSON}}', JSON.stringify(marriageChatContext, null, 2))
        .replace('{{USER_QUESTION}}', message)
        .replace('{{IS_FIRST_MESSAGE}}', isFirstMessage ? 'true' : 'false');
      
      systemPrompt = promptTemplates.XIAOPEI_SYSTEM_PROMPT_CHAT;
      // ❌ 不再拼接 XIAOPEI_OUTPUT_STYLE（婚姻专线已有内置格式要求）
    } else if (isInLawTopic) {
      // 婆媳关系专线模式：使用婆媳关系专用 prompt
      console.log(`[Chat] Using INLAW topic mode`);
      
      // 判断是否为首次消息
      const [messageCountRows]: any = await pool.query(
        `SELECT COUNT(*) as count FROM messages 
         WHERE conversation_id = ? AND role = 'user' AND message_id != ?`,
        [conversationId, userMessageId]
      );
      const isFirstMessage = messageCountRows[0].count === 0;
      
      // 使用 InLawDataService 构建 InLawChatContext
      const { buildInLawChatContextForChart } = await import('../modules/inlaw/inlawDataService');
      const inLawChatContext = await buildInLawChatContextForChart({
        chartProfileId: chartId,
        userQuestion: message,
      });
      
      // 构建婆媳关系专线 prompt
      userPrompt = promptTemplates.XIAOPEI_PROMPT_INLAW
        .replace('{{INLAW_CHAT_CONTEXT_JSON}}', JSON.stringify(inLawChatContext, null, 2))
        .replace('{{USER_QUESTION}}', message)
        .replace('{{IS_FIRST_MESSAGE}}', isFirstMessage ? 'true' : 'false');
      
      systemPrompt = promptTemplates.XIAOPEI_SYSTEM_PROMPT_CHAT;
      // ❌ 不再拼接 XIAOPEI_OUTPUT_STYLE（婆媳关系专线已有内置格式要求）
    } else if (isJobChangeTopic) {
      // 工作跳槽专线模式：使用工作跳槽专用 prompt
      console.log(`[Chat] Using JOBCHANGE topic mode`);
      
      // 判断是否为首次消息
      const [messageCountRows]: any = await pool.query(
        `SELECT COUNT(*) as count FROM messages 
         WHERE conversation_id = ? AND role = 'user' AND message_id != ?`,
        [conversationId, userMessageId]
      );
      const isFirstMessage = messageCountRows[0].count === 0;
      
      // 使用 JobChangeDataService 构建 JobChangeChatContext
      const { buildJobChangeChatContextForChart } = await import('../modules/jobChange/jobChangeDataService');
      const jobChangeChatContext = await buildJobChangeChatContextForChart({
        chartProfileId: chartId,
        userQuestion: message,
      });
      
      // 构建工作跳槽专线 prompt
      userPrompt = promptTemplates.XIAOPEI_PROMPT_JOB_CHANGE
        .replace('{{JOB_CHANGE_CHAT_CONTEXT_JSON}}', JSON.stringify(jobChangeChatContext, null, 2))
        .replace('{{USER_QUESTION}}', message)
        .replace('{{IS_FIRST_MESSAGE}}', isFirstMessage ? 'true' : 'false');
      
      systemPrompt = promptTemplates.XIAOPEI_SYSTEM_PROMPT_CHAT;
      // ❌ 不再拼接 XIAOPEI_OUTPUT_STYLE（工作跳槽专线已有内置格式要求）
    } else if (isInvestTopic) {
      // 投资理财专线模式：使用投资理财专用 prompt
      console.log(`[Chat] Using INVEST topic mode`);
      
      // 判断是否为首次消息
      const [messageCountRows]: any = await pool.query(
        `SELECT COUNT(*) as count FROM messages 
         WHERE conversation_id = ? AND role = 'user' AND message_id != ?`,
        [conversationId, userMessageId]
      );
      const isFirstMessage = messageCountRows[0].count === 0;
      
      // 使用 InvestDataService 构建 InvestChatContext
      const { buildInvestChatContextForChart } = await import('../modules/invest/investDataService');
      const investChatContext = await buildInvestChatContextForChart({
        chartProfileId: chartId,
        userQuestion: message,
      });
      
      // 构建投资理财专线 prompt
      userPrompt = promptTemplates.XIAOPEI_PROMPT_INVEST
        .replace('{{INVEST_CHAT_CONTEXT_JSON}}', JSON.stringify(investChatContext, null, 2))
        .replace('{{USER_QUESTION}}', message)
        .replace('{{IS_FIRST_MESSAGE}}', isFirstMessage ? 'true' : 'false');
      
      systemPrompt = promptTemplates.XIAOPEI_SYSTEM_PROMPT_CHAT;
      // ❌ 不再拼接 XIAOPEI_OUTPUT_STYLE（投资理财专线已有内置格式要求）
    } else if (sectionKey || shenShaCode) {
      // 卡片模式：使用原 prompt
      console.log(`[Chat] Using CARD mode (sectionKey: ${sectionKey}, shenShaCode: ${shenShaCode})`);
      if (shenShaCode) {
        // 神煞解读模式（如果有专门的接口，这里可能需要调整）
        // 暂时使用 overview prompt
        userPrompt = promptTemplates.buildOverviewPrompt({
          sectionKey: 'shensha',
          userQuestion: message,
          baziData: chartResult,
        });
      } else {
        userPrompt = promptTemplates.buildOverviewPrompt({
          sectionKey: sectionKey!,
          userQuestion: message,
          baziData: chartResult,
        });
      }
      systemPrompt = promptTemplates.XIAOPEI_SYSTEM_PROMPT;
    } else {
      // 聊天模式：使用新的聊天 prompt
      console.log(`[Chat] Using CHAT mode`);
      userPrompt = promptTemplates.buildChatPrompt({
        userQuestion: message,
        baziData: chartResult,
      });
      systemPrompt = promptTemplates.XIAOPEI_SYSTEM_PROMPT_CHAT;
    }
    
    // 构建消息数组
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt },
    ];
    
    // 添加历史对话（以 messages 形式）
    conversationHistory.forEach((msg: any) => {
      messages.push({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      });
    });
    
    // 添加当前问题
    messages.push({ role: 'user', content: userPrompt });
    
    // 9. 调用 LLM（流式）+ AI 次数检查
    console.log(`[Chat] Starting chat stream for conversation ${conversationId}, chartId: ${chartId}`);
    
    let fullResponse = '';
    let isCancelled = false;
    let chunkCount = 0;
    let sentChunkCount = 0;
    
    try {
      // 使用带次数检查的封装函数
      for await (const chunk of aiService.chatStreamWithQuota(userId, {
        request: { messages, temperature: 0.7, maxTokens: 2000 },
      })) {
        chunkCount++;
        
        // 检测取消标志
        if (cancelFlags.get(conversationId)) {
          console.log(`[Chat] Generation cancelled for conversation ${conversationId} at chunk #${chunkCount}`);
          cancelFlags.delete(conversationId);
          isCancelled = true;
          // 删除未完成的对话和消息
          await pool.query('DELETE FROM messages WHERE conversation_id = ?', [conversationId]);
          await pool.query('DELETE FROM conversations WHERE conversation_id = ?', [conversationId]);
          console.log(`[Chat] Deleted conversation and messages for ${conversationId}`);
          break;
        }
        
        // 检测连接断开（备用）
        if (req.aborted || res.destroyed || !res.writable) {
          console.log(`[Chat] Client disconnected for conversation ${conversationId} at chunk #${chunkCount}`);
          isCancelled = true;
          // 删除未完成的对话和消息
          await pool.query('DELETE FROM messages WHERE conversation_id = ?', [conversationId]);
          await pool.query('DELETE FROM conversations WHERE conversation_id = ?', [conversationId]);
          console.log(`[Chat] Deleted conversation and messages for ${conversationId}`);
          break;
        }
        
        if (!chunk.done) {
          fullResponse += chunk.content;
          sentChunkCount++;
          
          if (sentChunkCount <= 3 || sentChunkCount % 50 === 0) {
            console.log(`[Chat] Sending chunk #${sentChunkCount} to client, content length: ${chunk.content.length}, total response length: ${fullResponse.length}`);
          }
          
          // 发送流式数据
          const sseData = JSON.stringify({ type: 'chunk', content: chunk.content });
          res.write(`data: ${sseData}\n\n`);
        } else {
          console.log(`[Chat] Stream done signal received at chunk #${chunkCount}`);
        }
      }
      
      console.log(`[Chat] Stream completed for conversation ${conversationId}, total chunks: ${chunkCount}, sent chunks: ${sentChunkCount}, final response length: ${fullResponse.length}`);
      
      // 如果已取消，不保存数据
      if (isCancelled) {
        res.end();
        return;
      }
      
      // 9. 存储 AI 回复
      assistantMessageId = uuidv4();
      await pool.query(
        `INSERT INTO messages (message_id, conversation_id, role, content, created_at) 
         VALUES (?, ?, 'assistant', ?, NOW())`,
        [assistantMessageId, conversationId, fullResponse]
      );
      
      // 9.5. 更新对话的最后消息预览和时间
      const preview = fullResponse.substring(0, 100) + (fullResponse.length > 100 ? '...' : '');
      await pool.query(
        `UPDATE conversations 
         SET last_message_preview = ?, last_message_at = NOW(), updated_at = NOW() 
         WHERE conversation_id = ?`,
        [preview, conversationId]
      );
      
      // 10. 生成追问建议（仅对正常解读生成，错误/系统提示不生成）
      // 判断是否为正常解读：排除错误消息、系统提示等
      const isErrorOrSystemMessage = 
        fullResponse.includes('命盘数据尚未生成') ||
        fullResponse.includes('系统繁忙') ||
        fullResponse.includes('请稍后再试') ||
        (fullResponse.includes('错误') && fullResponse.length < 100) || // 只有短消息且包含"错误"才过滤
        fullResponse.length < 20;  // 太短的回复可能是错误提示

      // 等待追问生成完成后再发送 done 事件和关闭流
      let followupsGenerated = false;
      
      if (!isErrorOrSystemMessage) {
        const scene = resolveFollowupScene({ topic, sectionKey, shenShaCode });
        console.log(`[Follow-ups] Starting generation for scene: ${scene}, conversationId: ${conversationId}`);
        
        try {
          // 使用 Promise.race 设置超时（5秒），避免无限等待
          const followupsPromise = readingService.generateFollowUps({
            scene,
            topic,
            sectionKey,
            shenShaCode,
            userQuestion: message,
            readingText: fullResponse,
            conversationId,
          });
          
          const timeoutPromise = new Promise<FollowupQuestion[]>((resolve) => {
            setTimeout(() => {
              console.warn('[Follow-ups] Generation timeout after 5s, using fallback');
              // 超时后使用兜底模板
              const fallbackFollowups = buildFallbackFollowups(scene);
              resolve(fallbackFollowups);
            }, 5000);
          });
          
          const followups = await Promise.race([followupsPromise, timeoutPromise]);
          followupsGenerated = true;
          
          console.log(`[Follow-ups] Generated ${followups?.length || 0} followups:`, followups);
          
          if (followups && followups.length > 0) {
            // 保存追问到数据库（messages 表的 follow_ups 字段）
            await pool.query(
              `UPDATE messages SET follow_ups = ? WHERE message_id = ?`,
              [JSON.stringify(followups), assistantMessageId]
            );
            console.log(`[Follow-ups] Saved to database for messageId: ${assistantMessageId}`);
            
            // 通过 SSE 发送追问给前端（确保在 res.end() 之前）
            if (!res.destroyed && res.writable && !res.finished) {
              const followupsEvent = JSON.stringify({ 
                type: 'followups', 
                followups,
              });
              res.write(`data: ${followupsEvent}\n\n`);
              console.log(`[Follow-ups] Sent SSE event:`, followupsEvent);
            } else {
              console.warn(`[Follow-ups] Response stream already closed (destroyed: ${res.destroyed}, writable: ${res.writable}, finished: ${res.finished}), cannot send followups`);
            }
          } else {
            console.warn(`[Follow-ups] No followups generated or empty array`);
          }
        } catch (err: any) {
          console.error('[Follow-ups] Generation failed:', err);
          console.error('[Follow-ups] Error stack:', err.stack);
          // 生成失败不影响主流程，继续执行
          followupsGenerated = true; // 标记为已完成，避免无限等待
        }
      } else {
        console.log(`[Follow-ups] Skipping generation for error/system message`);
        followupsGenerated = true; // 跳过生成，直接标记为完成
      }
      
      // 确保追问生成完成后再发送 done 事件
      if (!followupsGenerated) {
        console.warn('[Follow-ups] Followups generation not completed, but continuing anyway');
      }
      
      // 11. 发送完成事件
      if (!res.destroyed && res.writable && !res.finished) {
        res.write(`data: ${JSON.stringify({ 
          type: 'done', 
          conversationId,
          messageId: assistantMessageId,
        })}\n\n`);
        res.end();
        console.log(`[SSE] Sent done event and closed stream`);
      } else {
        console.warn(`[SSE] Cannot send done event (destroyed: ${res.destroyed}, writable: ${res.writable}, finished: ${res.finished})`);
        if (!res.finished) {
          res.end();
        }
      }
      
      // 清理取消标志（如果存在）
      cancelFlags.delete(conversationId);
      
    } catch (error: any) {
      console.error('[Chat Stream] Error:', error);
      res.write(`data: ${JSON.stringify({ type: 'error', message: error.message || '服务器错误' })}\n\n`);
      res.end();
      // 清理取消标志
      cancelFlags.delete(conversationId);
    }
    
  } catch (error: any) {
    console.error('[Send Message] Error:', error);
    // 清理取消标志
    cancelFlags.delete(conversationId);
    
    // 檢查是否為 AI 次數限制錯誤
    if (error.name === 'AiLimitReachedError') {
      if (!res.headersSent) {
        return res.status(429).json({
          success: false,
          error: {
            code: 'AI_DAILY_LIMIT_REACHED',
            message: '今日解讀次數已用完',
            details: {
              limit: error.limit,
              used: error.limit,
              remaining: 0,
            },
          },
        } as ApiResponse);
      } else {
        res.write(`data: ${JSON.stringify({ 
          type: 'error', 
          code: 'AI_DAILY_LIMIT_REACHED',
          message: '今日解讀次數已用完',
          details: {
            limit: error.limit,
            used: error.limit,
            remaining: 0,
          }
        })}\n\n`);
        res.end();
      }
      return;
    }
    
    // 其他錯誤
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error.message || '服务器错误',
        },
      } as ApiResponse);
    } else {
      res.write(`data: ${JSON.stringify({ type: 'error', message: error.message || '服务器错误' })}\n\n`);
      res.end();
    }
  }
});

export default router;

