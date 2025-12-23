/**
 * Pro 订阅路由
 * 
 * 路径：/api/v1/pro
 */

import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { requirePro } from '../middleware/requirePro';
import {
  subscribe,
  getProStatus,
  getSubscriptionHistory,
} from '../modules/pro/proService';
import { registerApi } from '../utils/apiDocs';

const router = Router();

// 所有路由都需要用户认证
router.use(requireAuth);

/**
 * GET /api/v1/pro/status
 * 获取当前用户的 Pro 状态（包含 AI 次数信息）
 */
router.get('/status', async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    // 獲取 Pro 狀態
    const status = await getProStatus(userId);
    
    // 獲取 AI 使用狀態
    const { getAIUsageStatus } = await import('../modules/ai/aiQuotaService');
    const aiUsage = await getAIUsageStatus(userId);

    res.json({
      success: true,
      data: {
        ...status,
        ...aiUsage,
      },
    });
  } catch (error: any) {
    if (error.message === 'USER_NOT_FOUND') {
      res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: '用户不存在',
        },
      });
      return;
    }

    console.error('[Pro] Get status error:', error);
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
 * POST /api/v1/pro/subscribe
 * 订阅 Pro（模拟接口）
 */
router.post('/subscribe', async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { plan } = req.body;

    if (!plan || !['yearly', 'monthly', 'quarterly', 'lifetime'].includes(plan)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PLAN',
          message: 'plan 必须是 yearly、monthly、quarterly 或 lifetime',
        },
      });
      return;
    }

    const result = await subscribe(userId, plan);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    if (error.message === 'USER_NOT_FOUND') {
      res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: '用户不存在',
        },
      });
      return;
    }

    console.error('[Pro] Subscribe error:', error);
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
 * POST /api/v1/pro/fake-subscribe
 * 假支付訂閱（測試用）
 * 
 * 注意：此接口即将废弃，建议使用 /dev/force-pro（开发环境）或真实支付接口（生产环境）
 */
router.post('/fake-subscribe', async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { plan } = req.body;

    // 支持 monthly、quarterly、yearly 三种方案
    if (!plan || !['yearly', 'monthly', 'quarterly'].includes(plan)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PLAN',
          message: 'plan 必須是 monthly、quarterly 或 yearly',
        },
      });
      return;
    }

    const result = await subscribe(userId, plan);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    if (error.message === 'USER_NOT_FOUND') {
      res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: '用戶不存在',
        },
      });
      return;
    }

    console.error('[Pro] Fake subscribe error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '服務器內部錯誤',
      },
    });
  }
});

/**
 * GET /api/v1/pro/subscriptions
 * 获取订阅历史
 */
router.get('/subscriptions', async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    const subscriptions = await getSubscriptionHistory(userId);

    res.json({
      success: true,
      data: subscriptions,
    });
  } catch (error: any) {
    console.error('[Pro] Get subscriptions error:', error);
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
 * GET /api/v1/pro/features (示例：Pro 专属功能)
 * 
 * 此接口需要 Pro 权限
 */
router.get('/features', requirePro, async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        message: '这是 Pro 专属功能',
        features: [
          '无限次数排盘',
          '无限次数对话',
          '深度解读（DeepSeek Thinking 模式）',
          '高级分析报告',
          '优先客服支持',
        ],
      },
    });
  } catch (error: any) {
    console.error('[Pro] Get features error:', error);
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
  path: '/api/v1/pro/status',
  description: '获取当前用户的 Pro 状态',
  auth: true,
  response: {
    success: {
      isPro: 'boolean',
      expiresAt: 'string (ISO 8601，可选)',
      plan: 'yearly | monthly | lifetime (可选)',
      features: 'string[]',
    },
    error: ['USER_NOT_FOUND'],
  },
  tags: ['Pro'],
});

registerApi({
  method: 'POST',
  path: '/api/v1/pro/subscribe',
  description: '订阅 Pro（模拟接口，无真实支付）',
  auth: true,
  request: {
    body: {
      plan: 'yearly | monthly | lifetime (必填)',
    },
  },
  response: {
    success: {
      subscription: 'SubscriptionDto',
      user: '{ isPro, proExpiresAt, proPlan }',
    },
    error: ['INVALID_PLAN', 'USER_NOT_FOUND'],
  },
  tags: ['Pro'],
});

registerApi({
  method: 'GET',
  path: '/api/v1/pro/subscriptions',
  description: '获取订阅历史',
  auth: true,
  response: {
    success: {
      subscriptions: 'SubscriptionDto[]',
    },
  },
  tags: ['Pro'],
});

registerApi({
  method: 'GET',
  path: '/api/v1/pro/features',
  description: 'Pro 专属功能（示例接口，需要 Pro 权限）',
  auth: true,
  response: {
    success: {
      message: 'string',
      features: 'string[]',
    },
    error: ['PRO_REQUIRED'],
  },
  tags: ['Pro'],
});

export default router;

