/**
 * LLM 配置 API 服务
 */

import api from './api';
import type {
  ApiResponse,
  LLMConfig,
  UpdateLLMConfigRequest,
  TestLLMResponse,
} from '../types';

/**
 * 获取所有 LLM 配置
 */
export async function getAllLLMConfigs(): Promise<LLMConfig[]> {
  const response = await api.get<ApiResponse<LLMConfig[]>>(
    '/api/admin/v1/llm-config'
  );
  return response.data.data!;
}

/**
 * 更新 LLM 配置
 */
export async function updateLLMConfig(
  provider: 'deepseek' | 'chatgpt' | 'qwen',
  data: UpdateLLMConfigRequest
): Promise<LLMConfig> {
  const response = await api.put<ApiResponse<LLMConfig>>(
    `/api/admin/v1/llm-config/${provider}`,
    data
  );
  return response.data.data!;
}

/**
 * 测试 LLM 连接
 */
export async function testLLMConnection(
  provider: 'deepseek' | 'chatgpt' | 'qwen'
): Promise<TestLLMResponse> {
  const response = await api.post<ApiResponse<TestLLMResponse>>(
    `/api/admin/v1/llm-config/${provider}/test`
  );
  return response.data.data!;
}

