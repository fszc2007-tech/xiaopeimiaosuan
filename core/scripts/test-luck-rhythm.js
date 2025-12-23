/**
 * 测试行运节奏卡片功能
 * 
 * 运行方式：
 * node core/scripts/test-luck-rhythm.js
 */

import { BaziEngine } from '../engine/index.js';

const testCases = [
  {
    name: '测试案例1：正常大运',
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
  },
  {
    name: '测试案例2：未入大运（0岁）',
    birthJson: {
      year: 2024,
      month: 1,
      day: 1,
      hour: 10,
      minute: 0,
      sex: 'male',
      calendar_type: 'solar',
      use_tst: false
    }
  },
  {
    name: '测试案例3：女性',
    birthJson: {
      year: 1985,
      month: 8,
      day: 20,
      hour: 14,
      minute: 0,
      sex: 'female',
      calendar_type: 'solar',
      use_tst: false
    }
  }
];

async function testLuckRhythm() {
  const engine = new BaziEngine();
  
  console.log('='.repeat(80));
  console.log('开始测试行运节奏功能');
  console.log('='.repeat(80));
  console.log('');
  
  for (const testCase of testCases) {
    try {
      console.log(`\n${'─'.repeat(80)}`);
      console.log(`测试案例：${testCase.name}`);
      console.log(`出生日期：${testCase.birthJson.year}-${testCase.birthJson.month}-${testCase.birthJson.day} ${testCase.birthJson.hour}:${testCase.birthJson.minute}`);
      console.log(`${'─'.repeat(80)}\n`);
      
      const result = await engine.compute(testCase.birthJson);
      
      // 检查 luckRhythm 是否存在
      if (!result.analysis?.luckRhythm) {
        console.error('❌ 错误：luckRhythm 不存在！');
        console.log('analysis 对象：', Object.keys(result.analysis || {}));
        continue;
      }
      
      const luckRhythm = result.analysis.luckRhythm;
      
      // 验证所有必需字段
      const requiredFields = [
        'startAge',
        'luckDirection',
        'currentAge',
        'currentLuck',
        'prevNextLuckSummary',
        'currentYear',
        'comingYearsTrend',
        'notes',
      ];
      
      console.log('✅ luckRhythm 已生成');
      console.log('');
      
      // 检查每个字段
      let allFieldsValid = true;
      
      for (const field of requiredFields) {
        if (luckRhythm[field] === undefined) {
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
      
      // 基础信息
      console.log('【基础信息】');
      console.log(`  起运年龄: ${luckRhythm.startAge} 岁`);
      console.log(`  行运方向: ${luckRhythm.luckDirection}`);
      console.log(`  当前年龄: ${luckRhythm.currentAge} 岁`);
      console.log('');
      
      // 当前大运
      console.log('【当前大运】');
      console.log(`  标签: ${luckRhythm.currentLuck.label}`);
      console.log(`  年龄区间: ${luckRhythm.currentLuck.ageRange}`);
      console.log(`  天干: ${luckRhythm.currentLuck.stem}`);
      console.log(`  地支: ${luckRhythm.currentLuck.branch}`);
      console.log(`  十神: ${luckRhythm.currentLuck.tenGod}`);
      console.log(`  五行: ${luckRhythm.currentLuck.element}`);
      console.log(`  喜忌: ${luckRhythm.currentLuck.favourLevel}`);
      console.log(`  阶段: ${luckRhythm.currentLuck.stage}`);
      console.log(`  强度: ${luckRhythm.currentLuck.intensity}`);
      console.log(`  主领域: ${luckRhythm.currentLuck.mainDomains.join('、') || '无'}`);
      console.log(`  基调: ${luckRhythm.currentLuck.tone}`);
      console.log(`  作用力度: ${luckRhythm.currentLuck.strengthScore.toFixed(2)}`);
      console.log(`  冲合刑害: ${luckRhythm.currentLuck.clashHarmPunish.join('、') || '无'}`);
      console.log('');
      
      // 上一运/下一运
      console.log('【上一运/下一运】');
      if (luckRhythm.prevNextLuckSummary.prev) {
        console.log(`  上一运: ${luckRhythm.prevNextLuckSummary.prev.label}`);
        console.log(`  上一运说明: ${luckRhythm.prevNextLuckSummary.prev.shortComment}`);
      }
      if (luckRhythm.prevNextLuckSummary.next) {
        console.log(`  下一运: ${luckRhythm.prevNextLuckSummary.next.label}`);
        console.log(`  下一运说明: ${luckRhythm.prevNextLuckSummary.next.shortComment}`);
      }
      if (luckRhythm.prevNextLuckSummary.stageShiftHint) {
        console.log(`  阶段转换: ${luckRhythm.prevNextLuckSummary.stageShiftHint}`);
      }
      console.log('');
      
      // 当前流年
      console.log('【当前流年】');
      console.log(`  年份: ${luckRhythm.currentYear.year}`);
      console.log(`  作用: ${luckRhythm.currentYear.effect}`);
      console.log(`  描述: ${luckRhythm.currentYear.description}`);
      console.log('');
      
      // 未来趋势
      console.log('【未来趋势】');
      console.log(`  倾向: ${luckRhythm.comingYearsTrend.tendency}`);
      console.log(`  总结: ${luckRhythm.comingYearsTrend.summary}`);
      console.log('');
      
      // 补充提示
      if (luckRhythm.notes.length > 0) {
        console.log('【补充提示】');
        luckRhythm.notes.forEach((note, idx) => {
          console.log(`  ${idx + 1}. ${note}`);
        });
        console.log('');
      }
      
      // 验证字段值的有效性
      console.log('🔍 字段值验证：');
      console.log('');
      
      // 验证阶段类型
      const validStages = ['打基础期', '拓展冲刺期', '调整转折期', '沉淀收获期'];
      if (!validStages.includes(luckRhythm.currentLuck.stage)) {
        console.error(`❌ currentLuck.stage 值无效: ${luckRhythm.currentLuck.stage}`);
      } else {
        console.log(`✅ currentLuck.stage: ${luckRhythm.currentLuck.stage}`);
      }
      
      // 验证强度类型
      const validIntensities = ['偏平稳', '起伏感较强', '变动明显'];
      if (!validIntensities.includes(luckRhythm.currentLuck.intensity)) {
        console.error(`❌ currentLuck.intensity 值无效: ${luckRhythm.currentLuck.intensity}`);
      } else {
        console.log(`✅ currentLuck.intensity: ${luckRhythm.currentLuck.intensity}`);
      }
      
      // 验证喜忌类型
      const validFavourLevels = ['用神', '中性', '忌神'];
      if (!validFavourLevels.includes(luckRhythm.currentLuck.favourLevel)) {
        console.error(`❌ currentLuck.favourLevel 值无效: ${luckRhythm.currentLuck.favourLevel}`);
      } else {
        console.log(`✅ currentLuck.favourLevel: ${luckRhythm.currentLuck.favourLevel}`);
      }
      
      // 验证流年作用类型
      const validYearEffects = ['推动', '减速', '提醒调整'];
      if (!validYearEffects.includes(luckRhythm.currentYear.effect)) {
        console.error(`❌ currentYear.effect 值无效: ${luckRhythm.currentYear.effect}`);
      } else {
        console.log(`✅ currentYear.effect: ${luckRhythm.currentYear.effect}`);
      }
      
      // 验证未来趋势类型
      const validTendencies = ['整体偏顺', '有起伏的小坡道', '以调整为主'];
      if (!validTendencies.includes(luckRhythm.comingYearsTrend.tendency)) {
        console.error(`❌ comingYearsTrend.tendency 值无效: ${luckRhythm.comingYearsTrend.tendency}`);
      } else {
        console.log(`✅ comingYearsTrend.tendency: ${luckRhythm.comingYearsTrend.tendency}`);
      }
      
      console.log('\n✅ 测试通过！');
      
    } catch (error) {
      console.error(`\n❌ 测试失败：${error.message}`);
      console.error(error.stack);
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('测试完成');
  console.log('='.repeat(80));
}

// 运行测试
testLuckRhythm().catch(console.error);





