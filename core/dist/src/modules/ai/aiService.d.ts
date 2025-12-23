/**
 * AI 服务统一接口
 *
 * 负责：
 * - 管理多个 LLM 提供商
 * - 路由请求到合适的 LLM
 * - 提供统一的调用接口
 */
import { LLMModel, LLMRequest, LLMResponse, StreamChunk } from './types';
/**
 * 清除 Provider 缓存（用于配置更新后）
 */
export declare function clearProviderCache(model?: LLMModel): void;
/**
 * 发送 LLM 请求（非流式）
 */
export declare function chat(params: {
    model: LLMModel;
    request: LLMRequest;
}): Promise<LLMResponse>;
/**
 * 发送 LLM 请求（流式）
 */
export declare function chatStream(params: {
    model: LLMModel;
    request: LLMRequest;
}): AsyncGenerator<StreamChunk>;
/**
 * 获取默认 LLM 模型
 * 优先级：DeepSeek > ChatGPT > Qwen
 */
export declare function getDefaultModel(): Promise<LLMModel>;
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
export declare function chatStreamWithQuota(userId: string, params: {
    model?: LLMModel;
    request: LLMRequest;
}): AsyncGenerator<StreamChunk>;
//# sourceMappingURL=aiService.d.ts.map