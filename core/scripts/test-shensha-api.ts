/**
 * 测试神煞解读 API
 * 
 * 运行方式：
 * npx ts-node core/scripts/test-shensha-api.ts
 */

import 'dotenv/config';
import * as shenshaReadingService from '../src/modules/shensha/shenshaReadingService';
import { createConnection, getPool } from '../src/database/connection';

// 初始化数据库连接
createConnection();

async function testShenshaAPI() {
  console.log('🧪 开始测试神煞解读 API...\n');

  // 测试用例
  const testCases = [
    { code: 'tai_ji_gui_ren', pillarType: 'year' as const, name: '太极贵人-年柱' },
    { code: 'tian_yi_gui_ren', pillarType: 'month' as const, name: '天乙贵人-月柱' },
    { code: 'tao_hua', pillarType: 'day' as const, name: '桃花-日柱' },
    { code: 'hong_luan', pillarType: 'hour' as const, name: '红鸾-时柱' },
  ];

  let successCount = 0;
  let failCount = 0;

  for (const testCase of testCases) {
    try {
      console.log(`📋 测试: ${testCase.name}`);
      const result = await shenshaReadingService.getShenshaReading(
        testCase.code,
        testCase.pillarType
      );

      if (result) {
        console.log(`  ✅ 成功获取数据`);
        // 使用 JSON.stringify 来正确显示中文
        console.log(`     - 名称: ${JSON.stringify(result.name)}`);
        console.log(`     - 类型: ${result.type}`);
        console.log(`     - 徽标: ${JSON.stringify(result.badge_text)}`);
        console.log(`     - 短标题: ${JSON.stringify(result.short_title || '(无)')}`);
        console.log(`     - 总结: ${JSON.stringify(result.summary.substring(0, 50))}...`);
        console.log(`     - 要点数: ${result.bullet_points.length}`);
        console.log(`     - 推荐问题数: ${result.recommended_questions.length}`);
        console.log(`     - 柱位解读: ${JSON.stringify(result.pillar_explanation[0]?.text?.substring(0, 50) || '')}...`);
        successCount++;
      } else {
        console.log(`  ❌ 未找到数据`);
        failCount++;
      }
    } catch (error: any) {
      console.log(`  ❌ 错误: ${error.message}`);
      failCount++;
    }
    console.log('');
  }

  console.log('📊 测试结果:');
  console.log(`   ✅ 成功: ${successCount}`);
  console.log(`   ❌ 失败: ${failCount}`);
  console.log(`   📈 成功率: ${((successCount / testCases.length) * 100).toFixed(1)}%`);
}

// 运行测试
testShenshaAPI().catch(console.error);

