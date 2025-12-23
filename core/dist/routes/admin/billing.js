"use strict";
/**
 * Admin 计费统计路由
 *
 * 路径：/api/admin/v1/billing
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminAuth_1 = require("../../middleware/adminAuth");
const billingAdminService_1 = require("../../modules/admin/billingAdminService");
const apiDocs_1 = require("../../utils/apiDocs");
const router = (0, express_1.Router)();
// 所有路由都需要 Admin 认证
router.use(adminAuth_1.requireAdminAuth);
/**
 * GET /api/admin/v1/billing/summary
 * 获取概览统计
 */
router.get('/summary', async (req, res) => {
    try {
        const { start_date, end_date, provider, model } = req.query;
        const summary = await (0, billingAdminService_1.getBillingSummary)({
            startDate: start_date,
            endDate: end_date,
            provider: provider,
            model: model,
        });
        res.json({
            success: true,
            data: summary,
        });
    }
    catch (error) {
        console.error('[Admin Billing] Get summary error:', error);
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
 * GET /api/admin/v1/billing/trend
 * 获取趋势数据
 */
router.get('/trend', async (req, res) => {
    try {
        const { start_date, end_date, provider, model, granularity } = req.query;
        if (!start_date || !end_date) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_REQUEST',
                    message: 'start_date 和 end_date 为必填参数',
                },
            });
            return;
        }
        const trend = await (0, billingAdminService_1.getBillingTrend)({
            startDate: start_date,
            endDate: end_date,
            provider: provider,
            model: model,
            granularity: granularity || 'day',
        });
        res.json({
            success: true,
            data: trend,
        });
    }
    catch (error) {
        console.error('[Admin Billing] Get trend error:', error);
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
 * GET /api/admin/v1/billing/by-model
 * 按模型聚合统计
 */
router.get('/by-model', async (req, res) => {
    try {
        const { start_date, end_date, provider } = req.query;
        const byModel = await (0, billingAdminService_1.getBillingByModel)({
            startDate: start_date,
            endDate: end_date,
            provider: provider,
        });
        res.json({
            success: true,
            data: byModel,
        });
    }
    catch (error) {
        console.error('[Admin Billing] Get by-model error:', error);
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
    path: '/api/admin/v1/billing/summary',
    description: '获取概览统计（含费用预估）',
    auth: true,
    request: {
        query: {
            start_date: 'YYYY-MM-DD（可选，默认：本自然月1号）',
            end_date: 'YYYY-MM-DD（可选，默认：今天）',
            provider: 'deepseek/openai/qwen（可选）',
            model: '模型名称（可选）',
        },
    },
    response: {
        success: { data: 'BillingSummaryDto' },
        error: ['INTERNAL_ERROR'],
    },
    tags: ['Admin', 'Billing'],
});
(0, apiDocs_1.registerApi)({
    method: 'GET',
    path: '/api/admin/v1/billing/trend',
    description: '获取趋势数据',
    auth: true,
    request: {
        query: {
            start_date: 'YYYY-MM-DD（必填）',
            end_date: 'YYYY-MM-DD（必填）',
            provider: 'deepseek/openai/qwen（可选）',
            model: '模型名称（可选）',
            granularity: 'day/week/month（可选，默认：day）',
        },
    },
    response: {
        success: { data: 'BillingTrendDto' },
        error: ['INVALID_REQUEST', 'INTERNAL_ERROR'],
    },
    tags: ['Admin', 'Billing'],
});
(0, apiDocs_1.registerApi)({
    method: 'GET',
    path: '/api/admin/v1/billing/by-model',
    description: '按模型聚合统计',
    auth: true,
    request: {
        query: {
            start_date: 'YYYY-MM-DD（可选）',
            end_date: 'YYYY-MM-DD（可选）',
            provider: 'deepseek/openai/qwen（可选）',
        },
    },
    response: {
        success: { data: 'BillingByModelDto' },
        error: ['INTERNAL_ERROR'],
    },
    tags: ['Admin', 'Billing'],
});
exports.default = router;
//# sourceMappingURL=billing.js.map