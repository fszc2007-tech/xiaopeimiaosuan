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
export declare function requireAdminAuth(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * Super Admin 权限检查中间件
 *
 * 必须在 requireAdminAuth 之后使用
 */
export declare function requireSuperAdmin(req: Request, res: Response, next: NextFunction): void;
export declare const adminAuthMiddleware: typeof requireAdminAuth;
export {};
//# sourceMappingURL=adminAuth.d.ts.map