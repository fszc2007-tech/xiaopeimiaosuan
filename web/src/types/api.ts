/**
 * API 響應類型
 * 
 * ✅ 與 Core 後端保持完全一致
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}


