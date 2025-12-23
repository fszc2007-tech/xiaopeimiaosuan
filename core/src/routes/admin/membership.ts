/**
 * Admin 會員管理路由
 * 
 * 路徑：/api/admin/v1/membership
 * 
 * 功能：
 * 1. 獲取會員用戶列表
 * 2. 獲取用戶會員詳情
 * 3. 手動開通 / 延長會員
 * 4. 取消會員
 * 5. 重置今日 AI 次數
 * 
 * 遵循文檔：
 * - Admin會員管理設計方案 v1（與現有系統對齊）
 */

import { Router, Request, Response } from 'express';
import { requireAdminAuth } from '../../middleware/adminAuth';
import {
  getMembershipUserList,
  getMembershipUserDetail,
  grantMembership,
  revokeMembership,
  resetTodayAiCalls,
  type GrantMembershipRequestDto,
} from '../../modules/admin/adminMembershipService';
import { registerApi } from '../../utils/apiDocs';

const router = Router();

// 所有路由都需要 Admin 認證
router.use(requireAdminAuth);

/**
 * GET /api/admin/v1/membership/users
 * 獲取會員用戶列表
 */
router.get('/users', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const q = req.query.q as string | undefined;
    const isPro = req.query.isPro === 'true' ? true : req.query.isPro === 'false' ? false : undefined;

    const result = await getMembershipUserList(page, pageSize, q, isPro);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('[Admin Membership] Get list error:', error);
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
 * GET /api/admin/v1/membership/users/:userId
 * 獲取用戶會員詳情
 */
router.get('/users/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const result = await getMembershipUserDetail(userId);

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

    console.error('[Admin Membership] Get detail error:', error);
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
 * POST /api/admin/v1/membership/users/:userId/grant
 * Admin 開通 / 延長會員
 */
router.post('/users/:userId/grant', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { plan, mode } = req.body as GrantMembershipRequestDto;

    // 驗證請求參數
    if (!plan || !['monthly', 'quarterly', 'yearly'].includes(plan)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: '方案參數無效，必須為 monthly、quarterly 或 yearly',
        },
      });
      return;
    }

    if (!mode || !['extend', 'fromNow'].includes(mode)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: '模式參數無效，必須為 extend 或 fromNow',
        },
      });
      return;
    }

    const result = await grantMembership(userId, plan, mode);

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

    console.error('[Admin Membership] Grant error:', error);
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
 * POST /api/admin/v1/membership/users/:userId/revoke
 * Admin 取消會員
 */
router.post('/users/:userId/revoke', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const result = await revokeMembership(userId);

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

    console.error('[Admin Membership] Revoke error:', error);
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
 * POST /api/admin/v1/membership/users/:userId/reset-ai-today
 * Admin 重置今日 AI 次數
 */
router.post('/users/:userId/reset-ai-today', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const result = await resetTodayAiCalls(userId);

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

    console.error('[Admin Membership] Reset AI today error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '服務器內部錯誤',
      },
    });
  }
});

// ===== API 文檔註冊 =====

registerApi({
  method: 'GET',
  path: '/api/admin/v1/membership/users',
  description: '獲取會員用戶列表（搜尋、篩選、分頁）',
  auth: true,
  request: {
    query: {
      page: 'number (頁碼，預設 1)',
      pageSize: 'number (每頁數量，預設 20)',
      q: 'string (搜尋關鍵字：手機或 userId，可選)',
      isPro: 'boolean (會員狀態篩選：true/false，可選)',
    },
  },
  response: {
    success: {
      items: 'MembershipUserListItemDto[]',
      total: 'number',
      page: 'number',
      pageSize: 'number',
    },
  },
  tags: ['Admin', 'Membership'],
});

registerApi({
  method: 'GET',
  path: '/api/admin/v1/membership/users/:userId',
  description: '獲取用戶會員詳情（含 AI 次數狀態）',
  auth: true,
  request: {
    params: {
      userId: 'string (用戶 ID)',
    },
  },
  response: {
    success: 'MembershipUserDetailDto',
    error: ['USER_NOT_FOUND'],
  },
  tags: ['Admin', 'Membership'],
});

registerApi({
  method: 'POST',
  path: '/api/admin/v1/membership/users/:userId/grant',
  description: 'Admin 開通 / 延長會員',
  auth: true,
  request: {
    params: {
      userId: 'string (用戶 ID)',
    },
    body: {
      plan: 'string (方案：monthly | quarterly | yearly)',
      mode: 'string (模式：extend | fromNow)',
    },
  },
  response: {
    success: 'GrantMembershipResponseDto',
    error: ['USER_NOT_FOUND', 'INVALID_REQUEST'],
  },
  tags: ['Admin', 'Membership'],
});

registerApi({
  method: 'POST',
  path: '/api/admin/v1/membership/users/:userId/revoke',
  description: 'Admin 取消會員',
  auth: true,
  request: {
    params: {
      userId: 'string (用戶 ID)',
    },
  },
  response: {
    success: 'RevokeMembershipResponseDto',
    error: ['USER_NOT_FOUND'],
  },
  tags: ['Admin', 'Membership'],
});

registerApi({
  method: 'POST',
  path: '/api/admin/v1/membership/users/:userId/reset-ai-today',
  description: 'Admin 重置今日 AI 次數',
  auth: true,
  request: {
    params: {
      userId: 'string (用戶 ID)',
    },
  },
  response: {
    success: 'ResetAiTodayResponseDto',
    error: ['USER_NOT_FOUND'],
  },
  tags: ['Admin', 'Membership'],
});

export default router;


