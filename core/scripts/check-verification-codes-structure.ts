/**
 * 检查 verification_codes 表结构
 * 确认 Migration 008 是否已执行
 */

import { createConnection, closeConnection } from '../src/database/connection';
import dotenv from 'dotenv';

dotenv.config();

async function checkTableStructure() {
  try {
    const pool = await createConnection();
    const database = process.env.XIAOPEI_MYSQL_DATABASE || 'xiaopei';
    
    console.log('[Check] 检查 verification_codes 表结构...\n');
    
    // 检查 phone 字段类型和长度
    const [columns]: any = await pool.execute(
      `SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT, CHARACTER_MAXIMUM_LENGTH
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'verification_codes' AND COLUMN_NAME = 'phone'
       ORDER BY ORDINAL_POSITION`,
      [database]
    );
    
    if (columns.length === 0) {
      console.error('❌ verification_codes 表不存在或 phone 字段不存在');
      await closeConnection();
      process.exit(1);
    }
    
    const phoneColumn = columns[0];
    console.log('📊 verification_codes.phone 字段信息:');
    console.log(`  - 字段名: ${phoneColumn.COLUMN_NAME}`);
    console.log(`  - 类型: ${phoneColumn.COLUMN_TYPE}`);
    console.log(`  - 最大长度: ${phoneColumn.CHARACTER_MAXIMUM_LENGTH || 'N/A'}`);
    console.log(`  - 可空: ${phoneColumn.IS_NULLABLE}`);
    console.log(`  - 注释: ${phoneColumn.COLUMN_COMMENT || 'N/A'}`);
    
    // 检查是否符合 Migration 008 的要求
    const isVarchar32 = phoneColumn.COLUMN_TYPE.includes('varchar(32)');
    const hasE164Comment = phoneColumn.COLUMN_COMMENT?.includes('E.164');
    
    console.log('\n🔍 Migration 008 检查结果:');
    if (isVarchar32 && hasE164Comment) {
      console.log('✅ Migration 008 已执行');
      console.log('   - phone 字段已扩展为 VARCHAR(32)');
      console.log('   - 支持 E.164 格式（如 +85291234567）');
    } else {
      console.log('❌ Migration 008 未执行或执行不完整');
      if (!isVarchar32) {
        console.log(`   - 当前类型: ${phoneColumn.COLUMN_TYPE}`);
        console.log('   - 期望类型: VARCHAR(32)');
      }
      if (!hasE164Comment) {
        console.log('   - 缺少 E.164 格式注释');
      }
      console.log('\n⚠️  需要执行 Migration 008:');
      console.log('   mysql -u root -p xiaopei < core/src/database/migrations/008_optimize_indexes_phone_only.sql');
    }
    
    // 检查 users 表的 phone 字段
    console.log('\n📊 同时检查 users.phone 字段...');
    const [userColumns]: any = await pool.execute(
      `SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT, CHARACTER_MAXIMUM_LENGTH
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'phone'
       ORDER BY ORDINAL_POSITION`,
      [database]
    );
    
    if (userColumns.length > 0) {
      const userPhoneColumn = userColumns[0];
      console.log(`  - 类型: ${userPhoneColumn.COLUMN_TYPE}`);
      console.log(`  - 最大长度: ${userPhoneColumn.CHARACTER_MAXIMUM_LENGTH || 'N/A'}`);
      const userIsVarchar32 = userPhoneColumn.COLUMN_TYPE.includes('varchar(32)');
      if (userIsVarchar32) {
        console.log('  ✅ users.phone 字段已扩展为 VARCHAR(32)');
      } else {
        console.log(`  ⚠️  users.phone 字段类型: ${userPhoneColumn.COLUMN_TYPE} (期望: VARCHAR(32))`);
      }
    }
    
    // 检查是否有数据被截断的风险
    console.log('\n🔍 检查数据完整性...');
    const [longPhones]: any = await pool.execute(
      `SELECT COUNT(*) as count 
       FROM verification_codes 
       WHERE phone IS NOT NULL AND CHAR_LENGTH(phone) > 20`,
      []
    );
    
    if (longPhones[0].count > 0) {
      console.log(`⚠️  发现 ${longPhones[0].count} 条记录的 phone 长度超过 20 字符`);
      console.log('   如果字段是 VARCHAR(20)，这些数据可能被截断');
    } else {
      console.log('✅ 未发现长度超过 20 字符的 phone 数据');
    }
    
    // 显示一些示例数据
    const [samples]: any = await pool.execute(
      `SELECT phone, CHAR_LENGTH(phone) as length, created_at 
       FROM verification_codes 
       WHERE phone IS NOT NULL 
       ORDER BY created_at DESC 
       LIMIT 5`,
      []
    );
    
    if (samples.length > 0) {
      console.log('\n📋 最近 5 条验证码记录的 phone 示例:');
      samples.forEach((row: any, index: number) => {
        const masked = row.phone.replace(/(?<=\+)\d(?=\d{4})/g, '*');
        console.log(`  ${index + 1}. ${masked} (长度: ${row.length}, 创建时间: ${row.created_at})`);
      });
    }
    
    await closeConnection();
    console.log('\n✅ 检查完成');
  } catch (error) {
    console.error('❌ 检查失败:', error);
    await closeConnection();
    process.exit(1);
  }
}

checkTableStructure();

