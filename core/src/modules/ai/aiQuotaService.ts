/**
 * AI 解讀次數限制服務
 * 
 * 功能：
 * 1. 檢查用戶每日 AI 解讀次數限制
 * 2. 跨天自動重置計數
 * 3. 區分會員/非會員、首日/次日邏輯
 * 
 * 遵循文檔：會員訂閱與AI解讀次數限制-優化方案.md（精簡技術方案 v1）
 */

import dayjs from 'dayjs';
import { getPool } from '../../database/connection';
import type { UserRow } from '../../types/database';

// ===== 常量配置 =====

const PRO_DAILY_LIMIT = 100;          // 會員每日上限
const FREE_FIRST_DAY_LIMIT = 10;      // 非會員首日上限
const FREE_DAILY_LIMIT = 5;           // 非會員次日上限

// ===== 錯誤類型 =====

export class AiLimitReachedError extends Error {
  limit: number;
  
  constructor(limit: number) {
    super(`AI_DAILY_LIMIT_REACHED:${limit}`);
    this.name = 'AiLimitReachedError';
    this.limit = limit;
  }
}

// ===== 工具函式 =====

/**
 * 判斷 Pro 是否有效
 */
export function isProValid(user: UserRow): boolean {
  if (!user.is_pro) return false;
  if (!user.pro_expires_at) return false;
  return dayjs(user.pro_expires_at).isAfter(dayjs());
}

/**
 * 判斷是否註冊首日
 */
export function isFirstDay(user: UserRow): boolean {
  const created = dayjs(user.created_at);
  const today = dayjs();
  return created.isSame(today, 'day');
}

/**
 * 計算今日上限
 */
export function getDailyLimit(user: UserRow): number {
  if (isProValid(user)) {
    return PRO_DAILY_LIMIT;
  }

  if (isFirstDay(user)) {
    return FREE_FIRST_DAY_LIMIT;
  }

  return FREE_DAILY_LIMIT;
}

/**
 * 跨天重置次數
 */
export function resetAiCallsIfNeeded(user: UserRow): void {
  const todayStr = dayjs().format('YYYY-MM-DD');
  
  if (user.ai_calls_date !== todayStr) {
    user.ai_calls_date = todayStr;
    user.ai_calls_today = 0;
  }
}

/**
 * 檢查 & 累計 AI 使用次數
 * 
 * @param userId 用戶 ID
 * @throws {AiLimitReachedError} 當達到每日上限時拋出
 * @throws {Error} 當用戶不存在時拋出
 */
export async function checkAndCountAIUsage(userId: string): Promise<void> {
  const pool = getPool();
  
  // 1. 查詢用戶
  // ✅ 完整处理：字段已通过 Migration 043 添加，直接使用
  const [rows]: any = await pool.execute(
    `SELECT user_id, is_pro, pro_expires_at, pro_plan, created_at, 
            ai_calls_today, ai_calls_date 
     FROM users 
     WHERE user_id = ?`,
    [userId]
  );

  if (rows.length === 0) {
    throw new Error('USER_NOT_FOUND');
  }

  const user: UserRow = rows[0];

  // 2. 跨天重置
  resetAiCallsIfNeeded(user);

  // 3. 計算今日上限
  const limit = getDailyLimit(user);

  // 4. 檢查是否超限
  if (user.ai_calls_today >= limit) {
    console.log(`[AiQuota] User ${userId} reached daily limit: ${user.ai_calls_today}/${limit}`);
    throw new AiLimitReachedError(limit);
  }

  // 5. 累計次數 +1
  user.ai_calls_today += 1;

  // 6. 更新資料庫
  await pool.execute(
    `UPDATE users 
     SET ai_calls_today = ?, ai_calls_date = ?, updated_at = NOW()
     WHERE user_id = ?`,
    [user.ai_calls_today, user.ai_calls_date, userId]
  );

  console.log(`[AiQuota] User ${userId} AI usage: ${user.ai_calls_today}/${limit}`);
}

/**
 * 獲取用戶當前 AI 使用狀態（不累計次數）
 * 
 * @param userId 用戶 ID
 * @returns AI 使用狀態
 */
export async function getAIUsageStatus(userId: string): Promise<{
  aiCallsToday: number;
  aiDailyLimit: number;
  aiRemaining: number;
}> {
  const pool = getPool();
  
  const [rows]: any = await pool.execute(
    `SELECT user_id, is_pro, pro_expires_at, pro_plan, created_at, 
            ai_calls_today, ai_calls_date 
     FROM users 
     WHERE user_id = ?`,
    [userId]
  );

  if (rows.length === 0) {
    throw new Error('USER_NOT_FOUND');
  }

  const user: UserRow = rows[0];

  // 跨天重置（但不寫回資料庫，只是計算）
  const todayStr = dayjs().format('YYYY-MM-DD');
  const aiCallsToday = user.ai_calls_date === todayStr ? user.ai_calls_today : 0;

  // 計算今日上限
  const aiDailyLimit = getDailyLimit(user);

  return {
    aiCallsToday,
    aiDailyLimit,
    aiRemaining: Math.max(0, aiDailyLimit - aiCallsToday),
  };
}


