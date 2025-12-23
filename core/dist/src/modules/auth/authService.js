"use strict";
/**
 * 认证服务
 *
 * 重要：所有对外响应必须使用 FieldMapper，禁止手搓字段映射
 *
 * 参考文档：
 * - app.doc/features/注册登录设计文档.md
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = verifyToken;
exports.requestOTP = requestOTP;
exports.loginOrRegister = loginOrRegister;
exports.getUserByToken = getUserByToken;
exports.registerUsername = registerUsername;
exports.loginUsername = loginUsername;
const uuid_1 = require("uuid");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const connection_1 = require("../../database/connection");
const fieldMapper_1 = require("../../utils/fieldMapper");
const auth_1 = require("../../config/auth");
const sms_1 = require("../../config/sms");
const phoneNormalizer_1 = require("./phoneNormalizer");
const rateLimitService_1 = require("./rateLimitService");
const smsService_1 = require("./smsService");
const JWT_SECRET = process.env.XIAOPEI_JWT_SECRET || 'your-secret-key-change-me';
const JWT_EXPIRES_IN = `${auth_1.jwtConfig.expiresInDays}d`;
/**
 * 生成验证码
 * 使用配置化的长度和字符集
 */
function generateCode() {
    const { length, charset } = auth_1.otpConfig;
    let code = '';
    for (let i = 0; i < length; i++) {
        code += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return code;
}
/**
 * 生成 JWT Token
 */
function generateToken(userId) {
    return jsonwebtoken_1.default.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}
/**
 * 验证 JWT Token
 */
function verifyToken(token) {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        return decoded;
    }
    catch (error) {
        throw new Error('Invalid token');
    }
}
/**
 * 请求验证码
 *
 * 真实短信发送流程：
 * 1. 规范化手机号（E.164 格式）
 * 2. 限流检查（手机号 + IP）
 * 3. 生成验证码并存储（MySQL + Redis Hash）
 * 4. 调用腾讯云短信服务发送
 */
async function requestOTP(params) {
    const { phone, email, region, countryCode: inputCountryCode, clientIp } = params;
    // 验证输入：手机号或邮箱至少提供一个
    if (!phone && !email) {
        throw new Error('请提供手机号或邮箱');
    }
    // ✅ 只支持手机号登录（根据文档要求）
    if (!phone) {
        throw new Error('当前仅支持手机号登录');
    }
    // 设置最终的 countryCode（使用新变量避免 const 赋值错误）
    const countryCode = inputCountryCode || (region === 'cn' ? '+86' : '+852');
    // 1. 规范化手机号
    const normalizedResult = (0, phoneNormalizer_1.normalizePhone)(phone, countryCode);
    if (!normalizedResult.success || !normalizedResult.e164Phone) {
        const errorRegion = (0, sms_1.getRegionFromCountryCode)(countryCode);
        throw new Error((0, sms_1.getErrorMessage)(normalizedResult.errorCode || 'INVALID_PHONE', errorRegion));
    }
    const normalizedPhone = normalizedResult.e164Phone;
    const detectedRegion = normalizedResult.detectedRegion || region;
    // 2. 验证短信服务配置
    const configValidation = (0, smsService_1.validateSmsConfig)();
    if (!configValidation.valid) {
        console.error('[Auth] SMS config validation failed:', configValidation.missingFields);
        throw new Error(`短信服务配置不完整，缺少：${configValidation.missingFields.join(', ')}`);
    }
    // 3. 限流检查（手机号）
    const phoneRateLimit = await (0, rateLimitService_1.checkPhoneRateLimit)(normalizedPhone, 'login');
    if (!phoneRateLimit.allowed) {
        const errorRegion = (0, sms_1.getRegionFromCountryCode)(countryCode);
        throw new Error((0, sms_1.getErrorMessage)(phoneRateLimit.errorCode || 'RATE_LIMITED_1M', errorRegion));
    }
    // 4. 限流检查（IP）
    if (clientIp) {
        const ipRateLimit = await (0, rateLimitService_1.checkIpRateLimit)(clientIp);
        if (!ipRateLimit.allowed) {
            const errorRegion = (0, sms_1.getRegionFromCountryCode)(countryCode);
            throw new Error((0, sms_1.getErrorMessage)(ipRateLimit.errorCode || 'RATE_LIMITED_IP', errorRegion));
        }
    }
    // 5. 生成验证码
    const code = generateCode();
    const codeId = (0, uuid_1.v4)();
    const pool = (0, connection_1.getPool)();
    const { ttlMinutes } = auth_1.otpConfig;
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);
    // 6. 保存验证码到数据库（MySQL）
    await pool.execute(`INSERT INTO verification_codes (code_id, phone, email, code, code_type, expires_at, is_used) 
     VALUES (?, ?, ?, ?, 'login', ?, FALSE)`, [codeId, normalizedPhone, null, code, expiresAt]);
    // 7. 调用腾讯云短信服务发送验证码
    const smsResult = await (0, smsService_1.sendVerificationCode)(normalizedPhone, code);
    if (!smsResult.success) {
        console.error(`[Auth] SMS send failed: ${smsResult.errorCode} - ${smsResult.errorMessage}`);
        // 短信发送失败，但验证码已保存，可以选择：
        // 1. 删除已保存的验证码（推荐）
        // 2. 保留验证码但标记为未发送（可选）
        // 删除已保存的验证码
        await pool.execute(`DELETE FROM verification_codes WHERE code_id = ?`, [codeId]);
        const errorRegion = (0, sms_1.getRegionFromCountryCode)(countryCode);
        // 检查是否是每日限制错误，返回更友好的提示
        if (smsResult.errorCode === 'LimitExceeded.PhoneNumberDailyLimit') {
            throw new Error((0, sms_1.getErrorMessage)('SMS_DAILY_LIMIT_EXCEEDED', errorRegion));
        }
        throw new Error((0, sms_1.getErrorMessage)('SMS_SEND_FAILED', errorRegion));
    }
    console.log(`[Auth] ✅ Verification code sent successfully to ${normalizedPhone.replace(/\d(?=\d{4})/g, '*')}`);
    const errorRegion = (0, sms_1.getRegionFromCountryCode)(countryCode);
    return {
        message: (0, sms_1.getErrorMessage)('OTP_SENT', errorRegion),
    };
}
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
async function loginOrRegister(params) {
    const { phone, email, code, channel, countryCode: inputCountryCode } = params;
    // ✅ 只支持手机号登录
    if (!phone) {
        throw new Error('当前仅支持手机号登录');
    }
    // 设置最终的 countryCode（使用新变量避免 const 赋值错误）
    const countryCode = inputCountryCode || (channel === 'cn' ? '+86' : '+852');
    // 1. 规范化手机号
    const normalizedResult = (0, phoneNormalizer_1.normalizePhone)(phone, countryCode);
    if (!normalizedResult.success || !normalizedResult.e164Phone) {
        const errorRegion = (0, sms_1.getRegionFromCountryCode)(countryCode);
        throw new Error((0, sms_1.getErrorMessage)(normalizedResult.errorCode || 'INVALID_PHONE', errorRegion));
    }
    const normalizedPhone = normalizedResult.e164Phone;
    const pool = (0, connection_1.getPool)();
    // 2. 验证验证码（从数据库查询）
    const [codeRows] = await pool.execute(`SELECT * FROM verification_codes 
     WHERE phone = ? 
       AND code = ? 
       AND code_type = 'login'
       AND is_used = FALSE
       AND expires_at > NOW()
     ORDER BY created_at DESC
     LIMIT 1`, [normalizedPhone, code]);
    if (codeRows.length === 0) {
        // 检查是否过期
        const [expiredCodes] = await pool.execute(`SELECT * FROM verification_codes 
       WHERE phone = ? 
         AND code = ? 
         AND code_type = 'login'
       ORDER BY created_at DESC
       LIMIT 1`, [normalizedPhone, code]);
        const errorRegion = (0, sms_1.getRegionFromCountryCode)(countryCode);
        if (expiredCodes.length > 0) {
            if (expiredCodes[0].is_used) {
                throw new Error((0, sms_1.getErrorMessage)('CODE_MISMATCH', errorRegion));
            }
            else if (new Date(expiredCodes[0].expires_at) <= new Date()) {
                throw new Error((0, sms_1.getErrorMessage)('CODE_EXPIRED', errorRegion));
            }
        }
        throw new Error((0, sms_1.getErrorMessage)('CODE_MISMATCH', errorRegion));
    }
    const codeRow = codeRows[0];
    // 3. 标记验证码为已使用
    await pool.execute(`UPDATE verification_codes SET is_used = TRUE WHERE code_id = ?`, [codeRow.code_id]);
    console.log(`[Auth] ✅ Verification code verified for ${normalizedPhone.replace(/\d(?=\d{4})/g, '*')}`);
    // 4. 查找或创建用户
    const [userRows] = await pool.execute(`SELECT * FROM users WHERE phone = ?`, [normalizedPhone]);
    let userRow;
    let isFirstLogin = false;
    if (userRows.length > 0) {
        // 用户已存在：登录
        userRow = userRows[0];
    }
    else {
        // 用户不存在：注册
        isFirstLogin = true;
        const userId = (0, uuid_1.v4)();
        const nickname = `用户${normalizedPhone.slice(-4)}`;
        await pool.execute(`INSERT INTO users (user_id, nickname, phone, email, app_region, is_pro) 
       VALUES (?, ?, ?, ?, ?, FALSE)`, [userId, nickname, normalizedPhone, null, channel.toUpperCase()]);
        // 重新查询用户信息
        const [newUserRows] = await pool.execute(`SELECT * FROM users WHERE user_id = ?`, [userId]);
        userRow = newUserRows[0];
        // 创建用户设置
        await pool.execute(`INSERT INTO user_settings (setting_id, user_id, language) 
       VALUES (?, ?, ?)`, [(0, uuid_1.v4)(), userId, channel === 'cn' ? 'zh-CN' : 'zh-HK']);
    }
    // 5. 生成 JWT Token
    const token = generateToken(userRow.user_id);
    // ✅ 使用 FieldMapper 转换为 DTO
    const userDto = fieldMapper_1.FieldMapper.mapUser(userRow);
    return {
        token,
        user: userDto,
    };
}
/**
 * 通过 Token 获取用户信息
 */
async function getUserByToken(token) {
    const { userId } = verifyToken(token);
    const pool = (0, connection_1.getPool)();
    const [rows] = await pool.execute(`SELECT * FROM users WHERE user_id = ?`, [userId]);
    if (rows.length === 0) {
        throw new Error('User not found');
    }
    // ✅ 使用 FieldMapper 转换为 DTO
    return fieldMapper_1.FieldMapper.mapUser(rows[0]);
}
// ==========================================
// H5 用戶名登錄接口（新增）
// ==========================================
/**
 * 用戶名註冊（H5 專用）
 */
async function registerUsername(params) {
    const { username, password } = params;
    // 1. 校驗用戶名（放寬限制）
    if (!username || username.length < 2 || username.length > 50) {
        throw new Error('用戶名長度需 2-50 字符');
    }
    // 移除用戶名格式限制，允許任何字符（包括中文、特殊符號等）
    // 2. 校驗密碼（放寬限制）
    if (!password || password.length < 6) {
        throw new Error('密碼至少 6 位');
    }
    const pool = (0, connection_1.getPool)();
    // 3. 檢查用戶名是否已存在
    const [existingUsers] = await pool.execute(`SELECT * FROM users WHERE username = ?`, [username]);
    if (existingUsers.length > 0) {
        throw new Error('用戶名已被占用');
    }
    // 4. 創建用戶
    const userId = (0, uuid_1.v4)();
    const passwordHash = await bcryptjs_1.default.hash(password, 10);
    const nickname = `用戶${username}`;
    const inviteCode = (0, uuid_1.v4)().slice(0, 8).toUpperCase();
    await pool.execute(`INSERT INTO users 
      (user_id, username, password_hash, password_set, nickname, app_region, is_pro, invite_code) 
     VALUES (?, ?, ?, TRUE, ?, 'CN', FALSE, ?)`, [userId, username, passwordHash, nickname, inviteCode]);
    // 5. 創建用戶設置
    await pool.execute(`INSERT INTO user_settings (setting_id, user_id, language) 
     VALUES (?, ?, 'zh-CN')`, [(0, uuid_1.v4)(), userId]);
    // 6. 重新查詢用戶信息
    const [newUserRows] = await pool.execute(`SELECT * FROM users WHERE user_id = ?`, [userId]);
    const userRow = newUserRows[0];
    // 7. 生成 JWT Token（與現有登錄邏輯完全一致）
    const token = generateToken(userId);
    // 8. 使用 FieldMapper 轉換為 DTO
    const userDto = fieldMapper_1.FieldMapper.mapUser(userRow);
    return {
        token,
        user: userDto,
    };
}
/**
 * 用戶名登錄（H5 專用）
 */
async function loginUsername(params) {
    const { username, password } = params;
    const pool = (0, connection_1.getPool)();
    // 1. 查找用戶（只按 username 查）
    const [userRows] = await pool.execute(`SELECT * FROM users WHERE username = ?`, [username]);
    if (userRows.length === 0) {
        throw new Error('用戶名或密碼錯誤'); // 統一錯誤信息
    }
    const userRow = userRows[0];
    // 2. 校驗密碼
    if (!userRow.password_hash) {
        throw new Error('用戶名或密碼錯誤');
    }
    const valid = await bcryptjs_1.default.compare(password, userRow.password_hash);
    if (!valid) {
        throw new Error('用戶名或密碼錯誤');
    }
    // 3. 生成 JWT Token（與現有登錄邏輯完全一致）
    const token = generateToken(userRow.user_id);
    // 4. 更新最後登錄時間
    await pool.execute(`UPDATE users SET last_login_at = NOW() WHERE user_id = ?`, [userRow.user_id]);
    // 5. 使用 FieldMapper 轉換為 DTO
    const userDto = fieldMapper_1.FieldMapper.mapUser(userRow);
    return {
        token,
        user: userDto,
    };
}
//# sourceMappingURL=authService.js.map