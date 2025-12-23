/**
 * 用户管理 API 服务
 */

import api from './api';
import type {
  ApiResponse,
  User,
  UserListParams,
  UserListResponse,
  CreateTestUserRequest,
  CursorTestAccount,
} from '../types';

/**
 * 获取用户列表
 */
export async function getUserList(params: UserListParams): Promise<UserListResponse> {
  const response = await api.get<ApiResponse<{
    items: User[];
    total: number;
    page: number;
    pageSize: number;
  }>>(
    '/api/admin/v1/users',
    { params }
  );
  
  // 转换后端数据结构为前端期望的格式
  const data = response.data.data!;
  return {
    users: data.items,
    pagination: {
      page: data.page,
      pageSize: data.pageSize,
      total: data.total,
    },
  };
}

/**
 * 获取用户详情
 */
export async function getUserDetail(userId: string): Promise<User> {
  const response = await api.get<ApiResponse<{ user: User }>>(
    `/api/admin/v1/users/${userId}`
  );
  return response.data.data!.user;
}

/**
 * 创建测试用户
 */
export async function createTestUser(data: CreateTestUserRequest): Promise<User> {
  const response = await api.post<ApiResponse<User>>(
    '/api/admin/v1/users/test',
    data
  );
  return response.data.data!;
}

/**
 * 获取 Cursor 测试账号
 */
export async function getCursorTestAccount(): Promise<CursorTestAccount> {
  const response = await api.get<ApiResponse<{ account: CursorTestAccount }>>(
    '/api/admin/v1/users/cursor/test-account'
  );
  return response.data.data!.account;
}

/**
 * 重置 Cursor 测试账号密码
 */
export async function resetCursorPassword(newPassword: string): Promise<void> {
  await api.post('/api/admin/v1/users/cursor/reset-password', {
    password: newPassword,
  });
}

