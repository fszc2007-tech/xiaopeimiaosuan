/**
 * LLM 计费相关类型定义
 */

/**
 * LLM 提供商枚举
 */
export enum LLMProvider {
  DeepSeek = 'deepseek',
  OpenAI = 'openai',   // 比 'chatgpt' 更通用，将来可能不止 ChatGPT
  Qwen = 'qwen',
}

/**
 * LLM 调用来源枚举
 */
export enum LLMSource {
  App = 'app',
  Admin = 'admin',
  Script = 'script',
}

/**
 * 价格规则方向
 */
export type PricingDirection = 'input' | 'output';

/**
 * 价格规则层级
 */
export type PricingTier = 'normal' | 'cache_hit';

/**
 * LLM Usage 信息
 */
export interface LLMUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  promptTokensDetails?: {
    cachedTokens?: number;
  };
}

/**
 * 计费参数
 */
export interface BillingParams {
  provider: LLMProvider;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cacheHit: boolean;
  usageTime: Date;  // 调用发生时间，用于价格规则选择
}

/**
 * 日志记录参数
 */
export interface LogUsageParams {
  provider: LLMProvider;
  model: string;
  isThinkingMode: boolean;
  cacheHit: boolean;
  userId?: string;
  source: LLMSource;
  traceId?: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  costCents: number;
  hasUsage: boolean;
  hasPricing: boolean;
  usageTime: Date;
}


