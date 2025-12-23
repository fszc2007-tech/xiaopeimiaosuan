"use strict";
/**
 * AI 服务统一接口
 *
 * 负责：
 * - 管理多个 LLM 提供商
 * - 路由请求到合适的 LLM
 * - 提供统一的调用接口
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearProviderCache = clearProviderCache;
exports.chat = chat;
exports.chatStream = chatStream;
exports.getDefaultModel = getDefaultModel;
exports.chatStreamWithQuota = chatStreamWithQuota;
const connection_1 = require("../../database/connection");
const encryption_1 = require("../../utils/encryption");
const deepseek_1 = require("./providers/deepseek");
const chatgpt_1 = require("./providers/chatgpt");
const qwen_1 = require("./providers/qwen");
/**
 * LLM 提供商缓存
 */
const providerCache = new Map();
/**
 * 获取 LLM 配置（从数据库）
 */
async function getLLMConfig(model) {
    const pool = (0, connection_1.getPool)();
    const [rows] = await pool.execute(`SELECT * FROM llm_api_configs WHERE model = ? AND is_enabled = TRUE`, [model]);
    if (rows.length === 0) {
        throw new Error(`LLM 模型 ${model} 未配置或已禁用`);
    }
    const config = rows[0];
    if (!config.api_key_encrypted) {
        throw new Error(`LLM 模型 ${model} 的 API Key 未配置`);
    }
    // 解密 API Key
    const apiKey = (0, encryption_1.decryptApiKey)(config.api_key_encrypted);
    return {
        model,
        apiKey,
        apiUrl: config.api_url,
        thinkingMode: config.thinking_mode || false,
    };
}
/**
 * 获取或创建 LLM Provider
 */
async function getProvider(model) {
    // 检查缓存
    if (providerCache.has(model)) {
        return providerCache.get(model);
    }
    // 获取配置
    const config = await getLLMConfig(model);
    // 创建 Provider
    let provider;
    switch (model) {
        case 'deepseek':
            provider = new deepseek_1.DeepSeekProvider(config);
            break;
        case 'chatgpt':
            provider = new chatgpt_1.ChatGPTProvider(config);
            break;
        case 'qwen':
            provider = new qwen_1.QwenProvider(config);
            break;
        default:
            throw new Error(`不支持的 LLM 模型: ${model}`);
    }
    // 缓存 Provider
    providerCache.set(model, provider);
    return provider;
}
/**
 * 清除 Provider 缓存（用于配置更新后）
 */
function clearProviderCache(model) {
    if (model) {
        providerCache.delete(model);
    }
    else {
        providerCache.clear();
    }
}
/**
 * 发送 LLM 请求（非流式）
 */
async function chat(params) {
    const { model, request } = params;
    try {
        const provider = await getProvider(model);
        const response = await provider.chat(request);
        console.log(`[AIService] Chat completed: ${provider.getModelName()}, tokens: ${response.usage?.totalTokens || 'N/A'}`);
        return response;
    }
    catch (error) {
        console.error(`[AIService] Chat failed:`, error);
        throw error;
    }
}
/**
 * 发送 LLM 请求（流式）
 */
async function* chatStream(params) {
    const { model, request } = params;
    try {
        const provider = await getProvider(model);
        const modelName = provider.getModelName();
        console.log(`[AIService] Stream started: ${modelName}`);
        console.log(`[AIService] Request details:`, {
            model,
            messageCount: request.messages.length,
            temperature: request.temperature,
            maxTokens: request.maxTokens,
        });
        let chunkCount = 0;
        let totalContentLength = 0;
        for await (const chunk of provider.chatStream(request)) {
            chunkCount++;
            if (!chunk.done) {
                totalContentLength += chunk.content.length;
                if (chunkCount <= 3 || chunkCount % 50 === 0) {
                    console.log(`[AIService] Chunk #${chunkCount}, content length: ${chunk.content.length}, total: ${totalContentLength}`);
                }
            }
            yield chunk;
        }
        console.log(`[AIService] Stream completed: ${modelName}, total chunks: ${chunkCount}, total content length: ${totalContentLength}`);
    }
    catch (error) {
        console.error(`[AIService] Stream failed:`, error);
        console.error(`[AIService] Error details:`, {
            message: error.message,
            stack: error.stack,
            response: error.response?.data,
        });
        throw error;
    }
}
/**
 * 获取默认 LLM 模型
 * 优先级：DeepSeek > ChatGPT > Qwen
 */
async function getDefaultModel() {
    const pool = (0, connection_1.getPool)();
    const [rows] = await pool.execute(`SELECT model FROM llm_api_configs 
     WHERE is_enabled = TRUE AND api_key_encrypted IS NOT NULL
     ORDER BY FIELD(model, 'deepseek', 'chatgpt', 'qwen')
     LIMIT 1`);
    if (rows.length === 0) {
        throw new Error('没有可用的 LLM 模型，请先配置 API Key');
    }
    return rows[0].model;
}
/**
 * 封裝 LLM 調用（流式）+ AI 次數檢查
 *
 * 所有需要調用 LLM 的地方都應該使用這個函數，而不是直接調用 chatStream()
 *
 * @param userId 用戶 ID
 * @param params LLM 請求參數
 * @returns 流式響應
 * @throws {AiLimitReachedError} 當達到每日上限時拋出
 */
async function* chatStreamWithQuota(userId, params) {
    // 1. 先檢查並累計 AI 使用次數
    const { checkAndCountAIUsage } = await Promise.resolve().then(() => __importStar(require('./aiQuotaService')));
    await checkAndCountAIUsage(userId);
    // 2. 獲取模型（如果沒有指定，使用默認模型）
    const model = params.model || await getDefaultModel();
    // 3. 調用 LLM 流式接口
    const stream = chatStream({ model, request: params.request });
    // 4. 轉發流式響應
    for await (const chunk of stream) {
        yield chunk;
    }
}
//# sourceMappingURL=aiService.js.map