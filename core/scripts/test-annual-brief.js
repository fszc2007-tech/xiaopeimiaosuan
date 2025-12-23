/**
 * 测试未来十年流年列表功能
 * 
 * 运行方式：
 * node core/scripts/test-annual-brief.js
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
    name: '测试案例2：女性',
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
  },
];

async function testAnnualBrief() {
  const engine = new BaziEngine();
  
  console.log('='.repeat(80));
  console.log('开始测试未来十年流年列表功能');
  console.log('='.repeat(80));
  console.log('');
  
  for (const testCase of testCases) {
    try {
      console.log(`\n${'─'.repeat(80)}`);
      console.log(`测试案例：${testCase.name}`);
      console.log(`出生日期：${testCase.birthJson.year}-${testCase.birthJson.month}-${testCase.birthJson.day} ${testCase.birthJson.hour}:${testCase.birthJson.minute}`);
      console.log(`${'─'.repeat(80)}\n`);
      
      // 1. 计算命盘
      const result = await engine.compute(testCase.birthJson);
      
      // 2. 检查 luckRhythm 是否存在
      if (!result.analysis?.luckRhythm) {
        console.error('❌ 错误：luckRhythm 不存在！');
        console.log('analysis 对象：', Object.keys(result.analysis || {}));
        continue;
      }
      
      // 3. 检查 annualBrief 是否存在
      const annualBrief = result.analysis.luckRhythm.annualBrief;
      
      if (!annualBrief) {
        console.error('❌ 错误：annualBrief 不存在！');
        console.log('luckRhythm 对象：', Object.keys(result.analysis.luckRhythm || {}));
        continue;
      }
      
      console.log('✅ annualBrief 已生成');
      console.log(`✅ 共 ${annualBrief.length} 年数据\n`);
      
      // 4. 验证数据结构
      console.log('📊 数据结构验证：');
      console.log('');
      
      const requiredFields = ['year', 'ganzhi', 'tenGod', 'favourLevel', 'highlightTag', 'meta'];
      let allValid = true;
      
      for (let i = 0; i < Math.min(3, annualBrief.length); i++) {
        const item = annualBrief[i];
        console.log(`【第 ${i + 1} 年】${item.year}年`);
        
        for (const field of requiredFields) {
          if (item[field] === undefined) {
            console.error(`  ❌ ${field} 字段缺失`);
            allValid = false;
          } else {
            console.log(`  ✅ ${field}: ${JSON.stringify(item[field])}`);
          }
        }
        console.log('');
      }
      
      if (!allValid) {
        console.log('❌ 部分字段缺失，请检查代码！\n');
        continue;
      }
      
      // 5. 显示完整列表
      console.log('📋 未来十年流年列表：');
      console.log('');
      console.log('年份 | 干支 | 十神 | 标签 | 喜忌 | 当前年 | 大运索引');
      console.log('─'.repeat(70));
      
      annualBrief.forEach((item) => {
        const year = String(item.year).padEnd(4);
        const ganzhi = (item.ganzhi || '').padEnd(6);
        const tenGod = (item.tenGod || '').padEnd(6);
        const tag = item.highlightTag.padEnd(12);
        const level = item.favourLevel.padEnd(6);
        const isCurrent = item.meta?.isCurrentYear ? '✓' : ' ';
        const luckIndex = String(item.meta?.luckIndex ?? '?').padEnd(6);
        
        console.log(`${year} | ${ganzhi} | ${tenGod} | ${tag} | ${level} | ${isCurrent}     | ${luckIndex}`);
      });
      
      console.log('');
      
      // 6. 统计信息
      console.log('📈 统计信息：');
      console.log('');
      
      const tagCounts = {};
      const levelCounts = {};
      let currentYearIndex = -1;
      
      annualBrief.forEach((item, index) => {
        // 统计标签
        tagCounts[item.highlightTag] = (tagCounts[item.highlightTag] || 0) + 1;
        // 统计喜忌
        levelCounts[item.favourLevel] = (levelCounts[item.favourLevel] || 0) + 1;
        // 查找当前年份
        if (item.meta?.isCurrentYear) {
          currentYearIndex = index;
        }
      });
      
      console.log('标签分布：');
      Object.entries(tagCounts).forEach(([tag, count]) => {
        console.log(`  ${tag}: ${count} 年`);
      });
      
      console.log('\n喜忌分布：');
      Object.entries(levelCounts).forEach(([level, count]) => {
        console.log(`  ${level}: ${count} 年`);
      });
      
      if (currentYearIndex >= 0) {
        console.log(`\n✅ 当前年份：${annualBrief[currentYearIndex].year}年（索引 ${currentYearIndex}）`);
      } else {
        console.log('\n⚠️  未找到当前年份标记');
      }
      
      // 7. 检查跨大运情况
      console.log('\n🔄 跨大运检查：');
      let prevLuckIndex = null;
      let crossCount = 0;
      
      annualBrief.forEach((item) => {
        const currentLuckIndex = item.meta?.luckIndex;
        if (prevLuckIndex !== null && prevLuckIndex !== currentLuckIndex) {
          crossCount++;
          console.log(`  ⚠️  在 ${item.year} 年跨大运：从第 ${prevLuckIndex} 步到第 ${currentLuckIndex} 步`);
        }
        prevLuckIndex = currentLuckIndex;
      });
      
      if (crossCount === 0) {
        console.log('  ✅ 未来10年都在同一大运内');
      } else {
        console.log(`  ✅ 共 ${crossCount} 次跨大运`);
      }
      
      console.log('\n✅ 测试通过！\n');
      
    } catch (error) {
      console.error('❌ 测试失败：', error);
      console.error(error.stack);
      console.log('');
    }
  }
  
  console.log('='.repeat(80));
  console.log('测试完成');
  console.log('='.repeat(80));
}

testAnnualBrief().catch(console.error);





