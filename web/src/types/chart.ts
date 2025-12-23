/**
 * 命盤相關類型定義（H5 版）
 * 
 * ✅ 與 App 端保持完全一致
 */

export type RelationType = 'self' | 'partner' | 'parent' | 'child' | 'friend' | 'other';
export type SortByType = 'recent' | 'created' | 'relation';

export interface ChartProfile {
  chartProfileId: string;
  userId: string;
  name: string;
  relationType: RelationType;
  relationLabel?: string;
  birthday: string; // YYYY-MM-DD
  birthTime?: string; // HH:mm:ss
  timeAccuracy?: 'exact' | 'approx' | 'unknown';
  location?: string;
  timezone?: string;
  useTrueSolarTime: boolean;
  gender: 'male' | 'female';
  calendarType: 'solar' | 'lunar';
  lunarMonth?: number;
  lunarDay?: number;
  isLeapMonth?: boolean;
  baziChartId?: string;
  oneLineSummary?: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
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

// 關係類型標籤映射（繁體中文）
export const RELATION_TYPE_LABELS: Record<RelationType, string> = {
  self: '本人',
  partner: '伴侶',
  parent: '父母',
  child: '子女',
  friend: '朋友',
  other: '其他',
};


