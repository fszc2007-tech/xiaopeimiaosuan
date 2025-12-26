/**
 * 通过 Cloud SQL Proxy 查询生产环境数据库表结构
 * 
 * 使用方法：
 * 1. 启动 Cloud SQL Proxy: cloud-sql-proxy xiaopei-app:asia-east2:xiaopei-db
 * 2. 运行: npx ts-node scripts/query-prod-schema.ts
 */

import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config();

async function queryProdSchema() {
  console.log('🔍 查询生产环境数据库表结构...\n');
  
  // 通过 Cloud SQL Proxy 连接（本地 3306 端口）
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'xiaopei_prod',
    password: process.env.XIAOPEI_MYSQL_PASSWORD || '',
    database: 'xiaopei',
  });
  
  try {
    console.log('✅ 连接成功\n');
    
    // 1. 获取所有表
    const [tables]: any = await connection.query('SHOW TABLES');
    const tableKey = Object.keys(tables[0])[0];
    const tableNames = tables.map((row: any) => row[tableKey]);
    
    console.log(`📋 表数量: ${tableNames.length}`);
    console.log(`   表列表: ${tableNames.join(', ')}\n`);
    
    // 2. 检查关键表的结构
    const keyTables = ['llm_api_configs', 'conversations', 'users', 'messages'];
    
    for (const tableName of keyTables) {
      if (!tableNames.includes(tableName)) {
        console.log(`❌ 表 "${tableName}" 不存在\n`);
        continue;
      }
      
      console.log(`📊 表 "${tableName}" 结构:`);
      const [columns]: any = await connection.query(`DESCRIBE ${tableName}`);
      console.log(`   列数: ${columns.length}`);
      columns.forEach((col: any) => {
        console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Key ? `[${col.Key}]` : ''} ${col.Default !== null ? `DEFAULT ${col.Default}` : ''}`);
      });
      console.log('');
    }
    
    // 3. 检查 llm_api_configs 数据
    console.log('🔑 llm_api_configs 数据:');
    const [llmRows]: any = await connection.query(`
      SELECT 
        model,
        api_url,
        is_enabled,
        api_key_encrypted IS NOT NULL as has_api_key,
        LENGTH(api_key_encrypted) as key_length
      FROM llm_api_configs
      ORDER BY model
    `);
    
    if (llmRows.length === 0) {
      console.log('   ❌ 没有数据');
    } else {
      llmRows.forEach((row: any) => {
        console.log(`   ${row.model}: enabled=${row.is_enabled}, has_key=${row.has_api_key}, key_length=${row.key_length || 0}`);
      });
    }
    console.log('');
    
  } catch (error: any) {
    console.error('❌ 查询失败:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 请先启动 Cloud SQL Proxy:');
      console.error('   cloud-sql-proxy xiaopei-app:asia-east2:xiaopei-db');
    }
    throw error;
  } finally {
    await connection.end();
  }
}

queryProdSchema()
  .then(() => {
    console.log('✅ 查询完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 查询失败:', error);
    process.exit(1);
  });

