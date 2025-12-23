/**
 * 调候分析模块
 * 
 * 基于子平法调候理论：寒则暖之、热则寒之、湿则燥之、燥则湿之
 * 
 * 核心功能：
 * 1. 气候类型判定（寒/热/湿/燥）
 * 2. 调候规则生成（need/avoid）
 * 3. 调候效果评估
 * 
 * @module tiaohou
 */

import { STEM_ELEMENT, BRANCH_ELEMENT, GENERATES, CONTROLS, MONTH_INDEX } from './constants.js';

/**
 * 根据月支获取季节
 * @param {String} monthBranch - 月支
 * @returns {String} '春' | '夏' | '秋' | '冬'
 */
export function getSeason(monthBranch) {
  if (!monthBranch) return '春'; // 默认值
  
  const monthIdx = MONTH_INDEX[monthBranch];
  if (monthIdx === undefined) return '春'; // 默认值
  
  // 寅卯辰为春（2,3,4）
  if (monthIdx >= 2 && monthIdx <= 4) return '春';
  // 巳午未为夏（5,6,7）
  if (monthIdx >= 5 && monthIdx <= 7) return '夏';
  // 申酉戌为秋（8,9,10）
  if (monthIdx >= 8 && monthIdx <= 10) return '秋';
  // 亥子丑为冬（11,0,1）
  return '冬';
}

/**
 * 计算八字整体五行分布
 * 统计天干 + 地支本气五行（后续可优化加入藏干权重）
 * @param {Object} pillars - 四柱数据
 * @returns {Object} { '木': 2, '火': 1, '土': 3, '金': 1, '水': 1 }
 */
export function getElementDistribution(pillars) {
  const dist = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
  
  if (!pillars) return dist;
  
  const positions = ['year', 'month', 'day', 'hour'];
  
  for (const pos of positions) {
    const pillar = pillars[pos];
    if (!pillar) continue;
    
    // 天干五行
    const stemElement = STEM_ELEMENT[pillar.stem];
    if (stemElement) {
      dist[stemElement] = (dist[stemElement] || 0) + 1;
    }
    
    // 地支本气五行
    const branchElement = BRANCH_ELEMENT[pillar.branch];
    if (branchElement) {
      dist[branchElement] = (dist[branchElement] || 0) + 1;
    }
  }
  
  return dist;
}

/**
 * 根据月令 + 全局五行，计算寒/热/湿/燥指数
 * 返回一个"命局小气候"对象
 * @param {String} monthBranch - 月支
 * @param {Object} pillars - 四柱数据
 * @returns {Object} 气候类型对象
 */
export function getClimateType(monthBranch, pillars) {
  if (!monthBranch || !pillars) {
    return {
      coldScore: 0,
      hotScore: 0,
      wetScore: 0,
      dryScore: 0,
      coldLevel: '无',
      hotLevel: '无',
      wetLevel: '无',
      dryLevel: '无',
      dominant: '无',
      second: null
    };
  }
  
  const dist = getElementDistribution(pillars);
  let cold = 0;
  let hot = 0;
  let wet = 0;
  let dry = 0;
  
  // 1. 月令基础气候（大环境）
  switch (monthBranch) {
    case '亥':
    case '子':
      // 冬初、冬中，水寒
      cold += 3;
      wet += 1;
      break;
    case '丑':
      // 冬末湿寒土
      cold += 2;
      wet += 2;
      break;
    case '巳':
    case '午':
      // 夏火炎
      hot += 3;
      dry += 1;
      break;
    case '未':
      // 夏末燥土
      hot += 2;
      dry += 2;
      break;
    case '辰':
      // 春末湿土
      wet += 2;
      break;
    case '戌':
      // 秋末燥土
      dry += 2;
      break;
  }
  
  // 2. 全局五行对气候的修正（命局小环境）
  // 水多 → 寒 + 湿
  // 火多 → 热 + 燥
  // 金偏寒、燥；木偏温、湿；土偏燥一点
  cold += dist['水'] + dist['金'] * 0.7;
  hot += dist['火'] + dist['木'] * 0.7;
  wet += dist['水'] + dist['木'] * 0.7;
  dry += dist['火'] + dist['土'] * 0.7 + dist['金'] * 0.3;
  
  // 3. 粗略级别划分
  function level(v) {
    if (v >= 6) return '极';
    if (v >= 3) return '重';
    if (v >= 1) return '稍';
    return '无';
  }
  
  const climate = {
    coldScore: cold,
    hotScore: hot,
    wetScore: wet,
    dryScore: dry,
    coldLevel: level(cold),
    hotLevel: level(hot),
    wetLevel: level(wet),
    dryLevel: level(dry),
  };
  
  // 4. 给出一个主标签，方便调试/展示
  const pairs = [
    { key: '寒', score: cold },
    { key: '热', score: hot },
    { key: '湿', score: wet },
    { key: '燥', score: dry },
  ].sort((a, b) => b.score - a.score);
  
  climate.dominant = pairs[0].key;
  climate.second = pairs[1].score > 1 ? pairs[1].key : null;
  
  return climate;
}

/**
 * 根据季节和日主五行微调调候规则
 * @param {String} season - 季节
 * @param {String} dayMasterElement - 日主五行
 * @param {Array} baseNeed - 基础需要的五行
 * @param {Array} baseAvoid - 基础避免的五行
 * @returns {Object} { need: [...], avoid: [...] }
 */
function refineTiaohouBySeasonAndDay(season, dayMasterElement, baseNeed, baseAvoid) {
  const need = new Set(baseNeed);
  const avoid = new Set(baseAvoid);
  
  // 冬木、冬土、冬金、冬水 → 更急需火
  if (season === '冬') {
    if (['木', '土', '金', '水'].includes(dayMasterElement)) {
      need.add('火');
    }
  }
  
  // 夏金、夏火、夏土 → 更急需水
  if (season === '夏') {
    if (['金', '火', '土'].includes(dayMasterElement)) {
      need.add('水');
    }
  }
  
  // 秋金 → 既要火炼，又要水润
  if (season === '秋' && dayMasterElement === '金') {
    need.add('火');
    need.add('水');
  }
  
  // 春木 → 需要金修剪 + 火温暖
  if (season === '春' && dayMasterElement === '木') {
    need.add('金');
    need.add('火');
  }
  
  return {
    need: Array.from(need),
    avoid: Array.from(avoid),
  };
}

/**
 * 综合"气候类型 + 季节 + 日主五行"的调候规则
 * @param {String} season - 季节
 * @param {String} dayMasterElement - 日主五行
 * @param {Object} pillars - 四柱数据
 * @returns {Object} { need: [...], avoid: [...], climate: {...} }
 */
export function getTiaohouRules(season, dayMasterElement, pillars) {
  if (!pillars || !pillars.month) {
    return {
      need: [],
      avoid: [],
      climate: getClimateType(null, null)
    };
  }
  
  const monthBranch = pillars.month.branch;
  const climate = getClimateType(monthBranch, pillars);
  const { coldScore, hotScore, wetScore, dryScore } = climate;
  
  const need = new Set();
  const avoid = new Set();
  
  // 1. 处理寒 / 热 主矛盾
  if (coldScore - hotScore >= 2 && coldScore >= 3) {
    // 寒则暖之
    need.add('火');   // 第一调候：火
    need.add('土');   // 土可帮火、厚载
    avoid.add('水');  // 忌再加水
  } else if (hotScore - coldScore >= 2 && hotScore >= 3) {
    // 热则寒之
    need.add('水');   // 第一调候：水
    need.add('金');   // 金助水、兼有收敛
    avoid.add('火');  // 忌再添火
  }
  
  // 2. 处理湿 / 燥 次矛盾
  if (wetScore - dryScore >= 2 && wetScore >= 3) {
    // 湿则燥之
    need.add('火');
    need.add('土');   // 尤其是燥土（未戌），这里统一先记为"土"
    // 湿太重时，一般不喜水
    avoid.add('水');
  } else if (dryScore - wetScore >= 2 && dryScore >= 3) {
    // 燥则湿之
    need.add('水');
    need.add('土');   // 尤其是湿土（辰丑），同样先记为"土"
    // 燥重时，忌再来火
    avoid.add('火');
  }
  
  // 3. 如果四项都不算严重，至少给个"温和平衡"的微调
  if (need.size === 0 && avoid.size === 0) {
    // 略寒略湿 → 火、土小用之
    if (coldScore + wetScore > hotScore + dryScore) {
      need.add('火');
      need.add('土');
    } else if (hotScore + dryScore > coldScore + wetScore) {
      need.add('水');
      need.add('金');
    }
  }
  
  // 4. 叠加"季节 + 日主"的细调
  const refined = refineTiaohouBySeasonAndDay(
    season,
    dayMasterElement,
    Array.from(need),
    Array.from(avoid)
  );
  
  return {
    ...refined,
    climate,
  };
}

/**
 * 检查五行是否存在于四柱中
 * @param {String} element - 五行元素
 * @param {Object} pillars - 四柱数据
 * @returns {Boolean}
 */
export function isElementPresent(element, pillars) {
  if (!element || !pillars) return false;
  
  // 检查天干
  for (const pos of ['year', 'month', 'day', 'hour']) {
    const pillar = pillars[pos];
    if (!pillar) continue;
    
    if (STEM_ELEMENT[pillar.stem] === element) return true;
    if (BRANCH_ELEMENT[pillar.branch] === element) return true;
  }
  
  return false;
}

/**
 * 检查五行是否受制（有克制该五行的元素存在）
 * @param {String} element - 五行元素
 * @param {Object} pillars - 四柱数据
 * @returns {Boolean}
 */
export function isElementControlled(element, pillars) {
  if (!element || !pillars) return false;
  
  // 克我者（克制该五行的元素）
  const controller = CONTROLS[element];
  if (!controller) return false;
  
  return isElementPresent(controller, pillars);
}

/**
 * 评估季节调候（4分）
 * 检查调候用神是否到位，忌神是否受制
 * @param {String} season - 季节
 * @param {String} dayMasterElement - 日主五行
 * @param {Object} pillars - 四柱数据
 * @returns {Number} 0-4分
 */
export function evaluateSeasonTiaohou(season, dayMasterElement, pillars) {
  if (!season || !dayMasterElement || !pillars) return 0;
  
  const tiaohouRules = getTiaohouRules(season, dayMasterElement, pillars);
  let score = 0;
  
  // 调候用神是否到位
  for (const needElement of tiaohouRules.need) {
    if (isElementPresent(needElement, pillars)) {
      score += 2;
    }
  }
  
  // 忌神是否受制
  for (const avoidElement of tiaohouRules.avoid) {
    if (!isElementPresent(avoidElement, pillars) || isElementControlled(avoidElement, pillars)) {
      score += 1;
    }
  }
  
  return Math.min(4, score);
}

/**
 * 评估全局寒暖平衡（3分）
 * @param {Object} pillars - 四柱数据
 * @param {String} season - 季节
 * @returns {Number} 0-3分
 */
export function evaluateTemperatureBalance(pillars, season) {
  if (!pillars || !season) return 0;
  
  const monthBranch = pillars.month?.branch;
  if (!monthBranch) return 0;
  
  const climate = getClimateType(monthBranch, pillars);
  const { coldScore, hotScore } = climate;
  
  let score = 3; // 基础分
  
  // 寒热差距过大扣分
  const diff = Math.abs(coldScore - hotScore);
  if (diff >= 4) {
    score -= 2; // 严重失衡
  } else if (diff >= 2) {
    score -= 1; // 中等失衡
  }
  
  // 根据季节微调
  if (season === '冬' && coldScore > hotScore + 2) {
    score -= 0.5; // 冬季过寒
  } else if (season === '夏' && hotScore > coldScore + 2) {
    score -= 0.5; // 夏季过热
  }
  
  return Math.max(0, Math.min(3, Math.round(score * 10) / 10));
}

/**
 * 评估燥湿平衡（3分）
 * @param {Object} pillars - 四柱数据
 * @param {String} season - 季节
 * @returns {Number} 0-3分
 */
export function evaluateHumidityBalance(pillars, season) {
  if (!pillars || !season) return 0;
  
  const monthBranch = pillars.month?.branch;
  if (!monthBranch) return 0;
  
  const climate = getClimateType(monthBranch, pillars);
  const { wetScore, dryScore } = climate;
  
  let score = 3; // 基础分
  
  // 燥湿差距过大扣分
  const diff = Math.abs(wetScore - dryScore);
  if (diff >= 4) {
    score -= 2; // 严重失衡
  } else if (diff >= 2) {
    score -= 1; // 中等失衡
  }
  
  // 根据季节微调
  if (season === '春' && wetScore > dryScore + 2) {
    score -= 0.5; // 春季过湿
  } else if (season === '秋' && dryScore > wetScore + 2) {
    score -= 0.5; // 秋季过燥
  }
  
  return Math.max(0, Math.min(3, Math.round(score * 10) / 10));
}

/**
 * 生成调候四字标签
 * @param {Object} tiaohouResult - 调候规则结果 { need, avoid, climate }
 * @returns {String} 四字标签，如 "寒重喜火"、"燥重喜水"、"平和可補"
 */
export function generateTiaohouLabel(tiaohouResult) {
  if (!tiaohouResult || !tiaohouResult.climate) {
    return '平和可補';
  }
  
  const { climate, need } = tiaohouResult;
  const { dominant, coldScore, hotScore, wetScore, dryScore } = climate;
  
  // 寒重喜火
  if (coldScore >= 3 && need && need.includes('火')) {
    return '寒重喜火';
  }
  
  // 热重喜水
  if (hotScore >= 3 && need && need.includes('水')) {
    return '热重喜水';
  }
  
  // 燥重喜水
  if (dryScore >= 3 && need && need.includes('水')) {
    return '燥重喜水';
  }
  
  // 湿重喜火
  if (wetScore >= 3 && need && need.includes('火')) {
    return '湿重喜火';
  }
  
  // 平和可補
  if (Math.abs(coldScore - hotScore) < 2 && Math.abs(wetScore - dryScore) < 2) {
    return '平和可補';
  }
  
  // 默认：根据主倾向
  if (dominant === '寒') return '寒重喜火';
  if (dominant === '热') return '热重喜水';
  if (dominant === '燥') return '燥重喜水';
  if (dominant === '湿') return '湿重喜火';
  
  return '平和可補';
}

/**
 * 映射调候倾向
 * @param {Object} tiaohouResult - 调候规则结果
 * @returns {String} '寒' | '熱' | '燥' | '濕' | '平'
 */
export function mapTiaohouTendency(tiaohouResult) {
  if (!tiaohouResult || !tiaohouResult.climate) {
    return '平';
  }
  
  const { dominant } = tiaohouResult.climate;
  const map = {
    '寒': '寒',
    '热': '熱',
    '燥': '燥',
    '湿': '濕'
  };
  
  return map[dominant] || '平';
}

/**
 * 生成调候建议文本
 * @param {Object} tiaohouResult - 调候规则结果
 * @returns {String} 建议文本
 */
export function generateTiaohouSuggestion(tiaohouResult) {
  if (!tiaohouResult || !tiaohouResult.need || tiaohouResult.need.length === 0) {
    return '命局平和，可适当补益';
  }
  
  const needElements = tiaohouResult.need;
  const elementNames = {
    '火': '火',
    '水': '水',
    '土': '土',
    '金': '金',
    '木': '木'
  };
  
  const needText = needElements.map(el => elementNames[el] || el).join('、');
  return `命局偏${tiaohouResult.climate?.dominant || '失衡'}，宜行${needText}運以調候`;
}

