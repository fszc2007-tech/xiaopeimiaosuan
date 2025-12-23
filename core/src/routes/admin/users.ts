/**
 * Admin 用户管理路由
 * 
 * 路径：/api/admin/v1/users
 */

import { Router, Request, Response } from 'express';
import { requireAdminAuth, requireSuperAdmin } from '../../middleware/adminAuth';
import {
  getUserList,
  getUserDetail,
  createTestUser,
  getOrCreateCursorTestAccount,
  resetCursorTestAccountPassword,
} from '../../modules/admin/adminUserService';
import { registerApi } from '../../utils/apiDocs';

const router = Router();

// 所有路由都需要 Admin 认证
router.use(requireAdminAuth);

/**
 * GET /api/admin/v1/users
 * 获取 C 端用户列表
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const keyword = req.query.keyword as string | undefined;

    const result = await getUserList(page, pageSize, keyword);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('[Admin Users] Get list error:', error);
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
 * GET /api/admin/v1/users/:userId
 * 获取用户详情
 */
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const result = await getUserDetail(userId);

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

    console.error('[Admin Users] Get detail error:', error);
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
 * POST /api/admin/v1/users/test
 * 创建测试用户
 */
router.post('/test', async (req: Request, res: Response) => {
  try {
    const result = await createTestUser(req.body);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    if (error.message === 'PHONE_EXISTS' || error.message === 'EMAIL_EXISTS') {
      res.status(400).json({
        success: false,
        error: {
          code: error.message,
          message: '手机号或邮箱已存在',
        },
      });
      return;
    }

    console.error('[Admin Users] Create test user error:', error);
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
 * GET /api/admin/v1/users/cursor/test-account
 * 获取或创建 Cursor 测试账号
 */
router.get('/cursor/test-account', async (req: Request, res: Response) => {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    const result = await getOrCreateCursorTestAccount(isProduction);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('[Admin Users] Get cursor test account error:', error);
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
 * POST /api/admin/v1/users/cursor/reset-password
 * 重置 Cursor 测试账号密码（仅 super_admin）
 */
router.post('/cursor/reset-password', requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    const result = await resetCursorTestAccountPassword(isProduction);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    if (error.message === 'CURSOR_TEST_ACCOUNT_NOT_FOUND') {
      res.status(404).json({
        success: false,
        error: {
          code: 'CURSOR_TEST_ACCOUNT_NOT_FOUND',
          message: 'Cursor 测试账号不存在',
        },
      });
      return;
    }

    console.error('[Admin Users] Reset cursor password error:', error);
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
  path: '/api/admin/v1/users',
  description: '获取 C 端用户列表（分页）',
  auth: true,
  request: {
    query: {
      page: 'number (页码，默认 1)',
      pageSize: 'number (每页数量，默认 20)',
      keyword: 'string (搜索关键词，可选)',
    },
  },
  response: {
    success: {
      items: 'UserDto[]',
      total: 'number',
      page: 'number',
      pageSize: 'number',
    },
  },
  tags: ['Admin', 'Users'],
});

registerApi({
  method: 'GET',
  path: '/api/admin/v1/users/:userId',
  description: '获取用户详情',
  auth: true,
  request: {
    params: {
      userId: 'string (用户 ID)',
    },
  },
  response: {
    success: {
      user: 'UserDto',
      charts: 'ChartProfileDto[]',
      stats: 'object',
    },
    error: ['USER_NOT_FOUND'],
  },
  tags: ['Admin', 'Users'],
});

registerApi({
  method: 'POST',
  path: '/api/admin/v1/users/test',
  description: '创建测试用户',
  auth: true,
  request: {
    body: {
      phone: 'string (可选)',
      email: 'string (可选)',
      password: 'string (必填)',
      nickname: 'string (可选)',
      appRegion: 'CN | HK (必填)',
      isPro: 'boolean (可选)',
    },
  },
  response: {
    success: { user: 'UserDto' },
    error: ['PHONE_EXISTS', 'EMAIL_EXISTS'],
  },
  tags: ['Admin', 'Users'],
});

registerApi({
  method: 'GET',
  path: '/api/admin/v1/users/cursor/test-account',
  description: '获取或创建 Cursor 测试账号',
  auth: true,
  response: {
    success: { account: 'CursorTestAccountDto' },
  },
  tags: ['Admin', 'Users'],
});

registerApi({
  method: 'POST',
  path: '/api/admin/v1/users/cursor/reset-password',
  description: '重置 Cursor 测试账号密码（仅 super_admin）',
  auth: true,
  response: {
    success: { password: 'string (新密码)' },
    error: ['CURSOR_TEST_ACCOUNT_NOT_FOUND', 'INSUFFICIENT_PERMISSIONS'],
  },
  tags: ['Admin', 'Users'],
});

export default router;

