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
  isElementControlled,
  getTiaohouRules
} from './tiaohou.js';
import { 
  tenGodOf, 
  isGodRevealed, 
  isGodRooted,
  getShishenPositions,
  checkZhishaEffectiveness
} from './utils.js';
import { analyzePoGeFactors } from './poge.js';
import { analyzeBranchRelationships } from '../mingli/branchRelationships.js';
import { computeWuXing } from './wuxing.js';

// ============================================================================
// 回滚开关机制（用于安全地切换新旧算法）
// ============================================================================
const USE_NEW_ALGORITHM = {
  wuxingFlow: true,         // 五行流通（✅ 已重写）
  shishenHarmony: true,    // 十神配合（✅ 已重写）
  yongshenStrength: true,  // 用神得力（✅ 已重写）
  patternPurity: true,     // 格局纯度（✅ 已重写）
  tiaohouBalance: true     // 调候分析（✅ 已重写）
};

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
  let pogeFactors, pogeContext;
  if (options.pogeFactors) {
    // 如果外部传入 pogeFactors，需要同时传入 context
    pogeFactors = options.pogeFactors;
    pogeContext = options.pogeContext || { flags: {} };
  } else {
    const pogeResult = analyzePoGeFactors(pillars, W, structureName, strength);
    pogeFactors = pogeResult.factors;
    pogeContext = pogeResult.context;
  }
  
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
    pattern: USE_NEW_ALGORITHM.patternPurity
      ? analyzePatternPurityNew(bazi, strength, mainPattern, shishenPatterns, pogeFactors)
      : analyzePatternPurity(bazi, strength, mainPattern, shishenPatterns, pogeFactors),
    yongshen: USE_NEW_ALGORITHM.yongshenStrength
      ? analyzeYongshenStrengthNew(bazi, strength, W, mainPattern)
      : analyzeYongshenStrength(bazi, strength, W, mainPattern),
    flow: USE_NEW_ALGORITHM.wuxingFlow 
      ? analyzeWuxingFlowNew(bazi.pillars, strength)
      : analyzeWuxingFlow(bazi.pillars, strength),
    harmony: USE_NEW_ALGORITHM.shishenHarmony
      ? analyzeShishenHarmonyNew(bazi, strength, W, mainPattern, shishenPatterns)
      : analyzeShishenHarmony(bazi, strength, W, mainPattern, shishenPatterns),
    tiaohou: USE_NEW_ALGORITHM.tiaohouBalance
      ? analyzeTiaohouBalanceNew(bazi, strength)
      : analyzeTiaohouBalance(bazi, strength)
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
 * 格局纯度分析 (30%) - 新算法
 * 
 * 优化后的算法，包含4个子项：
 * 1. 格局是否成立（0-12分）
 * 2. 格神得令透干通根（0-8分）
 * 3. 破格因子强度（-8-0分）
 * 4. 有无通关/制化/辅格（0-6分）
 */
function analyzePatternPurityNew(bazi, strength, mainPattern, shishenPatterns, pogeFactors) {
  const { pillars, dayMaster, monthBranch } = bazi;
  
  // 子项1：格局是否成立（0-12分）
  const patternEstablished = evaluatePatternEstablished(mainPattern, pillars, strength, monthBranch);
  
  // 子项2：格神得令透干通根（0-8分）
  const patternGodStrength = evaluatePatternGodStrength(mainPattern, pillars, strength, monthBranch, dayMaster);
  
  // 子项3：破格因子强度（-8-0分）
  const pogeScore = evaluatePogeFactorsNew(pillars, mainPattern, strength, pogeFactors);
  
  // 子项4：有无通关/制化/辅格（0-6分）
  const rescueScore = evaluateRescueFactorsNew(pillars, mainPattern, shishenPatterns, pogeFactors);
  
  // 最终得分 = 子项1 + 子项2 - 子项3 + 子项4
  let finalScore = patternEstablished + patternGodStrength + pogeScore + rescueScore;
  
  // 如果格局成立但得分偏低，给予保障分
  if (finalScore < 20 && mainPattern && mainPattern !== '未知格局') {
    // 计算保障分：至少20分
    const minScore = 20;
    if (finalScore < minScore) {
      // 如果子项1+子项2+子项4已经>=18，说明格局基本成立，应该给20分以上
      const positiveScore = patternEstablished + patternGodStrength + rescueScore;
      if (positiveScore >= 18) {
        finalScore = Math.min(25, Math.max(minScore, finalScore + (minScore - finalScore) * 0.5));
      } else {
        finalScore = Math.min(25, Math.max(minScore, finalScore + 2)); // 至少20分
      }
    }
  }
  
  return Math.min(30, Math.max(0, Math.round(finalScore * 10) / 10));
}

// ============================================================================
// 格局纯度新算法辅助函数
// ============================================================================

/**
 * 评估格局是否成立（0-12分）
 */
function evaluatePatternEstablished(mainPattern, pillars, strength, monthBranch) {
  if (!mainPattern || !monthBranch) return 0;
  
  let score = 0;
  
  // 真格：10-12分
  // 假格：5-9分
  // 不成格：0-4分
  
  // 检查格局是否成立（使用已有的evaluateMonthPattern逻辑）
  const monthElement = BRANCH_ELEMENT[monthBranch];
  const dayMaster = pillars.day?.stem;
  const dayMasterElement = STEM_ELEMENT[dayMaster];
  
  if (!dayMasterElement) return 0;
  
  // 基础分：格局名称存在即给基础分
  if (mainPattern && mainPattern !== '未知格局') {
    score += 4; // 格局存在：4分基础分
  }
  
  // 月令得用（子平法核心）
  if (isMonthUseful(monthElement, dayMasterElement, strength, mainPattern)) {
    score += 4; // 月令得用：4分
  }
  
  // 格局与月令匹配度
  const monthMatch = evaluateMonthPatternMatch(mainPattern, monthBranch, pillars);
  score += monthMatch; // 匹配度：0-2分
  
  // 月令透干（重要）
  if (isMonthRevealed(pillars, monthElement)) {
    score += 2; // 月令透干：2分
  }
  
  // 根据格局类型调整
  if (strength.band && (strength.band.includes('从') || strength.band.includes('专旺'))) {
    // 特殊格局：成立即给高分
    if (score >= 6) {
      score = Math.min(12, score + 2); // 特殊格局额外加分
    }
  }
  
  // 如果格局成立但得分偏低，给予保障分
  if (score < 8 && mainPattern && mainPattern !== '未知格局') {
    score = Math.max(8, score); // 至少8分
  }
  
  return Math.min(12, Math.max(0, score));
}

/**
 * 评估格神得令透干通根（0-8分）
 */
function evaluatePatternGodStrength(mainPattern, pillars, strength, monthBranch, dayMaster) {
  if (!mainPattern || !monthBranch || !dayMaster) return 0;
  
  let score = 0;
  
  // 获取格神（根据格局类型）
  const patternGod = getPatternGod(mainPattern, dayMaster);
  if (!patternGod) {
    // 如果没有明确的格神，给基础分
    return 3; // 基础分：3分
  }
  
  // 得令：+3分（格神在月令）
  if (isYongshenInMonth(patternGod, pillars, monthBranch, dayMaster)) {
    score += 3;
  }
  
  // 透干：+3分（格神透干）
  if (isGodRevealed(pillars, patternGod, dayMaster)) {
    score += 3;
  }
  
  // 有根：+2分（格神有根）
  if (isGodRooted(pillars, patternGod, dayMaster)) {
    score += 2;
  }
  
  // 如果格神得令+透干+有根，额外加分
  if (score >= 6) {
    score = Math.min(8, score + 1); // 额外加1分
  }
  
  // 如果格神至少满足一项，给基础分
  if (score === 0) {
    score = 2; // 基础分：2分
  }
  
  return Math.min(8, score);
}

/**
 * 获取格局对应的格神
 */
function getPatternGod(mainPattern, dayMaster) {
  if (!mainPattern || !dayMaster) return null;
  
  // 根据格局名称判断格神
  if (mainPattern.includes('正官') || mainPattern.includes('官格')) {
    return '正官';
  }
  if (mainPattern.includes('七杀') || mainPattern.includes('杀格')) {
    return '七杀';
  }
  if (mainPattern.includes('正印') || mainPattern.includes('印格')) {
    return '正印';
  }
  if (mainPattern.includes('偏印') || mainPattern.includes('枭格')) {
    return '偏印';
  }
  if (mainPattern.includes('正财') || mainPattern.includes('财格')) {
    return '正财';
  }
  if (mainPattern.includes('偏财')) {
    return '偏财';
  }
  if (mainPattern.includes('食神') || mainPattern.includes('食格')) {
    return '食神';
  }
  if (mainPattern.includes('伤官') || mainPattern.includes('伤格')) {
    return '伤官';
  }
  
  return null;
}

/**
 * 评估破格因子强度（-8-0分）
 */
function evaluatePogeFactorsNew(pillars, mainPattern, strength, pogeFactors) {
  if (!pogeFactors || pogeFactors.length === 0) {
    return 0; // 无破格因素，不扣分
  }
  
  let deduction = 0;
  
  // 根据破格因素的严重程度扣分
  for (const factor of pogeFactors) {
    const baseScore = factor.baseScore || 1.0;
    // 处理severity可能是对象的情况
    let severityLevel = '中等';
    if (typeof factor.severity === 'object' && factor.severity.level) {
      severityLevel = factor.severity.level;
    } else if (typeof factor.severity === 'string') {
      severityLevel = factor.severity;
    }
    
    let factorDeduction = baseScore;
    if (severityLevel === '严重') {
      factorDeduction *= 1.2; // 严重：扣1.2倍（进一步降低扣分）
    } else if (severityLevel === '轻微') {
      factorDeduction *= 0.5; // 轻微：扣0.5倍
    }
    
    deduction += factorDeduction;
  }
  
  // 限制扣分：最多扣5分（进一步降低扣分上限）
  return Math.max(-5, -deduction);
}

/**
 * 评估有无通关/制化/辅格（0-6分）
 */
function evaluateRescueFactorsNew(pillars, mainPattern, shishenPatterns, pogeFactors) {
  let score = 0;
  
  // 1. 检查辅格配合（0-3分）
  if (shishenPatterns && shishenPatterns.length > 0) {
    for (const pattern of shishenPatterns) {
      if (pattern && pattern.score !== undefined) {
        const patternScore = pattern.score;
        if (patternScore >= 80) {
          score += 1.5; // 高质量辅格：1.5分
        } else if (patternScore >= 60) {
          score += 1; // 中等质量辅格：1分
        } else if (patternScore >= 40) {
          score += 0.5; // 低质量辅格：0.5分
        }
      }
    }
    score = Math.min(3, score); // 辅格配合最高3分
  }
  
  // 2. 检查通关/制化（0-3分）
  // 使用已有的evaluateAuxiliaryPatterns逻辑
  const auxiliaryScore = evaluateAuxiliaryPatterns(shishenPatterns, mainPattern);
  if (auxiliaryScore > 3) {
    score += Math.min(3, (auxiliaryScore - 3) * 0.5); // 超出基础分的部分转换为制化分
  }
  
  // 3. 基础分：即使没有辅格，也应该给基础分
  if (score === 0) {
    score = 1; // 基础分：1分
  }
  
  return Math.min(6, score);
}

/**
 * 格局纯度分析 (30%) - 旧算法（保留作为回滚）
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
/**
 * 用神得力分析 (25%) - 新算法
 * 
 * 优化后的算法，按用神列表逐个评估：
 * 1. 找出主用神、喜神列表
 * 2. 对每个用神，按"透干/得令/有根"计分
 * 3. 同时考虑"受克受制程度"
 */
function analyzeYongshenStrengthNew(bazi, strength, W, mainPattern) {
  const { yongShen, xiShen } = getFuyiBingyaoYongshen(bazi, strength, mainPattern);
  
  let totalScore = 0;
  let mainYongshenCount = 0;
  
  // 对主用神逐个评估（只取前2个最强的）
  const mainScores = [];
  for (const god of yongShen) {
    const godScore = evaluateSingleYongshen(god, bazi, strength, W, true);
    mainScores.push(godScore);
  }
  
  // 只取前2个最强的用神得分
  mainScores.sort((a, b) => b - a);
  for (let i = 0; i < Math.min(2, mainScores.length); i++) {
    totalScore += mainScores[i];
    mainYongshenCount++;
  }
  
  // 对喜神逐个评估（只取前1个最强的，权重减半）
  const xiScores = [];
  for (const god of xiShen) {
    const godScore = evaluateSingleYongshen(god, bazi, strength, W, false);
    xiScores.push(godScore);
  }
  
  // 只取前1个最强的喜神得分
  if (xiScores.length > 0) {
    xiScores.sort((a, b) => b - a);
    totalScore += xiScores[0] * 0.5; // 喜神权重减半
  }
  
  // 如果主用神得分过高，进行限制
  // 单个主用神最高13分，两个主用神最高20分
  const maxMainScore = mainYongshenCount === 1 ? 13 : 20;
  if (totalScore > maxMainScore) {
    totalScore = maxMainScore + (totalScore - maxMainScore) * 0.3; // 超出部分打3折
  }
  
  // 最终得分限制在0-25分
  return Math.min(25, Math.max(0, Math.round(totalScore * 10) / 10));
}

/**
 * 评估单个用神的得力程度
 * @param {string} god - 十神名称（如 '正印', '偏印'）
 * @param {Object} bazi - 八字对象
 * @param {Object} strength - 日主强弱
 * @param {Object} W - 十神权重
 * @param {boolean} isMainYongshen - 是否为主用神
 * @returns {number} 得分（主用神最高13分，喜神最高6.5分）
 */
function evaluateSingleYongshen(god, bazi, strength, W, isMainYongshen) {
  const { pillars, dayMaster, monthBranch } = bazi;
  if (!dayMaster) return 0;
  
  let score = 0;
  
  // 1. 透干：+4分（主用神）或 +2分（喜神）- 降低分数
  if (isGodRevealed(pillars, god, dayMaster)) {
    score += isMainYongshen ? 4 : 2;
  }
  
  // 2. 得令：+4分（主用神）或 +2分（喜神）- 降低分数
  // 检查用神是否在月令得令
  if (isYongshenInMonth(god, pillars, monthBranch, dayMaster)) {
    score += isMainYongshen ? 4 : 2;
  }
  
  // 3. 有根：+2分（主用神）或 +1分（喜神）- 降低分数
  if (isGodRooted(pillars, god, dayMaster)) {
    score += isMainYongshen ? 2 : 1;
  }
  
  // 4. 被强克/合去：-2到-5分（主用神）或 -1到-2.5分（喜神）
  const controlScore = evaluateYongshenControl(god, pillars, W, dayMaster);
  score += isMainYongshen ? controlScore : controlScore * 0.5;
  
  // 单个用神得分上限：主用神10分，喜神5分（降低上限）
  const maxScore = isMainYongshen ? 10 : 5;
  return Math.min(maxScore, Math.max(0, score));
}

/**
 * 检查用神是否在月令得令
 */
function isYongshenInMonth(god, pillars, monthBranch, dayMaster) {
  if (!monthBranch || !pillars || !dayMaster) return false;
  
  // 检查月支藏干中是否有该用神
  const hiddenStems = HIDDEN_STEMS[monthBranch] || [];
  for (const item of hiddenStems) {
    const stem = typeof item === 'string' ? item : item.stem;
    if (stem) {
      const tg = tenGodOf(dayMaster, stem);
      if (tg === god) {
        return true;
      }
    }
  }
  
  // 检查月干是否是该用神
  const monthStem = pillars.month?.stem;
  if (monthStem) {
    const tg = tenGodOf(dayMaster, monthStem);
    if (tg === god) {
      return true;
    }
  }
  
  return false;
}

/**
 * 评估用神受克受制程度（-2到-5分）
 */
function evaluateYongshenControl(god, pillars, W, dayMaster) {
  let controlScore = 0;
  
  // 检查是否有克制该用神的十神
  const godElement = getShishenElement(god, dayMaster);
  if (!godElement) return 0;
  
  // 找出克制该用神的十神
  const controllerGods = getControllerGods(godElement, dayMaster);
  
  // 检查这些克制用神的十神是否出现且力量强
  for (const controllerGod of controllerGods) {
    const controllerWeight = getShishenWeight(controllerGod, W);
    if (controllerWeight > 0.5) {
      // 检查是否透干（透干克制更严重）
      if (isGodRevealed(pillars, controllerGod, dayMaster)) {
        controlScore -= 2; // 透干克制：-2分
      } else {
        controlScore -= 1; // 藏干克制：-1分
      }
    }
  }
  
  // 检查是否被合去（简化处理，暂时不实现）
  // if (isGodHeHua(pillars, god, dayMaster)) {
  //   controlScore -= 1; // 被合去：-1分
  // }
  
  return Math.max(-5, controlScore);
}

/**
 * 获取十神对应的五行（使用已有工具函数）
 */
function getShishenElement(god, dayMaster) {
  const dayMasterElement = STEM_ELEMENT[dayMaster];
  if (!dayMasterElement) return null;
  
  // 使用utils.js中的tenGodElement函数
  // 这里简化处理，直接根据十神和日主计算
  if (god === '比肩' || god === '劫财') return dayMasterElement;
  if (god === '食神' || god === '伤官') return GENERATES[dayMasterElement];
  if (god === '正财' || god === '偏财') return CONTROLS[dayMasterElement];
  if (god === '正印' || god === '偏印') return MOTHER_OF[dayMasterElement];
  if (god === '正官' || god === '七杀') return CONTROLLER_OF[dayMasterElement];
  
  return null;
}

/**
 * 获取克制某五行的十神列表
 */
function getControllerGods(element, dayMaster) {
  // 根据五行相克关系，找出克制该五行的十神
  const dayMasterElement = STEM_ELEMENT[dayMaster];
  if (!dayMasterElement) return [];
  
  // 克我者（克制该五行的元素）
  const controllerElement = CONTROLS[element];
  if (!controllerElement) return [];
  
  // 找出该元素对应的十神
  const controllerGods = [];
  
  // 根据日主五行和克制元素的五行关系，确定十神
  if (controllerElement === dayMasterElement) {
    controllerGods.push('比肩', '劫财');
  } else if (GENERATES[controllerElement] === dayMasterElement) {
    controllerGods.push('食神', '伤官');
  } else if (CONTROLS[controllerElement] === dayMasterElement) {
    controllerGods.push('正财', '偏财');
  } else if (MOTHER_OF[controllerElement] === dayMasterElement) {
    controllerGods.push('正印', '偏印');
  } else if (CONTROLLER_OF[controllerElement] === dayMasterElement) {
    controllerGods.push('正官', '七杀');
  }
  
  return controllerGods;
}

/**
 * 获取十神权重
 */
function getShishenWeight(god, W) {
  const godToWKey = {
    '正官': 'zGuan', '七杀': 'sha',
    '正印': 'zYin', '偏印': 'pYin',
    '正财': 'cai', '偏财': 'cai',
    '食神': 'shi', '伤官': 'shang',
    '比肩': 'bi', '劫财': 'bi'
  };
  
  const wKey = godToWKey[god];
  if (!wKey) return 0;
  
  return W[wKey] || 0;
}


/**
 * 用神得力分析 (25%) - 旧算法（保留作为回滚）
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
  // ✅ V3.0：支持身偏弱和身偏强
  if (strength.band === '身弱' || strength.band === '身偏弱') {
    // 身弱/身偏弱：喜印比
    yongShen.push('正印', '偏印', '比肩', '劫财');
    jiShen.push('正财', '偏财', '七杀', '正官', '伤官', '食神');
  } else if (strength.band === '身强' || strength.band === '身偏强') {
    // 身强/身偏强：喜财官食伤
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
 * 五行流通分析 (20%) - 新算法
 * 
 * 优化后的算法，包含：
 * 1. 五行数量平衡度（0-8分）
 * 2. 生克链条完整度（0-8分）
 * 3. 严重阻塞（-4-0分）
 * 4. 基础分保障机制
 */
function analyzeWuxingFlowNew(pillars, strength) {
  // 子项1：五行数量平衡度（0-8分）
  const balanceScore = evaluateWuxingBalance(pillars, strength);
  
  // 子项2：生克链条完整度（0-8分）
  const chainScore = evaluateFlowChain(pillars);
  
  // 子项3：严重阻塞（-4-0分）
  const blockScore = evaluateBlocking(pillars, strength);
  
  // 计算基础分
  const baseScore = calculateBaseScore(pillars, strength, balanceScore, chainScore);
  
  // 计算原始得分
  const rawScore = balanceScore + chainScore + blockScore;
  
  // 最终得分 = max(原始得分, baseScore)
  let finalScore = Math.max(rawScore, baseScore);
  
  // 对于有明显流通但得分偏低的情况，给予额外加分（通用规则）
  // 规则1：链条得分>=4且平衡度>=3，说明有明显流通，应该给10分以上
  if (finalScore < 10 && chainScore >= 4 && balanceScore >= 3) {
    finalScore = Math.min(14, finalScore + (10 - finalScore) * 0.5); // 补足到接近10分
  }
  
  // 规则2：链条得分>=5且平衡度>=4，说明流通很好，应该给12分以上
  if (finalScore < 12 && chainScore >= 5 && balanceScore >= 4) {
    finalScore = Math.min(16, finalScore + (12 - finalScore) * 0.5); // 补足到接近12分
  }
  
  // 规则3：如果原始得分已经>=10，直接使用（不需要额外加分）
  if (rawScore >= 10) {
    finalScore = Math.max(finalScore, rawScore);
  }
  
  return Math.min(20, Math.max(0, Math.round(finalScore * 10) / 10)); // 保留1位小数
}

/**
 * 五行流通分析 (20%) - 旧算法（保留作为回滚）
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
// 五行流通新算法辅助函数
// ============================================================================

/**
 * 评估五行数量平衡度（0-8分）
 */
function evaluateWuxingBalance(pillars, strength) {
  // 计算五行百分比
  const wuxingPercent = computeWuXing(pillars);
  
  // 找出最大值和最小值
  const values = Object.values(wuxingPercent);
  const maxPercent = Math.max(...values);
  const minPercent = Math.min(...values);
  const diff = maxPercent - minPercent;
  
  // 检查是否为专旺/从格
  const isZhuanwangOrCongge = strength.band && 
    (strength.band.includes('专旺') || strength.band.includes('从'));
  
  // 判断平衡度
  if (isZhuanwangOrCongge) {
    // 专旺/从格：虽然偏重但形成气势，给5-6分
    return 5.5;
  }
  
  if (diff > 50) {
    // 极度失衡：一行全无（0%），另一行爆多（>50%）
    return Math.max(0, 2 - (diff - 50) / 10);
  } else if (diff > 30) {
    // 明显偏一侧：某两行占60%+，其他行各<15%
    // 差值38 -> 3 + (30-38)/10 = 2.2，但应该给3-5分
    // 线性映射：diff=30时5分，diff=50时3分
    const score = 5 - (diff - 30) / 10; // 30->5, 50->3
    return Math.max(3, Math.min(5, score)); // 确保在3-5分范围内
  } else if (diff > 20) {
    // 略偏一侧：某两行占50%+，其他行各<20%
    // 差值20->6分，差值30->5分
    const score = 6 - (diff - 20) / 10; // 20->6, 30->5
    return Math.max(5, Math.min(6, score)); // 确保在5-6分范围内
  } else {
    // 比较均衡：每行都在15%-30%之间
    // 差值0->8分，差值20->6分
    const score = 8 - diff / 10; // 0->8, 20->6
    return Math.max(6, Math.min(8, score)); // 确保在6-8分范围内
  }
}

/**
 * 评估生克链条完整度（0-8分）
 */
function evaluateFlowChain(pillars) {
  let maxChainScore = 0;
  
  // 1. 检查天干生克链
  const stemChain = calculateStemFlowChain(pillars);
  maxChainScore = Math.max(maxChainScore, stemChain);
  
  // 2. 检查藏干生克链
  const hiddenChain = calculateHiddenStemFlowChain(pillars);
  maxChainScore = Math.max(maxChainScore, hiddenChain);
  
  // 3. 检查混合链（天干+藏干）
  const mixedChain = calculateMixedFlowChain(pillars);
  maxChainScore = Math.max(maxChainScore, mixedChain);
  
  // 4. 三合三会局加分
  const branchRelations = analyzeBranchRelationships(pillars);
  const sanheScore = evaluateSanHeFlow(branchRelations.sanhe);
  const sanhuiScore = evaluateSanHuiFlow(branchRelations.sanhui);
  const bonusScore = Math.min(3, sanheScore + sanhuiScore);
  
  // 5. 六合关系加分
  const liuheScore = evaluateLiuHeFlow(branchRelations.liuhe);
  const liuheBonus = Math.min(1, liuheScore);
  
  // 最终得分（不超过8分）
  return Math.min(8, maxChainScore + bonusScore + liuheBonus);
}

/**
 * 计算天干生克链
 * 返回链条长度（用于评分）
 */
function calculateStemFlowChain(pillars) {
  const elements = [];
  for (const pos of ['year', 'month', 'day', 'hour']) {
    const pillar = pillars[pos];
    if (!pillar) continue;
    const stemElement = STEM_ELEMENT[pillar.stem];
    if (stemElement && !elements.includes(stemElement)) {
      elements.push(stemElement);
    }
  }
  
  // 检查是否形成生链（需要找到最长的连续生链）
  let maxChainLength = 0;
  let currentChain = 0;
  
  for (let i = 0; i < elements.length - 1; i++) {
    if (GENERATES[elements[i]] === elements[i + 1]) {
      currentChain++;
      maxChainLength = Math.max(maxChainLength, currentChain);
    } else {
      currentChain = 0; // 链条中断，重新开始
    }
  }
  
  // 根据链条长度评分
  if (maxChainLength >= 3) {
    return 6; // 完整链条（3+个环节）：6分
  } else if (maxChainLength === 2) {
    return 4; // 半链条（2个环节）：4分
  } else if (maxChainLength === 1) {
    return 2; // 单环节：2分
  } else {
    return 0; // 无链条
  }
}

/**
 * 计算藏干生克链
 */
function calculateHiddenStemFlowChain(pillars) {
  const allElements = [];
  
  // 收集所有藏干五行
  for (const pos of ['year', 'month', 'day', 'hour']) {
    const pillar = pillars[pos];
    if (!pillar) continue;
    
    const hiddenStems = HIDDEN_STEMS[pillar.branch] || [];
    for (const item of hiddenStems) {
      const stem = typeof item === 'string' ? item : item.stem;
      if (stem) {
        const element = STEM_ELEMENT[stem];
        if (element && !allElements.includes(element)) {
          allElements.push(element);
        }
      }
    }
  }
  
  // 检查是否形成生链
  const flowChain = [];
  for (let i = 0; i < allElements.length - 1; i++) {
    if (GENERATES[allElements[i]] === allElements[i + 1]) {
      flowChain.push([allElements[i], allElements[i + 1]]);
    }
  }
  
  // 根据链条长度评分（藏干权重稍低）
  if (flowChain.length >= 4) {
    return 4; // 完整链条
  } else if (flowChain.length >= 2) {
    return 2 + flowChain.length * 0.5; // 半链条：2-4分
  } else if (flowChain.length === 1) {
    return 1; // 单环节：1-2分
  } else {
    return 0; // 无链条
  }
}

/**
 * 计算混合链（天干+藏干）
 */
function calculateMixedFlowChain(pillars) {
  // 收集所有五行（天干+藏干）
  const elementSet = new Set();
  
  for (const pos of ['year', 'month', 'day', 'hour']) {
    const pillar = pillars[pos];
    if (!pillar) continue;
    
    // 天干
    const stemElement = STEM_ELEMENT[pillar.stem];
    if (stemElement) {
      elementSet.add(stemElement);
    }
    
    // 藏干
    const hiddenStems = HIDDEN_STEMS[pillar.branch] || [];
    for (const item of hiddenStems) {
      const stem = typeof item === 'string' ? item : item.stem;
      if (stem) {
        const element = STEM_ELEMENT[stem];
        if (element) {
          elementSet.add(element);
        }
      }
    }
  }
  
  // 转换为数组
  const elements = Array.from(elementSet);
  
  // 使用深度优先搜索找出最长生链
  function findLongestChain(elements, current, visited, chain) {
    let maxLength = chain.length;
    
    for (const next of elements) {
      if (!visited.has(next) && GENERATES[current] === next) {
        visited.add(next);
        const length = findLongestChain(elements, next, visited, [...chain, next]);
        maxLength = Math.max(maxLength, length);
        visited.delete(next);
      }
    }
    
    return maxLength;
  }
  
  // 找出所有可能的生链起点，然后找最长链
  let maxChainLength = 0;
  for (const start of elements) {
    const visited = new Set([start]);
    const length = findLongestChain(elements, start, visited, [start]);
    maxChainLength = Math.max(maxChainLength, length);
  }
  
  // 如果找不到连续链，检查是否有任意相生关系
  if (maxChainLength <= 1) {
    let hasAnySheng = false;
    for (let i = 0; i < elements.length; i++) {
      for (let j = i + 1; j < elements.length; j++) {
        if (GENERATES[elements[i]] === elements[j] || GENERATES[elements[j]] === elements[i]) {
          hasAnySheng = true;
          break;
        }
      }
      if (hasAnySheng) break;
    }
    if (hasAnySheng) {
      return 1; // 至少有一个相生关系，给1分
    } else {
      return 0; // 完全没有相生关系
    }
  }
  
  // 根据链条长度评分（优化：更积极地给分）
  if (maxChainLength >= 4) {
    return 7; // 完整链条（4+个环节）：7分（提升1分）
  } else if (maxChainLength === 3) {
    return 5; // 半链条（3个环节）：5分（提升1分）
  } else if (maxChainLength === 2) {
    return 3; // 单环节（2个环节）：3分（提升1分）
  } else {
    return 1; // 至少1个环节，给1分
  }
}

/**
 * 评估严重阻塞（-4-0分）
 */
function evaluateBlocking(pillars, strength) {
  let blockScore = 0;
  
  // 1. 检查天干相战（但排除有通关的情况）
  const stemConflicts = checkElementConflicts(pillars);
  const hasTongguan = checkTongguan(pillars);
  if (stemConflicts > 0 && !hasTongguan) {
    blockScore -= Math.min(3, stemConflicts);
  }
  
  // 2. 检查地支相冲（但排除有合化解的情况）
  const branchRelations = analyzeBranchRelationships(pillars);
  const branchChongs = branchRelations.liuchong || [];
  const hasHeHua = (branchRelations.liuhe || []).length > 0 || 
                   (branchRelations.sanhe || []).length > 0;
  if (branchChongs.length > 0 && !hasHeHua) {
    blockScore -= Math.min(3, branchChongs.length);
  }
  
  // 3. 检查特殊阻塞（需要传入W，暂时简化处理）
  // TODO: 需要传入W对象来判断特殊阻塞
  
  return Math.max(-4, blockScore);
}

/**
 * 检查是否有通关用神
 */
function checkTongguan(pillars) {
  // 简化实现：检查是否有中间五行可以通关
  const elements = [];
  for (const pos of ['year', 'month', 'day', 'hour']) {
    const pillar = pillars[pos];
    if (!pillar) continue;
    elements.push(STEM_ELEMENT[pillar.stem]);
  }
  
  // 检查是否有相战
  let hasConflict = false;
  for (let i = 0; i < elements.length; i++) {
    for (let j = i + 1; j < elements.length; j++) {
      if (CONTROLS[elements[i]] === elements[j] || CONTROLS[elements[j]] === elements[i]) {
        hasConflict = true;
        // 检查是否有通关五行
        const conflictElements = [elements[i], elements[j]];
        const allElements = ['木', '火', '土', '金', '水'];
        for (const el of allElements) {
          if (!conflictElements.includes(el)) {
            // 检查这个元素是否能通关
            if ((GENERATES[conflictElements[0]] === el && GENERATES[el] === conflictElements[1]) ||
                (GENERATES[conflictElements[1]] === el && GENERATES[el] === conflictElements[0])) {
              return true; // 有通关
            }
          }
        }
      }
    }
  }
  
  return false; // 无冲突或无通关
}

/**
 * 计算基础分保障机制
 */
function calculateBaseScore(pillars, strength, balanceScore, chainScore) {
  let baseScore = 0;
  
  // 1. 有任意相生关系 → 至少2分
  if (hasAnyShengRelation(pillars)) {
    baseScore = Math.max(baseScore, 2);
  }
  
  // 2. 有半链条（2-3个环节）→ 至少4分
  if (hasHalfChain(pillars)) {
    baseScore = Math.max(baseScore, 4);
  }
  
  // 3. 五行相对均衡（每行都在10%-40%）→ 至少3分
  const wuxingPercent = computeWuXing(pillars);
  if (isRelativelyBalanced(wuxingPercent)) {
    baseScore = Math.max(baseScore, 3);
  }
  
  // 4. 专旺/从格 → 至少5分
  if (isZhuanwangOrCongge(strength)) {
    baseScore = Math.max(baseScore, 5);
  }
  
  // 5. 有通关用神 → 至少3分
  if (checkTongguan(pillars)) {
    baseScore = Math.max(baseScore, 3);
  }
  
  return baseScore;
}

/**
 * 检查是否有任意相生关系
 */
function hasAnyShengRelation(pillars) {
  const elements = [];
  for (const pos of ['year', 'month', 'day', 'hour']) {
    const pillar = pillars[pos];
    if (!pillar) continue;
    const stemElement = STEM_ELEMENT[pillar.stem];
    if (stemElement) elements.push(stemElement);
    
    // 也检查藏干
    const hiddenStems = HIDDEN_STEMS[pillar.branch] || [];
    for (const item of hiddenStems) {
      const stem = typeof item === 'string' ? item : item.stem;
      if (stem) {
        const element = STEM_ELEMENT[stem];
        if (element) elements.push(element);
      }
    }
  }
  
  // 检查是否有相生关系
  for (let i = 0; i < elements.length; i++) {
    for (let j = i + 1; j < elements.length; j++) {
      if (GENERATES[elements[i]] === elements[j] || GENERATES[elements[j]] === elements[i]) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * 检查是否有半链条（2-3个环节）
 */
function hasHalfChain(pillars) {
  // 检查混合链（最重要）
  const mixedChain = calculateMixedFlowChain(pillars);
  if (mixedChain >= 4) return true; // 有半链条或完整链条
  
  // 检查天干链
  const stemChain = calculateStemFlowChain(pillars);
  if (stemChain >= 4) return true;
  
  // 检查藏干链
  const hiddenChain = calculateHiddenStemFlowChain(pillars);
  if (hiddenChain >= 2) return true;
  
  return false;
}

/**
 * 检查五行是否相对均衡
 */
function isRelativelyBalanced(wuxingPercent) {
  const values = Object.values(wuxingPercent);
  for (const val of values) {
    if (val < 10 || val > 40) {
      return false;
    }
  }
  return true;
}

/**
 * 检查是否为专旺/从格
 */
function isZhuanwangOrCongge(strength) {
  return strength.band && 
    (strength.band.includes('专旺') || strength.band.includes('从'));
}

// ============================================================================
// 4. 十神配合分析 (15%) - 专业版（利用现有函数和诊断结果）
// ============================================================================

/**
 * 十神配合分析 (15%) - 新算法
 * 
 * 优化后的算法，包含：
 * 1. 成型格局/组合（0-6分）
 * 2. 吉神保护（0-4分）
 * 3. 凶神制化（0-3分）
 * 4. 明显冲突（-4-0分）
 * 5. 基础分保障机制
 */
function analyzeShishenHarmonyNew(bazi, strength, W, mainPattern, shishenPatterns = []) {
  const pillars = bazi.pillars;
  const dayMaster = bazi.dayMaster;
  
  // 子项1：成型格局/组合（0-6分）
  const patternScore = evaluateShishenPatternQualityNew(shishenPatterns, pillars, W, dayMaster);
  
  // 子项2：吉神保护（0-4分）
  const luckyGodScore = evaluateLuckyGodProtectionNew(pillars, W, dayMaster);
  
  // 子项3：凶神制化（0-3分）
  const xiongShenScore = evaluateXiongShenControlNew(pillars, W, dayMaster);
  
  // 子项4：明显冲突（-4-0分）
  const conflictScore = evaluateConflictsNew(pillars, W, dayMaster);
  
  // 计算基础分
  const baseScore = calculateShishenBaseScore(pillars, W, dayMaster, patternScore, conflictScore);
  
  // 计算原始得分（注意：conflictScore是负数）
  const rawScore = patternScore + luckyGodScore + xiongShenScore + conflictScore;
  
  // 最终得分 = max(原始得分, baseScore)
  let finalScore = Math.max(rawScore, baseScore);
  
  // 对于有明显优势但得分偏低的情况，给予额外加分（通用规则）
  const shishenCount = countShishenTypes(pillars, W, dayMaster);
  
  // 规则1：十神齐全（5种）且无严重冲突，应该给8分以上
  if (finalScore < 8 && shishenCount === 5 && conflictScore >= -1) {
    // 更积极地给分：直接补足到8分
    finalScore = Math.min(12, Math.max(8, finalScore + 2)); // 至少8分，最高12分
  }
  
  // 规则1.5：十神齐全（5种）但冲突稍重（-1.5到-2），也应该给6分以上
  if (finalScore < 6 && shishenCount === 5 && conflictScore >= -2 && conflictScore < -1) {
    finalScore = Math.min(10, Math.max(6, finalScore + 1)); // 至少6分，最高10分
  }
  
  // 规则1.6：十神齐全（5种）即使有冲突，也应该给基础分（通用规则）
  // 这是最重要的保障：十神齐全本身就是优势，即使有冲突也不应该得分过低
  if (finalScore < 8 && shishenCount === 5) {
    // 如果有冲突，至少给6分；如果冲突不严重，至少给8分
    if (conflictScore >= -1) {
      finalScore = Math.min(12, Math.max(8, finalScore + 2)); // 至少8分
    } else {
      finalScore = Math.min(10, Math.max(6, finalScore + 1)); // 至少6分
    }
  }
  
  // 规则2：十神结构不单一（>=3）且无严重冲突，应该给6分以上
  if (finalScore < 6 && shishenCount >= 3 && conflictScore >= -1) {
    // 更积极地给分：直接补足到6分
    finalScore = Math.min(10, Math.max(6, finalScore + 1.5)); // 至少6分，最高10分
  }
  
  // 规则2.5：十神结构不单一（>=3）但冲突稍重（-1.5到-2），也应该给4分以上
  if (finalScore < 4 && shishenCount >= 3 && conflictScore >= -2 && conflictScore < -1) {
    finalScore = Math.min(8, Math.max(4, finalScore + 0.5)); // 至少4分，最高8分
  }
  
  // 规则3：如果原始得分已经>=8，直接使用（不需要额外加分）
  if (rawScore >= 8) {
    finalScore = Math.max(finalScore, rawScore);
  }
  
  // 规则4：如果十神齐全且有吉神保护或凶神制化，给予额外加分
  if (shishenCount === 5 && (luckyGodScore > 0 || xiongShenScore > 0) && conflictScore >= -1) {
    finalScore = Math.min(12, finalScore + 1); // 额外加1分
  }
  
  // 规则5：如果十神齐全且有成型格局/组合，给予额外加分
  if (shishenCount === 5 && patternScore >= 1 && conflictScore >= -1) {
    finalScore = Math.min(12, finalScore + 1); // 额外加1分
  }
  
  // 规则6：如果十神齐全但得分仍然<8，强制提升到8分（通用保障）
  // 这是最后的保障：十神齐全本身就是优势，不应该得分过低
  if (finalScore < 8 && shishenCount === 5) {
    finalScore = Math.min(12, 8); // 强制至少8分
  }
  
  return Math.min(15, Math.max(0, Math.round(finalScore * 10) / 10)); // 保留1位小数
}

// ============================================================================
// 十神配合新算法辅助函数
// ============================================================================

/**
 * 评估成型格局/组合（0-6分）
 */
function evaluateShishenPatternQualityNew(shishenPatterns, pillars, W, dayMaster) {
  let score = 0;
  
  // 1. 检查是否有诊断出的组合格局
  if (shishenPatterns && shishenPatterns.length > 0) {
    let highQualityCount = 0;
    let mediumQualityCount = 0;
    let lowQualityCount = 0;
    
    for (const pattern of shishenPatterns) {
      if (pattern && pattern.score !== undefined) {
        const patternScore = pattern.score;
        
        if (patternScore >= 85) {
          highQualityCount++;
          score += 2; // 高质量组合格局：2分
        } else if (patternScore >= 70) {
          mediumQualityCount++;
          score += 1; // 中等质量组合格局：1分
        } else if (patternScore >= 60) {
          lowQualityCount++;
          score += 0.5; // 低质量组合格局：0.5分
        }
      }
    }
    
    // 多个高质量组合格局，额外加分
    if (highQualityCount >= 2) {
      score += 1;
    }
  }
  
  // 2. 如果没有诊断出组合格局，检查结构是否不单一
  if (score === 0) {
    const shishenCount = countShishenTypes(pillars, W, dayMaster);
    
    // 十神齐全（5种十神都有）
    if (shishenCount === 5) {
      score = 2; // 十神齐全但无特殊组合：2分（提升）
    } 
    // 十神结构不单一（至少有3-4种十神）
    else if (shishenCount >= 3) {
      score = 1.5; // 结构不单一：1.5分（提升）
    }
    // 十神缺失或单一（只有1-2种十神）
    else {
      score = 0; // 十神缺失或单一：0分
    }
  }
  
  return Math.min(6, score);
}

/**
 * 统计十神类型数量
 */
function countShishenTypes(pillars, W, dayMaster) {
  let count = 0;
  
  // 检查5种十神分组：比劫、食伤、财星、官杀、印星
  // 注意：W对象可能使用不同的键名，需要兼容多种格式
  const biJie = (W.bi || W.biJie || 0) + (W.jie || W.jieCai || 0);
  const shiShang = (W.shi || W.shiShen || 0) + (W.shang || W.shangGuan || 0);
  const cai = W.cai || W.caiXing || 0;
  const guanSha = (W.zGuan || W.zhengGuan || 0) + (W.sha || W.qiSha || 0);
  const yin = (W.zYin || W.zhengYin || 0) + (W.pYin || W.pianYin || 0);
  
  // 如果W对象为空，尝试直接从四柱计算十神类型
  if (count === 0 && (!W || Object.keys(W).length === 0)) {
    // 直接从四柱统计十神类型
    const shishenSet = new Set();
    for (const pos of ['year', 'month', 'day', 'hour']) {
      const pillar = pillars[pos];
      if (!pillar) continue;
      const tg = tenGodOf(dayMaster, pillar.stem);
      if (tg) {
        // 分组：比劫、食伤、财星、官杀、印星
        if (tg === '比肩' || tg === '劫财') shishenSet.add('比劫');
        else if (tg === '食神' || tg === '伤官') shishenSet.add('食伤');
        else if (tg === '正财' || tg === '偏财') shishenSet.add('财星');
        else if (tg === '正官' || tg === '七杀') shishenSet.add('官杀');
        else if (tg === '正印' || tg === '偏印') shishenSet.add('印星');
      }
      
      // 也检查藏干
      const hiddenStems = HIDDEN_STEMS[pillar.branch] || [];
      for (const item of hiddenStems) {
        const stem = typeof item === 'string' ? item : item.stem;
        if (stem) {
          const tg = tenGodOf(dayMaster, stem);
          if (tg) {
            if (tg === '比肩' || tg === '劫财') shishenSet.add('比劫');
            else if (tg === '食神' || tg === '伤官') shishenSet.add('食伤');
            else if (tg === '正财' || tg === '偏财') shishenSet.add('财星');
            else if (tg === '正官' || tg === '七杀') shishenSet.add('官杀');
            else if (tg === '正印' || tg === '偏印') shishenSet.add('印星');
          }
        }
      }
    }
    return shishenSet.size;
  }
  
  if (biJie > 0) count++; // 比劫
  if (shiShang > 0) count++; // 食伤
  if (cai > 0) count++; // 财星
  if (guanSha > 0) count++; // 官杀
  if (yin > 0) count++; // 印星
  
  return count;
}

/**
 * 评估吉神保护（0-4分）
 */
function evaluateLuckyGodProtectionNew(pillars, W, dayMaster) {
  let score = 0;
  
  // 获取十神权重（兼容不同格式）
  const zGuan = W.zGuan || W.zhengGuan || 0;
  const zYin = W.zYin || W.zhengYin || 0;
  const cai = W.cai || W.caiXing || 0;
  const shi = W.shi || W.shiShen || 0;
  const bi = W.bi || W.biJie || 0;
  const jie = W.jie || W.jieCai || 0;
  
  // 正官有保护
  if (zGuan > 0.5) {
    // 正官有印护卫（印生官）：+1分
    if (hasYinShengGuan(pillars)) {
      score += 1;
    }
    // 正官无伤官破坏：+0.5分
    if (!hasShangGuan(pillars)) {
      score += 0.5;
    }
    // 正官透干且有根：+0.5分
    if (isGodRevealed(pillars, '正官', dayMaster) && isGodRooted(pillars, '正官', dayMaster)) {
      score += 0.5;
    }
  }
  
  // 正印有保护
  if (zYin > 0.5) {
    // 正印无财星破坏：+0.5分
    if (!hasCaiPoYin(pillars)) {
      score += 0.5;
    }
    // 正印透干且有根：+0.5分
    if (isGodRevealed(pillars, '正印', dayMaster) && isGodRooted(pillars, '正印', dayMaster)) {
      score += 0.5;
    }
    // 正印有比劫解围（财印冲突时）：+0.5分
    if (hasCaiPoYin(pillars) && (bi > 0.5 || jie > 0.5)) {
      score += 0.5;
    }
  }
  
  // 财星有保护
  if (cai > 0.5) {
    // 财星有官星保护（官制比劫）：+0.5分
    if (hasGuanProtect(pillars)) {
      score += 0.5;
    }
    // 财星无比劫夺财：+0.5分
    if (!hasBiJieDuoCai(pillars)) {
      score += 0.5;
    }
    // 财星有食神生助：+0.5分
    if (shi > 0.5) {
      score += 0.5;
    }
  }
  
  // 食神有保护
  if (shi > 0.5) {
    // 食神无枭神夺食：+0.5分
    if (!hasXiaoshenDuoshi(pillars)) {
      score += 0.5;
    }
    // 食神有比劫生助：+0.5分
    if (bi > 0.5 || jie > 0.5) {
      score += 0.5;
    }
  }
  
  return Math.min(4, score);
}

/**
 * 评估凶神制化（0-3分）
 */
function evaluateXiongShenControlNew(pillars, W, dayMaster) {
  let score = 0;
  
  // 获取十神权重（兼容不同格式）
  const sha = W.sha || W.qiSha || 0;
  const shang = W.shang || W.shangGuan || 0;
  const pYin = W.pYin || W.pianYin || 0;
  const zYin = W.zYin || W.zhengYin || 0;
  const cai = W.cai || W.caiXing || 0;
  const jie = W.jie || W.jieCai || 0;
  const zGuan = W.zGuan || W.zhengGuan || 0;
  
  // 七杀有制
  if (sha > 0.5) {
    const shaPositions = getShishenPositions(pillars, '七杀', dayMaster);
    const shishenPositions = getShishenPositions(pillars, '食神', dayMaster);
    const yinPositions = [
      ...getShishenPositions(pillars, '正印', dayMaster),
      ...getShishenPositions(pillars, '偏印', dayMaster)
    ];
    
    // 食神制杀（有效制化）：+1.5分
    if (shishenPositions.length > 0 && shaPositions.length > 0) {
      const effectiveness = checkZhishaEffectiveness(shishenPositions, shaPositions);
      if (effectiveness === '同柱制化' || effectiveness === '顺位制化') {
        score += 1.5;
      } else if (effectiveness === '逆位制化' || effectiveness === '遥制') {
        score += 1; // 制化有效但较弱
      }
    }
    // 印星化杀：+1分
    else if (yinPositions.length > 0 && shaPositions.length > 0) {
      score += 1;
    }
  }
  
  // 伤官有制
  if (shang > 0.5) {
    // 伤官配印：+1分
    if (zYin > 0.5 || pYin > 0.5) {
      score += 1;
    }
    // 财化伤官：+0.5分
    else if (cai > 0.5) {
      score += 0.5;
    }
  }
  
  // 枭神有制
  if (pYin > 0.5) {
    // 财制印（财制偏印）：+0.5分
    if (cai > 0.5) {
      score += 0.5;
    }
  }
  
  // 劫财有制
  if (jie > 0.5) {
    // 官制劫财：+0.5分
    if (zGuan > 0.5 || sha > 0.5) {
      score += 0.5;
    }
  }
  
  return Math.min(3, score);
}

/**
 * 评估明显冲突（-4-0分）
 */
function evaluateConflictsNew(pillars, W, dayMaster) {
  let conflictScore = 0;
  
  // 获取十神权重（兼容不同格式）
  const bi = W.bi || W.biJie || 0;
  const jie = W.jie || W.jieCai || 0;
  const cai = W.cai || W.caiXing || 0;
  const zGuan = W.zGuan || W.zhengGuan || 0;
  const sha = W.sha || W.qiSha || 0;
  const zYin = W.zYin || W.zhengYin || 0;
  const pYin = W.pYin || W.pianYin || 0;
  
  // 1. 财印冲突（财星坏印）
  if (hasCaiPoYin(pillars)) {
    // 检查是否有化解（比劫解围）
    if (bi > 0.5 || jie > 0.5) {
      conflictScore -= 0.5; // 有化解，非常轻微冲突（降低扣分）
    } else {
      conflictScore -= 1.5; // 无化解，中度冲突（降低扣分）
    }
  }
  
  // 2. 比劫夺财
  if (hasBiJieDuoCai(pillars)) {
    // 检查是否有化解（官制比劫）
    if (hasGuanProtect(pillars)) {
      conflictScore -= 0.5; // 有化解，非常轻微冲突
    } else {
      conflictScore -= 1.5; // 无化解，中度冲突
    }
  }
  
  // 3. 枭神夺食
  if (hasXiaoshenDuoshi(pillars)) {
    // 检查是否有化解（财制印）
    if (cai > 0.5) {
      conflictScore -= 0.5; // 有化解，非常轻微冲突
    } else {
      conflictScore -= 1.5; // 无化解，中度冲突
    }
  }
  
  // 4. 食伤制官
  if (hasShangGuan(pillars)) {
    // 检查是否有化解（印护官）
    if (zYin > 0.5 || pYin > 0.5) {
      conflictScore -= 0.5; // 有化解，非常轻微冲突
    } else {
      conflictScore -= 1.5; // 无化解，中度冲突
    }
  }
  
  // 5. 官杀混杂
  if (hasGuanShaHunZa(pillars)) {
    conflictScore -= 0.5; // 官杀混杂：-0.5分（降低扣分）
  }
  
  return Math.max(-4, conflictScore);
}

/**
 * 检查官杀混杂
 */
function hasGuanShaHunZa(pillars) {
  if (!pillars || !pillars.day) return false;
  const dayMaster = pillars.day.stem;
  
  let hasZhengGuan = false;
  let hasQiSha = false;
  
  for (const pos of ['year', 'month', 'day', 'hour']) {
    const pillar = pillars[pos];
    if (!pillar) continue;
    const tg = tenGodOf(dayMaster, pillar.stem);
    if (tg === '正官') hasZhengGuan = true;
    if (tg === '七杀') hasQiSha = true;
  }
  
  return hasZhengGuan && hasQiSha;
}

/**
 * 计算十神配合基础分保障机制
 */
function calculateShishenBaseScore(pillars, W, dayMaster, patternScore, conflictScore) {
  let baseScore = 0;
  
  // 1. 十神结构不单一（至少有3-4种十神）→ 至少给1分基础分
  const shishenCount = countShishenTypes(pillars, W, dayMaster);
  if (shishenCount >= 3) {
    baseScore = Math.max(baseScore, 1);
  }
  
  // 2. 十神齐全（5种十神都有）→ 至少给2分基础分
  if (shishenCount === 5) {
    baseScore = Math.max(baseScore, 2);
  }
  
  // 3. 无严重冲突 → 至少给2分基础分
  if (conflictScore >= -1) {
    baseScore = Math.max(baseScore, 2);
  }
  
  // 4. 有成型格局/组合 → 至少给3分基础分
  if (patternScore >= 1) {
    baseScore = Math.max(baseScore, 3);
  }
  
  // 5. 新增：如果十神结构不单一（>=3）且无严重冲突，给予更高基础分
  if (shishenCount >= 3 && conflictScore >= -1) {
    baseScore = Math.max(baseScore, 4); // 至少4分
  }
  
  // 6. 新增：如果十神齐全（5种）且无严重冲突，给予更高基础分
  if (shishenCount === 5 && conflictScore >= -1) {
    baseScore = Math.max(baseScore, 6); // 至少6分（提升）
  }
  
  return baseScore;
}

/**
 * 十神配合分析 (15%) - 旧算法（保留作为回滚）
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
 * 调候分析 (10%) - 新算法
 * 
 * 优化后的算法，包含3个子项：
 * 1. 调候用神是否出现（0-4分）
 * 2. 力量是否足够（0-4分）
 * 3. 是否被严重克制/合去（-2-0分）
 */
function analyzeTiaohouBalanceNew(bazi, strength) {
  const { pillars, dayMaster, monthBranch } = bazi;
  if (!pillars || !monthBranch || !dayMaster) {
    return 0;
  }
  
  const dayMasterElement = STEM_ELEMENT[dayMaster];
  const season = getSeason(monthBranch);
  
  // 获取调候规则
  const tiaohouRules = getTiaohouRules(season, dayMasterElement, pillars);
  
  // 子项1：调候用神是否出现（0-4分）
  const tiaohouGodPresent = evaluateTiaohouGodPresent(tiaohouRules, pillars);
  
  // 子项2：力量是否足够（0-4分）
  const tiaohouGodStrength = evaluateTiaohouGodStrength(tiaohouRules, pillars);
  
  // 子项3：是否被严重克制/合去（-2-0分）
  const tiaohouGodControl = evaluateTiaohouGodControl(tiaohouRules, pillars);
  
  // 最终得分 = 子项1 + 子项2 - 子项3
  const finalScore = tiaohouGodPresent + tiaohouGodStrength + tiaohouGodControl;
  
  return Math.min(10, Math.max(0, Math.round(finalScore * 10) / 10));
}

/**
 * 评估调候用神是否出现（0-4分）
 */
function evaluateTiaohouGodPresent(tiaohouRules, pillars) {
  if (!tiaohouRules || !tiaohouRules.need || tiaohouRules.need.length === 0) {
    return 2; // 无明确调候需求，给基础分
  }
  
  let score = 0;
  
  // 检查每个调候用神是否出现
  for (const needElement of tiaohouRules.need) {
    if (isElementPresent(needElement, pillars)) {
      score += 2; // 每个调候用神出现：2分
    }
  }
  
  // 如果至少有一个调候用神出现，给基础分
  if (score === 0 && tiaohouRules.need.length > 0) {
    score = 1; // 基础分：1分
  }
  
  return Math.min(4, score);
}

/**
 * 评估调候用神力量是否足够（0-4分）
 */
function evaluateTiaohouGodStrength(tiaohouRules, pillars) {
  if (!tiaohouRules || !tiaohouRules.need || tiaohouRules.need.length === 0) {
    return 2; // 无明确调候需求，给基础分
  }
  
  let score = 0;
  
  // 检查每个调候用神的力量
  for (const needElement of tiaohouRules.need) {
    if (isElementPresent(needElement, pillars)) {
      // 检查是否透干（透干力量更强）
      const isRevealed = isTiaohouElementRevealed(needElement, pillars);
      if (isRevealed) {
        score += 2; // 透干：2分
      } else {
        score += 1; // 藏干：1分
      }
    }
  }
  
  // 如果至少有一个调候用神有力量，给基础分
  if (score === 0 && tiaohouRules.need.length > 0) {
    score = 1; // 基础分：1分
  }
  
  return Math.min(4, score);
}

/**
 * 检查调候用神是否透干
 */
function isTiaohouElementRevealed(element, pillars) {
  if (!element || !pillars) return false;
  
  // 检查天干是否有该五行
  for (const pos of ['year', 'month', 'day', 'hour']) {
    const pillar = pillars[pos];
    if (!pillar) continue;
    
    const stemElement = STEM_ELEMENT[pillar.stem];
    if (stemElement === element) {
      return true;
    }
  }
  
  return false;
}

/**
 * 评估调候用神是否被严重克制/合去（-2-0分）
 */
function evaluateTiaohouGodControl(tiaohouRules, pillars) {
  if (!tiaohouRules || !tiaohouRules.need || tiaohouRules.need.length === 0) {
    return 0; // 无明确调候需求，不扣分
  }
  
  let controlScore = 0;
  
  // 检查每个调候用神是否被克制
  for (const needElement of tiaohouRules.need) {
    if (isElementPresent(needElement, pillars)) {
      // 检查是否被严重克制
      if (isElementControlled(needElement, pillars)) {
        controlScore -= 1; // 被克制：-1分
      }
    }
  }
  
  // 检查忌神是否出现且未受制
  if (tiaohouRules.avoid && tiaohouRules.avoid.length > 0) {
    for (const avoidElement of tiaohouRules.avoid) {
      if (isElementPresent(avoidElement, pillars) && !isElementControlled(avoidElement, pillars)) {
        controlScore -= 1; // 忌神出现且未受制：-1分
      }
    }
  }
  
  return Math.max(-2, controlScore);
}

/**
 * 调候得失分析 (10%) - 旧算法（保留作为回滚）
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
 * 检查伤官见官
 */
function hasShangGuan(pillars) {
  if (!pillars || !pillars.day) return false;
  const dayStem = pillars.day.stem;
  
  let hasShang = false;
  let hasGuan = false;
  
  // 检查是否有伤官和正官
  for (const pos of ['year', 'month', 'day', 'hour']) {
    const pillar = pillars[pos];
    if (!pillar) continue;
    
    const stemGod = tenGodOf(dayStem, pillar.stem);
    if (stemGod === '伤官') hasShang = true;
    if (stemGod === '正官') hasGuan = true;
    
    // 也检查藏干
    const hiddenStems = HIDDEN_STEMS[pillar.branch] || [];
    for (const item of hiddenStems) {
      const stem = typeof item === 'string' ? item : item.stem;
      if (stem) {
        const branchGod = tenGodOf(dayStem, stem);
        if (branchGod === '伤官') hasShang = true;
        if (branchGod === '正官') hasGuan = true;
      }
    }
  }
  
  return hasShang && hasGuan;
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
 * ✅ V3.0：支持身偏弱和身偏强
 */
function isFuyiConsistent(derivedYongshen, strength) {
  if (!derivedYongshen || !strength) return false;
  
  // 身弱/身偏弱应该用印比
  if (strength.band === '身弱' || strength.band === '身偏弱') {
    const hasYin = derivedYongshen.yongShen.some(g => g === '正印' || g === '偏印');
    const hasBi = derivedYongshen.yongShen.some(g => g === '比肩' || g === '劫财');
    return hasYin || hasBi;
  }
  
  // 身强/身偏强应该用财官食伤
  if (strength.band === '身强' || strength.band === '身偏强') {
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

