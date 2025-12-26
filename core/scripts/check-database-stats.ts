/**
 * 数据库统计信息查询脚本
 * 查询数据库的数据量、数据大小、索引大小等信息
 */

import { createConnection, closeConnection } from '../src/database/connection';
import * as dotenv from 'dotenv';
import * as path from 'path';

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '../.env') });

interface TableStats {
  tableName: string;
  rowCount: number;
  dataSize: number; // 字节
  indexSize: number; // 字节
  totalSize: number; // 字节
  engine: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

async function getDatabaseStats() {
  try {
    console.log('📊 正在连接数据库...\n');
    
    const pool = await createConnection();
    const connection = await pool.getConnection();

    const dbName = process.env.XIAOPEI_MYSQL_DATABASE || 'xiaopei';
    
    // 查询所有表的基本信息和大小
    const [tables] = await connection.execute<any[]>(`
      SELECT 
        TABLE_NAME as tableName,
        TABLE_ROWS as rowCount,
        DATA_LENGTH as dataSize,
        INDEX_LENGTH as indexSize,
        (DATA_LENGTH + INDEX_LENGTH) as totalSize,
        ENGINE as engine
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = ?
        AND TABLE_TYPE = 'BASE TABLE'
      ORDER BY (DATA_LENGTH + INDEX_LENGTH) DESC
    `, [dbName]);

    if (tables.length === 0) {
      console.log('❌ 未找到任何表');
      connection.release();
      await closeConnection();
      return;
    }

    // 计算总计
    let totalRows = 0;
    let totalDataSize = 0;
    let totalIndexSize = 0;
    let totalSize = 0;

    const stats: TableStats[] = tables.map((table: any) => {
      const rowCount = Number(table.rowCount) || 0;
      const dataSize = Number(table.dataSize) || 0;
      const indexSize = Number(table.indexSize) || 0;
      const totalTableSize = dataSize + indexSize;

      totalRows += rowCount;
      totalDataSize += dataSize;
      totalIndexSize += indexSize;
      totalSize += totalTableSize;

      return {
        tableName: table.tableName,
        rowCount,
        dataSize,
        indexSize,
        totalSize: totalTableSize,
        engine: table.engine || 'Unknown',
      };
    });

    // 查询数据库总大小
    const [dbSize] = await connection.execute<any[]>(`
      SELECT 
        SUM(DATA_LENGTH + INDEX_LENGTH) as totalSize
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = ?
    `, [dbName]);

    const databaseTotalSize = Number(dbSize[0]?.totalSize) || 0;

    connection.release();

    // 输出结果
    console.log('='.repeat(80));
    console.log(`📊 数据库统计信息: ${dbName}`);
    console.log('='.repeat(80));
    console.log('');

    // 表级别统计
    console.log('📋 表级别统计:');
    console.log('-'.repeat(80));
    console.log(
      `${'表名'.padEnd(30)} ${'行数'.padStart(12)} ${'数据大小'.padStart(12)} ${'索引大小'.padStart(12)} ${'总大小'.padStart(12)} ${'引擎'.padStart(10)}`
    );
    console.log('-'.repeat(80));

    stats.forEach((stat) => {
      console.log(
        `${stat.tableName.padEnd(30)} ` +
        `${stat.rowCount.toLocaleString().padStart(12)} ` +
        `${formatBytes(stat.dataSize).padStart(12)} ` +
        `${formatBytes(stat.indexSize).padStart(12)} ` +
        `${formatBytes(stat.totalSize).padStart(12)} ` +
        `${stat.engine.padStart(10)}`
      );
    });

    console.log('-'.repeat(80));
    console.log('');

    // 汇总统计
    console.log('📈 汇总统计:');
    console.log('-'.repeat(80));
    console.log(`总表数:        ${stats.length}`);
    console.log(`总行数:        ${totalRows.toLocaleString()}`);
    console.log(`总数据大小:    ${formatBytes(totalDataSize)}`);
    console.log(`总索引大小:    ${formatBytes(totalIndexSize)}`);
    console.log(`总大小:        ${formatBytes(totalSize)}`);
    console.log(`数据库总大小:  ${formatBytes(databaseTotalSize)}`);
    console.log('-'.repeat(80));
    console.log('');

    // 百分比分析
    if (totalSize > 0) {
      console.log('📊 大小占比分析:');
      console.log('-'.repeat(80));
      const dataPercent = ((totalDataSize / totalSize) * 100).toFixed(2);
      const indexPercent = ((totalIndexSize / totalSize) * 100).toFixed(2);
      console.log(`数据占比:      ${dataPercent}%`);
      console.log(`索引占比:      ${indexPercent}%`);
      console.log('-'.repeat(80));
      console.log('');
    }

    // 前5大表
    console.log('🔝 前5大表（按总大小）:');
    console.log('-'.repeat(80));
    stats.slice(0, 5).forEach((stat, index) => {
      const percent = ((stat.totalSize / totalSize) * 100).toFixed(2);
      console.log(
        `${index + 1}. ${stat.tableName.padEnd(28)} ` +
        `${formatBytes(stat.totalSize).padStart(12)} ` +
        `(${percent}%) ` +
        `${stat.rowCount.toLocaleString()} 行`
      );
    });
    console.log('-'.repeat(80));
    console.log('');

    await closeConnection();
    console.log('✅ 查询完成');

  } catch (error) {
    console.error('❌ 查询失败:', error);
    process.exit(1);
  }
}

// 执行查询
getDatabaseStats();

