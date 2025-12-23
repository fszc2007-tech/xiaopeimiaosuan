/**
 * 解读路由
 * 
 * 路径：/api/v1/reading/*
 */

import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middleware/auth';
import { requireProFeature } from '../middleware/requireProFeature';
import * as readingService from '../modules/reading/readingService';
import { ApiResponse } from '../types';

const router = Router();

// 所有解读路由都需要认证
router.use(authMiddleware);

/**
 * POST /api/v1/reading/shensha
 * 神煞解读（需要 Pro 权限，可通过 Admin 配置）
 */
router.post('/shensha', requireProFeature('shensha'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const { chartId, shenshaCode, shenshaName, userQuestion, model } = req.body;
    
    if (!chartId || !shenshaCode || !shenshaName) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: '缺少必要参数：chartId, shenshaCode, shenshaName',
        },
      } as ApiResponse);
    }
    
    const result = await readingService.readShensha({
      userId,
      chartId,
      shenshaCode,
      shenshaName,
      userQuestion,
      model,
    });
    
    res.json({
      success: true,
      data: result,
    } as ApiResponse);
  } catch (error: any) {
    next(error);
  }
});

/**
 * POST /api/v1/reading/overview
 * 命盘总览解读（需要 Pro 权限，可通过 Admin 配置）
 */
router.post('/overview', requireProFeature('overview'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const { chartId, sectionKey, userQuestion, model } = req.body;
    
    if (!chartId || !sectionKey) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: '缺少必要参数：chartId, sectionKey',
        },
      } as ApiResponse);
    }
    
    const result = await readingService.readOverview({
      userId,
      chartId,
      sectionKey,
      userQuestion,
      model,
    });
    
    res.json({
      success: true,
      data: result,
    } as ApiResponse);
  } catch (error: any) {
    next(error);
  }
});

/**
 * POST /api/v1/reading/chat
 * 通用解读（聊天）
 */
router.post('/chat', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const { chartId, userQuestion, conversationId, model } = req.body;
    
    if (!chartId || !userQuestion) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: '缺少必要参数：chartId, userQuestion',
        },
      } as ApiResponse);
    }
    
    const result = await readingService.readGeneral({
      userId,
      chartId,
      userQuestion,
      conversationId,
      model,
    });
    
    res.json({
      success: true,
      data: result,
    } as ApiResponse);
  } catch (error: any) {
    next(error);
  }
});

/**
 * POST /api/v1/reading/follow-ups
 * 生成追问建议
 */
router.post('/follow-ups', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { lastUserQuestion, lastAssistantResponse, model } = req.body;
    
    if (!lastUserQuestion || !lastAssistantResponse) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: '缺少必要参数：lastUserQuestion, lastAssistantResponse',
        },
      } as ApiResponse);
    }
    
    const suggestions = await readingService.generateFollowUps({
      lastUserQuestion,
      lastAssistantResponse,
      model,
    });
    
    res.json({
      success: true,
      data: { suggestions },
    } as ApiResponse);
  } catch (error: any) {
    next(error);
  }
});

export default router;

