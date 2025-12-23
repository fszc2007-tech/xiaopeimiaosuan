"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = void 0;
exports.authMiddleware = authMiddleware;
const authService_1 = require("../modules/auth/authService");
const connection_1 = require("../database/connection");
/**
 * 认证中间件
 * 验证 JWT Token，检查用户状态，并将 userId 添加到 req.userId
 */
async function authMiddleware(req, res, next) {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'TOKEN_REQUIRED',
                    message: '未提供认证 Token',
                },
            });
            return;
        }
        // 1. 验证 Token
        let userId;
        try {
            const decoded = (0, authService_1.verifyToken)(token);
            userId = decoded.userId;
        }
        catch (error) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'INVALID_TOKEN',
                    message: 'Token 无效或已过期',
                },
            });
            return;
        }
        // 2. 检查用户是否存在
        const pool = (0, connection_1.getPool)();
        const [userRows] = await pool.execute('SELECT user_id FROM users WHERE user_id = ?', [userId]);
        if (userRows.length === 0) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'USER_NOT_FOUND',
                    message: '用户不存在',
                },
            });
            return;
        }
        // 4. 验证通过，设置 userId
        req.userId = userId;
        next();
    }
    catch (error) {
        console.error('[authMiddleware] Error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: '服务器内部错误',
            },
        });
    }
}
// 导出别名
exports.requireAuth = authMiddleware;
//# sourceMappingURL=auth.js.map