/**
 * 帳號管理 API 服務
 * 
 * 功能：
 * - 發起註銷申請
 * - 查詢刪除狀態
 * - 撤銷註銷申請
 * 
 * 參考文檔：app.doc/features/註銷賬號功能設計方案.md v1.1
 */

import { post, get } from './apiClient';
import API_ENDPOINTS from './endpoints';

const ENDPOINTS = API_ENDPOINTS;

// ===== 類型定義 =====

/** 帳號狀態 */
export type UserStatus = 'ACTIVE' | 'PENDING_DELETE' | 'DELETED';

/** 發起註銷響應 */
export interface DeletionRequestResponse {
  status: UserStatus;
  deleteScheduledAt: string; // ISO 8601
}

/** 查詢刪除狀態響應 */
export interface DeletionStatusResponse {
  status: UserStatus;
  deleteScheduledAt: string | null;
  serverNow: string; // ISO 8601
}

/** 撤銷註銷響應 */
export interface DeletionCancelResponse {
  status: UserStatus;
}

// ===== API 函數 =====

/**
 * 發起註銷申請（進入 7 天寬限期）
 * 
 * @returns 註銷狀態和計劃刪除時間
 */
export async function requestDeletion(): Promise<DeletionRequestResponse> {
  return post<DeletionRequestResponse>(ENDPOINTS.ACCOUNT.DELETION_REQUEST);
}

/**
 * 查詢刪除狀態
 * 
 * @returns 當前帳號狀態和計劃刪除時間
 */
export async function getDeletionStatus(): Promise<DeletionStatusResponse> {
  return get<DeletionStatusResponse>(ENDPOINTS.ACCOUNT.DELETION_STATUS);
}

/**
 * 撤銷註銷申請
 * 
 * @returns 更新後的帳號狀態
 */
export async function cancelDeletion(): Promise<DeletionCancelResponse> {
  return post<DeletionCancelResponse>(ENDPOINTS.ACCOUNT.DELETION_CANCEL);
}

