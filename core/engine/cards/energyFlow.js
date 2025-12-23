// 新增理由：能量流通卡片数据构建（从 index.js 拆分）
// 回滚方式：回退此文件，恢复 index.js 中的原方法

/**
 * 组装「能量流通」数据
 * 
 * @param {Object} structureResult - 格局分析结果
 * @param {Object} strengthResult - 日主强弱结果
 * @param {Object} favoredAvoid - 喜用神结果
 * @param {Object} wuxingPercent - 五行百分比
 * @param {Object} dogongResult - 做功分析结果
 * @param {Object} patternPurityResult - 格局纯度结果
 * @param {Object} purityResult - 清浊分析结果
 * @param {Object} helpers - 辅助函数对象 { extractWorkPatternTags }
 * @returns {Object} 能量流通指标
 */
export function buildEnergyFlowMetrics(
  structureResult,
  strengthResult,
  favoredAvoid,
  wuxingPercent,
  dogongResult,
  patternPurityResult,
  purityResult,
  helpers = {}
) {
  // 1. 提取 W 对象（十神权重）
  const W = structureResult.W || structureResult._internal?.W || {};
  
  // 2. 映射日主强弱等级
  const dmStrengthLevel = mapDmStrengthLevelForEnergyFlow(strengthResult?.band);
  
  // 3. 生成用神总结
  const yongshenSummary = generateYongshenSummary(favoredAvoid);
  
  // 4. 生成五行平衡总结
  const wuxingBalanceSummary = generateWuxingBalanceSummary(wuxingPercent);
  
  // 5. 构建做功路径
  const allWorkPaths = buildWorkPaths(W, dogongResult, patternPurityResult, helpers);
  const taggedPathLabels = collectTaggedPathLabels(dogongResult, patternPurityResult, helpers);
  const { coreWorkPaths, otherWorkPaths } = splitWorkPaths(allWorkPaths, taggedPathLabels);
  
  // 6. 构建主要流通方向
  const mainFlowDirections = buildMainFlowDirections(coreWorkPaths);
  
  // 7. 计算流通度分数
  const flowScore = calcFlowScore(wuxingPercent, allWorkPaths);
  const flowLevel = mapFlowLevelForEnergyFlow(flowScore);
  
  // 8. 生成风险标志和提示
  const { riskFlags, notes } = generateRiskFlags(W, allWorkPaths);
  
  // 9. 生成一句话总结
  const summary = buildEnergyFlowSummary({
    flowLevel,
    coreWorkPaths,
    riskFlags,
  });
  
  // 10. 组装返回对象
  return {
    dmStrengthLevel,
    structure: structureResult.structure || '未知格局',
    yongshenSummary,
    wuxingBalanceSummary,
    workPathCount: allWorkPaths.length,
    coreWorkPaths,
    otherWorkPaths,
    flowScore,
    flowLevel,
    mainFlowDirections,
    summary,
    riskFlags,
    notes,
    // 调试用（可选）
    debug: {
      wuxingWeights: wuxingPercent,
      tenGodWeights: W,
      patternTags: helpers.extractWorkPatternTags ? helpers.extractWorkPatternTags(dogongResult) : [],
      rescueTags: (patternPurityResult?.rescueFactors || []).map(f => f.type || f).filter(Boolean),
    },
  };
}

/**
 * 映射日主强弱等级（用于能量流通）
 */
export function mapDmStrengthLevelForEnergyFlow(band) {
  if (!band) return '中和';
  if (band === '从弱' || band === '身弱') return '偏弱';
  if (band === '平衡') return '中和';
  if (band === '身强' || band === '从强') return '偏强';
  return '中和';
}

/**
 * 映射流通等级（用于能量流通）
 */
export function mapFlowLevelForEnergyFlow(score) {
  if (score >= 70) return '流通順暢';
  if (score >= 40) return '整體尚可';
  return '局部堵塞';
}

/**
 * 生成用神总结
 */
export function generateYongshenSummary(favoredAvoid) {
  if (!favoredAvoid) return '用神不显';
  
  const favored = favoredAvoid.favored || [];
  const avoid = favoredAvoid.avoid || [];
  
  if (favored.length === 0 && avoid.length === 0) {
    return '用神不显';
  }
  
  const favoredStr = favored.length > 0 ? `用神偏${favored.join('、')}` : '';
  const avoidStr = avoid.length > 0 ? `忌${avoid.join('、')}` : '';
  
  if (favoredStr && avoidStr) {
    return `${favoredStr}，${avoidStr}`;
  } else if (favoredStr) {
    return favoredStr;
  } else {
    return avoidStr;
  }
}

/**
 * 生成五行平衡总结
 */
export function generateWuxingBalanceSummary(wuxingPercent) {
  if (!wuxingPercent) return '五行相对均衡';
  
  const elements = ['木', '火', '土', '金', '水'];
  const sorted = elements
    .map(el => ({ element: el, percent: wuxingPercent[el] || 0 }))
    .sort((a, b) => b.percent - a.percent);
  
  const strong = sorted.filter(s => s.percent >= 25).map(s => s.element);
  const weak = sorted.filter(s => s.percent < 15).map(s => s.element);
  
  let summary = '';
  if (strong.length > 0) {
    summary += `五行偏${strong.join('、')}`;
  }
  if (weak.length > 0) {
    summary += summary ? `，${weak.join('、')}偏弱` : `${weak.join('、')}偏弱`;
  }
  
  return summary || '五行相对均衡';
}

/**
 * 收集已标记的路径标签
 */
export function collectTaggedPathLabels(dogongResult, patternPurityResult, helpers = {}) {
  const taggedLabels = new Set();
  
  // 1. 从 dogongResult.strongestPaths 中提取已有路径名称
  if (dogongResult?.strongestPaths) {
    dogongResult.strongestPaths.forEach(path => {
      if (path.path && path.relations) {
        const pathName = helpers.generateWorkLineName 
          ? helpers.generateWorkLineName(path.path, path.relations)
          : null;
        if (pathName) {
          taggedLabels.add(pathName);
        }
      }
    });
  }
  
  // 2. 从 patternPurityResult.rescueFactors 中提取救应标签
  if (patternPurityResult?.rescueFactors) {
    patternPurityResult.rescueFactors.forEach(factor => {
      const type = factor.type || '';
      if (type.includes('食神制杀') || type.includes('印星化杀') || 
          type.includes('印比护官') || type.includes('官星制劫') ||
          type.includes('食神制殺') || type.includes('印星化殺') ||
          type.includes('印比護官') || type.includes('官星制劫')) {
        taggedLabels.add(type);
      }
    });
  }
  
  return taggedLabels;
}

/**
 * 路径模板配置
 */
const WORK_PATH_CONFIG = [
  // 生助类（productive）
  { id: 'shi-cai', label: '食伤生财', type: 'productive', from: 'shi', to: 'cai' },
  { id: 'cai-guan', label: '财生官', type: 'productive', from: 'cai', to: 'guan' },
  { id: 'guan-yin', label: '官印相生', type: 'productive', from: 'guan', to: 'yin' },
  { id: 'yin-bi', label: '印比护身', type: 'productive', from: 'yin', to: 'bi' },
  
  // 救应类（rescue）
  { id: 'yin-bi-guan', label: '印比护官', type: 'rescue', from: 'yin', to: 'guan' },
  { id: 'shi-zhi-sha', label: '食神制杀', type: 'rescue', from: 'shi', to: 'guan' },
  { id: 'yin-hua-sha', label: '印星化杀', type: 'rescue', from: 'yin', to: 'guan' },
  
  // 冲突类（conflict）
  { id: 'shang-guan-guan', label: '伤官见官', type: 'conflict', from: 'shi', to: 'guan' },
  { id: 'bi-duo-cai', label: '比劫夺财', type: 'conflict', from: 'bi', to: 'cai' },
  { id: 'cai-huai-yin', label: '财星坏印', type: 'conflict', from: 'cai', to: 'yin' },
  
  // 克制类（control）
  { id: 'guan-ke-shen', label: '官杀克身', type: 'control', from: 'guan', to: 'bi' },
  { id: 'shen-ke-cai', label: '身克财星', type: 'control', from: 'bi', to: 'cai' },
];

/**
 * 十神名称映射
 */
function mapTenGodName(key) {
  const map = {
    'shi': '食伤',
    'cai': '财星',
    'guan': '官杀',
    'yin': '印星',
    'bi': '比劫',
  };
  return map[key] || key;
}

/**
 * 构建做功路径数组
 */
export function buildWorkPaths(W, dogongResult, patternPurityResult, helpers = {}) {
  const paths = [];
  
  // 收集已标记的路径标签
  const taggedPathLabels = collectTaggedPathLabels(dogongResult, patternPurityResult, helpers);
  
  // 遍历路径模板，判断是否有效
  for (const cfg of WORK_PATH_CONFIG) {
    // 判断是否在已有标签中命中（优先）
    const tagged = taggedPathLabels.has(cfg.label);
    
    // 看 from/to 两个十神是否有足够权重
    const fromW = W[cfg.from] ?? 0;
    const toW = W[cfg.to] ?? 0;
    const strength = Math.min(fromW, toW);  // 简单起步：取较弱一方作为链路强度
    
    // 判断是否有效路径
    if (tagged || strength > 0.5) {
      // 生成方向描述
      const direction = `${mapTenGodName(cfg.from)} → ${mapTenGodName(cfg.to)}`;
      
      // 生成备注
      const notes = [];
      if (fromW < 0.3) notes.push(`${mapTenGodName(cfg.from)}略偏弱`);
      if (toW < 0.3) notes.push(`${mapTenGodName(cfg.to)}略偏弱`);
      if (fromW > 0.7) notes.push(`${mapTenGodName(cfg.from)}较强`);
      if (toW > 0.7) notes.push(`${mapTenGodName(cfg.to)}较强`);
      
      paths.push({
        id: cfg.id,
        label: cfg.label,
        type: cfg.type,
        strength: Math.min(1, strength),
        direction,
        notes: notes.length > 0 ? notes : undefined,
      });
    }
  }
  
  // 按 strength 排序
  paths.sort((a, b) => b.strength - a.strength);
  
  return paths;
}

/**
 * 拆分核心路径和其他路径
 */
export function splitWorkPaths(paths, taggedPathLabels) {
  const coreWorkPaths = [];
  const otherWorkPaths = [];
  
  for (const path of paths) {
    // 判断是否在标签中命中（优先）
    const isTagged = taggedPathLabels.has(path.label);
    
    // 核心路径条件：前 1–3 条，且满足以下任一条件：
    // 1. strength >= 0.7（强度足够）
    // 2. 在 pattern/rescue 标签中有命中（算法已识别）
    if (coreWorkPaths.length < 3 && 
        (path.strength >= 0.7 || isTagged)) {
      coreWorkPaths.push(path);
    } else {
      otherWorkPaths.push(path);
    }
  }
  
  // 兜底：如果所有路径都不满足条件，至少取前 1 条作为核心路径（避免空数组）
  if (coreWorkPaths.length === 0 && paths.length > 0) {
    coreWorkPaths.push(paths[0]);
  }
  
  return { coreWorkPaths, otherWorkPaths };
}

/**
 * 构建主要流通方向
 */
export function buildMainFlowDirections(corePaths) {
  const result = [];
  
  // 规则1：食伤→财→官
  const hasShiCai = corePaths.find(p => p.id === 'shi-cai');
  const hasCaiGuan = corePaths.find(p => p.id === 'cai-guan');
  if (hasShiCai && hasCaiGuan) {
    result.push({
      id: 'shi-cai-guan',
      label: '从食伤 → 财星 → 官杀',
      weight: (hasShiCai.strength + hasCaiGuan.strength) / 2,
    });
  }
  
  // 规则2：官杀→印星→日主
  const hasGuanYin = corePaths.find(p => p.id === 'guan-yin');
  const hasYinBi = corePaths.find(p => p.id === 'yin-bi');
  if (hasGuanYin && hasYinBi) {
    result.push({
      id: 'guan-yin-rizu',
      label: '从官杀 → 印星 → 日主',
      weight: (hasGuanYin.strength + hasYinBi.strength) / 2,
    });
  }
  
  // 规则3：印比→食伤→财
  const hasYinBi2 = corePaths.find(p => p.id === 'yin-bi');
  const hasShiCai2 = corePaths.find(p => p.id === 'shi-cai');
  if (hasYinBi2 && hasShiCai2 && hasYinBi2.id !== hasYinBi?.id) {
    result.push({
      id: 'yin-bi-shi-cai',
      label: '从印比 → 食伤 → 财星',
      weight: (hasYinBi2.strength + hasShiCai2.strength) / 2,
    });
  }
  
  // 兜底：如果没找到复合路径，使用单条路径的 direction 作为方向
  if (result.length === 0) {
    for (const p of corePaths.slice(0, 2)) {
      result.push({
        id: p.id,
        label: p.direction,
        weight: p.strength,
      });
    }
  }
  
  return result.slice(0, 2); // 最多给 LLM 2 条主要方向
}

/**
 * 计算流通度分数
 */
export function calcFlowScore(wuxingWeights, workPaths) {
  // 1. 五行均衡度：越平均分越高
  const wuxingScore = calcBalanceScore(wuxingWeights); // 0–100
  
  // 2. 正向做功路径强度
  const productivePaths = workPaths.filter(p => p.type === 'productive');
  const productiveScore = avgTopK(
    productivePaths.map(p => p.strength), 
    3
  ) * 100;
  
  // 3. 救应路径（Phase 1：使用条数计算）
  const rescuePaths = workPaths.filter(p => p.type === 'rescue');
  const rescueScore = Math.min(100, rescuePaths.length * 15);
  
  // 4. 冲突 / 堵塞惩罚
  const conflictPaths = workPaths.filter(p => p.type === 'conflict');
  const conflictScore = avgTopK(
    conflictPaths.map(p => p.strength), 
    2
  ) * 100;
  // 惩罚计算：conflictScore * 0.6 最高扣 60 分，再乘以 0.5，实际最多扣 30 分
  const penalty = conflictScore * 0.6;
  
  // 5. 综合计算
  const raw =
    wuxingScore * 0.3 +
    productiveScore * 0.4 +
    rescueScore * 0.2 -
    penalty * 0.5;
  
  // 返回整数，与其他分数字段保持一致（如 dayMasterStrength.score）
  return Math.round(clamp(raw, 0, 100));
}

/**
 * 计算五行均衡度
 */
export function calcBalanceScore(wuxingWeights) {
  if (!wuxingWeights) return 50; // 默认中等
  
  const values = Object.values(wuxingWeights);
  if (values.length === 0) return 50;
  
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  
  // 标准差越小，均衡度越高
  // 假设标准差 0–20 映射到 0–100 分
  return Math.max(0, Math.min(100, 100 - stdDev * 5));
}

/**
 * 取前 K 个值的平均值
 */
export function avgTopK(arr, k) {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => b - a);
  const topK = sorted.slice(0, k);
  return topK.reduce((a, b) => a + b, 0) / topK.length;
}

/**
 * 限制数值范围
 */
export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/**
 * 生成风险标志和提示
 */
export function generateRiskFlags(W, workPaths) {
  const riskFlags = [];
  const notes = [];
  
  // 规则1：思考多行动少
  if (W.shi > 0.5 && (W.cai < 0.3 || W.guan < 0.3)) {
    riskFlags.push('思考多行动少');
    notes.push('食伤强但财官弱，容易停留在头脑中，需要加强落地执行');
  }
  
  // 规则2：易过度自我消耗（Phase 1：使用条数判断）
  const conflictPaths = workPaths.filter(p => p.type === 'conflict');
  if (conflictPaths.length >= 2) {
    riskFlags.push('易过度自我消耗');
    notes.push('存在多条冲突路径，容易在高压下一边冲一边卡，需要注意节奏');
  }
  
  // 规则3：能量容易卡在某个环节
  const productivePaths = workPaths.filter(p => p.type === 'productive');
  if (productivePaths.length === 0) {
    riskFlags.push('能量容易卡在某个环节');
    notes.push('缺少正向做功路径，能量流通不畅');
  }
  
  // 规则4：输出过多但缺少承接
  if (W.shi > 0.6 && W.cai < 0.2) {
    riskFlags.push('输出过多但缺少承接');
    notes.push('食伤过旺但财星偏弱，容易想法多但变现难');
  }
  
  // 规则5：控制欲过强
  if (W.guan > 0.6 && W.yin < 0.2) {
    riskFlags.push('控制欲过强');
    notes.push('官杀过旺但印星偏弱，容易压力大但缺少内在支撑');
  }
  
  return { riskFlags, notes };
}

/**
 * 生成能量流通一句话总结
 */
export function buildEnergyFlowSummary(metrics) {
  const { flowLevel, coreWorkPaths, riskFlags } = metrics;
  
  // 获取最强路径
  const mainPath = coreWorkPaths && coreWorkPaths.length > 0 
    ? coreWorkPaths[0].label 
    : null;
  
  // 获取首个风险标志（如果有）
  const risk = riskFlags && riskFlags.length > 0 ? riskFlags[0] : null;
  
  // 根据流通等级生成总结
  const levelText = flowLevel; // 流通顺畅 / 整体尚可 / 局部堵塞
  
  // 规则版本：基于 flowLevel + 最强核心路径 + 首个风险标志
  // flowLevel 已经包含"整体"等修饰词（流通顺畅/整体尚可/局部堵塞），不需要再加前缀
  if (risk && mainPath) {
    return `${levelText}，以「${mainPath}」为主轴，容易在「${risk}」这一环节卡住。`;
  } else if (mainPath) {
    return `${levelText}，能量主要通过「${mainPath}」流动。`;
  } else {
    return `整體${levelText}，能量流通以內外轉換為主。`;
  }
}

