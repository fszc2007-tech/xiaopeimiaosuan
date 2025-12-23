/**
 * 神煞解读相关 API
 */

import { get } from './apiClient';
import { API_ENDPOINTS } from './endpoints';

export type PillarType = 'year' | 'month' | 'day' | 'hour';
export type GenderType = 'male' | 'female';

export interface ShenshaReadingDto {
  code: string;
  name: string;
  badge_text: string;
  type: 'auspicious' | 'inauspicious' | 'neutral';
  short_title: string;
  summary: string;
  bullet_points: string[];
  pillar_explanation: Array<{
    pillar: PillarType;
    text: string;
  }>;
  recommended_questions: string[];
}

export const shenshaService = {
  /**
   * 获取神煞解读内容
   * 
   * @param code 神煞代码（如 'tian_yi_gui_ren'）
   * @param pillarType 柱位类型（可选）
   * @param gender 性別（必填，male/female，排盤時必然有性別）
   * @returns 解读内容，如果不存在则抛出错误
   */
  async getReading(
    code: string,
    pillarType: PillarType | undefined,
    gender: GenderType
  ): Promise<ShenshaReadingDto> {
    const url = API_ENDPOINTS.BAZI.SHEN_SHA(code);
    
    // 構建查詢參數（gender 必填）
    const params: Record<string, string> = {
      gender,
    };
    if (pillarType) params.pillarType = pillarType;
    
    const config = { params };
    
    try {
      const response = await get<ShenshaReadingDto>(url, config);
      return response;
    } catch (error: any) {
      // 如果是 404 错误，说明数据库中没有数据
      if (error?.code === 'SHENSHA_READING_NOT_FOUND' || error?.response?.status === 404) {
        throw new Error('該神煞的解讀內容尚未配置');
      }
      throw error;
    }
  },
};

