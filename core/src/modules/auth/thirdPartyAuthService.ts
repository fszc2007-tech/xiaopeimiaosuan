/**
 * 第三方登录服务
 * 
 * 功能：
 * - Google / Apple ID Token 验证
 * - 用户查找/创建（使用 auth_identities 表）
 * - 事务化和幂等化
 * - 日志与隐私保护
 * 
 * 参考文档：Google一键登录设计方案-v1.1-可执行版.md
 */

import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { getPool } from '../../database/connection';
import { FieldMapper } from '../../utils/fieldMapper';
import type { UserRow } from '../../types/database';
import type { ThirdPartyLoginResponseDto } from '../../types/dto';

const googleClient = new OAuth2Client();

// 允许的 Google Client ID 列表（从环境变量读取）
const GOOGLE_ALLOWED_CLIENT_IDS = process.env.GOOGLE_ALLOWED_CLIENT_IDS?.split(',').map(id => id.trim()) || [];

// #region agent log
const fs = require('fs');
const logPath = '/Users/gaoxuxu/Desktop/xiaopei-app/.cursor/debug.log';
const log = (data: any) => {
  try {
    fs.appendFileSync(logPath, JSON.stringify({...data, timestamp: Date.now()}) + '\n');
  } catch (e) {}
};
log({location: 'thirdPartyAuthService.ts:24', message: 'GOOGLE_ALLOWED_CLIENT_IDS loaded', data: {count: GOOGLE_ALLOWED_CLIENT_IDS.length, ids: GOOGLE_ALLOWED_CLIENT_IDS}, sessionId: 'debug-session', hypothesisId: 'A'});
// #endregion

// Google 合法 Issuer
const GOOGLE_ISSUERS = [
  'https://accounts.google.com',
  'accounts.google.com',
];

/**
 * 验证 Google ID Token
 * 
 * P0 生产环境要求：
 * - 使用 google-auth-library 的 JWT 验证（推荐）
 * - 禁止使用 tokeninfo 端点（仅用于调试，生产可能受限）
 * - Audience 白名单：支持多个 Client ID（Web/Android/iOS）
 * - 显式断言：验证 aud、iss、exp
 */
async function verifyGoogleToken(idToken: string): Promise<{
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
  email_verified?: boolean;
}> {
  // #region agent log
  log({location: 'thirdPartyAuthService.ts:verifyGoogleToken:entry', message: 'verifyGoogleToken called', data: {idTokenLength: idToken?.length || 0, allowedIdsCount: GOOGLE_ALLOWED_CLIENT_IDS.length}, sessionId: 'debug-session', hypothesisId: 'A,D'});
  // #endregion
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: GOOGLE_ALLOWED_CLIENT_IDS, // 支持多个 Client ID
    });
    
    const payload = ticket.getPayload();
    
    // #region agent log
    log({location: 'thirdPartyAuthService.ts:verifyGoogleToken:afterVerify', message: 'Token verified, checking payload', data: {hasPayload: !!payload, aud: payload?.aud, iss: payload?.iss}, sessionId: 'debug-session', hypothesisId: 'D'});
    // #endregion
    
    // ⚠️ P1 显式断言（便于 code review 与安全审计）
    if (!payload) {
      // #region agent log
      log({location: 'thirdPartyAuthService.ts:verifyGoogleToken:error', message: 'Token payload is empty', data: {}, sessionId: 'debug-session', hypothesisId: 'D'});
      // #endregion
      throw new Error('Token payload is empty');
    }
    
    // 1. 验证 aud（受众）是否在允许列表中
    if (!payload.aud || !GOOGLE_ALLOWED_CLIENT_IDS.includes(payload.aud)) {
      // #region agent log
      log({location: 'thirdPartyAuthService.ts:verifyGoogleToken:error', message: 'Invalid audience', data: {aud: payload.aud, allowedIds: GOOGLE_ALLOWED_CLIENT_IDS}, sessionId: 'debug-session', hypothesisId: 'A,D'});
      // #endregion
      throw new Error(`Invalid audience: ${payload.aud}`);
    }
    
    // 2. 验证 iss（发行者）是否合法
    if (!payload.iss || !GOOGLE_ISSUERS.includes(payload.iss)) {
      // #region agent log
      log({location: 'thirdPartyAuthService.ts:verifyGoogleToken:error', message: 'Invalid issuer', data: {iss: payload.iss, allowedIssuers: GOOGLE_ISSUERS}, sessionId: 'debug-session', hypothesisId: 'D'});
      // #endregion
      throw new Error(`Invalid issuer: ${payload.iss}`);
    }
    
    // 3. 验证 exp（过期时间）未过期（google-auth-library 会自动校验）
    // 如果 exp 已过期，verifyIdToken 会直接抛出错误
    
    // 4. 可选：如果强依赖邮箱能力，要求 email_verified=true
    // if (payload.email && !payload.email_verified) {
    //   throw new Error('Email not verified');
    // }
    
    return {
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      email_verified: payload.email_verified,
    };
  } catch (error: any) {
    console.error('[Google Token Verification] ❌ 验证失败:', error.message);
    throw new Error('Invalid Google ID Token');
  }
}

/**
 * Google 登录
 * 
 * P0 事务化与幂等化要点：
 * - DB 事务：BEGIN → 插入 user → 插入 identity → COMMIT
 * - 幂等锚点：以 UNIQUE(provider, provider_user_id) 为幂等锚点
 * - 并发处理（P0 修正）：如果唯一键冲突，必须 rollback 整个事务，然后在事务外重新查询并返回已有用户（避免产生孤儿用户）
 * - first_login 判断：基于"identity 是否首次创建"，不要基于 user 是否存在（更准确）
 * - 更新策略：更新 identity 信息时，不要把已有字段更新成 null（例如 Google 本次没返回 picture，就不要覆盖掉历史头像）
 */
export async function googleLogin(params: {
  idToken: string;
  app_region: 'CN' | 'HK';
}): Promise<ThirdPartyLoginResponseDto> {
  const { idToken, app_region } = params;
  
  // #region agent log
  log({location: 'thirdPartyAuthService.ts:googleLogin:entry', message: 'googleLogin called', data: {app_region, idTokenLength: idToken?.length || 0}, sessionId: 'debug-session', hypothesisId: 'B,C,D'});
  // #endregion
  
  // P0 地区策略后端校验：HK 才允许 Google
  if (app_region !== 'HK') {
    // #region agent log
    log({location: 'thirdPartyAuthService.ts:googleLogin:error', message: 'Region not supported', data: {app_region}, sessionId: 'debug-session', hypothesisId: 'B'});
    // #endregion
    throw new Error('Google login is only available in Hong Kong region');
  }
  
  // 1. 验证 Google ID Token
  // #region agent log
  log({location: 'thirdPartyAuthService.ts:googleLogin:beforeVerify', message: 'About to verify token', data: {}, sessionId: 'debug-session', hypothesisId: 'D'});
  // #endregion
  const providerUserInfo = await verifyGoogleToken(idToken);
  // #region agent log
  log({location: 'thirdPartyAuthService.ts:googleLogin:afterVerify', message: 'Token verified successfully', data: {sub: providerUserInfo.sub, hasEmail: !!providerUserInfo.email}, sessionId: 'debug-session', hypothesisId: 'D'});
  // #endregion
  
  // P2 日志与隐私：不记录 idToken 原文
  const requestId = uuidv4();
  const subHash = crypto.createHash('sha256').update(providerUserInfo.sub).digest('hex').substring(0, 16);
  console.log(`[Google Login] 🔑 Request ID: ${requestId}, sub hash: ${subHash}`);
  
  const pool = getPool();
  // #region agent log
  log({location: 'thirdPartyAuthService.ts:googleLogin:beforeConnection', message: 'Getting database connection', data: {}, sessionId: 'debug-session', hypothesisId: 'C'});
  // #endregion
  const connection = await pool.getConnection();
  
  // #region agent log
  log({location: 'thirdPartyAuthService.ts:googleLogin:connectionGot', message: 'Database connection obtained', data: {}, sessionId: 'debug-session', hypothesisId: 'C'});
  // #endregion
  
  try {
    await connection.beginTransaction();
    // #region agent log
    log({location: 'thirdPartyAuthService.ts:googleLogin:transactionStarted', message: 'Transaction started', data: {}, sessionId: 'debug-session', hypothesisId: 'C'});
    // #endregion
    
    // 2. 查找是否已存在该 identity
    // #region agent log
    log({location: 'thirdPartyAuthService.ts:googleLogin:beforeQuery', message: 'Querying auth_identities table', data: {provider: 'google', sub: providerUserInfo.sub}, sessionId: 'debug-session', hypothesisId: 'B,C'});
    // #endregion
    const [identityRows] = await connection.query<any[]>(
      'SELECT * FROM auth_identities WHERE provider = ? AND provider_user_id = ?',
      ['google', providerUserInfo.sub]
    );
    // #region agent log
    log({location: 'thirdPartyAuthService.ts:googleLogin:afterQuery', message: 'Query completed', data: {found: identityRows && identityRows.length > 0, count: identityRows?.length || 0}, sessionId: 'debug-session', hypothesisId: 'B,C'});
    // #endregion
    
    if (identityRows && identityRows.length > 0) {
      // 2.1 如果存在，更新身份信息（可选，但不要把已有字段更新成 null）
      // ⚠️ P1 更新策略：如果 Google 本次没返回 picture，就不要覆盖掉历史头像
      const updateFields: string[] = [];
      const updateValues: any[] = [];
      
      if (providerUserInfo.email) {
        updateFields.push('email = ?');
        updateValues.push(providerUserInfo.email);
      }
      if (providerUserInfo.name) {
        updateFields.push('name = ?');
        updateValues.push(providerUserInfo.name);
      }
      if (providerUserInfo.picture) {
        updateFields.push('avatar_url = ?');
        updateValues.push(providerUserInfo.picture);
      }
      
      if (updateFields.length > 0) {
        updateFields.push('updated_at = NOW()');
        updateValues.push(identityRows[0].identity_id);
        await connection.query(
          `UPDATE auth_identities SET ${updateFields.join(', ')} WHERE identity_id = ?`,
          updateValues
        );
      }
      
      // 2.2 返回关联的用户
      const [userRows] = await connection.query<UserRow[]>(
        'SELECT * FROM users WHERE user_id = ?',
        [identityRows[0].user_id]
      );
      
      await connection.commit();
      
      if (!userRows || userRows.length === 0) {
        throw new Error('User not found for identity');
      }
      
      const user = userRows[0];
      const userDto = FieldMapper.mapUser(user);
      const token = generateToken(user.user_id);
      
      return {
        token,
        user: userDto,  // 返回完整的 UserDto，包含 status 和 deleteScheduledAt
        first_login: false,
        request_id: requestId,
      };
    }
    
    // 3. 如果不存在，创建新用户 + auth_identity
    const userId = uuidv4();
    const identityId = uuidv4();
    
    // 3.1 创建用户（不绑定手机号）
    await connection.query(
      'INSERT INTO users (user_id, email, nickname, avatar_url, app_region, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
      [
        userId,
        providerUserInfo.email || null,
        providerUserInfo.name || providerUserInfo.email?.split('@')[0] || '用户',
        providerUserInfo.picture || null,
        app_region,
      ]
    );
    
    // 3.2 创建 auth_identity（唯一键约束确保幂等性）
    try {
      await connection.query(
        'INSERT INTO auth_identities (identity_id, user_id, provider, provider_user_id, email, name, avatar_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
        [
          identityId,
          userId,
          'google',
          providerUserInfo.sub,
          providerUserInfo.email || null,
          providerUserInfo.name || null,
          providerUserInfo.picture || null,
        ]
      );
    } catch (insertError: any) {
      // ⚠️ P0 修正：处理并发冲突时，必须 rollback 整个事务，避免产生孤儿用户
      if (insertError.code === 'ER_DUP_ENTRY') {
        // Rollback 整个事务（包括已插入的 user）
        await connection.rollback();
        connection.release();
        
        // 在事务外重新查询 identity→user
        const [existingIdentityRows] = await pool.query<any[]>(
          'SELECT * FROM auth_identities WHERE provider = ? AND provider_user_id = ?',
          ['google', providerUserInfo.sub]
        );
        
        if (existingIdentityRows && existingIdentityRows.length > 0) {
          const [existingUserRows] = await pool.query<UserRow[]>(
            'SELECT * FROM users WHERE user_id = ?',
            [existingIdentityRows[0].user_id]
          );
          
          if (existingUserRows && existingUserRows.length > 0) {
            const user = existingUserRows[0];
            const userDto = FieldMapper.mapUser(user);
            const token = generateToken(user.user_id);
            
            return {
              token,
              user: userDto,  // 返回完整的 UserDto，包含 status 和 deleteScheduledAt
              first_login: false,
              request_id: requestId,
            };
          }
        }
        
        // 如果查询不到（理论上不应该发生），抛出错误
        throw new Error('Concurrent insert conflict: identity not found after rollback');
      }
      throw insertError;
    }
    
    await connection.commit();
    connection.release();
    
    // 查询新创建的用户
    const [newUserRows] = await pool.query<UserRow[]>(
      'SELECT * FROM users WHERE user_id = ?',
      [userId]
    );
    
    if (!newUserRows || newUserRows.length === 0) {
      throw new Error('Failed to create user');
    }
    
    const user = newUserRows[0];
    const userDto = FieldMapper.mapUser(user);
    const token = generateToken(user.user_id);
    
    return {
      token,
      user: userDto,  // 返回完整的 UserDto，包含 status 和 deleteScheduledAt
      first_login: true,
      request_id: requestId,
    };
  } catch (error: any) {
    // #region agent log
    log({location: 'thirdPartyAuthService.ts:googleLogin:catch', message: 'Error caught in googleLogin', data: {errorMessage: error?.message, errorCode: error?.code, errorStack: error?.stack?.substring(0, 200)}, sessionId: 'debug-session', hypothesisId: 'A,B,C,D,E'});
    // #endregion
    await connection.rollback();
    // #region agent log
    log({location: 'thirdPartyAuthService.ts:googleLogin:afterRollback', message: 'Transaction rolled back', data: {}, sessionId: 'debug-session', hypothesisId: 'C'});
    // #endregion
    connection.release();
    // #region agent log
    log({location: 'thirdPartyAuthService.ts:googleLogin:afterRelease', message: 'Connection released', data: {}, sessionId: 'debug-session', hypothesisId: 'C'});
    // #endregion
    throw error;
  }
}

/**
 * 生成 JWT Token（复用 authService 的逻辑）
 */
function generateToken(userId: string): string {
  const jwt = require('jsonwebtoken');
  const JWT_SECRET = process.env.XIAOPEI_JWT_SECRET || 'your-secret-key-change-me';
  const JWT_EXPIRES_IN = '30d';
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

