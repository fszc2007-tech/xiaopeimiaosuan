"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserList = getUserList;
exports.getUserDetail = getUserDetail;
exports.createTestUser = createTestUser;
exports.getOrCreateCursorTestAccount = getOrCreateCursorTestAccount;
exports.resetCursorTestAccountPassword = resetCursorTestAccountPassword;
const uuid_1 = require("uuid");
const bcrypt_1 = __importDefault(require("bcrypt"));
const connection_1 = require("../../database/connection");
const fieldMapper_1 = require("../../utils/fieldMapper");
const crypto_1 = __importDefault(require("crypto"));
// 生成邀请码
function generateInviteCode() {
    return crypto_1.default.randomBytes(4).toString('hex').toUpperCase();
}
const encryption_1 = require("../../utils/encryption");
/**
 * Cursor 测试账号配置
 * 注意：users 表已删除 email 字段（migration 008），改用 phone 作为唯一标识
 */
const CURSOR_TEST_ACCOUNT = {
    phone: '+8613800000000', // 使用固定手机号作为测试账号标识
    nickname: 'Cursor 测试账号',
    fixedPasswordDev: 'Cursor@2024', // 开发环境固定密码
};
/**
 * 获取 C 端用户列表（分页）
 *
 * @param page 页码（从 1 开始）
 * @param pageSize 每页数量
 * @param keyword 搜索关键词（手机号/昵称/邮箱）
 * @returns 用户列表
 */
async function getUserList(page = 1, pageSize = 20, keyword) {
    // ✅ 修复 MySQL 8 + mysql2 兼容性问题：将 LIMIT/OFFSET 参数转为字符串
    const safePageSize = Math.max(1, Math.min(Number(pageSize) || 20, 100));
    const offset = Math.max(0, (page - 1) * safePageSize);
    // 构建查询条件
    let whereClause = '1=1';
    const params = [];
    if (keyword) {
        // 注意：users 表已删除 email 字段（migration 008），只搜索 phone 和 nickname
        whereClause += ' AND (phone LIKE ? OR nickname LIKE ?)';
        const keywordPattern = `%${keyword}%`;
        params.push(keywordPattern, keywordPattern);
    }
    // 查询总数
    const [countRows] = await (0, connection_1.getPool)().query(`SELECT COUNT(*) as total FROM users WHERE ${whereClause}`, params);
    const total = countRows[0].total;
    // 查询列表
    // ✅ 修复 MySQL 8 + mysql2 兼容性问题：直接拼接 LIMIT/OFFSET（已校验数字安全）
    // 注意：LIMIT/OFFSET 直接拼接到 SQL 中，不使用占位符（避免 MySQL 8 兼容性问题）
    const [rows] = await (0, connection_1.getPool)().query(`SELECT * FROM users WHERE ${whereClause} ORDER BY created_at DESC LIMIT ${safePageSize} OFFSET ${offset}`, params);
    const items = rows.map((row) => fieldMapper_1.FieldMapper.mapUser(row));
    return {
        items,
        total,
        page,
        pageSize,
    };
}
/**
 * 获取用户详情（含统计信息）
 *
 * @param userId 用户 ID
 * @returns 用户详情
 */
async function getUserDetail(userId) {
    // 1. 查询用户基本信息
    const [userRows] = await (0, connection_1.getPool)().query('SELECT * FROM users WHERE user_id = ?', [userId]);
    if (userRows.length === 0) {
        throw new Error('USER_NOT_FOUND');
    }
    const user = fieldMapper_1.FieldMapper.mapUser(userRows[0]);
    // 2. 查询命盘列表
    const [chartRows] = await (0, connection_1.getPool)().query('SELECT * FROM chart_profiles WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    const charts = chartRows.map((row) => fieldMapper_1.FieldMapper.mapChartProfile(row));
    // 3. 统计信息
    const [chartCountRows] = await (0, connection_1.getPool)().query('SELECT COUNT(*) as count FROM chart_profiles WHERE user_id = ?', [userId]);
    const [conversationCountRows] = await (0, connection_1.getPool)().query('SELECT COUNT(*) as count FROM conversations WHERE user_id = ?', [userId]);
    const [lastActiveRows] = await (0, connection_1.getPool)().query('SELECT created_at FROM conversations WHERE user_id = ? ORDER BY created_at DESC LIMIT 1', [userId]);
    const stats = {
        chartCount: chartCountRows[0].count,
        conversationCount: conversationCountRows[0].count,
        lastActiveAt: lastActiveRows.length > 0 ? lastActiveRows[0].created_at.toISOString() : undefined,
    };
    return {
        user,
        charts,
        stats,
    };
}
/**
 * 注册测试用户（Admin 功能）
 *
 * @param data 用户数据
 * @returns 新用户信息
 */
async function createTestUser(data) {
    // 1. 检查手机号/邮箱是否已存在
    if (data.phone) {
        const [existingRows] = await (0, connection_1.getPool)().query('SELECT * FROM users WHERE phone = ?', [data.phone]);
        if (existingRows.length > 0) {
            throw new Error('PHONE_EXISTS');
        }
    }
    // 注意：users 表已删除 email 字段（migration 008），不再检查 email 重复
    // 如果 data.email 存在，可以记录到日志但不影响创建流程
    if (data.email) {
        console.warn('[AdminUserService] email field is deprecated, ignoring:', data.email);
    }
    // 2. 哈希密码
    const passwordHash = await bcrypt_1.default.hash(data.password, 10);
    // 3. 生成 user_id
    const userId = (0, uuid_1.v4)();
    // 4. 插入数据库
    // 注意：users 表已删除 email 字段（migration 008），只保留 phone
    await (0, connection_1.getPool)().query(`INSERT INTO users (
      user_id, phone, password_hash, app_region, nickname,
      is_pro, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`, [
        userId,
        data.phone || null,
        passwordHash,
        data.appRegion,
        data.nickname || '新用户',
        data.isPro || false,
    ]);
    // 5. 查询并返回
    const [rows] = await (0, connection_1.getPool)().query('SELECT * FROM users WHERE user_id = ?', [userId]);
    return fieldMapper_1.FieldMapper.mapUser(rows[0]);
}
/**
 * 获取或创建 Cursor 测试账号
 *
 * @param isProduction 是否为生产环境
 * @returns Cursor 测试账号信息
 */
async function getOrCreateCursorTestAccount(isProduction = false) {
    // 1. 查询是否已存在（使用 phone 作为唯一标识）
    const [existingRows] = await (0, connection_1.getPool)().query('SELECT * FROM users WHERE phone = ?', [CURSOR_TEST_ACCOUNT.phone]);
    if (existingRows.length > 0) {
        // 已存在，返回账号信息（不返回密码）
        const user = fieldMapper_1.FieldMapper.mapUser(existingRows[0]);
        return {
            userId: user.userId,
            // 注意：users 表已删除 email 字段（migration 008），返回 phone 代替
            phone: user.phone,
            nickname: user.nickname,
            isPro: user.isPro,
            createdAt: user.createdAt,
            exists: true,
        };
    }
    // 2. 不存在，创建新账号
    const userId = (0, uuid_1.v4)();
    const inviteCode = generateInviteCode();
    // 生成密码
    const password = isProduction
        ? (0, encryption_1.generateRandomPassword)(16) // 生产环境：随机密码
        : CURSOR_TEST_ACCOUNT.fixedPasswordDev; // 开发环境：固定密码
    const passwordHash = await bcrypt_1.default.hash(password, 10);
    // 3. 插入数据库
    // 注意：users 表已删除 email 字段（migration 008），使用 phone 作为唯一标识
    await (0, connection_1.getPool)().query(`INSERT INTO users (
      user_id, phone, password_hash, app_region, nickname, invite_code, 
      is_pro, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, TRUE, NOW(), NOW())`, [
        userId,
        CURSOR_TEST_ACCOUNT.phone,
        passwordHash,
        'CN', // 默认 CN
        CURSOR_TEST_ACCOUNT.nickname,
        inviteCode,
    ]);
    // 4. 查询并返回（首次创建返回密码）
    const [rows] = await (0, connection_1.getPool)().query('SELECT * FROM users WHERE user_id = ?', [userId]);
    const user = fieldMapper_1.FieldMapper.mapUser(rows[0]);
    return {
        userId: user.userId,
        // 注意：users 表已删除 email 字段（migration 008），返回 phone 代替
        phone: user.phone,
        password, // ⚠️ 仅首次创建时返回
        nickname: user.nickname,
        isPro: user.isPro,
        createdAt: user.createdAt,
        exists: false,
    };
}
/**
 * 重置 Cursor 测试账号密码（仅 super_admin）
 *
 * @param isProduction 是否为生产环境
 * @returns 新密码（一次性返回）
 */
async function resetCursorTestAccountPassword(isProduction = false) {
    // 1. 查询账号是否存在（使用 phone 作为唯一标识）
    const [existingRows] = await (0, connection_1.getPool)().query('SELECT * FROM users WHERE phone = ?', [CURSOR_TEST_ACCOUNT.phone]);
    if (existingRows.length === 0) {
        throw new Error('CURSOR_TEST_ACCOUNT_NOT_FOUND');
    }
    const userId = existingRows[0].user_id;
    // 2. 生成新密码
    const newPassword = isProduction
        ? (0, encryption_1.generateRandomPassword)(16)
        : CURSOR_TEST_ACCOUNT.fixedPasswordDev;
    const passwordHash = await bcrypt_1.default.hash(newPassword, 10);
    // 3. 更新数据库
    await (0, connection_1.getPool)().query('UPDATE users SET password_hash = ?, updated_at = NOW() WHERE user_id = ?', [passwordHash, userId]);
    return { password: newPassword };
}
//# sourceMappingURL=adminUserService.js.map