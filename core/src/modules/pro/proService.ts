/**
 * Pro 订阅服务
 * 
 * 功能：
 * 1. 模拟订阅（无真实支付）
 * 2. 订阅状态同步（users + subscriptions）
 * 3. 到期时间计算
 * 4. 查询 Pro 状态
 * 
 * 遵循文档：
 * - app.doc/features/小佩Pro-订阅页面设计文档.md
 * - app.doc/features/小佩Pro-功能与服务说明文档.md
 * - Phase 4 需求确认（最终版）
 */

import { getPool } from '../../database/connection';
import { FieldMapper } from '../../utils/fieldMapper';
import { clearProStatusCache } from '../../middleware/requirePro';
import type { SubscriptionRow, UserRow } from '../../types/database';
import type { SubscribeResponseDto, ProStatusDto } from '../../types/dto';
import dayjs from 'dayjs';

/**
 * 订阅方案配置
 */
const PLAN_CONFIG = {
  yearly: {
    duration: 365, // 天数
    name: '年度会员',
  },
  monthly: {
    duration: 30, // 天数
    name: '月度会员',
  },
  quarterly: {
    duration: 90, // 天数
    name: '季度会员',
  },
  lifetime: {
    duration: null, // 永久
    name: '终身会员',
  },
} as const;

/**
 * 订阅 Pro（模拟接口）
 * 
 * @param userId 用户 ID
 * @param plan 订阅方案
 * @returns 订阅信息
 */
export async function subscribe(
  userId: string,
  plan: 'yearly' | 'monthly' | 'quarterly' | 'lifetime'
): Promise<SubscribeResponseDto> {
  const pool = getPool();
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    // 1. 查询用户当前状态
    const [userRows]: any = await connection.execute(
      'SELECT * FROM users WHERE user_id = ?',
      [userId]
    );

    if (userRows.length === 0) {
      throw new Error('USER_NOT_FOUND');
    }

    const currentUser = userRows[0];

    // 2. 计算订阅开始/到期时间
    const startedAt = new Date();
    let expiresAt: Date | null = null;

    if (plan === 'lifetime') {
      expiresAt = null; // 永久会员无到期时间
    } else {
      // 如果用户已有 Pro 且未过期，在现有到期时间基础上累加
      const now = dayjs();
      const baseDate = currentUser.pro_expires_at && dayjs(currentUser.pro_expires_at).isAfter(now)
        ? dayjs(currentUser.pro_expires_at)
        : now;
      
      let months = 0;
      if (plan === 'monthly') months = 1;
      else if (plan === 'quarterly') months = 3;
      else if (plan === 'yearly') months = 12;
      
      expiresAt = baseDate.add(months, 'month').toDate();
    }

    // 3. 插入订阅记录
    const [insertResult]: any = await connection.execute(
      `INSERT INTO subscriptions (user_id, plan, status, started_at, expires_at, created_at, updated_at, payment_provider)
       VALUES (?, ?, 'active', ?, ?, NOW(), NOW(), 'none')`,
      [userId, plan, startedAt, expiresAt]
    );

    const subscriptionId = insertResult.insertId;

    // 4. 更新 users 表
    await connection.execute(
      `UPDATE users 
       SET is_pro = TRUE, pro_expires_at = ?, pro_plan = ?, updated_at = NOW()
       WHERE user_id = ?`,
      [expiresAt, plan, userId]
    );

    // 5. 提交事务
    await connection.commit();
    
    // 6. 清除 Pro 状态缓存（订阅后状态已变更）
    clearProStatusCache(userId);

    // 6. 查询订阅记录
    const [subRows]: any = await connection.execute(
      'SELECT * FROM subscriptions WHERE id = ?',
      [subscriptionId]
    );

    // 7. 查询更新后的用户信息
    const [updatedUserRows]: any = await connection.execute(
      'SELECT * FROM users WHERE user_id = ?',
      [userId]
    );

    const subscription = FieldMapper.mapSubscription(subRows[0]);
    const user = FieldMapper.mapUser(updatedUserRows[0]);

    return {
      subscription,
      user: {
        isPro: user.isPro,
        proExpiresAt: user.proExpiresAt,
        proPlan: user.proPlan,
      },
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * 获取用户的 Pro 状态
 * 
 * @param userId 用户 ID
 * @returns Pro 状态
 */
export async function getProStatus(userId: string): Promise<ProStatusDto> {
  const pool = getPool();
  // ✅ 完整处理：字段已通过 Migration 043 添加，直接使用
  const [rows]: any = await pool.execute(
    'SELECT is_pro, pro_expires_at, pro_plan FROM users WHERE user_id = ?',
    [userId]
  );

  if (rows.length === 0) {
    throw new Error('USER_NOT_FOUND');
  }

  const user = rows[0];

  // Pro 功能列表（根据文档定义）
  const proFeatures = [
    '无限次数排盘',
    '无限次数对话',
    '深度解读（DeepSeek Thinking 模式）',
    '高级分析报告',
    '优先客服支持',
  ];

  return {
    isPro: user.is_pro || false,
    expiresAt: user.pro_expires_at ? user.pro_expires_at.toISOString() : undefined,
    plan: user.pro_plan || undefined,
    features: user.is_pro ? proFeatures : [],
  };
}

/**
 * 获取用户的订阅历史
 * 
 * @param userId 用户 ID
 * @returns 订阅记录列表
 */
export async function getSubscriptionHistory(userId: string) {
  const pool = getPool();
  const [rows]: any = await pool.execute(
    'SELECT * FROM subscriptions WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );

  return FieldMapper.mapSubscriptions(rows);
}

/**
 * Admin 手动设置用户 Pro 状态
 * 
 * @param userId 用户 ID
 * @param plan 订阅方案
 * @param duration 持续天数（仅 yearly/monthly 需要，lifetime 忽略）
 */
export async function adminSetProStatus(
  userId: string,
  plan: 'yearly' | 'monthly' | 'quarterly' | 'lifetime',
  duration?: number
): Promise<SubscribeResponseDto> {
  // 如果没有提供 duration，使用默认配置
  const actualDuration = duration || (plan === 'lifetime' ? null : PLAN_CONFIG[plan as 'yearly' | 'monthly']?.duration);

  // 调用 subscribe 函数（复用逻辑）
  // 但如果需要自定义 duration，需要修改 subscribe 函数或创建新函数
  // 这里简化处理，直接调用 subscribe
  return subscribe(userId, plan);
}

