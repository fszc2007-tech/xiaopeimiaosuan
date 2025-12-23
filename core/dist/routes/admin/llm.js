"use strict";
/**
 * Admin LLM 配置路由
 *
 * 路径：/api/admin/v1/llm-config
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminAuth_1 = require("../../middleware/adminAuth");
const llmConfigService_1 = require("../../modules/admin/llmConfigService");
const apiDocs_1 = require("../../utils/apiDocs");
const router = (0, express_1.Router)();
// 所有路由都需要 Admin 认证
router.use(adminAuth_1.requireAdminAuth);
/**
 * GET /api/admin/v1/llm-config
 * 获取所有 LLM 配置
 */
router.get('/', async (req, res) => {
    try {
        const configs = await (0, llmConfigService_1.getLLMConfigs)();
        res.json({
            success: true,
            data: configs,
        });
    }
    catch (error) {
        console.error('[Admin LLM] Get configs error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: '服务器内部错误',
            },
        });
    }
});
/**
 * GET /api/admin/v1/llm-config/:provider
 * 获取单个 LLM 配置
 */
router.get('/:provider', async (req, res) => {
    try {
        const { provider } = req.params;
        if (!['deepseek', 'chatgpt', 'qwen'].includes(provider)) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_PROVIDER',
                    message: 'provider 必须是 deepseek、chatgpt 或 qwen',
                },
            });
            return;
        }
        const config = await (0, llmConfigService_1.getLLMConfig)(provider);
        if (!config) {
            res.status(404).json({
                success: false,
                error: {
                    code: 'LLM_CONFIG_NOT_FOUND',
                    message: 'LLM 配置不存在',
                },
            });
            return;
        }
        res.json({
            success: true,
            data: config,
        });
    }
    catch (error) {
        console.error('[Admin LLM] Get config error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: '服务器内部错误',
            },
        });
    }
});
/**
 * PUT /api/admin/v1/llm-config/:provider
 * 更新 LLM 配置
 */
router.put('/:provider', async (req, res) => {
    try {
        const { provider } = req.params;
        if (!['deepseek', 'chatgpt', 'qwen'].includes(provider)) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_PROVIDER',
                    message: 'provider 必须是 deepseek、chatgpt 或 qwen',
                },
            });
            return;
        }
        const config = await (0, llmConfigService_1.updateLLMConfig)(provider, req.body);
        res.json({
            success: true,
            data: config,
        });
    }
    catch (error) {
        if (error.message === 'LLM_CONFIG_NOT_FOUND') {
            res.status(404).json({
                success: false,
                error: {
                    code: 'LLM_CONFIG_NOT_FOUND',
                    message: 'LLM 配置不存在',
                },
            });
            return;
        }
        console.error('[Admin LLM] Update config error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: '服务器内部错误',
            },
        });
    }
});
/**
 * POST /api/admin/v1/llm-config/:provider/set-default
 * 设置默认 LLM
 */
router.post('/:provider/set-default', async (req, res) => {
    try {
        const { provider } = req.params;
        if (!['deepseek', 'chatgpt', 'qwen'].includes(provider)) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_PROVIDER',
                    message: 'provider 必须是 deepseek、chatgpt 或 qwen',
                },
            });
            return;
        }
        await (0, llmConfigService_1.setDefaultLLM)(provider);
        res.json({
            success: true,
            data: {
                message: `${provider} 已设置为默认 LLM`,
            },
        });
    }
    catch (error) {
        console.error('[Admin LLM] Set default error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: '服务器内部错误',
            },
        });
    }
});
/**
 * POST /api/admin/v1/llm-config/:provider/test
 * 测试 LLM 连接
 */
router.post('/:provider/test', async (req, res) => {
    try {
        const { provider } = req.params;
        if (!['deepseek', 'chatgpt', 'qwen'].includes(provider)) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_PROVIDER',
                    message: 'provider 必须是 deepseek、chatgpt 或 qwen',
                },
            });
            return;
        }
        const result = await (0, llmConfigService_1.testLLMConnection)(provider);
        res.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        console.error('[Admin LLM] Test connection error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: '服务器内部错误',
            },
        });
    }
});
// ===== API 文档注册 =====
(0, apiDocs_1.registerApi)({
    method: 'GET',
    path: '/api/admin/v1/llm-config',
    description: '获取所有 LLM 配置',
    auth: true,
    response: {
        success: { configs: 'LLMConfigDto[]' },
    },
    tags: ['Admin', 'LLM'],
});
(0, apiDocs_1.registerApi)({
    method: 'GET',
    path: '/api/admin/v1/llm-config/:provider',
    description: '获取单个 LLM 配置',
    auth: true,
    request: {
        params: {
            provider: 'deepseek | chatgpt | qwen',
        },
    },
    response: {
        success: { config: 'LLMConfigDto' },
        error: ['INVALID_PROVIDER', 'LLM_CONFIG_NOT_FOUND'],
    },
    tags: ['Admin', 'LLM'],
});
(0, apiDocs_1.registerApi)({
    method: 'PUT',
    path: '/api/admin/v1/llm-config/:provider',
    description: '更新 LLM 配置',
    auth: true,
    request: {
        params: {
            provider: 'deepseek | chatgpt | qwen',
        },
        body: {
            apiKey: 'string (可选，加密存储)',
            baseUrl: 'string (可选)',
            modelName: 'string (可选)',
            enableStream: 'boolean (可选)',
            enableThinking: 'boolean (可选，仅 DeepSeek)',
            temperature: 'number (可选)',
            maxTokens: 'number (可选)',
            isEnabled: 'boolean (可选)',
        },
    },
    response: {
        success: { config: 'LLMConfigDto' },
        error: ['INVALID_PROVIDER', 'LLM_CONFIG_NOT_FOUND'],
    },
    tags: ['Admin', 'LLM'],
});
(0, apiDocs_1.registerApi)({
    method: 'POST',
    path: '/api/admin/v1/llm-config/:provider/set-default',
    description: '设置默认 LLM',
    auth: true,
    request: {
        params: {
            provider: 'deepseek | chatgpt | qwen',
        },
    },
    response: {
        success: { message: 'string' },
        error: ['INVALID_PROVIDER'],
    },
    tags: ['Admin', 'LLM'],
});
(0, apiDocs_1.registerApi)({
    method: 'POST',
    path: '/api/admin/v1/llm-config/:provider/test',
    description: '测试 LLM 连接',
    auth: true,
    request: {
        params: {
            provider: 'deepseek | chatgpt | qwen',
        },
    },
    response: {
        success: {
            status: 'success | failed',
            message: 'string',
            responseTime: 'number (毫秒)',
        },
    },
    tags: ['Admin', 'LLM'],
});
exports.default = router;
//# sourceMappingURL=llm.js.map