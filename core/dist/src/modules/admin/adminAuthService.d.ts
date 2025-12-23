/**
 * Admin 认证服务
 *
 * 功能：
 * 1. Admin 用户登录
 * 2. JWT 生成（含 role）
 * 3. 密码验证（bcrypt）
 * 4. 获取 Admin 信息
 *
 * 遵循文档：
 * - admin.doc/Admin后台最小需求功能文档.md
 * - Phase 4 需求确认（最终版）
 */
import type { AdminUserDto, AdminLoginResponseDto } from '../../types/dto';
/**
 * Admin JWT Payload
 */
interface AdminJwtPayload {
    adminId: string;
    username: string;
    role: 'super_admin' | 'admin';
    type: 'admin';
}
/**
 * Admin 登录
 *
 * @param username 用户名
 * @param password 明文密码
 * @returns JWT Token + Admin 信息
 */
export declare function loginAdmin(username: string, password: string): Promise<AdminLoginResponseDto>;
/**
 * 验证 Admin JWT Token
 *
 * @param token JWT Token
 * @returns Decoded payload
 */
export declare function verifyAdminToken(token: string): AdminJwtPayload;
/**
 * 根据 Admin ID 获取 Admin 信息
 *
 * @param adminId Admin ID
 * @returns Admin 信息
 */
export declare function getAdminById(adminId: string): Promise<AdminUserDto | null>;
/**
 * 创建 Admin 用户（仅供运维脚本使用）
 *
 * @param username 用户名
 * @param password 明文密码
 * @param email 邮箱（可选）
 * @param role 角色（默认 admin）
 * @returns Admin 信息
 */
export declare function createAdminUser(username: string, password: string, email?: string, role?: 'super_admin' | 'admin'): Promise<AdminUserDto>;
/**
 * 检查用户是否为 super_admin
 *
 * @param adminId Admin ID
 * @returns 是否为 super_admin
 */
export declare function isSuperAdmin(adminId: string): Promise<boolean>;
export {};
//# sourceMappingURL=adminAuthService.d.ts.map