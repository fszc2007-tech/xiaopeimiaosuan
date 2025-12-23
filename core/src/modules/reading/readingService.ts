/**
 * 解读服务
 * 
 * 负责命理解读的编排和调用
 */

import { v4 as uuidv4 } from 'uuid';
import { getPool } from '../../database/connection';
import * as aiService from '../ai/aiService';
import { LLMModel, LLMMessage } from '../ai/types';
import * as promptTemplates from '../prompt/promptTemplates';
import { buildFollowupPrompt, buildFallbackFollowups, FollowupQuestion, FollowupType } from '../prompt/followups/buildFollowupPrompt';
import { resolveFollowupScene, FollowupScene } from '../prompt/followups/followupScenes';

/**
 * 神煞解读
 */
export async function readShensha(params: {
  userId: string;
  chartId: string;
  shenshaCode: string;
  shenshaName: string;
  userQuestion?: string;
  model?: LLMModel;
}): Promise<{
  displayText: string;
  thinkingContent?: string;
}> {
  const { userId, chartId, shenshaCode, shenshaName, userQuestion, model } = params;
  
  const pool = getPool();
  
  // 1. 获取命盘数据
  const [chartRows]: any = await pool.execute(
    `SELECT bc.result_json 
     FROM bazi_charts bc
     JOIN chart_profiles cp ON bc.chart_profile_id = cp.chart_profile_id
     WHERE bc.chart_id = ? AND cp.user_id = ?`,
    [chartId, userId]
  );
  
  if (chartRows.length === 0) {
    throw new Error('命盘不存在');
  }
  
  const baziData = JSON.parse(chartRows[0].result_json);
  
  // 2. 构建 Prompt
  const prompt = promptTemplates.buildShenshaPrompt({
    shenshaCode,
    shenshaName,
    userQuestion: userQuestion || `请帮我解读一下「${shenshaName}」在我命盘中的含义`,
    baziData,
  });
  
  // 3. 调用 LLM
  const messages: LLMMessage[] = [
    { role: 'system', content: promptTemplates.XIAOPEI_SYSTEM_PROMPT },
    { role: 'user', content: prompt },
  ];
  
  const llmModel = model || await aiService.getDefaultModel();
  const response = await aiService.chat({
    model: llmModel,
    request: { messages, temperature: 0.7, maxTokens: 800 },
  });
  
  // 4. 保存解读记录
  await pool.execute(
    `INSERT INTO readings (reading_id, user_id, chart_id, scene, question, result_text)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      uuidv4(),
      userId,
      chartId,
      `shensha:${shenshaCode}`,
      userQuestion || `解读神煞：${shenshaName}`,
      response.content,
    ]
  );
  
  return {
    displayText: response.content,
    thinkingContent: response.thinkingContent,
  };
}

/**
 * 命盘总览解读
 */
export async function readOverview(params: {
  userId: string;
  chartId: string;
  sectionKey: string;
  userQuestion?: string;
  model?: LLMModel;
}): Promise<{
  displayText: string;
  thinkingContent?: string;
}> {
  const { userId, chartId, sectionKey, userQuestion, model } = params;
  
  const pool = getPool();
  
  // 1. 获取命盘数据
  const [chartRows]: any = await pool.execute(
    `SELECT bc.result_json 
     FROM bazi_charts bc
     JOIN chart_profiles cp ON bc.chart_profile_id = cp.chart_profile_id
     WHERE bc.chart_id = ? AND cp.user_id = ?`,
    [chartId, userId]
  );
  
  if (chartRows.length === 0) {
    throw new Error('命盘不存在');
  }
  
  const baziData = JSON.parse(chartRows[0].result_json);
  
  // 2. 构建 Prompt
  const prompt = promptTemplates.buildOverviewPrompt({
    sectionKey,
    userQuestion: userQuestion || `请帮我解读一下这部分内容`,
    baziData,
  });
  
  // 3. 调用 LLM
  const messages: LLMMessage[] = [
    { role: 'system', content: promptTemplates.XIAOPEI_SYSTEM_PROMPT },
    { role: 'user', content: prompt },
  ];
  
  const llmModel = model || await aiService.getDefaultModel();
  const response = await aiService.chat({
    model: llmModel,
    request: { messages, temperature: 0.7, maxTokens: 1000 },
  });
  
  // 4. 保存解读记录
  await pool.execute(
    `INSERT INTO readings (reading_id, user_id, chart_id, scene, question, result_text)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      uuidv4(),
      userId,
      chartId,
      `overview:${sectionKey}`,
      userQuestion || `解读总览：${sectionKey}`,
      response.content,
    ]
  );
  
  return {
    displayText: response.content,
    thinkingContent: response.thinkingContent,
  };
}

/**
 * 通用解读（聊天）
 */
export async function readGeneral(params: {
  userId: string;
  chartId: string;
  userQuestion: string;
  conversationId?: string;
  model?: LLMModel;
}): Promise<{
  displayText: string;
  thinkingContent?: string;
  conversationId: string;
  messageId: string;
}> {
  const { userId, chartId, userQuestion, conversationId, model } = params;
  
  const pool = getPool();
  
  // 1. 获取命盘数据
  const [chartRows]: any = await pool.execute(
    `SELECT bc.result_json, cp.chart_profile_id 
     FROM bazi_charts bc
     JOIN chart_profiles cp ON bc.chart_profile_id = cp.chart_profile_id
     WHERE bc.chart_id = ? AND cp.user_id = ?`,
    [chartId, userId]
  );
  
  if (chartRows.length === 0) {
    throw new Error('命盘不存在');
  }
  
  const baziData = JSON.parse(chartRows[0].result_json);
  const chartProfileId = chartRows[0].chart_profile_id;
  
  // 2. 获取或创建对话
  let convId = conversationId;
  
  if (!convId) {
    convId = uuidv4();
    await pool.execute(
      `INSERT INTO conversations (conversation_id, user_id, chart_profile_id, first_question)
       VALUES (?, ?, ?, ?)`,
      [convId, userId, chartProfileId, userQuestion]
    );
  }
  
  // 3. 获取对话历史
  const [historyRows]: any = await pool.execute(
    `SELECT role, content FROM messages 
     WHERE conversation_id = ?
     ORDER BY created_at ASC
     LIMIT 10`,
    [convId]
  );
  
  const conversationHistory = historyRows.map((row: any) => ({
    role: row.role,
    content: row.content,
  }));
  
  // 4. 构建聊天 Prompt（只传摘要 + 问题，不传历史文本）
  const prompt = promptTemplates.buildChatPrompt({
    userQuestion,
    baziData,
  });
  
  // 5. 调用 LLM（使用聊天专用 system prompt）
  const messages: LLMMessage[] = [
    { role: 'system', content: promptTemplates.XIAOPEI_SYSTEM_PROMPT_CHAT },
  ];
  
  // 添加历史对话（以 messages 形式）
  conversationHistory.forEach((msg: any) => {
    messages.push({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    });
  });
  
  // 添加当前问题（包含命盘摘要）
  messages.push({ role: 'user', content: prompt });
  
  const llmModel = model || await aiService.getDefaultModel();
  const response = await aiService.chat({
    model: llmModel,
    request: { messages, temperature: 0.7, maxTokens: 1200 },
  });
  
  // 6. 保存用户消息
  const userMessageId = uuidv4();
  await pool.execute(
    `INSERT INTO messages (message_id, conversation_id, role, content)
     VALUES (?, ?, 'user', ?)`,
    [userMessageId, convId, userQuestion]
  );
  
  // 7. 保存 AI 回复
  const assistantMessageId = uuidv4();
  await pool.execute(
    `INSERT INTO messages (message_id, conversation_id, role, content)
     VALUES (?, ?, 'assistant', ?)`,
    [assistantMessageId, convId, response.content]
  );
  
  // 8. 更新对话的最后消息预览
  await pool.execute(
    `UPDATE conversations 
     SET last_message_preview = ?, updated_at = NOW()
     WHERE conversation_id = ?`,
    [response.content.slice(0, 100), convId]
  );
  
  // 9. 保存解读记录
  await pool.execute(
    `INSERT INTO readings (reading_id, user_id, chart_id, scene, question, result_text)
     VALUES (?, ?, ?, 'general', ?, ?)`,
    [uuidv4(), userId, chartId, userQuestion, response.content]
  );
  
  return {
    displayText: response.content,
    thinkingContent: response.thinkingContent,
    conversationId: convId,
    messageId: assistantMessageId,
  };
}

/**
 * 生成追问建议（升级版）
 * 
 * 统一入口：所有场景的追问都通过此函数生成
 * 
 * @param params.scene - 追问场景（已解析好的 FollowupScene，如果未提供则从 topic/sectionKey 解析）
 * @param params.topic - 场景卡片标识（可选，用于自动解析 scene）
 * @param params.sectionKey - 命盘卡片标识（可选，用于自动解析 scene）
 * @param params.shenShaCode - 神煞代码（可选，用于自动解析 scene）
 * @param params.userQuestion - 用户本轮提问
 * @param params.readingText - AI 刚刚给出的完整解读文本
 * @param params.conversationId - 对话 ID（用于查询历史追问）
 * @param params.model - LLM 模型（可选，默认使用系统默认模型）
 * @returns 3 个追问问题（curiosity / warning / action），按固定顺序返回
 * 
 * 向后兼容：如果只传入 lastUserQuestion 和 lastAssistantResponse，会自动适配
 */
export async function generateFollowUps(params: {
  scene?: FollowupScene;
  topic?: string;
  sectionKey?: string;
  shenShaCode?: string;
  userQuestion?: string;
  readingText?: string;
  conversationId?: string;
  model?: LLMModel;
  // 向后兼容的旧参数
  lastUserQuestion?: string;
  lastAssistantResponse?: string;
}): Promise<FollowupQuestion[]> {
  const {
    scene: providedScene,
    topic,
    sectionKey,
    shenShaCode,
    userQuestion,
    readingText,
    conversationId,
    model,
    // 向后兼容
    lastUserQuestion,
    lastAssistantResponse,
  } = params;
  
  // 向后兼容：如果使用旧参数，自动转换
  const finalUserQuestion = userQuestion || lastUserQuestion || '';
  const finalReadingText = readingText || lastAssistantResponse || '';
  
  // 1. 解析场景（如果未提供则自动解析）
  const scene = providedScene || resolveFollowupScene({ topic, sectionKey, shenShaCode });
  
  // 2. 校验解读文本（太短时直接用兜底追问，避免生成质量极差的问题）
  if (!finalReadingText || finalReadingText.trim().length < 20) {
    console.warn('[generateFollowUps] Reading text too short, using fallback followups');
    return buildFallbackFollowups(scene);
  }
  
  // 3. 加载历史追问（用于去重）
  // 只取最近 10 条有追问的消息，作为去重参考，避免扫描整段对话
  let askedFollowups: string[] = [];
  if (conversationId) {
    try {
      const pool = getPool();
      const [rows]: any = await pool.execute(
        `SELECT follow_ups FROM messages 
         WHERE conversation_id = ? AND follow_ups IS NOT NULL
         ORDER BY created_at DESC
         LIMIT 10`,
        [conversationId]
      );
      
      // 解析历史追问（可能是 JSON 字符串或 JSON 数组）
      for (const row of rows) {
        if (row.follow_ups) {
          try {
            const parsed = typeof row.follow_ups === 'string' 
              ? JSON.parse(row.follow_ups) 
              : row.follow_ups;
            
            if (Array.isArray(parsed)) {
              // 如果是数组，提取所有 question 字段
              parsed.forEach((item: any) => {
                if (typeof item === 'string') {
                  askedFollowups.push(item);
                } else if (item?.question) {
                  askedFollowups.push(item.question);
                }
              });
            } else if (parsed?.followups && Array.isArray(parsed.followups)) {
              // 如果是 { followups: [...] } 格式
              parsed.followups.forEach((item: any) => {
                if (item?.question) {
                  askedFollowups.push(item.question);
                }
              });
            }
          } catch (e) {
            // 解析失败，跳过这条记录
            console.warn('[generateFollowUps] Failed to parse historical followup:', e);
          }
        }
      }
    } catch (error) {
      console.error('[generateFollowUps] Failed to load historical followups:', error);
      // 继续执行，不阻塞
    }
  }
  
  // 4. 构建追问 Prompt
  const prompt = buildFollowupPrompt({
    scene,
    userQuestion: finalUserQuestion,
    readingText: finalReadingText,
    askedFollowups,
  });
  
  // 5. 调用 LLM（非流式，追问不需要流式）
  let followups: FollowupQuestion[] = [];
  
  try {
    const llmModel = model || await aiService.getDefaultModel();
    const messages: LLMMessage[] = [
      { role: 'user', content: prompt },
    ];
    
    const response = await aiService.chat({
      model: llmModel,
      request: { 
        messages, 
        temperature: 0.8, 
        maxTokens: 300,  // 追问不需要太多 token
      },
    });
    
    // 6. 解析 JSON（支持多种格式）
    const rawContent = response.content.trim();
    
    // 尝试提取 JSON（可能被 Markdown 代码块包裹）
    let jsonStr = rawContent;
    const jsonMatch = rawContent.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }
    
    const parsed = JSON.parse(jsonStr);
    
    // 支持两种格式：{ followups: [...] } 或直接是数组
    if (parsed.followups && Array.isArray(parsed.followups)) {
      followups = parsed.followups
        .filter((item: any) => item?.type && item?.question)
        .map((item: any) => ({
          type: item.type as FollowupQuestion['type'],
          question: item.question.trim(),
        }))
        .slice(0, 3);
    } else if (Array.isArray(parsed)) {
      followups = parsed
        .filter((item: any) => item?.type && item?.question)
        .map((item: any) => ({
          type: item.type as FollowupQuestion['type'],
          question: item.question.trim(),
        }))
        .slice(0, 3);
    }
  } catch (error) {
    console.error('[generateFollowUps] Failed to generate followups via LLM:', error);
    // 使用兜底模板
    followups = buildFallbackFollowups(scene);
  }
  
  // 7. 去重（与历史追问比对，只做严格相等匹配，避免误杀语义相似但不同的追问）
  followups = followups.filter(f => {
    const normalized = f.question.toLowerCase().trim();
    return !askedFollowups.some(asked => 
      asked.toLowerCase().trim() === normalized
    );
  });
  
  // 8. 确保有 3 个追问（不足则用兜底模板补齐）
  if (followups.length < 3) {
    const fallbacks = buildFallbackFollowups(scene);
    const needed = 3 - followups.length;
    
    // 从兜底模板中选择，避免重复
    for (const fallback of fallbacks) {
      if (followups.length >= 3) break;
      
      const isDuplicate = followups.some(f => 
        f.type === fallback.type || 
        f.question.toLowerCase() === fallback.question.toLowerCase()
      );
      
      if (!isDuplicate) {
        followups.push(fallback);
      }
    }
    
    // 如果还是不足 3 个，强制补齐（即使可能重复）
    while (followups.length < 3 && fallbacks.length > 0) {
      const fallback = fallbacks[followups.length % fallbacks.length];
      followups.push(fallback);
    }
  }
  
  // 9. 确保类型齐全（curiosity / warning / action 各一个），并按固定顺序返回
  const typeMap = new Map<FollowupQuestion['type'], FollowupQuestion>();
  followups.forEach(f => {
    if (!typeMap.has(f.type)) {
      typeMap.set(f.type, f);
    }
  });
  
  // 如果缺少某个类型，用兜底模板补齐
  const requiredTypes: FollowupType[] = ['curiosity', 'warning', 'action'];
  requiredTypes.forEach(type => {
    if (!typeMap.has(type)) {
      const fallback = buildFallbackFollowups(scene).find(f => f.type === type);
      if (fallback) {
        typeMap.set(type, fallback);
      }
    }
  });
  
  // 按固定顺序返回（curiosity → warning → action）
  const order: FollowupType[] = ['curiosity', 'warning', 'action'];
  return order
    .map(t => typeMap.get(t))
    .filter((x): x is FollowupQuestion => !!x);
}

