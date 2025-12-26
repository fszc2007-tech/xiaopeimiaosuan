/**
 * 执行 Migration 043：添加缺失的数据库字段
 * 
 * 修复内容：
 * - conversations 表：添加 source, title, last_message_at
 * - users 表：确保 pro_expires_at, pro_plan 存在
 */

import mysql from 'mysql2/promise';
import * as fs from 'fs';
import * as path from 'path';

async function runMigration() {
  // 读取环境变量
  const mysqlHost = process.env.XIAOPEI_MYSQL_HOST || 'localhost';
  const isUnixSocket = mysqlHost.startsWith('/');
  
  // 创建连接
  const connection = await mysql.createConnection({
    ...(isUnixSocket
      ? { socketPath: mysqlHost }
      : {
          host: mysqlHost,
          port: parseInt(process.env.XIAOPEI_MYSQL_PORT || '3306'),
        }
    ),
    user: process.env.XIAOPEI_MYSQL_USER || 'root',
    password: process.env.XIAOPEI_MYSQL_PASSWORD || '',
    database: process.env.XIAOPEI_MYSQL_DATABASE || 'xiaopei',
    multipleStatements: true, // 允许执行多条 SQL
  });

  try {
    console.log('[Migration 043] 开始执行...');
    
    // 读取迁移文件
    const migrationPath = path.join(__dirname, '../src/database/migrations/043_add_missing_fields.sql');
    const sql = fs.readFileSync(migrationPath, 'utf-8');
    
    // 分割 SQL 语句（按分号，但保留多行语句）
    const lines = sql.split('\n');
    const statements: string[] = [];
    let currentStatement = '';
    
    for (const line of lines) {
      const trimmed = line.trim();
      // 跳过注释和空行
      if (trimmed.startsWith('--') || trimmed.startsWith('/*') || trimmed.length === 0) {
        continue;
      }
      
      currentStatement += line + '\n';
      
      // 如果行以分号结尾，说明是一条完整的语句
      if (trimmed.endsWith(';')) {
        const stmt = currentStatement.trim();
        if (stmt.length > 0 && !stmt.startsWith('SELECT')) {
          statements.push(stmt);
        }
        currentStatement = '';
      }
    }
    
    // 处理最后一条语句（如果没有分号）
    if (currentStatement.trim().length > 0) {
      statements.push(currentStatement.trim());
    }
    
    console.log(`[Migration 043] 找到 ${statements.length} 条 SQL 语句`);
    
    // 执行每条 SQL
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.length === 0) continue;
      
      try {
        console.log(`[Migration 043] 执行语句 ${i + 1}/${statements.length}...`);
        await connection.execute(statement);
        console.log(`[Migration 043] ✅ 语句 ${i + 1} 执行成功`);
      } catch (error: any) {
        // 如果是字段已存在的错误，可以忽略
        if (error.code === 'ER_DUP_FIELDNAME' || 
            error.code === 'ER_DUP_KEYNAME' ||
            error.message?.includes('Duplicate column name') ||
            error.message?.includes('Duplicate key name') ||
            error.message?.includes('already exists')) {
          console.log(`[Migration 043] ⚠️ 语句 ${i + 1} 字段/索引已存在，跳过: ${error.message}`);
        } else {
          console.error(`[Migration 043] ❌ 语句 ${i + 1} 执行失败:`, error.message);
          throw error;
        }
      }
    }
    
    console.log('[Migration 043] ✅ 迁移完成！');
    
  } catch (error) {
    console.error('[Migration 043] ❌ 迁移失败:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

// 执行迁移
runMigration()
  .then(() => {
    console.log('[Migration 043] 脚本执行完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('[Migration 043] 脚本执行失败:', error);
    process.exit(1);
  });

