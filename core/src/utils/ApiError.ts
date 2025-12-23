/**
 * 通用 API 錯誤類
 * 支持自定義 HTTP 狀態碼和錯誤代碼
 */

export class ApiError extends Error {
  status: number;
  code: string;
  retryAfter?: number; // 限流時的重試秒數

  constructor(
    message: string,
    status: number = 500,
    code: string = 'INTERNAL_SERVER_ERROR',
    retryAfter?: number
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.retryAfter = retryAfter;
  }

  // 工廠方法：創建限流錯誤
  static rateLimited(message: string, retryAfter: number = 60): ApiError {
    return new ApiError(message, 429, 'RATE_LIMITED', retryAfter);
  }

  // 工廠方法：創建驗證錯誤
  static badRequest(message: string, code: string = 'BAD_REQUEST'): ApiError {
    return new ApiError(message, 400, code);
  }

  // 工廠方法：創建未授權錯誤
  static unauthorized(message: string): ApiError {
    return new ApiError(message, 401, 'UNAUTHORIZED');
  }

  // 工廠方法：創建禁止訪問錯誤
  static forbidden(message: string, code: string = 'FORBIDDEN'): ApiError {
    return new ApiError(message, 403, code);
  }

  // 工廠方法：創建未找到錯誤
  static notFound(message: string, code: string = 'NOT_FOUND'): ApiError {
    return new ApiError(message, 404, code);
  }

  // 工廠方法：創建衝突錯誤（狀態不一致）
  static conflict(message: string, code: string = 'CONFLICT'): ApiError {
    return new ApiError(message, 409, code);
  }

  // 工廠方法：創建資源已刪除錯誤
  static gone(message: string, code: string = 'GONE'): ApiError {
    return new ApiError(message, 410, code);
  }

  // 工廠方法：創建內部錯誤
  static internal(message: string, code: string = 'INTERNAL_SERVER_ERROR'): ApiError {
    return new ApiError(message, 500, code);
  }
}

