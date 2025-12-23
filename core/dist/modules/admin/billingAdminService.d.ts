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
export interface BillingSummaryDto {
    total_tokens: number;
    total_input_tokens: number;
    total_output_tokens: number;
    total_cost_cents: number;
    total_cost_yuan: number;
    currency: string;
    forecast_month_tokens?: number;
    forecast_month_cost_cents?: number;
    forecast_month_cost_yuan?: number;
    forecast_basis_days?: number;
    forecast_used_ratio?: number;
    forecast_note?: string;
}
export interface BillingTrendItemDto {
    date: string;
    total_tokens: number;
    total_cost_cents: number;
    total_cost_yuan: number;
    input_tokens: number;
    output_tokens: number;
    request_count: number;
}
export interface BillingTrendDto {
    items: BillingTrendItemDto[];
}
export interface BillingByModelItemDto {
    provider: string;
    model: string;
    total_tokens: number;
    total_cost_cents: number;
    total_cost_yuan: number;
    request_count: number;
}
export interface BillingByModelDto {
    items: BillingByModelItemDto[];
}
/**
 * 获取概览统计
 */
export declare function getBillingSummary(params: {
    startDate?: string;
    endDate?: string;
    provider?: string;
    model?: string;
}): Promise<BillingSummaryDto>;
/**
 * 获取趋势数据
 */
export declare function getBillingTrend(params: {
    startDate: string;
    endDate: string;
    provider?: string;
    model?: string;
    granularity?: 'day' | 'week' | 'month';
}): Promise<BillingTrendDto>;
/**
 * 按模型聚合统计
 */
export declare function getBillingByModel(params: {
    startDate?: string;
    endDate?: string;
    provider?: string;
}): Promise<BillingByModelDto>;
//# sourceMappingURL=billingAdminService.d.ts.map