/**
 * 十神解读相关 API
 */

import { get } from './apiClient';
import { API_ENDPOINTS } from './endpoints';

export type PillarType = 'year' | 'month' | 'day' | 'hour';
export type GenderType = 'male' | 'female';

export interface ShishenReadingDto {
  code: string;
  name: string;
  badge_text: string;
  type: 'auspicious' | 'inauspicious' | 'neutral';
  short_title: string;
  pillar_explanation: Array<{
    pillar: PillarType;
    text: string;
  }>;
  recommended_questions: string[];
  // 新增：喜神/忌神判断
  favor_status?: 'favorable' | 'unfavorable' | 'neutral'; // favorable=喜神, unfavorable=忌神, neutral=中性
}

export const shishenService = {
  /**
   * 获取十神解读内容
   * 
   * @param code 十神代码（如 'bi_jian', 'jie_cai'）
   * @param pillarType 柱位类型（可选）
   * @param gender 性別（必填，male/female，排盤時必然有性別）
   * @param chartId 命盘ID（可选，用于判断喜神/忌神）
   * @returns 解读内容，如果不存在则抛出错误
   */
  async getReading(
    code: string,
    pillarType: PillarType | undefined,
    gender: GenderType,
    chartId?: string
  ): Promise<ShishenReadingDto> {
    const url = API_ENDPOINTS.BAZI.SHI_SHEN(code);
    
    // 構建查詢參數（gender 必填）
    const params: Record<string, string> = {
      gender,
    };
    if (pillarType) params.pillarType = pillarType;
    if (chartId) params.chartId = chartId;
    
    const config = { params };
    
    try {
      const response = await get<ShishenReadingDto>(url, config);
      return response;
    } catch (error: any) {
      // 如果是 404 错误，说明数据库中没有数据
      if (error?.code === 'SHISHEN_READING_NOT_FOUND' || error?.response?.status === 404) {
        throw new Error('該十神的解讀內容尚未配置');
      }
      throw error;
    }
  },
};


