"use strict";
/**
 * DeepSeek API 集成
 *
 * 支持模式：
 * - deepseek-chat: 标准对话模式（快速、高效）
 * - deepseek-reasoner: Thinking 思考模式（深度推理）
 *
 * ⚠️ 注意：仅支持流式响应，不支持非流式响应
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeepSeekProvider = void 0;
const axios_1 = __importDefault(require("axios"));
class DeepSeekProvider {
    constructor(config) {
        this.config = config;
    }
    /**
     * ⚠️ 已废弃：DeepSeek 仅支持流式响应
     * 此方法会自动转为流式调用并返回完整结果
     */
    async chat(request) {
        console.warn('[DeepSeek] chat() is deprecated. Use chatStream() instead.');
        // 自动转为流式调用
        let fullContent = '';
        let thinkingContent = '';
        for await (const chunk of this.chatStream(request)) {
            if (!chunk.done) {
                fullContent += chunk.content;
            }
        }
        return {
            content: fullContent,
            finishReason: 'stop',
            thinkingContent: thinkingContent || undefined,
        };
    }
    /**
     * 流式对话
     */
    async *chatStream(request) {
        const { messages, temperature = 0.7, maxTokens = 2000 } = request;
        try {
            const response = await axios_1.default.post(`${this.config.apiUrl}/chat/completions`, {
                model: this.config.thinkingMode ? 'deepseek-reasoner' : 'deepseek-chat',
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
            let chunkCount = 0;
            let contentChunkCount = 0;
            let thinkingChunkCount = 0;
            console.log(`[DeepSeek] Starting stream, thinkingMode: ${this.config.thinkingMode}, model: ${this.config.thinkingMode ? 'deepseek-reasoner' : 'deepseek-chat'}`);
            for await (const chunk of response.data) {
                const lines = chunk.toString().split('\n').filter((line) => line.trim() !== '');
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') {
                            console.log(`[DeepSeek] Stream done. Total chunks: ${chunkCount}, content chunks: ${contentChunkCount}, thinking chunks: ${thinkingChunkCount}`);
                            yield { content: '', done: true };
                            return;
                        }
                        try {
                            const parsed = JSON.parse(data);
                            chunkCount++;
                            // 详细日志（每10个chunk记录一次，避免日志过多）
                            if (chunkCount % 10 === 0 || chunkCount <= 5) {
                                console.log(`[DeepSeek] Chunk #${chunkCount}:`, JSON.stringify({
                                    hasChoices: !!parsed.choices,
                                    choiceCount: parsed.choices?.length || 0,
                                    deltaKeys: parsed.choices?.[0]?.delta ? Object.keys(parsed.choices[0].delta) : [],
                                    hasContent: !!parsed.choices?.[0]?.delta?.content,
                                    hasThinking: !!parsed.choices?.[0]?.delta?.thinking,
                                    contentLength: parsed.choices?.[0]?.delta?.content?.length || 0,
                                    thinkingLength: parsed.choices?.[0]?.delta?.thinking?.length || 0,
                                }));
                            }
                            const delta = parsed.choices[0]?.delta;
                            if (delta?.content) {
                                contentChunkCount++;
                                const content = delta.content;
                                if (contentChunkCount <= 3 || contentChunkCount % 20 === 0) {
                                    console.log(`[DeepSeek] Yielding content chunk #${contentChunkCount}, length: ${content.length}, preview: ${content.substring(0, 50)}...`);
                                }
                                yield { content, done: false };
                            }
                            else if (delta?.thinking) {
                                thinkingChunkCount++;
                                if (thinkingChunkCount <= 3 || thinkingChunkCount % 20 === 0) {
                                    console.log(`[DeepSeek] Received thinking chunk #${thinkingChunkCount}, length: ${delta.thinking.length}, preview: ${delta.thinking.substring(0, 50)}...`);
                                }
                                // 思考内容不yield，只记录日志
                            }
                            else {
                                // 既没有 content 也没有 thinking
                                if (chunkCount <= 10) {
                                    console.log(`[DeepSeek] Chunk #${chunkCount} has no content or thinking, delta:`, JSON.stringify(delta));
                                }
                            }
                        }
                        catch (e) {
                            console.error(`[DeepSeek] Parse error at chunk #${chunkCount}:`, e instanceof Error ? e.message : e);
                            console.error(`[DeepSeek] Raw data that failed to parse:`, data.substring(0, 200));
                        }
                    }
                }
            }
            console.log(`[DeepSeek] Stream ended. Total chunks: ${chunkCount}, content chunks: ${contentChunkCount}, thinking chunks: ${thinkingChunkCount}`);
        }
        catch (error) {
            console.error('[DeepSeek] Stream failed:', error.response?.data || error.message);
            // 提供更友好的错误信息
            let errorMessage = error.message || '未知錯誤';
            // SSL 证书错误（网络环境问题）
            if (error.message?.includes('certificate') ||
                error.message?.includes('Hostname') ||
                error.message?.includes('SSL') ||
                error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE' ||
                error.code === 'CERT_HAS_EXPIRED') {
                errorMessage = '網絡連接異常：SSL 證書驗證失敗。可能是網絡環境問題（如公共 WiFi 攔截），請嘗試切換網絡或稍後再試';
            }
            // 网络连接错误
            else if (error.message?.includes('ECONNREFUSED') ||
                error.message?.includes('ENOTFOUND') ||
                error.message?.includes('timeout')) {
                errorMessage = '網絡連接失敗，請檢查網絡設置';
            }
            throw new Error(`DeepSeek API 流式調用失敗: ${errorMessage}`);
        }
    }
    getModelName() {
        return this.config.thinkingMode ? 'deepseek-reasoner' : 'deepseek-chat';
    }
}
exports.DeepSeekProvider = DeepSeekProvider;
//# sourceMappingURL=deepseek.js.map