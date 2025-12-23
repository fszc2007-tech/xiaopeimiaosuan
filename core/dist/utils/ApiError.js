"use strict";
/**
 * 通用 API 錯誤類
 * 支持自定義 HTTP 狀態碼和錯誤代碼
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = void 0;
class ApiError extends Error {
    constructor(message, status = 500, code = 'INTERNAL_SERVER_ERROR', retryAfter) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.code = code;
        this.retryAfter = retryAfter;
    }
    // 工廠方法：創建限流錯誤
    static rateLimited(message, retryAfter = 60) {
        return new ApiError(message, 429, 'RATE_LIMITED', retryAfter);
    }
    // 工廠方法：創建驗證錯誤
    static badRequest(message, code = 'BAD_REQUEST') {
        return new ApiError(message, 400, code);
    }
    // 工廠方法：創建未授權錯誤
    static unauthorized(message) {
        return new ApiError(message, 401, 'UNAUTHORIZED');
    }
    // 工廠方法：創建禁止訪問錯誤
    static forbidden(message, code = 'FORBIDDEN') {
        return new ApiError(message, 403, code);
    }
    // 工廠方法：創建未找到錯誤
    static notFound(message, code = 'NOT_FOUND') {
        return new ApiError(message, 404, code);
    }
    // 工廠方法：創建衝突錯誤（狀態不一致）
    static conflict(message, code = 'CONFLICT') {
        return new ApiError(message, 409, code);
    }
    // 工廠方法：創建資源已刪除錯誤
    static gone(message, code = 'GONE') {
        return new ApiError(message, 410, code);
    }
    // 工廠方法：創建內部錯誤
    static internal(message, code = 'INTERNAL_SERVER_ERROR') {
        return new ApiError(message, 500, code);
    }
}
exports.ApiError = ApiError;
//# sourceMappingURL=ApiError.js.map