/**
 * 计费统计 API 服务
 */

import api from './api';
import type {
  ApiResponse,
  BillingSummary,
  BillingTrend,
  BillingByModel,
  BillingQueryParams,
} from '../types';

/**
 * 获取概览统计
 */
export async function getBillingSummary(
  params?: BillingQueryParams
): Promise<BillingSummary> {
  const response = await api.get<ApiResponse<BillingSummary>>(
    '/api/admin/v1/billing/summary',
    { params }
  );
  return response.data.data!;
}

/**
 * 获取趋势数据
 */
export async function getBillingTrend(
  params: {
    start_date: string;
    end_date: string;
    provider?: string;
    model?: string;
    granularity?: 'day' | 'week' | 'month';
  }
): Promise<BillingTrend> {
  const response = await api.get<ApiResponse<BillingTrend>>(
    '/api/admin/v1/billing/trend',
    { params }
  );
  return response.data.data!;
}

/**
 * 按模型聚合统计
 */
export async function getBillingByModel(
  params?: BillingQueryParams
): Promise<BillingByModel> {
  const response = await api.get<ApiResponse<BillingByModel>>(
    '/api/admin/v1/billing/by-model',
    { params }
  );
  return response.data.data!;
}


