/**
 * 将神煞数据导入到生产环境
 * 通过 API 端点执行
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const PROD_URL = 'https://xiaopei-core-343578696044.asia-east2.run.app';

async function importShenshaDataToProd() {
  console.log('📥 导入神煞数据到生产环境...\n');
  
  // 读取导出的数据
  const dataPath = path.join(__dirname, '../data/shensha_readings_export.json');
  
  if (!fs.existsSync(dataPath)) {
    console.error(`❌ 数据文件不存在: ${dataPath}`);
    console.error('   请先运行 export-shensha-data.ts 导出数据');
    process.exit(1);
  }
  
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  console.log(`✅ 读取到 ${data.length} 条数据\n`);
  
  // 调用生产环境 API 导入数据
  try {
    const response = await fetch(`${PROD_URL}/api/admin/v1/migration/import-shensha`, {
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
    
    const result: any = await response.json();
    
    if (result.success) {
      console.log('✅ 数据导入成功！');
      console.log(`   导入记录数: ${result.data?.imported || 0}`);
      console.log(`   更新记录数: ${result.data?.updated || 0}`);
      console.log(`   失败记录数: ${result.data?.failed || 0}`);
    } else {
      console.error('❌ 数据导入失败:', result.error);
      process.exit(1);
    }
    
  } catch (error: any) {
    console.error('❌ 导入失败:', error.message);
    process.exit(1);
  }
}

importShenshaDataToProd()
  .then(() => {
    console.log('\n✅ 导入完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 导入失败:', error);
    process.exit(1);
  });

