/**
 * 检查环境变量和数据库连接
 */

import { createConnection, closeConnection } from '../src/database/connection';
import dotenv from 'dotenv';

dotenv.config();

async function checkEnvAndDb() {
  try {
    console.log('🔍 检查环境变量和数据库连接...\n');
    
    // 1. 检查关键环境变量
    console.log('📋 关键环境变量检查:');
    const envVars = {
      'XIAOPEI_MYSQL_HOST': process.env.XIAOPEI_MYSQL_HOST,
      'XIAOPEI_MYSQL_PORT': process.env.XIAOPEI_MYSQL_PORT || '3306',
      'XIAOPEI_MYSQL_USER': process.env.XIAOPEI_MYSQL_USER,
      'XIAOPEI_MYSQL_DATABASE': process.env.XIAOPEI_MYSQL_DATABASE || 'xiaopei',
      'XIAOPEI_MYSQL_PASSWORD': process.env.XIAOPEI_MYSQL_PASSWORD ? '***已设置***' : '❌ 未设置',
      'XIAOPEI_JWT_SECRET': process.env.XIAOPEI_JWT_SECRET ? '***已设置***' : '❌ 未设置（使用默认值）',
      'XIAOPEI_TENCENT_SECRET_ID': process.env.XIAOPEI_TENCENT_SECRET_ID ? '***已设置***' : '❌ 未设置（使用默认值）',
      'XIAOPEI_TENCENT_SECRET_KEY': process.env.XIAOPEI_TENCENT_SECRET_KEY ? '***已设置***' : '❌ 未设置（使用默认值）',
      'XIAOPEI_TENCENT_SMS_APP_ID': process.env.XIAOPEI_TENCENT_SMS_APP_ID || '2400003800（默认值）',
      'XIAOPEI_TENCENT_SMS_REGION': process.env.XIAOPEI_TENCENT_SMS_REGION || 'ap-singapore（默认值）',
      'MYSQL_CONNECTION_LIMIT': process.env.MYSQL_CONNECTION_LIMIT || '未设置（使用默认值）',
      'NODE_ENV': process.env.NODE_ENV || 'development',
    };
    
    Object.entries(envVars).forEach(([key, value]) => {
      const status = value && !value.includes('❌') ? '✅' : '⚠️';
      console.log(`  ${status} ${key}: ${value}`);
    });
    
    // 2. 测试数据库连接
    console.log('\n🔌 测试数据库连接...');
    const pool = await createConnection();
    
    // 测试查询
    const [result]: any = await pool.execute('SELECT 1 as test, DATABASE() as db, USER() as user, VERSION() as version');
    console.log('✅ 数据库连接成功');
    console.log(`  - 数据库: ${result[0].db}`);
    console.log(`  - 用户: ${result[0].user}`);
    console.log(`  - MySQL版本: ${result[0].version}`);
    
    // 检查 verification_codes 表
    const [tables]: any = await pool.execute(
      `SELECT TABLE_NAME FROM information_schema.TABLES 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'verification_codes'`,
      [process.env.XIAOPEI_MYSQL_DATABASE || 'xiaopei']
    );
    
    if (tables.length > 0) {
      console.log('✅ verification_codes 表存在');
      
      // 检查表结构
      const [columns]: any = await pool.execute(
        `SELECT COLUMN_NAME, COLUMN_TYPE, CHARACTER_MAXIMUM_LENGTH 
         FROM information_schema.COLUMNS 
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'verification_codes' AND COLUMN_NAME = 'phone'`,
        [process.env.XIAOPEI_MYSQL_DATABASE || 'xiaopei']
      );
      
      if (columns.length > 0) {
        const col = columns[0];
        console.log(`  - phone 字段类型: ${col.COLUMN_TYPE}`);
        console.log(`  - phone 字段长度: ${col.CHARACTER_MAXIMUM_LENGTH || 'N/A'}`);
        
        if (col.COLUMN_TYPE.includes('varchar(32)')) {
          console.log('  ✅ phone 字段长度足够（VARCHAR(32)）');
        } else {
          console.log('  ⚠️  phone 字段长度可能不足（建议 VARCHAR(32)）');
        }
      }
    } else {
      console.log('❌ verification_codes 表不存在');
    }
    
    // 检查连接池配置
    const connectionLimit = parseInt(process.env.MYSQL_CONNECTION_LIMIT || (process.env.NODE_ENV === 'production' ? '15' : '10'));
    console.log(`\n📊 连接池配置:`);
    console.log(`  - 连接池大小: ${connectionLimit}`);
    console.log(`  - 环境: ${process.env.NODE_ENV || 'development'}`);
    
    // 测试验证码查询（模拟）
    console.log('\n🧪 测试验证码查询逻辑...');
    const testPhone = '+85291234567';
    const [testCodes]: any = await pool.execute(
      `SELECT COUNT(*) as count FROM verification_codes WHERE phone = ?`,
      [testPhone]
    );
    console.log(`  - 测试查询成功（phone: ${testPhone}, 记录数: ${testCodes[0].count}）`);
    
    await closeConnection();
    console.log('\n✅ 检查完成');
  } catch (error: any) {
    console.error('❌ 检查失败:', error.message);
    if (error.code) {
      console.error(`  错误代码: ${error.code}`);
    }
    if (error.sqlMessage) {
      console.error(`  SQL错误: ${error.sqlMessage}`);
    }
    await closeConnection();
    process.exit(1);
  }
}

checkEnvAndDb();

