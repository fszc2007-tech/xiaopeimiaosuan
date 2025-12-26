/**
 * 检查神煞解读表的编码问题
 */

import { createConnection } from '../src/database/connection';
import * as dotenv from 'dotenv';

dotenv.config();

async function checkShenshaEncoding() {
  console.log('🔍 检查神煞解读表编码问题...\n');
  
  const pool = await createConnection();
  
  try {
    // 1. 检查表字符集
    console.log('📋 检查表字符集:');
    const [tableInfo]: any = await pool.query(`
      SELECT 
        TABLE_NAME,
        TABLE_COLLATION,
        TABLE_CHARSET
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'shensha_readings'
    `);
    
    if (tableInfo.length > 0) {
      console.log(`   表名: ${tableInfo[0].TABLE_NAME}`);
      console.log(`   字符集: ${tableInfo[0].TABLE_CHARSET}`);
      console.log(`   排序规则: ${tableInfo[0].TABLE_COLLATION}`);
      
      if (tableInfo[0].TABLE_CHARSET !== 'utf8mb4') {
        console.log(`   ⚠️  字符集不是 utf8mb4！`);
      } else {
        console.log(`   ✅ 字符集正确`);
      }
    }
    console.log('');
    
    // 2. 检查列字符集
    console.log('📋 检查列字符集:');
    const [columnInfo]: any = await pool.query(`
      SELECT 
        COLUMN_NAME,
        CHARACTER_SET_NAME,
        COLLATION_NAME
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'shensha_readings'
        AND CHARACTER_SET_NAME IS NOT NULL
    `);
    
    columnInfo.forEach((col: any) => {
      console.log(`   ${col.COLUMN_NAME}: ${col.CHARACTER_SET_NAME || 'N/A'} (${col.COLLATION_NAME || 'N/A'})`);
      if (col.CHARACTER_SET_NAME && col.CHARACTER_SET_NAME !== 'utf8mb4') {
        console.log(`      ⚠️  字符集不是 utf8mb4！`);
      }
    });
    console.log('');
    
    // 3. 检查实际数据
    console.log('📋 检查实际数据（前 3 条）:');
    const [rows]: any = await pool.query(`
      SELECT 
        reading_id,
        shensha_code,
        name,
        badge_text,
        LEFT(summary, 50) as summary_preview,
        LEFT(for_this_position, 50) as position_preview
      FROM shensha_readings
      LIMIT 3
    `);
    
    rows.forEach((row: any, index: number) => {
      console.log(`\n   记录 ${index + 1}:`);
      console.log(`   - 神煞代码: ${row.shensha_code}`);
      console.log(`   - 名称: ${row.name}`);
      console.log(`   - 徽标: ${row.badge_text}`);
      console.log(`   - 总结预览: ${row.summary_preview}`);
      console.log(`   - 位置说明预览: ${row.position_preview}`);
      
      // 检查是否有乱码（检查是否包含常见乱码字符）
      const hasGarbled = /[]/.test(row.name + row.badge_text + row.summary_preview + row.position_preview);
      if (hasGarbled) {
        console.log(`   ⚠️  检测到乱码字符！`);
      } else {
        console.log(`   ✅ 文本正常`);
      }
    });
    console.log('');
    
    // 4. 检查连接字符集
    console.log('📋 检查当前连接字符集:');
    const [charsetInfo]: any = await pool.query(`
      SELECT 
        @@character_set_client as client,
        @@character_set_connection as connection,
        @@character_set_results as results,
        @@character_set_database as database,
        @@character_set_server as server
    `);
    
    console.log(`   客户端: ${charsetInfo[0].client}`);
    console.log(`   连接: ${charsetInfo[0].connection}`);
    console.log(`   结果: ${charsetInfo[0].results}`);
    console.log(`   数据库: ${charsetInfo[0].database}`);
    console.log(`   服务器: ${charsetInfo[0].server}`);
    
    if (charsetInfo[0].connection !== 'utf8mb4' || charsetInfo[0].results !== 'utf8mb4') {
      console.log(`   ⚠️  连接字符集不是 utf8mb4！`);
    } else {
      console.log(`   ✅ 连接字符集正确`);
    }
    
  } catch (error: any) {
    console.error('❌ 检查失败:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

checkShenshaEncoding()
  .then(() => {
    console.log('\n✅ 检查完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 检查失败:', error);
    process.exit(1);
  });

