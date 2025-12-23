/**
 * Admin 用户管理服务
 *
 * 功能：
 * 1. 获取 C 端用户列表（分页、搜索）
 * 2. 获取用户详情（含统计信息）
 * 3. 注册测试用户
 * 4. Cursor 测试账号管理
 *
 * 遵循文档：
 * - admin.doc/Admin后台最小需求功能文档.md
 * - Phase 4 需求确认（最终版）
 */
import type { AdminUserListDto, AdminUserDetailDto, AdminCreateUserRequestDto, UserDto, CursorTestAccountDto } from '../../types/dto';
/**
 * 获取 C 端用户列表（分页）
 *
 * @param page 页码（从 1 开始）
 * @param pageSize 每页数量
 * @param keyword 搜索关键词（手机号/昵称/邮箱）
 * @returns 用户列表
 */
export declare function getUserList(page?: number, pageSize?: number, keyword?: string): Promise<AdminUserListDto>;
/**
 * 获取用户详情（含统计信息）
 *
 * @param userId 用户 ID
 * @returns 用户详情
 */
export declare function getUserDetail(userId: string): Promise<AdminUserDetailDto>;
/**
 * 注册测试用户（Admin 功能）
 *
 * @param data 用户数据
 * @returns 新用户信息
 */
export declare function createTestUser(data: AdminCreateUserRequestDto): Promise<UserDto>;
/**
 * 获取或创建 Cursor 测试账号
 *
 * @param isProduction 是否为生产环境
 * @returns Cursor 测试账号信息
 */
export declare function getOrCreateCursorTestAccount(isProduction?: boolean): Promise<CursorTestAccountDto>;
/**
 * 重置 Cursor 测试账号密码（仅 super_admin）
 *
 * @param isProduction 是否为生产环境
 * @returns 新密码（一次性返回）
 */
export declare function resetCursorTestAccountPassword(isProduction?: boolean): Promise<{
    password: string;
}>;
//# sourceMappingURL=adminUserService.d.ts.map