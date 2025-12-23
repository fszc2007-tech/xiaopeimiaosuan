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

import { v4 as uuidv4 } from 'uuid';
import { getPool } from '../../database/connection';
import { FieldMapper } from '../../utils/fieldMapper';
import { encryptApiKey, decryptApiKey } from '../../utils/encryption';
import type { LlmApiConfigRow } from '../../types/database';
import type {
  LLMConfigDto,
  UpdateLLMConfigRequestDto,
  TestLLMConnectionDto,
} from '../../types/dto';

/**
 * 默认 LLM 配置
 */
const DEFAULT_LLM_CONFIG = {
  deepseek: {
    baseUrl: 'https://api.deepseek.com',
    modelName: 'deepseek-chat',
    enableStream: true,
    enableThinking: false, // 默认非 thinking 模式
    temperature: 0.7,
    maxTokens: 4000,
  },
  chatgpt: {
    baseUrl: 'https://api.openai.com/v1',
    modelName: 'gpt-4o',
    enableStream: true,
    enableThinking: false,
    temperature: 0.7,
    maxTokens: 4000,
  },
  qwen: {
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    modelName: 'qwen-max',
    enableStream: true,
    enableThinking: false,
    temperature: 0.7,
    maxTokens: 4000,
  },
} as const;

/**
 * 初始化 LLM 配置表（首次运行时）
 */
export async function initializeLLMConfig(): Promise<void> {
  const pool = getPool();
  for (const [model, config] of Object.entries(DEFAULT_LLM_CONFIG)) {
    const [existingRows] = await pool.query<LlmApiConfigRow[]>(
      'SELECT * FROM llm_api_configs WHERE model = ?',
      [model]
    );

    if (existingRows.length === 0) {
      await pool.query(
        `INSERT INTO llm_api_configs (
          config_id, model, api_url, model_name, enable_stream, thinking_mode,
          temperature, max_tokens, is_enabled, is_default, test_status,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          uuidv4(),
          model,
          config.baseUrl,
          config.modelName,
          config.enableStream,
          config.enableThinking,
          config.temperature,
          config.maxTokens,
          false, // 默认禁用（需要配置 API Key）
          model === 'deepseek', // DeepSeek 为默认
          'not_tested',
        ]
      );
    }
  }
}

/**
 * 获取所有 LLM 配置
 * 
 * @returns LLM 配置列表
 */
export async function getLLMConfigs(): Promise<LLMConfigDto[]> {
  console.log('[LLM Config] 开始获取配置列表...');
  
  const [rows] = await getPool().query<LlmApiConfigRow[]>(
    'SELECT * FROM llm_api_configs ORDER BY model'
  );

  console.log('[LLM Config] 查询到', rows.length, '条记录');

  // 解密 API Key（仅用于生成 masked 版本）
  const configs: LLMConfigDto[] = [];

  for (const row of rows) {
    console.log('[LLM Config] 处理', row.model);
    
    let decryptedKey: string | undefined;
    if (row.api_key_encrypted) {
      try {
        decryptedKey = decryptApiKey(row.api_key_encrypted);
      } catch (error) {
        console.error(`[LLM Config] Failed to decrypt API key for ${row.model}:`, error);
      }
    }

    try {
      const config = FieldMapper.mapLLMConfig(row, decryptedKey);
      configs.push(config);
      console.log('[LLM Config] 成功处理', row.model);
    } catch (error: any) {
      console.error(`[LLM Config] Failed to map config for ${row.model}:`, error.message);
      throw error;
    }
  }

  console.log('[LLM Config] 返回', configs.length, '个配置');
  return configs;
}

/**
 * 获取单个 LLM 配置
 * 
 * @param provider LLM 提供商
 * @returns LLM 配置
 */
export async function getLLMConfig(
  provider: 'deepseek' | 'chatgpt' | 'qwen'
): Promise<LLMConfigDto | null> {
  const pool = getPool();
  const [rows] = await pool.query<LlmApiConfigRow[]>(
    'SELECT * FROM llm_api_configs WHERE model = ?',
    [provider]
  );

  if (rows.length === 0) {
    return null;
  }

  const row = rows[0];

  let decryptedKey: string | undefined;
  if (row.api_key_encrypted) {
    try {
      decryptedKey = decryptApiKey(row.api_key_encrypted);
    } catch (error) {
      console.error(`[LLM Config] Failed to decrypt API key for ${provider}:`, error);
    }
  }

  return FieldMapper.mapLLMConfig(row, decryptedKey);
}

/**
 * 更新 LLM 配置
 * 
 * @param provider LLM 提供商
 * @param data 更新数据
 * @returns 更新后的配置
 */
export async function updateLLMConfig(
  provider: 'deepseek' | 'chatgpt' | 'qwen',
  data: UpdateLLMConfigRequestDto
): Promise<LLMConfigDto> {
  const updateFields: string[] = [];
  const updateValues: any[] = [];

  // API Key（加密存储）
  if (data.apiKey) {
    const encryptedKey = encryptApiKey(data.apiKey);
    updateFields.push('api_key_encrypted = ?');
    updateValues.push(encryptedKey);
  }

  // 其他字段
  if (data.baseUrl !== undefined) {
    updateFields.push('api_url = ?');
    updateValues.push(data.baseUrl);
  }

  if (data.modelName !== undefined) {
    updateFields.push('model_name = ?');
    updateValues.push(data.modelName);
  }

  if (data.enableStream !== undefined) {
    updateFields.push('enable_stream = ?');
    updateValues.push(data.enableStream);
  }

  if (data.enableThinking !== undefined) {
    updateFields.push('thinking_mode = ?');
    updateValues.push(data.enableThinking);
  }

  if (data.temperature !== undefined) {
    updateFields.push('temperature = ?');
    updateValues.push(data.temperature);
  }

  if (data.maxTokens !== undefined) {
    updateFields.push('max_tokens = ?');
    updateValues.push(data.maxTokens);
  }

  if (data.isEnabled !== undefined) {
    updateFields.push('is_enabled = ?');
    updateValues.push(data.isEnabled);
  }

  // 如果有更新，执行
  if (updateFields.length > 0) {
    const pool = getPool();
    updateFields.push('updated_at = NOW()');
    updateValues.push(provider);

    await pool.query(
      `UPDATE llm_api_configs SET ${updateFields.join(', ')} WHERE model = ?`,
      updateValues
    );
    
    // 清除 Provider 缓存，确保新配置立即生效
    const { clearProviderCache } = await import('../ai/aiService');
    clearProviderCache(provider);
    console.log(`[LLM Config] Cleared provider cache for ${provider}`);
  }

  // 查询并返回
  const updated = await getLLMConfig(provider);
  if (!updated) {
    throw new Error('LLM_CONFIG_NOT_FOUND');
  }

  return updated;
}

/**
 * 设置默认 LLM
 * 
 * @param provider LLM 提供商
 */
export async function setDefaultLLM(provider: 'deepseek' | 'chatgpt' | 'qwen'): Promise<void> {
  const pool = getPool();
  // 1. 将所有 LLM 设为非默认
  await pool.query('UPDATE llm_api_configs SET is_default = FALSE');

  // 2. 设置指定 LLM 为默认
  await pool.query(
    'UPDATE llm_api_configs SET is_default = TRUE WHERE model = ?',
    [provider]
  );
}

/**
 * 测试 LLM 连接
 * 
 * @param provider LLM 提供商
 * @returns 测试结果
 */
export async function testLLMConnection(
  provider: 'deepseek' | 'chatgpt' | 'qwen'
): Promise<TestLLMConnectionDto> {
  const startTime = Date.now();

  try {
    // 1. 获取配置
    const config = await getLLMConfig(provider);
    if (!config || !config.hasApiKey) {
      throw new Error('API Key 未配置');
    }

    // 2. 获取解密后的 API Key
    const [rows] = await getPool().query<LlmApiConfigRow[]>(
      'SELECT api_key_encrypted FROM llm_api_configs WHERE model = ?',
      [provider]
    );

    if (rows.length === 0 || !rows[0].api_key_encrypted) {
      throw new Error('API Key 未配置');
    }

    const apiKey = decryptApiKey(rows[0].api_key_encrypted);

    // 3. 发送实际的测试请求
    const { testLLMConnection: testConnection } = await import('../../utils/llmTester');
    
    const result = await testConnection({
      provider,
      apiKey,
      baseUrl: config.baseUrl,
      modelName: config.modelName,
    });

    // 4. 更新测试状态
    await getPool().query(
      `UPDATE llm_api_configs 
       SET test_status = ?, test_message = ?, updated_at = NOW() 
       WHERE model = ?`,
      [result.success ? 'success' : 'failed', result.message, provider]
    );

    return {
      status: result.success ? 'success' : 'failed',
      message: result.message,
      responseTime: result.latency,
    };
  } catch (error: any) {
    // 更新测试状态为失败
    await getPool().query(
      `UPDATE llm_api_configs 
       SET test_status = 'failed', test_message = ?, updated_at = NOW() 
       WHERE model = ?`,
      [error.message || '连接失败', provider]
    );

    return {
      status: 'failed',
      message: error.message || '连接失败',
    };
  }
}

/**
 * 获取明文 API Key（仅供内部服务使用，不对外暴露）
 * 
 * @param provider LLM 提供商
 * @returns 明文 API Key
 */
export async function getDecryptedApiKey(
  provider: 'deepseek' | 'chatgpt' | 'qwen'
): Promise<string | null> {
  const pool = getPool();
  const [rows] = await pool.query<LlmApiConfigRow[]>(
    'SELECT api_key_encrypted FROM llm_api_configs WHERE model = ? AND is_enabled = TRUE',
    [provider]
  );

  if (rows.length === 0 || !rows[0].api_key_encrypted) {
    return null;
  }

  try {
    return decryptApiKey(rows[0].api_key_encrypted);
  } catch (error) {
    console.error(`[LLM Config] Failed to decrypt API key for ${provider}:`, error);
    return null;
  }
}

