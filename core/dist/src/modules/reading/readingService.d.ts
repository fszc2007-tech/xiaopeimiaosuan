/**
 * 解读服务
 *
 * 负责命理解读的编排和调用
 */
import { LLMModel } from '../ai/types';
import { FollowupQuestion } from '../prompt/followups/buildFollowupPrompt';
import { FollowupScene } from '../prompt/followups/followupScenes';
/**
 * 神煞解读
 */
export declare function readShensha(params: {
    userId: string;
    chartId: string;
    shenshaCode: string;
    shenshaName: string;
    userQuestion?: string;
    model?: LLMModel;
}): Promise<{
    displayText: string;
    thinkingContent?: string;
}>;
/**
 * 命盘总览解读
 */
export declare function readOverview(params: {
    userId: string;
    chartId: string;
    sectionKey: string;
    userQuestion?: string;
    model?: LLMModel;
}): Promise<{
    displayText: string;
    thinkingContent?: string;
}>;
/**
 * 通用解读（聊天）
 */
export declare function readGeneral(params: {
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
}>;
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
export declare function generateFollowUps(params: {
    scene?: FollowupScene;
    topic?: string;
    sectionKey?: string;
    shenShaCode?: string;
    userQuestion?: string;
    readingText?: string;
    conversationId?: string;
    model?: LLMModel;
    lastUserQuestion?: string;
    lastAssistantResponse?: string;
}): Promise<FollowupQuestion[]>;
//# sourceMappingURL=readingService.d.ts.map