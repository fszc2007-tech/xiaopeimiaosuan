/**
 * 认证路由
 * 
 * 路径：/api/v1/auth/*
 */

import { Router, Request, Response, NextFunction } from 'express';
import * as authService from '../modules/auth/authService';
import * as thirdPartyAuthService from '../modules/auth/thirdPartyAuthService';
import * as chartProfileService from '../services/chartProfileService';
import { ApiResponse } from '../types';
import { registerApi } from '../utils/apiDocs';

const router = Router();

// 注册 API 文档
registerApi({
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

registerApi({
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

registerApi({
  method: 'GET',
  path: '/api/v1/auth/me',
  description: '获取当前用户信息',
  auth: true,
  response: {
    success: { userId: 'string', nickname: 'string', /* ... */ },
    error: ['TOKEN_REQUIRED', 'INVALID_TOKEN'],
  },
});

registerApi({
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
router.post('/request-otp', async (req: Request, res: Response, next: NextFunction) => {
  // #region agent log
  console.log('[DEBUG] OTP request received:', JSON.stringify({body: req.body, hypothesisId: 'C,D'}));
  // #endregion
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
      } as ApiResponse);
    }
    
    // ✅ 只支持手机号登录
    if (!phone) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'PHONE_REQUIRED',
          message: '当前仅支持手机号登录',
        },
      } as ApiResponse);
    }
    
    // #region agent log
    console.log('[DEBUG] Calling authService.requestOTP:', JSON.stringify({phone, region, countryCode, hypothesisId: 'D'}));
    // #endregion
    const result = await authService.requestOTP({ 
      phone, 
      email, 
      region, 
      countryCode,
      clientIp 
    });
    // #region agent log
    console.log('[DEBUG] OTP result received:', JSON.stringify({success: true, hasResult: !!result, hypothesisId: 'D'}));
    // #endregion
    
    res.json({
      success: true,
      data: result,
    } as ApiResponse);
  } catch (error: any) {
    next(error);
  }
});

/**
 * POST /api/v1/auth/login_or_register
 * 登录或注册
 */
router.post('/login_or_register', async (req: Request, res: Response, next: NextFunction) => {
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
      } as ApiResponse);
    }
    
    if (!channel || !['cn', 'hk'].includes(channel)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CHANNEL',
          message: 'channel 必须是 cn 或 hk',
        },
      } as ApiResponse);
    }
    
    // ✅ 只支持手机号登录
    if (!phone) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'PHONE_REQUIRED',
          message: '当前仅支持手机号登录',
        },
      } as ApiResponse);
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
    } as ApiResponse);
  } catch (error: any) {
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
      } as ApiResponse);
    }
    next(error);
  }
});

/**
 * GET /api/v1/auth/me
 * 获取当前用户信息（含当前命主）
 */
router.get('/me', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'TOKEN_REQUIRED',
          message: '未提供认证 Token',
        },
      } as ApiResponse);
    }
    
    const user = await authService.getUserByToken(token);
    
    res.json({
      success: true,
      data: {
        ...user,
      },
    } as ApiResponse);
  } catch (error: any) {
    if (error.message === 'Invalid token') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Token 无效或已过期',
        },
      } as ApiResponse);
    }
    next(error);
  }
});

/**
 * POST /api/v1/auth/logout
 * 登出（客户端清除 Token 即可，这里只是占位）
 */
router.post('/logout', async (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      message: '登出成功',
    },
  } as ApiResponse);
});

// ==========================================
// 第三方登录接口（Google / Apple）
// ==========================================

registerApi({
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
router.post('/third_party_login', async (req: Request, res: Response, next: NextFunction) => {
  // #region agent log
  const fs = require('fs');
  const logPath = '/Users/gaoxuxu/Desktop/xiaopei-app/.cursor/debug.log';
  const log = (data: any) => {
    try {
      fs.appendFileSync(logPath, JSON.stringify({...data, timestamp: Date.now()}) + '\n');
    } catch (e) {}
  };
  log({location: 'auth.ts:third_party_login:entry', message: 'third_party_login endpoint called', data: {provider: req.body?.provider, hasIdToken: !!req.body?.idToken, app_region: req.body?.app_region}, sessionId: 'debug-session', hypothesisId: 'E'});
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
      } as ApiResponse);
    }
    
    if (!idToken) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'idToken 不能为空',
        },
      } as ApiResponse);
    }
    
    // 注意：已移除地区限制，Google 登录全球可用
    // app_region 参数现在是可选的，仅用于日志/统计
    // 如果未提供，默认为 'HK'
    const effectiveRegion = app_region || 'HK';
    
    // 调用对应的第三方登录服务
    let result;
    if (provider === 'google') {
      // #region agent log
      log({location: 'auth.ts:third_party_login:beforeGoogleLogin', message: 'Calling googleLogin service', data: {}, sessionId: 'debug-session', hypothesisId: 'E'});
      // #endregion
      result = await thirdPartyAuthService.googleLogin({ idToken, app_region: effectiveRegion });
      // #region agent log
      log({location: 'auth.ts:third_party_login:afterGoogleLogin', message: 'googleLogin service returned', data: {hasResult: !!result, hasToken: !!result?.token}, sessionId: 'debug-session', hypothesisId: 'E'});
      // #endregion
    } else if (provider === 'apple') {
      // TODO: 实现 Apple 登录
      return res.status(501).json({
        success: false,
        error: {
          code: 'NOT_IMPLEMENTED',
          message: 'Apple 登录尚未实现',
        },
      } as ApiResponse);
    }
    
    res.json({
      success: true,
      data: result,
    } as ApiResponse);
  } catch (error: any) {
    // #region agent log
    log({location: 'auth.ts:third_party_login:catch', message: 'Error caught in third_party_login', data: {errorMessage: error?.message, errorCode: error?.code, errorStack: error?.stack?.substring(0, 300)}, sessionId: 'debug-session', hypothesisId: 'A,B,C,D,E'});
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
      } as ApiResponse);
    }
    
    if (error.message?.includes('region') || 
        error.message?.includes('Hong Kong')) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'REGION_NOT_SUPPORTED',
          message: error.message,
        },
      } as ApiResponse);
    }
    
    // 其他错误
    // #region agent log
    log({location: 'auth.ts:third_party_login:500', message: 'Returning 500 error', data: {errorMessage: error?.message, errorCode: error?.code}, sessionId: 'debug-session', hypothesisId: 'A,B,C,D,E'});
    // #endregion
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message || '登录失败',
      },
    } as ApiResponse);
  }
});

// ==========================================
// H5 用戶名登錄接口（新增）
// ==========================================

/**
 * POST /api/v1/auth/register_username
 * 用戶名註冊（H5 專用）
 */
router.post('/register_username', async (req: Request, res: Response, next: NextFunction) => {
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
      } as ApiResponse);
    }
    
    if (!password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'PASSWORD_REQUIRED',
          message: '密碼不能為空',
        },
      } as ApiResponse);
    }
    
    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'PASSWORD_MISMATCH',
          message: '兩次密碼不一致',
        },
      } as ApiResponse);
    }
    
    const result = await authService.registerUsername({ username, password });
    
    res.json({
      success: true,
      data: result,
    } as ApiResponse);
  } catch (error: any) {
    if (error.message.includes('用戶名')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_USERNAME',
          message: error.message,
        },
      } as ApiResponse);
    }
    if (error.message.includes('密碼')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PASSWORD',
          message: error.message,
        },
      } as ApiResponse);
    }
    next(error);
  }
});

/**
 * POST /api/v1/auth/login_username
 * 用戶名登錄（H5 專用）
 */
router.post('/login_username', async (req: Request, res: Response, next: NextFunction) => {
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
      } as ApiResponse);
    }
    
    if (!password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'PASSWORD_REQUIRED',
          message: '密碼不能為空',
        },
      } as ApiResponse);
    }
    
    const result = await authService.loginUsername({ username, password });
    
    res.json({
      success: true,
      data: result,
    } as ApiResponse);
  } catch (error: any) {
    if (error.message === '用戶名或密碼錯誤') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: '用戶名或密碼錯誤',
        },
      } as ApiResponse);
    }
    next(error);
  }
});

export default router;

