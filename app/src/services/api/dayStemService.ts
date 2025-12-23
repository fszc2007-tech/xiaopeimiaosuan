/**
 * 日主天干解读服务
 * 
 * ✅ 遵循规则：命理解读一律走 Service，不许写死
 */

import { get } from './apiClient';
import { API_ENDPOINTS } from './endpoints';

export interface DayStemReadingDto {
  stem: string;
  element: string;
  yinYang: string;
  title: string;
  description: string;
}

export const dayStemService = {
  /**
   * 获取日主天干解读
   * @param stem 日主天干（甲/乙/丙/丁/戊/己/庚/辛/壬/癸）
   */
  async getReading(stem: string): Promise<DayStemReadingDto> {
    const url = API_ENDPOINTS.BAZI.DAY_STEM(stem);
    return get<DayStemReadingDto>(url);
  },
};

