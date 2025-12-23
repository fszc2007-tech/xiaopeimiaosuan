/**
 * LLM 配置服务
 *
 * 功能：
 * 1. 获取 LLM 配置列表
 * 2. 更新 LLM 配置（加密 API Key）
 * 3. 测试 LLM 连接
 * 4. 设置默认 LLM
 *
 * 遵循文档：
 * - admin.doc/Admin后台最小需求功能文档.md
 * - Phase 4 需求确认（最终版）
 */
import type { LLMConfigDto, UpdateLLMConfigRequestDto, TestLLMConnectionDto } from '../../types/dto';
/**
 * 初始化 LLM 配置表（首次运行时）
 */
export declare function initializeLLMConfig(): Promise<void>;
/**
 * 获取所有 LLM 配置
 *
 * @returns LLM 配置列表
 */
export declare function getLLMConfigs(): Promise<LLMConfigDto[]>;
/**
 * 获取单个 LLM 配置
 *
 * @param provider LLM 提供商
 * @returns LLM 配置
 */
export declare function getLLMConfig(provider: 'deepseek' | 'chatgpt' | 'qwen'): Promise<LLMConfigDto | null>;
/**
 * 更新 LLM 配置
 *
 * @param provider LLM 提供商
 * @param data 更新数据
 * @returns 更新后的配置
 */
export declare function updateLLMConfig(provider: 'deepseek' | 'chatgpt' | 'qwen', data: UpdateLLMConfigRequestDto): Promise<LLMConfigDto>;
/**
 * 设置默认 LLM
 *
 * @param provider LLM 提供商
 */
export declare function setDefaultLLM(provider: 'deepseek' | 'chatgpt' | 'qwen'): Promise<void>;
/**
 * 测试 LLM 连接
 *
 * @param provider LLM 提供商
 * @returns 测试结果
 */
export declare function testLLMConnection(provider: 'deepseek' | 'chatgpt' | 'qwen'): Promise<TestLLMConnectionDto>;
/**
 * 获取明文 API Key（仅供内部服务使用，不对外暴露）
 *
 * @param provider LLM 提供商
 * @returns 明文 API Key
 */
export declare function getDecryptedApiKey(provider: 'deepseek' | 'chatgpt' | 'qwen'): Promise<string | null>;
//# sourceMappingURL=llmConfigService.d.ts.map