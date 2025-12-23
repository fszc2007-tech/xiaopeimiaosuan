/**
 * Admin 系统配置路由
 * 
 * 路径：/api/admin/v1/system/*
 */

import { Router, Request, Response, NextFunction } from 'express';
import { adminAuthMiddleware } from '../../middleware/adminAuth';
import * as systemConfigService from '../../services/systemConfigService';
import { ApiResponse } from '../../types';
import { registerApi } from '../../utils/apiDocs';

const router = Router();

// 所有路由都需要 Admin 认证
router.use(adminAuthMiddleware);

// ===== API 文档注册 =====

registerApi({
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

registerApi({
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

registerApi({
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

registerApi({
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

registerApi({
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
router.get('/settings', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await systemConfigService.getAllSystemSettings();

    res.json({
      success: true,
      data: { settings },
    } as ApiResponse);
  } catch (error: any) {
    next(error);
  }
});

/**
 * GET /api/admin/v1/system/settings/:key
 * 获取单个系统配置
 */
router.get('/settings/:key', async (req: Request, res: Response, next: NextFunction) => {
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
      } as ApiResponse);
    }

    res.json({
      success: true,
      data: {
        key,
        value,
      },
    } as ApiResponse);
  } catch (error: any) {
    next(error);
  }
});

/**
 * PUT /api/admin/v1/system/settings/rate-limit
 * 更新限流开关
 */
router.put('/settings/rate-limit', async (req: Request, res: Response, next: NextFunction) => {
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
      } as ApiResponse);
    }

    // 更新配置
    await systemConfigService.updateSystemSetting(
      'rate_limit_enabled',
      { bazi_compute, chat },
      adminId
    );

    res.json({
      success: true,
      data: {
        message: '限流开关更新成功',
        config: { bazi_compute, chat },
      },
    } as ApiResponse);
  } catch (error: any) {
    next(error);
  }
});

/**
 * PUT /api/admin/v1/system/settings/pro-features
 * 更新 Pro 功能门禁
 */
router.put('/settings/pro-features', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { shensha, overview, advanced_chat } = req.body;
    const adminId = req.adminId;

    // 验证输入
    if (
      typeof shensha !== 'boolean' ||
      typeof overview !== 'boolean' ||
      typeof advanced_chat !== 'boolean'
    ) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: '参数错误：shensha、overview 和 advanced_chat 必须是布尔值',
        },
      } as ApiResponse);
    }

    // 更新配置
    await systemConfigService.updateSystemSetting(
      'pro_feature_gate',
      { shensha, overview, advanced_chat },
      adminId
    );

    res.json({
      success: true,
      data: {
        message: 'Pro 功能门禁更新成功',
        config: { shensha, overview, advanced_chat },
      },
    } as ApiResponse);
  } catch (error: any) {
    next(error);
  }
});

/**
 * PUT /api/admin/v1/system/settings/rate-limit-config
 * 更新限流次数配置
 */
router.put('/settings/rate-limit-config', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      bazi_compute_daily_limit,
      bazi_compute_daily_limit_pro,
      chat_daily_limit,
      chat_daily_limit_pro,
    } = req.body;
    const adminId = req.adminId;

    // 验证输入
    if (
      typeof bazi_compute_daily_limit !== 'number' ||
      typeof bazi_compute_daily_limit_pro !== 'number' ||
      typeof chat_daily_limit !== 'number' ||
      typeof chat_daily_limit_pro !== 'number' ||
      bazi_compute_daily_limit < 0 ||
      bazi_compute_daily_limit_pro < 0 ||
      chat_daily_limit < 0 ||
      chat_daily_limit_pro < 0
    ) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: '参数错误：所有限流次数必须是非负整数',
        },
      } as ApiResponse);
    }

    // 更新配置
    await systemConfigService.updateSystemSetting(
      'rate_limit_config',
      {
        bazi_compute_daily_limit,
        bazi_compute_daily_limit_pro,
        chat_daily_limit,
        chat_daily_limit_pro,
      },
      adminId
    );

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
    } as ApiResponse);
  } catch (error: any) {
    next(error);
  }
});

export default router;

