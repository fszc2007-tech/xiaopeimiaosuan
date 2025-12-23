"use strict";
/**
 * 婆媳关系数据服务
 *
 * 统一管理婆媳关系相关的数据查询和上下文构建
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildInLawChatContextForChart = buildInLawChatContextForChart;
const connection_1 = require("../../database/connection");
const inlawContextBuilder_1 = require("./inlawContextBuilder");
/**
 * 标准化性别
 */
function normalizeGender(gender) {
    if (gender === 'male' || gender === 'female') {
        return gender;
    }
    return 'unknown';
}
/**
 * 为指定命盘构建婆媳关系聊天上下文
 *
 * @param params 参数对象
 * @param params.chartProfileId 命盘ID
 * @param params.userQuestion 用户问题
 * @param params.now 当前时间（可选，用于测试）
 * @returns InLawChatContext
 */
async function buildInLawChatContextForChart(params) {
    const { chartProfileId, userQuestion, now = new Date() } = params;
    const pool = (0, connection_1.getPool)();
    // 1. 一次性查询所需数据
    const [rows] = await pool.query(`
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
    return (0, inlawContextBuilder_1.buildInLawChatContext)({
        chartResult,
        gender,
        userQuestion,
        now,
    });
}
//# sourceMappingURL=inlawDataService.js.map