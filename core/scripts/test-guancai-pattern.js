/**
 * 测试官財格局功能
 * 
 * 运行方式：node core/scripts/test-guancai-pattern.js
 */

import { BaziEngine } from '../engine/index.js';

// 测试命盘数据（示例）
const testCases = [
  {
    name: '测试案例1：正官格',
    birthDate: {
      year: 1990,
      month: 3,
      day: 15,
      hour: 10,
      minute: 30
    },
    gender: 'male',
    timezone: 'Asia/Shanghai',
    location: {
      latitude: 39.9042,
      longitude: 116.4074
    }
  },
  {
    name: '测试案例2：七杀格',
    birthDate: {
      year: 1985,
      month: 7,
      day: 20,
      hour: 14,
      minute: 0
    },
    gender: 'female',
    timezone: 'Asia/Shanghai',
    location: {
      latitude: 39.9042,
      longitude: 116.4074
    }
  },
  {
    name: '测试案例3：财格',
    birthDate: {
      year: 1992,
      month: 11,
      day: 8,
      hour: 9,
      minute: 15
    },
    gender: 'male',
    timezone: 'Asia/Shanghai',
    location: {
      latitude: 39.9042,
      longitude: 116.4074
    }
  }
];

async function testGuancaiPattern() {
  const engine = new BaziEngine();
  
  console.log('='.repeat(80));
  console.log('开始测试官財格局功能');
  console.log('='.repeat(80));
  console.log('');
  
  for (const testCase of testCases) {
    try {
      console.log(`\n${'─'.repeat(80)}`);
      console.log(`测试案例：${testCase.name}`);
      console.log(`出生日期：${testCase.birthDate.year}-${testCase.birthDate.month}-${testCase.birthDate.day} ${testCase.birthDate.hour}:${testCase.birthDate.minute}`);
      console.log(`${'─'.repeat(80)}\n`);
      
      const result = await engine.compute({
        birthDate: testCase.birthDate,
        gender: testCase.gender,
        timezone: testCase.timezone,
        location: testCase.location
      });
      
      // 检查 guancaiPattern 是否存在
      if (!result.analysis?.guancaiPattern) {
        console.error('❌ 错误：guancaiPattern 不存在！');
        console.log('analysis 对象：', Object.keys(result.analysis || {}));
        continue;
      }
      
      const guancaiPattern = result.analysis.guancaiPattern;
      
      // 验证所有必需字段
      const requiredFields = [
        'careerPattern',
        'wealthPattern',
        'incomeMode',
        'stability',
        'riskFactors',
        'supportFactors',
        'workPatterns'
      ];
      
      console.log('✅ guancaiPattern 已生成');
      console.log('');
      
      // 检查每个字段
      let allFieldsValid = true;
      
      for (const field of requiredFields) {
        if (!guancaiPattern[field]) {
          console.error(`❌ 错误：${field} 字段缺失！`);
          allFieldsValid = false;
        } else {
          console.log(`✅ ${field}: 存在`);
        }
      }
      
      if (!allFieldsValid) {
        console.log('\n❌ 部分字段缺失，请检查代码！');
        continue;
      }
      
      // 详细输出每个字段的值
      console.log('\n📊 详细字段值：');
      console.log('');
      
      // careerPattern
      console.log('【事业格局】');
      console.log(`  官杀类型: ${guancaiPattern.careerPattern.officerType}`);
      console.log(`  结构标签: ${guancaiPattern.careerPattern.structureTag}`);
      console.log(`  强度分数: ${guancaiPattern.careerPattern.strength.score}`);
      console.log(`  强度等级: ${guancaiPattern.careerPattern.strength.level}`);
      console.log('');
      
      // wealthPattern
      console.log('【财星格局】');
      console.log(`  财星类型: ${guancaiPattern.wealthPattern.wealthType}`);
      console.log(`  强度分数: ${guancaiPattern.wealthPattern.strength.score}`);
      console.log(`  强度等级: ${guancaiPattern.wealthPattern.strength.level}`);
      console.log(`  根气: ${guancaiPattern.wealthPattern.rooting}`);
      console.log('');
      
      // incomeMode
      console.log('【赚钱模式】');
      console.log(`  主要模式: ${guancaiPattern.incomeMode.mainMode}`);
      console.log(`  标签: ${guancaiPattern.incomeMode.tags.join(', ') || '无'}`);
      console.log('');
      
      // stability
      console.log('【稳定度】');
      console.log(`  事业稳定度: ${guancaiPattern.stability.career}`);
      console.log(`  财运稳定度: ${guancaiPattern.stability.wealth}`);
      console.log('');
      
      // riskFactors
      console.log('【风险因素】');
      console.log(`  标签: ${guancaiPattern.riskFactors.tags.length > 0 ? guancaiPattern.riskFactors.tags.join(', ') : '无'}`);
      console.log('');
      
      // supportFactors
      console.log('【助力因素】');
      console.log(`  标签: ${guancaiPattern.supportFactors.tags.length > 0 ? guancaiPattern.supportFactors.tags.join(', ') : '无'}`);
      console.log('');
      
      // workPatterns
      console.log('【做功格局】');
      console.log(`  主做功线: ${guancaiPattern.workPatterns.mainLine || '无'}`);
      console.log(`  相关做功线: ${guancaiPattern.workPatterns.relatedLines.length > 0 ? guancaiPattern.workPatterns.relatedLines.join(', ') : '无'}`);
      console.log('');
      
      // 验证字段值的有效性
      console.log('🔍 字段值验证：');
      
      // 验证 careerPattern
      const validOfficerTypes = ['正官為主', '七殺為主', '官殺並見', '官殺不顯', '無明顯官星'];
      if (!validOfficerTypes.includes(guancaiPattern.careerPattern.officerType)) {
        console.error(`❌ careerPattern.officerType 值无效: ${guancaiPattern.careerPattern.officerType}`);
      } else {
        console.log(`✅ careerPattern.officerType: ${guancaiPattern.careerPattern.officerType}`);
      }
      
      const validStrengthLevels = ['偏弱', '中等', '較強', '很強'];
      if (!validStrengthLevels.includes(guancaiPattern.careerPattern.strength.level)) {
        console.error(`❌ careerPattern.strength.level 值无效: ${guancaiPattern.careerPattern.strength.level}`);
      } else {
        console.log(`✅ careerPattern.strength.level: ${guancaiPattern.careerPattern.strength.level}`);
      }
      
      // 验证 wealthPattern
      const validWealthTypes = ['正財為主', '偏財為主', '財官均衡', '財弱', '比劫奪財'];
      if (!validWealthTypes.includes(guancaiPattern.wealthPattern.wealthType)) {
        console.error(`❌ wealthPattern.wealthType 值无效: ${guancaiPattern.wealthPattern.wealthType}`);
      } else {
        console.log(`✅ wealthPattern.wealthType: ${guancaiPattern.wealthPattern.wealthType}`);
      }
      
      const validRooting = ['有根', '部分有根', '無根'];
      if (!validRooting.includes(guancaiPattern.wealthPattern.rooting)) {
        console.error(`❌ wealthPattern.rooting 值无效: ${guancaiPattern.wealthPattern.rooting}`);
      } else {
        console.log(`✅ wealthPattern.rooting: ${guancaiPattern.wealthPattern.rooting}`);
      }
      
      // 验证 incomeMode
      const validIncomeModes = ['穩定工資型', '浮動績效型', '機會偏財型', '創業經營型'];
      if (!validIncomeModes.includes(guancaiPattern.incomeMode.mainMode)) {
        console.error(`❌ incomeMode.mainMode 值无效: ${guancaiPattern.incomeMode.mainMode}`);
      } else {
        console.log(`✅ incomeMode.mainMode: ${guancaiPattern.incomeMode.mainMode}`);
      }
      
      // 验证 stability
      const validCareerStability = ['穩定', '偏穩', '多變', '多波折'];
      if (!validCareerStability.includes(guancaiPattern.stability.career)) {
        console.error(`❌ stability.career 值无效: ${guancaiPattern.stability.career}`);
      } else {
        console.log(`✅ stability.career: ${guancaiPattern.stability.career}`);
      }
      
      const validWealthStability = ['穩定', '偏穩', '起伏大', '周期波動'];
      if (!validWealthStability.includes(guancaiPattern.stability.wealth)) {
        console.error(`❌ stability.wealth 值无效: ${guancaiPattern.stability.wealth}`);
      } else {
        console.log(`✅ stability.wealth: ${guancaiPattern.stability.wealth}`);
      }
      
      console.log('\n✅ 测试案例通过！');
      
    } catch (error) {
      console.error(`\n❌ 测试案例失败：${testCase.name}`);
      console.error('错误信息：', error.message);
      console.error('错误堆栈：', error.stack);
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('测试完成');
  console.log('='.repeat(80));
}

// 运行测试
testGuancaiPattern().catch(error => {
  console.error('测试执行失败：', error);
  process.exit(1);
});





