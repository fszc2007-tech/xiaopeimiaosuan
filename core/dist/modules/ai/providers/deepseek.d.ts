/**
 * DeepSeek API 集成
 *
 * 支持模式：
 * - deepseek-chat: 标准对话模式（快速、高效）
 * - deepseek-reasoner: Thinking 思考模式（深度推理）
 *
 * ⚠️ 注意：仅支持流式响应，不支持非流式响应
 */
import { ILLMProvider, LLMConfig, LLMRequest, LLMResponse, StreamChunk } from '../types';
export declare class DeepSeekProvider implements ILLMProvider {
    private config;
    constructor(config: LLMConfig);
    /**
     * ⚠️ 已废弃：DeepSeek 仅支持流式响应
     * 此方法会自动转为流式调用并返回完整结果
     */
    chat(request: LLMRequest): Promise<LLMResponse>;
    /**
     * 流式对话
     */
    chatStream(request: LLMRequest): AsyncGenerator<StreamChunk>;
    getModelName(): string;
}
//# sourceMappingURL=deepseek.d.ts.map