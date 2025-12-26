/**
 * 认证服务
 * 
 * 重要：所有对外响应必须使用 FieldMapper，禁止手搓字段映射
 * 
 * 参考文档：
 * - app.doc/features/注册登录设计文档.md
 */

import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { getPool } from '../../database/connection';
import { FieldMapper } from '../../utils/fieldMapper';
import { otpConfig, jwtConfig } from '../../config/auth';
import { smsConfig, getRegionFromCountryCode, getErrorMessage } from '../../config/sms';
import { normalizePhone } from './phoneNormalizer';
import { checkPhoneRateLimit, checkIpRateLimit } from './rateLimitService';
import { sendVerificationCode, validateSmsConfig } from './smsService';
import type { UserRow } from '../../types/database';
import type { UserDto, LoginResponseDto, RequestOtpResponseDto } from '../../types/dto';

const JWT_SECRET = process.env.XIAOPEI_JWT_SECRET || 'your-secret-key-change-me';
const JWT_EXPIRES_IN = `${jwtConfig.expiresInDays}d`;

/**
 * 生成验证码
 * 使用配置化的长度和字符集
 */
function generateCode(): string {
  const { length, charset } = otpConfig;
  let code = '';
  for (let i = 0; i < length; i++) {
    code += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return code;
}

/**
 * 生成 JWT Token
 */
function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

/**
 * 验证 JWT Token
 */
export function verifyToken(token: string): { userId: string } {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded;
  } catch (error) {
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
export async function requestOTP(params: {
  phone?: string;
  email?: string;
  region: 'cn' | 'hk';
  countryCode?: string;  // 新增：国家代码（如 "+86", "+852"）
  clientIp?: string;     // 新增：客户端 IP（用于限流）
}): Promise<RequestOtpResponseDto> {
  // #region agent log
  console.log('[DEBUG] requestOTP called:', JSON.stringify({params, hypothesisId: 'D'}));
  // #endregion
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
  const normalizedResult = normalizePhone(phone, countryCode);
  if (!normalizedResult.success || !normalizedResult.e164Phone) {
    const errorRegion = getRegionFromCountryCode(countryCode);
    throw new Error(getErrorMessage(normalizedResult.errorCode || 'INVALID_PHONE', errorRegion));
  }
  
  const normalizedPhone = normalizedResult.e164Phone;
  const detectedRegion = normalizedResult.detectedRegion || region;
  
  // 2. 验证短信服务配置
  const configValidation = validateSmsConfig();
  if (!configValidation.valid) {
    console.error('[Auth] SMS config validation failed:', configValidation.missingFields);
    throw new Error(`短信服务配置不完整，缺少：${configValidation.missingFields.join(', ')}`);
  }
  
  // 3. 限流检查（手机号）
  const phoneRateLimit = await checkPhoneRateLimit(normalizedPhone, 'login');
  if (!phoneRateLimit.allowed) {
    const errorRegion = getRegionFromCountryCode(countryCode);
    throw new Error(getErrorMessage(phoneRateLimit.errorCode || 'RATE_LIMITED_1M', errorRegion));
  }
  
  // 4. 限流检查（IP）
  if (clientIp) {
    const ipRateLimit = await checkIpRateLimit(clientIp);
    if (!ipRateLimit.allowed) {
      const errorRegion = getRegionFromCountryCode(countryCode);
      throw new Error(getErrorMessage(ipRateLimit.errorCode || 'RATE_LIMITED_IP', errorRegion));
    }
  }
  
  // 5. 生成验证码
  const code = generateCode();
  const codeId = uuidv4();
  const pool = getPool();
  const { ttlMinutes } = otpConfig;
  
  // 6. 保存验证码到数据库（MySQL）
  // 注意：verification_codes 表已删除 email 字段（migration 008），只保留 phone
  
  // 🔍 诊断：统计同一手机号在 2 分钟内的发送次数（检查自动重发/重复发送）
  const [recentSends]: any = await pool.execute(
    `SELECT code_id, code, created_at 
     FROM verification_codes 
     WHERE phone = ? 
       AND created_at > DATE_SUB(NOW(), INTERVAL 2 MINUTE)
     ORDER BY created_at DESC`,
    [normalizedPhone]
  );
  
  // 🔍 诊断：记录数据库指纹（检查读写分离/复制延迟）
  const [dbFingerprint]: any = await pool.execute(
    `SELECT DATABASE() AS db, @@hostname AS host, @@server_id AS sid, @@read_only AS ro, @@time_zone AS tz, NOW() AS db_now`
  );
  
  // 查询实际插入的 expires_at（用于日志）
  const [insertedRow]: any = await pool.execute(
    `SELECT expires_at FROM verification_codes WHERE code_id = ?`,
    [codeId]
  );
  const actualExpiresAt = insertedRow[0]?.expires_at;
  
  console.log(`[OTP-SEND] DB Fingerprint & Recent Sends:`, {
    requestId: codeId,
    db: dbFingerprint[0]?.db,
    host: dbFingerprint[0]?.host,
    serverId: dbFingerprint[0]?.sid,
    readOnly: dbFingerprint[0]?.ro,
    timeZone: dbFingerprint[0]?.tz,
    normalizedPhone: normalizedPhone.replace(/\d(?=\d{4})/g, '*'),
    expiresAt: actualExpiresAt ? new Date(actualExpiresAt).toISOString() : 'N/A',
    dbNow: dbFingerprint[0]?.db_now ? new Date(dbFingerprint[0].db_now).toISOString() : new Date().toISOString(),
    appNow: new Date().toISOString(),
    timeDiffMs: dbFingerprint[0]?.db_now ? new Date().getTime() - new Date(dbFingerprint[0].db_now).getTime() : 0,
    recentSendCount: recentSends.length,
    recentSends: recentSends.map((r: any) => ({
      codeId: r.code_id,
      code: r.code,
      createdAt: r.created_at,
      timeDiffMs: new Date().getTime() - new Date(r.created_at).getTime(),
    })),
  });
  
  // 🔍 修复：使用数据库 DATE_ADD 函数生成 expires_at，确保时区一致
  await pool.execute(
    `INSERT INTO verification_codes (code_id, phone, code, code_type, expires_at, is_used) 
     VALUES (?, ?, ?, 'login', DATE_ADD(NOW(), INTERVAL ? MINUTE), FALSE)`,
    [codeId, normalizedPhone, code, ttlMinutes]
  );
  
  // 查询实际插入的 expires_at（用于日志）
  const [insertedRow]: any = await pool.execute(
    `SELECT expires_at FROM verification_codes WHERE code_id = ?`,
    [codeId]
  );
  const actualExpiresAt = insertedRow[0]?.expires_at;
  
  // 更新 expiresAt 变量用于日志（从数据库查询实际值）
  const [insertedRow]: any = await pool.execute(
    `SELECT expires_at FROM verification_codes WHERE code_id = ?`,
    [codeId]
  );
  const actualExpiresAt = insertedRow[0]?.expires_at;
  
  // 7. 调用腾讯云短信服务发送验证码
  // #region agent log
  console.log('[DEBUG] About to send SMS:', JSON.stringify({normalizedPhone: normalizedPhone.replace(/\d(?=\d{4})/g, '*'), codeLength: code.length, hypothesisId: 'D'}));
  // #endregion
  const smsResult = await sendVerificationCode(normalizedPhone, code);
  // #region agent log
  console.log('[DEBUG] SMS result received:', JSON.stringify({smsResult, hypothesisId: 'D'}));
  // #endregion
  
  if (!smsResult.success) {
    console.error(`[Auth] SMS send failed: ${smsResult.errorCode} - ${smsResult.errorMessage}`);
    
    // 短信发送失败，但验证码已保存，可以选择：
    // 1. 删除已保存的验证码（推荐）
    // 2. 保留验证码但标记为未发送（可选）
    
    // 删除已保存的验证码
    await pool.execute(
      `DELETE FROM verification_codes WHERE code_id = ?`,
      [codeId]
    );
    
    const errorRegion = getRegionFromCountryCode(countryCode);
    
    // 检查是否是每日限制错误，返回更友好的提示
    if (smsResult.errorCode === 'LimitExceeded.PhoneNumberDailyLimit') {
      throw new Error(getErrorMessage('SMS_DAILY_LIMIT_EXCEEDED', errorRegion));
    }
    
    throw new Error(getErrorMessage('SMS_SEND_FAILED', errorRegion));
  }
  
  console.log(`[Auth] ✅ Verification code sent successfully to ${normalizedPhone.replace(/\d(?=\d{4})/g, '*')}`);
  
  const errorRegion = getRegionFromCountryCode(countryCode);
  return {
    message: getErrorMessage('OTP_SENT', errorRegion),
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
export async function loginOrRegister(params: {
  phone?: string;
  email?: string;
  code: string;
  channel: 'cn' | 'hk';
  countryCode?: string;  // 新增：国家代码
}): Promise<LoginResponseDto> {
  const { phone, email, code, channel, countryCode: inputCountryCode } = params;
  
  // ✅ 只支持手机号登录
  if (!phone) {
    throw new Error('当前仅支持手机号登录');
  }
  
  // 设置最终的 countryCode（使用新变量避免 const 赋值错误）
  const countryCode = inputCountryCode || (channel === 'cn' ? '+86' : '+852');
  
  // 1. 规范化手机号
  const normalizedResult = normalizePhone(phone, countryCode);
  if (!normalizedResult.success || !normalizedResult.e164Phone) {
    const errorRegion = getRegionFromCountryCode(countryCode);
    throw new Error(getErrorMessage(normalizedResult.errorCode || 'INVALID_PHONE', errorRegion));
  }
  
  const normalizedPhone = normalizedResult.e164Phone;
  
  const pool = getPool();
  
  // 2. 验证验证码（从数据库查询）
  
  // 🔍 诊断：记录数据库指纹（检查读写分离/复制延迟）
  const [dbFingerprint]: any = await pool.execute(
    `SELECT DATABASE() AS db, @@hostname AS host, @@server_id AS sid, @@read_only AS ro, @@time_zone AS tz`
  );
  const fingerprint = {
    db: dbFingerprint[0]?.db,
    host: dbFingerprint[0]?.host,
    serverId: dbFingerprint[0]?.sid,
    readOnly: dbFingerprint[0]?.ro,
    timeZone: dbFingerprint[0]?.tz,
  };
  
  const [codeRows]: any = await pool.execute(
    `SELECT * FROM verification_codes 
     WHERE phone = ? 
       AND code = ? 
       AND code_type = 'login'
       AND is_used = FALSE
       AND expires_at > NOW()
     ORDER BY created_at DESC
     LIMIT 1`,
    [normalizedPhone, code]
  );
  
  if (codeRows.length === 0) {
    // 🔍 诊断：查询失败时，打印候选记录（按 phone 查最近 5 条）
    const [candidateRows]: any = await pool.execute(
      `SELECT id, phone, code, code_type, is_used, created_at, expires_at 
       FROM verification_codes 
       WHERE phone = ? 
       ORDER BY created_at DESC 
       LIMIT 5`,
      [normalizedPhone]
    );
    
    console.log(`[OTP-VERIFY-FAIL] No matching code found:`, {
      requestId: `verify-${Date.now()}`,
      dbFingerprint: fingerprint,
      normalizedPhone: normalizedPhone.replace(/\d(?=\d{4})/g, '*'),
      inputCode: code,
      candidateCount: candidateRows.length,
      candidates: candidateRows.map((r: any) => ({
        code: r.code,
        codeType: r.code_type,
        isUsed: r.is_used,
        createdAt: r.created_at,
        expiresAt: r.expires_at,
        expired: new Date(r.expires_at) <= new Date(),
        timeDiff: new Date().getTime() - new Date(r.created_at).getTime(),
      })),
      dbNow: new Date().toISOString(),
    });
    
    // 检查是否过期
    const [expiredCodes]: any = await pool.execute(
      `SELECT * FROM verification_codes 
       WHERE phone = ? 
         AND code = ? 
         AND code_type = 'login'
       ORDER BY created_at DESC
       LIMIT 1`,
      [normalizedPhone, code]
    );
    
    const errorRegion = getRegionFromCountryCode(countryCode);
    
    if (expiredCodes.length > 0) {
      if (expiredCodes[0].is_used) {
        throw new Error(getErrorMessage('CODE_MISMATCH', errorRegion));
      } else if (new Date(expiredCodes[0].expires_at) <= new Date()) {
        throw new Error(getErrorMessage('CODE_EXPIRED', errorRegion));
      }
    }
    
    throw new Error(getErrorMessage('CODE_MISMATCH', errorRegion));
  }
  
  // 🔍 诊断：验证成功时也记录指纹
  console.log(`[OTP-VERIFY-SUCCESS] Code verified:`, {
    requestId: `verify-${Date.now()}`,
    dbFingerprint: fingerprint,
    normalizedPhone: normalizedPhone.replace(/\d(?=\d{4})/g, '*'),
    codeId: codeRows[0].code_id,
  });
  
  const codeRow = codeRows[0];
  
  // 3. 标记验证码为已使用
  await pool.execute(
    `UPDATE verification_codes SET is_used = TRUE WHERE code_id = ?`,
    [codeRow.code_id]
  );
  
  console.log(`[Auth] ✅ Verification code verified for ${normalizedPhone.replace(/\d(?=\d{4})/g, '*')}`);
  
  // 4. 查找或创建用户
  const [userRows]: any = await pool.execute(
    `SELECT * FROM users WHERE phone = ?`,
    [normalizedPhone]
  );
  
  let userRow: UserRow;
  let isFirstLogin = false;
  
  if (userRows.length > 0) {
    // 用户已存在：登录
    userRow = userRows[0];
  } else {
    // 用户不存在：注册
    isFirstLogin = true;
    const userId = uuidv4();
    const nickname = `用户${normalizedPhone.slice(-4)}`;
    
    // 注意：users 表已删除 email 字段（migration 008），只保留 phone
    await pool.execute(
      `INSERT INTO users (user_id, nickname, phone, app_region, is_pro) 
       VALUES (?, ?, ?, ?, FALSE)`,
      [userId, nickname, normalizedPhone, channel.toUpperCase()]
    );
    
    // 重新查询用户信息
    const [newUserRows]: any = await pool.execute(
      `SELECT * FROM users WHERE user_id = ?`,
      [userId]
    );
    userRow = newUserRows[0];
    
    // 创建用户设置
    await pool.execute(
      `INSERT INTO user_settings (setting_id, user_id, language) 
       VALUES (?, ?, ?)`,
      [uuidv4(), userId, channel === 'cn' ? 'zh-CN' : 'zh-HK']
    );
  }
  
  // 5. 生成 JWT Token
  const token = generateToken(userRow.user_id);
  
  // ✅ 使用 FieldMapper 转换为 DTO
  const userDto = FieldMapper.mapUser(userRow);
  
  return {
    token,
    user: userDto,
  };
}

/**
 * 通过 Token 获取用户信息
 */
export async function getUserByToken(token: string): Promise<UserDto> {
  const { userId } = verifyToken(token);
  
  const pool = getPool();
  const [rows]: any = await pool.execute(
    `SELECT * FROM users WHERE user_id = ?`,
    [userId]
  );
  
  if (rows.length === 0) {
    throw new Error('User not found');
  }
  
  // ✅ 使用 FieldMapper 转换为 DTO
  return FieldMapper.mapUser(rows[0] as UserRow);
}

// ==========================================
// H5 用戶名登錄接口（新增）
// ==========================================

/**
 * 用戶名註冊（H5 專用）
 */
export async function registerUsername(params: {
  username: string;
  password: string;
}): Promise<LoginResponseDto> {
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
  
  const pool = getPool();
  
  // 3. 檢查用戶名是否已存在
  const [existingUsers]: any = await pool.execute(
    `SELECT * FROM users WHERE username = ?`,
    [username]
  );
  
  if (existingUsers.length > 0) {
    throw new Error('用戶名已被占用');
  }
  
  // 4. 創建用戶
  const userId = uuidv4();
  const passwordHash = await bcrypt.hash(password, 10);
  const nickname = `用戶${username}`;
  const inviteCode = uuidv4().slice(0, 8).toUpperCase();
  
  await pool.execute(
    `INSERT INTO users 
      (user_id, username, password_hash, password_set, nickname, app_region, is_pro, invite_code) 
     VALUES (?, ?, ?, TRUE, ?, 'CN', FALSE, ?)`,
    [userId, username, passwordHash, nickname, inviteCode]
  );
  
  // 5. 創建用戶設置
  await pool.execute(
    `INSERT INTO user_settings (setting_id, user_id, language) 
     VALUES (?, ?, 'zh-CN')`,
    [uuidv4(), userId]
  );
  
  // 6. 重新查詢用戶信息
  const [newUserRows]: any = await pool.execute(
    `SELECT * FROM users WHERE user_id = ?`,
    [userId]
  );
  const userRow = newUserRows[0] as UserRow;
  
  // 7. 生成 JWT Token（與現有登錄邏輯完全一致）
  const token = generateToken(userId);
  
  // 8. 使用 FieldMapper 轉換為 DTO
  const userDto = FieldMapper.mapUser(userRow);
  
  return {
    token,
    user: userDto,
  };
}

/**
 * 用戶名登錄（H5 專用）
 */
export async function loginUsername(params: {
  username: string;
  password: string;
}): Promise<LoginResponseDto> {
  const { username, password } = params;
  
  const pool = getPool();
  
  // 1. 查找用戶（只按 username 查）
  const [userRows]: any = await pool.execute(
    `SELECT * FROM users WHERE username = ?`,
    [username]
  );
  
  if (userRows.length === 0) {
    throw new Error('用戶名或密碼錯誤');  // 統一錯誤信息
  }
  
  const userRow = userRows[0] as UserRow;
  
  // 2. 校驗密碼
  if (!userRow.password_hash) {
    throw new Error('用戶名或密碼錯誤');
  }
  
  const valid = await bcrypt.compare(password, userRow.password_hash);
  if (!valid) {
    throw new Error('用戶名或密碼錯誤');
  }
  
  // 3. 生成 JWT Token（與現有登錄邏輯完全一致）
  const token = generateToken(userRow.user_id);
  
  // 4. 更新最後登錄時間
  await pool.execute(
    `UPDATE users SET last_login_at = NOW() WHERE user_id = ?`,
    [userRow.user_id]
  );
  
  // 5. 使用 FieldMapper 轉換為 DTO
  const userDto = FieldMapper.mapUser(userRow);
  
  return {
    token,
    user: userDto,
  };
}

