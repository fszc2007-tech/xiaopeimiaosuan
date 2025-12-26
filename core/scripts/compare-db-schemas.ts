/**
 * 比对开发环境和生产环境的数据库表结构
 */

import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config();

interface TableInfo {
  tableName: string;
  columns: ColumnInfo[];
  indexes: IndexInfo[];
}

interface ColumnInfo {
  field: string;
  type: string;
  null: string;
  key: string;
  default: string | null;
  extra: string;
}

interface IndexInfo {
  table: string;
  non_unique: number;
  key_name: string;
  seq_in_index: number;
  column_name: string;
}

async function getTableStructure(connection: mysql.Connection, tableName: string): Promise<TableInfo> {
  const [columns]: any = await connection.query(`SHOW COLUMNS FROM ${tableName}`);
  const [indexes]: any = await connection.query(`SHOW INDEXES FROM ${tableName}`);
  
  return {
    tableName,
    columns: columns as ColumnInfo[],
    indexes: indexes as IndexInfo[],
  };
}

async function getAllTables(connection: mysql.Connection): Promise<string[]> {
  const [rows]: any = await connection.query('SHOW TABLES');
  const tableKey = Object.keys(rows[0])[0];
  return rows.map((row: any) => row[tableKey]);
}

async function compareSchemas() {
  console.log('🔍 开始比对数据库表结构...\n');
  
  // 开发环境连接
  const devHost = process.env.XIAOPEI_MYSQL_HOST || 'localhost';
  const devIsUnixSocket = devHost.startsWith('/');
  
  const devConnection = await mysql.createConnection({
    ...(devIsUnixSocket
      ? { socketPath: devHost }
      : {
          host: devHost,
          port: parseInt(process.env.XIAOPEI_MYSQL_PORT || '3306'),
        }
    ),
    user: process.env.XIAOPEI_MYSQL_USER || 'root',
    password: process.env.XIAOPEI_MYSQL_PASSWORD || '',
    database: process.env.XIAOPEI_MYSQL_DATABASE || 'xiaopei',
  });
  
  console.log('✅ 开发环境连接成功');
  console.log(`   数据库: ${process.env.XIAOPEI_MYSQL_DATABASE || 'xiaopei'}`);
  console.log(`   主机: ${devHost}\n`);
  
  // 生产环境连接（需要从 Cloud SQL 获取）
  const prodHost = '/cloudsql/xiaopei-app:asia-east2:xiaopei-db';
  const prodUser = 'xiaopei_prod';
  const prodPassword = process.env.XIAOPEI_MYSQL_PASSWORD || '';
  const prodDatabase = 'xiaopei';
  
  console.log('⚠️  生产环境需要通过 Cloud SQL Proxy 连接');
  console.log('   请确保已启动 Cloud SQL Proxy:');
  console.log('   cloud-sql-proxy xiaopei-app:asia-east2:xiaopei-db\n');
  
  // 获取开发环境表列表
  const devTables = await getAllTables(devConnection);
  console.log(`📋 开发环境表数量: ${devTables.length}`);
  console.log(`   表列表: ${devTables.join(', ')}\n`);
  
  // 获取开发环境表结构
  const devSchemas: Map<string, TableInfo> = new Map();
  for (const table of devTables) {
    devSchemas.set(table, await getTableStructure(devConnection, table));
  }
  
  // 尝试连接生产环境
  let prodSchemas: Map<string, TableInfo> = new Map();
  let prodTables: string[] = [];
  
  try {
    // 尝试通过本地端口连接（如果 Cloud SQL Proxy 在运行）
    const prodConnection = await mysql.createConnection({
      host: '127.0.0.1',
      port: 3306,
      user: prodUser,
      password: prodPassword,
      database: prodDatabase,
    });
    
    console.log('✅ 生产环境连接成功（通过 Cloud SQL Proxy）\n');
    
    prodTables = await getAllTables(prodConnection);
    console.log(`📋 生产环境表数量: ${prodTables.length}`);
    console.log(`   表列表: ${prodTables.join(', ')}\n`);
    
    for (const table of prodTables) {
      prodSchemas.set(table, await getTableStructure(prodConnection, table));
    }
    
    await prodConnection.end();
  } catch (error: any) {
    console.log('❌ 无法连接生产环境（Cloud SQL Proxy 可能未启动）');
    console.log(`   错误: ${error.message}\n`);
    console.log('📝 将只显示开发环境的表结构\n');
  }
  
  // 比对表
  console.log('🔍 开始比对...\n');
  
  const allTables = new Set([...devTables, ...prodTables]);
  const differences: string[] = [];
  
  for (const table of allTables) {
    const devSchema = devSchemas.get(table);
    const prodSchema = prodSchemas.get(table);
    
    if (!devSchema && prodSchema) {
      differences.push(`❌ 表 "${table}" 在生产环境存在，但开发环境不存在`);
      continue;
    }
    
    if (devSchema && !prodSchema) {
      differences.push(`❌ 表 "${table}" 在开发环境存在，但生产环境不存在`);
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
        differences.push(`  ⚠️  表 "${table}" 的列 "${column}" 在生产环境存在，但开发环境不存在`);
      } else if (devCol && !prodCol) {
        differences.push(`  ⚠️  表 "${table}" 的列 "${column}" 在开发环境存在，但生产环境不存在`);
      } else if (devCol && prodCol) {
        // 比对列属性
        if (devCol.type !== prodCol.type) {
          differences.push(`  ⚠️  表 "${table}" 的列 "${column}" 类型不一致: 开发=${devCol.type}, 生产=${prodCol.type}`);
        }
        if (devCol.null !== prodCol.null) {
          differences.push(`  ⚠️  表 "${table}" 的列 "${column}" NULL 属性不一致: 开发=${devCol.null}, 生产=${prodCol.null}`);
        }
        if (devCol.default !== prodCol.default) {
          differences.push(`  ⚠️  表 "${table}" 的列 "${column}" 默认值不一致: 开发=${devCol.default}, 生产=${prodCol.default}`);
        }
      }
    }
    
    // 比对索引
    const devIndexes = new Map(devSchema.indexes.map(i => [`${i.key_name}:${i.column_name}`, i]));
    const prodIndexes = new Map(prodSchema.indexes.map(i => [`${i.key_name}:${i.column_name}`, i]));
    
    const allIndexes = new Set([...devIndexes.keys(), ...prodIndexes.keys()]);
    
    for (const indexKey of allIndexes) {
      const devIdx = devIndexes.get(indexKey);
      const prodIdx = prodIndexes.get(indexKey);
      
      if (!devIdx && prodIdx) {
        differences.push(`  ⚠️  表 "${table}" 的索引 "${indexKey}" 在生产环境存在，但开发环境不存在`);
      } else if (devIdx && !prodIdx) {
        differences.push(`  ⚠️  表 "${table}" 的索引 "${indexKey}" 在开发环境存在，但生产环境不存在`);
      }
    }
  }
  
  await devConnection.end();
  
  // 输出结果
  console.log('📊 比对结果:\n');
  
  if (differences.length === 0) {
    console.log('✅ 开发环境和生产环境的表结构完全一致！\n');
  } else {
    console.log(`❌ 发现 ${differences.length} 处不一致:\n`);
    differences.forEach((diff, index) => {
      console.log(`${index + 1}. ${diff}`);
    });
    console.log('');
  }
  
  // 输出详细表结构（仅开发环境）
  console.log('📋 开发环境表结构详情:\n');
  for (const [tableName, schema] of devSchemas.entries()) {
    console.log(`表: ${tableName}`);
    console.log(`  列数: ${schema.columns.length}`);
    console.log(`  索引数: ${schema.indexes.length}`);
    console.log(`  列列表: ${schema.columns.map(c => c.field).join(', ')}`);
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

