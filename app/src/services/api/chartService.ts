/**
 * 命盘相关 API
 */

import { get, post, put, del } from './apiClient';
import { ChartProfile, BaziResult, CreateChartRequest } from '@/types';

export const chartService = {
  /**
   * 获取命盘列表
   */
  async getCharts(): Promise<ChartProfile[]> {
    // TODO: Core 后端未实现此接口，返回空数组
    return get<ChartProfile[]>('/api/v1/bazi/charts').catch(() => []);
  },

  /**
   * 创建命盘（手动排盘）
   */
  async createChart(params: CreateChartRequest): Promise<BaziResult> {
    return post<BaziResult>('/api/v1/bazi/chart', params);
  },

  /**
   * 计算命盘（别名，调用 createChart）
   */
  async computeChart(params: CreateChartRequest): Promise<BaziResult> {
    return this.createChart(params);
  },

  /**
   * 获取命盘详情
   */
  async getChart(chartId: string): Promise<BaziResult> {
    return get<BaziResult>(`/api/v1/bazi/charts/${chartId}`);
  },

  /**
   * 获取命盘详情（使用新的接口返回格式）
   */
  async getChartDetail(chartId: string): Promise<any> {
    return get<any>(`/api/v1/bazi/charts/${chartId}`);
  },

  /**
   * 删除命盘
   */
  async deleteChart(chartId: string): Promise<void> {
    return del<void>(`/api/v1/bazi/charts/${chartId}`);
  },
};

