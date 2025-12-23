/**
 * 系统设置 API 服务
 */

import api from './api';
import type {
  ApiResponse,
  SystemSettings,
  UpdateRateLimitRequest,
  UpdateProFeatureGateRequest,
  UpdateRateLimitConfigRequest,
} from '../types';

/**
 * 获取所有系统配置
 */
export async function getSystemSettings(): Promise<SystemSettings> {
  const response = await api.get<ApiResponse<{ settings: any[] }>>(
    '/api/admin/v1/system/settings'
  );

  // 解析返回的设置数组
  const settings = response.data.data!.settings;
  const result: any = {};

  settings.forEach((item: any) => {
    if (item.key === 'rate_limit_enabled') {
      result.rateLimitEnabled = item.value;
    } else if (item.key === 'pro_feature_gate') {
      result.proFeatureGate = item.value;
    } else if (item.key === 'rate_limit_config') {
      result.rateLimitConfig = item.value;
    }
  });

  return result as SystemSettings;
}

/**
 * 更新限流开关
 */
export async function updateRateLimit(data: UpdateRateLimitRequest): Promise<void> {
  await api.put('/api/admin/v1/system/settings/rate-limit', data);
}

/**
 * 更新 Pro 功能门禁
 */
export async function updateProFeatureGate(data: UpdateProFeatureGateRequest): Promise<void> {
  await api.put('/api/admin/v1/system/settings/pro-features', data);
}

/**
 * 更新限流次数配置
 */
export async function updateRateLimitConfig(data: UpdateRateLimitConfigRequest): Promise<void> {
  await api.put('/api/admin/v1/system/settings/rate-limit-config', data);
}

