/**
 * 从开发环境同步 LLM 配置到生产环境
 * 直接连接两个数据库进行配置迁移
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

async function syncLLMConfig() {
  console.log('🔄 开始同步 LLM 配置从开发环境到生产环境...\n');
  
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
    
    // 从开发环境读取配置
    console.log('📤 从开发环境读取 LLM 配置...');
    const [devRows]: any = await devPool.query(`
      SELECT 
        config_id,
        model,
        api_key_encrypted,
        api_url,
        is_enabled,
        thinking_mode,
        model_name,
        enable_stream,
        temperature,
        max_tokens,
        is_default,
        test_status,
        test_message
      FROM llm_api_configs
      ORDER BY model
    `);
    
    console.log(`✅ 读取到 ${devRows.length} 条配置\n`);
    
    let inserted = 0;
    let updated = 0;
    let failed = 0;
    
    for (const row of devRows) {
      try {
        console.log(`📝 处理模型: ${row.model}`);
        
        // 检查生产环境是否存在
        const [existing]: any = await prodPool.query(
          'SELECT config_id FROM llm_api_configs WHERE model = ?',
          [row.model]
        );
        
        if (existing.length > 0) {
          // 更新现有配置（保留加密的 API Key）
          await prodPool.query(
            `UPDATE llm_api_configs SET
              api_key_encrypted = ?,
              api_url = ?,
              is_enabled = ?,
              thinking_mode = ?,
              model_name = ?,
              enable_stream = ?,
              temperature = ?,
              max_tokens = ?,
              is_default = ?,
              test_status = ?,
              test_message = ?,
              updated_at = NOW()
            WHERE model = ?`,
            [
              row.api_key_encrypted,
              row.api_url,
              row.is_enabled !== undefined ? row.is_enabled : false,
              row.thinking_mode !== undefined ? row.thinking_mode : false,
              row.model_name,
              row.enable_stream !== undefined ? row.enable_stream : true,
              row.temperature || 0.7,
              row.max_tokens || 4000,
              row.is_default !== undefined ? row.is_default : false,
              row.test_status || 'not_tested',
              row.test_message || null,
              row.model,
            ]
          );
          updated++;
          console.log(`   ✅ 更新成功`);
        } else {
          // 插入新配置
          await prodPool.query(
            `INSERT INTO llm_api_configs (
              config_id,
              model,
              api_key_encrypted,
              api_url,
              is_enabled,
              thinking_mode,
              model_name,
              enable_stream,
              temperature,
              max_tokens,
              is_default,
              test_status,
              test_message,
              created_at,
              updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [
              row.config_id,
              row.model,
              row.api_key_encrypted,
              row.api_url,
              row.is_enabled !== undefined ? row.is_enabled : false,
              row.thinking_mode !== undefined ? row.thinking_mode : false,
              row.model_name,
              row.enable_stream !== undefined ? row.enable_stream : true,
              row.temperature || 0.7,
              row.max_tokens || 4000,
              row.is_default !== undefined ? row.is_default : false,
              row.test_status || 'not_tested',
              row.test_message || null,
            ]
          );
          inserted++;
          console.log(`   ✅ 插入成功`);
        }
      } catch (error: any) {
        console.error(`   ❌ 模型 ${row.model} 处理失败: ${error.message}`);
        failed++;
      }
    }
    
    console.log('\n✅ 配置同步完成！');
    console.log(`   总计: ${devRows.length} 条`);
    console.log(`   新增: ${inserted} 条`);
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

syncLLMConfig()
  .then(() => {
    console.log('\n✅ 同步完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 同步失败:', error);
    process.exit(1);
  });

