/**
 * AI 服务类型定义
 */

export type LLMModel = 'deepseek' | 'chatgpt' | 'qwen';

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMConfig {
  model: LLMModel;
  apiKey: string;
  apiUrl: string;
  temperature?: number;
  maxTokens?: number;
  thinkingMode?: boolean; // DeepSeek 专用
}

export interface LLMRequest {
  messages: LLMMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface LLMResponse {
  content: string;
  finishReason?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  thinkingContent?: string; // DeepSeek thinking mode
}

export interface StreamChunk {
  content: string;
  done: boolean;
}

/**
 * LLM Provider 接口
 * 所有 LLM 提供商必须实现此接口
 */
export interface ILLMProvider {
  /**
   * 发送请求（非流式）
   */
  chat(request: LLMRequest): Promise<LLMResponse>;
  
  /**
   * 发送请求（流式）
   */
  chatStream(request: LLMRequest): AsyncGenerator<StreamChunk>;
  
  /**
   * 获取模型名称
   */
  getModelName(): string;
}

