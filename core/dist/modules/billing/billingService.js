"use strict";
/**
 * LLM 计费服务
 *
 * 负责：
 * - 计算 LLM 调用费用
 * - 记录 usage 日志
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateCost = calculateCost;
exports.logUsage = logUsage;
exports.mapModelToProvider = mapModelToProvider;
exports.getActualModelName = getActualModelName;
const connection_1 = require("../../database/connection");
const types_1 = require("./types");
/**
 * 计算费用（分）
 *
 * @param params 计费参数
 * @returns 费用（分）
 */
async function calculateCost(params) {
    const { provider, model, inputTokens, outputTokens, cacheHit, usageTime } = params;
    const pool = (0, connection_1.getPool)();
    // 确定 tier
    const tier = cacheHit ? 'cache_hit' : 'normal';
    // 查询输入价格规则
    const inputPrice = await getPriceRule(provider, model, 'input', tier, usageTime);
    // 查询输出价格规则
    const outputPrice = await getPriceRule(provider, model, 'output', tier, usageTime);
    // 如果找不到价格规则，返回 0（不中断调用）
    if (!inputPrice || !outputPrice) {
        console.error(`[BillingService] 价格规则未配置: provider=${provider}, model=${model}, tier=${tier}`);
        return 0;
    }
    // 计算费用（元）
    const inputCostYuan = (inputTokens / 1000000) * parseFloat(inputPrice.price_per_million);
    const outputCostYuan = (outputTokens / 1000000) * parseFloat(outputPrice.price_per_million);
    const totalCostYuan = inputCostYuan + outputCostYuan;
    // 转为分，使用 Math.round 四舍五入
    const costCents = Math.round(totalCostYuan * 100);
    return costCents;
}
/**
 * 获取价格规则
 *
 * @param provider 提供商
 * @param model 模型名称
 * @param direction 方向
 * @param tier 层级
 * @param usageTime 调用发生时间
 * @returns 价格规则或 null
 */
async function getPriceRule(provider, model, direction, tier, usageTime) {
    const pool = (0, connection_1.getPool)();
    const [rows] = await pool.execute(`SELECT price_per_million
     FROM llm_pricing_rules
     WHERE provider = ?
       AND model = ?
       AND direction = ?
       AND tier = ?
       AND effective_from <= ?
       AND (effective_to IS NULL OR effective_to > ?)
     ORDER BY effective_from DESC
     LIMIT 1`, [provider, model, direction, tier, usageTime, usageTime]);
    if (rows.length === 0) {
        return null;
    }
    // 确保 price_per_million 是字符串格式
    return {
        price_per_million: String(rows[0].price_per_million),
    };
}
/**
 * 记录 usage 日志
 *
 * @param params 日志参数
 */
async function logUsage(params) {
    const { provider, model, isThinkingMode, cacheHit, userId, source, traceId, inputTokens, outputTokens, totalTokens, costCents, hasUsage, hasPricing, usageTime, } = params;
    // 校验 user_id 和 source 一致性
    if (source === types_1.LLMSource.App && !userId) {
        console.warn(`[BillingService] App 端调用缺少 user_id, source=${source}`);
        // 不中断，但记录警告
    }
    const pool = (0, connection_1.getPool)();
    try {
        await pool.execute(`INSERT INTO llm_usage_logs (
        provider, model, is_thinking_mode, cache_hit, user_id, source, trace_id,
        input_tokens, output_tokens, total_tokens, cost_cents,
        has_usage, has_pricing, currency, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'CNY', ?)`, [
            provider,
            model,
            isThinkingMode ? 1 : 0,
            cacheHit ? 1 : 0,
            userId || null,
            source,
            traceId || null,
            inputTokens,
            outputTokens,
            totalTokens,
            costCents,
            hasUsage ? 1 : 0,
            hasPricing ? 1 : 0,
            usageTime,
        ]);
    }
    catch (error) {
        // 日志记录失败不应该影响主流程
        console.error('[BillingService] 记录 usage 日志失败:', error);
    }
}
/**
 * 从 LLMModel 映射到 LLMProvider
 */
function mapModelToProvider(model) {
    if (model === 'deepseek') {
        return types_1.LLMProvider.DeepSeek;
    }
    else if (model === 'chatgpt') {
        return types_1.LLMProvider.OpenAI;
    }
    else if (model === 'qwen') {
        return types_1.LLMProvider.Qwen;
    }
    // 默认返回 DeepSeek
    console.warn(`[BillingService] 未知的 model: ${model}, 默认使用 DeepSeek`);
    return types_1.LLMProvider.DeepSeek;
}
/**
 * 从模型名称获取实际模型（如 deepseek-chat, deepseek-reasoner）
 */
function getActualModelName(model, isThinkingMode) {
    if (model === 'deepseek') {
        return isThinkingMode ? 'deepseek-reasoner' : 'deepseek-chat';
    }
    // ChatGPT 和 Qwen 暂时返回原值，后续扩展
    return model;
}
//# sourceMappingURL=billingService.js.map