/**
 * 比对生产环境和开发环境的表结构
 * 通过 Migration API 查询生产环境，本地查询开发环境
 */

import { createConnection } from '../src/database/connection';
import axios from 'axios';
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
}

async function getDevSchema(): Promise<Map<string, TableSchema>> {
  const pool = await createConnection();
  const [tables]: any = await pool.query('SHOW TABLES');
  const tableKey = Object.keys(tables[0])[0];
  const tableNames = tables.map((row: any) => row[tableKey]);
  
  const schemas: Map<string, TableSchema> = new Map();
  for (const tableName of tableNames) {
    const [columns]: any = await pool.query(`DESCRIBE ${tableName}`);
    schemas.set(tableName, {
      tableName,
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
  
  await pool.end();
  return schemas;
}

async function getProdSchema(): Promise<Map<string, TableSchema> | null> {
  try {
    // 尝试通过 Migration API
    const response = await axios.get('https://xiaopei-core-343578696044.asia-east2.run.app/api/admin/v1/migration/schema', {
      timeout: 10000,
    });
    
    if (!response.data.success) {
      console.error('❌ 生产环境查询失败:', response.data.error);
      return null;
    }
    
    const schemas: Map<string, TableSchema> = new Map();
    for (const [tableName, schemaData] of Object.entries(response.data.data.schemas as any)) {
      schemas.set(tableName, {
        tableName,
        columns: (schemaData as any).columns,
      });
    }
    
    return schemas;
  } catch (error: any) {
    console.error('❌ 无法获取生产环境表结构:', error.message);
    return null;
  }
}

async function compareSchemas() {
  console.log('🔍 比对开发和生产环境表结构...\n');
  
  const devSchemas = await getDevSchema();
  console.log(`✅ 开发环境: ${devSchemas.size} 张表\n`);
  
  const prodSchemas = await getProdSchema();
  if (!prodSchemas) {
    console.log('⚠️  无法获取生产环境表结构\n');
    console.log('📋 开发环境表列表:');
    Array.from(devSchemas.keys()).forEach((table, index) => {
      const schema = devSchemas.get(table)!;
      console.log(`${index + 1}. ${table} (${schema.columns.length} 列)`);
    });
    return;
  }
  
  console.log(`✅ 生产环境: ${prodSchemas.size} 张表\n`);
  
  // 比对
  const allTables = new Set([...devSchemas.keys(), ...prodSchemas.keys()]);
  const missingInProd: string[] = [];
  const missingInDev: string[] = [];
  const columnDifferences: string[] = [];
  
  for (const tableName of allTables) {
    const devSchema = devSchemas.get(tableName);
    const prodSchema = prodSchemas.get(tableName);
    
    if (!devSchema && prodSchema) {
      missingInDev.push(tableName);
      continue;
    }
    
    if (devSchema && !prodSchema) {
      missingInProd.push(tableName);
      continue;
    }
    
    if (!devSchema || !prodSchema) continue;
    
    // 比对列
    const devColumns = new Map(devSchema.columns.map(c => [c.field, c]));
    const prodColumns = new Map(prodSchema.columns.map(c => [c.field, c]));
    
    const allColumns = new Set([...devColumns.keys(), ...prodColumns.keys()]);
    
    for (const column of allColumns) {
      const devCol = devColumns.get(column);
      const prodCol = prodColumns.get(column);
      
      if (!devCol && prodCol) {
        columnDifferences.push(`  表 "${tableName}" 的列 "${column}" 在生产环境存在，但开发环境不存在`);
      } else if (devCol && !prodCol) {
        columnDifferences.push(`  表 "${tableName}" 的列 "${column}" 在开发环境存在，但生产环境不存在`);
      } else if (devCol && prodCol) {
        if (devCol.type !== prodCol.type) {
          columnDifferences.push(`  表 "${tableName}" 的列 "${column}" 类型不一致: 开发=${devCol.type}, 生产=${prodCol.type}`);
        }
        if (devCol.null !== prodCol.null) {
          columnDifferences.push(`  表 "${tableName}" 的列 "${column}" NULL 属性不一致: 开发=${devCol.null}, 生产=${prodCol.null}`);
        }
      }
    }
  }
  
  // 输出结果
  console.log('📊 比对结果:\n');
  
  if (missingInProd.length > 0) {
    console.log(`❌ 生产环境缺失的表 (${missingInProd.length} 张):`);
    missingInProd.forEach(table => console.log(`   - ${table}`));
    console.log('');
  }
  
  if (missingInDev.length > 0) {
    console.log(`❌ 开发环境缺失的表 (${missingInDev.length} 张):`);
    missingInDev.forEach(table => console.log(`   - ${table}`));
    console.log('');
  }
  
  if (columnDifferences.length > 0) {
    console.log(`⚠️  列差异 (${columnDifferences.length} 处):`);
    columnDifferences.slice(0, 20).forEach(diff => console.log(diff));
    if (columnDifferences.length > 20) {
      console.log(`   ... 还有 ${columnDifferences.length - 20} 处差异`);
    }
    console.log('');
  }
  
  if (missingInProd.length === 0 && missingInDev.length === 0 && columnDifferences.length === 0) {
    console.log('✅ 开发环境和生产环境的表结构完全一致！\n');
  }
  
  // 关键表详细比对
  const keyTables = ['llm_api_configs', 'conversations', 'users', 'shensha_readings'];
  console.log('📋 关键表详细比对:\n');
  
  for (const tableName of keyTables) {
    const devSchema = devSchemas.get(tableName);
    const prodSchema = prodSchemas.get(tableName);
    
    if (!devSchema && !prodSchema) {
      console.log(`表 ${tableName}: ❌ 两个环境都不存在\n`);
      continue;
    }
    
    if (!devSchema || !prodSchema) {
      console.log(`表 ${tableName}: ❌ 只在一个环境存在\n`);
      continue;
    }
    
    console.log(`表 ${tableName}:`);
    console.log(`  开发环境: ${devSchema.columns.length} 列`);
    console.log(`  生产环境: ${prodSchema.columns.length} 列`);
    
    if (devSchema.columns.length !== prodSchema.columns.length) {
      console.log(`  ⚠️  列数不一致！`);
    }
    
    // 比对列名
    const devCols = new Set(devSchema.columns.map(c => c.field));
    const prodCols = new Set(prodSchema.columns.map(c => c.field));
    
    const missingInProdCols = Array.from(devCols).filter(c => !prodCols.has(c));
    const missingInDevCols = Array.from(prodCols).filter(c => !devCols.has(c));
    
    if (missingInProdCols.length > 0) {
      console.log(`  生产环境缺失的列: ${missingInProdCols.join(', ')}`);
    }
    if (missingInDevCols.length > 0) {
      console.log(`  开发环境缺失的列: ${missingInDevCols.join(', ')}`);
    }
    
    console.log('');
  }
}

compareSchemas()
  .then(() => {
    console.log('✅ 比对完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 比对失败:', error);
    process.exit(1);
  });

