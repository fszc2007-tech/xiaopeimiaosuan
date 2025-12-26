/**
 * 数据库迁移路由（临时，仅用于执行 Migration 043）
 * 
 * ⚠️ 警告：此路由仅用于紧急修复，执行后应立即删除
 */

import { Router, Request, Response } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { getPool } from '../../database/connection';
import * as fs from 'fs';
import * as path from 'path';

const router = Router();

// ⚠️ 临时：移除认证以便执行迁移（执行后应立即删除此端点）
// router.use(authMiddleware);

/**
 * GET /api/v1/admin/migration/schema
 * 获取数据库表结构（用于比对）
 */
router.get('/schema', async (req: Request, res: Response) => {
  try {
    const pool = getPool();
    
    // 获取所有表
    const [tables]: any = await pool.query('SHOW TABLES');
    const tableKey = Object.keys(tables[0])[0];
    const tableNames = tables.map((row: any) => row[tableKey]);
    
    // 获取每张表的结构
    const schemas: any = {};
    for (const tableName of tableNames) {
      const [columns]: any = await pool.query(`DESCRIBE ${tableName}`);
      schemas[tableName] = {
        columns: columns.map((col: any) => ({
          field: col.Field,
          type: col.Type,
          null: col.Null,
          key: col.Key,
          default: col.Default,
          extra: col.Extra,
        })),
      };
    }
    
    res.json({
      success: true,
      data: {
        tables: tableNames,
        schemas,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'QUERY_FAILED',
        message: error.message || '查询失败',
      },
    });
  }
});

/**
 * POST /api/v1/admin/migration/044
 * 执行 Migration 044：修复神煞解读表编码问题
 */
router.post('/044', async (req: Request, res: Response) => {
  try {
    console.log('[Migration 044 API] 开始执行...');
    
    const pool = getPool();
    
    // 直接使用 SQL 内容
    const sql = `-- Migration 044: 修复神煞解读表编码问题
ALTER TABLE shensha_readings 
  CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE shensha_readings 
  MODIFY COLUMN name VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '神煞名称（中文）',
  MODIFY COLUMN badge_text VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '徽标文本（如 吉神、帶挑戰、桃花）',
  MODIFY COLUMN short_title VARCHAR(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '短标题（一句话概括特征）',
  MODIFY COLUMN summary TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '一句话总结（使用核心含义）',
  MODIFY COLUMN for_this_position TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '针对所在柱位的具体说明';`;
    
    // 分割 SQL 语句
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    const results: any[] = [];
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.length === 0) continue;
      
      try {
        console.log(`[Migration 044 API] 执行语句 ${i + 1}/${statements.length}...`);
        await pool.execute(statement);
        results.push({ statement: i + 1, status: 'success' });
        console.log(`[Migration 044 API] ✅ 语句 ${i + 1} 执行成功`);
      } catch (error: any) {
        if (error.code === 'ER_DUP_FIELDNAME' || error.message?.includes('Duplicate')) {
          results.push({ statement: i + 1, status: 'skipped', reason: '已存在' });
          console.log(`[Migration 044 API] ⚠️ 语句 ${i + 1} 已存在，跳过`);
        } else {
          results.push({ statement: i + 1, status: 'error', error: error.message });
          console.error(`[Migration 044 API] ❌ 语句 ${i + 1} 执行失败:`, error.message);
          throw error;
        }
      }
    }
    
    console.log('[Migration 044 API] ✅ 迁移完成！');
    
    res.json({
      success: true,
      message: 'Migration 044 执行完成',
      results,
    });
  } catch (error: any) {
    console.error('[Migration 044 API] ❌ 迁移失败:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'MIGRATION_FAILED',
        message: error.message || '迁移执行失败',
      },
    });
  }
});

/**
 * POST /api/v1/admin/migration/045
 * 执行 Migration 045：修复开发和生产环境表结构差异
 */
router.post('/045', async (req: Request, res: Response) => {
  try {
    console.log('[Migration 045 API] 开始执行...');
    
    const pool = getPool();
    
    // 直接使用 SQL 内容
    const sql = `-- Migration 045: 修复开发和生产环境表结构差异
ALTER TABLE conversations MODIFY COLUMN title VARCHAR(255) NULL;
ALTER TABLE conversations MODIFY COLUMN source VARCHAR(50) NULL;
ALTER TABLE users ADD COLUMN username VARCHAR(64) NULL UNIQUE COMMENT '用户名' AFTER updated_at;
ALTER TABLE users ADD COLUMN password_set TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否设置密码' AFTER username;
ALTER TABLE users ADD COLUMN invite_code VARCHAR(20) NULL COMMENT '邀请码' AFTER password_set;
ALTER TABLE users ADD COLUMN invited_by VARCHAR(36) NULL COMMENT '邀请人ID' AFTER invite_code;
ALTER TABLE users ADD COLUMN last_login_at DATETIME NULL COMMENT '最后登录时间' AFTER invited_by;
ALTER TABLE users ADD COLUMN avatar_url VARCHAR(255) NULL COMMENT '头像URL' AFTER last_login_at;
ALTER TABLE day_stem_readings MODIFY COLUMN stem VARCHAR(10) NOT NULL;`;
    
    // 分割 SQL 语句
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    const results: any[] = [];
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.length === 0) continue;
      
      try {
        console.log(`[Migration 045 API] 执行语句 ${i + 1}/${statements.length}...`);
        await pool.execute(statement);
        results.push({ statement: i + 1, status: 'success' });
        console.log(`[Migration 045 API] ✅ 语句 ${i + 1} 执行成功`);
      } catch (error: any) {
        // MODIFY COLUMN 操作不应该被跳过，只有 ADD COLUMN 才可能因为字段已存在而跳过
        if (statement.includes('ADD COLUMN') && (error.code === 'ER_DUP_FIELDNAME' || error.message?.includes('Duplicate'))) {
          results.push({ statement: i + 1, status: 'skipped', reason: '字段已存在' });
          console.log(`[Migration 045 API] ⚠️ 语句 ${i + 1} 字段已存在，跳过`);
        } else if (statement.includes('MODIFY COLUMN') && error.message?.includes('same as before')) {
          results.push({ statement: i + 1, status: 'skipped', reason: '字段类型已正确' });
          console.log(`[Migration 045 API] ⚠️ 语句 ${i + 1} 字段类型已正确，跳过`);
        } else {
          results.push({ statement: i + 1, status: 'error', error: error.message });
          console.error(`[Migration 045 API] ❌ 语句 ${i + 1} 执行失败:`, error.message);
          // 对于 MODIFY COLUMN，即使失败也继续执行其他语句
          if (!statement.includes('MODIFY COLUMN')) {
            throw error;
          }
        }
      }
    }
    
    console.log('[Migration 045 API] ✅ 迁移完成！');
    
    res.json({
      success: true,
      message: 'Migration 045 执行完成',
      results,
    });
  } catch (error: any) {
    console.error('[Migration 045 API] ❌ 迁移失败:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'MIGRATION_FAILED',
        message: error.message || '迁移执行失败',
      },
    });
  }
});

/**
 * POST /api/v1/admin/migration/043
 * 执行 Migration 043：添加缺失的数据库字段
 */
router.post('/043', async (req: Request, res: Response) => {
  try {
    console.log('[Migration 043 API] 开始执行...');
    
    const pool = getPool();
    
    // 直接使用 SQL 内容（避免文件路径问题）
    const sql = `-- Migration 043: 添加缺失的数据库字段
ALTER TABLE conversations 
  ADD COLUMN source VARCHAR(32) NULL COMMENT '来源：app/admin/script' AFTER topic;
ALTER TABLE conversations 
  ADD COLUMN title VARCHAR(200) NULL COMMENT '对话标题' AFTER first_question;
ALTER TABLE conversations 
  ADD COLUMN last_message_at DATETIME NULL COMMENT '最后消息时间' AFTER updated_at;
ALTER TABLE users 
  ADD COLUMN pro_expires_at DATETIME NULL COMMENT 'Pro 到期时间' AFTER is_pro;
ALTER TABLE users 
  ADD COLUMN pro_plan ENUM('yearly', 'monthly', 'quarterly', 'lifetime') NULL COMMENT 'Pro 方案类型' AFTER pro_expires_at;
CREATE INDEX idx_pro_expires_at ON users(pro_expires_at);`;
    
    // 分割 SQL 语句
    const lines = sql.split('\n');
    const statements: string[] = [];
    let currentStatement = '';
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('--') || trimmed.startsWith('/*') || trimmed.length === 0) {
        continue;
      }
      
      currentStatement += line + '\n';
      
      if (trimmed.endsWith(';')) {
        const stmt = currentStatement.trim();
        if (stmt.length > 0 && !stmt.startsWith('SELECT')) {
          statements.push(stmt);
        }
        currentStatement = '';
      }
    }
    
    if (currentStatement.trim().length > 0) {
      statements.push(currentStatement.trim());
    }
    
    const results: any[] = [];
    
    // 执行每条 SQL
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.length === 0) continue;
      
      try {
        console.log(`[Migration 043 API] 执行语句 ${i + 1}/${statements.length}...`);
        await pool.execute(statement);
        results.push({ statement: i + 1, status: 'success' });
        console.log(`[Migration 043 API] ✅ 语句 ${i + 1} 执行成功`);
      } catch (error: any) {
        if (error.code === 'ER_DUP_FIELDNAME' || 
            error.message?.includes('Duplicate column name') ||
            error.message?.includes('Duplicate key name')) {
          results.push({ statement: i + 1, status: 'skipped', reason: '字段/索引已存在' });
          console.log(`[Migration 043 API] ⚠️ 语句 ${i + 1} 字段/索引已存在，跳过`);
        } else {
          results.push({ statement: i + 1, status: 'error', error: error.message });
          console.error(`[Migration 043 API] ❌ 语句 ${i + 1} 执行失败:`, error.message);
          throw error;
        }
      }
    }
    
    console.log('[Migration 043 API] ✅ 迁移完成！');
    
    res.json({
      success: true,
      message: 'Migration 043 执行完成',
      results,
    });
  } catch (error: any) {
    console.error('[Migration 043 API] ❌ 迁移失败:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'MIGRATION_FAILED',
        message: error.message || '迁移执行失败',
      },
    });
  }
});

export default router;

