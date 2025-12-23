// 新增理由：行运节奏卡片数据构建（从 index.js 拆分）
// 回滚方式：回退此文件，恢复 index.js 中的原方法

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
 * 六冲关系
 */
const CHONG_PAIRS = [
  ['子', '午'], ['丑', '未'], ['寅', '申'],
  ['卯', '酉'], ['辰', '戌'], ['巳', '亥'],
];

/**
 * 从柱中提取五行
 */
export function getElementFromPillar(pillar) {
  return STEM_ELEMENT[pillar?.stem] || '未知';
}

/**
 * 判断是否六冲
 */
export function isChong(branch1, branch2) {
  return CHONG_PAIRS.some(([a, b]) => 
    (a === branch1 && b === branch2) || (a === branch2 && b === branch1)
  );
}

/**
 * 判断喜忌等级
 * @param {string} element - 五行（如 "火", "土"）
 * @param {string[]} usefulGods - 用神五行数组（如 ["火", "土"]）
 * @param {string[]} avoidGods - 忌神五行数组（如 ["金", "水"]）
 * @returns {'用神' | '中性' | '忌神'}
 */
export function determineFavourLevel(element, usefulGods, avoidGods) {
  if (usefulGods.includes(element)) {
    return '用神';
  } else if (avoidGods.includes(element)) {
    return '忌神';
  } else {
    return '中性';
  }
}

/**
 * 分析冲合刑害
 */
export function analyzeClashHarmPunish(luckPillar, pillars) {
  const results = [];
  const luckBranch = luckPillar?.branch;
  if (!luckBranch) return results;
  
  // 检查与年柱、月柱、日柱、时柱的关系
  ['year', 'month', 'day', 'hour'].forEach(pillarKey => {
    const pillar = pillars[pillarKey];
    if (!pillar) return;
    
    const branch = pillar.branch;
    // 简化版：只检查六冲
    if (isChong(luckBranch, branch)) {
      results.push(`${pillarKey}柱冲`);
    }
  });
  
  return results;
}

/**
 * 计算喜忌强度（-2 ~ +2）
 * @param {string} element - 大运五行
 * @param {Object} favoredAvoid - 用神忌神信息 { favored: [], avoid: [] }
 * @param {string[]} clashHarmPunish - 冲合刑害列表
 * @returns {number} -2 ~ +2
 */
export function calculateFavourScore(element, favoredAvoid, clashHarmPunish = []) {
  let score = 0;
  
  // 基础喜忌
  if (favoredAvoid.favored.includes(element)) {
    score = 1; // 偏喜
  } else if (favoredAvoid.avoid.includes(element)) {
    score = -1; // 偏忌
  }
  
  // 冲合刑害影响（简化版）
  if (clashHarmPunish.length > 0) {
    if (score < 0) {
      score -= 0.5; // 更忌
    } else if (score > 0) {
      score -= 0.3; // 减弱
    }
  }
  
  // 限制在 -2 ~ +2 之间
  return Math.max(-2, Math.min(2, score));
}

/**
 * 计算大运对原局的作用力度
 */
export function calculateLuckStrength(currentLuck, context) {
  const { favourLevel, clashHarmPunish } = currentLuck;
  const { dmStrength } = context;
  
  let strength = 0.5; // 基础强度
  
  // 用神大运强度更高
  if (favourLevel === '用神') {
    strength += 0.2;
  } else if (favourLevel === '忌神') {
    strength -= 0.1;
  }
  
  // 刑冲多时强度更高（变动大）
  if (clashHarmPunish.length >= 2) {
    strength += 0.2;
  } else if (clashHarmPunish.length === 1) {
    strength += 0.1;
  }
  
  // 日主强弱影响
  if (dmStrength < 0.5) {
    strength += 0.1; // 身弱时大运影响更明显
  }
  
  return Math.max(0, Math.min(1, strength));
}

/**
 * 评估当前大运的阶段元数据
 */
export function evaluateStageMeta(currentLuck, context) {
  const { dmStrength, tenGodDistribution } = context;
  const { tenGod, favourLevel, clashHarmPunish, strengthScore } = currentLuck;
  
  let stage;
  let intensity;
  const mainDomains = [];
  let tone = '偏主动';
  
  // 1）根据十神 & 喜忌定大阶段
  if (['正印', '偏印', '比肩', '劫财'].includes(tenGod) && favourLevel === '用神') {
    stage = '打基础期';
  } else if (['正财', '偏财', '正官', '七杀'].includes(tenGod) && favourLevel === '用神') {
    stage = '拓展冲刺期';
  } else if (['食神', '伤官'].includes(tenGod) && favourLevel === '用神') {
    stage = '沉淀收获期';
  } else {
    // 喜忌冲突、刑冲多时，优先归为「调整转折期」
    if (clashHarmPunish.length >= 2 || favourLevel === '忌神') {
      stage = '調整轉折期';
    } else {
      // 默认：看整体结构，偏稳则「沉淀收获」，偏弱则「打基础」
      stage = dmStrength < 0.8 ? '打基础期' : '沉淀收获期';
    }
  }
  
  // 2）强度（节奏快慢）
  if (strengthScore >= 0.7 || clashHarmPunish.length >= 2) {
    intensity = '变动明显';
  } else if (strengthScore >= 0.4) {
    intensity = '起伏感较强';
  } else {
    intensity = '偏平穩';
  }
  
  // 3）主领域
  if (['正财', '偏财'].includes(tenGod)) {
    mainDomains.push('财富', '事业');
  }
  if (['正官', '七杀'].includes(tenGod)) {
    mainDomains.push('事业', '家庭');
  }
  if (['食神', '伤官'].includes(tenGod)) {
    mainDomains.push('学习', '自我修炼');
  }
  if (['正印', '偏印'].includes(tenGod)) {
    mainDomains.push('学习', '自我修炼');
  }
  // 使用 W 对象的 key（cai 而不是 '财'）
  if (tenGodDistribution.cai > 0.3 && !mainDomains.includes('财富')) {
    mainDomains.push('财富');
  }
  
  // 4）基调（内修/外拓）
  if (['正印', '偏印', '比肩', '劫财'].includes(tenGod)) tone = '内修型';
  if (['正财', '偏财', '正官', '七杀'].some(k => tenGod.includes(k))) tone = '外拓型';
  
  return { stage, intensity, mainDomains: Array.from(new Set(mainDomains)), tone };
}

/**
 * 生成简短评论
 */
export function generateShortComment(luck, favourLevel) {
  const tenGod = luck.shishen || '未知';
  if (favourLevel === '用神') {
    return `走${tenGod}用神，整體偏順`;
  } else if (favourLevel === '忌神') {
    return `走${tenGod}忌神，需要多留意`;
  } else {
    return `走${tenGod}，中性`;
  }
}

/**
 * 生成上一运/下一运摘要
 */
export function generatePrevNextSummary(prevLuck, nextLuck, currentStage, context, pillars) {
  const result = {
    prev: undefined,
    next: undefined,
    stageShiftHint: '',
  };
  
  // 上一运摘要
  if (prevLuck) {
    const prevElement = getElementFromPillar(prevLuck);
    const prevFavourLevel = determineFavourLevel(prevElement, context.usefulGods, context.avoidGods);
    const prevClashHarmPunish = analyzeClashHarmPunish(prevLuck, pillars);
    const prevStrengthScore = calculateLuckStrength({ favourLevel: prevFavourLevel, clashHarmPunish: prevClashHarmPunish }, context);
    const prevStageMeta = evaluateStageMeta({
      tenGod: prevLuck.shishen || '未知',
      favourLevel: prevFavourLevel,
      clashHarmPunish: prevClashHarmPunish,
      strengthScore: prevStrengthScore,
    }, context);
    
    result.prev = {
      label: `${prevLuck.stem}${prevLuck.branch}大运`,
      shortComment: `上一运是${prevStageMeta.stage}，${generateShortComment(prevLuck, prevFavourLevel)}`,
    };
  }
  
  // 下一运摘要
  if (nextLuck) {
    const nextElement = getElementFromPillar(nextLuck);
    const nextFavourLevel = determineFavourLevel(nextElement, context.usefulGods, context.avoidGods);
    const nextClashHarmPunish = analyzeClashHarmPunish(nextLuck, pillars);
    const nextStrengthScore = calculateLuckStrength({ favourLevel: nextFavourLevel, clashHarmPunish: nextClashHarmPunish }, context);
    const nextStageMeta = evaluateStageMeta({
      tenGod: nextLuck.shishen || '未知',
      favourLevel: nextFavourLevel,
      clashHarmPunish: nextClashHarmPunish,
      strengthScore: nextStrengthScore,
    }, context);
    
    result.next = {
      label: `${nextLuck.stem}${nextLuck.branch}大运`,
      shortComment: `下一运是${nextStageMeta.stage}，${generateShortComment(nextLuck, nextFavourLevel)}`,
    };
  }
  
  // 阶段转换提示
  if (prevLuck && nextLuck) {
    const prevElement = getElementFromPillar(prevLuck);
    const prevFavourLevel = determineFavourLevel(prevElement, context.usefulGods, context.avoidGods);
    const prevClashHarmPunish = analyzeClashHarmPunish(prevLuck, pillars);
    const prevStrengthScore = calculateLuckStrength({ favourLevel: prevFavourLevel, clashHarmPunish: prevClashHarmPunish }, context);
    const prevStageMeta = evaluateStageMeta({
      tenGod: prevLuck.shishen || '未知',
      favourLevel: prevFavourLevel,
      clashHarmPunish: prevClashHarmPunish,
      strengthScore: prevStrengthScore,
    }, context);
    
    const nextElement = getElementFromPillar(nextLuck);
    const nextFavourLevel = determineFavourLevel(nextElement, context.usefulGods, context.avoidGods);
    const nextClashHarmPunish = analyzeClashHarmPunish(nextLuck, pillars);
    const nextStrengthScore = calculateLuckStrength({ favourLevel: nextFavourLevel, clashHarmPunish: nextClashHarmPunish }, context);
    const nextStageMeta = evaluateStageMeta({
      tenGod: nextLuck.shishen || '未知',
      favourLevel: nextFavourLevel,
      clashHarmPunish: nextClashHarmPunish,
      strengthScore: nextStrengthScore,
    }, context);
    
    if (prevStageMeta.stage !== currentStage && nextStageMeta.stage !== currentStage) {
      result.stageShiftHint = `整體從${prevStageMeta.stage}走向${nextStageMeta.stage}`;
    } else if (prevStageMeta.stage !== currentStage) {
      result.stageShiftHint = `從${prevStageMeta.stage}轉入${currentStage}`;
    } else if (nextStageMeta.stage !== currentStage) {
      result.stageShiftHint = `從${currentStage}將轉入${nextStageMeta.stage}`;
    }
  }
  
  return result;
}

/**
 * 评估流年作用倾向
 */
export function evaluateYearEffect(currentYear, currentLuck, context) {
  const { tenGod: yearTenGod, favourLevel: yearFavourLevel } = currentYear;
  const { tenGod: luckTenGod, favourLevel: luckFavourLevel } = currentLuck;
  
  // 兜底：先看 favourLevel
  if (yearFavourLevel === '忌神') {
    if (currentYear.clashHarmPunish && currentYear.clashHarmPunish.length > 0) {
      return '提醒調整';
    }
    return '提醒調整';
  }
  
  // 若流年用神且十神跟当前大运同阵营 → 推动
  if (yearFavourLevel === '用神') {
    const sameCamp = 
      (['正财', '偏财', '正官', '七杀'].includes(yearTenGod) && 
       ['正财', '偏财', '正官', '七杀'].includes(luckTenGod)) ||
      (['正印', '偏印', '比肩', '劫财'].includes(yearTenGod) && 
       ['正印', '偏印', '比肩', '劫财'].includes(luckTenGod)) ||
      (['食神', '伤官'].includes(yearTenGod) && 
       ['食神', '伤官'].includes(luckTenGod));
    
    if (sameCamp && luckFavourLevel === '用神') {
      return '推動';
    }
    return '推動';
  }
  
  // 若中性或用神但走印比而大运是财官这种「踩刹车」组合 → 减速
  if (yearFavourLevel === '中性' || 
      (yearFavourLevel === '用神' && 
       ['正印', '偏印', '比肩', '劫财'].includes(yearTenGod) && 
       ['正财', '偏财', '正官', '七杀'].includes(luckTenGod))) {
    return '減速';
  }
  
  return '減速';
}

/**
 * 生成流年描述
 */
export function generateYearDescription(effect, flowYear) {
  const ganzhi = flowYear.ganzhi || `${flowYear.stem || ''}${flowYear.branch || ''}`;
  if (effect === '推動') {
    return `當前流年${ganzhi}，整體偏順，適合推進`;
  } else if (effect === '減速') {
    return `當前流年${ganzhi}，節奏偏緩，適合調整`;
  } else {
    return `當前流年${ganzhi}，需要多留意變化`;
  }
}

/**
 * 评估当前流年
 */
export function evaluateCurrentYear(flowYear, currentLuck, context, pillars) {
  if (!flowYear) {
    return {
      year: new Date().getFullYear(),
      effect: '推動',
      description: '當前流年整體偏順',
    };
  }
  
  const yearElement = getElementFromPillar(flowYear);
  const yearFavourLevel = determineFavourLevel(
    yearElement,
    context.usefulGods,
    context.avoidGods
  );
  
  const effect = evaluateYearEffect({
    tenGod: flowYear.shishen || '未知',
    favourLevel: yearFavourLevel,
    clashHarmPunish: analyzeClashHarmPunish(flowYear, pillars || {}),
  }, currentLuck, context);
  
  const description = generateYearDescription(effect, flowYear);
  
  return {
    year: flowYear.year || new Date().getFullYear(),
    effect,
    description,
  };
}

/**
 * 生成未来 2-3 年流年数组（简化版）
 */
export function generateComingYears(derived, currentAge, count) {
  const currentYear = new Date().getFullYear();
  const years = [];
  
  for (let i = 1; i <= count; i++) {
    const year = currentYear + i;
    years.push({
      year,
      effect: '推動', // 简化版，实际应该计算
    });
  }
  
  return years;
}

/**
 * 生成趋势总结文本
 */
export function generateTrendSummary(effects, tendency) {
  if (tendency === '整體偏順') {
    return '未來幾年整體像一段緩慢抬升的坡道，適合在現有基礎上穩步推進。';
  } else if (tendency === '以調整為主') {
    return '未來幾年以調整和適應為主，需要多留意節奏變化，適時踩剎車。';
  } else {
    return '未來幾年像一段有起伏的小坡道，有推動也有減速，需要靈活應對。';
  }
}

/**
 * 生成未来 2-3 年趋势
 */
export function generateComingYearsTrend(comingYears, currentLuck, context) {
  const effects = comingYears.map(year => year.effect);
  const pushCount = effects.filter(e => e === '推動').length;
  const adjustCount = effects.filter(e => e === '提醒調整').length;
  
  let tendency;
  if (pushCount >= 2) {
    tendency = '整體偏順';
  } else if (adjustCount >= 2) {
    tendency = '以調整為主';
  } else {
    tendency = '有起伏的小坡道';
  }
  
  const summary = generateTrendSummary(effects, tendency);
  
  return { summary, tendency };
}

/**
 * 生成补充提示
 */
export function generateNotes(currentLuck, context, favoredAvoid) {
  const notes = [];
  
  if (currentLuck.favourLevel === '用神') {
    notes.push('當前大運配合用神，整體偏順');
  }
  
  if (currentLuck.clashHarmPunish.length > 0) {
    notes.push(`多冲${currentLuck.clashHarmPunish.join('、')}`);
  }
  
  if (currentLuck.stage === '調整轉折期') {
    notes.push('當前處於調整轉折期，需要多留意節奏變化');
  }
  
  return notes;
}

/**
 * 获取默认值（当大运不存在时）
 */
export function getDefaultLuckRhythmMetrics(startAge, luckDirection, currentAge) {
  return {
    startAge,
    luckDirection,
    currentAge,
    currentLuck: {
      index: 0,
      label: '未知大运',
      ageRange: '未知',
      stem: '',
      branch: '',
      tenGod: '未知',
      element: '未知',
      favourLevel: '中性',
      stage: '打基础期',
      intensity: '偏平稳',
      mainDomains: [],
      tone: '偏主动',
      strengthScore: 0.3,
      clashHarmPunish: [],
    },
    prevNextLuckSummary: {
      stageShiftHint: '',
    },
    currentYear: {
      year: new Date().getFullYear(),
      effect: '推動',
      description: '當前流年整體偏順',
    },
    comingYearsTrend: {
      summary: '未來幾年整體偏順',
      tendency: '整體偏順',
    },
    notes: [],
  };
}

/**
 * 获取未入大运时的特殊值
 */
export function getPreLuckRhythmMetrics(startAge, luckDirection, currentAge) {
  return {
    startAge,
    luckDirection,
    currentAge,
    currentLuck: {
      index: -1,
      label: '未入大运',
      ageRange: `约 0 岁到 ${startAge} 岁`,
      stem: '',
      branch: '',
      tenGod: '未知',
      element: '未知',
      favourLevel: '中性',
      stage: '打基础期',
      intensity: '偏平稳',
      mainDomains: ['学习', '家庭'],
      tone: '偏主动',
      strengthScore: 0.2,
      clashHarmPunish: [],
    },
    prevNextLuckSummary: {
      stageShiftHint: `未正式入大运 · 以原局与流年为主的准备期`,
    },
    currentYear: {
      year: new Date().getFullYear(),
      effect: '推動',
      description: '當前流年整體偏順',
    },
    comingYearsTrend: {
      summary: '未來幾年整體偏順',
      tendency: '整體偏順',
    },
    notes: ['未入大运，以原局与流年为主'],
  };
}

/**
 * 计算当前年龄
 */
export function calculateCurrentAge(birthJson) {
  const { year, month, day, hour, minute } = birthJson;
  const birthDate = new Date(year, month - 1, day, hour || 0, minute || 0);
  const now = new Date();
  const ageMs = now.getTime() - birthDate.getTime();
  const ageYears = ageMs / (365.25 * 24 * 60 * 60 * 1000);
  return Math.floor(ageYears);
}

/**
 * 组装「行运节奏」数据
 * 
 * @param {Object} derived - 派生数据（含大运流年）
 * @param {Object} birthJson - 出生信息
 * @param {Object} strengthResult - 日主强度结果
 * @param {Object} favoredAvoid - 用神忌神
 * @param {Object} structureResult - 格局结果
 * @param {Object} pillars - 四柱
 * @returns {Object} 行运节奏数据
 */
export async function buildLuckRhythmMetrics(
  derived,
  birthJson,
  strengthResult,
  favoredAvoid,
  structureResult,
  pillars
) {
  // 1. 提取基础信息
  const startAge = derived.qi_yun?.years || 0;
  const luckDirection = derived.yun_direction === 'shun' ? '顺行' : '逆行';
  const currentAge = calculateCurrentAge(birthJson);
  
  // 2. 确定当前大运（使用年龄区间查找，更安全）
  const luckCycle = derived.luck_cycle || [];
  const currentLuckIndex = luckCycle.findIndex(l =>
    currentAge >= l.startAge && currentAge < l.endAge
  );
  
  // 处理未入大运的情况
  if (currentLuckIndex === -1) {
    if (currentAge < startAge) {
      return getPreLuckRhythmMetrics(startAge, luckDirection, currentAge);
    }
    return getDefaultLuckRhythmMetrics(startAge, luckDirection, currentAge);
  }
  
  const currentLuckRaw = luckCycle[currentLuckIndex];
  
  // 3. 计算当前大运的详细信息
  const context = {
    dmStrength: strengthResult?.score || 0.5,
    usefulGods: favoredAvoid?.favored || [],
    avoidGods: favoredAvoid?.avoid || [],
    tenGodDistribution: structureResult?.W || {},
  };
  
  // 4. 判断大运喜忌
  const luckElement = getElementFromPillar(currentLuckRaw);
  const favourLevel = determineFavourLevel(luckElement, context.usefulGods, context.avoidGods);
  
  // 5. 计算大运强度
  const clashHarmPunish = analyzeClashHarmPunish(currentLuckRaw, pillars);
  const strengthScore = calculateLuckStrength({
    favourLevel,
    clashHarmPunish,
  }, context);
  
  // 6. 评估阶段元数据
  const stageMeta = evaluateStageMeta({
    tenGod: currentLuckRaw.shishen || '未知',
    favourLevel,
    clashHarmPunish,
    strengthScore,
  }, context);
  
  // 7. 组装当前大运信息
  const currentLuck = {
    index: currentLuckIndex,
    label: `${currentLuckRaw.stem}${currentLuckRaw.branch}大运`,
    ageRange: `约 ${currentLuckRaw.startAge} 岁到 ${currentLuckRaw.endAge} 岁`,
    stem: currentLuckRaw.stem,
    branch: currentLuckRaw.branch,
    tenGod: currentLuckRaw.shishen || '未知',
    element: luckElement,
    favourLevel,
    stage: stageMeta.stage,
    intensity: stageMeta.intensity,
    mainDomains: stageMeta.mainDomains,
    tone: stageMeta.tone,
    strengthScore,
    clashHarmPunish,
  };
  
  // 8. 生成上一运/下一运摘要
  const prevLuck = luckCycle[currentLuckIndex - 1];
  const nextLuck = luckCycle[currentLuckIndex + 1];
  const prevNextSummary = generatePrevNextSummary(prevLuck, nextLuck, stageMeta.stage, context, pillars);
  
  // 9. 计算当前流年
  const flowYear = derived.flow_years?.[0];
  const currentYear = evaluateCurrentYear(flowYear, currentLuck, context, pillars);
  
  // 10. 生成未来 2-3 年趋势
  const comingYears = generateComingYears(derived, currentAge, 3);
  const comingYearsTrend = generateComingYearsTrend(comingYears, currentLuck, context);
  
  // 11. 生成补充提示
  const notes = generateNotes(currentLuck, context, favoredAvoid);
  
  // 12. 生成未来十年流年列表
  const { buildAnnualBrief } = await import('../analysis/annualLuck.js');
  const currentYearNum = new Date().getFullYear();
  const dayStem = pillars.day.stem;
  const annualBrief = buildAnnualBrief({
    derived,
    analysis: {
      usefulGods: context.usefulGods,
      avoidGods: context.avoidGods,
      luckRhythm: {
        currentLuck: {
          stage: stageMeta.stage,
        },
      },
    },
    currentYear: currentYearNum,
    currentLuckIndex,
    currentAge,
    dayStem,
  });
  
  // 13. 组装返回对象
  return {
    startAge,
    luckDirection,
    currentAge,
    currentLuck,
    prevNextLuckSummary: prevNextSummary,
    currentYear,
    comingYearsTrend,
    notes,
    annualBrief,
  };
}

