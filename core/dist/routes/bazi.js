"use strict";
/**
 * 命盘路由
 *
 * 路径：/api/v1/bazi/*
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
const rateLimit_1 = require("../middleware/rateLimit");
const baziService = __importStar(require("../modules/bazi/baziService"));
const chartProfileService = __importStar(require("../services/chartProfileService"));
const shenshaReadingService = __importStar(require("../modules/shensha/shenshaReadingService"));
const shishenReadingService = __importStar(require("../modules/shishen/shishenReadingService"));
const dayStemService = __importStar(require("../modules/dayStem/dayStemService"));
const router = (0, express_1.Router)();
// 日主解读接口（公开，无需认证）
router.get('/day-stem/:stem', async (req, res, next) => {
    try {
        const { stem } = req.params;
        // 验证日主天干
        const validStems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
        if (!validStems.includes(stem)) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_STEM',
                    message: '无效的日主天干',
                    details: { stem, validStems },
                },
            });
        }
        // 获取解读内容
        const reading = await dayStemService.getDayStemReading(stem);
        if (!reading) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'DAY_STEM_READING_NOT_FOUND',
                    message: '该日主的解读内容尚未配置',
                    details: { stem },
                },
            });
        }
        res.json({
            success: true,
            data: reading,
        });
    }
    catch (error) {
        next(error);
    }
});
// 所有其他命盘路由都需要认证
router.use(auth_1.authMiddleware);
/**
 * POST /api/v1/bazi/chart
 * 计算命盘
 *
 * 注意：此接口同时创建 bazi_charts 和 chart_profiles 记录
 */
router.post('/chart', (0, rateLimit_1.createRateLimitMiddleware)('bazi_compute'), async (req, res, next) => {
    try {
        const userId = req.userId;
        const { name, gender, birth, relationType = 'self', relationLabel, notes, forceRecompute } = req.body;
        // 验证输入
        if (!name || !gender || !birth) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_INPUT',
                    message: '缺少必要参数：name, gender, birth',
                },
            });
        }
        // 1. 调用命盘计算服务（已包含创建 chart_profile）
        const chartResult = await baziService.computeChart({
            userId,
            name,
            gender,
            birth,
            forceRecompute,
            relationType, // 传递关系类型
        });
        res.json({
            success: true,
            data: {
                chartId: chartResult.chartId,
                profileId: chartResult.chartProfileId,
                result: chartResult.result,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/v1/bazi/charts
 * 获取命盘档案列表（含命盘数据）
 */
router.get('/charts', async (req, res, next) => {
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
 * GET /api/v1/bazi/charts/:chartId
 * 获取命盘详情
 */
router.get('/charts/:chartId', async (req, res, next) => {
    try {
        const userId = req.userId;
        const { chartId } = req.params;
        const result = await baziService.getChartDetail({ userId, chartId });
        res.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        if (error.message === 'Chart not found') {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'CHART_NOT_FOUND',
                    message: '命盘不存在',
                },
            });
        }
        next(error);
    }
});
/**
 * DELETE /api/v1/bazi/charts/:chartId
 * 删除命盘
 */
router.delete('/charts/:chartId', async (req, res, next) => {
    try {
        const userId = req.userId;
        const { chartId } = req.params;
        await baziService.deleteChart({ userId, chartId });
        res.json({
            success: true,
            data: {
                message: '删除成功',
            },
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/v1/bazi/shensha/:code
 * 获取神煞解读内容
 *
 * Query Params:
 * - pillarType: 'year' | 'month' | 'day' | 'hour' (可选)
 * - gender: 'male' | 'female' (必填，排盤時必然有性別)
 *
 * 如果数据库中没有数据，返回错误（不降级到 LLM）
 */
router.get('/shensha/:code', async (req, res, next) => {
    try {
        const { code } = req.params;
        const { pillarType, gender } = req.query;
        // 驗證性別參數（必填）
        if (!gender || (gender !== 'male' && gender !== 'female')) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_GENDER',
                    message: '性別參數必填且必須為 male 或 female',
                },
            });
        }
        // 获取解读内容（性別必填）
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/a96a12ed-318a-4e03-9333-94a90fa8074e', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'bazi.ts:227', message: 'Requesting shensha reading', data: { code, pillarType, gender }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'H1' }) }).catch(() => { });
        // #endregion
        const reading = await shenshaReadingService.getShenshaReading(code, pillarType, gender);
        if (!reading) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'SHENSHA_READING_NOT_FOUND',
                    message: '該神煞的解讀內容尚未配置',
                    details: {
                        shensha_code: code,
                        pillar_type: pillarType || null,
                        gender: gender,
                    },
                },
            });
        }
        // #region agent log
        const readingName = reading.name || '';
        const readingSummary = reading.summary || '';
        fetch('http://127.0.0.1:7243/ingest/a96a12ed-318a-4e03-9333-94a90fa8074e', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'bazi.ts:250', message: 'Sending shensha reading response', data: { code: reading.code, name: readingName, nameLength: readingName.length, nameBytes: Buffer.from(readingName).length, summaryPreview: readingSummary.substring(0, 50), timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'H1' } }) }).catch(() => { });
        // #endregion
        // 确保响应使用 UTF-8 编码
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.json({
            success: true,
            data: reading,
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/v1/bazi/shishen/:code
 * 获取十神解读内容
 *
 * Query Params:
 * - pillarType: 'year' | 'month' | 'day' | 'hour' (可选)
 * - gender: 'male' | 'female' (必填，排盤時必然有性別)
 * - chartId: string (可选，用于判断喜神/忌神)
 */
router.get('/shishen/:code', async (req, res, next) => {
    try {
        const { code } = req.params;
        const { pillarType, gender, chartId } = req.query;
        // 驗證性別參數（必填）
        if (!gender || (gender !== 'male' && gender !== 'female')) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_GENDER',
                    message: '性別參數必填且必須為 male 或 female',
                },
            });
        }
        // 获取命盘数据（用于判断喜神/忌神）
        let baziData = null;
        if (chartId && req.userId) {
            try {
                baziData = await baziService.getChartDetail({
                    userId: req.userId,
                    chartId: chartId
                });
            }
            catch (e) {
                // 忽略获取命盘失败的错误
            }
        }
        // 获取解读内容
        const reading = await shishenReadingService.getShishenReading(code, pillarType, gender, baziData);
        if (!reading) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'SHISHEN_READING_NOT_FOUND',
                    message: '該十神的解讀內容尚未配置',
                    details: {
                        shishen_code: code,
                        pillar_type: pillarType || null,
                        gender: gender,
                    },
                },
            });
        }
        res.json({
            success: true,
            data: reading,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=bazi.js.map