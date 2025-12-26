/**
 * 通过 Migration API 查询生产环境表结构
 */

import axios from 'axios';

async function queryProdSchema() {
  console.log('🔍 查询生产环境表结构...\n');
  
  const apiBaseUrl = 'https://xiaopei-core-343578696044.asia-east2.run.app';
  
  try {
    // 尝试通过 Migration API 查询
    console.log('📋 尝试通过 Migration API 查询...\n');
    const response = await axios.get(`${apiBaseUrl}/api/admin/v1/migration/schema`, {
      timeout: 10000,
    });
    
    if (!response.data.success) {
      console.error('❌ API 返回失败:', response.data.error);
      return;
    }
    
    const { tables, schemas } = response.data.data;
    
    console.log(`✅ 生产环境表数量: ${tables.length}\n`);
    console.log('📋 表列表:');
    tables.forEach((table: string, index: number) => {
      console.log(`${index + 1}. ${table}`);
    });
    
    console.log('\n📊 关键表结构对比:\n');
    const keyTables = ['llm_api_configs', 'conversations', 'users', 'messages', 'verification_codes', 'shensha_readings'];
    
    for (const table of keyTables) {
      if (table in schemas) {
        const cols = schemas[table].columns;
        const colNames = cols.map((c: any) => c.field);
        console.log(`表 ${table}:`);
        console.log(`  列数: ${cols.length}`);
        if (colNames.length <= 10) {
          console.log(`  列: ${colNames.join(', ')}`);
        } else {
          console.log(`  列: ${colNames.slice(0, 10).join(', ')}...`);
        }
        console.log('');
      } else {
        console.log(`表 ${table}: ❌ 不存在\n`);
      }
    }
    
  } catch (error: any) {
    if (error.response?.status === 404) {
      console.error('❌ API 端点不存在（可能未部署）');
      console.error('   请先部署包含 migration/schema 端点的代码');
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      console.error('❌ 无法连接到生产环境');
      console.error(`   错误: ${error.message}`);
    } else {
      console.error('❌ 查询失败:', error.message);
    }
    
    console.log('\n💡 替代方案:');
    console.log('   1. 通过 Cloud SQL Proxy 直接查询');
    console.log('   2. 或等待 Migration API 部署后重试');
  }
}

queryProdSchema()
  .then(() => {
    console.log('\n✅ 查询完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 查询失败:', error);
    process.exit(1);
  });

