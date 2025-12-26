/**
 * 执行 Migration 008: 优化索引和扩展 phone 字段
 */

import { createConnection, closeConnection } from '../src/database/connection';
import { readFileSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function runMigration() {
  try {
    console.log('[Migration 008] 开始执行...\n');
    
    const pool = await createConnection();
    const database = process.env.XIAOPEI_MYSQL_DATABASE || 'xiaopei';
    
    // 读取 SQL 文件
    const sqlPath = join(__dirname, '../src/database/migrations/008_optimize_indexes_phone_only.sql');
    const sqlContent = readFileSync(sqlPath, 'utf-8');
    
    // 分割 SQL 语句（按分号和换行）
    // 先移除注释行和验证查询
    const cleanedSql = sqlContent
      .split('\n')
      .filter(line => {
        const trimmed = line.trim();
        return !trimmed.startsWith('--') && 
               !trimmed.startsWith('SELECT') &&
               !trimmed.includes('SHOW INDEX') &&
               !trimmed.includes('DESCRIBE') &&
               !trimmed.includes('EXPLAIN');
      })
      .join('\n');
    
    // 按分号分割，但保留多行语句
    const statements = cleanedSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && s.toUpperCase().startsWith('ALTER'));
    
    console.log(`[Migration] 找到 ${statements.length} 条 SQL 语句\n`);
    
    // 执行每条 SQL 语句
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.length === 0) {
        continue;
      }
      
      try {
        console.log(`[Migration] 执行语句 ${i + 1}/${statements.length}...`);
        console.log(`  SQL: ${statement.substring(0, 100)}${statement.length > 100 ? '...' : ''}`);
        
        // 使用 query 而不是 execute，因为有些语句可能包含特殊语法
        await pool.query(statement + ';');
        console.log(`  ✅ 语句 ${i + 1} 执行成功\n`);
      } catch (error: any) {
        // 如果是表已存在的错误或索引已存在的错误，可以忽略
        if (error.message?.includes('already exists') ||
            error.message?.includes('Duplicate key name') ||
            error.message?.includes('check that column/key exists') ||
            error.code === 'ER_TABLE_EXISTS_ERROR' ||
            error.code === 'ER_DUP_ENTRY' ||
            error.code === 'ER_DUP_KEYNAME' ||
            error.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
          console.log(`  ⚠️  语句 ${i + 1} 跳过（已存在或不存在）\n`);
        } else {
          console.error(`  ❌ 语句 ${i + 1} 执行失败:`, error.message);
          console.error(`  SQL:`, statement.substring(0, 200));
          throw error;
        }
      }
    }
    
    // 验证表结构
    console.log('[Migration] 验证表结构...\n');
    const [verificationColumns]: any = await pool.execute(
      `SELECT COLUMN_NAME, COLUMN_TYPE, CHARACTER_MAXIMUM_LENGTH, COLUMN_COMMENT
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'verification_codes' AND COLUMN_NAME = 'phone'`,
      [database]
    );
    
    if (verificationColumns.length > 0) {
      const col = verificationColumns[0];
      console.log('📊 verification_codes.phone:');
      console.log(`  - 类型: ${col.COLUMN_TYPE}`);
      console.log(`  - 长度: ${col.CHARACTER_MAXIMUM_LENGTH}`);
      console.log(`  - 注释: ${col.COLUMN_COMMENT || 'N/A'}`);
      
      if (col.COLUMN_TYPE.includes('varchar(32)')) {
        console.log('  ✅ 字段已扩展为 VARCHAR(32)');
      } else {
        console.log('  ⚠️  字段类型不符合预期');
      }
    }
    
    const [userColumns]: any = await pool.execute(
      `SELECT COLUMN_NAME, COLUMN_TYPE, CHARACTER_MAXIMUM_LENGTH, COLUMN_COMMENT
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'phone'`,
      [database]
    );
    
    if (userColumns.length > 0) {
      const col = userColumns[0];
      console.log('\n📊 users.phone:');
      console.log(`  - 类型: ${col.COLUMN_TYPE}`);
      console.log(`  - 长度: ${col.CHARACTER_MAXIMUM_LENGTH}`);
      console.log(`  - 注释: ${col.COLUMN_COMMENT || 'N/A'}`);
      
      if (col.COLUMN_TYPE.includes('varchar(32)')) {
        console.log('  ✅ 字段已扩展为 VARCHAR(32)');
      } else {
        console.log('  ⚠️  字段类型不符合预期');
      }
    }
    
    await closeConnection();
    console.log('\n✅ Migration 008 执行完成！');
  } catch (error) {
    console.error('❌ Migration 008 执行失败:', error);
    await closeConnection();
    process.exit(1);
  }
}

runMigration();

