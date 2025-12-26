/**
 * 检查 LLM 配置（DeepSeek API Key）
 */

import { createConnection } from '../src/database/connection';
import { decryptApiKey } from '../src/utils/encryption';
import * as dotenv from 'dotenv';

dotenv.config();

async function checkLLMConfig() {
  console.log('🔍 检查 LLM 配置...\n');
  
  const pool = await createConnection();
  
  try {
    // 1. 检查表结构
    console.log('📋 检查 llm_api_configs 表结构:');
    const [columns]: any = await pool.query('SHOW COLUMNS FROM llm_api_configs');
    console.log(`   列数: ${columns.length}`);
    columns.forEach((col: any) => {
      console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    console.log('');
    
    // 2. 检查数据
    console.log('📊 检查 llm_api_configs 数据:');
    const [rows]: any = await pool.query(`
      SELECT 
        config_id,
        model,
        api_url,
        is_enabled,
        thinking_mode,
        api_key_encrypted IS NOT NULL as has_api_key,
        LENGTH(api_key_encrypted) as key_length,
        created_at,
        updated_at
      FROM llm_api_configs
      ORDER BY model
    `);
    
    if (rows.length === 0) {
      console.log('   ❌ 表中没有数据！');
    } else {
      console.log(`   ✅ 找到 ${rows.length} 条配置:\n`);
      for (const row of rows) {
        console.log(`   模型: ${row.model}`);
        console.log(`   - API URL: ${row.api_url}`);
        console.log(`   - 已启用: ${row.is_enabled ? '是' : '否'}`);
        console.log(`   - 有 API Key: ${row.has_api_key ? '是' : '❌ 否'}`);
        if (row.has_api_key) {
          console.log(`   - Key 长度: ${row.key_length} 字符`);
          
          // 尝试解密（检查加密密钥是否正确）
          try {
            const decrypted = decryptApiKey(row.api_key_encrypted);
            console.log(`   - ✅ 解密成功，Key 前 10 字符: ${decrypted.substring(0, 10)}...`);
          } catch (error: any) {
            console.log(`   - ❌ 解密失败: ${error.message}`);
          }
        }
        console.log(`   - Thinking 模式: ${row.thinking_mode ? '是' : '否'}`);
        console.log(`   - 创建时间: ${row.created_at}`);
        console.log(`   - 更新时间: ${row.updated_at}`);
        console.log('');
      }
    }
    
    // 3. 检查环境变量
    console.log('🔑 检查环境变量:');
    console.log(`   XIAOPEI_DEEPSEEK_API_KEY: ${process.env.XIAOPEI_DEEPSEEK_API_KEY ? '已设置（长度: ' + process.env.XIAOPEI_DEEPSEEK_API_KEY.length + '）' : '❌ 未设置'}`);
    console.log(`   XIAOPEI_ENCRYPTION_KEY: ${process.env.XIAOPEI_ENCRYPTION_KEY ? '已设置（长度: ' + process.env.XIAOPEI_ENCRYPTION_KEY.length + '）' : '❌ 未设置'}`);
    console.log('');
    
    // 4. 检查默认模型
    console.log('🎯 检查默认模型:');
    const [defaultRows]: any = await pool.query(`
      SELECT model FROM llm_api_configs 
      WHERE is_enabled = TRUE AND api_key_encrypted IS NOT NULL
      ORDER BY FIELD(model, 'deepseek', 'chatgpt', 'qwen')
      LIMIT 1
    `);
    
    if (defaultRows.length === 0) {
      console.log('   ❌ 没有可用的默认模型！');
    } else {
      console.log(`   ✅ 默认模型: ${defaultRows[0].model}`);
    }
    
  } catch (error: any) {
    console.error('❌ 检查失败:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

checkLLMConfig()
  .then(() => {
    console.log('\n✅ 检查完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 检查失败:', error);
    process.exit(1);
  });

