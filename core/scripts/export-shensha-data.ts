/**
 * 从开发环境导出神煞数据
 * 用于修复生产环境的乱码问题
 */

import { createConnection, closeConnection } from '../src/database/connection';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

async function exportShenshaData() {
  console.log('📤 从开发环境导出神煞数据...\n');
  
  const pool = await createConnection();
  
  try {
    // 查询所有神煞数据
    const [rows]: any = await pool.query(`
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
    
    console.log(`✅ 找到 ${rows.length} 条神煞数据\n`);
    
    // 保存为 JSON 文件
    const outputPath = path.join(__dirname, '../data/shensha_readings_export.json');
    const outputDir = path.dirname(outputPath);
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, JSON.stringify(rows, null, 2), 'utf8');
    
    console.log(`✅ 数据已导出到: ${outputPath}`);
    console.log(`   文件大小: ${fs.statSync(outputPath).size} 字节`);
    
    // 显示前 3 条数据预览
    console.log('\n📋 数据预览（前 3 条）:');
    for (let i = 0; i < Math.min(3, rows.length); i++) {
      const row = rows[i];
      console.log(`\n  记录 ${i + 1}:`);
      console.log(`    - 神煞代码: ${row.shensha_code}`);
      console.log(`    - 柱位: ${row.pillar_type}`);
      console.log(`    - 性别: ${row.gender}`);
      console.log(`    - 名称: ${row.name}`);
      console.log(`    - 总结预览: ${row.summary?.substring(0, 50)}...`);
    }
    
  } catch (error: any) {
    console.error('❌ 导出失败:', error.message);
    throw error;
  } finally {
    await closeConnection();
  }
}

exportShenshaData()
  .then(() => {
    console.log('\n✅ 导出完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 导出失败:', error);
    process.exit(1);
  });

