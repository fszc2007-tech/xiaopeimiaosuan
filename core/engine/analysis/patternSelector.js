/**
 * 主格/副格选择算法
 * 
 * 从多个格局候选中，根据优先级、分数、分差等规则，选择主格和副格
 */

// ========== 格局 Key 常量 ==========

export const PatternKey = {
  // 特殊格局
  CONG: 'cong',      // 从格
  HUAQI: 'huaqi',    // 化气格
  
  // 八大正格
  GUAN: 'guan',      // 正官格
  SHAGUAN: 'shaguan', // 七杀格
  ZHENGCAI: 'zhengcai', // 正财格
  PIANCAI: 'piancai',  // 偏财格
  SHISHEN: 'shishen',  // 食神格
  SHANGGUAN: 'shangguan', // 伤官格
  ZHENGYIN: 'zhengyin',   // 正印格
  PIANYIN: 'pianyin',     // 偏印格
  
  // 基础格局
  BIJIE: 'bijie',    // 比劫格
  JIANLU: 'jianlu',  // 建禄格
  YANGREN: 'yangren' // 羊刃格
};

// ========== 优先级配置 ==========

/**
 * 命格优先级（值越大，优先级越高）
 */
export const PATTERN_PRIORITY = {
  // 特殊格局 - 最高优先级
  [PatternKey.CONG]: 100,
  [PatternKey.HUAQI]: 100,
  
  // 八大正格 - 中等优先级
  [PatternKey.GUAN]: 80,
  [PatternKey.SHAGUAN]: 80,
  [PatternKey.ZHENGCAI]: 80,
  [PatternKey.PIANCAI]: 80,
  [PatternKey.SHISHEN]: 80,
  [PatternKey.SHANGGUAN]: 80,
  [PatternKey.ZHENGYIN]: 80,
  [PatternKey.PIANYIN]: 80,
  
  // 基础格局 - 最低优先级（身强的底座）
  [PatternKey.BIJIE]: 60,
  [PatternKey.JIANLU]: 60,
  [PatternKey.YANGREN]: 60,
};

// ========== 阈值配置 ==========

export const PATTERN_THRESHOLDS = {
  // 成格强度
  ACHIEVED: 80,        // 成格（高分）
  STRONG: 70,          // 强格
  MODERATE: 60,        // 中等
  WEAK: 50,            // 弱格（仅做参考，不当主格）

  // 分差阈值
  MAIN_SECONDARY_GAP: 20,     // 主格与副格最大允许分差
  PRIORITY_SWAP_GAP: 10,      // 主格让位的最大分差

  // 无明显主格时，推荐"倾向性格局"的最低分
  NO_MAIN_SECONDARY_MIN: 55,

  // 数量限制
  MAX_SECONDARY: 1,           // 最大副格数量（一个人最多1个主格+1个副格，共2个格局）
};

// ========== 工具函数 ==========

/**
 * 获取格局优先级
 * @param {string} key - PatternKey
 * @returns {number} 优先级值
 */
function getPriority(key) {
  return PATTERN_PRIORITY[key] ?? 0;
}

/**
 * 判断是否为特殊格局
 * @param {Object} p - PatternScore
 * @returns {boolean}
 */
function isSpecialPattern(p) {
  return getPriority(p.key) === 100;
}

/**
 * 判断是否为正格（八大正格）
 * @param {Object} p - PatternScore
 * @returns {boolean}
 */
function isMajorPattern(p) {
  return getPriority(p.key) >= 80;
}

/**
 * 判断是否为基础格局
 * @param {Object} p - PatternScore
 * @returns {boolean}
 */
function isBasePattern(p) {
  return getPriority(p.key) <= 60;
}

// ========== 核心算法 ==========

/**
 * 主入口：选择主格 & 副格
 * 
 * @param {Array<{key: string, label: string, score: number}>} patternScores - 格局得分数组
 * @returns {Object} {
 *   mainPattern: {key, label, score} | null,
 *   secondaryPatterns: Array<{key, label, score}>,
 *   allPatterns: Array<{key, label, score}>
 * }
 */
export function selectMainPatterns(patternScores) {
  const T = PATTERN_THRESHOLDS;

  // 1. 过滤「完全没意义」的弱格（<50）
  const validPatterns = patternScores
    .filter(p => p.score >= T.WEAK)
    .sort((a, b) => {
      // 先按优先级，再按分数降序
      const pa = getPriority(a.key);
      const pb = getPriority(b.key);
      if (pb !== pa) return pb - pa;
      return b.score - a.score;
    });

  // 没有任何像样格局
  if (validPatterns.length === 0) {
    return {
      mainPattern: null,
      secondaryPatterns: [],
      allPatterns: patternScores,
    };
  }

  const topPattern = validPatterns[0];

  // 2. 特殊格局优先：从格 / 化气格成格度 ≥ 80 时，直接锁定主格
  if (isSpecialPattern(topPattern) && topPattern.score >= T.ACHIEVED) {
    return {
      mainPattern: topPattern,
      // 特殊格可以有普通副格（不包括其它从格/化气）
      secondaryPatterns: selectSecondaryPatterns(
        topPattern,
        validPatterns.slice(1)
      ),
      allPatterns: patternScores,
    };
  }

  // 3. 一般格局处理
  return processGeneralPatterns(validPatterns, patternScores);
}

/**
 * 普通格局处理逻辑
 * 
 * @param {Array} validPatterns - 有效格局数组（已排序）
 * @param {Array} allPatterns - 所有原始格局数组
 * @returns {Object} PatternResult
 */
function processGeneralPatterns(validPatterns, allPatterns) {
  const T = PATTERN_THRESHOLDS;

  if (validPatterns.length === 0) {
    return {
      mainPattern: null,
      secondaryPatterns: [],
      allPatterns,
    };
  }

  const first = validPatterns[0];
  const second = validPatterns[1];
  const S1 = first.score;
  const S2 = second?.score ?? 0;

  // 1. 无明显主格：第一名 < 60 分
  if (S1 < T.MODERATE) {
    return {
      mainPattern: null,
      secondaryPatterns: validPatterns
        .filter(p => p.score >= T.NO_MAIN_SECONDARY_MIN)
        .slice(0, T.MAX_SECONDARY),
      allPatterns,
    };
  }

  // 2. 正常情况：先按优先级调整（比如让建禄给官财印食让位）
  const adjustedPatterns = adjustPatternPriority(validPatterns);
  const mainPattern = adjustedPatterns[0];
  const remainingPatterns = adjustedPatterns.slice(1);

  // 3. 选择副格
  const secondaryPatterns = selectSecondaryPatterns(mainPattern, remainingPatterns);

  return {
    mainPattern,
    secondaryPatterns,
    allPatterns,
  };
}

/**
 * 优先级调整：基础格让位重要格局
 * 
 * 命理含义：
 * 身强（建禄、比劫）只是"体质"，
 * 真正决定表现风格的是官财印食这类「用神格局」，
 * 当它们分数接近且官财印食已成格，就让它来做主格。
 * 
 * 注意：建禄格和枭印格可以并存，建禄格作为身强的基础，枭印格作为用神格局。
 * 
 * @param {Array} patterns - 已排序的格局数组
 * @returns {Array} 调整后的格局数组
 */
function adjustPatternPriority(patterns) {
  const T = PATTERN_THRESHOLDS;
  if (patterns.length < 2) return patterns;

  const sorted = [...patterns]; // 已按优先级+得分排好
  const first = sorted[0];
  const second = sorted[1];

  // 场景：主格是建禄/比劫/羊刃，第二名是官财印食且成格度高、分数接近
  // 但建禄格和枭印格可以并存，不需要让位
  if (
    isBasePattern(first) &&         // 第一名是基础格（建禄/比劫/羊刃）
    isMajorPattern(second) &&        // 第二名是重要格局（官财印食食伤）
    first.score - second.score <= T.PRIORITY_SWAP_GAP && // 分差不大
    second.score >= T.ACHIEVED      // 第二名已达到「成格」水平
  ) {
    // 特殊情况：建禄格和枭印格可以并存，建禄格不需要让位
    // 建禄格是身强的基础，枭印格是用神格局，两者可以同时存在
    const isJianLuWithXiaoYin = 
      (first.key === PatternKey.JIANLU && second.key === PatternKey.PIANYIN) ||
      (first.key === PatternKey.PIANYIN && second.key === PatternKey.JIANLU);
    
    if (!isJianLuWithXiaoYin) {
      // 让位给重要格局（但建禄格+枭印格除外）
      [sorted[0], sorted[1]] = [sorted[1], sorted[0]];
    }
  }

  return sorted;
}

/**
 * 副格选择规则
 * 
 * @param {Object} mainPattern - 主格对象
 * @param {Array} candidatePatterns - 候选格局数组
 * @returns {Array} 选中的副格数组
 */
function selectSecondaryPatterns(mainPattern, candidatePatterns) {
  const T = PATTERN_THRESHOLDS;
  const result = [];

  for (const p of candidatePatterns) {
    if (result.length >= T.MAX_SECONDARY) break;

    // 1. 分数必须 ≥ 60（中等以上）
    if (p.score < T.MODERATE) continue;

    // 2. 与主格分差不能太大（否则就当小倾向，不单列副格）
    const scoreDiff = mainPattern.score - p.score;
    if (scoreDiff > T.MAIN_SECONDARY_GAP) continue;

    // 3. 特殊格局不做副格（从格/化气只当主轴，不做"兼"）
    if (isSpecialPattern(p)) continue;

    // 4. 建禄格和枭印格可以并存：建禄格是身强基础，枭印格是用神格局
    // 如果主格是建禄格，枭印格可以作为副格；反之亦然
    const isJianLuWithXiaoYin = 
      (mainPattern.key === PatternKey.JIANLU && p.key === PatternKey.PIANYIN) ||
      (mainPattern.key === PatternKey.PIANYIN && p.key === PatternKey.JIANLU);
    
    // 如果分差在合理范围内，允许并存
    if (isJianLuWithXiaoYin && scoreDiff <= T.MAIN_SECONDARY_GAP) {
      result.push(p);
      continue;
    }

    result.push(p);
  }

  return result;
}

