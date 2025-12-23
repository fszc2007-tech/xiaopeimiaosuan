/**
 * 帳號管理路由
 * 
 * 路徑：/api/v1/account/*
 * 
 * 參考文檔：app.doc/features/註銷賬號功能設計方案.md v1.1
 */

import { Router, Request, Response, NextFunction } from 'express';
import * as accountService from '../modules/account/accountService';
import { verifyToken } from '../modules/auth/authService';
import { ApiResponse } from '../types';
import { registerApi } from '../utils/apiDocs';
import { ApiError } from '../utils/ApiError';

const router = Router();

// ===== API 文檔註冊 =====

registerApi({
  method: 'POST',
  path: '/api/v1/account/deletion-request',
  description: '發起註銷申請（進入 7 天寬限期）',
  auth: true,
  request: {
    body: {},
  },
  response: {
    success: { status: 'PENDING_DELETE', deleteScheduledAt: 'ISO 8601' },
    error: ['USER_NOT_FOUND', 'ACCOUNT_ALREADY_DELETED'],
  },
});

registerApi({
  method: 'GET',
  path: '/api/v1/account/deletion-status',
  description: '查詢刪除狀態',
  auth: true,
  response: {
    success: { 
      status: 'ACTIVE | PENDING_DELETE | DELETED', 
      deleteScheduledAt: 'ISO 8601 | null',
      serverNow: 'ISO 8601',
    },
    error: ['USER_NOT_FOUND'],
  },
});

registerApi({
  method: 'POST',
  path: '/api/v1/account/deletion-cancel',
  description: '撤銷註銷申請',
  auth: true,
  request: {
    body: {},
  },
  response: {
    success: { status: 'ACTIVE' },
    error: ['USER_NOT_FOUND', 'CANNOT_CANCEL_DELETION_EXPIRED', 'CANNOT_CANCEL_DELETION_INVALID_STATE'],
  },
});

// ===== 認證中間件 =====

/**
 * 驗證 JWT Token 中間件
 */
async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_REQUIRED',
          message: '未提供認證 Token',
        },
      } as ApiResponse);
    }
    
    const decoded = verifyToken(token);
    (req as any).userId = decoded.userId;
    
    next();
  } catch (error: any) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Token 無效或已過期',
      },
    } as ApiResponse);
  }
}

// ===== 路由定義 =====

/**
 * POST /api/v1/account/deletion-request
 * 發起註銷申請（進入 7 天寬限期）
 */
router.post('/deletion-request', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    
    const result = await accountService.requestDeletion(userId);
    
    res.json({
      success: true,
      data: result,
    } as ApiResponse);
  } catch (error: any) {
    next(error);
  }
});

/**
 * GET /api/v1/account/deletion-status
 * 查詢刪除狀態
 */
router.get('/deletion-status', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    
    const result = await accountService.getDeletionStatus(userId);
    
    res.json({
      success: true,
      data: result,
    } as ApiResponse);
  } catch (error: any) {
    next(error);
  }
});

/**
 * POST /api/v1/account/deletion-cancel
 * 撤銷註銷申請
 */
router.post('/deletion-cancel', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).userId;
    
    const result = await accountService.cancelDeletion(userId);
    
    res.json({
      success: true,
      data: result,
    } as ApiResponse);
  } catch (error: any) {
    next(error);
  }
});

export default router;

