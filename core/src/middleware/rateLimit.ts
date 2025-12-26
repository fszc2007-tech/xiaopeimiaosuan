/**
 * 限流中间件
 * 
 * 功能：
 * - 支持动态开关（通过 Admin 配置）
 * - Pro 用户自动跳过限流
 * - 非 Pro 用户按日限流
 * - 友好的错误提示
 */

import { Request, Response, NextFunction } from 'express';
import { getPool } from '../database/connection';
import { checkProStatus } from './requirePro';
import { isRateLimitEnabled, getRateLimitConfig } from '../services/systemConfigService';
import { ApiResponse } from '../types';

type ApiType = 'bazi_compute' | 'chat';

/**
 * 创建限流中间件
 */
export function createRateLimitMiddleware(apiType: ApiType) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId;

      // 1. 确保用户已认证
      if (!userId) {
        res.status(401).json({
          success: false,
          error: {
            code: 'AUTH_REQUIRED',
            message: '请先登录',
          },
        } as ApiResponse);
        return;
      }

      // 2. 检查系统配置：限流是否启用
      const enabled = await isRateLimitEnabled(apiType);
      if (!enabled) {
        // 限流已关闭，直接通过
        return next();
      }

      // 3. 查询用户信息（包括 Pro 状态）
      const pool = getPool();
      // 🔍 修复：检查字段是否存在，如果不存在则只查询 is_pro
      let userRows: any[];
      try {
        const result: any = await pool.query(
          'SELECT is_pro, pro_expires_at, pro_plan FROM users WHERE user_id = ?',
          [userId]
        );
        userRows = result[0];
      } catch (error: any) {
        // 如果字段不存在，只查询 is_pro
        if (error.code === 'ER_BAD_FIELD_ERROR' && error.message?.includes('pro_expires_at')) {
          console.warn('[RateLimit] pro_expires_at field not found, querying is_pro only');
          const result: any = await pool.query(
            'SELECT is_pro FROM users WHERE user_id = ?',
            [userId]
          );
          userRows = result[0];
          // 设置默认值
          if (userRows.length > 0) {
            userRows[0].pro_expires_at = null;
            userRows[0].pro_plan = null;
          }
        } else {
          throw error;
        }
      }

      if (userRows.length === 0) {
        res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: '用户不存在',
          },
        } as ApiResponse);
        return;
      }

      const user = userRows[0];

      // 4. 检查 Pro 状态
      const isPro = checkProStatus(user.is_pro, user.pro_expires_at, user.pro_plan);
      if (isPro) {
        // Pro 用户免限流
        return next();
      }

      // 5. 非 Pro 用户：检查限流
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const limitConfig = await getRateLimitConfig();

      // 获取今日已使用次数
      const [limitRows]: any = await pool.query(
        `SELECT count FROM rate_limits 
         WHERE user_id = ? AND api_type = ? AND date = ?`,
        [userId, apiType, today]
      );

      const currentCount = limitRows.length > 0 ? limitRows[0].count : 0;

      // 获取限制次数
      const dailyLimit =
        apiType === 'bazi_compute'
          ? limitConfig.baziComputeDailyLimit
          : limitConfig.chatDailyLimit;

      // 检查是否超限
      if (currentCount >= dailyLimit) {
        const featureName = apiType === 'bazi_compute' ? '排盘' : '对话';
        res.status(429).json({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: `今日${featureName}次数已达上限（${dailyLimit}次），升级 Pro 可享受无限制`,
            details: {
              apiType,
              limit: dailyLimit,
              used: currentCount,
              remaining: 0,
              resetAt: new Date(new Date(today).getTime() + 24 * 60 * 60 * 1000).toISOString(),
              upgradeUrl: '/pro/subscribe',
            },
          },
        } as ApiResponse);
        return;
      }

      // 6. 计数 +1
      await pool.query(
        `INSERT INTO rate_limits (limit_id, user_id, api_type, date, count, created_at, updated_at)
         VALUES (UUID(), ?, ?, ?, 1, NOW(), NOW())
         ON DUPLICATE KEY UPDATE
           count = count + 1,
           updated_at = NOW()`,
        [userId, apiType, today]
      );

      // 7. 添加限流信息到响应头（可选）
      res.setHeader('X-RateLimit-Limit', dailyLimit.toString());
      res.setHeader('X-RateLimit-Remaining', (dailyLimit - currentCount - 1).toString());
      res.setHeader('X-RateLimit-Reset', new Date(new Date(today).getTime() + 24 * 60 * 60 * 1000).toISOString());

      next();
    } catch (error: any) {
      console.error('[RateLimit] Error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '服务器内部错误',
        },
      } as ApiResponse);
    }
  };
}

/**
 * 获取用户当前限流状态（工具函数）
 */
export async function getRateLimitStatus(
  userId: string,
  apiType: ApiType
): Promise<{
  limit: number;
  used: number;
  remaining: number;
  resetAt: string;
  isPro: boolean;
}> {
  const pool = getPool();

  // 1. 检查 Pro 状态
  let userRows: any[];
  try {
    const result: any = await pool.query(
      'SELECT is_pro, pro_expires_at, pro_plan FROM users WHERE user_id = ?',
      [userId]
    );
    userRows = result[0];
  } catch (error: any) {
    // 如果字段不存在，只查询 is_pro
    if (error.code === 'ER_BAD_FIELD_ERROR' && error.message?.includes('pro_expires_at')) {
      console.warn('[RateLimit] pro_expires_at field not found, querying is_pro only');
      const result: any = await pool.query(
        'SELECT is_pro FROM users WHERE user_id = ?',
        [userId]
      );
      userRows = result[0];
      // 设置默认值
      if (userRows.length > 0) {
        userRows[0].pro_expires_at = null;
        userRows[0].pro_plan = null;
      }
    } else {
      throw error;
    }
  }

  if (userRows.length === 0) {
    throw new Error('USER_NOT_FOUND');
  }

  const user = userRows[0];
  const isPro = checkProStatus(user.is_pro, user.pro_expires_at, user.pro_plan);

  const limitConfig = await getRateLimitConfig();
  const dailyLimit =
    apiType === 'bazi_compute'
      ? isPro
        ? limitConfig.baziComputeDailyLimitPro
        : limitConfig.baziComputeDailyLimit
      : isPro
      ? limitConfig.chatDailyLimitPro
      : limitConfig.chatDailyLimit;

  // 2. Pro 用户返回无限制
  if (isPro) {
    return {
      limit: dailyLimit,
      used: 0,
      remaining: dailyLimit,
      resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      isPro: true,
    };
  }

  // 3. 非 Pro 用户查询今日使用次数
  const today = new Date().toISOString().split('T')[0];
  const [limitRows]: any = await pool.query(
    `SELECT count FROM rate_limits 
     WHERE user_id = ? AND api_type = ? AND date = ?`,
    [userId, apiType, today]
  );

  const used = limitRows.length > 0 ? limitRows[0].count : 0;

  return {
    limit: dailyLimit,
    used,
    remaining: Math.max(0, dailyLimit - used),
    resetAt: new Date(new Date(today).getTime() + 24 * 60 * 60 * 1000).toISOString(),
    isPro: false,
  };
}

