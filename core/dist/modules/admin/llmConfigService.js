"use strict";
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
exports.initializeLLMConfig = initializeLLMConfig;
exports.getLLMConfigs = getLLMConfigs;
exports.getLLMConfig = getLLMConfig;
exports.updateLLMConfig = updateLLMConfig;
exports.setDefaultLLM = setDefaultLLM;
exports.testLLMConnection = testLLMConnection;
exports.getDecryptedApiKey = getDecryptedApiKey;
const uuid_1 = require("uuid");
const connection_1 = require("../../database/connection");
const fieldMapper_1 = require("../../utils/fieldMapper");
const encryption_1 = require("../../utils/encryption");
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
};
/**
 * 初始化 LLM 配置表（首次运行时）
 */
async function initializeLLMConfig() {
    const pool = (0, connection_1.getPool)();
    for (const [model, config] of Object.entries(DEFAULT_LLM_CONFIG)) {
        const [existingRows] = await pool.query('SELECT * FROM llm_api_configs WHERE model = ?', [model]);
        if (existingRows.length === 0) {
            await pool.query(`INSERT INTO llm_api_configs (
          config_id, model, api_url, model_name, enable_stream, thinking_mode,
          temperature, max_tokens, is_enabled, is_default, test_status,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`, [
                (0, uuid_1.v4)(),
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
            ]);
        }
    }
}
/**
 * 获取所有 LLM 配置
 *
 * @returns LLM 配置列表
 */
async function getLLMConfigs() {
    console.log('[LLM Config] 开始获取配置列表...');
    const [rows] = await (0, connection_1.getPool)().query('SELECT * FROM llm_api_configs ORDER BY model');
    console.log('[LLM Config] 查询到', rows.length, '条记录');
    // 解密 API Key（仅用于生成 masked 版本）
    const configs = [];
    for (const row of rows) {
        console.log('[LLM Config] 处理', row.model);
        let decryptedKey;
        if (row.api_key_encrypted) {
            try {
                decryptedKey = (0, encryption_1.decryptApiKey)(row.api_key_encrypted);
            }
            catch (error) {
                console.error(`[LLM Config] Failed to decrypt API key for ${row.model}:`, error);
            }
        }
        try {
            const config = fieldMapper_1.FieldMapper.mapLLMConfig(row, decryptedKey);
            configs.push(config);
            console.log('[LLM Config] 成功处理', row.model);
        }
        catch (error) {
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
async function getLLMConfig(provider) {
    const pool = (0, connection_1.getPool)();
    const [rows] = await pool.query('SELECT * FROM llm_api_configs WHERE model = ?', [provider]);
    if (rows.length === 0) {
        return null;
    }
    const row = rows[0];
    let decryptedKey;
    if (row.api_key_encrypted) {
        try {
            decryptedKey = (0, encryption_1.decryptApiKey)(row.api_key_encrypted);
        }
        catch (error) {
            console.error(`[LLM Config] Failed to decrypt API key for ${provider}:`, error);
        }
    }
    return fieldMapper_1.FieldMapper.mapLLMConfig(row, decryptedKey);
}
/**
 * 更新 LLM 配置
 *
 * @param provider LLM 提供商
 * @param data 更新数据
 * @returns 更新后的配置
 */
async function updateLLMConfig(provider, data) {
    const updateFields = [];
    const updateValues = [];
    // API Key（加密存储）
    if (data.apiKey) {
        const encryptedKey = (0, encryption_1.encryptApiKey)(data.apiKey);
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
        const pool = (0, connection_1.getPool)();
        updateFields.push('updated_at = NOW()');
        updateValues.push(provider);
        await pool.query(`UPDATE llm_api_configs SET ${updateFields.join(', ')} WHERE model = ?`, updateValues);
        // 清除 Provider 缓存，确保新配置立即生效
        const { clearProviderCache } = await Promise.resolve().then(() => __importStar(require('../ai/aiService')));
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
async function setDefaultLLM(provider) {
    const pool = (0, connection_1.getPool)();
    // 1. 将所有 LLM 设为非默认
    await pool.query('UPDATE llm_api_configs SET is_default = FALSE');
    // 2. 设置指定 LLM 为默认
    await pool.query('UPDATE llm_api_configs SET is_default = TRUE WHERE model = ?', [provider]);
}
/**
 * 测试 LLM 连接
 *
 * @param provider LLM 提供商
 * @returns 测试结果
 */
async function testLLMConnection(provider) {
    const startTime = Date.now();
    try {
        // 1. 获取配置
        const config = await getLLMConfig(provider);
        if (!config || !config.hasApiKey) {
            throw new Error('API Key 未配置');
        }
        // 2. 获取解密后的 API Key
        const [rows] = await (0, connection_1.getPool)().query('SELECT api_key_encrypted FROM llm_api_configs WHERE model = ?', [provider]);
        if (rows.length === 0 || !rows[0].api_key_encrypted) {
            throw new Error('API Key 未配置');
        }
        const apiKey = (0, encryption_1.decryptApiKey)(rows[0].api_key_encrypted);
        // 3. 发送实际的测试请求
        const { testLLMConnection: testConnection } = await Promise.resolve().then(() => __importStar(require('../../utils/llmTester')));
        const result = await testConnection({
            provider,
            apiKey,
            baseUrl: config.baseUrl,
            modelName: config.modelName,
        });
        // 4. 更新测试状态
        await (0, connection_1.getPool)().query(`UPDATE llm_api_configs 
       SET test_status = ?, test_message = ?, updated_at = NOW() 
       WHERE model = ?`, [result.success ? 'success' : 'failed', result.message, provider]);
        return {
            status: result.success ? 'success' : 'failed',
            message: result.message,
            responseTime: result.latency,
        };
    }
    catch (error) {
        // 更新测试状态为失败
        await (0, connection_1.getPool)().query(`UPDATE llm_api_configs 
       SET test_status = 'failed', test_message = ?, updated_at = NOW() 
       WHERE model = ?`, [error.message || '连接失败', provider]);
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
async function getDecryptedApiKey(provider) {
    const pool = (0, connection_1.getPool)();
    const [rows] = await pool.query('SELECT api_key_encrypted FROM llm_api_configs WHERE model = ? AND is_enabled = TRUE', [provider]);
    if (rows.length === 0 || !rows[0].api_key_encrypted) {
        return null;
    }
    try {
        return (0, encryption_1.decryptApiKey)(rows[0].api_key_encrypted);
    }
    catch (error) {
        console.error(`[LLM Config] Failed to decrypt API key for ${provider}:`, error);
        return null;
    }
}
//# sourceMappingURL=llmConfigService.js.map