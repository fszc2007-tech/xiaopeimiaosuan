/**
 * 执行 Migration 044：修复神煞解读表编码问题
 */

import { createConnection } from '../src/database/connection';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

async function runMigration() {
  try {
    console.log('[Migration 044] 开始执行...\n');
    
    const pool = await createConnection();
    
    // 读取迁移文件
    const migrationPath = path.join(__dirname, '../src/database/migrations/044_fix_shensha_encoding.sql');
    const sql = fs.readFileSync(migrationPath, 'utf-8');
    
    // 分割 SQL 语句
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*') && !s.startsWith('SELECT'));
    
    console.log(`[Migration 044] 找到 ${statements.length} 条 SQL 语句\n`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.length === 0) continue;
      
      try {
        console.log(`[Migration 044] 执行语句 ${i + 1}/${statements.length}...`);
        await pool.execute(statement);
        console.log(`[Migration 044] ✅ 语句 ${i + 1} 执行成功`);
      } catch (error: any) {
        if (error.code === 'ER_DUP_FIELDNAME' || error.message?.includes('Duplicate')) {
          console.log(`[Migration 044] ⚠️ 语句 ${i + 1} 已存在，跳过: ${error.message}`);
        } else {
          console.error(`[Migration 044] ❌ 语句 ${i + 1} 执行失败:`, error.message);
          throw error;
        }
      }
    }
    
    console.log('\n[Migration 044] ✅ 迁移完成！');
    
    // 验证
    const [tableInfo]: any = await pool.query(`
      SELECT TABLE_COLLATION 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'shensha_readings'
    `);
    
    if (tableInfo.length > 0) {
      const collation = tableInfo[0].TABLE_COLLATION;
      const charset = collation?.split('_')[0] || 'unknown';
      console.log(`\n[Migration 044] 验证结果:`);
      console.log(`   表字符集: ${charset}`);
      console.log(`   排序规则: ${collation}`);
      
      if (charset === 'utf8mb4') {
        console.log(`   ✅ 字符集正确！`);
      } else {
        console.log(`   ⚠️  字符集仍不是 utf8mb4`);
      }
    }
    
    await pool.end();
  } catch (error: any) {
    console.error(`[Migration 044] ❌ 脚本执行失败: ${error.message}`);
    throw error;
  }
}

runMigration()
  .then(() => {
    console.log('[Migration 044] 脚本执行完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('[Migration 044] 脚本执行失败:', error);
    process.exit(1);
  });
