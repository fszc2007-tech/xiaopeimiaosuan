/**
 * LLM 计费服务
 *
 * 负责：
 * - 计算 LLM 调用费用
 * - 记录 usage 日志
 */
import { LLMProvider, BillingParams, LogUsageParams } from './types';
/**
 * 计算费用（分）
 *
 * @param params 计费参数
 * @returns 费用（分）
 */
export declare function calculateCost(params: BillingParams): Promise<number>;
/**
 * 记录 usage 日志
 *
 * @param params 日志参数
 */
export declare function logUsage(params: LogUsageParams): Promise<void>;
/**
 * 从 LLMModel 映射到 LLMProvider
 */
export declare function mapModelToProvider(model: string): LLMProvider;
/**
 * 从模型名称获取实际模型（如 deepseek-chat, deepseek-reasoner）
 */
export declare function getActualModelName(model: string, isThinkingMode: boolean): string;
//# sourceMappingURL=billingService.d.ts.map