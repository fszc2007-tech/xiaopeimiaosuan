/**
 * Admin 计费统计路由
 * 
 * 路径：/api/admin/v1/billing
 */

import { Router, Request, Response } from 'express';
import { requireAdminAuth } from '../../middleware/adminAuth';
import {
  getBillingSummary,
  getBillingTrend,
  getBillingByModel,
} from '../../modules/admin/billingAdminService';
import { registerApi } from '../../utils/apiDocs';

const router = Router();

// 所有路由都需要 Admin 认证
router.use(requireAdminAuth);

/**
 * GET /api/admin/v1/billing/summary
 * 获取概览统计
 */
router.get('/summary', async (req: Request, res: Response) => {
  try {
    const { start_date, end_date, provider, model } = req.query;
    
    const summary = await getBillingSummary({
      startDate: start_date as string | undefined,
      endDate: end_date as string | undefined,
      provider: provider as string | undefined,
      model: model as string | undefined,
    });
    
    res.json({
      success: true,
      data: summary,
    });
  } catch (error: any) {
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
router.get('/trend', async (req: Request, res: Response) => {
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
    
    const trend = await getBillingTrend({
      startDate: start_date as string,
      endDate: end_date as string,
      provider: provider as string | undefined,
      model: model as string | undefined,
      granularity: (granularity as 'day' | 'week' | 'month') || 'day',
    });
    
    res.json({
      success: true,
      data: trend,
    });
  } catch (error: any) {
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
router.get('/by-model', async (req: Request, res: Response) => {
  try {
    const { start_date, end_date, provider } = req.query;
    
    const byModel = await getBillingByModel({
      startDate: start_date as string | undefined,
      endDate: end_date as string | undefined,
      provider: provider as string | undefined,
    });
    
    res.json({
      success: true,
      data: byModel,
    });
  } catch (error: any) {
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

registerApi({
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

registerApi({
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

registerApi({
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

export default router;


