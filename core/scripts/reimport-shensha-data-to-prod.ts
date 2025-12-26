/**
 * 重新导入神煞数据到生产环境
 * 1. 删除生产环境现有数据
 * 2. 从开发环境重新插入
 */

import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config();

// 开发环境数据库配置
const DEV_CONFIG = {
  host: process.env.XIAOPEI_MYSQL_HOST || 'localhost',
  port: parseInt(process.env.XIAOPEI_MYSQL_PORT || '3306'),
  user: process.env.XIAOPEI_MYSQL_USER || 'root',
  password: process.env.XIAOPEI_MYSQL_PASSWORD || '',
  database: process.env.XIAOPEI_MYSQL_DATABASE || 'xiaopei',
  charset: 'utf8mb4',
};

// 生产环境数据库配置
const PROD_CONFIG = {
  host: process.env.XIAOPEI_PROD_MYSQL_HOST || process.env.XIAOPEI_MYSQL_HOST || 'localhost',
  port: parseInt(process.env.XIAOPEI_PROD_MYSQL_PORT || process.env.XIAOPEI_MYSQL_PORT || '3306'),
  user: process.env.XIAOPEI_PROD_MYSQL_USER || process.env.XIAOPEI_MYSQL_USER || 'root',
  password: process.env.XIAOPEI_PROD_MYSQL_PASSWORD || process.env.XIAOPEI_MYSQL_PASSWORD || '',
  database: process.env.XIAOPEI_PROD_MYSQL_DATABASE || process.env.XIAOPEI_MYSQL_DATABASE || 'xiaopei',
  charset: 'utf8mb4',
};

async function reimportShenshaData() {
  console.log('🔄 开始重新导入神煞数据到生产环境...\n');
  
  let devPool: mysql.Pool | null = null;
  let prodPool: mysql.Pool | null = null;
  
  try {
    // 连接开发环境数据库
    console.log('📡 连接开发环境数据库...');
    devPool = mysql.createPool({
      ...DEV_CONFIG,
      connectionLimit: 5,
    });
    await devPool.execute('SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci');
    console.log('✅ 开发环境数据库连接成功\n');
    
    // 连接生产环境数据库
    console.log('📡 连接生产环境数据库...');
    prodPool = mysql.createPool({
      ...PROD_CONFIG,
      connectionLimit: 5,
    });
    await prodPool.execute('SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci');
    console.log('✅ 生产环境数据库连接成功\n');
    
    // 1. 删除生产环境现有数据
    console.log('🗑️  删除生产环境现有神煞数据...');
    const [deleteResult]: any = await prodPool.query('DELETE FROM shensha_readings');
    console.log(`✅ 已删除 ${deleteResult.affectedRows} 条记录\n`);
    
    // 2. 从导出的 JSON 文件读取数据（如果开发环境数据库为空）
    const fs = require('fs');
    const path = require('path');
    const jsonPath = path.join(__dirname, '../data/shensha_readings_export.json');
    
    let devRows: any[] = [];
    
    if (fs.existsSync(jsonPath)) {
      console.log('📤 从导出的 JSON 文件读取神煞数据...');
      const jsonData = fs.readFileSync(jsonPath, 'utf8');
      devRows = JSON.parse(jsonData);
      console.log(`✅ 从 JSON 文件读取到 ${devRows.length} 条数据\n`);
    } else {
      console.log('📤 从开发环境数据库读取神煞数据...');
      const [dbRows]: any = await devPool.query(`
        SELECT 
          reading_id,
          shensha_code,
          pillar_type,
          gender,
          name,
          badge_text,
          type,
          short_title,
          summary,
          bullet_points,
          for_this_position,
          recommended_questions,
          is_active,
          sort_order
        FROM shensha_readings
        ORDER BY shensha_code, pillar_type, gender
      `);
      devRows = dbRows;
      console.log(`✅ 从数据库读取到 ${devRows.length} 条数据\n`);
    }
    
    // 3. 插入到生产环境（分批处理）
    const BATCH_SIZE = 50;
    let inserted = 0;
    let failed = 0;
    
    for (let i = 0; i < devRows.length; i += BATCH_SIZE) {
      const batch = devRows.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(devRows.length / BATCH_SIZE);
      
      console.log(`📦 插入批次 ${batchNum}/${totalBatches} (${batch.length} 条)...`);
      
      for (const row of batch) {
        try {
          await prodPool.query(
            `INSERT INTO shensha_readings (
              reading_id,
              shensha_code,
              pillar_type,
              gender,
              name,
              badge_text,
              type,
              short_title,
              summary,
              bullet_points,
              for_this_position,
              recommended_questions,
              is_active,
              sort_order,
              created_at,
              updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [
              row.reading_id,
              row.shensha_code,
              row.pillar_type,
              row.gender,
              row.name,
              row.badge_text,
              row.type,
              row.short_title,
              row.summary,
              JSON.stringify(row.bullet_points || []),
              row.for_this_position,
              JSON.stringify(row.recommended_questions || []),
              row.is_active !== undefined ? row.is_active : true,
              row.sort_order || 0,
            ]
          );
          inserted++;
        } catch (error: any) {
          console.error(`   ❌ 记录 ${row.reading_id} (${row.shensha_code}) 插入失败: ${error.message}`);
          failed++;
        }
      }
      
      console.log(`   ✅ 批次 ${batchNum} 完成 (成功: ${inserted}, 失败: ${failed})\n`);
    }
    
    console.log('✅ 数据重新导入完成！');
    console.log(`   总计: ${devRows.length} 条`);
    console.log(`   成功: ${inserted} 条`);
    console.log(`   失败: ${failed} 条`);
    
    // 4. 验证插入的数据
    console.log('\n🔍 验证插入的数据...');
    const [verifyRows]: any = await prodPool.query(`
      SELECT 
        shensha_code,
        name,
        LEFT(summary, 30) as summary_preview
      FROM shensha_readings
      WHERE shensha_code = 'wen_chang_gui_ren' AND pillar_type = 'month'
      LIMIT 1
    `);
    
    if (verifyRows.length > 0) {
      const row = verifyRows[0];
      const name = row.name || '';
      const hasChinese = /[\u4e00-\u9fa5]/.test(name);
      console.log(`   神煞代码: ${row.shensha_code}`);
      console.log(`   名称: ${name}`);
      console.log(`   名称长度: ${name.length}`);
      console.log(`   包含中文: ${hasChinese ? '✅' : '❌'}`);
      console.log(`   总结预览: ${row.summary_preview}...`);
      
      if (hasChinese && name.length <= 10) {
        console.log('\n   ✅ 数据验证通过！');
      } else {
        console.log('\n   ⚠️  数据可能仍有问题');
      }
    }
    
  } catch (error: any) {
    console.error('❌ 重新导入失败:', error.message);
    throw error;
  } finally {
    if (devPool) {
      await devPool.end();
      console.log('\n📡 开发环境数据库连接已关闭');
    }
    if (prodPool) {
      await prodPool.end();
      console.log('📡 生产环境数据库连接已关闭');
    }
  }
}

reimportShenshaData()
  .then(() => {
    console.log('\n✅ 重新导入完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 重新导入失败:', error);
    process.exit(1);
  });

