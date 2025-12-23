// 新增理由：时间坐标卡片数据构建（从 index.js 拆分）
// 回滚方式：回退此文件，恢复 index.js 中的原方法

import { tenGod } from '../mingli/index.js';
import { liuNianPillar, liuYuePillar } from '../fortune/index.js';

/**
 * 阶段映射表：stage -> phase
 */
const STAGE_TO_PHASE = {
  '打基础期':      { tag: 'adjust',    text: '調整期' },
  '拓展冲刺期':    { tag: 'accelerate', text: '加速期' },
  '调整转折期':    { tag: 'adjust',    text: '調整期' },
  '沉淀收获期':    { tag: 'stable',    text: '平穩期' },
};

/**
 * 喜忌等级映射
 */
const FAVOUR_LEVEL_MAP = {
  '用神': 'good',
  '中性': 'neutral',
  '忌神': 'tense',
};

/**
 * 地支到月份索引映射
 */
const BRANCH_TO_MONTH = {
  '寅': 1, '卯': 2, '辰': 3, '巳': 4,
  '午': 5, '未': 6, '申': 7, '酉': 8,
  '戌': 9, '亥': 10, '子': 11, '丑': 12,
};

/**
 * 十神评分表
 */
const TEN_GOD_SCORES = {
  '正财': 30, '偏财': 25,
  '正官': 25, '七杀': -20,
  '正印': 20, '偏印': 15,
  '食神': 15, '伤官': -10,
  '比肩': 5, '劫财': -15,
};

/**
 * 组装「时间坐标」数据
 * 
 * @param {Object} luckRhythm - 行运节奏数据（已计算）
 * @param {Object} baziChart - 八字命盘对象（包含四柱）
 * @param {Object} birthJson - 出生信息
 * @param {Object} options - 选项
 * @param {Date} options.now - 当前时间（统一时间源，默认 new Date()）
 * @param {Object} helpers - 辅助函数
 * @returns {Object} TimeCoordinateDto 对象
 */
export async function buildTimeCoordinateMetrics(luckRhythm, baziChart, birthJson, { now } = {}, helpers = {}) {
  const currentTime = now || new Date();
  
  // 1. 当前大运：从 luckRhythm.currentLuck 提取（必需，失败则整卡隐藏）
  let currentDaYun = null;
  try {
    currentDaYun = buildCurrentDaYunFromLuckRhythm(luckRhythm);
    if (!currentDaYun) {
      console.warn('[TimeCoordinate] luckRhythm.currentLuck missing');
      return null;
    }
  } catch (e) {
    console.error('[TimeCoordinate] failed to build currentDaYun', e);
    return null;
  }
  
  // 2. 当前流年：规则层计算（可选）
  let currentLiuNian = null;
  try {
    const liuNianCore = analyzeLiuNianCore(baziChart, birthJson, currentTime, helpers);
    const shortTag = generateDefaultShortTag(liuNianCore);
    const riskTag = generateDefaultRiskTag(liuNianCore);
    
    currentLiuNian = {
      stemBranch: `${liuNianCore.stem}${liuNianCore.branch}`,
      year: liuNianCore.year,
      tenGod: liuNianCore.tenGodToDayMaster,
      shortTag,
      riskTag,
    };
  } catch (e) {
    console.warn('[TimeCoordinate] failed to build currentLiuNian', e);
  }
  
  // 3. 当前流月：规则层计算（可选）
  let currentLiuYue = null;
  try {
    const liuYueCore = analyzeLiuYueCore(baziChart, birthJson, currentTime, helpers);
    const shortTip = '平穩';
    
    currentLiuYue = {
      stemBranch: `${liuYueCore.stem}${liuYueCore.branch}`,
      year: liuYueCore.year,
      monthIndex: liuYueCore.monthIndex,
      tenGod: liuYueCore.tenGodToDayMaster,
      shortTip,
    };
  } catch (e) {
    console.warn('[TimeCoordinate] failed to build currentLiuYue', e);
  }
  
  return {
    currentDaYun,
    currentLiuNian,
    currentLiuYue,
  };
}

/**
 * 从 luckRhythm 构建当前大运信息
 */
export function buildCurrentDaYunFromLuckRhythm(luckRhythm) {
  const currentLuck = luckRhythm?.currentLuck;
  if (!currentLuck) {
    return null;
  }
  
  // 解析年龄区间字符串为数字数组
  const ageRangeMatch = currentLuck.ageRange?.match(/(\d+).*?(\d+)/);
  const ageRange = ageRangeMatch 
    ? [parseInt(ageRangeMatch[1], 10), parseInt(ageRangeMatch[2], 10)]
    : [0, 0];
  
  const stage = STAGE_TO_PHASE[currentLuck.stage] || { tag: 'stable', text: '平穩期' };
  
  return {
    stemBranch: `${currentLuck.stem}${currentLuck.branch}`,
    tenGod: currentLuck.tenGod,
    ageRange,
    startYear: null,
    endYear: null,
    phaseTag: stage.tag,
    phaseText: stage.text,
    favourLevel: FAVOUR_LEVEL_MAP[currentLuck.favourLevel] || 'neutral',
  };
}

/**
 * 分析流年核心信息（规则层）
 */
export function analyzeLiuNianCore(baziChart, birthJson, now, helpers = {}) {
  // 1. 调用现有流年计算函数
  const yearInfo = liuNianPillar(now);
  
  // 2. 计算流年与日主的十神关系
  const dayMasterStem = baziChart.pillars.day.stem;
  const tenGodToDayMaster = tenGod(dayMasterStem, yearInfo.stem);
  
  // 3. 计算流年与命盘的刑冲合害
  const clashHarmPunish = helpers.analyzeClashHarmPunish
    ? helpers.analyzeClashHarmPunish(
        { stem: yearInfo.stem, branch: yearInfo.branch },
        baziChart.pillars
      )
    : [];
  
  // 4. 计算流年五行与用神的关系
  const yearElement = helpers.getElementFromPillar
    ? helpers.getElementFromPillar({
        stem: yearInfo.stem,
        branch: yearInfo.branch,
      })
    : '未知';
  
  const favourLevel = helpers.determineFavourLevel
    ? helpers.determineFavourLevel(
        yearElement,
        baziChart.analysis?.gods?.favorable || [],
        baziChart.analysis?.gods?.unfavorable || []
      )
    : '中性';
  
  // 5. 计算综合评分（-100 ~ +100）
  const score = calculateLiuNianScore({
    tenGod: tenGodToDayMaster,
    favourLevel,
    clashHarmPunish,
  });
  
  // 6. 生成结构化标签
  const tags = generateTagsFromScore(score, tenGodToDayMaster);
  const riskFactors = extractRiskFactors(clashHarmPunish, favourLevel);
  
  return {
    year: yearInfo.year,
    stem: yearInfo.stem,
    branch: yearInfo.branch,
    tenGodToDayMaster,
    score,
    tags,
    riskFactors,
    favourLevel,
    clashHarmPunish,
  };
}

/**
 * 分析流月核心信息（规则层）
 */
export function analyzeLiuYueCore(baziChart, birthJson, now, helpers = {}) {
  // 1. 调用现有流月计算函数
  const yearInfo = liuNianPillar(now);
  const monthInfo = liuYuePillar(now, yearInfo.stem);
  
  // 2. 计算流月与日主的十神关系
  const dayMasterStem = baziChart.pillars.day.stem;
  const tenGodToDayMaster = tenGod(dayMasterStem, monthInfo.stem);
  
  // 3. 计算流月与命盘的刑冲合害
  const clashHarmPunish = helpers.analyzeClashHarmPunish
    ? helpers.analyzeClashHarmPunish(
        { stem: monthInfo.stem, branch: monthInfo.branch },
        baziChart.pillars
      )
    : [];
  
  // 4. 计算月份索引（1-12）
  const monthIndex = getMonthIndexFromBranch(monthInfo.branch);
  
  return {
    year: yearInfo.year,
    stem: monthInfo.stem,
    branch: monthInfo.branch,
    monthIndex,
    tenGodToDayMaster,
    clashHarmPunish,
  };
}

/**
 * 计算流年综合评分（-100 ~ +100）
 */
export function calculateLiuNianScore({ tenGod, favourLevel, clashHarmPunish }) {
  let score = 0;
  
  // 十神影响
  score += TEN_GOD_SCORES[tenGod] || 0;
  
  // 喜忌影响
  if (favourLevel === '用神') {
    score += 30;
  } else if (favourLevel === '忌神') {
    score -= 30;
  }
  
  // 刑冲影响
  score -= clashHarmPunish.length * 10;
  
  return Math.max(-100, Math.min(100, score));
}

/**
 * 根据评分生成标签
 */
export function generateTagsFromScore(score, tenGod) {
  const tags = [];
  if (score > 50) tags.push('機遇');
  if (score < -50) tags.push('壓力');
  if (['正财', '偏财'].includes(tenGod)) tags.push('財運');
  if (['正官', '七杀'].includes(tenGod)) tags.push('事業');
  return tags;
}

/**
 * 提取风险因子
 */
export function extractRiskFactors(clashHarmPunish, favourLevel) {
  const factors = [];
  if (clashHarmPunish.length > 0) factors.push('變動');
  if (favourLevel === '忌神') factors.push('壓力');
  return factors;
}

/**
 * 规则层兜底：根据评分和标签生成默认 shortTag
 */
export function generateDefaultShortTag(liuNianCore) {
  if (liuNianCore.score > 50) return '機遇多';
  if (liuNianCore.score < -50) return '壓力較大';
  return '平穩';
}

/**
 * 规则层兜底：根据风险因子生成默认 riskTag
 */
export function generateDefaultRiskTag(liuNianCore) {
  if (liuNianCore.riskFactors.length > 0) {
    return `注意${liuNianCore.riskFactors[0]}`;
  }
  return null;
}

/**
 * 从地支获取月份索引（1-12）
 */
export function getMonthIndexFromBranch(branch) {
  return BRANCH_TO_MONTH[branch] || null;
}

