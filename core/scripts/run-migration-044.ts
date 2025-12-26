/**
 * 执行 Migration 044：修复神煞解读表编码问题
 */

import { createConnection } from '../src/database/connection';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

async function runMigration() {
  console.log('[Migration 044] 开始执行...\n');
  
  const pool = await createConnection();
  
  try {
    // 读取迁移文件
    const migrationPath = path.join(__dirname, '../src/database/migrations/044_fix_shensha_encoding.sql');
    const sql = fs.readFileSync(migrationPath, 'utf-8');
    
    // 分割 SQL 语句
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*') && !s.startsWith('SELECT'));
    
    console.log(`[Migration 044] 找到 ${statements.length} 条 SQL 语句\n`);
    
    // 执行每条 SQL
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.length === 0) continue;
      
      try {
        console.log(`[Migration 044] 执行语句 ${i + 1}/${statements.length}...`);
        await pool.execute(statement);
        console.log(`[Migration 044] ✅ 语句 ${i + 1} 执行成功`);
      } catch (error: any) {
        console.error(`[Migration 044] ❌ 语句 ${i + 1} 执行失败:`, error.message);
        // 如果是字符集已正确的错误，可以忽略
        if (error.message?.includes('already') || error.message?.includes('same')) {
          console.log(`[Migration 044] ⚠️  语句 ${i + 1} 字符集已正确，跳过`);
        } else {
          throw error;
        }
      }
    }
    
    console.log('\n[Migration 044] ✅ 迁移完成！');
    
  } catch (error: any) {
    console.error('[Migration 044] ❌ 迁移失败:', error.message);
    throw error;
  } finally {
    await pool.end();
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

