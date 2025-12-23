/**
 * 综合纯度算法测试脚本
 * 
 * 用于验证新算法是否符合预期
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { calculateComprehensivePurity } from '../engine/analysis/purity.js';
import { computeDayMasterStrength } from '../engine/analysis/daymaster.js';
import { judgeStructure } from '../engine/analysis/structure.js';

// 注意：这些是 ES 模块，需要确保文件扩展名正确

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载测试用例
const testCasesPath = join(__dirname, 'purity_test_cases.json');
const testCases = JSON.parse(readFileSync(testCasesPath, 'utf-8'));

// 辅助函数：检查分数是否在预期范围内
function isInRange(actual, expectedRange) {
  return actual >= expectedRange[0] && actual <= expectedRange[1];
}

// 辅助函数：打印测试结果
function printTestResult(testCase, result, passed) {
  const status = passed ? '✅' : '❌';
  console.log(`\n${status} ${testCase.name}`);
  console.log(`   描述: ${testCase.description || '无'}`);
  
  if (result) {
    console.log(`   总分: ${result.score} (期望: ${testCase.expected.totalRange[0]}-${testCase.expected.totalRange[1]})`);
    console.log(`   等级: ${result.level} (期望: ${testCase.expected.level})`);
    
    if (result.details) {
      console.log(`   详情:`);
      if (result.details.patternPurity !== undefined) {
        const range = testCase.expected.details?.patternPurity || [0, 30];
        const inRange = isInRange(result.details.patternPurity, range);
        console.log(`     格局纯度: ${result.details.patternPurity} (期望: ${range[0]}-${range[1]}) ${inRange ? '✅' : '❌'}`);
      }
      if (result.details.yongshenStrength !== undefined) {
        const range = testCase.expected.details?.yongshenStrength || [0, 25];
        const inRange = isInRange(result.details.yongshenStrength, range);
        console.log(`     用神得力: ${result.details.yongshenStrength} (期望: ${range[0]}-${range[1]}) ${inRange ? '✅' : '❌'}`);
      }
      if (result.details.wuxingFlow !== undefined) {
        const range = testCase.expected.details?.wuxingFlow || [0, 20];
        const inRange = isInRange(result.details.wuxingFlow, range);
        console.log(`     五行流通: ${result.details.wuxingFlow} (期望: ${range[0]}-${range[1]}) ${inRange ? '✅' : '❌'}`);
      }
      if (result.details.shishenHarmony !== undefined) {
        const range = testCase.expected.details?.shishenHarmony || [0, 15];
        const inRange = isInRange(result.details.shishenHarmony, range);
        console.log(`     十神配合: ${result.details.shishenHarmony} (期望: ${range[0]}-${range[1]}) ${inRange ? '✅' : '❌'}`);
      }
      if (result.details.tiaohouBalance !== undefined) {
        const range = testCase.expected.details?.tiaohouBalance || [0, 10];
        const inRange = isInRange(result.details.tiaohouBalance, range);
        console.log(`     调候得失: ${result.details.tiaohouBalance} (期望: ${range[0]}-${range[1]}) ${inRange ? '✅' : '❌'}`);
      }
    }
  }
  
  if (testCase.notes) {
    console.log(`   备注: ${testCase.notes}`);
  }
}

// 主测试函数
async function runTests() {
  console.log('🧪 开始测试综合纯度算法...\n');
  console.log(`📋 测试用例数量: ${testCases.length}\n`);
  
  let passedCount = 0;
  let failedCount = 0;
  
  for (const testCase of testCases) {
    try {
      // 构建四柱数据
      const pillars = testCase.bazi;
      
      // 计算日主强弱
      const strength = computeDayMasterStrength(pillars, { school: 'ziping' });
      
      // 计算格局
      const structureResult = await judgeStructure(pillars, strength, { school: 'ziping' });
      const structureName = structureResult.structure || '未知格局';
      // W对象可能在_internal中，也可能直接在结果中
      const W = structureResult.W || structureResult._internal?.W || {};
      
      // 计算综合纯度
      const result = calculateComprehensivePurity(
        pillars,
        strength,
        W,
        structureName,
        {
          shishenPatterns: structureResult.shishenPatterns || [],
          pogeFactors: structureResult.pogeFactors || []
        }
      );
      
      // 验证结果
      const totalInRange = isInRange(result.score, testCase.expected.totalRange);
      const levelMatch = result.level === testCase.expected.level;
      
      // 验证详情（如果存在）
      let detailsPassed = true;
      if (result.details && testCase.expected.details) {
        for (const [key, range] of Object.entries(testCase.expected.details)) {
          const actual = result.details[key];
          if (actual !== undefined && !isInRange(actual, range)) {
            detailsPassed = false;
            break;
          }
        }
      }
      
      const passed = totalInRange && levelMatch && detailsPassed;
      
      if (passed) {
        passedCount++;
      } else {
        failedCount++;
      }
      
      printTestResult(testCase, result, passed);
      
    } catch (error) {
      console.error(`\n❌ ${testCase.name} - 测试失败:`);
      console.error(`   错误: ${error.message}`);
      console.error(error.stack);
      failedCount++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`📊 测试结果汇总:`);
  console.log(`   ✅ 通过: ${passedCount}`);
  console.log(`   ❌ 失败: ${failedCount}`);
  console.log(`   📈 通过率: ${((passedCount / testCases.length) * 100).toFixed(1)}%`);
  console.log('='.repeat(60));
  
  if (failedCount === 0) {
    console.log('\n🎉 所有测试通过！');
    process.exit(0);
  } else {
    console.log('\n⚠️  部分测试失败，请检查算法实现');
    process.exit(1);
  }
}

// 运行测试
runTests().catch(error => {
  console.error('测试运行失败:', error);
  process.exit(1);
});

