/**
 * 修复开发和生产环境表结构差异
 */

import { createConnection } from '../src/database/connection';
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

async function fixTableDifferences() {
  console.log('🔍 分析表结构差异并生成修复脚本...\n');
  
  // 获取生产环境表结构
  let prodSchemas: Map<string, any> = new Map();
  try {
    const response = await axios.get('https://xiaopei-core-343578696044.asia-east2.run.app/api/admin/v1/migration/schema', {
      timeout: 10000,
    });
    
    if (response.data.success) {
      for (const [tableName, schemaData] of Object.entries(response.data.data.schemas as any)) {
        prodSchemas.set(tableName, {
          columns: (schemaData as any).columns,
        });
      }
      console.log(`✅ 获取生产环境表结构: ${prodSchemas.size} 张表\n`);
    }
  } catch (error: any) {
    console.error('❌ 无法获取生产环境表结构:', error.message);
    return;
  }
  
  // 获取开发环境表结构
  const devPool = await createConnection();
  const [devTables]: any = await devPool.query('SHOW TABLES');
  const devTableKey = Object.keys(devTables[0])[0];
  const devTableNames = devTables.map((row: any) => row[devTableKey]);
  
  const devSchemas: Map<string, any> = new Map();
  for (const tableName of devTableNames) {
    const [columns]: any = await devPool.query(`DESCRIBE ${tableName}`);
    devSchemas.set(tableName, {
      columns: columns.map((col: any) => ({
        field: col.Field,
        type: col.Type,
        null: col.Null,
        key: col.Key,
        default: col.Default,
        extra: col.Extra,
      })),
    });
  }
  
  await devPool.end();
  
  console.log(`✅ 获取开发环境表结构: ${devSchemas.size} 张表\n`);
  
  // 生成修复 SQL
  const sqlStatements: string[] = [];
  
  // 1. 修复 conversations 表
  const devConv = devSchemas.get('conversations');
  const prodConv = prodSchemas.get('conversations');
  if (devConv && prodConv) {
    const devTitle = devConv.columns.find((c: any) => c.field === 'title');
    const prodTitle = prodConv.columns.find((c: any) => c.field === 'title');
    if (devTitle && prodTitle && devTitle.type !== prodTitle.type) {
      sqlStatements.push(`ALTER TABLE conversations MODIFY COLUMN title ${devTitle.type} ${devTitle.null === 'YES' ? 'NULL' : 'NOT NULL'};`);
    }
    
    const devSource = devConv.columns.find((c: any) => c.field === 'source');
    const prodSource = prodConv.columns.find((c: any) => c.field === 'source');
    if (devSource && prodSource && devSource.type !== prodSource.type) {
      sqlStatements.push(`ALTER TABLE conversations MODIFY COLUMN source ${devSource.type} ${devSource.null === 'YES' ? 'NULL' : 'NOT NULL'};`);
    }
  }
  
  // 2. 修复 users 表（添加缺失的列）
  const devUsers = devSchemas.get('users');
  const prodUsers = prodSchemas.get('users');
  if (devUsers && prodUsers) {
    const missingColumns = devUsers.columns.filter((devCol: any) => {
      return !prodUsers.columns.find((prodCol: any) => prodCol.field === devCol.field);
    });
    
    for (const col of missingColumns) {
      const nullClause = col.null === 'YES' ? 'NULL' : 'NOT NULL';
      const defaultClause = col.default !== null ? `DEFAULT ${col.default}` : '';
      sqlStatements.push(`ALTER TABLE users ADD COLUMN ${col.field} ${col.type} ${nullClause} ${defaultClause};`);
    }
  }
  
  // 3. 修复 day_stem_readings 表
  const devDayStem = devSchemas.get('day_stem_readings');
  const prodDayStem = prodSchemas.get('day_stem_readings');
  if (devDayStem && prodDayStem) {
    const devStem = devDayStem.columns.find((c: any) => c.field === 'stem');
    const prodStem = prodDayStem.columns.find((c: any) => c.field === 'stem');
    if (devStem && prodStem && devStem.type !== prodStem.type) {
      sqlStatements.push(`ALTER TABLE day_stem_readings MODIFY COLUMN stem ${devStem.type} ${devStem.null === 'YES' ? 'NULL' : 'NOT NULL'};`);
    }
  }
  
  // 输出 SQL 脚本
  if (sqlStatements.length > 0) {
    console.log('📝 生成的修复 SQL 脚本:\n');
    console.log('-- Migration: 修复开发和生产环境表结构差异');
    console.log('-- 生成时间:', new Date().toISOString());
    console.log('');
    sqlStatements.forEach((sql, index) => {
      console.log(`-- ${index + 1}. ${sql}`);
    });
    console.log('');
    console.log(`✅ 共生成 ${sqlStatements.length} 条 SQL 语句`);
  } else {
    console.log('✅ 没有需要修复的差异');
  }
}

fixTableDifferences()
  .then(() => {
    console.log('\n✅ 分析完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 分析失败:', error);
    process.exit(1);
  });

