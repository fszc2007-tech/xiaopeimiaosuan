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
interface AllowedRoute {
    method: string;
    path: string;
}
/**
 * 帳號狀態檢查中間件
 *
 * 使用方式：
 * - 全局中間件：在需要認證的路由前使用
 * - 僅對已認證的請求生效
 *
 * 注意：此中間件需要在認證中間件之後使用
 */
export declare function accountStatusMiddleware(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * 創建帶配置的帳號狀態中間件
 *
 * @param options 配置選項
 */
export declare function createAccountStatusMiddleware(options?: {
    /** 額外允許的路由 */
    additionalAllowedRoutes?: AllowedRoute[];
}): (req: Request, res: Response, next: NextFunction) => Promise<void>;
export default accountStatusMiddleware;
//# sourceMappingURL=accountStatus.d.ts.map