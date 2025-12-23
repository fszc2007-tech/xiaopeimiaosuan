/**
 * 认证中间件
 * 
 * 用于保护需要登录的路由
 * 
 * 功能：
 * 1. 验证 JWT Token
 * 2. 检查用户是否存在
 * 3. 检查用户是否被禁用
 */

import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../modules/auth/authService';
import { getPool } from '../database/connection';
import { ApiResponse } from '../types';

// 扩展 Express Request 类型，添加 userId 属性
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

/**
 * 认证中间件
 * 验证 JWT Token，检查用户状态，并将 userId 添加到 req.userId
 */
export async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_REQUIRED',
          message: '未提供认证 Token',
        },
      } as ApiResponse);
      return;
    }
    
    // 1. 验证 Token
    let userId: string;
    try {
      const decoded = verifyToken(token);
      userId = decoded.userId;
    } catch (error) {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Token 无效或已过期',
        },
      } as ApiResponse);
      return;
    }
    
    // 2. 检查用户是否存在
    const pool = getPool();
    const [userRows]: any = await pool.execute(
      'SELECT user_id FROM users WHERE user_id = ?',
      [userId]
    );
    
    if (userRows.length === 0) {
      res.status(401).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: '用户不存在',
        },
      } as ApiResponse);
      return;
    }
    
    // 4. 验证通过，设置 userId
    req.userId = userId;
    next();
  } catch (error: any) {
    console.error('[authMiddleware] Error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: '服务器内部错误',
      },
    } as ApiResponse);
  }
}

// 导出别名
export const requireAuth = authMiddleware;
