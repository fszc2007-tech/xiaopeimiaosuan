/**
 * 测试行运节奏 Prompt 生成
 * 
 * 运行方式：
 * node core/scripts/test-luck-rhythm-prompt.js
 */

import { BaziEngine } from '../engine/index.js';
import { buildOverviewPrompt } from '../src/modules/prompt/promptTemplates.js';

const testCase = {
  name: '测试 Prompt 生成',
  birthJson: {
    year: 1990,
    month: 5,
    day: 15,
    hour: 10,
    minute: 30,
    sex: 'male',
    calendar_type: 'solar',
    use_tst: false
  }
};

async function testLuckRhythmPrompt() {
  const engine = new BaziEngine();
  
  console.log('='.repeat(80));
  console.log('开始测试行运节奏 Prompt 生成');
  console.log('='.repeat(80));
  console.log('');
  
  try {
    console.log(`测试案例：${testCase.name}`);
    console.log(`出生日期：${testCase.birthJson.year}-${testCase.birthJson.month}-${testCase.birthJson.day} ${testCase.birthJson.hour}:${testCase.birthJson.minute}`);
    console.log('');
    
    // 1. 计算命盘
    const result = await engine.compute(testCase.birthJson);
    
    // 2. 检查 luckRhythm 是否存在
    if (!result.analysis?.luckRhythm) {
      console.error('❌ 错误：luckRhythm 不存在！');
      console.log('analysis 对象：', Object.keys(result.analysis || {}));
      return;
    }
    
    console.log('✅ luckRhythm 数据已生成');
    console.log('');
    
    // 3. 生成 Prompt
    const prompt = buildOverviewPrompt({
      sectionKey: 'luckRhythm',
      userQuestion: '請詳細解讀我的行運節奏',
      baziData: result,
    });
    
    console.log('✅ Prompt 已生成');
    console.log('');
    
    // 4. 显示 Prompt（截取前 1000 字符）
    console.log('📝 Prompt 内容（前 1000 字符）：');
    console.log('─'.repeat(80));
    console.log(prompt.substring(0, 1000));
    console.log('...');
    console.log('─'.repeat(80));
    console.log('');
    
    // 5. 检查 Prompt 是否包含关键信息
    console.log('🔍 Prompt 内容检查：');
    console.log('');
    
    const checks = [
      { key: 'luckRhythm', text: 'luckRhythm' },
      { key: 'currentLuck', text: 'currentLuck' },
      { key: 'stage', text: 'stage' },
      { key: 'currentYear', text: 'currentYear' },
      { key: 'comingYearsTrend', text: 'comingYearsTrend' },
      { key: 'stagePosition', text: 'stagePosition' },
      { key: 'luckTheme', text: 'luckTheme' },
      { key: 'yearTrend', text: 'yearTrend' },
      { key: 'advice', text: 'advice' },
    ];
    
    let allChecksPassed = true;
    for (const check of checks) {
      if (prompt.includes(check.text)) {
        console.log(`✅ 包含 "${check.text}"`);
      } else {
        console.error(`❌ 缺少 "${check.text}"`);
        allChecksPassed = false;
      }
    }
    
    console.log('');
    
    if (allChecksPassed) {
      console.log('✅ 所有检查通过！');
    } else {
      console.log('❌ 部分检查失败，请检查 Prompt 模板！');
    }
    
    // 6. 显示 Prompt 长度
    console.log('');
    console.log(`📏 Prompt 总长度: ${prompt.length} 字符`);
    
  } catch (error) {
    console.error(`\n❌ 测试失败：${error.message}`);
    console.error(error.stack);
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('测试完成');
  console.log('='.repeat(80));
}

// 运行测试
testLuckRhythmPrompt().catch(console.error);

