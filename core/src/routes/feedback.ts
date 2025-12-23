/**
 * 反馈路由
 * 
 * 路径：/api/v1/feedback/*
 */

import { Router, Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../middleware/auth';
import * as feedbackService from '../modules/feedback/feedbackService';
import { ApiResponse } from '../types';

const router = Router();

// 所有反馈路由都需要认证
router.use(authMiddleware);

/**
 * POST /api/v1/feedback
 * 提交反馈
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const { type, content, contact, imagesJson } = req.body;
    
    // 参数验证
    if (!type || !content) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: '缺少必要参数：type, content',
        },
      } as ApiResponse);
    }
    
    if (type !== 'suggest' && type !== 'problem') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'type 必须是 suggest 或 problem',
        },
      } as ApiResponse);
    }
    
    const feedback = await feedbackService.createFeedback({
      userId,
      type,
      content,
      contact,
      imagesJson,
    });
    
    res.json({
      success: true,
      data: feedback,
    } as ApiResponse);
  } catch (error: any) {
    next(error);
  }
});

/**
 * GET /api/v1/feedback
 * 获取当前用户的反馈列表
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const { type, status, page, pageSize } = req.query;
    
    const result = await feedbackService.getFeedbackList({
      userId,
      type: type as any,
      status: status as any,
      page: page ? parseInt(page as string) : undefined,
      pageSize: pageSize ? parseInt(pageSize as string) : undefined,
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
 * GET /api/v1/feedback/:id
 * 获取单个反馈详情
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    
    const feedback = await feedbackService.getFeedbackById(id);
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '反馈不存在',
        },
      } as ApiResponse);
    }
    
    // 只能查看自己的反馈
    if (feedback.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: '无权访问此反馈',
        },
      } as ApiResponse);
    }
    
    res.json({
      success: true,
      data: feedback,
    } as ApiResponse);
  } catch (error: any) {
    next(error);
  }
});

export default router;

