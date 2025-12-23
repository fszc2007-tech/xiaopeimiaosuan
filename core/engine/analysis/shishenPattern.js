/**
 * 十神组合格局诊断系统
 * 
 * 用于诊断所有存在的十神组合格局，分析其纯度、破格因素和救应因素。
 * 十神组合格局通常与月令主格并存，作为辅助判断。
 * 
 * @param {Object} pillars - 四柱数据
 * @param {Object} strength - 日主强弱结果
 * @param {Object} W - 十神权重对象
 * @param {String} mainPattern - 月令主格（可选）
 * @param {Array} pogeFactors - 破格因素数组（从 analyzePoGeFactors 获取）
 * @param {Object} options - 选项
 * @returns {Array} 所有符合的组合格局诊断结果
 */

import { 
  tenGodOf, 
  getShishenPositions, 
  isGodRevealed, 
  isGodRooted,
  checkZhishaEffectiveness,
  hasEffectiveControl
} from './utils.js';
import { stage12 } from '../mingli/stage12.js';

/**
 * 诊断所有十神组合格局
 */
export function diagnoseAllShishenPatterns(pillars, strength, W, mainPattern = null, pogeFactors = [], options = {}) {
  const allPatterns = [];
  
  // 基础组合格局
  if (meetsShishenZhisha(pillars, strength, W)) {
    allPatterns.push(diagnoseShishenZhisha(pillars, strength, W, mainPattern, pogeFactors));
  }
  
  if (meetsShangGuanPeiYin(pillars, strength, W)) {
    allPatterns.push(diagnoseShangGuanPeiYin(pillars, strength, W, mainPattern, pogeFactors));
  }
  
  if (meetsShangGuanShengCai(pillars, strength, W)) {
    allPatterns.push(diagnoseShangGuanShengCai(pillars, strength, W, mainPattern, pogeFactors));
  }
  
  if (meetsShishenShengCai(pillars, strength, W)) {
    allPatterns.push(diagnoseShishenShengCai(pillars, strength, W, mainPattern, pogeFactors));
  }
  
  if (meetsGuanYinXiangSheng(pillars, strength, W)) {
    allPatterns.push(diagnoseGuanYinXiangSheng(pillars, strength, W, mainPattern, pogeFactors));
  }
  
  if (meetsShaYinXiangSheng(pillars, strength, W)) {
    allPatterns.push(diagnoseShaYinXiangSheng(pillars, strength, W, mainPattern, pogeFactors));
  }
  
  if (meetsYangRenJiaSha(pillars, strength, W)) {
    allPatterns.push(diagnoseYangRenJiaSha(pillars, strength, W, mainPattern, pogeFactors));
  }
  
  if (meetsCaiGuanShuangMei(pillars, strength, W)) {
    allPatterns.push(diagnoseCaiGuanShuangMei(pillars, strength, W, mainPattern, pogeFactors));
  }
  
  // 特殊组合
  if (meetsShangGuanShangJin(pillars, strength, W)) {
    allPatterns.push(diagnoseShangGuanShangJin(pillars, strength, W, mainPattern, pogeFactors));
  }
  
  if (meetsXiaoShenDuoShi(pillars, strength, W)) {
    allPatterns.push(diagnoseXiaoShenDuoShi(pillars, strength, W, mainPattern, pogeFactors));
  }
  
  return allPatterns;
}

/**
 * 检查是否符合食神制杀
 * 增强版：增加位置关系检查
 * ✅ V3.0：支持身偏强
 */
function meetsShishenZhisha(pillars, strength, W) {
  // 基本条件检查
  // ✅ V3.0：增加身偏强支持
  if (!(strength.band === '身强' || strength.band === '身偏强' || strength.band === '平衡')) {
    return false;
  }
  
  if (W.sha < 0.70 || W.shishen < 0.65) {
    return false;
  }
  
  if (W.zGuan > 0.30 || W.yin > 0.50) {
    return false;
  }
  
  // 检查位置关系和制化有效性
  const dayStem = pillars.day?.stem;
  if (!dayStem) return false;
  
  const shishenPositions = getShishenPositions(pillars, '食神', dayStem);
  const qishaPositions = getShishenPositions(pillars, '七杀', dayStem);
  
  if (shishenPositions.length === 0 || qishaPositions.length === 0) {
    return false;
  }
  
  // 检查是否有有效的制化关系
  return hasEffectiveControl(shishenPositions, qishaPositions);
}

/**
 * 诊断食神制杀
 * 增强版：增加位置关系分析和详细的破格/救应分析
 */
function diagnoseShishenZhisha(pillars, strength, W, mainPattern, pogeFactors) {
  const result = {
    pattern: '食神制杀',
    pogeFactors: [],
    rescueFactors: [],
    score: 100,
    level: '',
    description: '',
    relationToMain: analyzeRelationToMain(mainPattern, '食神制杀')
  };
  
  const dayStem = pillars.day?.stem;
  const shaStrength = W.sha;
  const shishenStrength = W.shishen;
  const dayMasterStrength = strength.score || 0.5;
  
  // 获取位置信息
  const shishenPositions = dayStem ? getShishenPositions(pillars, '食神', dayStem) : [];
  const qishaPositions = dayStem ? getShishenPositions(pillars, '七杀', dayStem) : [];
  
  // 检查制化有效性
  let controlEffectiveness = null;
  if (shishenPositions.length > 0 && qishaPositions.length > 0) {
    controlEffectiveness = checkZhishaEffectiveness(shishenPositions, qishaPositions);
  }
  
  // 检查成立条件
  if (shaStrength < 0.3) {
    result.pogeFactors.push({
      type: '七杀无力',
      weight: 8,
      description: '七杀力量不足，无需制伏',
      severity: '中等',
      mechanism: '七杀权重过低，无法形成有效的制化关系',
      impact: '格局不成立，制杀无意义'
    });
  }
  
  if (shishenStrength < shaStrength * 0.7) {
    const severity = shishenStrength < shaStrength * 0.5 ? '严重' : '中等';
    result.pogeFactors.push({
      type: '制杀不力',
      weight: 9,
      description: `食神力量不足（${(shishenStrength * 100).toFixed(0)}%），制杀无力`,
      severity,
      mechanism: '食神力量不足以制约七杀，制化效果不佳',
      impact: '制杀效果不佳，压力无法有效转化'
    });
  }
  
  if (dayMasterStrength < 0.3) {
    const severity = dayMasterStrength < 0.25 ? '严重' : '中等';
    result.pogeFactors.push({
      type: '身弱不任',
      weight: 7,
      description: `日主衰弱（${(dayMasterStrength * 100).toFixed(0)}%），不能承受制杀之劳`,
      severity,
      mechanism: '日主根基不稳，无法承受制杀之劳',
      impact: '健康受损，压力过大，事业多阻'
    });
  }
  
  // 检查破格因素
  if (W.yin > 0.5) {
    const yinStrength = Math.max(W.zYin || 0, W.pYin || 0);
    const severity = yinStrength > 0.7 ? '严重' : '中等';
    const description = yinStrength > 0.7 ? 
      '印星过强化解七杀，食神制杀意义全失' :
      '印星化解部分七杀，制杀格局纯度降低';
    
    result.pogeFactors.push({
      type: '印星化杀',
      weight: 6,
      description,
      severity,
      mechanism: '印星通关，七杀生印而不受制',
      impact: '格局转化，贵气降低'
    });
  }
  
  if (W.cai > 0.7 && W.sha > 0.6) {
    result.pogeFactors.push({
      type: '财星党杀',
      weight: 8,
      description: '财星生七杀，增强七杀力量',
      severity: '严重',
      mechanism: '财星通关，食神生财而不制杀',
      impact: '格局不清，制杀无力，易因财生灾'
    });
  }
  
  // 检查官杀混杂
  if (W.zGuan > 0.3 && W.sha > 0.3) {
    result.pogeFactors.push({
      type: '官杀混杂',
      weight: 8,
      description: '正官七杀并存，格局不纯',
      severity: '中等',
      mechanism: '官杀相互干扰，制化关系混乱',
      impact: '事业方向不明，易有官非纠纷'
    });
  }
  
  // 检查救应因素
  if (W.bi > 0.5 && dayMasterStrength < 0.4) {
    const effectiveness = W.bi > 0.7 ? '显著' : '良好';
    result.rescueFactors.push({
      type: '比劫帮身',
      weight: 7,
      description: '比劫增强日主力量，可任杀制杀',
      counterPoge: '身弱不任',
      effectiveness,
      mechanism: '比劫扶身，增强日主根基和抗压能力',
      conditions: '比劫有根且不受重伤'
    });
  }
  
  // 检查食神得地救应
  if (dayStem && shishenPositions.length > 0) {
    const hasStrongRoot = shishenPositions.some(p => p.type === 'branch' && p.strength > 0.6);
    if (hasStrongRoot && shishenStrength < shaStrength * 0.8) {
      result.rescueFactors.push({
        type: '食神得地',
        weight: 9,
        description: '食神得地支强根，制杀有力',
        counterPoge: '制杀不力',
        effectiveness: '显著',
        mechanism: '地支强根增强食神实际力量',
        conditions: '食神在地支有临官、帝旺等强根'
      });
    }
  }
  
  // 检查位置优势救应
  if (controlEffectiveness && controlEffectiveness.effective) {
    if (controlEffectiveness.controlType.includes('同柱') || 
        controlEffectiveness.controlType.includes('顺位')) {
      result.rescueFactors.push({
        type: '位置优越',
        weight: 8,
        description: controlEffectiveness.description,
        counterPoge: '制化不力',
        effectiveness: '良好',
        mechanism: '优越的位置关系增强制化效果',
        conditions: controlEffectiveness.controlType
      });
    }
  }
  
  calculatePatternPurity(result);
  return result;
}

/**
 * 检查是否符合伤官配印
 */
function meetsShangGuanPeiYin(pillars, strength, W) {
  return W.shang > 0.60 && W.yin > 0.55 && W.guan < 0.70;
}

/**
 * 诊断伤官配印
 */
function diagnoseShangGuanPeiYin(pillars, strength, W, mainPattern, pogeFactors) {
  const result = {
    pattern: '伤官配印',
    pogeFactors: [],
    rescueFactors: [],
    score: 100,
    level: '',
    description: '',
    relationToMain: analyzeRelationToMain(mainPattern, '伤官配印')
  };
  
  const shangStrength = W.shang;
  const yinStrength = W.yin;
  const dayMasterStrength = strength.score || 0.5;
  
  // 检查成立条件
  if (shangStrength < 0.3) {
    result.pogeFactors.push({
      type: '伤官无力',
      weight: 7,
      description: '伤官力量不足，无需配印'
    });
  }
  
  if (yinStrength < shangStrength * 0.6) {
    result.pogeFactors.push({
      type: '印星不足',
      weight: 9,
      description: '印星力量不足，制约伤官无力'
    });
  }
  
  if (dayMasterStrength > 0.7 && yinStrength > shangStrength) {
    result.pogeFactors.push({
      type: '身强印重',
      weight: 6,
      description: '身强印重反埋没才华'
    });
  }
  
  // 检查破格因素
  if (W.cai > 0.75) {
    result.pogeFactors.push({
      type: '财星坏印',
      weight: 8,
      description: '财星克制印星，破坏伤官配印'
    });
  }
  
  // 检查救应因素
  if (W.guan > 0.5 && yinStrength < shangStrength * 0.6) {
    result.rescueFactors.push({
      type: '官杀生印',
      weight: 8,
      description: '官杀生印增强印星力量',
      counterPoge: '印星不足'
    });
  }
  
  calculatePatternPurity(result);
  return result;
}

/**
 * 检查是否符合伤官生财
 */
function meetsShangGuanShengCai(pillars, strength, W) {
  return W.shang > 0.6 && W.cai > 0.6 && W.guan < 0.5;
}

/**
 * 诊断伤官生财
 */
function diagnoseShangGuanShengCai(pillars, strength, W, mainPattern, pogeFactors) {
  const result = {
    pattern: '伤官生财',
    pogeFactors: [],
    rescueFactors: [],
    score: 100,
    level: '',
    description: '',
    relationToMain: analyzeRelationToMain(mainPattern, '伤官生财')
  };
  
  const shangStrength = W.shang;
  const caiStrength = W.cai;
  const dayMasterStrength = strength.score || 0.5;
  
  // 检查成立条件
  if (shangStrength < 0.3) {
    result.pogeFactors.push({
      type: '伤官无力',
      weight: 7,
      description: '伤官力量不足，无法生财'
    });
  }
  
  if (caiStrength < 0.3) {
    result.pogeFactors.push({
      type: '财星无力',
      weight: 8,
      description: '财星力量不足，难以受生'
    });
  }
  
  if (dayMasterStrength < 0.3) {
    result.pogeFactors.push({
      type: '身弱不任',
      weight: 7,
      description: '日主弱不能承担格局'
    });
  }
  
  // 检查破格因素
  if (W.pYin > 0.6) {
    result.pogeFactors.push({
      type: '枭神夺食',
      weight: 9,
      description: '偏印克制伤官，破坏生财'
    });
  }
  
  // 检查救应因素
  if (W.bi > 0.5 && dayMasterStrength < 0.4) {
    result.rescueFactors.push({
      type: '比劫帮身',
      weight: 7,
      description: '比劫增强日主力量',
      counterPoge: '身弱不任'
    });
  }
  
  if (W.guan > 0.5 && W.bi > 0.7) {
    result.rescueFactors.push({
      type: '官星护财',
      weight: 8,
      description: '官星制约比劫保护财星',
      counterPoge: '比劫夺财'
    });
  }
  
  calculatePatternPurity(result);
  return result;
}

/**
 * 检查是否符合食神生财
 */
function meetsShishenShengCai(pillars, strength, W) {
  return W.shishen > 0.65 && W.cai > 0.60;
}

/**
 * 诊断食神生财
 */
function diagnoseShishenShengCai(pillars, strength, W, mainPattern, pogeFactors) {
  const result = {
    pattern: '食神生财',
    pogeFactors: [],
    rescueFactors: [],
    score: 100,
    level: '',
    description: '',
    relationToMain: analyzeRelationToMain(mainPattern, '食神生财')
  };
  
  const shishenStrength = W.shishen;
  const caiStrength = W.cai;
  const dayMasterStrength = strength.score || 0.5;
  
  // 检查成立条件
  if (shishenStrength < 0.3) {
    result.pogeFactors.push({
      type: '食神无力',
      weight: 7,
      description: '食神力量不足，无法生财'
    });
  }
  
  if (caiStrength < 0.3) {
    result.pogeFactors.push({
      type: '财星无力',
      weight: 8,
      description: '财星力量不足，难以受生'
    });
  }
  
  if (dayMasterStrength < 0.3) {
    result.pogeFactors.push({
      type: '身弱不任',
      weight: 7,
      description: '日主弱不能承担格局'
    });
  }
  
  // 检查破格因素
  if (W.pYin > 0.6) {
    result.pogeFactors.push({
      type: '枭神夺食',
      weight: 9,
      description: '偏印克制食神，破坏生财'
    });
  }
  
  if (W.guan > 0.80) {
    result.pogeFactors.push({
      type: '官稍重',
      weight: 5,
      description: '官星过重影响格局'
    });
  }
  
  if (W.bi > 0.70) {
    result.pogeFactors.push({
      type: '比劫夺财',
      weight: 8,
      description: '比劫争夺财星'
    });
  }
  
  // 检查救应因素
  if (W.bi > 0.5 && dayMasterStrength < 0.4) {
    result.rescueFactors.push({
      type: '比劫帮身',
      weight: 7,
      description: '比劫增强日主力量',
      counterPoge: '身弱不任'
    });
  }
  
  if (W.guan > 0.5 && W.bi > 0.7) {
    result.rescueFactors.push({
      type: '官星护财',
      weight: 8,
      description: '官星制约比劫保护财星',
      counterPoge: '比劫夺财'
    });
  }
  
  calculatePatternPurity(result);
  return result;
}

/**
 * 检查是否符合官印相生
 */
function meetsGuanYinXiangSheng(pillars, strength, W) {
  return W.guan > 0.70 && W.yin > 0.65 && 
         (W.shang < 0.50) && (W.cai < 0.70) && (W.bi < 1.0) &&
         strength.band !== '从强';
}

/**
 * 诊断官印相生
 */
function diagnoseGuanYinXiangSheng(pillars, strength, W, mainPattern, pogeFactors) {
  const result = {
    pattern: '官印相生',
    pogeFactors: [],
    rescueFactors: [],
    score: 100,
    level: '',
    description: '',
    relationToMain: analyzeRelationToMain(mainPattern, '官印相生')
  };
  
  const guanStrength = W.guan;
  const yinStrength = W.yin;
  
  // 检查成立条件
  if (guanStrength < 0.5) {
    result.pogeFactors.push({
      type: '官星无力',
      weight: 8,
      description: '官星力量不足，无法生印'
    });
  }
  
  if (yinStrength < 0.5) {
    result.pogeFactors.push({
      type: '印星不足',
      weight: 9,
      description: '印星力量不足，生官无力'
    });
  }
  
  // 检查破格因素
  if (W.shang > 0.5) {
    result.pogeFactors.push({
      type: '伤官见官',
      weight: 10,
      description: '伤官克制正官，破坏官印相生'
    });
  }
  
  if (W.cai > 0.7) {
    result.pogeFactors.push({
      type: '财星坏印',
      weight: 8,
      description: '财星克制印星，破坏配合'
    });
  }
  
  // 检查救应因素
  if (W.yin > 0.6 && W.shang > 0.5) {
    result.rescueFactors.push({
      type: '印星制伤',
      weight: 10,
      description: '印星制约伤官保护官星',
      counterPoge: '伤官见官'
    });
  }
  
  calculatePatternPurity(result);
  return result;
}

/**
 * 检查是否符合杀印相生
 */
function meetsShaYinXiangSheng(pillars, strength, W) {
  return W.sha > 0.65 && W.yin > 0.55;
}

/**
 * 诊断杀印相生
 */
function diagnoseShaYinXiangSheng(pillars, strength, W, mainPattern, pogeFactors) {
  const result = {
    pattern: '杀印相生',
    pogeFactors: [],
    rescueFactors: [],
    score: 100,
    level: '',
    description: '',
    relationToMain: analyzeRelationToMain(mainPattern, '杀印相生')
  };
  
  const shaStrength = W.sha;
  const yinStrength = W.yin;
  
  // 检查成立条件
  if (shaStrength < 0.5) {
    result.pogeFactors.push({
      type: '七杀无力',
      weight: 7,
      description: '七杀力量不足，无法生印'
    });
  }
  
  if (yinStrength < 0.5) {
    result.pogeFactors.push({
      type: '印星不足',
      weight: 9,
      description: '印星力量不足，化杀无力'
    });
  }
  
  // 检查破格因素
  if (W.shang > 0.55) {
    result.pogeFactors.push({
      type: '伤官冲杀',
      weight: 8,
      description: '伤官冲克七杀，破坏配合'
    });
  }
  
  // 检查救应因素
  if (yinStrength > 0.6 && shaStrength > 0.7) {
    result.rescueFactors.push({
      type: '印星化杀',
      weight: 10,
      description: '印星有效转化七杀压力',
      counterPoge: '杀重无制'
    });
  }
  
  calculatePatternPurity(result);
  return result;
}

/**
 * 检查是否符合羊刃驾杀
 * ✅ V3.0：支持身偏强
 */
function meetsYangRenJiaSha(pillars, strength, W) {
  // 需要检查是否有羊刃（月支或日支为日主的帝旺位）
  const hasYangRen = checkHasYangRen(pillars);
  // ✅ V3.0：增加身偏强支持
  return hasYangRen && W.sha > 0.70 && 
         (strength.band === '身强' || strength.band === '身偏强' || strength.band === '从强' || strength.score >= 0.80) &&
         W.zGuan < 0.20 && W.shi < 0.80 && W.yin < 0.70;
}

/**
 * 检查是否有羊刃
 */
function checkHasYangRen(pillars) {
  if (!pillars.day?.stem || !pillars.month?.branch) return false;
  
  const monthStage = stage12(pillars.day.stem, pillars.month.branch);
  const dayStage = pillars.day.branch ? stage12(pillars.day.stem, pillars.day.branch) : '';
  
  return monthStage === '帝旺' || dayStage === '帝旺';
}

/**
 * 诊断羊刃驾杀
 */
function diagnoseYangRenJiaSha(pillars, strength, W, mainPattern, pogeFactors) {
  const result = {
    pattern: '羊刃驾杀',
    pogeFactors: [],
    rescueFactors: [],
    score: 100,
    level: '',
    description: '',
    relationToMain: analyzeRelationToMain(mainPattern, '羊刃驾杀')
  };
  
  const shaStrength = W.sha;
  const dayMasterStrength = strength.score || 0.5;
  const hasYangRen = checkHasYangRen(pillars);
  
  // 检查成立条件
  if (!hasYangRen) {
    result.pogeFactors.push({
      type: '羊刃无力',
      weight: 8,
      description: '无羊刃或羊刃力量不足'
    });
  }
  
  if (shaStrength < 0.5) {
    result.pogeFactors.push({
      type: '七杀无力',
      weight: 7,
      description: '七杀力量不足，无法显威'
    });
  }
  
  if (dayMasterStrength < 0.5) {
    result.pogeFactors.push({
      type: '身弱不任',
      weight: 7,
      description: '日主弱不能承受羊刃驾杀'
    });
  }
  
  // 检查破格因素
  if (W.zGuan > 0.20) {
    result.pogeFactors.push({
      type: '官杀混杂',
      weight: 8,
      description: '官杀并存格局不清'
    });
  }
  
  // 检查救应因素
  if (W.shishen > 0.5 && shaStrength > 0.7) {
    result.rescueFactors.push({
      type: '食神制杀',
      weight: 10,
      description: '食神有效制约七杀',
      counterPoge: '杀重无制'
    });
  }
  
  if (W.yin > 0.5 && shaStrength > 0.7) {
    result.rescueFactors.push({
      type: '印星化杀',
      weight: 8,
      description: '印星转化七杀压力',
      counterPoge: '杀重无制'
    });
  }
  
  calculatePatternPurity(result);
  return result;
}

/**
 * 检查是否符合财官双美
 * ✅ V3.0：支持身偏强
 */
function meetsCaiGuanShuangMei(pillars, strength, W) {
      // ✅ V3.0：增加身偏强支持
      return (strength.band === '身强' || strength.band === '身偏强' || strength.band === '平衡') && 
             W.cai > 0.65 && W.guan > 0.55;
    }
    
/**
 * 诊断财官双美
 */
function diagnoseCaiGuanShuangMei(pillars, strength, W, mainPattern, pogeFactors) {
      const result = {
        pattern: '财官双美',
        pogeFactors: [],
        rescueFactors: [],
        score: 100,
        level: '',
        description: '',
        relationToMain: analyzeRelationToMain(mainPattern, '财官双美')
      };
      
      const caiStrength = W.cai;
      const guanStrength = W.guan;
      const dayMasterStrength = strength.score || 0.5;
      
      // 检查成立条件
      if (caiStrength < 0.5) {
        result.pogeFactors.push({
          type: '财星无力',
          weight: 8,
          description: '财星力量不足，无法生官'
        });
      }
      
      if (guanStrength < 0.5) {
        result.pogeFactors.push({
          type: '官星无力',
          weight: 8,
          description: '官星力量不足，无法护财'
        });
      }
      
      // 检查破格因素
      if (W.bi > 0.70) {
        result.pogeFactors.push({
          type: '比劫夺财',
          weight: 10,
          description: '比劫争夺财星，破坏财官配合'
        });
      }
      
      // 检查救应因素
      if (W.guan > 0.5 && W.bi > 0.7) {
        result.rescueFactors.push({
          type: '官星护财',
          weight: 8,
          description: '官星制约比劫保护财星',
          counterPoge: '比劫夺财'
        });
      }
      
  calculatePatternPurity(result);
  return result;
}

/**
 * 检查是否符合伤官伤尽
 */
function meetsShangGuanShangJin(pillars, strength, W) {
      // 核心条件：完全无官杀
      const hasGuan = W.zGuan > 0.01 || W.sha > 0.01;
      return W.shang > 0.70 && !hasGuan;
    }
    
/**
 * 诊断伤官伤尽
 */
function diagnoseShangGuanShangJin(pillars, strength, W, mainPattern, pogeFactors) {
      const result = {
        pattern: '伤官伤尽',
        pogeFactors: [],
        rescueFactors: [],
        score: 100,
        level: '',
        description: '',
        relationToMain: analyzeRelationToMain(mainPattern, '伤官伤尽')
      };
      
      const shangStrength = W.shang;
      const dayMasterStrength = strength.score || 0.5;
      const hasGuan = W.zGuan > 0.01 || W.sha > 0.01;
      
      // 检查成立条件
      if (hasGuan) {
        result.pogeFactors.push({
          type: '见官杀',
          weight: 10,
          description: '八字中有官杀，伤官不能伤尽'
        });
      }
      
      if (shangStrength < 0.5) {
        result.pogeFactors.push({
          type: '伤官无力',
          weight: 7,
          description: '伤官力量不足，无法伤尽'
        });
      }
      
      if (dayMasterStrength < 0.3) {
        result.pogeFactors.push({
          type: '身弱不任',
          weight: 7,
          description: '日主弱不能承担格局'
        });
      }
      
      // 检查救应因素
      if (W.cai > 0.5 && shangStrength > 0.7) {
        result.rescueFactors.push({
          type: '财星转化',
          weight: 7,
          description: '财星转化伤官才华',
          counterPoge: '伤官过旺'
        });
      }
      
      if (W.yin > 0.5 && shangStrength > 0.7) {
        result.rescueFactors.push({
          type: '印星制约',
          weight: 8,
          description: '印星适当制约伤官',
          counterPoge: '伤官过旺'
        });
      }
      
  calculatePatternPurity(result);
  return result;
}

/**
 * 检查是否符合枭神夺食
 */
function meetsXiaoShenDuoShi(pillars, strength, W) {
      return W.pYin > 0.6 && W.shishen > 0.5;
    }
    
/**
 * 诊断枭神夺食
 */
function diagnoseXiaoShenDuoShi(pillars, strength, W, mainPattern, pogeFactors) {
      const result = {
        pattern: '枭神夺食',
        pogeFactors: [],
        rescueFactors: [],
        score: 100,
        level: '',
        description: '',
        relationToMain: analyzeRelationToMain(mainPattern, '枭神夺食')
      };
      
      const pYinStrength = W.pYin;
      const shishenStrength = W.shishen;
      
      // 检查成立条件
      if (pYinStrength < 0.5) {
        result.pogeFactors.push({
          type: '偏印无力',
          weight: 7,
          description: '偏印力量不足，无法夺食'
        });
      }
      
      if (shishenStrength < 0.3) {
        result.pogeFactors.push({
          type: '食神无力',
          weight: 8,
          description: '食神力量不足，无需夺食'
        });
      }
      
      // 检查救应因素
      if (W.cai > 0.5 && pYinStrength > 0.6) {
        result.rescueFactors.push({
          type: '财星制印',
          weight: 8,
          description: '财星制约偏印保护食神',
          counterPoge: '枭神夺食'
        });
      }
      
  calculatePatternPurity(result);
  return result;
}

/**
 * 计算组合格局纯度
 */
function calculatePatternPurity(result) {
      let deductScore = 0;
      let addScore = 0;
      
      // 计算破格扣分
      result.pogeFactors.forEach(poge => {
        deductScore += poge.weight || 0;
      });
      
      // 计算救应加分（只针对有对应破格的救应）
      result.rescueFactors.forEach(rescue => {
        const counterPoge = result.pogeFactors.find(p => p.type === rescue.counterPoge);
        if (counterPoge) {
          addScore += Math.min(rescue.weight || 0, counterPoge.weight || 0); // 加分不超过扣分
        }
      });
      
      // 最终得分
      result.score = Math.max(0, Math.min(100, 100 - deductScore + addScore));
      
      // 确定纯度等级
      if (result.score >= 90) {
        result.level = '真';
        result.description = generateDescription('真', result);
      } else if (result.score >= 70) {
        result.level = '假';
        result.description = generateDescription('假', result);
      } else if (result.score >= 50) {
        result.level = '一般';
        result.description = generateDescription('一般', result);
      } else {
        result.level = '破格';
        result.description = generateDescription('破格', result);
      }
}

/**
 * 生成描述文本
 */
function generateDescription(level, result) {
      const patternName = result.pattern;
      const descriptions = {
        '真': {
          base: `${patternName}格局纯粹，用神有力，无破格因素，为大贵之格。`,
          withRescue: `${patternName}格局清纯，虽有轻微瑕疵但已化解，格局成立。`
        },
        '假': {
          base: `${patternName}格局成立但有瑕疵，用神受制，有救应但不够完美。`,
          withRescue: `${patternName}格局成立，虽有破格因素但有救应化解，小富小贵。`
        },
        '一般': {
          base: `${patternName}格局勉强成立，纯度不高，用神无力，忌神无制。`,
          withRescue: `${patternName}格局成立但质量一般，有破格因素且救应不足。`
        },
        '破格': {
          base: `${patternName}格局被严重破坏，忌神猖獗，用神受损，贫贱困苦。`,
          withRescue: `${patternName}格局被破坏，虽有救应但力度不足，难以挽回。`
        }
      };
      
      const desc = descriptions[level];
      if (!desc) return `${patternName}格局纯度：${level}`;
      
      if (result.pogeFactors.length > 0 && result.rescueFactors.length > 0) {
        return desc.withRescue;
      } else if (result.pogeFactors.length > 0) {
        let descText = desc.base;
        if (result.pogeFactors.length > 0) {
          descText += `破格因素：${result.pogeFactors.map(p => p.type).join('、')}。`;
        }
        if (result.rescueFactors.length > 0) {
          descText += `救应因素：${result.rescueFactors.map(r => r.type).join('、')}。`;
        }
        return descText;
      } else {
        return desc.base;
      }
}

/**
 * 分析与月令主格的关系
 */
function analyzeRelationToMain(mainPattern, shishenPattern) {
  if (!mainPattern) return '与主格配合一般';
  
  const relationMap = {
    // 食神制杀与各主格的关系
    '食神制杀': {
      '七杀格': '完美配合，化杀为权',
      '正官格': '官杀混杂需处理',
      '伤官格': '伤官见官不利',
      '食神格': '食神过多泄身',
      'default': '辅助主格发挥'
    },
    
    // 伤官配印与各主格的关系
    '伤官配印': {
      '伤官格': '完美配合，才华得展',
      '正官格': '伤官见官破格',
      '七杀格': '杀印相生更佳',
      '正印格': '印重埋没才华',
      '偏印格': '印重埋没才华',
      'default': '制约伤官保护主格'
    },
    
    // 食神生财与各主格的关系
    '食神生财': {
      '食神格': '完美配合，生财有道',
      '正财格': '完美配合，财源广进',
      '偏财格': '完美配合，财源广进',
      '伤官格': '食伤混杂需处理',
      'default': '辅助主格发挥'
    },
    
    // 伤官生财与各主格的关系
    '伤官生财': {
      '伤官格': '完美配合，才华生财',
      '正财格': '完美配合，财源广进',
      '偏财格': '完美配合，财源广进',
      '正官格': '伤官见官破格',
      'default': '辅助主格发挥'
    },
    
    // 官印相生与各主格的关系
    '官印相生': {
      '正官格': '完美配合，官印相生',
      '正印格': '完美配合，印生官贵',
      '偏印格': '完美配合，印生官贵',
      '伤官格': '伤官见官破格',
      'default': '辅助主格发挥'
    },
    
    // 杀印相生与各主格的关系
    '杀印相生': {
      '七杀格': '完美配合，化杀为权',
      '正印格': '完美配合，印化杀威',
      '偏印格': '完美配合，印化杀威',
      'default': '辅助主格发挥'
    },
    
    // 羊刃驾杀与各主格的关系
    '羊刃驾杀': {
      '阳刃格': '完美配合，羊刃驾杀',
      '七杀格': '完美配合，化杀为权',
      '建禄格': '辅助配合，增强力量',
      'default': '辅助主格发挥'
    },
    
    // 财官双美与各主格的关系
    '财官双美': {
      '正官格': '完美配合，财官双美',
      '正财格': '完美配合，财能生官',
      '偏财格': '完美配合，财能生官',
      'default': '辅助主格发挥'
    },
    
    // 伤官伤尽与各主格的关系
    '伤官伤尽': {
      '伤官格': '完美配合，才华纯粹',
      'default': '特殊组合，才华出众'
    },
    
    // 枭神夺食与各主格的关系
    '枭神夺食': {
      '偏印格': '格局特征，需财制印',
      '食神格': '破格因素，需财解救',
      'default': '破格因素，需注意'
    }
  };
  
  const patternRelation = relationMap[shishenPattern] || {};
  return patternRelation[mainPattern] || patternRelation['default'] || '与主格配合一般';
}