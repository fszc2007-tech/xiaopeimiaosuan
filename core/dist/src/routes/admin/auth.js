"use strict";
/**
 * Admin 认证路由
 *
 * 路径：/api/admin/v1/auth
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminAuthService_1 = require("../../modules/admin/adminAuthService");
const adminAuth_1 = require("../../middleware/adminAuth");
const apiDocs_1 = require("../../utils/apiDocs");
const router = (0, express_1.Router)();
/**
 * POST /api/admin/v1/auth/login
 * Admin 登录
 */
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_REQUEST',
                    message: '用户名和密码不能为空',
                },
            });
            return;
        }
        const result = await (0, adminAuthService_1.loginAdmin)(username, password);
        res.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        if (error.message === 'ADMIN_USER_NOT_FOUND' || error.message === 'ADMIN_INVALID_PASSWORD') {
            res.status(401).json({
                success: false,
                error: {
                    code: 'INVALID_CREDENTIALS',
                    message: '用户名或密码错误',
                },
            });
            return;
        }
        console.error('[Admin Auth] Login error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: '服务器内部错误',
            },
        });
    }
});
/**
 * GET /api/admin/v1/auth/me
 * 获取当前 Admin 信息
 */
router.get('/me', adminAuth_1.requireAdminAuth, async (req, res) => {
    try {
        res.json({
            success: true,
            data: req.admin,
        });
    }
    catch (error) {
        console.error('[Admin Auth] Get me error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: '服务器内部错误',
            },
        });
    }
});
// ===== API 文档注册 =====
(0, apiDocs_1.registerApi)({
    method: 'POST',
    path: '/api/admin/v1/auth/login',
    description: 'Admin 登录',
    auth: false,
    request: {
        body: {
            username: 'string (Admin 用户名)',
            password: 'string (密码)',
        },
    },
    response: {
        success: {
            token: 'string (JWT Token)',
            admin: 'AdminUserDto',
        },
        error: ['INVALID_REQUEST', 'INVALID_CREDENTIALS', 'INTERNAL_ERROR'],
    },
    tags: ['Admin', 'Auth'],
});
(0, apiDocs_1.registerApi)({
    method: 'GET',
    path: '/api/admin/v1/auth/me',
    description: '获取当前 Admin 信息',
    auth: true,
    response: {
        success: {
            adminId: 'string',
            username: 'string',
            role: 'super_admin | admin',
        },
    },
    tags: ['Admin', 'Auth'],
});
exports.default = router;
//# sourceMappingURL=auth.js.map