/**
 * 能量流通卡片测试脚本
 * 
 * 测试 buildEnergyFlowMetrics 函数是否正确生成数据
 * 
 * 运行方式：node core/scripts/test-energy-flow.mjs
 */

import { BaziEngine } from '../engine/index.js';

const testCases = [
  {
    name: '测试案例1：丙火日主',
    birthJson: {
      year: 1990,
      month: 6,
      day: 15,
      hour: 14,
      minute: 30,
      gender: 'male',
      timezone: 'Asia/Shanghai',
      location: {
        latitude: 39.9042,
        longitude: 116.4074
      },
      use_tst: false
    }
  },
  {
    name: '测试案例2：甲木日主',
    birthJson: {
      year: 1985,
      month: 3,
      day: 20,
      hour: 10,
      minute: 0,
      gender: 'female',
      timezone: 'Asia/Shanghai',
      location: {
        latitude: 31.2304,
        longitude: 121.4737
      },
      use_tst: false
    }
  }
];

async function testEnergyFlow() {
  const engine = new BaziEngine();
  
  console.log('='.repeat(80));
  console.log('开始测试能量流通功能');
  console.log('='.repeat(80));
  console.log('');
  
  for (const testCase of testCases) {
    try {
      console.log(`\n${'─'.repeat(80)}`);
      console.log(`测试案例：${testCase.name}`);
      console.log(`出生日期：${testCase.birthJson.year}-${testCase.birthJson.month}-${testCase.birthJson.day} ${testCase.birthJson.hour}:${testCase.birthJson.minute}`);
      console.log(`${'─'.repeat(80)}\n`);
      
      const result = await engine.compute(testCase.birthJson);
      
      // 检查 energyFlow 是否存在
      if (!result.analysis?.energyFlow) {
        console.error('❌ 错误：energyFlow 不存在！');
        console.log('analysis 对象：', Object.keys(result.analysis || {}));
        continue;
      }
      
      const energyFlow = result.analysis.energyFlow;
      
      // 验证所有必需字段
      const requiredFields = [
        'dmStrengthLevel',
        'structure',
        'yongshenSummary',
        'wuxingBalanceSummary',
        'workPathCount',
        'coreWorkPaths',
        'otherWorkPaths',
        'flowScore',
        'flowLevel',
        'mainFlowDirections',
        'summary',
        'riskFlags',
        'notes'
      ];
      
      console.log('✅ energyFlow 已生成');
      console.log('');
      
      // 检查每个字段
      let allFieldsValid = true;
      
      for (const field of requiredFields) {
        if (energyFlow[field] === undefined) {
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
      console.log(`  日主强弱：${energyFlow.dmStrengthLevel}`);
      console.log(`  格局类型：${energyFlow.structure}`);
      console.log(`  用神喜忌：${energyFlow.yongshenSummary}`);
      console.log(`  五行概况：${energyFlow.wuxingBalanceSummary}`);
      console.log('');
      
      // 做功路径
      console.log('【做功路径】');
      console.log(`  路径数量：${energyFlow.workPathCount}条`);
      console.log(`  核心路径：${energyFlow.coreWorkPaths.length}条`);
      if (energyFlow.coreWorkPaths.length > 0) {
        energyFlow.coreWorkPaths.forEach((path, idx) => {
          console.log(`    ${idx + 1}. ${path.label}（${path.type}，强度：${path.strength.toFixed(2)}）`);
        });
      }
      console.log(`  其他路径：${energyFlow.otherWorkPaths.length}条`);
      console.log('');
      
      // 流通度
      console.log('【流通度评估】');
      console.log(`  流通度分数：${energyFlow.flowScore}/100`);
      console.log(`  流通等级：${energyFlow.flowLevel}`);
      if (energyFlow.mainFlowDirections.length > 0) {
        console.log(`  主要流通方向：`);
        energyFlow.mainFlowDirections.forEach((dir, idx) => {
          console.log(`    ${idx + 1}. ${dir.label}（权重：${dir.weight.toFixed(2)}）`);
        });
      }
      console.log('');
      
      // 风险标志
      console.log('【风险标志】');
      if (energyFlow.riskFlags.length > 0) {
        energyFlow.riskFlags.forEach((flag, idx) => {
          console.log(`  ${idx + 1}. ${flag}`);
        });
      } else {
        console.log('  无风险标志');
      }
      console.log('');
      
      // 一句话总结
      console.log('【一句话总结】');
      console.log(`  ${energyFlow.summary}`);
      console.log('');
      
      // 调试信息（可选）
      if (energyFlow.debug) {
        console.log('【调试信息】');
        console.log(`  五行权重：`, energyFlow.debug.wuxingWeights);
        console.log(`  十神权重：`, energyFlow.debug.tenGodWeights);
        console.log(`  格局标签：`, energyFlow.debug.patternTags);
        console.log(`  救应标签：`, energyFlow.debug.rescueTags);
        console.log('');
      }
      
      console.log('✅ 测试通过！');
      
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
testEnergyFlow().catch(console.error);





