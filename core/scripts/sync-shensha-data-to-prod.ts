/**
 * 从开发环境同步神煞数据到生产环境
 * 直接连接两个数据库进行数据迁移
 */

import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config();

// 开发环境数据库配置（从 .env 读取）
const DEV_CONFIG = {
  host: process.env.XIAOPEI_MYSQL_HOST || 'localhost',
  port: parseInt(process.env.XIAOPEI_MYSQL_PORT || '3306'),
  user: process.env.XIAOPEI_MYSQL_USER || 'root',
  password: process.env.XIAOPEI_MYSQL_PASSWORD || '',
  database: process.env.XIAOPEI_MYSQL_DATABASE || 'xiaopei',
  charset: 'utf8mb4',
};

// 生产环境数据库配置（需要单独配置或从环境变量读取）
// 注意：生产环境可能需要通过 Cloud SQL Proxy 连接
const PROD_CONFIG = {
  host: process.env.XIAOPEI_PROD_MYSQL_HOST || process.env.XIAOPEI_MYSQL_HOST || 'localhost',
  port: parseInt(process.env.XIAOPEI_PROD_MYSQL_PORT || process.env.XIAOPEI_MYSQL_PORT || '3306'),
  user: process.env.XIAOPEI_PROD_MYSQL_USER || process.env.XIAOPEI_MYSQL_USER || 'root',
  password: process.env.XIAOPEI_PROD_MYSQL_PASSWORD || process.env.XIAOPEI_MYSQL_PASSWORD || '',
  database: process.env.XIAOPEI_PROD_MYSQL_DATABASE || process.env.XIAOPEI_MYSQL_DATABASE || 'xiaopei',
  charset: 'utf8mb4',
};

async function syncShenshaData() {
  console.log('🔄 开始同步神煞数据从开发环境到生产环境...\n');
  
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
    
    // 从开发环境读取数据
    console.log('📤 从开发环境读取神煞数据...');
    const [devRows]: any = await devPool.query(`
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
    
    console.log(`✅ 读取到 ${devRows.length} 条数据\n`);
    
    // 分批处理数据（每批 50 条）
    const BATCH_SIZE = 50;
    let imported = 0;
    let updated = 0;
    let failed = 0;
    
    for (let i = 0; i < devRows.length; i += BATCH_SIZE) {
      const batch = devRows.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(devRows.length / BATCH_SIZE);
      
      console.log(`📦 处理批次 ${batchNum}/${totalBatches} (${batch.length} 条)...`);
      
      for (const row of batch) {
        try {
          // 检查生产环境是否存在
          const [existing]: any = await prodPool.query(
            'SELECT reading_id FROM shensha_readings WHERE reading_id = ?',
            [row.reading_id]
          );
          
          if (existing.length > 0) {
            // 更新现有记录
            await prodPool.query(
              `UPDATE shensha_readings SET
                shensha_code = ?,
                pillar_type = ?,
                gender = ?,
                name = ?,
                badge_text = ?,
                type = ?,
                short_title = ?,
                summary = ?,
                bullet_points = ?,
                for_this_position = ?,
                recommended_questions = ?,
                is_active = ?,
                sort_order = ?,
                updated_at = NOW()
              WHERE reading_id = ?`,
              [
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
                row.reading_id,
              ]
            );
            updated++;
          } else {
            // 插入新记录
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
            imported++;
          }
        } catch (error: any) {
          console.error(`   ❌ 记录 ${row.reading_id} (${row.shensha_code}) 处理失败: ${error.message}`);
          failed++;
        }
      }
      
      console.log(`   ✅ 批次 ${batchNum} 完成 (新增: ${imported}, 更新: ${updated}, 失败: ${failed})\n`);
    }
    
    console.log('✅ 数据同步完成！');
    console.log(`   总计: ${devRows.length} 条`);
    console.log(`   新增: ${imported} 条`);
    console.log(`   更新: ${updated} 条`);
    console.log(`   失败: ${failed} 条`);
    
  } catch (error: any) {
    console.error('❌ 同步失败:', error.message);
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

syncShenshaData()
  .then(() => {
    console.log('\n✅ 同步完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 同步失败:', error);
    process.exit(1);
  });
