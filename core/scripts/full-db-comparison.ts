/**
 * 完整的数据库表结构比对报告
 * 
 * 比对开发环境和生产环境的表结构差异
 */

import { createConnection } from '../src/database/connection';
import * as dotenv from 'dotenv';

dotenv.config();

interface ColumnInfo {
  field: string;
  type: string;
  null: string;
  key: string;
  default: string | null;
  extra: string;
}

interface TableSchema {
  tableName: string;
  columns: ColumnInfo[];
  indexes: any[];
}

async function getTableSchema(pool: any, tableName: string): Promise<TableSchema> {
  const [columns]: any = await pool.query(`DESCRIBE ${tableName}`);
  const [indexes]: any = await pool.query(`SHOW INDEXES FROM ${tableName}`);
  
  return {
    tableName,
    columns: columns.map((col: any) => ({
      field: col.Field,
      type: col.Type,
      null: col.Null,
      key: col.Key,
      default: col.Default,
      extra: col.Extra,
    })),
    indexes: indexes,
  };
}

async function generateFullReport() {
  console.log('🔍 生成完整的数据库表结构比对报告...\n');
  
  // 开发环境
  const devPool = await createConnection();
  const [devTables]: any = await devPool.query('SHOW TABLES');
  const devTableKey = Object.keys(devTables[0])[0];
  const devTableNames = devTables.map((row: any) => row[devTableKey]);
  
  console.log(`📋 开发环境: ${devTableNames.length} 张表\n`);
  
  const devSchemas: Map<string, TableSchema> = new Map();
  for (const tableName of devTableNames) {
    devSchemas.set(tableName, await getTableSchema(devPool, tableName));
  }
  
  await devPool.end();
  
  // 输出详细报告
  console.log('📊 开发环境表结构详情:\n');
  
  const keyTables = ['llm_api_configs', 'conversations', 'users', 'messages', 'verification_codes'];
  
  for (const tableName of keyTables) {
    const schema = devSchemas.get(tableName);
    if (!schema) {
      console.log(`❌ 表 "${tableName}" 不存在\n`);
      continue;
    }
    
    console.log(`表: ${tableName}`);
    console.log(`  列数: ${schema.columns.length}`);
    console.log(`  索引数: ${schema.indexes.length}`);
    console.log(`  列详情:`);
    schema.columns.forEach(col => {
      const nullable = col.null === 'YES' ? 'NULL' : 'NOT NULL';
      const defaultVal = col.default !== null ? ` DEFAULT ${col.default}` : '';
      const key = col.key ? ` [${col.key}]` : '';
      console.log(`    - ${col.field}: ${col.type} ${nullable}${defaultVal}${key}`);
    });
    console.log('');
  }
  
  // 所有表列表
  console.log('📋 所有表列表:\n');
  devTableNames.forEach((table, index) => {
    const schema = devSchemas.get(table);
    console.log(`${index + 1}. ${table} (${schema?.columns.length || 0} 列)`);
  });
  console.log('');
  
  // 检查 llm_api_configs 表结构
  console.log('🔑 llm_api_configs 表结构检查:\n');
  const llmSchema = devSchemas.get('llm_api_configs');
  if (llmSchema) {
    console.log('开发环境列:');
    llmSchema.columns.forEach(col => {
      console.log(`  ${col.field}: ${col.type} ${col.null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
  }
  
  console.log('\n💡 生产环境表结构需要通过以下方式获取:');
  console.log('   1. 通过 Cloud SQL Proxy 连接');
  console.log('   2. 或通过 Migration API 查询');
  console.log('   3. 或查看 Cloud Logging 中的表结构信息\n');
  
  // 检查是否有重复表名
  const duplicateTables = devTableNames.filter((table, index) => devTableNames.indexOf(table) !== index);
  if (duplicateTables.length > 0) {
    console.log('⚠️  发现重复表名:', duplicateTables.join(', '));
  }
  
  // 检查 llm_api_config 和 llm_api_configs
  if (devTableNames.includes('llm_api_config') && devTableNames.includes('llm_api_configs')) {
    console.log('\n⚠️  发现两个 LLM 配置表: llm_api_config 和 llm_api_configs');
    console.log('   建议检查是否需要合并或删除其中一个\n');
  }
}

generateFullReport()
  .then(() => {
    console.log('✅ 报告生成完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 报告生成失败:', error);
    process.exit(1);
  });

