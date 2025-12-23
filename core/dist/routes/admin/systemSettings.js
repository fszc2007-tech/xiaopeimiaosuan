"use strict";
/**
 * Admin 系统配置路由
 *
 * 路径：/api/admin/v1/system/*
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
const express_1 = require("express");
const adminAuth_1 = require("../../middleware/adminAuth");
const systemConfigService = __importStar(require("../../services/systemConfigService"));
const apiDocs_1 = require("../../utils/apiDocs");
const router = (0, express_1.Router)();
// 所有路由都需要 Admin 认证
router.use(adminAuth_1.adminAuthMiddleware);
// ===== API 文档注册 =====
(0, apiDocs_1.registerApi)({
    method: 'GET',
    path: '/api/admin/v1/system/settings',
    description: '获取所有系统配置',
    auth: true,
    response: {
        success: {
            settings: [
                {
                    key: 'string',
                    value: 'any',
                    description: 'string',
                    updatedAt: 'string',
                    updatedBy: 'string | null',
                },
            ],
        },
        error: ['UNAUTHORIZED'],
    },
    tags: ['Admin', 'System'],
});
(0, apiDocs_1.registerApi)({
    method: 'GET',
    path: '/api/admin/v1/system/settings/:key',
    description: '获取单个系统配置',
    auth: true,
    request: {
        params: {
            key: 'string (配置键)',
        },
    },
    response: {
        success: {
            key: 'string',
            value: 'any',
            description: 'string',
        },
        error: ['SETTING_NOT_FOUND'],
    },
    tags: ['Admin', 'System'],
});
(0, apiDocs_1.registerApi)({
    method: 'PUT',
    path: '/api/admin/v1/system/settings/rate-limit',
    description: '更新限流开关',
    auth: true,
    request: {
        body: {
            bazi_compute: 'boolean (排盘限流)',
            chat: 'boolean (对话限流)',
        },
    },
    response: {
        success: { message: 'string' },
        error: ['INVALID_INPUT'],
    },
    tags: ['Admin', 'System'],
});
(0, apiDocs_1.registerApi)({
    method: 'PUT',
    path: '/api/admin/v1/system/settings/pro-features',
    description: '更新 Pro 功能门禁',
    auth: true,
    request: {
        body: {
            shensha: 'boolean (神煞解读)',
            overview: 'boolean (命盘总览)',
            advanced_chat: 'boolean (高级对话)',
        },
    },
    response: {
        success: { message: 'string' },
        error: ['INVALID_INPUT'],
    },
    tags: ['Admin', 'System'],
});
(0, apiDocs_1.registerApi)({
    method: 'PUT',
    path: '/api/admin/v1/system/settings/rate-limit-config',
    description: '更新限流次数配置',
    auth: true,
    request: {
        body: {
            bazi_compute_daily_limit: 'number',
            bazi_compute_daily_limit_pro: 'number',
            chat_daily_limit: 'number',
            chat_daily_limit_pro: 'number',
        },
    },
    response: {
        success: { message: 'string' },
        error: ['INVALID_INPUT'],
    },
    tags: ['Admin', 'System'],
});
// ===== 路由实现 =====
/**
 * GET /api/admin/v1/system/settings
 * 获取所有系统配置
 */
router.get('/settings', async (req, res, next) => {
    try {
        const settings = await systemConfigService.getAllSystemSettings();
        res.json({
            success: true,
            data: { settings },
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/admin/v1/system/settings/:key
 * 获取单个系统配置
 */
router.get('/settings/:key', async (req, res, next) => {
    try {
        const { key } = req.params;
        const value = await systemConfigService.getSystemSetting(key);
        if (value === null) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'SETTING_NOT_FOUND',
                    message: `配置项 ${key} 不存在`,
                },
            });
        }
        res.json({
            success: true,
            data: {
                key,
                value,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * PUT /api/admin/v1/system/settings/rate-limit
 * 更新限流开关
 */
router.put('/settings/rate-limit', async (req, res, next) => {
    try {
        const { bazi_compute, chat } = req.body;
        const adminId = req.adminId;
        // 验证输入
        if (typeof bazi_compute !== 'boolean' || typeof chat !== 'boolean') {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_INPUT',
                    message: '参数错误：bazi_compute 和 chat 必须是布尔值',
                },
            });
        }
        // 更新配置
        await systemConfigService.updateSystemSetting('rate_limit_enabled', { bazi_compute, chat }, adminId);
        res.json({
            success: true,
            data: {
                message: '限流开关更新成功',
                config: { bazi_compute, chat },
            },
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * PUT /api/admin/v1/system/settings/pro-features
 * 更新 Pro 功能门禁
 */
router.put('/settings/pro-features', async (req, res, next) => {
    try {
        const { shensha, overview, advanced_chat } = req.body;
        const adminId = req.adminId;
        // 验证输入
        if (typeof shensha !== 'boolean' ||
            typeof overview !== 'boolean' ||
            typeof advanced_chat !== 'boolean') {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_INPUT',
                    message: '参数错误：shensha、overview 和 advanced_chat 必须是布尔值',
                },
            });
        }
        // 更新配置
        await systemConfigService.updateSystemSetting('pro_feature_gate', { shensha, overview, advanced_chat }, adminId);
        res.json({
            success: true,
            data: {
                message: 'Pro 功能门禁更新成功',
                config: { shensha, overview, advanced_chat },
            },
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * PUT /api/admin/v1/system/settings/rate-limit-config
 * 更新限流次数配置
 */
router.put('/settings/rate-limit-config', async (req, res, next) => {
    try {
        const { bazi_compute_daily_limit, bazi_compute_daily_limit_pro, chat_daily_limit, chat_daily_limit_pro, } = req.body;
        const adminId = req.adminId;
        // 验证输入
        if (typeof bazi_compute_daily_limit !== 'number' ||
            typeof bazi_compute_daily_limit_pro !== 'number' ||
            typeof chat_daily_limit !== 'number' ||
            typeof chat_daily_limit_pro !== 'number' ||
            bazi_compute_daily_limit < 0 ||
            bazi_compute_daily_limit_pro < 0 ||
            chat_daily_limit < 0 ||
            chat_daily_limit_pro < 0) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_INPUT',
                    message: '参数错误：所有限流次数必须是非负整数',
                },
            });
        }
        // 更新配置
        await systemConfigService.updateSystemSetting('rate_limit_config', {
            bazi_compute_daily_limit,
            bazi_compute_daily_limit_pro,
            chat_daily_limit,
            chat_daily_limit_pro,
        }, adminId);
        res.json({
            success: true,
            data: {
                message: '限流次数配置更新成功',
                config: {
                    bazi_compute_daily_limit,
                    bazi_compute_daily_limit_pro,
                    chat_daily_limit,
                    chat_daily_limit_pro,
                },
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=systemSettings.js.map