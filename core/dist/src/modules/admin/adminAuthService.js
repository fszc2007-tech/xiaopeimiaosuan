"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginAdmin = loginAdmin;
exports.verifyAdminToken = verifyAdminToken;
exports.getAdminById = getAdminById;
exports.createAdminUser = createAdminUser;
exports.isSuperAdmin = isSuperAdmin;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const connection_1 = require("../../database/connection");
const fieldMapper_1 = require("../../utils/fieldMapper");
const ADMIN_JWT_SECRET = process.env.XIAOPEI_ADMIN_JWT_SECRET || process.env.XIAOPEI_JWT_SECRET || 'your-secret-key-change-me';
const ADMIN_JWT_EXPIRES_IN = '7d'; // Admin Token 有效期 7 天
/**
 * Admin 登录
 *
 * @param username 用户名
 * @param password 明文密码
 * @returns JWT Token + Admin 信息
 */
async function loginAdmin(username, password) {
    // 1. 查询 Admin 用户
    const [rows] = await (0, connection_1.getPool)().query('SELECT * FROM admin_users WHERE username = ? AND is_active = TRUE', [username]);
    if (rows.length === 0) {
        throw new Error('ADMIN_USER_NOT_FOUND');
    }
    const adminRow = rows[0];
    // 2. 验证密码
    const isPasswordValid = await bcrypt_1.default.compare(password, adminRow.password_hash);
    if (!isPasswordValid) {
        throw new Error('ADMIN_INVALID_PASSWORD');
    }
    // 3. 更新最后登录时间
    await (0, connection_1.getPool)().query('UPDATE admin_users SET last_login_at = NOW() WHERE admin_id = ?', [adminRow.admin_id]);
    // 4. 生成 JWT Token
    const payload = {
        adminId: adminRow.admin_id,
        username: adminRow.username,
        role: adminRow.role,
        type: 'admin',
    };
    const token = jsonwebtoken_1.default.sign(payload, ADMIN_JWT_SECRET, {
        expiresIn: ADMIN_JWT_EXPIRES_IN,
    });
    // 5. 返回
    const admin = fieldMapper_1.FieldMapper.mapAdminUser({
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
function verifyAdminToken(token) {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, ADMIN_JWT_SECRET);
        // 确保是 Admin Token
        if (decoded.type !== 'admin') {
            throw new Error('INVALID_ADMIN_TOKEN');
        }
        return decoded;
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
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
async function getAdminById(adminId) {
    const [rows] = await (0, connection_1.getPool)().query('SELECT * FROM admin_users WHERE admin_id = ? AND is_active = TRUE', [adminId]);
    if (rows.length === 0) {
        return null;
    }
    return fieldMapper_1.FieldMapper.mapAdminUser(rows[0]);
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
async function createAdminUser(username, password, email, role = 'admin') {
    // 1. 检查用户名是否已存在
    const [existingRows] = await (0, connection_1.getPool)().query('SELECT * FROM admin_users WHERE username = ?', [username]);
    if (existingRows.length > 0) {
        throw new Error('ADMIN_USERNAME_EXISTS');
    }
    // 2. 哈希密码
    const passwordHash = await bcrypt_1.default.hash(password, 10);
    // 3. 插入数据库
    const adminId = (0, uuid_1.v4)();
    await (0, connection_1.getPool)().query(`INSERT INTO admin_users (admin_id, username, password_hash, email, role, is_active, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, TRUE, NOW(), NOW())`, [adminId, username, passwordHash, email || null, role]);
    // 4. 查询并返回
    const [rows] = await (0, connection_1.getPool)().query('SELECT * FROM admin_users WHERE admin_id = ?', [adminId]);
    return fieldMapper_1.FieldMapper.mapAdminUser(rows[0]);
}
/**
 * 检查用户是否为 super_admin
 *
 * @param adminId Admin ID
 * @returns 是否为 super_admin
 */
async function isSuperAdmin(adminId) {
    const [rows] = await (0, connection_1.getPool)().query('SELECT role FROM admin_users WHERE admin_id = ? AND is_active = TRUE', [adminId]);
    if (rows.length === 0) {
        return false;
    }
    return rows[0].role === 'super_admin';
}
//# sourceMappingURL=adminAuthService.js.map