/**
 * 应期分析（动态时间映射）
 * Timeline Analysis - Dynamic Time Mapping
 * 
 * 职责：
 * - 将静态分析映射到动态时间（大运/流年）
 * - 计算大运/流年对原局的影响力
 * - 分析冲合关系、旺衰变化、做功启动/破坏
 * - 评估体用平衡变化
 * - 计算综合评分，提供应期建议
 * 
 * @param {Object} pillars - 四柱数据
 * @param {Object} dayMaster - 日主强弱结果
 * @param {Object} dogongResult - 做功分析结果
 * @param {Object} tiyongResult - 体用承载度结果
 * @param {Object} derived - 派生信息（大运、流年等）
 * @param {Object} options - 选项
 * @returns {Object} 应期分析结果
 */

import { hasShengRelation, hasKeRelation } from './utils.js';

// 动态导入关系模块
async function getRelationshipModules() {
  const { checkStemWuHe, checkStemSiChong } = await import('../mingli/stemRelationships.js');
  const { checkLiuHe, checkLiuChong } = await import('../mingli/branchRelationships.js');
  return { checkStemWuHe, checkStemSiChong, checkLiuHe, checkLiuChong };
}

export async function analyzeTimeline(pillars, dayMaster, dogongResult, tiyongResult, derived, options = {}) {
  console.log('[TimelineAnalysis] 开始应期分析');
  
  const { checkStemWuHe, checkStemSiChong, checkLiuHe, checkLiuChong } = await getRelationshipModules();
  
  // 提取强度映射
  const strengthMap = dogongResult?.strengthMap || {};
  
  // 1. 分析大运
  const luckAnalysis = [];
  if (derived?.luck_cycle && Array.isArray(derived.luck_cycle)) {
    for (const yunData of derived.luck_cycle) {
      const analysis = await analyzeYun(
        pillars,
        dayMaster,
        dogongResult,
        tiyongResult,
        yunData,
        '大运',
        { checkStemWuHe, checkStemSiChong, checkLiuHe, checkLiuChong }
      );
      luckAnalysis.push(analysis);
    }
  }
  
  // 2. 分析流年
  const flowYearAnalysis = [];
  if (derived?.flow_years && Array.isArray(derived.flow_years)) {
    for (const yearData of derived.flow_years) {
      const analysis = await analyzeYun(
        pillars,
        dayMaster,
        dogongResult,
        tiyongResult,
        yearData,
        '流年',
        { checkStemWuHe, checkStemSiChong, checkLiuHe, checkLiuChong }
      );
      flowYearAnalysis.push(analysis);
    }
  }
  
  const result = {
    version: '1.0.0',
    luckAnalysis,
    flowYearAnalysis,
    timestamp: Date.now()
  };
  
  console.log('[TimelineAnalysis] 应期分析完成');
  
  return result;
}

/**
 * 分析单个大运/流年
 */
async function analyzeYun(pillars, dayMaster, dogongResult, tiyongResult, yunData, yunType, relationshipModules) {
  const { checkStemWuHe, checkStemSiChong, checkLiuHe, checkLiuChong } = relationshipModules;
  
  // 1. 分析冲合效果
  const chongHeEffects = analyzeChongHeEffects(pillars, yunData, { checkStemWuHe, checkStemSiChong, checkLiuHe, checkLiuChong });
  
  // 2. 分析旺衰变化
  const wangShuaiChanges = analyzeWangShuaiChanges(pillars, yunData, dogongResult);
  
  // 3. 分析做功路径
  const workPathsAnalysis = analyzeWorkPaths(yunData, dogongResult);
  
  // 4. 分析体用平衡
  const bodyUseBalance = analyzeBodyUseBalance(yunData, tiyongResult);
  
  // 5. 计算综合评分
  const comprehensiveScore = calculateComprehensiveScore({
    chongHeEffects,
    wangShuaiChanges,
    workPathsAnalysis,
    bodyUseBalance
  });
  
  // 6. 生成建议
  const suggestions = generateSuggestions(comprehensiveScore, chongHeEffects, workPathsAnalysis);
  
  return {
    yunInfo: `${yunType} ${yunData.stem}${yunData.branch}`,
    yunData: {
      stem: yunData.stem,
      branch: yunData.branch,
      shishen: yunData.shishen,
      sub_stars: yunData.sub_stars || [],
      ageRange: yunData.ageRange || yunData.year || ''
    },
    comprehensiveScore,
    scoreLevel: getScoreLevel(comprehensiveScore),
    chongHeEffects,
    wangShuaiChanges,
    workPathsAnalysis,
    bodyUseBalance,
    suggestions,
    timestamp: Date.now()
  };
}

/**
 * 分析冲合效果
 */
function analyzeChongHeEffects(pillars, yunData, relationshipModules) {
  const { checkStemWuHe, checkStemSiChong, checkLiuHe, checkLiuChong } = relationshipModules;
  const effects = [];
  
  // 检查天干五合
  ['year', 'month', 'day', 'hour'].forEach(pos => {
    const pillar = pillars[pos];
    if (!pillar) return;
    
    const heCheck = checkStemWuHe(pillar.stem, yunData.stem);
    if (heCheck && heCheck.isHe) {
      effects.push({
        type: '合',
        pillar: pos === 'year' ? '年柱' : pos === 'month' ? '月柱' : pos === 'day' ? '日柱' : '时柱',
        effect: `${pillar.stem}${yunData.stem}合化${heCheck.element}`,
        strength: 0.8
      });
    }
    
    // 检查天干四冲
    const chongCheck = checkStemSiChong(pillar.stem, yunData.stem);
    if (chongCheck && chongCheck.isChong) {
      effects.push({
        type: '冲',
        pillar: pos === 'year' ? '年柱' : pos === 'month' ? '月柱' : pos === 'day' ? '日柱' : '时柱',
        effect: `${pillar.stem}${yunData.stem}相冲`,
        strength: 1.0
      });
    }
  });
  
  // 检查地支六合、六冲
  ['year', 'month', 'day', 'hour'].forEach(pos => {
    const pillar = pillars[pos];
    if (!pillar) return;
    
    const heCheck = checkLiuHe(pillar.branch, yunData.branch);
    if (heCheck && heCheck.isHe) {
      effects.push({
        type: '合',
        pillar: pos === 'year' ? '年柱' : pos === 'month' ? '月柱' : pos === 'day' ? '日柱' : '时柱',
        effect: `${pillar.branch}${yunData.branch}相合`,
        strength: 0.7
      });
    }
    
    const chongCheck = checkLiuChong(pillar.branch, yunData.branch);
    if (chongCheck && chongCheck.isChong) {
      effects.push({
        type: '冲',
        pillar: pos === 'year' ? '年柱' : pos === 'month' ? '月柱' : pos === 'day' ? '日柱' : '时柱',
        effect: `${pillar.branch}${yunData.branch}相冲`,
        strength: 1.0
      });
    }
  });
  
  return effects;
}

/**
 * 分析旺衰变化
 */
function analyzeWangShuaiChanges(pillars, yunData, dogongResult) {
  const changes = {};
  const strengthMap = dogongResult?.strengthMap || {};
  
  // 提取大运/流年十神
  const yunStemShishen = yunData.shishen;  // 天干十神
  const yunBranchShishens = yunData.sub_stars || [];  // 藏干十神数组
  
  // 计算每个节点的旺衰变化
  for (const [nodeId, baseStrength] of Object.entries(strengthMap)) {
    // 提取十神名称
    const shishen = nodeId.includes('_') ? nodeId.split('_')[1] : nodeId;
    
    if (shishen === '日主') continue; // 日主不参与变化
    
    let changeFactor = 1.0; // 初始变化因子
    
    // 1. 同类十神加强
    if (yunStemShishen === shishen) {
      changeFactor *= 1.3;
    }
    // 藏干中有同类十神
    if (yunBranchShishens.includes(shishen)) {
      changeFactor *= 1.4;
    }
    
    // 2. 生我者加强
    if (hasShengRelation(yunStemShishen, shishen)) {
      changeFactor *= 1.2;
    }
    for (const branchShishen of yunBranchShishens) {
      if (hasShengRelation(branchShishen, shishen)) {
        changeFactor *= 1.15;
        break; // 只计算一次
      }
    }
    
    // 3. 克我者减弱
    if (hasKeRelation(yunStemShishen, shishen)) {
      changeFactor *= 0.7;
    }
    for (const branchShishen of yunBranchShishens) {
      if (hasKeRelation(branchShishen, shishen)) {
        changeFactor *= 0.75;
        break; // 只计算一次
      }
    }
    
    const newStrength = Math.min(baseStrength * changeFactor, 1.0);
    const changeRate = baseStrength > 0 ? (newStrength - baseStrength) / baseStrength : 0;
    
    changes[nodeId] = {
      shishen,
      originalStrength: baseStrength,
      newStrength,
      changeRate,
      changeFactor
    };
  }
  
  return changes;
}

/**
 * 分析做功路径
 */
function analyzeWorkPaths(yunData, dogongResult) {
  const activated = [];
  const destroyed = [];
  const strongestPaths = dogongResult?.strongestPaths || [];
  
  // 简化版：检查大运/流年是否激活或破坏做功路径
  const yunShishen = yunData.shishen;
  
  for (const path of strongestPaths) {
    // 如果大运/流年的十神在路径中，视为激活
    if (path.path.includes(yunShishen)) {
      activated.push(path);
    }
    
    // 如果大运/流年与路径冲突，视为破坏
    // 简化版：暂时不实现
  }
  
  return {
    activated: activated,
    destroyed: destroyed
  };
}

/**
 * 分析体用平衡
 */
function analyzeBodyUseBalance(yunData, tiyongResult) {
  // 简化版：基于体用承载度计算变化
  const baseCapacity = tiyongResult?.carryingCapacity || 0.5;
  const yunShishen = yunData.shishen;
  
  // 根据大运/流年十神类型，计算体用平衡变化
  let bodyChange = 0;
  let useChange = 0;
  
  const bodyGods = ['比肩', '劫财', '食神', '伤官', '正印', '偏印'];
  const useGods = ['正财', '偏财', '正官', '七杀'];
  
  if (bodyGods.includes(yunShishen)) {
    bodyChange = 0.1; // 体势增强
  } else if (useGods.includes(yunShishen)) {
    useChange = 0.1; // 用势增强
  }
  
  const balance = baseCapacity + (bodyChange - useChange) * 0.5;
  
  return {
    bodyChange: bodyChange,
    useChange: useChange,
    balance: balance,
    balanceState: balance > 0.6 ? '良好' : balance > 0.4 ? '一般' : '较差'
  };
}

/**
 * 计算综合评分
 */
function calculateComprehensiveScore(analysisData) {
  let score = 50; // 基础分
  
  const { chongHeEffects, wangShuaiChanges, workPathsAnalysis, bodyUseBalance } = analysisData;
  
  console.log('[TimelineAnalysis] 计算综合评分:');
  
  // 1. 冲合影响评分
  let chongHeScore = 0;
  for (const effect of chongHeEffects) {
    const impact = effect.type === '合' ? 1 : -1; // 合为正面，冲为负面
    chongHeScore += effect.strength * 10 * impact;
  }
  score += Math.max(-20, Math.min(20, chongHeScore));
  console.log(`  冲合影响: ${chongHeScore.toFixed(1)} (累计: ${score.toFixed(1)})`);
  
  // 2. 旺衰变化评分
  let changeScore = 0;
  for (const [nodeId, change] of Object.entries(wangShuaiChanges)) {
    changeScore += Math.abs(change.changeRate) * 5;
  }
  score += Math.min(changeScore, 15);
  console.log(`  旺衰变化: ${changeScore.toFixed(1)} (累计: ${score.toFixed(1)})`);
  
  // 3. 做功路径评分
  const workScore = workPathsAnalysis.activated.length * 8 - workPathsAnalysis.destroyed.length * 10;
  score += Math.max(-15, Math.min(15, workScore));
  console.log(`  做功路径: ${workScore.toFixed(1)} (累计: ${score.toFixed(1)})`);
  
  // 4. 体用平衡评分
  const balanceScore = (bodyUseBalance.balance - 0.5) * 20;
  score += Math.max(-10, Math.min(10, balanceScore));
  console.log(`  体用平衡: ${balanceScore.toFixed(1)} (累计: ${score.toFixed(1)})`);
  
  // 确保分数在 0-100 之间
  score = Math.max(0, Math.min(100, score));
  
  console.log(`  最终评分: ${score.toFixed(1)}`);
  
  return Math.round(score);
}

/**
 * 获取评分等级
 */
function getScoreLevel(score) {
  if (score >= 80) return '优';
  if (score >= 65) return '良';
  if (score >= 50) return '中';
  if (score >= 35) return '差';
  return '劣';
}

/**
 * 生成建议
 */
function generateSuggestions(score, chongHeEffects, workPathsAnalysis) {
  const suggestions = [];
  
  if (score >= 80) {
    suggestions.push('运势极佳，宜积极进取，把握机遇');
  } else if (score >= 65) {
    suggestions.push('运势良好，可稳步发展');
  } else if (score >= 50) {
    suggestions.push('运势平稳，需谨慎行事');
  } else if (score >= 35) {
    suggestions.push('运势较差，宜保守为主，避免冒险');
  } else {
    suggestions.push('运势低迷，需特别注意，避免重大决策');
  }
  
  // 根据冲合效果添加建议
  const chongCount = chongHeEffects.filter(e => e.type === '冲').length;
  if (chongCount > 0) {
    suggestions.push(`注意${chongCount}处相冲，需防范冲突和变动`);
  }
  
  const heCount = chongHeEffects.filter(e => e.type === '合').length;
  if (heCount > 0) {
    suggestions.push(`${heCount}处相合，有利于合作和机遇`);
  }
  
  // 根据做功路径添加建议
  if (workPathsAnalysis.activated.length > 0) {
    suggestions.push(`${workPathsAnalysis.activated.length}条做功路径被激活，能力发挥良好`);
  }
  
  return suggestions;
}

