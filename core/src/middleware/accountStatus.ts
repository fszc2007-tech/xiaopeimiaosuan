/**
 * 帳號狀態中間件
 * 
 * 功能：
 * - 檢查 PENDING_DELETE 用戶的 API 訪問限制
 * - 白名單內的 API 允許訪問，其他返回 403
 * 
 * 參考文檔：app.doc/features/註銷賬號功能設計方案.md v1.1
 */

import { Request, Response, NextFunction } from 'express';
import { getUserStatus, UserStatus } from '../modules/account/accountService';
import { verifyToken } from '../modules/auth/authService';
import { ApiResponse } from '../types';

// ===== 白名單配置 =====

interface AllowedRoute {
  method: string;
  path: string;
}

/**
 * PENDING_DELETE 狀態允許訪問的 API 白名單
 * 使用 method + normalized path 精確匹配
 */
const PENDING_DELETE_ALLOWED_ROUTES: AllowedRoute[] = [
  { method: 'GET', path: '/api/v1/account/deletion-status' },
  { method: 'POST', path: '/api/v1/account/deletion-cancel' },
  { method: 'POST', path: '/api/v1/auth/logout' },
  { method: 'GET', path: '/api/v1/auth/me' },
];

// ===== 輔助函數 =====

/**
 * 規範化路徑
 * - 移除 query string
 * - 移除尾部斜杠（除非是根路徑）
 */
function normalizePath(path: string): string {
  // 移除 query string
  const pathWithoutQuery = path.split('?')[0];
  // 移除尾部斜杠（除非是根路徑）
  return pathWithoutQuery.replace(/\/$/, '') || '/';
}

/**
 * 檢查路由是否在白名單中
 */
function isRouteAllowed(method: string, path: string): boolean {
  const normalizedPath = normalizePath(path);
  return PENDING_DELETE_ALLOWED_ROUTES.some(
    route => route.method === method && route.path === normalizedPath
  );
}

// ===== 中間件 =====

/**
 * 帳號狀態檢查中間件
 * 
 * 使用方式：
 * - 全局中間件：在需要認證的路由前使用
 * - 僅對已認證的請求生效
 * 
 * 注意：此中間件需要在認證中間件之後使用
 */
export async function accountStatusMiddleware(
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> {
  try {
    // 1. 檢查是否有 token
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      // 沒有 token，跳過檢查（讓後續的認證中間件處理）
      return next();
    }
    
    // 2. 解析 token 獲取 userId
    let userId: string;
    try {
      const decoded = verifyToken(token);
      userId = decoded.userId;
    } catch {
      // token 無效，跳過檢查（讓後續的認證中間件處理）
      return next();
    }
    
    // 3. 查詢用戶狀態
    let status: UserStatus;
    try {
      status = await getUserStatus(userId);
    } catch {
      // 用戶不存在，跳過檢查
      return next();
    }
    
    // 4. 根據狀態處理
    if (status === 'DELETED') {
      // 帳號已刪除，拒絕所有請求
      res.status(410).json({
        success: false,
        error: {
          code: 'ACCOUNT_DELETED',
          message: '帳號已刪除',
        },
      } as ApiResponse);
      return;
    }
    
    if (status === 'PENDING_DELETE') {
      // 帳號待刪除，檢查白名單
      if (!isRouteAllowed(req.method, req.path)) {
        res.status(403).json({
          success: false,
          error: {
            code: 'ACCOUNT_PENDING_DELETE',
            message: '帳號待刪除，僅允許撤銷或登出操作',
          },
        } as ApiResponse);
        return;
      }
    }
    
    // 5. 狀態正常或在白名單內，繼續處理
    // 將用戶狀態附加到請求對象，供後續中間件使用
    (req as any).userStatus = status;
    
    next();
  } catch (error: any) {
    console.error('[AccountStatusMiddleware] 錯誤:', error);
    // 發生錯誤時，不阻止請求，讓後續中間件處理
    next();
  }
}

/**
 * 創建帶配置的帳號狀態中間件
 * 
 * @param options 配置選項
 */
export function createAccountStatusMiddleware(options?: {
  /** 額外允許的路由 */
  additionalAllowedRoutes?: AllowedRoute[];
}): (req: Request, res: Response, next: NextFunction) => Promise<void> {
  const allowedRoutes = [
    ...PENDING_DELETE_ALLOWED_ROUTES,
    ...(options?.additionalAllowedRoutes || []),
  ];
  
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return next();
      }
      
      let userId: string;
      try {
        const decoded = verifyToken(token);
        userId = decoded.userId;
      } catch {
        return next();
      }
      
      let status: UserStatus;
      try {
        status = await getUserStatus(userId);
      } catch {
        return next();
      }
      
      if (status === 'DELETED') {
        res.status(410).json({
          success: false,
          error: {
            code: 'ACCOUNT_DELETED',
            message: '帳號已刪除',
          },
        } as ApiResponse);
        return;
      }
      
      if (status === 'PENDING_DELETE') {
        const normalizedPath = normalizePath(req.path);
        const isAllowed = allowedRoutes.some(
          route => route.method === req.method && route.path === normalizedPath
        );
        
        if (!isAllowed) {
          res.status(403).json({
            success: false,
            error: {
              code: 'ACCOUNT_PENDING_DELETE',
              message: '帳號待刪除，僅允許撤銷或登出操作',
            },
          } as ApiResponse);
          return;
        }
      }
      
      (req as any).userStatus = status;
      next();
    } catch (error: any) {
      console.error('[AccountStatusMiddleware] 錯誤:', error);
      next();
    }
  };
}

export default accountStatusMiddleware;

