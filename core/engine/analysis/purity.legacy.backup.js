/**
 * 综合纯度计算（子平法与盲派结合）- 优化版
 * 
 * 基于传统命理经典方法的综合评估系统
 * 
 * 算法（子平法为主，盲派为辅）：
 * 1. 格局纯度 (30%) - 子平法核心
 * 2. 用神得力 (25%) - 子平法用神体系
 * 3. 五行流通 (20%) - 盲派重视
 * 4. 十神配合 (15%) - 子平法十神关系
 * 5. 调候得失 (10%) - 子平法调候理论
 * 
 * @param {Object} pillars - 四柱数据
 * @param {Object} strength - 日主强弱结果
 * @param {Object} W - 十神权重对象
 * @param {String} structureName - 格局名称
 * @param {Object} options - 选项 { shishenPatterns?: Array, pogeFactors?: Array }
 * @returns {Object} { score: 75, level: '中清', details: {...} }
 */

import { STEM_ELEMENT, BRANCH_ELEMENT, GENERATES, CONTROLS, MOTHER_OF, CONTROLLER_OF, MONTH_INDEX, HIDDEN_STEMS } from './constants.js';
import { 
  getSeason,
  evaluateSeasonTiaohou,
  evaluateTemperatureBalance,
  evaluateHumidityBalance,
  isElementPresent,
  isElementControlled
} from './tiaohou.js';
import { 
  tenGodOf, 
  isGodRevealed, 
  isGodRooted,
  getShishenPositions
} from './utils.js';
import { analyzePoGeFactors } from './poge.js';
import { analyzeBranchRelationships } from '../mingli/branchRelationships.js';

/**
 * 计算综合纯度（清浊等级）
 * 保留原函数名以兼容现有代码
 */
export function calculatePurity(pillars, strength, W, structureName, options = {}) {
  return calculateComprehensivePurity(pillars, strength, W, structureName, options);
}

/**
 * 计算综合纯度（清浊等级）- 优化版
 * 保持接口兼容，内部使用新算法
 */
export function calculateComprehensivePurity(pillars, strength, W, structureName, options = {}) {
  // 构建 bazi 对象（用于内部计算）
  const bazi = {
    pillars,
    dayMaster: pillars.day?.stem,
    monthBranch: pillars.month?.branch
  };
  
  // 从 options 中获取额外数据
  const shishenPatterns = options.shishenPatterns || [];
  const pogeFactors = options.pogeFactors || analyzePoGeFactors(pillars, W, structureName, strength);
  
  // 步骤1：各模块独立计算（避免相互影响）
  const independentScores = calculateIndependentModules(bazi, strength, W, structureName, shishenPatterns, pogeFactors);
  
  // 步骤2：交叉验证，防止重复计分
  const validatedScores = crossValidateModules(independentScores, bazi, strength);
  
  // 步骤3：应用极端情况保护规则
  const protectedScores = applyExtremeCaseRules(validatedScores, bazi, strength, structureName);
  
  // 步骤4：计算最终得分
  const totalScore = calculateFinalScore(protectedScores);
  
  return {
    score: Math.round(totalScore),
    level: determinePurityLevelProfessional(totalScore),
    details: {
      patternPurity: Math.round(protectedScores.pattern),
      yongshenStrength: Math.round(protectedScores.yongshen),
      wuxingFlow: Math.round(protectedScores.flow),
      shishenHarmony: Math.round(protectedScores.harmony),
      tiaohouBalance: Math.round(protectedScores.tiaohou)
    }
  };
}

// ============================================================================
// 核心框架函数
// ============================================================================

/**
 * 各模块独立计算（避免信息泄露）
 */
function calculateIndependentModules(bazi, strength, W, mainPattern, shishenPatterns, pogeFactors) {
  return {
    pattern: analyzePatternPurity(bazi, strength, mainPattern, shishenPatterns, pogeFactors),
    yongshen: analyzeYongshenStrength(bazi, strength, W, mainPattern),
    flow: analyzeWuxingFlow(bazi.pillars, strength),
    harmony: analyzeShishenHarmony(bazi, strength, W, mainPattern, shishenPatterns),
    tiaohou: analyzeTiaohouBalance(bazi, strength)
  };
}

/**
 * 交叉验证，防止重复计分
 */
function crossValidateModules(modules, bazi, strength) {
  const validated = {...modules};
  const { pillars } = bazi;
  
  // 从格优势主要在格局模块计分，其他模块适当降低权重
  if (strength.band && (strength.band.includes('从') || strength.band.includes('专旺'))) {
    validated.yongshen *= 0.8;
    validated.flow *= 0.9;
  }
  
  // 完美流通主要在流通模块计分，格局模块不重复加分
  const flowScore = validated.flow;
  if (flowScore >= 18) {
    validated.pattern = Math.min(validated.pattern, 25); // 上限控制
  }
  
  // 调候极佳不在用神模块重复计分
  if (validated.tiaohou >= 9) {
    validated.yongshen = Math.min(validated.yongshen, 20);
  }
  
  return validated;
}

/**
 * 应用极端情况保护规则
 */
function applyExtremeCaseRules(scores, bazi, strength, structureName) {
  const protectedScores = {...scores};
  const total = calculateRawTotal(scores);
  
  // 破格彻底的情况
  if (isPatternCompletelyBroken(bazi, strength, structureName)) {
    const adjustedTotal = Math.min(total, 60);
    return scaleScoresToTotal(protectedScores, adjustedTotal);
  }
  
  // 从格反从的情况
  if (isConggeButResisted(bazi, strength)) {
    const adjustedTotal = Math.min(total, 65);
    return scaleScoresToTotal(protectedScores, adjustedTotal);
  }
  
  // 特殊格局但用神全无
  if (isSpecialPatternButNoYongshen(bazi, strength, structureName)) {
    const adjustedTotal = Math.min(total, 50);
    return scaleScoresToTotal(protectedScores, adjustedTotal);
  }
  
  return protectedScores;
}

/**
 * 计算最终得分
 */
function calculateFinalScore(protectedScores) {
  const rawTotal = calculateRawTotal(protectedScores);
  return Math.min(100, Math.max(0, rawTotal));
}

function calculateRawTotal(scores) {
  return scores.pattern + scores.yongshen + scores.flow + scores.harmony + scores.tiaohou;
}

function scaleScoresToTotal(scores, targetTotal) {
  const currentTotal = calculateRawTotal(scores);
  if (currentTotal <= targetTotal) return scores;
  
  const ratio = targetTotal / currentTotal;
  const scaled = {};
  for (const [key, value] of Object.entries(scores)) {
    scaled[key] = value * ratio;
  }
  return scaled;
}

// ============================================================================
// 1. 格局纯度分析 (30%)
// ============================================================================

/**
 * 格局纯度分析 (30%)
 * 子平法核心：月令为纲，格局为重
 */
function analyzePatternPurity(bazi, strength, mainPattern, shishenPatterns, pogeFactors) {
  let score = 0;
  
  // 1. 月令格局质量 (10分)
  const monthPatternScore = evaluateMonthPattern(bazi, mainPattern, strength);
  score += monthPatternScore;
  
  // 2. 格局清纯度 (8分)
  const patternClarity = evaluatePatternClarity(mainPattern, bazi.pillars, strength);
  score += patternClarity;
  
  // 3. 辅格配合 (7分)
  const auxiliaryScore = evaluateAuxiliaryPatterns(shishenPatterns, mainPattern);
  score += auxiliaryScore;
  
  // 4. 破格程度 (5分)
  const pogeScore = evaluatePogeFactors(bazi.pillars, mainPattern, strength, pogeFactors);
  score += pogeScore;
  
  return Math.min(30, Math.max(0, score));
}

/**
 * 评估月令格局质量（子平法核心）
 */
function evaluateMonthPattern(bazi, mainPattern, strength) {
  const { pillars, dayMaster, monthBranch } = bazi;
  if (!monthBranch || !dayMaster) return 0;
  
  const monthElement = BRANCH_ELEMENT[monthBranch];
  const dayMasterElement = STEM_ELEMENT[dayMaster];
  
  let score = 0;
  
  // 月令得用（子平法核心）
  if (isMonthUseful(monthElement, dayMasterElement, strength, mainPattern)) {
    score += 6;
  }
  
  // 格局与月令匹配度
  const monthMatch = evaluateMonthPatternMatch(mainPattern, monthBranch, pillars);
  score += monthMatch;
  
  // 月令透干（重要）
  if (isMonthRevealed(pillars, monthElement)) {
    score += 2;
  }
  
  return Math.min(10, score);
}

/**
 * 评估格局清纯度
 */
function evaluatePatternClarity(mainPattern, pillars, strength) {
  let score = 8; // 基础分
  
  // 特殊格局清纯度
  if (strength.band && (strength.band.includes('从') || strength.band.includes('专旺'))) {
    const specialClarity = evaluateSpecialPatternClarity(mainPattern, pillars, strength);
    score = specialClarity;
  } else {
    // 普通格局清纯度
    const commonClarity = evaluateCommonPatternClarity(mainPattern, pillars, strength);
    score = commonClarity;
  }
  
  // 混杂扣分
  if (hasPatternMixed(pillars, mainPattern)) {
    score -= 3;
  }
  
  return Math.max(0, score);
}

/**
 * 评估普通格局清纯度
 */
function evaluateCommonPatternClarity(mainPattern, pillars, strength) {
  let score = 8;
  
  // 官格：怕伤官见官、官杀混杂
  if (mainPattern && mainPattern.includes('官')) {
    if (hasShangguan(pillars) && !hasYinControl(pillars)) {
      score -= 4;
    }
    if (hasGuanShaMixed(pillars)) {
      score -= 3;
    }
  }
  
  // 财格：怕比劫夺财
  if (mainPattern && mainPattern.includes('财')) {
    if (hasBiJieDuoCai(pillars) && !hasGuanProtect(pillars)) {
      score -= 4;
    }
  }
  
  // 印格：怕财星坏印
  if (mainPattern && mainPattern.includes('印')) {
    if (hasCaiPoYin(pillars) && !hasGuanRescue(pillars)) {
      score -= 4;
    }
  }
  
  // 食伤格：怕枭神夺食
  if (mainPattern && (mainPattern.includes('食') || mainPattern.includes('伤'))) {
    if (hasXiaoshenDuoshi(pillars) && !hasCaiControl(pillars)) {
      score -= 4;
    }
  }
  
  return Math.max(0, score);
}

/**
 * 评估特殊格局清纯度
 */
function evaluateSpecialPatternClarity(mainPattern, pillars, strength) {
  let score = 8;
  
  // 从格纯度（简化判断）
  if (strength.band && strength.band.includes('从')) {
    if (strength.band === '从弱' || strength.band === '从强') {
      score = 8; // 真从
    } else {
      score = 6; // 假从
    }
  }
  
  // 专旺格纯度（简化判断）
  if (strength.band && strength.band.includes('专旺')) {
    score = 7; // 专旺格通常较纯
  }
  
  return score;
}

/**
 * 评估辅格配合
 */
function evaluateAuxiliaryPatterns(shishenPatterns, mainPattern) {
  if (!shishenPatterns || shishenPatterns.length === 0) {
    return 3; // 无辅格，基础分
  }
  
  let score = 3;
  
  // 检查辅格与主格的配合度
  for (const pattern of shishenPatterns) {
    if (pattern && pattern.pattern) {
      const patternName = pattern.pattern;
      const patternScore = pattern.score || 0;
      
      // 辅格得分越高，配合越好
      if (patternScore >= 80) {
        score += 2;
      } else if (patternScore >= 60) {
        score += 1;
      }
    }
  }
  
  return Math.min(7, score);
}

/**
 * 评估破格程度
 */
function evaluatePogeFactors(pillars, mainPattern, strength, pogeFactors) {
  if (!pogeFactors || pogeFactors.length === 0) {
    return 5; // 无破格因素，满分
  }
  
  let score = 5;
  
  // 根据破格因素的严重程度扣分
  for (const factor of pogeFactors) {
    const baseScore = factor.baseScore || 1.0;
    const severity = factor.severity || '中等';
    
    let deduction = baseScore;
    if (severity === '严重') deduction *= 1.5;
    else if (severity === '轻微') deduction *= 0.7;
    
    score -= deduction;
  }
  
  return Math.max(0, score);
}

// ============================================================================
// 2. 用神得力分析 (25%)
// ============================================================================

/**
 * 用神得力分析 (25%)
 * 子平法用神体系：扶抑、病药（调候独立处理）
 */
function analyzeYongshenStrength(bazi, strength, W, mainPattern) {
  let score = 0;
  
  // 1. 用神自洽度 (8分)
  const yongshenConsistency = evaluateYongshenConsistency(bazi, strength, mainPattern);
  score += yongshenConsistency;
  
  // 2. 用神力量强度 (7分)
  const yongshenPower = evaluateYongshenPower(bazi, strength, W);
  score += yongshenPower;
  
  // 3. 用神位置优势 (5分)
  const yongshenPosition = evaluateYongshenPosition(bazi, strength);
  score += yongshenPosition;
  
  // 4. 忌神制约程度 (5分)
  const jishenControl = evaluateJishenControl(bazi, strength, W);
  score += jishenControl;
  
  return Math.min(25, Math.max(0, score));
}

/**
 * 评估用神逻辑自洽度
 */
function evaluateYongshenConsistency(bazi, strength, mainPattern) {
  const derivedYongshen = getFuyiBingyaoYongshen(bazi, strength, mainPattern);
  
  let consistencyScore = 0;
  
  // 1. 扶抑自洽性检查
  if (isFuyiConsistent(derivedYongshen, strength)) {
    consistencyScore += 3;
  }
  
  // 2. 格局自洽性检查  
  if (isPatternConsistent(derivedYongshen, mainPattern)) {
    consistencyScore += 3;
  }
  
  // 3. 病药自洽性检查
  if (isBingyaoConsistent(derivedYongshen, bazi)) {
    consistencyScore += 2;
  }
  
  return Math.min(8, consistencyScore);
}

/**
 * 获取扶抑病药用神（不包含调候）
 * 优化：直接使用已有从格判定结果
 */
function getFuyiBingyaoYongshen(bazi, strength, mainPattern) {
  const { pillars, dayMaster, monthBranch } = bazi;
  if (!dayMaster) return { yongShen: [], xiShen: [], jiShen: [] };
  
  const dayMasterElement = STEM_ELEMENT[dayMaster];
  const monthElement = monthBranch ? BRANCH_ELEMENT[monthBranch] : null;
  
  const yongShen = []; // 用神（十神名称，如 '正印', '偏印'）
  const xiShen = [];   // 喜神
  const jiShen = [];   // 忌神
  
  // 特殊格局用神（优先判断，使用已有判定结果）
  if (strength.band && strength.band.includes('从')) {
    return getConggeYongshenFromPattern(mainPattern, strength.band);
  }
  
  // 专旺格用神（从强已合并到专旺格）
  if (strength.band === '从强' || (mainPattern && mainPattern.includes('专旺'))) {
    return getZhuanwangYongshen(mainPattern, dayMasterElement);
  }
  
  // 扶抑用神（子平法核心）
  if (strength.band === '身弱') {
    yongShen.push('正印', '偏印', '比肩', '劫财');
    jiShen.push('正财', '偏财', '七杀', '正官', '伤官', '食神');
  } else if (strength.band === '身强') {
    yongShen.push('正财', '偏财', '正官', '七杀', '食神', '伤官');
    jiShen.push('正印', '偏印', '比肩', '劫财');
  } else if (strength.band === '平衡') {
    // 平衡格局，根据月令取用
    yongShen.push(...getBalanceYongshen(monthElement, dayMasterElement));
  }
  
  // 病药用神（针对明显病处）
  const bingyaoGods = getBingyaoYongshen(pillars, strength);
  yongShen.push(...bingyaoGods);
  
  return { yongShen, xiShen, jiShen };
}

/**
 * 评估用神力量强度
 */
function evaluateYongshenPower(bazi, strength, W) {
  const { yongShen, xiShen } = getFuyiBingyaoYongshen(bazi, strength);
  let score = 0;
  
  // 将十神名称转换为 W 对象的键
  const godToWKey = {
    '正官': 'zGuan', '七杀': 'sha',
    '正印': 'zYin', '偏印': 'pYin',
    '正财': 'cai', '偏财': 'cai', // 系统只有 cai 总和
    '食神': 'shishen', '伤官': 'shang',
    '比肩': 'bi', '劫财': 'bi'
  };
  
  const allYongshen = [...yongShen, ...xiShen];
  
  for (const god of allYongshen) {
    const wKey = godToWKey[god];
    if (!wKey) continue;
    
    const godWeight = W[wKey] || 0;
    
    // 用神透干 (3分)
    if (isGodRevealed(bazi.pillars, god, bazi.dayMaster)) {
      score += 3;
    }
    
    // 用神得地 (2分)
    if (godWeight > 0.5) {
      score += 2;
    }
    
    // 用神逢生 (2分) - 简化判断
    if (godWeight > 0.7) {
      score += 2;
    }
  }
  
  return Math.min(7, score);
}

/**
 * 评估用神位置优势
 */
function evaluateYongshenPosition(bazi, strength) {
  const { yongShen } = getFuyiBingyaoYongshen(bazi, strength);
  let score = 0;
  
  // 检查用神是否在关键位置（月令、日支）
  for (const god of yongShen) {
    const positions = getShishenPositions(bazi.pillars, god, bazi.dayMaster);
    
    for (const pos of positions) {
      // 月令位置最重要
      if (pos.position === 'month') {
        score += 3;
      }
      // 日支次之
      else if (pos.position === 'day') {
        score += 2;
      }
    }
  }
  
  return Math.min(5, score);
}

/**
 * 评估忌神制约程度
 */
function evaluateJishenControl(bazi, strength, W) {
  const { jiShen } = getFuyiBingyaoYongshen(bazi, strength);
  let score = 5; // 基础分
  
  // 检查忌神是否被制约
  for (const god of jiShen) {
    const godToWKey = {
      '正官': 'zGuan', '七杀': 'sha',
      '正印': 'zYin', '偏印': 'pYin',
      '正财': 'cai', '偏财': 'cai',
      '食神': 'shishen', '伤官': 'shang',
      '比肩': 'bi', '劫财': 'bi'
    };
    
    const wKey = godToWKey[god];
    if (!wKey) continue;
    
    const godWeight = W[wKey] || 0;
    
    // 忌神力量强且未被制约，扣分
    if (godWeight > 0.6) {
      score -= 1;
    }
  }
  
  return Math.max(0, score);
}

// ============================================================================
// 3. 五行流通分析 (20%) - 专业版（集成三合三会）
// ============================================================================

/**
 * 五行流通分析 (20%)
 * 盲派特别重视五行流通和气势
 * 集成三合三会局分析，增强流通判断
 */
function analyzeWuxingFlow(pillars, strength) {
  let score = 0;
  
  // 1. 基础五行流通路径（天干生克链）(6分)
  const flowPath = calculateFlowPath(pillars);
  if (flowPath.length >= 4) {
    score += 6;  // 流通顺畅
  } else if (flowPath.length >= 2) {
    score += 3;   // 基本流通
  } else {
    score -= 2;  // 流通阻塞
  }
  
  // 2. 三合三会局分析（增强流通）(8分)
  const branchRelations = analyzeBranchRelationships(pillars);
  const sanheScore = evaluateSanHeFlow(branchRelations.sanhe);
  const sanhuiScore = evaluateSanHuiFlow(branchRelations.sanhui);
  score += sanheScore + sanhuiScore;
  
  // 3. 六合关系（辅助流通）(2分)
  const liuheScore = evaluateLiuHeFlow(branchRelations.liuhe);
  score += liuheScore;
  
  // 4. 检查相战（扣分）(4分)
  const conflicts = checkElementConflicts(pillars);
  const chongScore = evaluateChongConflicts(branchRelations.liuchong);
  score -= conflicts * 2;  // 天干相战扣分
  score -= chongScore;      // 地支相冲扣分
  
  return Math.min(20, Math.max(0, score));
}

/**
 * 评估三合局对流通的影响
 */
function evaluateSanHeFlow(sanheResults) {
  if (!sanheResults || sanheResults.length === 0) return 0;
  
  let score = 0;
  for (const he of sanheResults) {
    if (he.isComplete) {
      // 完整三合局：力量强，流通顺畅
      score += 4;
    } else {
      // 半合局：力量中等
      score += 2;
    }
  }
  
  // 多个三合局叠加，但不超过上限
  return Math.min(5, score);
}

/**
 * 评估三会局对流通的影响
 */
function evaluateSanHuiFlow(sanhuiResults) {
  if (!sanhuiResults || sanhuiResults.length === 0) return 0;
  
  let score = 0;
  for (const hui of sanhuiResults) {
    if (hui.isComplete) {
      // 完整三会局：力量最强，流通极佳
      score += 5;
    } else {
      // 半会局：力量较强
      score += 2.5;
    }
  }
  
  // 三会局力量比三合更强，但不超过上限
  return Math.min(6, score);
}

/**
 * 评估六合关系对流通的影响
 */
function evaluateLiuHeFlow(liuheResults) {
  if (!liuheResults || liuheResults.length === 0) return 0;
  
  // 六合有助于流通，但力量较弱
  const heCount = liuheResults.length;
  if (heCount >= 2) return 2;  // 多个六合，流通良好
  if (heCount === 1) return 1;  // 单个六合，略有帮助
  return 0;
}

/**
 * 评估地支相冲对流通的破坏
 */
function evaluateChongConflicts(liuchongResults) {
  if (!liuchongResults || liuchongResults.length === 0) return 0;
  
  // 每个相冲扣分，但不超过上限
  const chongCount = liuchongResults.length;
  return Math.min(4, chongCount * 1.5);
}

/**
 * 计算五行流通路径
 */
function calculateFlowPath(pillars) {
  const elements = [];
  for (const pos of ['year', 'month', 'day', 'hour']) {
    const pillar = pillars[pos];
    if (!pillar) continue;
    const stemElement = STEM_ELEMENT[pillar.stem];
    if (!elements.includes(stemElement)) {
      elements.push(stemElement);
    }
  }
  
  // 检查是否形成生链
  const flowChain = [];
  for (let i = 0; i < elements.length - 1; i++) {
    if (GENERATES[elements[i]] === elements[i + 1]) {
      flowChain.push([elements[i], elements[i + 1]]);
    }
  }
  
  return flowChain;
}

/**
 * 检查五行相战
 */
function checkElementConflicts(pillars) {
  let conflicts = 0;
  const elements = [];
  
  for (const pos of ['year', 'month', 'day', 'hour']) {
    const pillar = pillars[pos];
    if (!pillar) continue;
    elements.push(STEM_ELEMENT[pillar.stem]);
  }
  
  // 检查相克
  for (let i = 0; i < elements.length; i++) {
    for (let j = i + 1; j < elements.length; j++) {
      if (CONTROLS[elements[i]] === elements[j] || CONTROLS[elements[j]] === elements[i]) {
        conflicts++;
      }
    }
  }
  
  return conflicts;
}

// ============================================================================
// 4. 十神配合分析 (15%) - 专业版（利用现有函数和诊断结果）
// ============================================================================

/**
 * 十神配合分析 (15%)
 * 子平法十神生克制化关系
 * 利用 shishenPattern.js 的诊断结果和 utils.js 的工具函数
 */
function analyzeShishenHarmony(bazi, strength, W, mainPattern, shishenPatterns = []) {
  let score = 0;
  
  // 1. 十神组合格局质量（利用诊断结果）(5分)
  const patternQuality = evaluateShishenPatternQuality(shishenPatterns);
  score += patternQuality;
  
  // 2. 吉神护卫（利用位置分析）(3分)
  const luckyGodProtection = evaluateLuckyGodProtectionProfessional(bazi, W);
  score += luckyGodProtection;
  
  // 3. 凶神制化（利用有效性检查）(3分)
  const xiongShenControl = evaluate凶神ControlProfessional(bazi, W);
  score += xiongShenControl;
  
  // 4. 十神生克有情 (2分)
  const shengKeHarmony = evaluate生克HarmonyProfessional(bazi, W);
  score += shengKeHarmony;
  
  // 5. 位置配合优势（利用位置强度）(2分)
  const positionHarmony = evaluatePositionHarmonyProfessional(bazi, W);
  score += positionHarmony;
  
  return Math.min(15, Math.max(0, score));
}

/**
 * 评估十神组合格局质量（利用诊断结果）
 */
function evaluateShishenPatternQuality(shishenPatterns) {
  if (!shishenPatterns || shishenPatterns.length === 0) {
    return 2; // 无组合格局，基础分
  }
  
  let score = 0;
  let highQualityCount = 0;
  
  for (const pattern of shishenPatterns) {
    if (pattern && pattern.score !== undefined) {
      const patternScore = pattern.score;
      
      // 高质量组合格局（得分高）
      if (patternScore >= 85) {
        score += 2;
        highQualityCount++;
      } else if (patternScore >= 70) {
        score += 1;
      } else if (patternScore >= 60) {
        score += 0.5;
      }
    }
  }
  
  // 多个高质量组合格局，额外加分
  if (highQualityCount >= 2) {
    score += 1;
  }
  
  return Math.min(5, score);
}

/**
 * 吉神护卫评估（专业版，利用位置分析）
 */
function evaluateLuckyGodProtectionProfessional(bazi, W) {
  const { pillars, dayMaster } = bazi;
  if (!dayMaster) return 0;
  
  let score = 0;
  
  // 正官有护卫（利用位置分析）
  if (W.zGuan > 0.5) {
    const zGuanPositions = getShishenPositions(pillars, '正官', dayMaster);
    const isZguanRevealed = isGodRevealed(pillars, '正官', dayMaster);
    const isZguanRooted = isGodRooted(pillars, '正官', dayMaster);
    
    // 正官透干且有根，力量强
    if (isZguanRevealed && isZguanRooted) {
      score += 1;
    }
    
    // 正官有印星护卫（印生官）
    if (hasYinShengGuan(pillars)) {
      score += 1;
    }
    
    // 正官无伤官破坏
    if (!hasShangGuan(pillars)) {
      score += 0.5;
    }
  }
  
  // 正印有护卫
  if (W.zYin > 0.5) {
    const zYinPositions = getShishenPositions(pillars, '正印', dayMaster);
    const isZYinRevealed = isGodRevealed(pillars, '正印', dayMaster);
    const isZYinRooted = isGodRooted(pillars, '正印', dayMaster);
    
    // 正印透干且有根，力量强
    if (isZYinRevealed && isZYinRooted) {
      score += 0.5;
    }
    
    // 正印无财星破坏
    if (!hasCaiPoYin(pillars)) {
      score += 0.5;
    }
  }
  
  // 财星有护卫
  if (W.cai > 0.5) {
    // 财星无比劫夺财
    if (!hasBiJieDuoCai(pillars)) {
      score += 0.5;
    }
    
    // 财星有官星保护
    if (hasGuanProtect(pillars)) {
      score += 0.5;
    }
  }
  
  return Math.min(3, score);
}

/**
 * 凶神制化评估（专业版，利用有效性检查）
 */
function evaluate凶神ControlProfessional(bazi, W) {
  const { pillars, dayMaster } = bazi;
  if (!dayMaster) return 0;
  
  let score = 0;
  
  // 七杀有制（利用有效性检查）
  if (W.sha > 0.5) {
    const shaPositions = getShishenPositions(pillars, '七杀', dayMaster);
    const shishenPositions = getShishenPositions(pillars, '食神', dayMaster);
    const yinPositions = [
      ...getShishenPositions(pillars, '正印', dayMaster),
      ...getShishenPositions(pillars, '偏印', dayMaster)
    ];
    
    // 食神制杀（检查有效性）
    if (shishenPositions.length > 0 && shaPositions.length > 0) {
      const effectiveness = checkZhishaEffectiveness(shishenPositions, shaPositions);
      if (effectiveness === '同柱制化' || effectiveness === '顺位制化') {
        score += 1.5; // 有效制化
      } else if (effectiveness === '逆位制化' || effectiveness === '遥制') {
        score += 1; // 制化有效但较弱
      }
    }
    
    // 印星化杀
    if (yinPositions.length > 0 && shaPositions.length > 0) {
      score += 1;
    }
  }
  
  // 伤官有制
  if (W.shang > 0.5) {
    const shangPositions = getShishenPositions(pillars, '伤官', dayMaster);
    const yinPositions = [
      ...getShishenPositions(pillars, '正印', dayMaster),
      ...getShishenPositions(pillars, '偏印', dayMaster)
    ];
    const caiPositions = getShishenPositions(pillars, '正财', dayMaster);
    
    // 印配伤官
    if (yinPositions.length > 0 && shangPositions.length > 0) {
      score += 0.5;
    }
    
    // 财化伤官
    if (caiPositions.length > 0 && shangPositions.length > 0) {
      score += 0.5;
    }
  }
  
  // 枭神有制
  if (W.pYin > 0.5) {
    const pYinPositions = getShishenPositions(pillars, '偏印', dayMaster);
    const caiPositions = getShishenPositions(pillars, '正财', dayMaster);
    
    // 财制印
    if (caiPositions.length > 0 && pYinPositions.length > 0) {
      score += 0.5;
    }
  }
  
  return Math.min(3, score);
}

/**
 * 十神生克有情评估（专业版）
 */
function evaluate生克HarmonyProfessional(bazi, W) {
  const { pillars, dayMaster } = bazi;
  if (!dayMaster) return 0;
  
  let score = 0;
  
  // 官印相生（检查位置关系）
  if (W.zGuan > 0.3 && W.zYin > 0.3) {
    const guanPositions = getShishenPositions(pillars, '正官', dayMaster);
    const yinPositions = getShishenPositions(pillars, '正印', dayMaster);
    
    // 官印相邻或同柱，生克有情
    if (guanPositions.length > 0 && yinPositions.length > 0) {
      score += 0.8;
    }
  }
  
  // 食神生财（检查位置关系）
  if (W.shishen > 0.3 && W.cai > 0.3) {
    const shishenPositions = getShishenPositions(pillars, '食神', dayMaster);
    const caiPositions = getShishenPositions(pillars, '正财', dayMaster);
    
    if (shishenPositions.length > 0 && caiPositions.length > 0) {
      score += 0.8;
    }
  }
  
  // 财生官（检查位置关系）
  if (W.cai > 0.3 && W.zGuan > 0.3) {
    const caiPositions = getShishenPositions(pillars, '正财', dayMaster);
    const guanPositions = getShishenPositions(pillars, '正官', dayMaster);
    
    if (caiPositions.length > 0 && guanPositions.length > 0) {
      score += 0.4;
    }
  }
  
  return Math.min(2, score);
}

/**
 * 位置配合评估（专业版，利用位置强度）
 */
function evaluatePositionHarmonyProfessional(bazi, W) {
  const { pillars, dayMaster } = bazi;
  if (!dayMaster) return 0;
  
  let score = 0;
  
  // 检查关键十神是否在关键位置（月令、日支）
  const keyGods = [];
  if (W.zGuan > 0.5) keyGods.push('正官');
  if (W.sha > 0.5) keyGods.push('七杀');
  if (W.cai > 0.5) keyGods.push('正财');
  if (W.zYin > 0.5) keyGods.push('正印');
  if (W.shishen > 0.5) keyGods.push('食神');
  
  for (const god of keyGods) {
    const positions = getShishenPositions(pillars, god, dayMaster);
    
    for (const pos of positions) {
      // 月令位置最重要
      if (pos.position === 'month' && pos.strength > 0.8) {
        score += 0.5;
      }
      // 日支次之
      else if (pos.position === 'day' && pos.strength > 0.7) {
        score += 0.3;
      }
    }
  }
  
  return Math.min(2, score);
}

// evaluatePatternHarmony 已移除，功能整合到 evaluateShishenPatternQuality

// ============================================================================
// 5. 调候得失分析 (10%)
// ============================================================================

/**
 * 调候得失分析 (10%)
 * 子平法调候理论：寒暖燥湿平衡（独立模块，已实现）
 */
function analyzeTiaohouBalance(bazi, strength) {
  const { pillars, dayMaster, monthBranch } = bazi;
  if (!pillars || !monthBranch || !dayMaster) {
    return 0;
  }
  
  const dayMasterElement = STEM_ELEMENT[dayMaster];
  const season = getSeason(monthBranch);
  
  let score = 0;
  
  // 1. 季节调候 (4分)
  const seasonBalance = evaluateSeasonTiaohou(season, dayMasterElement, pillars);
  score += seasonBalance;
  
  // 2. 全局寒暖 (3分)
  const temperatureBalance = evaluateTemperatureBalance(pillars, season);
  score += temperatureBalance;
  
  // 3. 燥湿平衡 (3分)
  const humidityBalance = evaluateHumidityBalance(pillars, season);
  score += humidityBalance;
  
  return Math.min(10, Math.max(0, Math.round(score * 10) / 10));
}

// ============================================================================
// 辅助函数：格局纯度相关
// ============================================================================

/**
 * 检查月令是否得用
 */
function isMonthUseful(monthElement, dayMasterElement, strength, mainPattern) {
  if (!monthElement || !dayMasterElement) return false;
  
  // 月令为日主同类或生我者，通常得用
  if (monthElement === dayMasterElement) return true;
  if (GENERATES[monthElement] === dayMasterElement) return true;
  
  // 特殊格局需要特殊判断
  if (strength.band && strength.band.includes('从')) {
    // 从格：月令为所从之神
    return true;
  }
  
  return false;
}

/**
 * 评估格局与月令匹配度
 */
function evaluateMonthPatternMatch(mainPattern, monthBranch, pillars) {
  if (!mainPattern || !monthBranch) return 0;
  
  let score = 0;
  
  // 简化判断：如果格局名称与月令相关，加分
  const monthElement = BRANCH_ELEMENT[monthBranch];
  
  // 这里可以进一步细化判断逻辑
  // 暂时给基础分
  score = 2;
  
  return Math.min(2, score);
}

/**
 * 检查月令是否透干
 */
function isMonthRevealed(pillars, monthElement) {
  if (!pillars.month || !monthElement) return false;
  
  const monthBranch = pillars.month.branch;
  const hiddenStems = HIDDEN_STEMS[monthBranch] || [];
  
  // 检查月支藏干是否透出
  for (const hidden of hiddenStems) {
    const stem = Array.isArray(hidden) ? hidden[0] : (hidden.stem || hidden);
    const stemElement = STEM_ELEMENT[stem];
    
    if (stemElement === monthElement) {
      // 检查是否在天干上
      for (const pos of ['year', 'month', 'hour']) {
        if (pillars[pos] && pillars[pos].stem === stem) {
          return true;
        }
      }
    }
  }
  
  return false;
}

/**
 * 检查格局是否混杂
 */
function hasPatternMixed(pillars, mainPattern) {
  if (!mainPattern) return false;
  
  // 简化判断：检查是否有明显的混杂特征
  // 具体逻辑可以进一步细化
  return false;
}

/**
 * 检查是否有伤官
 */
function hasShangguan(pillars) {
  if (!pillars || !pillars.day) return false;
  const dayStem = pillars.day.stem;
  
  for (const pos of ['year', 'month', 'day', 'hour']) {
    const pillar = pillars[pos];
    if (!pillar) continue;
    const tg = tenGodOf(dayStem, pillar.stem);
    if (tg === '伤官') return true;
  }
  return false;
}

/**
 * 检查是否有印星控制伤官
 */
function hasYinControl(pillars) {
  if (!pillars || !pillars.day) return false;
  const dayStem = pillars.day.stem;
  
  for (const pos of ['year', 'month', 'day', 'hour']) {
    const pillar = pillars[pos];
    if (!pillar) continue;
    const tg = tenGodOf(dayStem, pillar.stem);
    if (tg === '正印' || tg === '偏印') return true;
  }
  return false;
}

/**
 * 检查官杀混杂
 */
function hasGuanShaMixed(pillars) {
  if (!pillars || !pillars.day) return false;
  const dayStem = pillars.day.stem;
  
  let hasZhengGuan = false;
  let hasQiSha = false;
  
  for (const pos of ['year', 'month', 'day', 'hour']) {
    const pillar = pillars[pos];
    if (!pillar) continue;
    const tg = tenGodOf(dayStem, pillar.stem);
    if (tg === '正官') hasZhengGuan = true;
    if (tg === '七杀') hasQiSha = true;
  }
  
  return hasZhengGuan && hasQiSha;
}

/**
 * 检查比劫夺财
 */
function hasBiJieDuoCai(pillars) {
  if (!pillars || !pillars.day) return false;
  const dayStem = pillars.day.stem;
  
  let hasCai = false;
  let hasBiJie = false;
  
  for (const pos of ['year', 'month', 'day', 'hour']) {
    const pillar = pillars[pos];
    if (!pillar) continue;
    const tg = tenGodOf(dayStem, pillar.stem);
    if (tg === '正财' || tg === '偏财') hasCai = true;
    if (tg === '比肩' || tg === '劫财') hasBiJie = true;
  }
  
  return hasCai && hasBiJie;
}

/**
 * 检查是否有官星保护
 */
function hasGuanProtect(pillars) {
  if (!pillars || !pillars.day) return false;
  const dayStem = pillars.day.stem;
  
  for (const pos of ['year', 'month', 'day', 'hour']) {
    const pillar = pillars[pos];
    if (!pillar) continue;
    const tg = tenGodOf(dayStem, pillar.stem);
    if (tg === '正官' || tg === '七杀') return true;
  }
  return false;
}

/**
 * 检查财星坏印
 */
function hasCaiPoYin(pillars) {
  if (!pillars || !pillars.day) return false;
  const dayStem = pillars.day.stem;
  
  let hasYin = false;
  let hasCai = false;
  
  for (const pos of ['year', 'month', 'day', 'hour']) {
    const pillar = pillars[pos];
    if (!pillar) continue;
    const tg = tenGodOf(dayStem, pillar.stem);
    if (tg === '正印' || tg === '偏印') hasYin = true;
    if (tg === '正财' || tg === '偏财') hasCai = true;
  }
  
  return hasYin && hasCai;
}

/**
 * 检查是否有官星救应
 */
function hasGuanRescue(pillars) {
  return hasGuanProtect(pillars);
}

/**
 * 检查枭神夺食
 */
function hasXiaoshenDuoshi(pillars) {
  if (!pillars || !pillars.day) return false;
  const dayStem = pillars.day.stem;
  
  let hasShishen = false;
  let hasPianYin = false;
  
  for (const pos of ['year', 'month', 'day', 'hour']) {
    const pillar = pillars[pos];
    if (!pillar) continue;
    const tg = tenGodOf(dayStem, pillar.stem);
    if (tg === '食神') hasShishen = true;
    if (tg === '偏印') hasPianYin = true;
  }
  
  return hasShishen && hasPianYin;
}

/**
 * 检查是否有财星控制
 */
function hasCaiControl(pillars) {
  if (!pillars || !pillars.day) return false;
  const dayStem = pillars.day.stem;
  
  for (const pos of ['year', 'month', 'day', 'hour']) {
    const pillar = pillars[pos];
    if (!pillar) continue;
    const tg = tenGodOf(dayStem, pillar.stem);
    if (tg === '正财' || tg === '偏财') return true;
  }
  return false;
}

// ============================================================================
// 辅助函数：用神相关
// ============================================================================

/**
 * 检查扶抑自洽性
 */
function isFuyiConsistent(derivedYongshen, strength) {
  if (!derivedYongshen || !strength) return false;
  
  // 身弱应该用印比
  if (strength.band === '身弱') {
    const hasYin = derivedYongshen.yongShen.some(g => g === '正印' || g === '偏印');
    const hasBi = derivedYongshen.yongShen.some(g => g === '比肩' || g === '劫财');
    return hasYin || hasBi;
  }
  
  // 身强应该用财官食伤
  if (strength.band === '身强') {
    const hasCai = derivedYongshen.yongShen.some(g => g === '正财' || g === '偏财');
    const hasGuan = derivedYongshen.yongShen.some(g => g === '正官' || g === '七杀');
    const hasShi = derivedYongshen.yongShen.some(g => g === '食神' || g === '伤官');
    return hasCai || hasGuan || hasShi;
  }
  
  return true;
}

/**
 * 检查格局自洽性
 */
function isPatternConsistent(derivedYongshen, mainPattern) {
  if (!mainPattern || !derivedYongshen) return true;
  
  // 简化判断：用神应该与格局相关
  // 具体逻辑可以进一步细化
  return true;
}

/**
 * 检查病药自洽性
 */
function isBingyaoConsistent(derivedYongshen, bazi) {
  // 简化判断
  return true;
}

/**
 * 获取平衡格局用神
 */
function getBalanceYongshen(monthElement, dayMasterElement) {
  if (!monthElement || !dayMasterElement) return [];
  
  // 平衡格局，根据月令取用
  const yongshen = [];
  
  // 月令为财，用财
  if (CONTROLS[dayMasterElement] === monthElement) {
    yongshen.push('正财', '偏财');
  }
  // 月令为官，用官
  else if (CONTROLLER_OF[dayMasterElement] === monthElement) {
    yongshen.push('正官', '七杀');
  }
  // 月令为印，用印
  else if (MOTHER_OF[dayMasterElement] === monthElement) {
    yongshen.push('正印', '偏印');
  }
  // 月令为食伤，用食伤
  else if (GENERATES[dayMasterElement] === monthElement) {
    yongshen.push('食神', '伤官');
  }
  
  return yongshen;
}

/**
 * 获取从格用神（优化版：直接使用已有判定结果）
 * 从 structure.js 的判定结果中获取从格细分类型
 */
function getConggeYongshenFromPattern(mainPattern, band) {
  const yongShen = [];
  let xiShen = []; // 喜神
  const jiShen = [];
  
  // 从格局名称判断从格类型（structure.js 已判定）
  if (mainPattern) {
    if (mainPattern.includes('从财')) {
      // 从财格：用财，喜食伤生财，忌比劫印星
      yongShen.push('正财', '偏财');
      xiShen = ['食神', '伤官']; // 食伤生财
      jiShen.push('比肩', '劫财', '正印', '偏印');
    } else if (mainPattern.includes('从杀')) {
      // 从杀格：用官杀，喜财生杀，忌印比
      yongShen.push('正官', '七杀');
      xiShen = ['正财', '偏财']; // 财生杀
      jiShen.push('正印', '偏印', '比肩', '劫财');
    } else if (mainPattern.includes('从儿')) {
      // 从儿格：用食伤，喜财泄秀，忌印官
      yongShen.push('食神', '伤官');
      xiShen = ['正财', '偏财']; // 财泄秀
      jiShen.push('正印', '偏印', '正官', '七杀');
    } else if (mainPattern.includes('从势')) {
      // 从势格：用财官食伤中最强的，忌印比
      yongShen.push('正财', '偏财', '正官', '七杀', '食神', '伤官');
      jiShen.push('正印', '偏印', '比肩', '劫财');
    } else if (band && band.includes('从弱')) {
      // 通用从弱格（未细分）
      yongShen.push('正财', '偏财', '正官', '七杀', '食神', '伤官');
      jiShen.push('正印', '偏印', '比肩', '劫财');
    }
  } else if (band && band.includes('从弱')) {
    // 从弱：用财官食伤
    yongShen.push('正财', '偏财', '正官', '七杀', '食神', '伤官');
    jiShen.push('正印', '偏印', '比肩', '劫财');
  }
  
  return { yongShen, xiShen, jiShen };
}

/**
 * 获取专旺格用神（从强已合并到专旺格）
 */
function getZhuanwangYongshen(mainPattern, dayMasterElement) {
  const yongShen = [];
  const jiShen = [];
  
  // 根据专旺格类型确定用神
  if (mainPattern) {
    if (mainPattern.includes('曲直')) {
      // 曲直格（木专旺）：用木，喜水木，忌金土
      yongShen.push('比肩', '劫财', '正印', '偏印');
      jiShen.push('正官', '七杀', '正财', '偏财');
    } else if (mainPattern.includes('炎上')) {
      // 炎上格（火专旺）：用火，喜木火，忌水金
      yongShen.push('比肩', '劫财', '正印', '偏印');
      jiShen.push('正官', '七杀', '正财', '偏财');
    } else if (mainPattern.includes('稼穑')) {
      // 稼穑格（土专旺）：用土，喜火土，忌木金
      yongShen.push('比肩', '劫财', '正印', '偏印');
      jiShen.push('正官', '七杀', '正财', '偏财');
    } else if (mainPattern.includes('从革')) {
      // 从革格（金专旺）：用金，喜土金，忌火木
      yongShen.push('比肩', '劫财', '正印', '偏印');
      jiShen.push('正官', '七杀', '正财', '偏财');
    } else if (mainPattern.includes('润下')) {
      // 润下格（水专旺）：用水，喜金水，忌土火
      yongShen.push('比肩', '劫财', '正印', '偏印');
      jiShen.push('正官', '七杀', '正财', '偏财');
    } else {
      // 通用专旺格
      yongShen.push('比肩', '劫财', '正印', '偏印');
      jiShen.push('正官', '七杀', '正财', '偏财');
    }
  } else {
    // 默认专旺格
    yongShen.push('比肩', '劫财', '正印', '偏印');
    jiShen.push('正官', '七杀', '正财', '偏财');
  }
  
  return { yongShen, xiShen: [], jiShen };
}

/**
 * 获取病药用神
 */
function getBingyaoYongshen(pillars, strength) {
  // 简化版：根据明显病处取用
  const bingyaoGods = [];
  // 具体逻辑可以进一步细化
  return bingyaoGods;
}

// ============================================================================
// 辅助函数：十神配合相关
// ============================================================================

/**
 * 检查印星生官
 */
function hasYinShengGuan(pillars) {
  if (!pillars || !pillars.day) return false;
  const dayStem = pillars.day.stem;
  
  let hasYin = false;
  let hasGuan = false;
  
  for (const pos of ['year', 'month', 'day', 'hour']) {
    const pillar = pillars[pos];
    if (!pillar) continue;
    const tg = tenGodOf(dayStem, pillar.stem);
    if (tg === '正印' || tg === '偏印') hasYin = true;
    if (tg === '正官' || tg === '七杀') hasGuan = true;
  }
  
  return hasYin && hasGuan;
}

/**
 * 检查官星生印
 */
function hasGuanShengYin(pillars) {
  return hasYinShengGuan(pillars); // 互生关系
}

/**
 * 检查食神制杀
 */
function hasShishenZhisha(pillars) {
  if (!pillars || !pillars.day) return false;
  const dayStem = pillars.day.stem;
  
  let hasShishen = false;
  let hasSha = false;
  
  for (const pos of ['year', 'month', 'day', 'hour']) {
    const pillar = pillars[pos];
    if (!pillar) continue;
    const tg = tenGodOf(dayStem, pillar.stem);
    if (tg === '食神') hasShishen = true;
    if (tg === '七杀') hasSha = true;
  }
  
  return hasShishen && hasSha;
}

/**
 * 检查印星化杀
 */
function hasYinHuaSha(pillars) {
  if (!pillars || !pillars.day) return false;
  const dayStem = pillars.day.stem;
  
  let hasYin = false;
  let hasSha = false;
  
  for (const pos of ['year', 'month', 'day', 'hour']) {
    const pillar = pillars[pos];
    if (!pillar) continue;
    const tg = tenGodOf(dayStem, pillar.stem);
    if (tg === '正印' || tg === '偏印') hasYin = true;
    if (tg === '七杀') hasSha = true;
  }
  
  return hasYin && hasSha;
}

/**
 * 检查印配伤官
 */
function hasYinPeiShang(pillars) {
  if (!pillars || !pillars.day) return false;
  const dayStem = pillars.day.stem;
  
  let hasYin = false;
  let hasShang = false;
  
  for (const pos of ['year', 'month', 'day', 'hour']) {
    const pillar = pillars[pos];
    if (!pillar) continue;
    const tg = tenGodOf(dayStem, pillar.stem);
    if (tg === '正印' || tg === '偏印') hasYin = true;
    if (tg === '伤官') hasShang = true;
  }
  
  return hasYin && hasShang;
}

/**
 * 检查财化伤官
 */
function hasCaiHuaShang(pillars) {
  if (!pillars || !pillars.day) return false;
  const dayStem = pillars.day.stem;
  
  let hasCai = false;
  let hasShang = false;
  
  for (const pos of ['year', 'month', 'day', 'hour']) {
    const pillar = pillars[pos];
    if (!pillar) continue;
    const tg = tenGodOf(dayStem, pillar.stem);
    if (tg === '正财' || tg === '偏财') hasCai = true;
    if (tg === '伤官') hasShang = true;
  }
  
  return hasCai && hasShang;
}

/**
 * 检查财制印
 */
function hasCaiZhiYin(pillars) {
  return hasCaiPoYin(pillars); // 财克印
}

// ============================================================================
// 辅助函数：极端情况检查
// ============================================================================

/**
 * 检查格局是否完全破败
 */
function isPatternCompletelyBroken(bazi, strength, structureName) {
  // 简化判断：如果破格因素过多，认为完全破败
  // 具体逻辑可以进一步细化
  return false;
}

/**
 * 检查从格但反从
 */
function isConggeButResisted(bazi, strength) {
  if (!strength.band || !strength.band.includes('从')) return false;
  
  // 简化判断：从格但日主有强根
  // 具体逻辑可以进一步细化
  return false;
}

/**
 * 检查特殊格局但无用神
 */
function isSpecialPatternButNoYongshen(bazi, strength, structureName) {
  if (!strength.band || (!strength.band.includes('从') && !strength.band.includes('专旺'))) {
    return false;
  }
  
  // 简化判断
  return false;
}

// ============================================================================
// 确定综合纯度等级（专业版）
// ============================================================================

/**
 * 确定综合纯度等级（专业版）
 */
function determinePurityLevelProfessional(score) {
  if (score >= 95) return '上清·格局纯粹';
  if (score >= 85) return '中上清·略有微瑕';
  if (score >= 75) return '中清·瑕疵可控';
  if (score >= 65) return '中下清·需运扶助';
  if (score >= 55) return '微浊·多经磨练';
  if (score >= 45) return '中浊·波折较多';
  if (score >= 35) return '重浊·一生劳碌';
  return '下浊·格局破败';
}

