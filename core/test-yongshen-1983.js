/**
 * 测试 1983-02-17 08:00 女命的喜忌用神计算
 * 仅用于验证，不改代码
 */

import { BaziEngine } from './engine/index.js';

async function testYongshen() {
  console.log('========================================');
  console.log('🔮 测试喜忌用神计算');
  console.log('========================================\n');
  
  const engine = new BaziEngine();
  
  const birthInfo = {
    sex: 'female',
    calendar_type: '公历',
    year: 1983,
    month: 2,
    day: 17,
    hour: 8,
    minute: 0,
    tz: '+08:00',
  };
  
  console.log('📅 出生信息:');
  console.log('   日期: 1983-02-17 08:00');
  console.log('   性别: 女');
  console.log('   历法: 公历');
  console.log('');
  
  try {
    const result = await engine.compute(birthInfo);
    
    console.log('========================================');
    console.log('📋 八字结果');
    console.log('========================================\n');
    
    // 显示四柱
    const pillars = result.pillars;
    console.log('四柱:');
    console.log(`   年柱: ${pillars.year.stem}${pillars.year.branch}`);
    console.log(`   月柱: ${pillars.month.stem}${pillars.month.branch}`);
    console.log(`   日柱: ${pillars.day.stem}${pillars.day.branch}`);
    console.log(`   时柱: ${pillars.hour.stem}${pillars.hour.branch}`);
    console.log('');
    
    // 显示日主信息
    const dayMaster = result.analysis.dayMaster;
    console.log('日主信息:');
    console.log(`   日主: ${dayMaster.gan} (${dayMaster.wuxing})`);
    console.log(`   强弱: ${dayMaster.strengthLabel} (${dayMaster.strength}分)`);
    console.log('');
    
    // 显示五行占比
    const wuxing = result.analysis.wuxingPercent;
    console.log('五行占比:');
    Object.entries(wuxing).forEach(([element, percent]) => {
      console.log(`   ${element}: ${percent.toFixed(1)}%`);
    });
    console.log('');
    
    // 显示喜忌用神
    const gods = result.analysis.gods;
    console.log('喜忌用神:');
    console.log(`   喜用神: ${gods.favorable.join('、')}`);
    console.log(`   忌神: ${gods.unfavorable.join('、')}`);
    console.log('');
    
    // 显示用神格局（如果有）
    const yongshenPattern = result.analysis.yongshenPattern;
    if (yongshenPattern) {
      console.log('用神格局:');
      console.log(`   主用神: ${yongshenPattern.mainYongshen?.elements?.join('、') || '无'}`);
      console.log(`   忌神: ${yongshenPattern.tabooElements?.join('、') || '无'}`);
      console.log('');
    }
    
    // 显示详细分析
    const strengthDetail = result.analysis.strengthAnalysis;
    console.log('强弱分析详情:');
    console.log(`   得令: ${strengthDetail.factors.得令 ? '是' : '否'}`);
    console.log(`   得地: ${strengthDetail.factors.得地 ? '是' : '否'}`);
    console.log(`   得生: ${strengthDetail.factors.得生 ? '是' : '否'}`);
    console.log(`   得助: ${strengthDetail.factors.得助 ? '是' : '否'}`);
    console.log('');
    
    // 验证逻辑
    console.log('========================================');
    console.log('🔍 验证分析');
    console.log('========================================\n');
    
    const dayStemElement = dayMaster.wuxing;
    const strengthBand = dayMaster.strengthLabel;
    
    console.log(`日主五行: ${dayStemElement}`);
    console.log(`身强身弱: ${strengthBand}`);
    console.log(`计算出的喜用神: ${gods.favorable.join('、')}`);
    console.log(`计算出的忌神: ${gods.unfavorable.join('、')}`);
    console.log('');
    
    // 根据 favored.js 的逻辑验证
    console.log('根据计算逻辑验证:');
    
    // 获取五行相生相克关系
    const GENERATES = { '木':'火', '火':'土', '土':'金', '金':'水', '水':'木' };
    const CONTROLS = { '木':'土', '土':'水', '水':'火', '火':'金', '金':'木' };
    
    const leak = GENERATES[dayStemElement]; // 我生者（泄）
    const controlled = CONTROLS[dayStemElement]; // 我克者（耗）
    const controller = Object.entries(CONTROLS).find(([k, v]) => v === dayStemElement)?.[0]; // 克我者（官杀）
    const producer = Object.entries(GENERATES).find(([k, v]) => v === dayStemElement)?.[0]; // 生我者（印）
    
    console.log(`   我生者（泄）: ${leak}`);
    console.log(`   我克者（耗）: ${controlled}`);
    console.log(`   克我者（官杀）: ${controller}`);
    console.log(`   生我者（印）: ${producer}`);
    console.log(`   同我者（比劫）: ${dayStemElement}`);
    console.log('');
    
    let expectedFavored = [];
    let expectedAvoid = [];
    
    if (strengthBand === '从强') {
      expectedFavored = [dayStemElement, producer].filter(Boolean);
      expectedAvoid = [leak, controlled, controller].filter(Boolean);
      console.log('   从强格：喜印比，忌财官食伤');
    } else if (strengthBand === '从弱') {
      expectedFavored = [leak, controlled, controller].filter(Boolean);
      expectedAvoid = [dayStemElement, producer].filter(Boolean);
      console.log('   从弱格：喜财官食伤，忌印比');
    } else if (strengthBand === '身强') {
      expectedFavored = [leak, controlled, controller].filter(Boolean);
      expectedAvoid = [dayStemElement, producer].filter(Boolean);
      console.log('   身强：喜克泄耗，忌印比');
    } else if (strengthBand === '身弱') {
      expectedFavored = [dayStemElement, producer].filter(Boolean);
      expectedAvoid = [leak, controlled, controller].filter(Boolean);
      console.log('   身弱：喜生扶，忌财官食伤');
    } else {
      expectedFavored = [leak, controlled].filter(Boolean);
      expectedAvoid = [controller].filter(Boolean);
      console.log('   平衡：可顺势');
    }
    
    console.log(`   理论喜用神: ${expectedFavored.join('、')}`);
    console.log(`   理论忌神: ${expectedAvoid.join('、')}`);
    console.log('');
    
    // 对比
    const actualFavored = new Set(gods.favorable);
    const expectedFavoredSet = new Set(expectedFavored);
    const actualAvoid = new Set(gods.unfavorable);
    const expectedAvoidSet = new Set(expectedAvoid);
    
    const favoredMatch = actualFavored.size === expectedFavoredSet.size && 
                         [...actualFavored].every(x => expectedFavoredSet.has(x));
    const avoidMatch = actualAvoid.size === expectedAvoidSet.size && 
                       [...actualAvoid].every(x => expectedAvoidSet.has(x));
    
    if (favoredMatch && avoidMatch) {
      console.log('✅ 喜忌用神计算正确！');
    } else {
      console.log('❌ 喜忌用神计算可能有问题！');
      if (!favoredMatch) {
        console.log(`   喜用神不匹配:`);
        console.log(`     实际: ${[...actualFavored].join('、')}`);
        console.log(`     理论: ${[...expectedFavoredSet].join('、')}`);
      }
      if (!avoidMatch) {
        console.log(`   忌神不匹配:`);
        console.log(`     实际: ${[...actualAvoid].join('、')}`);
        console.log(`     理论: ${[...expectedAvoidSet].join('、')}`);
      }
    }
    
  } catch (error) {
    console.error('❌ 计算失败:', error);
  }
}

testYongshen();





