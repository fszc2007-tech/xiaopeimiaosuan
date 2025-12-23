/**
 * 检查当前 LLM 模式脚本
 * 用于确认系统使用的是思考模式还是 chat 模式
 * 
 * 运行：npx ts-node scripts/check-llm-mode.ts
 */

import { getPool } from '../src/database/connection';
import { decryptApiKey } from '../src/utils/encryption';

async function checkLLMMode() {
  const pool = getPool();
  
  try {
    // 1. 检查默认模型
    const [defaultRows]: any = await (pool as any).query(
      `SELECT model FROM llm_api_configs WHERE is_default = TRUE AND is_enabled = TRUE LIMIT 1`
    );
    
    if (defaultRows.length === 0) {
      console.log('❌ 没有找到默认的 LLM 配置');
      return;
    }
    
    const defaultModel = defaultRows[0].model;
    console.log(`\n📌 默认模型: ${defaultModel}\n`);
    
    // 2. 检查 DeepSeek 配置
    const [deepseekRows]: any = await (pool as any).query(
      `SELECT model, is_enabled, is_default, thinking_mode, model_name 
       FROM llm_api_configs 
       WHERE model = 'deepseek'`
    );
    
    if (deepseekRows.length === 0) {
      console.log('❌ 没有找到 DeepSeek 配置');
      return;
    }
    
    const config = deepseekRows[0];
    
    console.log('🔍 DeepSeek 配置详情:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  模型标识: ${config.model}`);
    console.log(`  是否启用: ${config.is_enabled ? '✅ 是' : '❌ 否'}`);
    console.log(`  是否默认: ${config.is_default ? '✅ 是' : '❌ 否'}`);
    console.log(`  思考模式: ${config.thinking_mode ? '✅ 开启 (deepseek-reasoner)' : '❌ 关闭 (deepseek-chat)'}`);
    console.log(`  模型名称: ${config.model_name || '未设置'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // 3. 判断实际使用的模式
    if (defaultModel === 'deepseek' && config.is_enabled) {
      if (config.thinking_mode) {
        console.log('✅ 当前系统使用: DeepSeek 思考模式 (deepseek-reasoner)');
        console.log('   特点: 深度推理，响应较慢但质量更高');
      } else {
        console.log('✅ 当前系统使用: DeepSeek 标准模式 (deepseek-chat)');
        console.log('   特点: 快速响应，适合日常对话');
      }
    } else if (defaultModel === 'deepseek' && !config.is_enabled) {
      console.log('⚠️  DeepSeek 是默认模型但未启用，系统可能无法正常工作');
    } else {
      console.log(`ℹ️  默认模型是 ${defaultModel}，不是 DeepSeek`);
    }
    
    // 4. 检查其他模型配置
    console.log('\n📊 所有 LLM 配置:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const [allRows]: any = await (pool as any).query(
      `SELECT model, is_enabled, is_default, thinking_mode 
       FROM llm_api_configs 
       ORDER BY is_default DESC, model`
    );
    
    allRows.forEach((row: any) => {
      const status = row.is_enabled ? '✅' : '❌';
      const defaultTag = row.is_default ? ' [默认]' : '';
      const thinkingTag = row.model === 'deepseek' && row.thinking_mode ? ' [思考模式]' : '';
      console.log(`  ${status} ${row.model}${defaultTag}${thinkingTag}`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
  } catch (error: any) {
    console.error('❌ 检查失败:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

// 运行检查
checkLLMMode().catch(console.error);

