/**
 * 身强身弱算法测试脚本
 * V3.0 校准样本盘测试
 * 
 * 运行方式: node core/test/daymaster.strength.test.mjs
 */

import { computeDayMasterStrength } from '../engine/analysis/daymaster.js';

// ① 校准样本盘
const SAMPLES = [
  // =========================
  // 1. 明显身强
  // =========================
  {
    id: 'S1',
    title: '甲木寅月，比劫成林（标准身强）',
    pillars: {
      year:  { stem: '甲', branch: '寅' },
      month: { stem: '甲', branch: '寅' },
      day:   { stem: '甲', branch: '寅' },
      hour:  { stem: '丙', branch: '寅' },
    },
    expectedBand: '身强',
  },
  {
    id: 'S2',
    title: '庚金秋生，申金成局（标准身强）',
    pillars: {
      year:  { stem: '庚', branch: '申' },
      month: { stem: '庚', branch: '申' },
      day:   { stem: '庚', branch: '申' },
      hour:  { stem: '壬', branch: '申' },
    },
    expectedBand: '身强',
  },
  {
    id: 'S3',
    title: '丙火夏生，午火旺（身强）',
    pillars: {
      year:  { stem: '丙', branch: '午' },
      month: { stem: '丙', branch: '午' },
      day:   { stem: '丙', branch: '午' },
      hour:  { stem: '戊', branch: '午' },
    },
    expectedBand: '身强',
  },
  {
    id: 'S4',
    title: '戊土四库重，火印生身（土厚身强）',
    pillars: {
      year:  { stem: '戊', branch: '辰' },
      month: { stem: '戊', branch: '戌' },
      day:   { stem: '戊', branch: '辰' },
      hour:  { stem: '丙', branch: '戌' },
    },
    expectedBand: '身强',
  },

  // =========================
  // 2. 明显身弱
  // =========================
  {
    id: 'W1',
    title: '乙木秋生，金重无根（身弱）',
    pillars: {
      year:  { stem: '辛', branch: '酉' },
      month: { stem: '庚', branch: '申' },
      day:   { stem: '乙', branch: '卯' },
      hour:  { stem: '辛', branch: '酉' },
    },
    expectedBand: '身弱',
  },
  {
    id: 'W2',
    title: '壬水夏火土旺，水少根（身弱）',
    pillars: {
      year:  { stem: '丙', branch: '午' },
      month: { stem: '戊', branch: '午' },
      day:   { stem: '壬', branch: '辰' },
      hour:  { stem: '己', branch: '巳' },
    },
    expectedBand: '身弱',
  },
  {
    id: 'W3',
    title: '丙火冬生，水金多（身弱）',
    pillars: {
      year:  { stem: '壬', branch: '子' },
      month: { stem: '癸', branch: '亥' },
      day:   { stem: '丙', branch: '申' },
      hour:  { stem: '戊', branch: '子' },
    },
    expectedBand: '身弱',
  },
  {
    id: 'W4',
    title: '辛金春生，木火多金少根（身弱）',
    pillars: {
      year:  { stem: '甲', branch: '寅' },
      month: { stem: '乙', branch: '卯' },
      day:   { stem: '辛', branch: '酉' },
      hour:  { stem: '丙', branch: '辰' },
    },
    expectedBand: '身弱',
  },

  // =========================
  // 3. 从强候选
  // =========================
  {
    id: 'C1',
    title: '甲木寅卯一片，比劫成林（从强）',
    pillars: {
      year:  { stem: '甲', branch: '寅' },
      month: { stem: '甲', branch: '寅' },
      day:   { stem: '甲', branch: '寅' },
      hour:  { stem: '乙', branch: '卯' },
    },
    expectedBand: '从强',
  },
  {
    id: 'C2',
    title: '壬水冬生，水印一片（从强）',
    pillars: {
      year:  { stem: '壬', branch: '子' },
      month: { stem: '壬', branch: '子' },
      day:   { stem: '壬', branch: '子' },
      hour:  { stem: '癸', branch: '亥' },
    },
    expectedBand: '从强',
  },
  {
    id: 'C3',
    title: '己土四库成势，有印少耗（接近从强）',
    pillars: {
      year:  { stem: '己', branch: '丑' },
      month: { stem: '己', branch: '未' },
      day:   { stem: '己', branch: '辰' },
      hour:  { stem: '丁', branch: '戌' },
    },
    allowedBands: ['身强', '从强'],
  },

  // =========================
  // 4. 从弱候选
  // =========================
  {
    id: 'R1',
    title: '乙木秋生，四支金局（从弱）',
    pillars: {
      year:  { stem: '辛', branch: '酉' },
      month: { stem: '庚', branch: '申' },
      day:   { stem: '乙', branch: '酉' },
      hour:  { stem: '庚', branch: '申' },
    },
    expectedBand: '从弱',
  },
  {
    id: 'R2',
    title: '丙火冬生，水金一片，无火根（从弱）',
    pillars: {
      year:  { stem: '壬', branch: '子' },
      month: { stem: '癸', branch: '亥' },
      day:   { stem: '丙', branch: '申' },
      hour:  { stem: '辛', branch: '酉' },
    },
    expectedBand: '从弱',
  },
  {
    id: 'R3',
    title: '壬水夏生，火土成势，无水根（从弱）',
    pillars: {
      year:  { stem: '丙', branch: '午' },
      month: { stem: '丁', branch: '未' },
      day:   { stem: '壬', branch: '午' },
      hour:  { stem: '戊', branch: '午' },
    },
    expectedBand: '从弱',
  },

  // =========================
  // 5. 边界样本（调权重最有用）
  // =========================
  {
    id: 'B1',
    title: '有令无根：寅月甲木，根不多（平衡/身偏强）',
    pillars: {
      year:  { stem: '戊', branch: '申' },
      month: { stem: '甲', branch: '寅' },
      day:   { stem: '甲', branch: '午' },
      hour:  { stem: '庚', branch: '戌' },
    },
    allowedBands: ['平衡', '身偏强'],
  },
  {
    id: 'B2',
    title: '有根不得令：酉月甲木，寅多根（平衡/略偏弱）',
    pillars: {
      year:  { stem: '甲', branch: '寅' },
      month: { stem: '辛', branch: '酉' },
      day:   { stem: '甲', branch: '寅' },
      hour:  { stem: '壬', branch: '寅' },
    },
    allowedBands: ['平衡', '身弱', '身偏弱'],
  },
  {
    id: 'B3',
    title: '帮身与耗身相当（标准平衡盘）',
    pillars: {
      year:  { stem: '丙', branch: '辰' },
      month: { stem: '戊', branch: '辰' },
      day:   { stem: '壬', branch: '辰' },
      hour:  { stem: '庚', branch: '戌' },
    },
    expectedBand: '平衡',
  },
  {
    id: 'B4',
    title: '印多身弱，容易被误判偏强',
    pillars: {
      year:  { stem: '壬', branch: '子' },
      month: { stem: '壬', branch: '子' },
      day:   { stem: '戊', branch: '午' },
      hour:  { stem: '癸', branch: '亥' },
    },
    allowedBands: ['身弱', '平衡', '身偏弱'],
  },
  {
    id: 'B5',
    title: '轻微偏弱（身偏弱样板）',
    pillars: {
      year:  { stem: '乙', branch: '卯' },
      month: { stem: '丙', branch: '辰' },
      day:   { stem: '辛', branch: '酉' },
      hour:  { stem: '戊', branch: '子' },
    },
    allowedBands: ['身弱', '平衡', '身偏弱'],
  },
  {
    id: 'B6',
    title: '轻微偏强（身偏强样板）',
    pillars: {
      year:  { stem: '庚', branch: '申' },
      month: { stem: '壬', branch: '申' },
      day:   { stem: '庚', branch: '寅' },
      hour:  { stem: '戊', branch: '午' },
    },
    expectedBand: '身偏强',
  },
];

// ② 测试辅助函数
function checkBand(sample, band) {
  if (sample.allowedBands && sample.allowedBands.length > 0) {
    return sample.allowedBands.includes(band);
  } else if (sample.expectedBand) {
    return band === sample.expectedBand;
  }
  return false;
}

function formatScore(score) {
  return (score * 100).toFixed(1) + '%';
}

// ③ 主测试函数
function runTests() {
  console.log('='.repeat(80));
  console.log('身强身弱算法测试 - V3.0 校准样本盘');
  console.log('='.repeat(80));
  console.log();

  const results = {
    ziping: { passed: 0, failed: 0, details: [] },
    mangpai: { passed: 0, failed: 0, details: [] },
  };

  // 测试子平学派
  console.log('【子平学派测试】');
  console.log('-'.repeat(80));
  
  SAMPLES.forEach((sample) => {
    const result = computeDayMasterStrength(sample.pillars, { school: 'ziping' });
    const passed = checkBand(sample, result.band);
    
    const expected = sample.expectedBand || sample.allowedBands.join('/');
    const status = passed ? '✅ PASS' : '❌ FAIL';
    
    const detail = {
      id: sample.id,
      title: sample.title,
      expected,
      actual: result.band,
      score: result.score,
      passed,
      detail: result.detail,
    };
    
    results.ziping.details.push(detail);
    if (passed) {
      results.ziping.passed++;
    } else {
      results.ziping.failed++;
    }
    
    console.log(`${status} ${sample.id}: ${sample.title}`);
    console.log(`   期望: ${expected}  |  实际: ${result.band}  |  分数: ${formatScore(result.score)}`);
    console.log(`   详情: w_month=${result.detail.w_month?.toFixed(2)}, root=${result.detail.root?.toFixed(2)}, help=${result.detail.help?.toFixed(2)}, drain=${result.detail.drain?.toFixed(2)}`);
    console.log(`         biPower=${result.detail.biPower?.toFixed(2)}, printPower=${result.detail.printPower?.toFixed(2)}, helpPower=${result.detail.helpPower?.toFixed(2)}, drainPower=${result.detail.drainPower?.toFixed(2)}`);
    console.log();
  });

  console.log();
  console.log('【盲派学派测试】');
  console.log('-'.repeat(80));
  
  SAMPLES.forEach((sample) => {
    const result = computeDayMasterStrength(sample.pillars, { school: 'mangpai' });
    const passed = checkBand(sample, result.band);
    
    const expected = sample.expectedBand || sample.allowedBands.join('/');
    const status = passed ? '✅ PASS' : '❌ FAIL';
    
    const detail = {
      id: sample.id,
      title: sample.title,
      expected,
      actual: result.band,
      score: result.score,
      passed,
      detail: result.detail,
    };
    
    results.mangpai.details.push(detail);
    if (passed) {
      results.mangpai.passed++;
    } else {
      results.mangpai.failed++;
    }
    
    console.log(`${status} ${sample.id}: ${sample.title}`);
    console.log(`   期望: ${expected}  |  实际: ${result.band}  |  分数: ${formatScore(result.score)}`);
    console.log(`   详情: w_month=${result.detail.w_month?.toFixed(2)}, root=${result.detail.root?.toFixed(2)}, help=${result.detail.help?.toFixed(2)}, drain=${result.detail.drain?.toFixed(2)}`);
    console.log();
  });

  // 汇总
  console.log();
  console.log('='.repeat(80));
  console.log('测试汇总');
  console.log('='.repeat(80));
  
  const zipingTotal = results.ziping.passed + results.ziping.failed;
  const mangpaiTotal = results.mangpai.passed + results.mangpai.failed;
  
  console.log(`子平学派: ${results.ziping.passed}/${zipingTotal} 通过 (${((results.ziping.passed / zipingTotal) * 100).toFixed(1)}%)`);
  console.log(`盲派学派: ${results.mangpai.passed}/${mangpaiTotal} 通过 (${((results.mangpai.passed / mangpaiTotal) * 100).toFixed(1)}%)`);
  
  // 列出失败的用例
  const zipingFailed = results.ziping.details.filter(d => !d.passed);
  const mangpaiFailed = results.mangpai.details.filter(d => !d.passed);
  
  if (zipingFailed.length > 0) {
    console.log();
    console.log('子平学派失败用例:');
    zipingFailed.forEach(d => {
      console.log(`  - ${d.id}: 期望 ${d.expected}, 实际 ${d.actual} (${formatScore(d.score)})`);
    });
  }
  
  if (mangpaiFailed.length > 0) {
    console.log();
    console.log('盲派学派失败用例:');
    mangpaiFailed.forEach(d => {
      console.log(`  - ${d.id}: 期望 ${d.expected}, 实际 ${d.actual} (${formatScore(d.score)})`);
    });
  }
  
  console.log();
  console.log('='.repeat(80));
  
  // 返回测试结果
  return {
    success: results.ziping.failed === 0 && results.mangpai.failed === 0,
    ziping: results.ziping,
    mangpai: results.mangpai,
  };
}

// 运行测试
const testResult = runTests();

// 退出码
process.exit(testResult.success ? 0 : 1);

