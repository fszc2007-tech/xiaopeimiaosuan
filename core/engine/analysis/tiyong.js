/**
 * 体用承载度分析
 * Body-Use Carrying Capacity Analysis
 * 
 * 职责：
 * - 定义体（印星、比劫、食伤）和用（财星、官杀）
 * - 计算体势（自我能力基础）
 * - 计算通关度（体用转化能力）
 * - 计算破坏扣分（体用冲突损耗）
 * - 计算承载度 C = min(体势, 1) × 通关度 × (1 - 破坏扣分)
 * 
 * @param {Object} pillars - 四柱数据
 * @param {Object} strengthMap - 十神强度映射（来自 dogong 分析）
 * @param {Object} graph - 关系图（来自 dogong 分析）
 * @param {Object} options - 选项
 * @returns {Object} 体用承载度分析结果
 */

// ========== 常量定义 ==========

/**
 * 体用定义
 * 体：自我能力、资源基础（印、比劫、食伤）
 * 用：外部目标、成就（财、官杀）
 */
const BODY_GODS = ['比肩', '劫财', '食神', '伤官', '正印', '偏印'];
const USE_GODS = ['正财', '偏财', '正官', '七杀'];

/**
 * 通关路径定义
 * [体神类型, 用神类型, 关系类型, 权重]
 */
const PASS_THROUGH_PATTERNS = [
  // 食伤生财：能力→财富（最顺畅）
  [['食神', '伤官'], ['正财', '偏财'], '生', 1.2],
  // 财生官杀：财富→地位（正常通关）
  [['正财', '偏财'], ['正官', '七杀'], '生', 1.0],
  // 印化官杀：智慧消化压力（印缓冲官杀）
  [['正印', '偏印'], ['正官', '七杀'], '生', 0.9],
  // 比劫担财：同伴分担财富（需要合作）
  [['比肩', '劫财'], ['正财', '偏财'], '克', 0.8]
];

/**
 * 破坏模式定义
 * [破坏者类型, 受害者类型, 关系类型, 权重]
 */
const DESTRUCTION_PATTERNS = [
  // 官杀克身：压力损害自身（最严重）
  [['正官', '七杀'], ['比肩', '劫财'], '克', 1.2],
  // 财坏印：财富损害品德/学业
  [['正财', '偏财'], ['正印', '偏印'], '克', 1.0],
  // 食伤泄身：才华消耗精力
  [['食神', '伤官'], ['比肩', '劫财'], '生', 0.8]
];

/**
 * 承载度等级
 */
const CAPACITY_LEVELS = {
  '极高': { min: 0.85, max: 1.0 },
  '高': { min: 0.70, max: 0.85 },
  '中上': { min: 0.55, max: 0.70 },
  '中等': { min: 0.40, max: 0.55 },
  '中下': { min: 0.25, max: 0.40 },
  '低': { min: 0.10, max: 0.25 },
  '极低': { min: 0.0, max: 0.10 }
};

export function analyzeTiyong(pillars, strengthMap, graph, options = {}) {
  console.log('[TiyongAnalysis] 开始体用承载度分析');
  
  // 1. 计算体势
  const bodyStrength = calculateBodyStrength(strengthMap);
  
  // 2. 计算用势
  const useStrength = calculateUseStrength(strengthMap);
  
  // 3. 计算通关度
  const passThroughDegree = calculatePassThroughDegree(strengthMap, graph);
  
  // 4. 计算破坏扣分
  const destructionPenalty = calculateDestructionPenalty(strengthMap, graph);
  
  // 5. 计算承载度
  const carryingCapacity = calculateCarryingCapacity(
    bodyStrength,
    passThroughDegree,
    destructionPenalty
  );
  
  // 6. 评估等级
  const capacityLevel = evaluateCapacityLevel(carryingCapacity);
  
  // 7. 生成解读
  const interpretation = getCapacityInterpretation(carryingCapacity, capacityLevel);
  
  const result = {
    version: '1.0.0',
    carryingCapacity,
    bodyStrength: bodyStrength.normalized,
    useStrength,
    passThroughDegree: passThroughDegree.degree,
    destructionPenalty: destructionPenalty.penalty,
    capacityLevel,
    interpretation,
    details: {
      bodyDetails: bodyStrength,
      passThroughDetails: passThroughDegree,
      destructionDetails: destructionPenalty
    },
    timestamp: Date.now()
  };
  
  console.log('[TiyongAnalysis] 分析完成，承载度:', carryingCapacity.toFixed(3), '等级:', capacityLevel);
  
  return result;
}

/**
 * 计算体势（自我能力基础）
 */
function calculateBodyStrength(strengthMap) {
  let bodyTotal = 0;
  const components = {};
  
  for (const god of BODY_GODS) {
    const strength = strengthMap[god] || 0;
    bodyTotal += strength;
    components[god] = strength;
  }
  
  // 归一化（使用软归一化，scale = 2.0）
  const normalized = Math.min(1.0, bodyTotal / 2.0);
  
  return {
    raw: bodyTotal,
    normalized: normalized,
    components: components
  };
}

/**
 * 计算用势（外部目标强度）
 */
function calculateUseStrength(strengthMap) {
  let useTotal = 0;
  
  for (const god of USE_GODS) {
    useTotal += strengthMap[god] || 0;
  }
  
  // 归一化
  return Math.min(1.0, useTotal / 2.0);
}

/**
 * 计算通关度（体用转化能力）
 */
function calculatePassThroughDegree(strengthMap, graph) {
  const passThroughPaths = [];
  let totalScore = 0;
  let maxPossibleScore = 0;
  
  // 遍历所有通关路径定义
  for (const [bodyTypes, useTypes, relationType, weight] of PASS_THROUGH_PATTERNS) {
    for (const bodyGod of bodyTypes) {
      for (const useGod of useTypes) {
        maxPossibleScore += weight;
        
        // 评估通关路径强度
        const pathScore = evaluatePassThroughPath(
          bodyGod,
          useGod,
          relationType,
          strengthMap,
          graph
        );
        
        if (pathScore > 0) {
          const weightedScore = pathScore * weight;
          passThroughPaths.push({
            path: `${bodyGod}→${useGod}`,
            relation: relationType,
            score: pathScore,
            weight,
            weightedScore
          });
          totalScore += weightedScore;
        }
      }
    }
  }
  
  // 计算平均通关度
  const degree = maxPossibleScore > 0 ? totalScore / maxPossibleScore : 0.5;
  
  console.log('[TiyongAnalysis] 通关度计算:');
  console.log('  发现路径:', passThroughPaths.length, '条');
  passThroughPaths.forEach(p => {
    console.log(`  ${p.path}(${p.relation}): ${p.score.toFixed(3)} × ${p.weight} = ${p.weightedScore.toFixed(3)}`);
  });
  console.log('  总得分:', totalScore.toFixed(3));
  console.log('  最大得分:', maxPossibleScore.toFixed(3));
  console.log('  通关度:', degree.toFixed(3));
  
  return {
    degree,
    paths: passThroughPaths,
    totalScore,
    maxScore: maxPossibleScore
  };
}

/**
 * 评估通关路径强度
 * @param {String} startGod - 起始十神
 * @param {String} endGod - 目标十神
 * @param {String} expectedRelation - 期望关系
 * @param {Object} strengthMap - 十神强度映射
 * @param {Object} graph - 关系图
 * @returns {Number} 路径强度
 */
function evaluatePassThroughPath(startGod, endGod, expectedRelation, strengthMap, graph) {
  // 检查直接关系
  const directScore = checkDirectRelation(
    startGod,
    endGod,
    expectedRelation,
    strengthMap,
    graph
  );
  
  if (directScore > 0) {
    return directScore;
  }
  
  // 检查间接关系（通过一个中间节点）
  const indirectScore = checkIndirectRelation(
    startGod,
    endGod,
    expectedRelation,
    strengthMap,
    graph
  );
  
  return indirectScore * 0.8; // 间接关系打八折
}

/**
 * 检查直接关系
 * @param {String} godA - 十神A
 * @param {String} godB - 十神B
 * @param {String} expectedRelation - 期望关系
 * @param {Object} strengthMap - 十神强度映射
 * @param {Object} graph - 关系图
 * @returns {Number} 关系强度
 */
function checkDirectRelation(godA, godB, expectedRelation, strengthMap, graph) {
  if (!graph || !graph.edges) return 0;
  
  // 在边列表中查找匹配的关系
  for (const edge of graph.edges) {
    const fromShishen = edge.from.includes('_') ? edge.from.split('_')[1] : edge.from;
    const toShishen = edge.to.includes('_') ? edge.to.split('_')[1] : edge.to;
    
    if (fromShishen === godA && toShishen === godB && edge.relation === expectedRelation) {
      // 计算关系强度：两端强度的几何平均
      const strengthA = strengthMap[edge.from] || 0;
      const strengthB = strengthMap[edge.to] || 0;
      return Math.sqrt(strengthA * strengthB);
    }
  }
  
  return 0;
}

/**
 * 检查间接关系（通过中间节点）
 * @param {String} startGod - 起始十神
 * @param {String} endGod - 目标十神
 * @param {String} expectedRelation - 期望关系
 * @param {Object} strengthMap - 十神强度映射
 * @param {Object} graph - 关系图
 * @returns {Number} 关系强度
 */
function checkIndirectRelation(startGod, endGod, expectedRelation, strengthMap, graph) {
  if (!graph || !graph.nodes) return 0;
  
  let maxScore = 0;
  
  // 遍历所有可能的中间节点
  for (const middleNode of graph.nodes) {
    const middleShishen = middleNode.id.includes('_') ? middleNode.id.split('_')[1] : middleNode.id;
    
    // 检查 start → middle 和 middle → end 的关系
    const score1 = checkDirectRelation(startGod, middleShishen, '生', strengthMap, graph);
    const score2 = checkDirectRelation(middleShishen, endGod, expectedRelation, strengthMap, graph);
    
    if (score1 > 0 && score2 > 0) {
      const pathScore = Math.sqrt(score1 * score2);
      maxScore = Math.max(maxScore, pathScore);
    }
  }
  
  return maxScore;
}

/**
 * 检查图中是否存在指定关系（保留作为辅助函数）
 */
function checkRelationInGraph(graph, from, to, relationType) {
  return checkDirectRelation(from, to, relationType, {}, graph) > 0;
}

/**
 * 计算破坏扣分
 */
function calculateDestructionPenalty(strengthMap, graph) {
  const destructionPatterns = [];
  let totalPenalty = 0;
  
  // 遍历所有破坏模式定义
  for (const [destroyers, victims, relationType, weight] of DESTRUCTION_PATTERNS) {
    for (const destroyer of destroyers) {
      for (const victim of victims) {
        // 评估破坏模式强度
        const destructionScore = evaluateDestruction(
          destroyer,
          victim,
          relationType,
          strengthMap,
          graph
        );
        
        if (destructionScore > 0) {
          const weightedScore = destructionScore * weight;
          destructionPatterns.push({
            pattern: `${destroyer}克${victim}`,
            relation: relationType,
            score: destructionScore,
            weight,
            weightedScore
          });
          totalPenalty += weightedScore;
        }
      }
    }
  }
  
  // 归一化破坏扣分（限制在1.0以内）
  const normalizedPenalty = Math.min(totalPenalty, 1.0);
  
  console.log('[TiyongAnalysis] 破坏扣分计算:');
  console.log('  发现模式:', destructionPatterns.length, '种');
  destructionPatterns.forEach(p => {
    console.log(`  ${p.pattern}: ${p.score.toFixed(3)} × ${p.weight} = ${p.weightedScore.toFixed(3)}`);
  });
  console.log('  总扣分:', totalPenalty.toFixed(3));
  console.log('  归一化:', normalizedPenalty.toFixed(3));
  
  return {
    penalty: normalizedPenalty,
    patterns: destructionPatterns,
    totalPenalty
  };
}

/**
 * 评估破坏模式强度
 */
function evaluateDestruction(destroyer, victim, relationType, strengthMap, graph) {
  const destroyerStrength = strengthMap[destroyer] || 0;
  const victimStrength = strengthMap[victim] || 0;
  
  // 检查图中是否存在该破坏关系
  const hasRelation = checkRelationInGraph(graph, destroyer, victim, relationType);
  
  if (!hasRelation || destroyerStrength === 0 || victimStrength === 0) {
    return 0;
  }
  
  // 破坏强度 = 破坏者强度 × 受害者强度
  return destroyerStrength * victimStrength;
}

/**
 * 计算承载度
 */
function calculateCarryingCapacity(bodyStrength, passThroughDegree, destructionPenalty) {
  const capacity = bodyStrength.normalized * 
                  passThroughDegree.degree * 
                  (1 - destructionPenalty.penalty);
  
  console.log('[TiyongAnalysis] 承载度公式计算:');
  console.log(`  ${bodyStrength.normalized.toFixed(3)} × ${passThroughDegree.degree.toFixed(3)} × ${(1 - destructionPenalty.penalty).toFixed(3)} = ${capacity.toFixed(3)}`);
  
  return capacity;
}

/**
 * 评估承载度等级
 */
function evaluateCapacityLevel(capacity) {
  for (const [level, range] of Object.entries(CAPACITY_LEVELS)) {
    if (capacity >= range.min && capacity < range.max) {
      return level;
    }
  }
  return '中等'; // 默认
}

/**
 * 生成承载度解读
 */
function getCapacityInterpretation(capacity, level) {
  const interpretations = {
    '极高': '体用协调，承载能力极强，能承担重大责任和机遇',
    '高': '体用平衡，承载能力较强，能较好地把握机会',
    '中上': '体用基本协调，承载能力良好，需注意平衡',
    '中等': '体用略有失衡，承载能力一般，需努力提升',
    '中下': '体用失衡明显，承载能力较弱，需谨慎行事',
    '低': '体用严重失衡，承载能力低，需大运扶助',
    '极低': '体用极度失衡，承载能力极低，需重点调整'
  };
  
  return interpretations[level] || '承载能力需进一步分析';
}

