/**
 * Admin 认证中间件
 * 
 * 功能：
 * 1. 验证 Admin JWT Token
 * 2. 权限检查（super_admin / admin）
 * 3. 将 Admin 信息注入 req
 * 
 * 遵循文档：
 * - admin.doc/Admin后台最小需求功能文档.md
 * - Phase 4 需求确认（最终版）
 */

import { Request, Response, NextFunction } from 'express';
import { verifyAdminToken, getAdminById } from '../modules/admin/adminAuthService';

/**
 * Admin JWT Payload（与 adminAuthService 保持一致）
 */
interface AdminJwtPayload {
  adminId: string;
  username: string;
  role: 'super_admin' | 'admin';
  type: 'admin';
}

/**
 * 扩展 Express Request，添加 admin 字段
 */
declare global {
  namespace Express {
    interface Request {
      admin?: AdminJwtPayload;
    }
  }
}

/**
 * Admin 认证中间件
 * 
 * 验证请求头中的 Authorization: Bearer <token>
 * 将 Admin 信息注入 req.admin
 */
export async function requireAdminAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // 1. 获取 Token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: {
          code: 'ADMIN_AUTH_REQUIRED',
          message: 'Admin 认证失败，请提供有效的 Token',
        },
      });
      return;
    }

    const token = authHeader.substring(7); // 去掉 "Bearer "

    // 2. 验证 Token
    const decoded = verifyAdminToken(token);

    // 3. 检查 Admin 是否仍然有效
    const admin = await getAdminById(decoded.adminId);
    if (!admin) {
      res.status(401).json({
        success: false,
        error: {
          code: 'ADMIN_NOT_FOUND',
          message: 'Admin 用户不存在或已被禁用',
        },
      });
      return;
    }

    // 4. 注入 req.admin
    req.admin = decoded;

    next();
  } catch (error: any) {
    if (error.message === 'ADMIN_TOKEN_EXPIRED') {
      res.status(401).json({
        success: false,
        error: {
          code: 'ADMIN_TOKEN_EXPIRED',
          message: 'Admin Token 已过期，请重新登录',
        },
      });
      return;
    }

    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_ADMIN_TOKEN',
        message: 'Admin Token 无效',
      },
    });
  }
}

/**
 * Super Admin 权限检查中间件
 * 
 * 必须在 requireAdminAuth 之后使用
 */
export function requireSuperAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.admin) {
    res.status(401).json({
      success: false,
      error: {
        code: 'ADMIN_AUTH_REQUIRED',
        message: 'Admin 认证失败',
      },
    });
    return;
  }

  if (req.admin.role !== 'super_admin') {
    res.status(403).json({
      success: false,
      error: {
        code: 'INSUFFICIENT_PERMISSIONS',
        message: '权限不足，需要 Super Admin 权限',
      },
    });
    return;
  }

  next();
}



// 导出别名，兼容旧的导入名称
export const adminAuthMiddleware = requireAdminAuth;
