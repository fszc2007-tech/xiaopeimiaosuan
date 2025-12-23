"use strict";
/**
 * Admin 计费统计服务
 *
 * 功能：
 * 1. 获取概览统计（含费用预估）
 * 2. 获取趋势数据
 * 3. 按模型聚合统计
 *
 * 遵循文档：
 * - Admin-LLM计费统计实施方案.md
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBillingSummary = getBillingSummary;
exports.getBillingTrend = getBillingTrend;
exports.getBillingByModel = getBillingByModel;
const connection_1 = require("../../database/connection");
// ===== 服务函数 =====
/**
 * 获取概览统计
 */
async function getBillingSummary(params) {
    const { startDate, endDate, provider, model } = params;
    const pool = (0, connection_1.getPool)();
    // 确定时间范围（默认：本自然月）
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const queryStart = startDate ? new Date(startDate + ' 00:00:00') : monthStart;
    const queryEnd = endDate ? new Date(endDate + ' 23:59:59') : monthEnd;
    // 构建查询条件
    const conditions = ['created_at >= ?', 'created_at <= ?'];
    const queryParams = [queryStart, queryEnd];
    if (provider) {
        conditions.push('provider = ?');
        queryParams.push(provider);
    }
    if (model) {
        conditions.push('model = ?');
        queryParams.push(model);
    }
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    // 查询汇总数据
    const [rows] = await pool.execute(`SELECT 
      SUM(input_tokens) AS total_input_tokens,
      SUM(output_tokens) AS total_output_tokens,
      SUM(total_tokens) AS total_tokens,
      SUM(cost_cents) AS total_cost_cents
     FROM llm_usage_logs
     ${whereClause}`, queryParams);
    const result = rows[0];
    const totalInputTokens = Number(result.total_input_tokens || 0);
    const totalOutputTokens = Number(result.total_output_tokens || 0);
    const totalTokens = Number(result.total_tokens || 0);
    const totalCostCents = Number(result.total_cost_cents || 0);
    const totalCostYuan = totalCostCents / 100;
    // 判断是否为跨月查询
    const isCurrentMonth = !startDate && !endDate;
    const isCustomRange = startDate || endDate;
    const isCustomMonth = isCustomRange &&
        queryStart.getMonth() === now.getMonth() &&
        queryStart.getFullYear() === now.getFullYear() &&
        queryEnd.getMonth() === now.getMonth() &&
        queryEnd.getFullYear() === now.getFullYear();
    // 费用预估（仅对本自然月）
    let forecast = {};
    if (isCurrentMonth || isCustomMonth) {
        // 计算本月已用天数
        const daysUsed = Math.max(1, Math.floor((now.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24)) + 1);
        if (daysUsed > 0 && totalTokens > 0) {
            // 计算日均值
            const avgTokensPerDay = totalTokens / daysUsed;
            const avgCostPerDay = totalCostCents / daysUsed;
            // 本月总天数
            const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
            // 预估全月
            const forecastMonthTokens = Math.round(avgTokensPerDay * daysInMonth);
            const forecastMonthCostCents = Math.round(avgCostPerDay * daysInMonth);
            const forecastMonthCostYuan = forecastMonthCostCents / 100;
            // 计算使用比例
            const forecastUsedRatio = forecastMonthCostCents > 0
                ? totalCostCents / forecastMonthCostCents
                : 0;
            forecast = {
                forecast_month_tokens: forecastMonthTokens,
                forecast_month_cost_cents: forecastMonthCostCents,
                forecast_month_cost_yuan: forecastMonthCostYuan,
                forecast_basis_days: daysUsed,
                forecast_used_ratio: Math.min(1, forecastUsedRatio), // 不超过 1
                forecast_note: daysUsed <= 2
                    ? '数据较少，预估仅供参考'
                    : `基于本月前${daysUsed}天数据推算`,
            };
        }
        else {
            forecast = {
                forecast_month_tokens: 0,
                forecast_month_cost_cents: 0,
                forecast_month_cost_yuan: 0,
                forecast_basis_days: 0,
                forecast_used_ratio: 0,
                forecast_note: '本月尚无调用数据，无法预估',
            };
        }
    }
    else {
        // 跨月查询，不做预估
        forecast = {
            forecast_note: '仅显示实际消耗，不提供预估',
        };
    }
    return {
        total_tokens: totalTokens,
        total_input_tokens: totalInputTokens,
        total_output_tokens: totalOutputTokens,
        total_cost_cents: totalCostCents,
        total_cost_yuan: totalCostYuan,
        currency: 'CNY',
        ...forecast,
    };
}
/**
 * 获取趋势数据
 */
async function getBillingTrend(params) {
    const { startDate, endDate, provider, model, granularity = 'day' } = params;
    const pool = (0, connection_1.getPool)();
    // 计算时间跨度（天）
    const start = new Date(startDate + ' 00:00:00');
    const end = new Date(endDate + ' 23:59:59');
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    // 构建查询条件
    const conditions = ['created_at >= ?', 'created_at <= ?'];
    const queryParams = [start, end];
    if (provider) {
        conditions.push('provider = ?');
        queryParams.push(provider);
    }
    if (model) {
        conditions.push('model = ?');
        queryParams.push(model);
    }
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    // 根据时间跨度选择数据源
    let query;
    if (daysDiff <= 3) {
        // ≤ 3 天：直接查 logs（更精细）
        query = `
      SELECT 
        DATE(created_at) AS date,
        SUM(input_tokens) AS total_input_tokens,
        SUM(output_tokens) AS total_output_tokens,
        SUM(total_tokens) AS total_tokens,
        SUM(cost_cents) AS total_cost_cents,
        COUNT(*) AS request_count
      FROM llm_usage_logs
      ${whereClause}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;
    }
    else {
        // > 3 天：查 daily 表（性能优化）
        query = `
      SELECT 
        date,
        SUM(total_input_tokens) AS total_input_tokens,
        SUM(total_output_tokens) AS total_output_tokens,
        SUM(total_tokens) AS total_tokens,
        SUM(total_cost_cents) AS total_cost_cents,
        SUM(total_requests) AS request_count
      FROM llm_usage_daily
      WHERE date >= ? AND date <= ?
      ${provider ? 'AND provider = ?' : ''}
      ${model ? 'AND model = ?' : ''}
      GROUP BY date
      ORDER BY date ASC
    `;
        // 调整参数顺序（daily 表用 date 字段）
        const dailyParams = [startDate, endDate];
        if (provider)
            dailyParams.push(provider);
        if (model)
            dailyParams.push(model);
        queryParams.splice(0, queryParams.length, ...dailyParams);
    }
    const [rows] = await pool.execute(query, queryParams);
    const items = rows.map((row) => ({
        date: row.date instanceof Date
            ? row.date.toISOString().split('T')[0]
            : String(row.date).split('T')[0],
        total_tokens: Number(row.total_tokens || 0),
        total_cost_cents: Number(row.total_cost_cents || 0),
        total_cost_yuan: Number(row.total_cost_cents || 0) / 100,
        input_tokens: Number(row.total_input_tokens || 0),
        output_tokens: Number(row.total_output_tokens || 0),
        request_count: Number(row.request_count || 0),
    }));
    return { items };
}
/**
 * 按模型聚合统计
 */
async function getBillingByModel(params) {
    const { startDate, endDate, provider } = params;
    const pool = (0, connection_1.getPool)();
    // 确定时间范围
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const queryStart = startDate ? new Date(startDate + ' 00:00:00') : monthStart;
    const queryEnd = endDate ? new Date(endDate + ' 23:59:59') : monthEnd;
    // 优先使用 daily 表（如果时间范围在 daily 表覆盖范围内）
    const startDateStr = queryStart.toISOString().split('T')[0];
    const endDateStr = queryEnd.toISOString().split('T')[0];
    // 检查 daily 表是否有数据
    const [dailyCheck] = await pool.execute(`SELECT COUNT(*) AS count FROM llm_usage_daily 
     WHERE date >= ? AND date <= ?`, [startDateStr, endDateStr]);
    let query;
    let queryParams;
    if (dailyCheck[0].count > 0) {
        // 使用 daily 表
        const conditions = ['date >= ?', 'date <= ?'];
        queryParams = [startDateStr, endDateStr];
        if (provider) {
            conditions.push('provider = ?');
            queryParams.push(provider);
        }
        query = `
      SELECT 
        provider,
        model,
        SUM(total_tokens) AS total_tokens,
        SUM(total_cost_cents) AS total_cost_cents,
        SUM(total_requests) AS request_count
      FROM llm_usage_daily
      WHERE ${conditions.join(' AND ')}
      GROUP BY provider, model
      ORDER BY total_cost_cents DESC
    `;
    }
    else {
        // 使用 logs 表
        const conditions = ['created_at >= ?', 'created_at <= ?'];
        queryParams = [queryStart, queryEnd];
        if (provider) {
            conditions.push('provider = ?');
            queryParams.push(provider);
        }
        query = `
      SELECT 
        provider,
        model,
        SUM(total_tokens) AS total_tokens,
        SUM(cost_cents) AS total_cost_cents,
        COUNT(*) AS request_count
      FROM llm_usage_logs
      WHERE ${conditions.join(' AND ')}
      GROUP BY provider, model
      ORDER BY total_cost_cents DESC
    `;
    }
    const [rows] = await pool.execute(query, queryParams);
    const items = rows.map((row) => ({
        provider: row.provider,
        model: row.model,
        total_tokens: Number(row.total_tokens || 0),
        total_cost_cents: Number(row.total_cost_cents || 0),
        total_cost_yuan: Number(row.total_cost_cents || 0) / 100,
        request_count: Number(row.request_count || 0),
    }));
    return { items };
}
//# sourceMappingURL=billingAdminService.js.map