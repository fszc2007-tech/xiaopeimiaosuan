/**
 * 用户反馈服务
 * 
 * 负责提交和查询用户反馈
 */

import { get, post } from './apiClient';
import { API_ENDPOINTS } from './endpoints';

export interface FeedbackDto {
  id: string;
  userId: string;
  type: 'suggest' | 'problem';
  content: string;
  contact?: string;
  imagesJson?: string[];
  status: 'pending' | 'processing' | 'resolved';
  adminReply?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubmitFeedbackParams {
  type: 'suggest' | 'problem';
  content: string;
  contact?: string;
  imagesJson?: string[];
}

export interface FeedbackListQuery {
  type?: 'suggest' | 'problem';
  status?: 'pending' | 'processing' | 'resolved';
  page?: number;
  pageSize?: number;
}

export interface FeedbackListResponse {
  items: FeedbackDto[];
  total: number;
  page: number;
  pageSize: number;
}

export const feedbackService = {
  /**
   * 提交反馈
   */
  async submit(params: SubmitFeedbackParams): Promise<FeedbackDto> {
    return post<FeedbackDto>(API_ENDPOINTS.FEEDBACK.SUBMIT, params);
  },

  /**
   * 获取当前用户的反馈列表
   */
  async getList(query?: FeedbackListQuery): Promise<FeedbackListResponse> {
    const params = new URLSearchParams();
    
    if (query?.type) params.append('type', query.type);
    if (query?.status) params.append('status', query.status);
    if (query?.page) params.append('page', query.page.toString());
    if (query?.pageSize) params.append('pageSize', query.pageSize.toString());
    
    const url = `${API_ENDPOINTS.FEEDBACK.SUBMIT}?${params.toString()}`;
    return get<FeedbackListResponse>(url);
  },

  /**
   * 获取单个反馈详情
   */
  async getDetail(id: string): Promise<FeedbackDto> {
    return get<FeedbackDto>(`${API_ENDPOINTS.FEEDBACK.SUBMIT}/${id}`);
  },
};

