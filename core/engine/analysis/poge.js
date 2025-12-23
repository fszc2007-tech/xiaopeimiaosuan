/**
 * 破格因子分析
 * 
 * 分析各种破格因子，包括：
 * - 通用破格：官杀混杂、印重身埋、财多身弱等
 * - 格局专用破格：伤官见官、比劫夺财、财星坏印等
 * 
 * @param {Object} pillars - 四柱数据
 * @param {Object} W - 十神权重对象
 * @param {String} structureName - 格局名称
 * @param {Object} strength - 日主强弱结果
 * @returns {Array} 破格因子数组
 */

import { STEM_ELEMENT } from './constants.js';
import { tenGodOf, isGodRevealed } from './utils.js';

export function analyzePoGeFactors(pillars, W, structureName, strength) {
  const factors = [];
  let context = { flags: {} };
  
  // 1. 通用破格检查（返回 factors 和 context）
  const commonResult = checkCommonPoGe(pillars, W, strength);
  factors.push(...commonResult.factors);
  context = { ...context, ...commonResult.context }; // 合并 context
  
  // 2. 格局专用破格检查
  factors.push(...checkPatternSpecificPoGe(pillars, W, structureName));
  
  // 3. 计算每个因子的严重程度
  for (const factor of factors) {
    factor.severity = calculatePoGeSeverity(factor, pillars, W, factors);
  }
  
  // ✅ 返回 factors 和 context
  return { factors, context };
}

/**
 * 检查通用破格因子
 */
function checkCommonPoGe(pillars, W, strength) {
  const factors = [];
  const context = {
    flags: {
      shi_overflow: false,      // 食伤过旺标记
      yin_overflow: false,      // 印星过重标记
      bi_overflow: false,        // 比劫成群标记
      cai_overflow: false        // 财多身弱标记
    }
  };
  
  // 1. 官杀混杂
  if (W.zGuan > 0.5 && W.sha > 0.5) {
    factors.push({
      type: '官杀混杂',
      position: '天干',
      description: '正官七杀同时出现，心性不定，事业多变',
      impactAreas: ['事业', '心性', '决策'],
      baseScore: 1.5
    });
  }
  
  // 2. 印星相关破格（统一逻辑，使用 else if 避免重复）
  const dayMasterStrength = strength?.score || 0.5;
  const isPianYinDominant = W.pYin > W.zYin * 1.2; // 偏印比正印强20%以上
  
  if (W.yin > 1.2) {
    // 优先级1：真·身埋（日主很弱 + 比劫很少）
    if (dayMasterStrength < 0.5 && W.bi < 0.5) {
      if (isPianYinDominant && W.pYin > 0.8) {
        factors.push({
          type: '枭印太旺（身埋）',
          position: '天干地支',
          description: '偏印过多埋没日主，思虑过多缺乏行动',
          impactAreas: ['性格', '行动力', '决策'],
          baseScore: 1.4
        });
      } else {
        factors.push({
          type: '印重身埋',
          position: '天干地支',
          description: '印星过多埋没日主，思虑过多缺乏行动',
          impactAreas: ['性格', '行动力', '决策'],
          baseScore: 1.4
        });
      }
      context.flags.yin_overflow = true;
    }
    // 优先级2：过重但不身埋（印星 > 1.5，但日主有支撑）
    else if (W.yin > 1.5) {
      if (isPianYinDominant && W.pYin > 1.0) {
        factors.push({
          type: '枭印太旺',
          position: '天干地支',
          description: '偏印过旺，思虑过多，需要比劫或财星平衡',
          impactAreas: ['性格', '行动力'],
          baseScore: 1.2
        });
      } else {
        factors.push({
          type: '印星过重',
          position: '天干地支',
          description: '印星过旺，思虑过多，需要比劫或财星平衡',
          impactAreas: ['性格', '行动力'],
          baseScore: 1.2
        });
      }
      context.flags.yin_overflow = true;
    }
    // ✅ 如果 W.yin 在 1.2-1.5 之间，且不满足身埋条件，则不判破格
  }
  
  // 3. 财多身弱（添加标记）
  if (W.cai > 1.0 && W.bi < 0.4) {
    factors.push({
      type: '财多身弱',
      position: '天干地支',
      description: '财星过旺而日主过弱，难以承担财富',
      impactAreas: ['财运', '健康', '压力'],
      baseScore: 1.4
    });
    context.flags.cai_overflow = true;
  }
  
  // 4. 食伤过旺 / 食伤偏旺（分两档判断）
  const shiRevealed = isGodRevealed(pillars, '食神', pillars.day.stem) || 
                      isGodRevealed(pillars, '伤官', pillars.day.stem);
  const shiStrength = W.shi;
  const mainOthers = Math.max(W.guan || 0, W.cai || 0, W.yin || 0);
  
  // 档位1：明显过旺（重度）- 破格
  if (shiStrength > 1.5 && 
      shiRevealed && 
      shiStrength > dayMasterStrength * 1.8 &&
      shiStrength > mainOthers * 1.4) {
    factors.push({
      type: '食伤过旺',
      position: '天干地支',
      description: '食伤过多且透干，言多必失，易招是非',
      impactAreas: ['人际', '口舌', '是非'],
      baseScore: 1.3,
      severity: 'high',
      _flag: 'shi_overflow'
    });
    context.flags.shi_overflow = true;
  }
  // 档位2：偏旺但未到失控（中度）- 提示倾向
  else if (shiStrength > 1.3 && 
           shiRevealed && 
           shiStrength > dayMasterStrength * 1.4) {
    factors.push({
      type: '食伤偏旺',
      position: '天干地支',
      description: '食伤略多，需注意言行，避免口舌是非',
      impactAreas: ['人际', '口舌'],
      baseScore: 0.8,
      severity: 'medium',
      _flag: 'shi_overflow'
    });
    context.flags.shi_overflow = true;
  }
  // ✅ 如果食伤不透干，或强度不够，则不判破格
  
  // 5. 比劫成群（添加标记）
  if (W.bi > 1.5) {
    factors.push({
      type: '比劫成群',
      position: '天干地支',
      description: '比劫过多，竞争激烈，财运受损',
      impactAreas: ['财运', '人际', '竞争'],
      baseScore: 1.3
    });
    context.flags.bi_overflow = true;
  }
  
  // 6. 根气受损（地支冲刑）
  const branchConflicts = checkBranchConflicts(pillars);
  if (branchConflicts > 2) {
    factors.push({
      type: '根气受损',
      position: '地支',
      description: '日主根基被冲刑破坏，稳定性差',
      impactAreas: ['健康', '稳定性', '根基'],
      baseScore: 1.4
    });
  }
  
  // 7. 用神被合
  const yongshenHe = checkYongshenHe(pillars, W);
  if (yongshenHe.isHe) {
    factors.push({
      type: '用神被合',
      position: '天干',
      description: yongshenHe.description,
      impactAreas: ['机遇', '能力发挥'],
      baseScore: 1.5
    });
  }
  
  // ✅ 返回 factors 和 context
  return { factors, context };
}

/**
 * 检查格局专用破格因子
 */
function checkPatternSpecificPoGe(pillars, W, structureName) {
  const factors = [];
  
  // 官格破格
  if (structureName.includes('官') && !structureName.includes('从')) {
    // 伤官见官
    if (W.shang > 0.5 && W.yin < 0.3) {
      factors.push({
        type: '伤官见官',
        position: '天干',
        description: '伤官克官星，且无印星制伤，官运受损',
        impactAreas: ['事业', '官运', '名声'],
        baseScore: 1.8
      });
    }
  }
  
  // 财格破格
  if (structureName.includes('财') && !structureName.includes('从')) {
    // 比劫夺财
    if (W.bi > 0.7 && W.guan < 0.4) {
      factors.push({
        type: '比劫夺财',
        position: '天干地支',
        description: '比劫夺财，且无官杀制比劫，财运受损',
        impactAreas: ['财运', '合作', '竞争'],
        baseScore: 1.6
      });
    }
  }
  
  // 印格破格
  if (structureName.includes('印') && !structureName.includes('从')) {
    // 财星坏印
    if (W.cai > 0.8 && W.bi < 0.4) {
      factors.push({
        type: '财星坏印',
        position: '天干地支',
        description: '财星克印星，且无比劫解救，学业事业受阻',
        impactAreas: ['学业', '事业', '贵人'],
        baseScore: 1.7
      });
    }
  }
  
  // 食神格破格
  if (structureName.includes('食神')) {
    // 枭神夺食
    if (W.pYin > 0.6 && W.cai < 0.4) {
      factors.push({
        type: '枭神夺食',
        position: '天干',
        description: '偏印克食神，且无财星制印，才华难展',
        impactAreas: ['才华', '表现', '收入'],
        baseScore: 1.9
      });
    }
  }
  
  return factors;
}

/**
 * 检查地支冲刑
 */
function checkBranchConflicts(pillars) {
  let conflicts = 0;
  const branches = [];
  
  for (const pos of ['year', 'month', 'day', 'hour']) {
    const pillar = pillars[pos];
    if (pillar?.branch) branches.push(pillar.branch);
  }
  
  // 检查六冲
  const chongPairs = {
    '子': '午', '午': '子',
    '丑': '未', '未': '丑',
    '寅': '申', '申': '寅',
    '卯': '酉', '酉': '卯',
    '辰': '戌', '戌': '辰',
    '巳': '亥', '亥': '巳'
  };
  
  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      if (chongPairs[branches[i]] === branches[j]) {
        conflicts++;
      }
    }
  }
  
  return conflicts;
}

/**
 * 检查用神是否被合
 */
function checkYongshenHe(pillars, W) {
  // 简化版：暂时返回 false，后续可以完善
  // 如果需要完整实现，需要动态导入 checkStemWuHe
  return { isHe: false };
  
  /* 完整版（需要异步）：
  async function checkYongshenHe(pillars, W) {
    const { checkStemWuHe } = await import('../mingli/stemRelationships.js');
    
    // 根据十神强度判断用神
    const yongshenCandidates = identifyYongshen(W);
    
    if (yongshenCandidates.length === 0) {
      return { isHe: false };
    }
    
    // 检查用神对应的天干是否被合
    const positions = ['year', 'month', 'day', 'hour'];
    for (let i = 0; i < positions.length; i++) {
      const pillar1 = pillars[positions[i]];
      if (!pillar1) continue;
      
      // 检查该天干是否为用神
      const stem1God = getStemTenGod(pillar1.stem, pillars.day.stem);
      if (!yongshenCandidates.includes(stem1God)) continue;
      
      // 检查是否被其他天干合住
      for (let j = 0; j < positions.length; j++) {
        if (i === j) continue;
        const pillar2 = pillars[positions[j]];
        if (!pillar2) continue;
        
        const heCheck = checkStemWuHe(pillar1.stem, pillar2.stem);
        if (heCheck && heCheck.isHe) {
          return {
            isHe: true,
            description: `关键用神(${stem1God})被${heCheck.pair[0]}${heCheck.pair[1]}合走，力量减弱`
          };
        }
      }
    }
    
    return { isHe: false };
  }
  */
}

/**
 * 识别用神（简化版）
 */
function identifyYongshen(W) {
  const yongshen = [];
  
  // 财星作为用神（常见）
  if (W.cai > 0.5 && W.cai < 1.2) {
    yongshen.push('财');
  }
  
  // 官星作为用神
  if (W.guan > 0.4 && W.guan < 1.0) {
    yongshen.push('官');
  }
  
  // 印星作为用神
  if (W.yin > 0.5 && W.yin < 1.3) {
    yongshen.push('印');
  }
  
  // 食神作为用神
  if (W.shi > 0.5 && W.shi < 1.2) {
    yongshen.push('食神');
  }
  
  return yongshen;
}

/**
 * 获取天干的十神类型（简化版）
 */
function getStemTenGod(stem, dayMaster) {
  return tenGodOf(dayMaster, stem);
}

/**
 * 计算破格因子严重程度
 */
function calculatePoGeSeverity(factor, pillars, W, allFactors = []) {
  let score = factor.baseScore || 1.0;
  
  // 位置权重
  const positionWeights = {
    '天干': 1.2,
    '地支': 1.5,
    '天干地支': 1.8
  };
  score *= positionWeights[factor.position] || 1.0;
  
  // 影响范围权重
  score *= (1 + (factor.impactAreas.length * 0.3));
  
  // 组合破格权重：当多个破格因子同时出现时，加倍计算
  if (isComboPoGe(factor, allFactors)) {
    score *= 1.5;
  }
  
  // 确定严重等级
  if (score >= 2.5) {
    return {
      level: '严重',
      score: score,
      suggestion: '需大运解救，否则影响重大'
    };
  } else if (score >= 1.8) {
    return {
      level: '中等',
      score: score,
      suggestion: '有一定影响，需注意防范'
    };
  } else if (score >= 1.2) {
    return {
      level: '轻微',
      score: score,
      suggestion: '略有瑕疵，影响不大'
    };
  } else {
    return {
      level: '微瑕',
      score: score,
      suggestion: '可以忽略'
    };
  }
}

/**
 * 判断是否为组合破格
 */
function isComboPoGe(currentFactor, allFactors) {
  if (allFactors.length <= 1) return false;
  
  let comboCount = 0;
  for (const factor of allFactors) {
    if (factor === currentFactor) continue;
    
    // 检查影响范围是否有交集
    const hasOverlap = currentFactor.impactAreas.some(area => 
      factor.impactAreas.includes(area)
    );
    
    if (hasOverlap) {
      comboCount++;
    }
  }
  
  // 有2个或以上的因子影响相同领域，视为组合破格
  return comboCount >= 2;
}

