/**
 * 未来十年流年列表生成模块
 * 
 * 独立模块，可复用、可测试
 * 
 * 参考文档：
 * - 大运时间轴卡片优化方案-最终版.md
 */

import { ANNUAL_LUCK_THRESHOLDS } from '../config/annualLuckThresholds.js';
import { liuNianPillar } from '../fortune/index.js';
import { tenGod } from '../mingli/index.js';

/**
 * 映射分数到 favourLevel
 */
function mapToFavourLevel(score) {
  const { good, mixedUpper, mixedLower, bad } = ANNUAL_LUCK_THRESHOLDS.favourLevel;
  
  if (score >= good) return 'good';
  if (score >= mixedUpper) return 'mixed';
  if (score <= bad) return 'bad';
  if (score <= mixedLower) return 'mixed';
  return 'neutral';
}

/**
 * 映射分数到 highlightTag（含阶段修正和语气保护）
 */
function mapToHighlightTag(score, isFavour, currentStage) {
  const { opportunity, smooth, stress, trial } = ANNUAL_LUCK_THRESHOLDS.highlightTag;
  const { toneProtection, stageFactor } = ANNUAL_LUCK_THRESHOLDS;
  
  // 阶段修正
  let adjustedScore = score;
  if (currentStage && stageFactor[currentStage]) {
    adjustedScore = score * stageFactor[currentStage];
  }
  
  // 语气保护：最负面标签只能是 'trial'
  if (adjustedScore <= stress) {
    return toneProtection.maxNegativeTag;
  }
  
  // 正常映射
  if (adjustedScore >= opportunity && isFavour) return 'opportunity';
  if (adjustedScore >= smooth && isFavour) return 'smooth';
  if (adjustedScore <= trial) return 'trial';
  
  return 'adjust';
}

/**
 * 计算流年综合分数
 * 基于流年干支与日主的十神、喜忌、与当前大运的组合
 */
function calcYearScore(yearData, analysis) {
  // 简化版：基于流年十神和喜忌
  // 实际应该结合大运、冲合刑害等更复杂的计算
  let score = 0;
  
  // 从 analysis.luckRhythm 中获取用神信息
  const usefulGods = analysis?.usefulGods || [];
  const avoidGods = analysis?.avoidGods || [];
  
  // 判断流年五行（简化：从天干判断）
  const yearElement = getElementFromStem(yearData.stem);
  
  // 基础喜忌分数
  if (usefulGods.includes(yearElement)) {
    score += 30; // 用神年份
  } else if (avoidGods.includes(yearElement)) {
    score -= 30; // 忌神年份
  }
  
  // 十神影响（简化版）
  const tenGod = yearData.shishen || '';
  if (['正财', '偏财', '正官', '正印'].includes(tenGod)) {
    score += 10;
  } else if (['七杀', '伤官', '劫财'].includes(tenGod)) {
    score -= 10;
  }
  
  // 限制在 -100 ~ 100 之间
  return Math.max(-100, Math.min(100, score));
}

/**
 * 从天干获取五行
 */
function getElementFromStem(stem) {
  const stemElements = {
    '甲': '木', '乙': '木',
    '丙': '火', '丁': '火',
    '戊': '土', '己': '土',
    '庚': '金', '辛': '金',
    '壬': '水', '癸': '水',
  };
  return stemElements[stem] || '未知';
}

/**
 * 查找某年所属的大运索引
 */
function findLuckIndexForYear(year, luckCycle, currentAge) {
  if (!luckCycle || luckCycle.length === 0) return 0;
  
  // 简化：根据年龄推算大运
  // 实际应该根据流年的精确时间判断
  for (let i = 0; i < luckCycle.length; i++) {
    const luck = luckCycle[i];
    const startYear = luck.startUTC ? new Date(luck.startUTC).getFullYear() : null;
    const endYear = luck.endUTC ? new Date(luck.endUTC).getFullYear() : null;
    
    if (startYear && endYear && year >= startYear && year < endYear) {
      return i;
    }
  }
  
  // 如果找不到，返回当前大运索引（简化处理）
  for (let i = 0; i < luckCycle.length; i++) {
    const luck = luckCycle[i];
    if (currentAge >= luck.startAge && currentAge < luck.endAge) {
      return i;
    }
  }
  
  return 0;
}

/**
 * 生成未来十年流年列表
 * 
 * @param {Object} params
 * @param {Object} params.derived - 派生数据（包含 flow_years, luck_cycle）
 * @param {Object} params.analysis - 分析数据（包含 luckRhythm 上下文）
 * @param {number} params.currentYear - 当前年份（从上层传入）
 * @param {number} params.currentLuckIndex - 当前大运索引
 * @param {number} params.currentAge - 当前年龄
 * @param {string} params.dayStem - 日主天干（用于计算十神）
 * @returns {Array} AnnualLuckBrief[]
 */
export function buildAnnualBrief(params) {
  const { derived, analysis, currentYear, currentLuckIndex, currentAge, dayStem } = params;
  
  if (!derived?.flow_years || derived.flow_years.length === 0) {
    return [];
  }
  
  // 获取当前大运阶段（从 luckRhythm 中）
  const currentStage = analysis?.luckRhythm?.currentLuck?.stage;
  
  // 准备上下文（用于计算分数）
  const analysisContext = {
    usefulGods: analysis?.usefulGods || [],
    avoidGods: analysis?.avoidGods || [],
    luckRhythm: analysis?.luckRhythm,
  };
  
  // 生成未来10年的流年数据
  const result = [];
  const from = currentYear;
  const to = currentYear + 9;
  
  // 获取日主天干（用于计算十神）
  const dayStemForTenGod = params.dayStem || '';
  
  // 从 flow_years 中过滤并生成
  for (let year = from; year <= to; year++) {
    // 查找该年的流年数据
    let yearData = derived.flow_years.find(y => y.year === year);
    
    // 如果没有找到，计算流年干支
    if (!yearData) {
      // 计算该年立春后的流年干支
      const yearDate = new Date(year, 1, 5, 0, 0, 0); // 2月5日作为估算
      const yearPillar = liuNianPillar(yearDate);
      
      // 计算十神（需要日主天干）
      const yearTenGod = dayStemForTenGod ? tenGod(yearPillar.stem, dayStemForTenGod) : '';
      
      yearData = {
        year,
        stem: yearPillar.stem,
        branch: yearPillar.branch,
        ganzhi: `${yearPillar.stem}${yearPillar.branch}`,
        shishen: yearTenGod,
      };
    }
    
    // 计算分数
    const score = calcYearScore(yearData, analysisContext);
    const isFavour = score > 0;
    
    // 查找该年所属大运
    const luckIndex = findLuckIndexForYear(year, derived.luck_cycle, currentAge);
    
    // 应用阶段修正和标签映射
    const highlightTag = mapToHighlightTag(score, isFavour, currentStage);
    
    result.push({
      year,
      ganzhi: yearData.ganzhi || `${yearData.stem || ''}${yearData.branch || ''}`,
      shishen: yearData.shishen || '',  // 十神（与系统其他部分保持一致）
      favourLevel: mapToFavourLevel(score),
      highlightTag,
      scores: {
        overall: score,  // 内部分数，用于排序和调参
      },
      meta: {
        luckIndex,
        inCurrentLuck: luckIndex === currentLuckIndex,
        isCurrentYear: year === currentYear,
      },
    });
  }
  
  return result;
}

