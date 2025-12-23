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

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { getPool } from '../../database/connection';
import { FieldMapper } from '../../utils/fieldMapper';
import type { AdminUserRow } from '../../types/database';
import type { AdminUserDto, AdminLoginResponseDto } from '../../types/dto';

const ADMIN_JWT_SECRET = process.env.XIAOPEI_ADMIN_JWT_SECRET || process.env.XIAOPEI_JWT_SECRET || 'your-secret-key-change-me';
const ADMIN_JWT_EXPIRES_IN = '7d'; // Admin Token 有效期 7 天

/**
 * Admin JWT Payload
 */
interface AdminJwtPayload {
  adminId: string;
  username: string;
  role: 'super_admin' | 'admin';
  type: 'admin'; // 区分 Admin Token 和 C 端用户 Token
}

/**
 * Admin 登录
 * 
 * @param username 用户名
 * @param password 明文密码
 * @returns JWT Token + Admin 信息
 */
export async function loginAdmin(
  username: string,
  password: string
): Promise<AdminLoginResponseDto> {
  // 1. 查询 Admin 用户
  const [rows] = await getPool().query<AdminUserRow[]>(
    'SELECT * FROM admin_users WHERE username = ? AND is_active = TRUE',
    [username]
  );

  if (rows.length === 0) {
    throw new Error('ADMIN_USER_NOT_FOUND');
  }

  const adminRow = rows[0];

  // 2. 验证密码
  const isPasswordValid = await bcrypt.compare(password, adminRow.password_hash);
  if (!isPasswordValid) {
    throw new Error('ADMIN_INVALID_PASSWORD');
  }

  // 3. 更新最后登录时间
  await getPool().query(
    'UPDATE admin_users SET last_login_at = NOW() WHERE admin_id = ?',
    [adminRow.admin_id]
  );

  // 4. 生成 JWT Token
  const payload: AdminJwtPayload = {
    adminId: adminRow.admin_id,
    username: adminRow.username,
    role: adminRow.role,
    type: 'admin',
  };

  const token = jwt.sign(payload, ADMIN_JWT_SECRET, {
    expiresIn: ADMIN_JWT_EXPIRES_IN,
  });

  // 5. 返回
  const admin = FieldMapper.mapAdminUser({
    ...adminRow,
    last_login_at: new Date(), // 使用最新的登录时间
  });

  return {
    token,
    admin,
  };
}

/**
 * 验证 Admin JWT Token
 * 
 * @param token JWT Token
 * @returns Decoded payload
 */
export function verifyAdminToken(token: string): AdminJwtPayload {
  try {
    const decoded = jwt.verify(token, ADMIN_JWT_SECRET) as AdminJwtPayload;
    
    // 确保是 Admin Token
    if (decoded.type !== 'admin') {
      throw new Error('INVALID_ADMIN_TOKEN');
    }
    
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('ADMIN_TOKEN_EXPIRED');
    }
    throw new Error('INVALID_ADMIN_TOKEN');
  }
}

/**
 * 根据 Admin ID 获取 Admin 信息
 * 
 * @param adminId Admin ID
 * @returns Admin 信息
 */
export async function getAdminById(adminId: string): Promise<AdminUserDto | null> {
  const [rows] = await getPool().query<AdminUserRow[]>(
    'SELECT * FROM admin_users WHERE admin_id = ? AND is_active = TRUE',
    [adminId]
  );

  if (rows.length === 0) {
    return null;
  }

  return FieldMapper.mapAdminUser(rows[0]);
}

/**
 * 创建 Admin 用户（仅供运维脚本使用）
 * 
 * @param username 用户名
 * @param password 明文密码
 * @param email 邮箱（可选）
 * @param role 角色（默认 admin）
 * @returns Admin 信息
 */
export async function createAdminUser(
  username: string,
  password: string,
  email?: string,
  role: 'super_admin' | 'admin' = 'admin'
): Promise<AdminUserDto> {
  // 1. 检查用户名是否已存在
  const [existingRows] = await getPool().query<AdminUserRow[]>(
    'SELECT * FROM admin_users WHERE username = ?',
    [username]
  );

  if (existingRows.length > 0) {
    throw new Error('ADMIN_USERNAME_EXISTS');
  }

  // 2. 哈希密码
  const passwordHash = await bcrypt.hash(password, 10);

  // 3. 插入数据库
  const adminId = uuidv4();
  await getPool().query(
    `INSERT INTO admin_users (admin_id, username, password_hash, email, role, is_active, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, TRUE, NOW(), NOW())`,
    [adminId, username, passwordHash, email || null, role]
  );

  // 4. 查询并返回
  const [rows] = await getPool().query<AdminUserRow[]>(
    'SELECT * FROM admin_users WHERE admin_id = ?',
    [adminId]
  );

  return FieldMapper.mapAdminUser(rows[0]);
}

/**
 * 检查用户是否为 super_admin
 * 
 * @param adminId Admin ID
 * @returns 是否为 super_admin
 */
export async function isSuperAdmin(adminId: string): Promise<boolean> {
  const [rows] = await getPool().query<AdminUserRow[]>(
    'SELECT role FROM admin_users WHERE admin_id = ? AND is_active = TRUE',
    [adminId]
  );

  if (rows.length === 0) {
    return false;
  }

  return rows[0].role === 'super_admin';
}

