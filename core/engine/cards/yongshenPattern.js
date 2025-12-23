// 新增理由：用神格局卡片数据构建（从 index.js 拆分）
// 回滚方式：回退此文件，恢复 index.js 中的原方法

import { tenGod } from '../mingli/index.js';
import { generateTiaohouLabel } from '../analysis/tiaohou.js';

/**
 * 天干五行映射
 */
const STEM_ELEMENT = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水',
};

/**
 * 组装「用神格局」数据
 * 
 * @param {Object} wuxingResult - 五行结果
 * @param {Object} favoredResult - 喜用神结果
 * @param {Object} tiyongResult - 体用结果
 * @param {Object} dogongResult - 做功结果
 * @param {Object} purityResult - 清浊结果
 * @param {Object} tiaohouResult - 调候结果
 * @param {Object} pillars - 四柱
 * @param {string} dayStem - 日干
 * @param {Object} helpers - 辅助函数 { extractWorkPatternTags, generateWorkLineName }
 * @returns {Object} 用神格局数据
 */
export function buildYongshenPattern(
  wuxingResult, 
  favoredResult, 
  tiyongResult, 
  dogongResult, 
  purityResult, 
  tiaohouResult, 
  pillars, 
  dayStem,
  helpers = {}
) {
  // 提取主用神（取前1-2个作为主用神）
  const mainElements = (favoredResult?.favored || []).slice(0, 2);
  const assistElements = (favoredResult?.favored || []).slice(2);
  const tabooElements = favoredResult?.avoid || [];

  // 提取主用神对应的十神
  const mainTenGods = extractTenGodsForElements(pillars, dayStem, mainElements);

  // 用神力度
  const yongshenScoreRaw = purityResult?.details?.yongshenPurity ?? (tiyongResult?.useStrength ? tiyongResult.useStrength * 100 : 0);
  const yongshenScore = normalizeTo100(yongshenScoreRaw);

  // 流通等级
  const flowScoreRaw = purityResult?.details?.wuxingFlow ?? 0;
  const flowScore = normalizeTo100(flowScoreRaw);

  // 体用平衡
  const tiYongLevel = mapTiYongLevel(tiyongResult);
  const carrierScore = normalizeTo100((tiyongResult?.carryingCapacity ?? 0) * 100);
  const passScore = normalizeTo100((tiyongResult?.passThroughDegree ?? 0) * 100);

  // 做功格局
  const coreLine = dogongResult?.coreLine || null;
  const workMainLine = helpers.extractWorkLineName 
    ? helpers.extractWorkLineName(coreLine)
    : extractWorkLineNameLocal(coreLine, helpers);
  const workStrength = mapWorkIntensityToLevel(coreLine?.workForce);
  const workTags = helpers.extractWorkPatternTags 
    ? helpers.extractWorkPatternTags(dogongResult)
    : extractWorkPatternTagsLocal(dogongResult);

  // 调候标签（可选）
  const tiaohouLabel = tiaohouResult ? generateTiaohouLabel(tiaohouResult) : undefined;

  return {
    mainYongshen: {
      elements: mainElements,
      tenGods: mainTenGods.length > 0 ? mainTenGods : undefined,
      type: mainElements.length > 1 ? '複合用神' : '單一用神'
    },
    assistElements,
    tabooElements,
    yongshenPower: {
      score: yongshenScore,
      level: mapYongshenPowerLevel(yongshenScore)
    },
    flow: {
      level: mapFlowScoreToLevel(flowScore),
      score: flowScore
    },
    tiYongBalance: {
      level: tiYongLevel,
      carrierScore: carrierScore,
      passScore: passScore
    },
    workPatterns: {
      mainLine: workMainLine,
      strength: workStrength,
      tags: workTags
    },
    tiaohouLabel
  };
}

/**
 * 从四柱中提取指定五行对应的十神
 */
export function extractTenGodsForElements(pillars, dayStem, elements) {
  if (!pillars || !dayStem || !elements || elements.length === 0) {
    return [];
  }

  const tenGodsSet = new Set();

  // 遍历四柱
  ['year', 'month', 'day', 'hour'].forEach(pos => {
    const pillar = pillars[pos];
    if (!pillar) return;

    // 检查天干
    if (pillar.stem) {
      const stemElement = STEM_ELEMENT[pillar.stem];
      if (elements.includes(stemElement)) {
        const shishen = tenGod(dayStem, pillar.stem);
        if (shishen && shishen !== '元男' && shishen !== '元女') {
          tenGodsSet.add(shishen);
        }
      }
    }

    // 检查藏干
    if (pillar.canggan && Array.isArray(pillar.canggan)) {
      pillar.canggan.forEach(stem => {
        const stemElement = STEM_ELEMENT[stem];
        if (elements.includes(stemElement)) {
          const shishen = tenGod(dayStem, stem);
          if (shishen) {
            tenGodsSet.add(shishen);
          }
        }
      });
    }
  });

  return Array.from(tenGodsSet);
}

/**
 * 归一化分数到 0-100
 */
export function normalizeTo100(raw) {
  if (raw == null || isNaN(raw)) return 0;
  // 如果本身是 0–100，保持不变；如果是 0–1，放大到 0–100
  if (raw <= 1) return Math.round(raw * 100);
  return Math.round(raw);
}

/**
 * 用神力度分級
 */
export function mapYongshenPowerLevel(score) {
  if (score >= 80) return '很強';
  if (score >= 65) return '較強';
  if (score >= 50) return '中等';
  return '偏弱';
}

/**
 * 流通度等級
 */
export function mapFlowScoreToLevel(score) {
  if (score >= 80) return '順暢';
  if (score >= 60) return '通而不暢';
  if (score >= 40) return '阻塞較多';
  return '嚴重阻塞';
}

/**
 * 體用等級映射
 */
export function mapTiYongLevel(tiyongResult) {
  if (!tiyongResult) return '體用相協';

  const bodyStrength = tiyongResult.bodyStrength ?? 0;
  const useStrength = tiyongResult.useStrength ?? 0;

  // 体强用弱
  if (bodyStrength > useStrength * 1.2) {
    return '體強用弱';
  }
  // 体弱用强
  if (useStrength > bodyStrength * 1.2) {
    return '體弱用強';
  }
  // 体用相协（差距小于15%）
  if (Math.abs(bodyStrength - useStrength) < 0.15) {
    return '體用相協';
  }
  // 其他情况为失衡
  return '體用失衡';
}

/**
 * 做功強度等級
 */
export function mapWorkIntensityToLevel(workForce) {
  if (workForce == null || isNaN(workForce)) return '中';
  if (workForce >= 0.7) return '強';
  if (workForce >= 0.4) return '中';
  return '弱';
}

/**
 * 提取做功路径名称（本地版本，用于没有传入 helpers 时）
 */
function extractWorkLineNameLocal(coreLine, helpers) {
  if (!coreLine || !coreLine.path) {
    return '';
  }
  if (helpers.generateWorkLineName) {
    return helpers.generateWorkLineName(coreLine.path, coreLine.relations || []);
  }
  return '';
}

/**
 * 提取做功类型标签（本地版本）
 */
function extractWorkPatternTagsLocal(dogongResult) {
  if (!dogongResult) {
    return [];
  }

  const tags = new Set();

  // 从 strongestPaths 中提取类型
  if (dogongResult.strongestPaths && Array.isArray(dogongResult.strongestPaths)) {
    dogongResult.strongestPaths.forEach(path => {
      if (path.type && typeof path.type === 'string') {
        tags.add(path.type);
      }
    });
  }

  // 从 workTypeSummary 中提取
  if (dogongResult.workTypeSummary && typeof dogongResult.workTypeSummary === 'object') {
    Object.keys(dogongResult.workTypeSummary).forEach(type => {
      if (type && type !== '未知') {
        tags.add(type);
      }
    });
  }

  return Array.from(tags);
}

