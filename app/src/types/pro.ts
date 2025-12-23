/**
 * Pro 订阅相关类型定义
 */

export interface ProStatus {
  isPro: boolean;
  plan?: 'yearly' | 'monthly' | 'lifetime';
  expiresAt?: string; // ISO 8601
  features: string[];
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  displayName: string;
  price: number;
  currency: string;
  duration: string; // "1年"、"1个月"、"永久"
  features: string[];
  isPopular?: boolean;
}

export interface SubscribeRequest {
  plan: 'yearly' | 'monthly' | 'lifetime';
}

export interface SubscribeResponse {
  subscriptionId: string;
  status: 'active';
  plan: string;
  expiresAt?: string;
}

