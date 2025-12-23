/**
 * 反馈管理 API 服务
 */

import api from './api';
import type {
  ApiResponse,
  Feedback,
  FeedbackListParams,
  FeedbackListResponse,
  UpdateFeedbackRequest,
} from '../types';

/**
 * 获取反馈列表
 */
export async function getFeedbackList(params: FeedbackListParams): Promise<FeedbackListResponse> {
  const response = await api.get<ApiResponse<{
    items: Feedback[];
    total: number;
    page: number;
    pageSize: number;
  }>>(
    '/api/admin/v1/feedbacks',
    { params }
  );
  
  const data = response.data.data!;
  return {
    items: data.items,
    total: data.total,
    page: data.page,
    pageSize: data.pageSize,
  };
}

/**
 * 获取反馈详情
 */
export async function getFeedbackDetail(id: string): Promise<Feedback> {
  const response = await api.get<ApiResponse<Feedback>>(
    `/api/admin/v1/feedbacks/${id}`
  );
  return response.data.data!;
}

/**
 * 更新反馈（状态/回复）
 */
export async function updateFeedback(id: string, data: UpdateFeedbackRequest): Promise<Feedback> {
  const response = await api.put<ApiResponse<Feedback>>(
    `/api/admin/v1/feedbacks/${id}`,
    data
  );
  return response.data.data!;
}

/**
 * 删除反馈
 */
export async function deleteFeedback(id: string): Promise<void> {
  await api.delete(`/api/admin/v1/feedbacks/${id}`);
}

