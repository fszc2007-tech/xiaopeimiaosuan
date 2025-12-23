/**
 * Admin - 反馈管理路由
 * 
 * 路径：/api/v1/admin/feedbacks/*
 */

import { Router, Request, Response, NextFunction } from 'express';
import * as feedbackService from '../../modules/feedback/feedbackService';
import { ApiResponse } from '../../types';

const router = Router();

/**
 * GET /api/v1/admin/feedbacks
 * 获取所有反馈列表（支持筛选和分页）
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, status, userId, page, pageSize } = req.query;
    
    const result = await feedbackService.getFeedbackList({
      type: type as any,
      status: status as any,
      userId: userId as string,
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
 * GET /api/v1/admin/feedbacks/:id
 * 获取单个反馈详情
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
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
    
    res.json({
      success: true,
      data: feedback,
    } as ApiResponse);
  } catch (error: any) {
    next(error);
  }
});

/**
 * PUT /api/v1/admin/feedbacks/:id
 * 更新反馈（状态/回复）
 */
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, adminReply } = req.body;
    
    const feedback = await feedbackService.updateFeedback(id, {
      status,
      adminReply,
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
 * DELETE /api/v1/admin/feedbacks/:id
 * 删除反馈
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    await feedbackService.deleteFeedback(id);
    
    res.json({
      success: true,
      data: { message: '删除成功' },
    } as ApiResponse);
  } catch (error: any) {
    next(error);
  }
});

export default router;


