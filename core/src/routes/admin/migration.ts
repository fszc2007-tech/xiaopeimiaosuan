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
 * POST /api/v1/admin/migration/043
 * 执行 Migration 043：添加缺失的数据库字段
 */
router.post('/043', async (req: Request, res: Response) => {
  try {
    console.log('[Migration 043 API] 开始执行...');
    
    const pool = getPool();
    
    // 读取迁移文件（在 Docker 容器中，使用 src 路径）
    const migrationPath = path.join(__dirname, '../../src/database/migrations/043_add_missing_fields.sql');
    const sql = fs.readFileSync(migrationPath, 'utf-8');
    
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

