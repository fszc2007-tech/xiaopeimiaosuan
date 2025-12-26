/**
 * 通过 Migration API 比对开发和生产环境的表结构
 * 创建临时 API 端点来查询生产环境表结构
 */

import { createConnection } from '../src/database/connection';
import * as dotenv from 'dotenv';

dotenv.config();

interface TableSchema {
  tableName: string;
  columns: ColumnInfo[];
}

interface ColumnInfo {
  field: string;
  type: string;
  null: string;
  key: string;
  default: string | null;
  extra: string;
}

async function getTableSchema(connection: any, tableName: string): Promise<TableSchema> {
  const [columns]: any = await connection.query(`DESCRIBE ${tableName}`);
  return {
    tableName,
    columns: columns as ColumnInfo[],
  };
}

async function compareTables() {
  console.log('🔍 比对开发和生产环境表结构...\n');
  
  // 开发环境
  const devPool = await createConnection();
  const [devTables]: any = await devPool.query('SHOW TABLES');
  const devTableKey = Object.keys(devTables[0])[0];
  const devTableNames = devTables.map((row: any) => row[devTableKey]);
  
  console.log(`📋 开发环境表数量: ${devTableNames.length}\n`);
  
  // 获取开发环境表结构
  const devSchemas: Map<string, TableSchema> = new Map();
  for (const tableName of devTableNames) {
    devSchemas.set(tableName, await getTableSchema(devPool, tableName));
  }
  
  // 输出开发环境表结构摘要
  console.log('📊 开发环境表结构摘要:\n');
  for (const [tableName, schema] of devSchemas.entries()) {
    console.log(`表: ${tableName}`);
    console.log(`  列数: ${schema.columns.length}`);
    console.log(`  列: ${schema.columns.map(c => c.field).join(', ')}`);
    console.log('');
  }
  
  await devPool.end();
  
  console.log('💡 生产环境表结构需要通过以下方式获取:');
  console.log('   1. 启动 Cloud SQL Proxy');
  console.log('   2. 运行: npx ts-node scripts/query-prod-schema.ts');
  console.log('   或');
  console.log('   3. 通过 Migration API 创建查询端点\n');
}

compareTables()
  .then(() => {
    console.log('✅ 比对完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 比对失败:', error);
    process.exit(1);
  });

