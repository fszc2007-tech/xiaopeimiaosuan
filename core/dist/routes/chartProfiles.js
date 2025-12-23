"use strict";
/**
 * 命主档案路由
 *
 * 路径：/api/v1/bazi/charts/*
 *
 * 注意：档案管理相关的路由都放在 bazi 路由组下，保持 API 一致性
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
const auth_1 = require("../middleware/auth");
const chartProfileService = __importStar(require("../services/chartProfileService"));
const apiDocs_1 = require("../utils/apiDocs");
const router = (0, express_1.Router)();
// 所有路由都需要认证
router.use(auth_1.authMiddleware);
// ===== API 文档注册 =====
(0, apiDocs_1.registerApi)({
    method: 'GET',
    path: '/api/v1/bazi/charts',
    description: '获取命盘档案列表',
    auth: true,
    request: {
        query: {
            search: 'string (可选，搜索姓名/关系)',
            relationType: 'string[] (可选，关系筛选)',
            sortBy: '"recent" | "created" | "relation" (可选，排序方式)',
            limit: 'number (可选，每页数量，默认 50)',
            offset: 'number (可选，偏移量，默认 0)',
        },
    },
    response: {
        success: {
            profiles: 'ChartProfile[]',
            total: 'number',
        },
        error: ['UNAUTHORIZED'],
    },
    tags: ['Bazi', 'ChartProfiles'],
});
(0, apiDocs_1.registerApi)({
    method: 'PUT',
    path: '/api/v1/bazi/charts/:chartId',
    description: '更新命盘档案',
    auth: true,
    request: {
        params: {
            chartId: 'string (命盘 ID)',
        },
        body: {
            name: 'string (可选，姓名)',
            relationType: 'RelationType (可选，关系类型)',
            relationLabel: 'string (可选，关系标签)',
            notes: 'string (可选，备注)',
        },
    },
    response: {
        success: {
            profile: 'ChartProfile',
        },
        error: ['PROFILE_NOT_FOUND', 'INVALID_INPUT'],
    },
    tags: ['Bazi', 'ChartProfiles'],
});
(0, apiDocs_1.registerApi)({
    method: 'DELETE',
    path: '/api/v1/bazi/charts/:chartId',
    description: '删除命盘档案',
    auth: true,
    request: {
        params: {
            chartId: 'string (命盘 ID)',
        },
    },
    response: {
        success: {
            message: 'string',
        },
        error: ['PROFILE_NOT_FOUND'],
    },
    tags: ['Bazi', 'ChartProfiles'],
});
// ===== 路由实现 =====
/**
 * GET /api/v1/bazi/charts
 * 获取命盘档案列表
 */
router.get('/', async (req, res, next) => {
    try {
        const userId = req.userId;
        const { search, relationType, sortBy, limit, offset } = req.query;
        // 解析关系类型筛选
        let relationTypeArray;
        if (relationType) {
            if (typeof relationType === 'string') {
                relationTypeArray = [relationType];
            }
            else if (Array.isArray(relationType)) {
                relationTypeArray = relationType;
            }
        }
        // 获取档案列表
        const { profiles, total } = await chartProfileService.getChartProfiles(userId, {
            search: search,
            relationType: relationTypeArray,
            sortBy: sortBy,
            limit: limit ? parseInt(limit) : 50,
            offset: offset ? parseInt(offset) : 0,
        });
        res.json({
            success: true,
            data: {
                profiles,
                total,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * PUT /api/v1/bazi/charts/:chartId
 * 更新命盘档案
 */
router.put('/:chartId', async (req, res, next) => {
    try {
        const userId = req.userId;
        const { chartId } = req.params;
        const { name, relationType, relationLabel, notes } = req.body;
        // 需要先找到对应的 profile_id
        const { profiles } = await chartProfileService.getChartProfiles(userId, { limit: 1000 });
        const targetProfile = profiles.find(p => p.chartId === chartId);
        if (!targetProfile) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'PROFILE_NOT_FOUND',
                    message: '命盘档案不存在',
                },
            });
        }
        const updatedProfile = await chartProfileService.updateChartProfile(targetProfile.profileId, userId, {
            name,
            relationType,
            relationLabel,
            notes,
        });
        res.json({
            success: true,
            data: {
                profile: updatedProfile,
            },
        });
    }
    catch (error) {
        if (error.message === 'PROFILE_NOT_FOUND') {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'PROFILE_NOT_FOUND',
                    message: '命盘档案不存在',
                },
            });
        }
        next(error);
    }
});
/**
 * DELETE /api/v1/bazi/charts/:chartId
 * 删除命盘档案
 *
 * 支持两种方式：
 * 1. 使用 chartId（如果存在）
 * 2. 使用 profileId（如果 chartId 不存在或为 undefined）
 */
router.delete('/:chartId', async (req, res, next) => {
    try {
        const userId = req.userId;
        const { chartId } = req.params;
        // 如果 chartId 是 'undefined' 字符串，说明前端传递的是 undefined
        // 或者如果 chartId 为空，尝试使用 profileId 查找
        let targetProfile;
        if (chartId && chartId !== 'undefined' && chartId !== 'null') {
            // 尝试通过 chartId 查找
            const { profiles } = await chartProfileService.getChartProfiles(userId, { limit: 1000 });
            targetProfile = profiles.find(p => p.chartId === chartId);
        }
        // 如果通过 chartId 找不到，尝试通过 profileId 查找（chartId 可能就是 profileId）
        if (!targetProfile) {
            const { profiles } = await chartProfileService.getChartProfiles(userId, { limit: 1000 });
            targetProfile = profiles.find(p => p.profileId === chartId);
        }
        if (!targetProfile) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'PROFILE_NOT_FOUND',
                    message: '命盘档案不存在',
                },
            });
        }
        await chartProfileService.deleteChartProfile(targetProfile.profileId, userId);
        res.json({
            success: true,
            data: {
                message: '命盘档案已删除',
            },
        });
    }
    catch (error) {
        if (error.message === 'PROFILE_NOT_FOUND') {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'PROFILE_NOT_FOUND',
                    message: '命盘档案不存在',
                },
            });
        }
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=chartProfiles.js.map