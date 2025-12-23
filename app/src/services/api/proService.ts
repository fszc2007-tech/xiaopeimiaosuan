/**
 * Pro 會員相關 API 服務
 */

import { get, post } from './apiClient';
import { ENV } from '@/config/env';

// ===== 類型定義 =====

export interface MembershipStatus {
  isPro: boolean;
  proPlan: 'monthly' | 'quarterly' | 'yearly' | null;
  proExpiresAt: string | null;
  features: string[];
  aiCallsToday: number;
  aiDailyLimit: number;
  aiRemaining: number;
  maxCharts?: number; // 命盘数量限制，null 或 0 表示无限制
}

export interface SubscribeRequest {
  plan: 'monthly' | 'quarterly' | 'yearly';
}

export interface SubscribeResponse {
  subscription?: {
    subscriptionId: string;
    plan: string;
    status: string;
    startedAt: string;
    expiresAt: string | null;
  };
  user: {
    isPro: boolean;
    proExpiresAt: string | null;
    proPlan: string | null;
  };
  message?: string;
  source?: string;
}

// ===== API 方法 =====

export const proService = {
  /**
   * 獲取會員狀態（包含 AI 次數信息）
   * 
   * 注意：此方法直接返回 MembershipStatus 對象，不需要再 .data
   */
  async getStatus(): Promise<MembershipStatus> {
    const response = await get<any>('/api/v1/pro/status');
    
    // 後端返回的字段名與前端不一致，需要映射
    return {
      isPro: Boolean(response.isPro), // 轉換為 boolean（後端可能返回 0/1）
      proPlan: response.plan || null,
      proExpiresAt: response.expiresAt || null,
      features: response.features || [],
      aiCallsToday: response.aiCallsToday || 0,
      aiDailyLimit: response.aiDailyLimit || 0,
      aiRemaining: response.aiRemaining || 0,
      maxCharts: response.maxCharts,
    };
  },

  /**
   * 訂閱 Pro 會員（統一入口）
   * 
   * 根據環境配置自動選擇：
   * - Mock 模式（MOCK_IOS_SUBSCRIPTION=1 且 __DEV__）：調用 /dev/force-pro
   * - 正式模式：調用 /api/v1/pro/subscribe
   * 
   * @param data 訂閱請求（包含 plan）
   * @returns 訂閱結果
   */
  async subscribe(data: SubscribeRequest): Promise<SubscribeResponse> {
    // 判斷是否使用 Mock 模式
    const isMockMode = __DEV__ && ENV.MOCK_IOS_SUBSCRIPTION;
    
    if (isMockMode) {
      console.log('[ProService] 🎭 使用 Mock 模式訂閱');
      // Mock 模式：調用開發專用接口
      return await post<SubscribeResponse>('/dev/force-pro', { plan: data.plan });
    } else {
      console.log('[ProService] 🔐 使用正式訂閱接口');
      // 正式模式：調用真實訂閱接口
      return await post<SubscribeResponse>('/api/v1/pro/subscribe', data);
    }
  },

  /**
   * 假支付訂閱（已廢棄，建議使用 subscribe）
   * 
   * @deprecated 請使用 subscribe() 方法
   */
  async fakeSubscribe(data: SubscribeRequest): Promise<SubscribeResponse> {
    console.warn('[ProService] ⚠️ fakeSubscribe 已廢棄，建議使用 subscribe()');
    return await post<SubscribeResponse>('/api/v1/pro/fake-subscribe', data);
  },
};

