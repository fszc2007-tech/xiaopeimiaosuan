// 新增理由：官财格局卡片数据构建（从 index.js 拆分）
// 回滚方式：回退此文件，恢复 index.js 中的原方法

/**
 * 组装「官財格局」数据（纯函数）
 * 
 * @param {Object} structureResult - 格局分析结果
 * @param {Object} purityResult - 清浊分析结果
 * @param {Object} pogeResult - 破格结果
 * @param {Object} patternPurityResult - 格局纯度结果
 * @param {Object} dogongResult - 做功分析结果
 * @param {Object} wealthRootResult - 财星根气结果
 * @returns {Object} 官财格局数据
 */
export function buildGuancaiPattern(
  structureResult,
  purityResult,
  pogeResult,
  patternPurityResult,
  dogongResult,
  wealthRootResult
) {
  // 1. 提取 W 对象（十神权重）
  const W = structureResult.W || structureResult._internal?.W || {};
  
  // 14. 计算各字段值
  const officerScore = normalizeTo100((W.zGuan || 0) + (W.sha || 0));
  const wealthScore = normalizeTo100(W.cai || 0);
  
  // 15. 组装返回对象
  return {
    careerPattern: {
      officerType: determineOfficerType(W),
      structureTag: determineOfficerStructureTag(structureResult, pogeResult, patternPurityResult),
      strength: {
        score: officerScore,
        level: mapStrengthLevel(officerScore),
      },
    },
    wealthPattern: {
      wealthType: determineWealthType(W),
      strength: {
        score: wealthScore,
        level: mapStrengthLevel(wealthScore),
      },
      rooting: wealthRootResult?.rooting || '無根',
    },
    incomeMode: determineIncomeMode(W, dogongResult),
    stability: {
      career: determineCareerStability(purityResult, pogeResult, patternPurityResult),
      wealth: determineWealthStability(purityResult, pogeResult, patternPurityResult),
    },
    riskFactors: {
      tags: collectGuancaiRisks(pogeResult, patternPurityResult),
    },
    supportFactors: {
      tags: collectGuancaiSupports(patternPurityResult, dogongResult),
    },
    workPatterns: {
      mainLine: getMainWorkLine(dogongResult),
      relatedLines: getRelatedWorkLines(dogongResult),
    },
  };
}

/**
 * 标准化十神名称（防御性编程）
 */
export function normalizeGodName(name) {
  const TEN_GOD_NAMES = {
    '正官': '正官', '七杀': '七杀', '七殺': '七杀',
    '正财': '正财', '正財': '正财', '偏财': '偏财', '偏財': '偏财',
    '比肩': '比肩', '劫财': '劫财', '劫財': '劫财',
    '食神': '食神', '伤官': '伤官', '傷官': '伤官',
    '正印': '正印', '偏印': '偏印',
  };
  return TEN_GOD_NAMES[name] || name;
}

/**
 * 归一化到 0-100
 */
export function normalizeTo100(value) {
  if (value == null || isNaN(value)) return 0;
  if (value <= 1) return Math.round(value * 100);
  return Math.round(Math.min(100, value));
}

/**
 * 映射强度等级
 */
export function mapStrengthLevel(score) {
  if (score >= 80) return '很強';
  if (score >= 65) return '較強';
  if (score >= 50) return '中等';
  return '偏弱';
}

/**
 * 判断官杀类型
 */
export function determineOfficerType(W) {
  const guan = W.zGuan || 0;
  const sha = W.sha || 0;
  const total = guan + sha;
  
  if (total === 0) return '無明顯官星';
  
  const diff = Math.abs(guan - sha) / (total || 1);
  if (diff < 0.25) return '官殺並見';
  if (guan > sha) return guan > 0.3 ? '正官為主' : '官殺不顯';
  if (sha > guan) return sha > 0.3 ? '七殺為主' : '官殺不顯';
  return '官殺不顯';
}

/**
 * 判断官杀结构标签
 */
export function determineOfficerStructureTag(structureResult, pogeResult, patternPurityResult) {
  const structureName = structureResult.structure || '';
  const pogeFactors = pogeResult?.factors || [];
  const patternPogeFactors = patternPurityResult?.pogeFactors || [];
  const allFactors = [...pogeFactors, ...patternPogeFactors];
  
  // 优先用破格因素标签
  const officerPogeTypes = allFactors
    .filter(f => {
      const type = f.type || '';
      return type.includes('官') || type.includes('殺') || type.includes('杀');
    })
    .map(f => f.type);
  
  if (officerPogeTypes.includes('官杀混杂')) return '官殺混雜';
  if (officerPogeTypes.includes('杀重无制')) return '殺重無制';
  
  // 否则根据格局判断
  if (structureName.includes('官') || structureName.includes('殺') || structureName.includes('杀')) {
    if (structureName.includes('制') || structureName.includes('印')) return '官殺有制';
    return '官殺格';
  }
  
  return '官殺不顯';
}

/**
 * 判断财星类型
 */
export function determineWealthType(W) {
  const zheng = W.cai ? (W.cai * 0.5) : 0;  // 简化：假设正财偏财各占一半
  const pian = W.cai ? (W.cai * 0.5) : 0;
  const bi = W.bi || 0;
  
  if (W.cai === 0 || (zheng + pian === 0)) {
    if (bi > 0.3) return '比劫奪財';
    return '財弱';
  }
  
  const diff = Math.abs(zheng - pian);
  if (zheng > pian && diff > 0.1) return '正財為主';
  if (pian > zheng && diff > 0.1) return '偏財為主';
  if (bi > W.cai) return '比劫奪財';
  return '財官均衡';
}

/**
 * 获取主做功线（加强防守）
 */
export function getMainWorkLine(dogongResult) {
  if (!dogongResult?.coreLine) return '';
  
  const type = dogongResult.coreLine.type;
  if (typeof type === 'string' && type.trim()) {
    return type.trim();
  }
  if (typeof type === 'object' && type.type && typeof type.type === 'string') {
    return type.type.trim();
  }
  return '';
}

/**
 * 获取相关做功线
 */
export function getRelatedWorkLines(dogongResult) {
  const summary = dogongResult?.workTypeSummary;
  if (!summary || typeof summary !== 'object') return [];
  return Object.keys(summary)
    .filter(key => typeof key === 'string' && key.trim() !== '' && key !== '未知' && !key.startsWith('_'))
    .filter(type => type.includes('官') || type.includes('財') || type.includes('财') ||
                    type.includes('食傷') || type.includes('食伤') || type.includes('印比'))
    .map(key => key.trim());
}

/**
 * 判断赚钱模式
 */
export function determineIncomeMode(W, dogongResult) {
  const guanSha = W.guan || 0;
  const cai = W.cai || 0;
  const biJie = W.bi || 0;
  const shiShang = W.shi || 0;
  
  const mainLine = getMainWorkLine(dogongResult);
  const tags = [];
  let mainMode = '穩定工資型';
  
  if (guanSha >= 0.4 && cai >= 0.3 && shiShang < 0.3) {
    mainMode = '穩定工資型';
    tags.push('適合體制內');
  } else if (shiShang >= 0.4 && cai >= 0.3) {
    mainMode = '浮動績效型';
    tags.push('適合銷售/業績制');
  } else if (cai >= 0.4 && biJie < 0.3 && shiShang >= 0.3) {
    mainMode = '機會偏財型';
    tags.push('適合對接項目/資源');
  } else if (biJie >= 0.4 && cai >= 0.3) {
    mainMode = '創業經營型';
    tags.push('適合合夥/經營');
  }
  
  if (mainLine.includes('食傷生財') || mainLine.includes('食伤生财')) {
    if (mainMode === '穩定工資型') mainMode = '浮動績效型';
    tags.push('靠能力變現');
  }
  
  if (mainLine.includes('印比護官') || mainLine.includes('印比护官')) {
    tags.push('適合專業技術線');
  }
  
  return { mainMode, tags: Array.from(new Set(tags)) };
}

/**
 * 推导事业稳定度
 */
export function determineCareerStability(purityResult, pogeResult, patternPurityResult) {
  const pogeFactors = pogeResult?.factors || [];
  const patternPogeFactors = patternPurityResult?.pogeFactors || [];
  const allFactors = [...pogeFactors, ...patternPogeFactors];
  
  // 统计官杀相关破格
  const officerPogeCount = allFactors.filter(f => {
    const type = f.type || '';
    return type.includes('官') || type.includes('殺') || type.includes('杀');
  }).length;
  
  // 计算混乱度
  const baseChaos = (100 - (purityResult?.score || 50)) / 100;
  const pogePenalty = Math.min(0.5, officerPogeCount / 3 * 0.5);
  const chaosScore = Math.min(1, baseChaos * 0.5 + pogePenalty);
  
  // 判断稳定度
  if (chaosScore < 0.2 && officerPogeCount === 0) return '穩定';
  if (chaosScore < 0.4) return '偏穩';
  if (chaosScore < 0.7) return '多變';
  return '多波折';
}

/**
 * 推导财运稳定度
 */
export function determineWealthStability(purityResult, pogeResult, patternPurityResult) {
  const pogeFactors = pogeResult?.factors || [];
  const patternPogeFactors = patternPurityResult?.pogeFactors || [];
  const allFactors = [...pogeFactors, ...patternPogeFactors];
  
  // 统计财星相关破格
  const wealthPogeCount = allFactors.filter(f => {
    const type = f.type || '';
    return type.includes('財') || type.includes('财') || type.includes('比劫');
  }).length;
  
  // 计算混乱度
  const baseChaos = (100 - (purityResult?.score || 50)) / 100;
  const pogePenalty = Math.min(0.5, wealthPogeCount / 3 * 0.5);
  const chaosScore = Math.min(1, baseChaos * 0.5 + pogePenalty);
  
  // 判断稳定度
  if (chaosScore < 0.2 && wealthPogeCount === 0) return '穩定';
  if (chaosScore < 0.4) return '偏穩';
  if (chaosScore < 0.7) return '起伏大';
  return '周期波動';
}

/**
 * 收集官财风险因素
 */
export function collectGuancaiRisks(pogeResult, patternPurityResult) {
  const pogeFactors = pogeResult?.factors || [];
  const patternPogeFactors = patternPurityResult?.pogeFactors || [];
  const allFactors = [...pogeFactors, ...patternPogeFactors];
  
  const riskTypes = new Set();
  allFactors.forEach(f => {
    const type = f.type || '';
    if (type.includes('官') || type.includes('殺') || type.includes('杀') ||
        type.includes('財') || type.includes('财') || type.includes('比劫')) {
      riskTypes.add(type);
    }
  });
  
  return Array.from(riskTypes);
}

/**
 * 收集官财助力因素
 */
export function collectGuancaiSupports(patternPurityResult, dogongResult) {
  const supportTypes = new Set();
  
  // 从 patternPurityResult 的救应因素中提取
  const rescueFactors = patternPurityResult?.rescueFactors || [];
  rescueFactors.forEach(f => {
    const type = f.type || '';
    if (type.includes('官') || type.includes('殺') || type.includes('杀') ||
        type.includes('財') || type.includes('财') ||
        type.includes('食傷') || type.includes('食伤') ||
        type.includes('印比')) {
      supportTypes.add(type);
    }
  });
  
  // 从 dogongResult 的做功类型中提取
  const mainLine = getMainWorkLine(dogongResult);
  if (mainLine && (mainLine.includes('食傷') || mainLine.includes('食伤') ||
                   mainLine.includes('財') || mainLine.includes('财') ||
                   mainLine.includes('印比') || mainLine.includes('官'))) {
    supportTypes.add(mainLine);
  }
  
  const workTypeSummary = dogongResult?.workTypeSummary;
  if (workTypeSummary && typeof workTypeSummary === 'object') {
    Object.keys(workTypeSummary).forEach(type => {
      if (type && typeof type === 'string' && type !== '未知' && !type.startsWith('_')) {
        if (type.includes('官') || type.includes('財') || type.includes('财') ||
            type.includes('食傷') || type.includes('食伤') || type.includes('印比')) {
          supportTypes.add(type);
        }
      }
    });
  }
  
  return Array.from(supportTypes);
}

