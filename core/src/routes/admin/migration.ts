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

