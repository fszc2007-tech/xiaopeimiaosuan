/**
 * 从开发环境导出 LLM 配置
 * 用于同步到生产环境
 */

import { createConnection, closeConnection } from '../src/database/connection';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

async function exportLLMConfig() {
  console.log('📤 从开发环境导出 LLM 配置...\n');
  
  const pool = await createConnection();
  
  try {
    // 查询所有 LLM 配置
    const [rows]: any = await pool.query(`
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
    
    console.log(`✅ 找到 ${rows.length} 条 LLM 配置\n`);
    
    // 保存为 JSON 文件
    const outputPath = path.join(__dirname, '../data/llm_api_configs_export.json');
    const outputDir = path.dirname(outputPath);
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, JSON.stringify(rows, null, 2), 'utf8');
    
    console.log(`✅ 配置已导出到: ${outputPath}`);
    console.log(`   文件大小: ${fs.statSync(outputPath).size} 字节`);
    
    // 显示配置预览（隐藏 API Key）
    console.log('\n📋 配置预览:');
    for (const row of rows) {
      console.log(`\n  模型: ${row.model}`);
      console.log(`    - API URL: ${row.api_url}`);
      console.log(`    - 已启用: ${row.is_enabled ? '是' : '否'}`);
      console.log(`    - 有 API Key: ${row.api_key_encrypted ? '是' : '否'}`);
      console.log(`    - 是否默认: ${row.is_default ? '是' : '否'}`);
      if (row.api_key_encrypted) {
        console.log(`    - Key 长度: ${row.api_key_encrypted.length} 字符`);
      }
    }
    
  } catch (error: any) {
    console.error('❌ 导出失败:', error.message);
    throw error;
  } finally {
    await closeConnection();
  }
}

exportLLMConfig()
  .then(() => {
    console.log('\n✅ 导出完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 导出失败:', error);
    process.exit(1);
  });

