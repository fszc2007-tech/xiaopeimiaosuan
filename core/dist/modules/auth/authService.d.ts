/**
 * 认证服务
 *
 * 重要：所有对外响应必须使用 FieldMapper，禁止手搓字段映射
 *
 * 参考文档：
 * - app.doc/features/注册登录设计文档.md
 */
import type { UserDto, LoginResponseDto, RequestOtpResponseDto } from '../../types/dto';
/**
 * 验证 JWT Token
 */
export declare function verifyToken(token: string): {
    userId: string;
};
/**
 * 请求验证码
 *
 * 真实短信发送流程：
 * 1. 规范化手机号（E.164 格式）
 * 2. 限流检查（手机号 + IP）
 * 3. 生成验证码并存储（MySQL + Redis Hash）
 * 4. 调用腾讯云短信服务发送
 */
export declare function requestOTP(params: {
    phone?: string;
    email?: string;
    region: 'cn' | 'hk';
    countryCode?: string;
    clientIp?: string;
}): Promise<RequestOtpResponseDto>;
/**
 * 登录或注册
 *
 * 真实验证码验证流程：
 * 1. 规范化手机号
 * 2. 从数据库查询验证码
 * 3. 验证验证码有效性（未使用、未过期、匹配）
 * 4. 标记验证码为已使用
 * 5. 查找或创建用户
 */
export declare function loginOrRegister(params: {
    phone?: string;
    email?: string;
    code: string;
    channel: 'cn' | 'hk';
    countryCode?: string;
}): Promise<LoginResponseDto>;
/**
 * 通过 Token 获取用户信息
 */
export declare function getUserByToken(token: string): Promise<UserDto>;
/**
 * 用戶名註冊（H5 專用）
 */
export declare function registerUsername(params: {
    username: string;
    password: string;
}): Promise<LoginResponseDto>;
/**
 * 用戶名登錄（H5 專用）
 */
export declare function loginUsername(params: {
    username: string;
    password: string;
}): Promise<LoginResponseDto>;
//# sourceMappingURL=authService.d.ts.map