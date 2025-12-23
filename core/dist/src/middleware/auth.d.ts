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
export declare function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare const requireAuth: typeof authMiddleware;
//# sourceMappingURL=auth.d.ts.map