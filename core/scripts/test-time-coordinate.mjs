/**
 * 测试时间坐标卡片功能
 * 
 * 验证：
 * 1. buildTimeCoordinateMetrics 是否正确计算
 * 2. 数据结构是否符合预期
 * 3. 错误处理是否正常
 */

import { BaziEngine } from '../engine/index.js';

const testCases = [
  {
    name: '测试案例 1：正常命盘',
    birthJson: {
      sex: 'male',
      calendar_type: '公历',
      year: 1990,
      month: 5,
      day: 15,
      hour: 10,
      minute: 30,
      tz: '+08:00',
      use_tst: false
    }
  },
  {
    name: '测试案例 2：女性命盘',
    birthJson: {
      sex: 'female',
      calendar_type: '公历',
      year: 1995,
      month: 8,
      day: 20,
      hour: 14,
      minute: 0,
      tz: '+08:00',
      use_tst: false
    }
  }
];

async function testTimeCoordinate() {
  const engine = new BaziEngine();
  
  console.log('='.repeat(80));
  console.log('开始测试时间坐标功能');
  console.log('='.repeat(80));
  console.log('');
  
  for (const testCase of testCases) {
    try {
      console.log(`\n${'─'.repeat(80)}`);
      console.log(`测试案例：${testCase.name}`);
      console.log(`出生日期：${testCase.birthJson.year}-${testCase.birthJson.month}-${testCase.birthJson.day} ${testCase.birthJson.hour}:${testCase.birthJson.minute}`);
      console.log(`${'─'.repeat(80)}\n`);
      
      const result = await engine.compute(testCase.birthJson);
      
      // 检查 timeCoordinate 是否存在
      if (!result.analysis?.timeCoordinate) {
        console.error('❌ 错误：timeCoordinate 不存在！');
        console.log('analysis 对象：', Object.keys(result.analysis || {}));
        continue;
      }
      
      const timeCoordinate = result.analysis.timeCoordinate;
      
      console.log('✅ timeCoordinate 已生成');
      console.log('');
      
      // 检查当前大运
      if (!timeCoordinate.currentDaYun) {
        console.error('❌ 错误：currentDaYun 缺失！');
        continue;
      }
      
      console.log('【当前大运】');
      console.log(`  干支：${timeCoordinate.currentDaYun.stemBranch}`);
      console.log(`  十神：${timeCoordinate.currentDaYun.tenGod}`);
      console.log(`  年龄区间：${timeCoordinate.currentDaYun.ageRange[0]}–${timeCoordinate.currentDaYun.ageRange[1]} 岁`);
      console.log(`  阶段标签：${timeCoordinate.currentDaYun.phaseTag} (${timeCoordinate.currentDaYun.phaseText})`);
      console.log(`  喜忌等级：${timeCoordinate.currentDaYun.favourLevel || '未设置'}`);
      console.log('');
      
      // 检查当前流年
      if (timeCoordinate.currentLiuNian) {
        console.log('【当前流年】');
        console.log(`  干支：${timeCoordinate.currentLiuNian.stemBranch}`);
        console.log(`  年份：${timeCoordinate.currentLiuNian.year}`);
        console.log(`  十神：${timeCoordinate.currentLiuNian.tenGod}`);
        console.log(`  简评：${timeCoordinate.currentLiuNian.shortTag || '未生成'}`);
        console.log(`  风险提示：${timeCoordinate.currentLiuNian.riskTag || '无'}`);
        console.log('');
      } else {
        console.log('⚠️  当前流年数据缺失（可能是计算失败）');
        console.log('');
      }
      
      // 检查当前流月
      if (timeCoordinate.currentLiuYue) {
        console.log('【当前流月】');
        console.log(`  干支：${timeCoordinate.currentLiuYue.stemBranch}`);
        console.log(`  年份：${timeCoordinate.currentLiuYue.year}`);
        console.log(`  月份索引：${timeCoordinate.currentLiuYue.monthIndex || '未设置'}`);
        console.log(`  十神：${timeCoordinate.currentLiuYue.tenGod}`);
        console.log(`  提示：${timeCoordinate.currentLiuYue.shortTip || '未生成'}`);
        console.log('');
      } else {
        console.log('⚠️  当前流月数据缺失（可能是计算失败）');
        console.log('');
      }
      
      // 验证数据结构
      const requiredFields = ['currentDaYun'];
      let allFieldsValid = true;
      
      for (const field of requiredFields) {
        if (!timeCoordinate[field]) {
          console.error(`❌ 错误：${field} 字段缺失！`);
          allFieldsValid = false;
        }
      }
      
      if (allFieldsValid) {
        console.log('✅ 所有必需字段验证通过');
      }
      
    } catch (error) {
      console.error(`❌ 测试失败：${error.message}`);
      console.error(error.stack);
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('测试完成');
  console.log('='.repeat(80));
}

// 运行测试
testTimeCoordinate().catch(console.error);





