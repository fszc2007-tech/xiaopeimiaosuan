/**
 * 将 LLM 配置导入到生产环境
 * 通过 API 端点执行
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const PROD_URL = 'https://xiaopei-core-343578696044.asia-east2.run.app';

async function importLLMConfigToProd() {
  console.log('📥 导入 LLM 配置到生产环境...\n');
  
  // 读取导出的配置
  const dataPath = path.join(__dirname, '../data/llm_api_configs_export.json');
  
  if (!fs.existsSync(dataPath)) {
    console.error(`❌ 配置文件不存在: ${dataPath}`);
    console.error('   请先运行 export-llm-config.ts 导出配置');
    process.exit(1);
  }
  
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  console.log(`✅ 读取到 ${data.length} 条配置\n`);
  
  // 调用生产环境 API 更新配置
  try {
    const response = await fetch(`${PROD_URL}/api/admin/v1/migration/update-llm-config`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API 请求失败: ${response.status} ${response.statusText}`);
      console.error('响应内容:', errorText);
      process.exit(1);
    }
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ 配置更新成功！');
      console.log(`   新增记录数: ${result.data?.inserted || 0}`);
      console.log(`   更新记录数: ${result.data?.updated || 0}`);
      console.log(`   失败记录数: ${result.data?.failed || 0}`);
    } else {
      console.error('❌ 配置更新失败:', result.error);
      process.exit(1);
    }
    
  } catch (error: any) {
    console.error('❌ 导入失败:', error.message);
    process.exit(1);
  }
}

importLLMConfigToProd()
  .then(() => {
    console.log('\n✅ 导入完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 导入失败:', error);
    process.exit(1);
  });

