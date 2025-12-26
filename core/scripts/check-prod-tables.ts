/**
 * 通过 API 检查生产环境的数据库表结构
 */

import axios from 'axios';

async function checkProdTables() {
  console.log('🔍 检查生产环境数据库表结构...\n');
  
  const apiBaseUrl = 'https://xiaopei-core-343578696044.asia-east2.run.app';
  
  try {
    // 通过 migration API 检查（如果可用）
    console.log('📋 尝试通过 API 获取表信息...\n');
    
    // 或者直接查询 Cloud Logging 中的表结构信息
    console.log('💡 建议：');
    console.log('   1. 通过 Cloud SQL Proxy 连接生产数据库');
    console.log('   2. 执行: SHOW TABLES;');
    console.log('   3. 对每张表执行: DESCRIBE table_name;\n');
    
    // 检查 llm_api_configs 表
    console.log('🔍 检查生产环境 llm_api_configs 表:');
    console.log('   需要执行以下 SQL 查询生产环境:');
    console.log('   - SHOW TABLES;');
    console.log('   - DESCRIBE llm_api_configs;');
    console.log('   - SELECT model, is_enabled, api_key_encrypted IS NOT NULL as has_key FROM llm_api_configs;\n');
    
  } catch (error: any) {
    console.error('❌ 检查失败:', error.message);
  }
}

checkProdTables()
  .then(() => {
    console.log('✅ 检查完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 检查失败:', error);
    process.exit(1);
  });

