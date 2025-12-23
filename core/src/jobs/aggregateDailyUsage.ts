/**
 * LLM Usage 日统计聚合任务
 * 
 * 功能：
 * 1. 每天 0:05 执行：聚合昨天的数据到 llm_usage_daily
 * 2. 每小时执行：补聚合当天数据（避免延迟）
 * 
 * 遵循文档：
 * - Admin-LLM计费统计实施方案.md
 */

import { getPool } from '../database/connection';

/**
 * 聚合指定日期的数据
 */
export async function aggregateDailyUsage(targetDate: Date): Promise<void> {
  const pool = getPool();
  const dateStr = targetDate.toISOString().split('T')[0];
  const startOfDay = new Date(dateStr + ' 00:00:00');
  const endOfDay = new Date(dateStr + ' 23:59:59');
  
  console.log(`[AggregateDailyUsage] Starting aggregation for date: ${dateStr}`);
  
  try {
    // 从 logs 表聚合数据
    const [rows]: any = await pool.execute(
      `SELECT 
        provider,
        model,
        COUNT(*) AS total_requests,
        SUM(input_tokens) AS total_input_tokens,
        SUM(output_tokens) AS total_output_tokens,
        SUM(total_tokens) AS total_tokens,
        SUM(cost_cents) AS total_cost_cents
      FROM llm_usage_logs
      WHERE created_at >= ? AND created_at < ?
      GROUP BY provider, model`,
      [startOfDay, new Date(endOfDay.getTime() + 1000)] // +1秒确保包含当天最后一秒
    );
    
    if (rows.length === 0) {
      console.log(`[AggregateDailyUsage] No data found for date: ${dateStr}`);
      return;
    }
    
    // 插入或更新 daily 表
    for (const row of rows) {
      await pool.execute(
        `INSERT INTO llm_usage_daily (
          date, provider, model, total_requests,
          total_input_tokens, total_output_tokens, total_tokens, total_cost_cents
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          total_requests = VALUES(total_requests),
          total_input_tokens = VALUES(total_input_tokens),
          total_output_tokens = VALUES(total_output_tokens),
          total_tokens = VALUES(total_tokens),
          total_cost_cents = VALUES(total_cost_cents),
          updated_at = CURRENT_TIMESTAMP`,
        [
          dateStr,
          row.provider,
          row.model,
          row.total_requests,
          row.total_input_tokens,
          row.total_output_tokens,
          row.total_tokens,
          row.total_cost_cents,
        ]
      );
    }
    
    console.log(`[AggregateDailyUsage] Successfully aggregated ${rows.length} records for date: ${dateStr}`);
  } catch (error: any) {
    console.error(`[AggregateDailyUsage] Failed to aggregate date ${dateStr}:`, error);
    throw error;
  }
}

/**
 * 聚合昨天的数据（每天 0:05 执行）
 */
export async function aggregateYesterday(): Promise<void> {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  
  await aggregateDailyUsage(yesterday);
}

/**
 * 聚合今天的数据（每小时执行）
 */
export async function aggregateToday(): Promise<void> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  await aggregateDailyUsage(today);
}


