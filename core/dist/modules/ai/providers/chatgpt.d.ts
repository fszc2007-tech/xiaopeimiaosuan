/**
 * ChatGPT (OpenAI) API 集成
 *
 * 模型：gpt-4o
 *
 * ⚠️ 注意：仅支持流式响应，不支持非流式响应
 */
import { ILLMProvider, LLMConfig, LLMRequest, LLMResponse, StreamChunk } from '../types';
export declare class ChatGPTProvider implements ILLMProvider {
    private config;
    constructor(config: LLMConfig);
    /**
     * ⚠️ 已废弃：ChatGPT 仅支持流式响应
     * 此方法会自动转为流式调用并返回完整结果
     */
    chat(request: LLMRequest): Promise<LLMResponse>;
    /**
     * 流式对话
     */
    chatStream(request: LLMRequest): AsyncGenerator<StreamChunk>;
    getModelName(): string;
}
//# sourceMappingURL=chatgpt.d.ts.map