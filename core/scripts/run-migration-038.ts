/**
 * 执行迁移 038: 创建聊天消息反馈表
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { createConnection, closeConnection } from '../src/database/connection';

// 加载环境变量
dotenv.config();

async function runMigration() {
  console.log('[Migration] 开始执行迁移 038_create_chat_message_feedback.sql...');
  
  try {
    // 连接数据库
    const pool = await createConnection();
    console.log('[Migration] 数据库连接成功');
    
    // 读取 SQL 文件
    const sqlPath = path.join(__dirname, '../src/database/migrations/038_create_chat_message_feedback.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    
    // 移除注释和空行，然后按分号分割
    const cleanedSql = sql
      .replace(/--.*$/gm, '') // 移除单行注释
      .replace(/\/\*[\s\S]*?\*\//g, '') // 移除多行注释
      .trim();
    
    // 按分号分割，但保留 CREATE TABLE 等完整语句
    const statements = cleanedSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    console.log(`[Migration] 找到 ${statements.length} 条 SQL 语句`);
    
    // 执行每条 SQL 语句
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (statement.length === 0) {
        continue;
      }
      
      try {
        console.log(`[Migration] 执行语句 ${i + 1}/${statements.length}...`);
        // 使用 query 而不是 execute，因为有些语句可能包含特殊语法
        await pool.query(statement + ';');
        console.log(`[Migration] ✓ 语句 ${i + 1} 执行成功`);
      } catch (error: any) {
        // 如果是表已存在的错误，可以忽略
        if (
          error.message?.includes('already exists') || 
          error.code === 'ER_TABLE_EXISTS_ERROR' ||
          error.code === 'ER_DUP_ENTRY'
        ) {
          console.log(`[Migration] ⚠ 语句 ${i + 1} 跳过（已存在）`);
        } else {
          console.error(`[Migration] ✗ 语句 ${i + 1} 执行失败:`, error.message);
          console.error(`[Migration] SQL:`, statement.substring(0, 200));
          throw error;
        }
      }
    }
    
    // 验证表是否创建成功
    console.log('[Migration] 验证表结构...');
    const [tables]: any = await pool.execute(
      `SELECT TABLE_NAME 
       FROM information_schema.TABLES 
       WHERE TABLE_SCHEMA = ? 
       AND TABLE_NAME = 'chat_message_feedback'`,
      [process.env.XIAOPEI_MYSQL_DATABASE || 'xiaopei']
    );
    
    if (tables.length > 0) {
      console.log(`[Migration] ✅ 表 chat_message_feedback 创建成功！`);
    } else {
      console.warn(`[Migration] ⚠ 表 chat_message_feedback 未找到`);
    }
    
    console.log('[Migration] ✅ 迁移执行成功！');
    
    // 关闭连接
    await closeConnection();
  } catch (error: any) {
    console.error('[Migration] ❌ 迁移执行失败:', error);
    process.exit(1);
  }
}

// 执行迁移
runMigration();


