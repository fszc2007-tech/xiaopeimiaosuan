"use strict";
/**
 * ChatGPT (OpenAI) API 集成
 *
 * 模型：gpt-4o
 *
 * ⚠️ 注意：仅支持流式响应，不支持非流式响应
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGPTProvider = void 0;
const axios_1 = __importDefault(require("axios"));
class ChatGPTProvider {
    constructor(config) {
        this.config = config;
    }
    /**
     * ⚠️ 已废弃：ChatGPT 仅支持流式响应
     * 此方法会自动转为流式调用并返回完整结果
     */
    async chat(request) {
        console.warn('[ChatGPT] chat() is deprecated. Use chatStream() instead.');
        // 自动转为流式调用
        let fullContent = '';
        for await (const chunk of this.chatStream(request)) {
            if (!chunk.done) {
                fullContent += chunk.content;
            }
        }
        return {
            content: fullContent,
            finishReason: 'stop',
        };
    }
    /**
     * 流式对话
     */
    async *chatStream(request) {
        const { messages, temperature = 0.7, maxTokens = 2000 } = request;
        try {
            const response = await axios_1.default.post(`${this.config.apiUrl}/chat/completions`, {
                model: 'gpt-4o',
                messages,
                temperature,
                max_tokens: maxTokens,
                stream: true,
            }, {
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                    'Content-Type': 'application/json',
                },
                responseType: 'stream',
                timeout: 60000,
            });
            // 处理流式响应
            for await (const chunk of response.data) {
                const lines = chunk.toString().split('\n').filter((line) => line.trim() !== '');
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') {
                            yield { content: '', done: true };
                            return;
                        }
                        try {
                            const parsed = JSON.parse(data);
                            const delta = parsed.choices[0]?.delta;
                            if (delta?.content) {
                                yield { content: delta.content, done: false };
                            }
                        }
                        catch (e) {
                            // 忽略解析错误
                        }
                    }
                }
            }
        }
        catch (error) {
            console.error('[ChatGPT] Stream failed:', error.response?.data || error.message);
            throw new Error(`ChatGPT API 流式调用失败: ${error.message}`);
        }
    }
    getModelName() {
        return 'gpt-4o';
    }
}
exports.ChatGPTProvider = ChatGPTProvider;
//# sourceMappingURL=chatgpt.js.map