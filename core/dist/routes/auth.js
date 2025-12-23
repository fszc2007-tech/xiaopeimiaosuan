"use strict";
/**
 * 认证路由
 *
 * 路径：/api/v1/auth/*
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authService = __importStar(require("../modules/auth/authService"));
const thirdPartyAuthService = __importStar(require("../modules/auth/thirdPartyAuthService"));
const apiDocs_1 = require("../utils/apiDocs");
const router = (0, express_1.Router)();
// 注册 API 文档
(0, apiDocs_1.registerApi)({
    method: 'POST',
    path: '/api/v1/auth/request-otp',
    description: '请求验证码',
    auth: false,
    request: {
        body: {
            phone: '手机号（CN区域必填）',
            email: '邮箱（HK区域必填）',
            region: 'cn 或 hk',
        },
    },
    response: {
        success: { message: '验证码已发送' },
        error: ['INVALID_REGION', 'PHONE_REQUIRED', 'EMAIL_REQUIRED'],
    },
    example: `curl -X POST http://localhost:3000/api/v1/auth/request-otp \\
  -H "Content-Type: application/json" \\
  -d '{"phone":"13800138000","region":"cn"}'`,
});
(0, apiDocs_1.registerApi)({
    method: 'POST',
    path: '/api/v1/auth/login_or_register',
    description: '登录或注册',
    auth: false,
    request: {
        body: {
            phone: '手机号',
            email: '邮箱',
            code: '验证码',
            channel: 'cn 或 hk',
        },
    },
    response: {
        success: {
            token: 'JWT Token',
            user: { userId: 'string', nickname: 'string', /* ... */ },
        },
        error: ['CODE_REQUIRED', 'INVALID_CHANNEL', 'INVALID_OTP'],
    },
});
(0, apiDocs_1.registerApi)({
    method: 'GET',
    path: '/api/v1/auth/me',
    description: '获取当前用户信息',
    auth: true,
    response: {
        success: { userId: 'string', nickname: 'string', /* ... */ },
        error: ['TOKEN_REQUIRED', 'INVALID_TOKEN'],
    },
});
(0, apiDocs_1.registerApi)({
    method: 'POST',
    path: '/api/v1/auth/logout',
    description: '登出',
    auth: false,
    response: {
        success: { message: '登出成功' },
    },
});
/**
 * POST /api/v1/auth/request-otp
 * 请求验证码
 */
router.post('/request-otp', async (req, res, next) => {
    try {
        const { phone, email, region, countryCode } = req.body;
        // 获取客户端 IP（用于限流）
        const clientIp = req.ip || req.headers['x-forwarded-for']?.toString().split(',')[0] || req.socket.remoteAddress || 'unknown';
        // 验证输入
        if (!region || !['cn', 'hk'].includes(region)) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_REGION',
                    message: 'region 必须是 cn 或 hk',
                },
            });
        }
        // ✅ 只支持手机号登录
        if (!phone) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'PHONE_REQUIRED',
                    message: '当前仅支持手机号登录',
                },
            });
        }
        const result = await authService.requestOTP({
            phone,
            email,
            region,
            countryCode,
            clientIp
        });
        res.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * POST /api/v1/auth/login_or_register
 * 登录或注册
 */
router.post('/login_or_register', async (req, res, next) => {
    try {
        const { phone, email, code, channel, countryCode } = req.body;
        // 验证输入
        if (!code) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'CODE_REQUIRED',
                    message: '验证码不能为空',
                },
            });
        }
        if (!channel || !['cn', 'hk'].includes(channel)) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_CHANNEL',
                    message: 'channel 必须是 cn 或 hk',
                },
            });
        }
        // ✅ 只支持手机号登录
        if (!phone) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'PHONE_REQUIRED',
                    message: '当前仅支持手机号登录',
                },
            });
        }
        const result = await authService.loginOrRegister({
            phone,
            email,
            code,
            channel,
            countryCode
        });
        res.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        // 处理验证码相关错误
        if (error.message?.includes('验证码') ||
            error.message?.includes('CODE_') ||
            error.message?.includes('code')) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_OTP',
                    message: error.message || '验证码错误或已过期',
                },
            });
        }
        next(error);
    }
});
/**
 * GET /api/v1/auth/me
 * 获取当前用户信息（含当前命主）
 */
router.get('/me', async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'TOKEN_REQUIRED',
                    message: '未提供认证 Token',
                },
            });
        }
        const user = await authService.getUserByToken(token);
        res.json({
            success: true,
            data: {
                ...user,
            },
        });
    }
    catch (error) {
        if (error.message === 'Invalid token') {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'INVALID_TOKEN',
                    message: 'Token 无效或已过期',
                },
            });
        }
        next(error);
    }
});
/**
 * POST /api/v1/auth/logout
 * 登出（客户端清除 Token 即可，这里只是占位）
 */
router.post('/logout', async (req, res) => {
    res.json({
        success: true,
        data: {
            message: '登出成功',
        },
    });
});
// ==========================================
// 第三方登录接口（Google / Apple）
// ==========================================
(0, apiDocs_1.registerApi)({
    method: 'POST',
    path: '/api/v1/auth/third_party_login',
    description: '第三方登录（Google / Apple）',
    auth: false,
    request: {
        body: {
            provider: "'google' | 'apple'",
            idToken: 'Google/Apple ID Token',
            app_region: "'CN' | 'HK'",
        },
    },
    response: {
        success: {
            token: 'JWT Token',
            user: { userId: 'string', email: 'string', nickname: 'string', avatar: 'string' },
            first_login: 'boolean',
            request_id: 'string',
        },
        error: ['INVALID_PROVIDER', 'INVALID_TOKEN', 'REGION_NOT_SUPPORTED', 'INTERNAL_ERROR'],
    },
    example: `curl -X POST http://localhost:3000/api/v1/auth/third_party_login \\
  -H "Content-Type: application/json" \\
  -d '{"provider":"google","idToken":"...","app_region":"HK"}'`,
});
/**
 * POST /api/v1/auth/third_party_login
 * 第三方登录（Google / Apple）
 */
router.post('/third_party_login', async (req, res, next) => {
    // #region agent log
    const fs = require('fs');
    const logPath = '/Users/gaoxuxu/Desktop/xiaopei-app/.cursor/debug.log';
    const log = (data) => {
        try {
            fs.appendFileSync(logPath, JSON.stringify({ ...data, timestamp: Date.now() }) + '\n');
        }
        catch (e) { }
    };
    log({ location: 'auth.ts:third_party_login:entry', message: 'third_party_login endpoint called', data: { provider: req.body?.provider, hasIdToken: !!req.body?.idToken, app_region: req.body?.app_region }, sessionId: 'debug-session', hypothesisId: 'E' });
    // #endregion
    try {
        const { provider, idToken, app_region } = req.body;
        // 验证输入
        if (!provider || !['google', 'apple'].includes(provider)) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_PROVIDER',
                    message: 'provider 必须是 google 或 apple',
                },
            });
        }
        if (!idToken) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_TOKEN',
                    message: 'idToken 不能为空',
                },
            });
        }
        if (!app_region || !['CN', 'HK'].includes(app_region)) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_REGION',
                    message: 'app_region 必须是 CN 或 HK',
                },
            });
        }
        // 注意：已移除地区限制，Google 登录全球可用
        // 原限制代码已删除，app_region 参数仅用于日志/统计
        // 调用对应的第三方登录服务
        let result;
        if (provider === 'google') {
            // #region agent log
            log({ location: 'auth.ts:third_party_login:beforeGoogleLogin', message: 'Calling googleLogin service', data: {}, sessionId: 'debug-session', hypothesisId: 'E' });
            // #endregion
            result = await thirdPartyAuthService.googleLogin({ idToken, app_region });
            // #region agent log
            log({ location: 'auth.ts:third_party_login:afterGoogleLogin', message: 'googleLogin service returned', data: { hasResult: !!result, hasToken: !!result?.token }, sessionId: 'debug-session', hypothesisId: 'E' });
            // #endregion
        }
        else if (provider === 'apple') {
            // TODO: 实现 Apple 登录
            return res.status(501).json({
                success: false,
                error: {
                    code: 'NOT_IMPLEMENTED',
                    message: 'Apple 登录尚未实现',
                },
            });
        }
        res.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        // #region agent log
        log({ location: 'auth.ts:third_party_login:catch', message: 'Error caught in third_party_login', data: { errorMessage: error?.message, errorCode: error?.code, errorStack: error?.stack?.substring(0, 300) }, sessionId: 'debug-session', hypothesisId: 'A,B,C,D,E' });
        // #endregion
        // P2 错误码区分（服务端错误）
        if (error.message?.includes('Invalid Google ID Token') ||
            error.message?.includes('Token')) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'INVALID_TOKEN',
                    message: error.message || 'ID Token 验证失败',
                },
            });
        }
        if (error.message?.includes('region') ||
            error.message?.includes('Hong Kong')) {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'REGION_NOT_SUPPORTED',
                    message: error.message,
                },
            });
        }
        // 其他错误
        // #region agent log
        log({ location: 'auth.ts:third_party_login:500', message: 'Returning 500 error', data: { errorMessage: error?.message, errorCode: error?.code }, sessionId: 'debug-session', hypothesisId: 'A,B,C,D,E' });
        // #endregion
        return res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: error.message || '登录失败',
            },
        });
    }
});
// ==========================================
// H5 用戶名登錄接口（新增）
// ==========================================
/**
 * POST /api/v1/auth/register_username
 * 用戶名註冊（H5 專用）
 */
router.post('/register_username', async (req, res, next) => {
    try {
        const { username, password, confirmPassword } = req.body;
        // 驗證輸入
        if (!username) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'USERNAME_REQUIRED',
                    message: '用戶名不能為空',
                },
            });
        }
        if (!password) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'PASSWORD_REQUIRED',
                    message: '密碼不能為空',
                },
            });
        }
        if (confirmPassword && password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'PASSWORD_MISMATCH',
                    message: '兩次密碼不一致',
                },
            });
        }
        const result = await authService.registerUsername({ username, password });
        res.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        if (error.message.includes('用戶名')) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_USERNAME',
                    message: error.message,
                },
            });
        }
        if (error.message.includes('密碼')) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_PASSWORD',
                    message: error.message,
                },
            });
        }
        next(error);
    }
});
/**
 * POST /api/v1/auth/login_username
 * 用戶名登錄（H5 專用）
 */
router.post('/login_username', async (req, res, next) => {
    try {
        const { username, password } = req.body;
        // 驗證輸入
        if (!username) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'USERNAME_REQUIRED',
                    message: '用戶名不能為空',
                },
            });
        }
        if (!password) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'PASSWORD_REQUIRED',
                    message: '密碼不能為空',
                },
            });
        }
        const result = await authService.loginUsername({ username, password });
        res.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        if (error.message === '用戶名或密碼錯誤') {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'INVALID_CREDENTIALS',
                    message: '用戶名或密碼錯誤',
                },
            });
        }
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map