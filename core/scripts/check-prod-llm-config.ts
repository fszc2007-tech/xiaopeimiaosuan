/**
 * 检查生产环境 LLM 配置
 * 通过 API 查询生产环境的 llm_api_configs 表
 */

async function checkProdLLMConfig() {
  const prodUrl = 'https://xiaopei-core-343578696044.asia-east2.run.app';
  
  try {
    // 查询生产环境的 LLM 配置
    const response = await fetch(`${prodUrl}/api/admin/v1/llm/configs`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      console.error(`❌ API 请求失败: ${response.status} ${response.statusText}`);
      const text = await response.text();
      console.error('响应内容:', text);
      return;
    }
    
    const data: any = await response.json();
    
    if (!data.success) {
      console.error('❌ API 返回错误:', data.error);
      return;
    }
    
    const configs: any[] = data.data || [];
    
    console.log(`\n📊 生产环境 LLM 配置 (${configs.length} 个):\n`);
    
    for (const config of configs) {
      console.log(`模型: ${config.model}`);
      console.log(`  - API URL: ${config.baseUrl}`);
      console.log(`  - 已启用: ${config.isEnabled ? '✅ 是' : '❌ 否'}`);
      console.log(`  - 有 API Key: ${config.hasApiKey ? '✅ 是' : '❌ 否'}`);
      console.log(`  - 是否默认: ${config.isDefault ? '✅ 是' : '❌ 否'}`);
      console.log(`  - Thinking 模式: ${config.enableThinking ? '✅ 开启' : '❌ 关闭'}`);
      console.log('');
    }
    
    // 检查是否有可用的模型
    const availableModels = configs.filter(
      (c: any) => c.isEnabled && c.hasApiKey
    );
    
    if (availableModels.length === 0) {
      console.log('❌ 没有可用的 LLM 模型！');
      console.log('   原因: 所有模型都未启用或没有配置 API Key');
    } else {
      console.log(`✅ 有 ${availableModels.length} 个可用的模型:`);
      for (const model of availableModels) {
        console.log(`   - ${model.model}${model.isDefault ? ' (默认)' : ''}`);
      }
    }
    
  } catch (error: any) {
    console.error('❌ 检查失败:', error.message);
  }
}

checkProdLLMConfig();

