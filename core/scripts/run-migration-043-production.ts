/**
 * 在生产环境执行 Migration 043：添加缺失的数据库字段
 * 
 * 使用方法：
 * 1. 设置生产环境变量（从 Cloud Run Secrets 获取）
 * 2. 运行: npx ts-node scripts/run-migration-043-production.ts
 * 
 * 或者通过 Cloud Run Job 执行
 */

import mysql from 'mysql2/promise';
import * as fs from 'fs';
import * as path from 'path';

async function runMigration() {
  // 从环境变量读取配置（生产环境）
  const mysqlHost = process.env.XIAOPEI_MYSQL_HOST || '';
  const mysqlUser = process.env.XIAOPEI_MYSQL_USER || '';
  const mysqlPassword = process.env.XIAOPEI_MYSQL_PASSWORD || '';
  const mysqlDatabase = process.env.XIAOPEI_MYSQL_DATABASE || 'xiaopei';
  
  if (!mysqlHost || !mysqlUser || !mysqlPassword) {
    console.error('❌ 缺少必要的环境变量:');
    console.error('  - XIAOPEI_MYSQL_HOST:', mysqlHost ? '已设置' : '❌ 未设置');
    console.error('  - XIAOPEI_MYSQL_USER:', mysqlUser ? '已设置' : '❌ 未设置');
    console.error('  - XIAOPEI_MYSQL_PASSWORD:', mysqlPassword ? '已设置' : '❌ 未设置');
    console.error('  - XIAOPEI_MYSQL_DATABASE:', mysqlDatabase);
    process.exit(1);
  }
  
  const isUnixSocket = mysqlHost.startsWith('/');
  
  console.log('[Migration 043 Production] 开始执行...');
  console.log(`  数据库: ${mysqlDatabase}`);
  console.log(`  连接方式: ${isUnixSocket ? 'Unix Socket' : 'TCP/IP'}`);
  console.log(`  主机: ${mysqlHost}`);
  console.log(`  用户: ${mysqlUser}\n`);
  
  // 创建连接
  const connection = await mysql.createConnection({
    ...(isUnixSocket
      ? { socketPath: mysqlHost }
      : {
          host: mysqlHost,
          port: parseInt(process.env.XIAOPEI_MYSQL_PORT || '3306'),
        }
    ),
    user: mysqlUser,
    password: mysqlPassword,
    database: mysqlDatabase,
    multipleStatements: true,
  });

  try {
    // 读取迁移文件
    const migrationPath = path.join(__dirname, '../src/database/migrations/043_add_missing_fields.sql');
    const sql = fs.readFileSync(migrationPath, 'utf-8');
    
    // 分割 SQL 语句
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
    
    console.log(`[Migration 043 Production] 找到 ${statements.length} 条 SQL 语句\n`);
    
    // 执行每条 SQL
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.length === 0) continue;
      
      try {
        console.log(`[Migration 043 Production] 执行语句 ${i + 1}/${statements.length}...`);
        await connection.execute(statement);
        console.log(`[Migration 043 Production] ✅ 语句 ${i + 1} 执行成功`);
      } catch (error: any) {
        // 如果是字段已存在的错误，可以忽略
        if (error.code === 'ER_DUP_FIELDNAME' || 
            error.message?.includes('Duplicate column name') ||
            error.message?.includes('Duplicate key name')) {
          console.log(`[Migration 043 Production] ⚠️ 语句 ${i + 1} 字段/索引已存在，跳过: ${error.message}`);
        } else {
          console.error(`[Migration 043 Production] ❌ 语句 ${i + 1} 执行失败:`, error.message);
          throw error;
        }
      }
    }
    
    console.log('\n[Migration 043 Production] ✅ 迁移完成！');
    
  } catch (error) {
    console.error('[Migration 043 Production] ❌ 迁移失败:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

// 执行迁移
runMigration()
  .then(() => {
    console.log('[Migration 043 Production] 脚本执行完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('[Migration 043 Production] 脚本执行失败:', error);
    process.exit(1);
  });

