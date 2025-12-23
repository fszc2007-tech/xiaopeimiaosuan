"use strict";
/**
 * Qwen (通义千问) API 集成
 *
 * 模型：qwen-max
 *
 * ⚠️ 注意：仅支持流式响应，不支持非流式响应
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QwenProvider = void 0;
const axios_1 = __importDefault(require("axios"));
class QwenProvider {
    constructor(config) {
        this.config = config;
    }
    /**
     * ⚠️ 已废弃：Qwen 仅支持流式响应
     * 此方法会自动转为流式调用并返回完整结果
     */
    async chat(request) {
        console.warn('[Qwen] chat() is deprecated. Use chatStream() instead.');
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
            const response = await axios_1.default.post(`${this.config.apiUrl}/api/v1/services/aigc/text-generation/generation`, {
                model: 'qwen-max',
                input: {
                    messages,
                },
                parameters: {
                    temperature,
                    max_tokens: maxTokens,
                    result_format: 'message',
                    incremental_output: true,
                },
            }, {
                headers: {
                    'Authorization': `Bearer ${this.config.apiKey}`,
                    'Content-Type': 'application/json',
                    'X-DashScope-SSE': 'enable',
                },
                responseType: 'stream',
                timeout: 60000,
            });
            // 处理流式响应（SSE 格式）
            for await (const chunk of response.data) {
                const lines = chunk.toString().split('\n').filter((line) => line.trim() !== '');
                for (const line of lines) {
                    if (line.startsWith('data:')) {
                        const data = line.slice(5).trim();
                        try {
                            const parsed = JSON.parse(data);
                            const content = parsed.output?.choices?.[0]?.message?.content;
                            if (content) {
                                yield { content, done: false };
                            }
                            if (parsed.output?.finish_reason === 'stop') {
                                yield { content: '', done: true };
                                return;
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
            console.error('[Qwen] Stream failed:', error.response?.data || error.message);
            throw new Error(`Qwen API 流式调用失败: ${error.message}`);
        }
    }
    getModelName() {
        return 'qwen-max';
    }
}
exports.QwenProvider = QwenProvider;
//# sourceMappingURL=qwen.js.map