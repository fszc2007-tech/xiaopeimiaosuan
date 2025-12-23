/**
 * 會員管理 API 服務
 */

import api from './api';
import type {
  ApiResponse,
  MembershipUserListItem,
  MembershipUserListParams,
  MembershipUserListResponse,
  MembershipUserDetail,
  GrantMembershipRequest,
  GrantMembershipResponse,
  RevokeMembershipResponse,
  ResetAiTodayResponse,
} from '../types';

/**
 * 獲取會員用戶列表
 */
export async function getMembershipUserList(
  params: MembershipUserListParams
): Promise<MembershipUserListResponse> {
  const response = await api.get<ApiResponse<{
    items: MembershipUserListItem[];
    total: number;
    page: number;
    pageSize: number;
  }>>(
    '/api/admin/v1/membership/users',
    { params }
  );

  const data = response.data.data!;
  return {
    items: data.items,
    pagination: {
      page: data.page,
      pageSize: data.pageSize,
      total: data.total,
    },
  };
}

/**
 * 獲取用戶會員詳情
 */
export async function getMembershipUserDetail(
  userId: string
): Promise<MembershipUserDetail> {
  const response = await api.get<ApiResponse<MembershipUserDetail>>(
    `/api/admin/v1/membership/users/${userId}`
  );
  return response.data.data!;
}

/**
 * 開通 / 延長會員
 */
export async function grantMembership(
  userId: string,
  data: GrantMembershipRequest
): Promise<GrantMembershipResponse> {
  const response = await api.post<ApiResponse<GrantMembershipResponse>>(
    `/api/admin/v1/membership/users/${userId}/grant`,
    data
  );
  return response.data.data!;
}

/**
 * 取消會員
 */
export async function revokeMembership(
  userId: string
): Promise<RevokeMembershipResponse> {
  const response = await api.post<ApiResponse<RevokeMembershipResponse>>(
    `/api/admin/v1/membership/users/${userId}/revoke`
  );
  return response.data.data!;
}

/**
 * 重置今日 AI 次數
 */
export async function resetTodayAiCalls(
  userId: string
): Promise<ResetAiTodayResponse> {
  const response = await api.post<ApiResponse<ResetAiTodayResponse>>(
    `/api/admin/v1/membership/users/${userId}/reset-ai-today`
  );
  return response.data.data!;
}


