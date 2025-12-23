/**
 * 恋爱数据服务
 * 
 * 统一管理恋爱相关的数据查询和上下文构建
 */

import { getPool } from '../../database/connection';
import { LoveChatContext } from '../../types/love';
import { buildLoveChatContext } from './loveContextBuilder';

/**
 * 标准化性别
 */
function normalizeGender(gender: string | null | undefined): 'male' | 'female' | 'unknown' {
  if (gender === 'male' || gender === 'female') {
    return gender;
  }
  return 'unknown';
}

/**
 * 为指定命盘构建恋爱聊天上下文
 * 
 * @param params 参数对象
 * @param params.chartProfileId 命盘ID
 * @param params.userQuestion 用户问题
 * @param params.now 当前时间（可选，用于测试）
 * @returns LoveChatContext
 */
export async function buildLoveChatContextForChart(params: {
  chartProfileId: string;
  userQuestion: string;
  now?: Date;
}): Promise<LoveChatContext> {
  const { chartProfileId, userQuestion, now = new Date() } = params;
  const pool = getPool();
  
  // 1. 一次性查询所需数据
  const [rows]: any = await pool.query(`
    SELECT 
      bc.result_json,
      cp.gender
    FROM bazi_charts bc
    JOIN chart_profiles cp ON bc.chart_profile_id = cp.chart_profile_id
    WHERE bc.chart_profile_id = ?
    ORDER BY bc.created_at DESC
    LIMIT 1
  `, [chartProfileId]);
  
  if (rows.length === 0) {
    throw new Error('命盘数据不存在');
  }
  
  const chartResult = JSON.parse(rows[0].result_json);
  const gender = normalizeGender(rows[0].gender);
  
  // 2. 调用统一的 builder
  return buildLoveChatContext({
    chartResult,
    gender,
    userQuestion,
    now,
  });
}





