/**
 * 八字相关 API
 * 
 * 包含命盘计算、档案管理等接口
 */

import { get, post, put, del } from './apiClient';

// ===== 类型定义 =====

export type RelationType = 'self' | 'partner' | 'parent' | 'child' | 'friend' | 'other';
export type SortByType = 'recent' | 'created' | 'relation';

export interface ChartProfile {
  profileId: string;
  userId: string;
  chartId: string;
  name: string;
  relationType: RelationType;
  relationLabel?: string;
  isSelf: boolean;
  notes?: string;
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number;
  birthMinute?: number;
  gender: 'male' | 'female';
  createdAt: string;
  lastViewedAt?: string;
}

export interface GetChartsParams {
  search?: string;
  relationType?: RelationType[];
  sortBy?: SortByType;
  limit?: number;
  offset?: number;
}

export interface GetChartsResponse {
  profiles: ChartProfile[];
  total: number;
}

export interface ComputeChartParams {
  name: string;
  gender: 'male' | 'female';
  birth: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute?: number;
    calendar_type?: 'solar' | 'lunar'; // ✅ 新增：历法类型
  };
  timezone_offset_minutes?: number;     // ✅ 新增：时区偏移（分钟），默认 480
  is_dst?: boolean;                    // ✅ 新增：夏令时开关，默认 false
  birth_place?: string;                // ✅ 新增：出生城市名称
  relationType?: RelationType;
  relationLabel?: string;
  notes?: string;
  forceRecompute?: boolean;
}

export interface UpdateChartParams {
  name?: string;
  relationType?: RelationType;
  relationLabel?: string;
  notes?: string;
}

// ===== API 方法 =====

/**
 * 计算命盘
 * POST /api/v1/bazi/chart
 */
export const computeChart = async (params: ComputeChartParams): Promise<any> => {
  return post<any>('/api/v1/bazi/chart', params);
};

/**
 * 获取命盘档案列表
 * GET /api/v1/bazi/charts
 */
export const getCharts = async (params?: GetChartsParams): Promise<GetChartsResponse> => {
  return get<GetChartsResponse>('/api/v1/bazi/charts', { params });
};

/**
 * 获取命盘详情
 * GET /api/v1/bazi/charts/:chartId
 * 
 * 直接调用 Core 引擎，返回完整计算结果
 */
export const getChartDetail = async (chartId: string): Promise<any> => {
  console.log('[API] 获取命盘详情:', chartId);
  return get<any>(`/api/v1/bazi/charts/${chartId}`);
};

/**
 * 更新命盘档案
 * PUT /api/v1/bazi/charts/:chartId
 */
export const updateChart = async (chartId: string, params: UpdateChartParams): Promise<any> => {
  return put<any>(`/api/v1/bazi/charts/${chartId}`, params);
};

/**
 * 删除命盘档案
 * DELETE /api/v1/bazi/charts/:chartId
 */
export const deleteChart = async (chartId: string): Promise<void> => {
  return del<void>(`/api/v1/bazi/charts/${chartId}`);
};


