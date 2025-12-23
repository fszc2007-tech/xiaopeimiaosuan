/**
 * 通用 API 錯誤類
 * 支持自定義 HTTP 狀態碼和錯誤代碼
 */
export declare class ApiError extends Error {
    status: number;
    code: string;
    retryAfter?: number;
    constructor(message: string, status?: number, code?: string, retryAfter?: number);
    static rateLimited(message: string, retryAfter?: number): ApiError;
    static badRequest(message: string, code?: string): ApiError;
    static unauthorized(message: string): ApiError;
    static forbidden(message: string, code?: string): ApiError;
    static notFound(message: string, code?: string): ApiError;
    static conflict(message: string, code?: string): ApiError;
    static gone(message: string, code?: string): ApiError;
    static internal(message: string, code?: string): ApiError;
}
//# sourceMappingURL=ApiError.d.ts.map