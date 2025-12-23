/**
 * 命盤相關 API（H5 版）
 * 
 * ✅ 與 App 端邏輯完全一致
 */

import { get, post, put, del } from './apiClient';
import type {
  ChartProfile,
  GetChartsParams,
  GetChartsResponse,
} from '@/types/chart';

export const chartService = {
  /**
   * 獲取命盤檔案列表
   */
  async getCharts(params?: GetChartsParams): Promise<GetChartsResponse> {
    return get<GetChartsResponse>('/api/v1/bazi/charts', params);
  },

  /**
   * 獲取命盤詳情
   */
  async getChartDetail(chartId: string): Promise<any> {
    return get<any>(`/api/v1/bazi/chart/${chartId}`);
  },

  /**
   * 計算命盤
   * ✅ 與 App 端完全一致的接口
   */
  async computeChart(params: {
    name: string;
    gender: 'male' | 'female';
    birth: {
      year: number;
      month: number;
      day: number;
      hour: number;
      minute?: number;
      calendar_type?: 'solar' | 'lunar';
    };
    timezone_offset_minutes?: number;
    is_dst?: boolean;
    birth_place?: string;
    relationType?: 'self' | 'partner' | 'parent' | 'child' | 'friend' | 'other';
    notes?: string;
  }): Promise<any> {
    return post<any>('/api/v1/bazi/chart', params);
  },

  /**
   * 更新命盤檔案
   */
  async updateChart(chartId: string, params: any): Promise<ChartProfile> {
    return put<ChartProfile>(`/api/v1/bazi/charts/${chartId}`, params);
  },

  /**
   * 刪除命盤檔案
   */
  async deleteChart(chartId: string): Promise<void> {
    return del<void>(`/api/v1/bazi/charts/${chartId}`);
  },
};

