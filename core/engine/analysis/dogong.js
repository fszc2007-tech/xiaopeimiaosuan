/**
 * 盲派"做功"分析
 * Blind School Work Analysis
 * 
 * 职责：
 * - 建立十神关系图（生、克、合、冲、刑、害）
 * - 寻找最强做功路径
 * - 计算做功力度 F = 强(A) × 强(B) × 邻接权重 × 洁净度
 * - 分类做功类型：克制、化用、生助、合取
 * 
 * @param {Object} pillars - 四柱数据
 * @param {Object} analysis - 通用分析结果（来自 baziAnalysis，包含 structure, dayMaster 等）
 * @param {Object} options - 选项
 * @returns {Object} 做功分析结果
 */

import { hasGenerateRelation, hasControlRelation } from './utils.js';

// ========== 常量定义 ==========

/**
 * 邻接关系权重
 */
const ADJACENCY_WEIGHTS = {
  '生': 1.2,
  '克': 1.5,
  '合': 1.8,
  '冲': 1.6,
  '刑': 1.3,
  '害': 1.1
};

/**
 * 位置权重
 */
const POSITION_WEIGHTS = {
  'year': 0.8,
  'month': 1.3,
  'day': 1.15,
  'hour': 0.9
};

export function analyzeDogong(pillars, analysis, options = {}) {
  console.log('[DogongAnalysis] 开始盲派做功分析');
  
  // 1. 提取基础信息
  const dayMaster = pillars.day?.stem || '未知';
  
  // 2. 建立十神关系图
  const graph = buildRelationshipGraph(pillars, dayMaster);
  
  // 3. 提取各十神强度
  const strengthMap = extractStrengthMap(pillars, analysis);
  
  // 4. 寻找最强做功路径
  const strongestPaths = findStrongestPaths(
    graph, 
    strengthMap, 
    '日主', 
    options.maxPaths || 5
  );
  
  // 5. 按做功类型分类统计
  const workTypeSummary = summarizeByWorkType(strongestPaths);
  
  // 6. 生成核心做功线
  const coreLine = strongestPaths.length > 0 ? strongestPaths[0] : null;
  
  const result = {
    version: '1.0.0',
    dayMaster,
    graph,
    strengthMap,
    strongestPaths,
    workTypeSummary,
    coreLine,
    timestamp: Date.now()
  };
  
  console.log('[DogongAnalysis] 分析完成，找到', strongestPaths.length, '条做功路径');
  
  return result;
}

/**
 * 建立十神关系图
 */
function buildRelationshipGraph(pillars, dayMaster) {
  const nodes = new Set();
  const edges = [];
  
  // ✅ 修复1：添加"日主"节点
  nodes.add('日主');
  
  // 收集所有十神节点
  ['year', 'month', 'day', 'hour'].forEach(pos => {
    const pillar = pillars[pos];
    if (!pillar) return;
    
    // 天干十神
    const stemShishen = pillar.shishen;
    if (stemShishen) nodes.add(stemShishen);
    
    // 藏干十神
    if (pillar.sub_stars) {
      pillar.sub_stars.forEach(shishen => {
        if (shishen) nodes.add(shishen);
      });
    }
  });
  
  const nodeArray = Array.from(nodes);
  
  // ✅ 修复2：建立"日主"到所有十神的关系边
  // 日主可以被印星生、被比劫助、被官杀克、被财星耗、被食伤泄
  nodeArray.forEach(shishen => {
    if (shishen === '日主') return;
    
    // 日主 → 十神的关系（日主生食伤、日主克财星等）
    const dayMasterToShishen = getTenGodRelation('日主', shishen);
    if (dayMasterToShishen) {
      edges.push({
        from: '日主',
        to: shishen,
        relation: dayMasterToShishen.type,
        weight: ADJACENCY_WEIGHTS[dayMasterToShishen.type] || 1.0
      });
    }
    
    // 十神 → 日主的关系（印星生日主、比劫助日主、官杀克日主等）
    const shishenToDayMaster = getTenGodRelation(shishen, '日主');
    if (shishenToDayMaster) {
      edges.push({
        from: shishen,
        to: '日主',
        relation: shishenToDayMaster.type,
        weight: ADJACENCY_WEIGHTS[shishenToDayMaster.type] || 1.0
      });
    }
  });
  
  // ✅ 修复3：建立十神之间的关系边（双向）
  for (let i = 0; i < nodeArray.length; i++) {
    for (let j = i + 1; j < nodeArray.length; j++) {
      const node1 = nodeArray[i];
      const node2 = nodeArray[j];
      
      // 跳过"日主"，因为已经单独处理了
      if (node1 === '日主' || node2 === '日主') continue;
      
      // 建立双向关系
      const relation1 = getTenGodRelation(node1, node2);
      if (relation1) {
        edges.push({
          from: node1,
          to: node2,
          relation: relation1.type,
          weight: ADJACENCY_WEIGHTS[relation1.type] || 1.0
        });
      }
      
      // 反向关系（如果存在）
      const relation2 = getTenGodRelation(node2, node1);
      if (relation2) {
        edges.push({
          from: node2,
          to: node1,
          relation: relation2.type,
          weight: ADJACENCY_WEIGHTS[relation2.type] || 1.0
        });
      }
    }
  }
  
  return {
    nodes: Array.from(nodes).map(n => ({ id: n, label: n })),
    edges: edges
  };
}

/**
 * 获取十神关系
 */
function getTenGodRelation(shishen1, shishen2) {
  // ✅ 特殊处理"日主"的关系
  if (shishen1 === '日主') {
    // 日主 → 十神的关系
    if (hasGenerateRelation(shishen1, shishen2)) {
      return { type: '生' };
    }
    if (hasControlRelation(shishen1, shishen2)) {
      return { type: '克' };
    }
    // 日主可以生食伤、克财星（基于五行生克）
    const dayMasterRelations = {
      '食神': '生',
      '伤官': '生',
      '正财': '克',
      '偏财': '克'
    };
    if (dayMasterRelations[shishen2]) {
      return { type: dayMasterRelations[shishen2] };
    }
  } else if (shishen2 === '日主') {
    // 十神 → 日主的关系
    if (hasGenerateRelation(shishen1, shishen2)) {
      return { type: '生' };
    }
    if (hasControlRelation(shishen1, shishen2)) {
      return { type: '克' };
    }
    // 印星可以生日主、比劫可以助日主、官杀可以克日主
    const toDayMasterRelations = {
      '正印': '生',
      '偏印': '生',
      '比肩': '生', // 虽然比劫不是"生"日主，但可以视为"助"，用"生"表示
      '劫财': '生',
      '正官': '克',
      '七杀': '克'
    };
    if (toDayMasterRelations[shishen1]) {
      return { type: toDayMasterRelations[shishen1] };
    }
  } else {
    // 普通十神之间的关系
    if (hasGenerateRelation(shishen1, shishen2)) {
      return { type: '生' };
    }
    
    if (hasControlRelation(shishen1, shishen2)) {
      return { type: '克' };
    }
  }
  
  return null;
}

/**
 * 提取各十神强度
 */
function extractStrengthMap(pillars, analysis) {
  const strengthMap = {};
  
  // 从四柱中统计十神强度
  ['year', 'month', 'day', 'hour'].forEach(pos => {
    const pillar = pillars[pos];
    if (!pillar) return;
    
    const positionWeight = POSITION_WEIGHTS[pos] || 1.0;
    
    // 天干十神
    if (pillar.shishen) {
      strengthMap[pillar.shishen] = (strengthMap[pillar.shishen] || 0) + 1.0 * positionWeight;
    }
    
    // 藏干十神
    if (pillar.sub_stars) {
      pillar.sub_stars.forEach(shishen => {
        if (shishen) {
          strengthMap[shishen] = (strengthMap[shishen] || 0) + 0.5 * positionWeight;
        }
      });
    }
  });
  
  return strengthMap;
}

/**
 * 寻找最强做功路径
 */
function findStrongestPaths(graph, strengthMap, startNode, maxPaths = 5) {
  const paths = [];
  
  // 简化版：基于图的最短路径算法
  // 实际实现需要更复杂的图遍历
  
  // 从起始节点开始，寻找所有可能的路径
  const visited = new Set();
  const queue = [{ node: startNode, path: [startNode], relations: [], cumWeight: 1.0, cleanliness: 1.0 }];
  
  while (queue.length > 0 && paths.length < maxPaths * 2) {
    const current = queue.shift();
    
    if (visited.has(current.node)) continue;
    visited.add(current.node);
    
    // 查找所有相邻节点
    const neighbors = graph.edges.filter(e => e.from === current.node);
    
    for (const edge of neighbors) {
      const neighbor = edge.to;
      const newPath = [...current.path, neighbor];
      const newRelations = [...current.relations, edge.relation];
      const newCumWeight = current.cumWeight * edge.weight;
      
      // 计算洁净度（路径中无冲突关系）
      const cleanliness = calculateCleanliness(newRelations);
      
      // 计算做功力度
      const workForce = calculateWorkForce(newPath, strengthMap, newCumWeight, cleanliness);
      
      // 如果路径长度 >= 2，添加到结果
      if (newPath.length >= 2) {
        paths.push({
          from: newPath[0],
          to: newPath[newPath.length - 1],
          path: newPath,
          relations: newRelations,
          workForce: workForce,
          type: classifyWorkType(newRelations),
          cleanliness: cleanliness,
          cumWeight: newCumWeight
        });
      }
      
      // 继续搜索（限制深度）
      if (newPath.length < 4) {
        queue.push({
          node: neighbor,
          path: newPath,
          relations: newRelations,
          cumWeight: newCumWeight,
          cleanliness: cleanliness
        });
      }
    }
  }
  
  // 按做功力度排序
  paths.sort((a, b) => b.workForce - a.workForce);
  
  // 返回前 maxPaths 条
  return paths.slice(0, maxPaths);
}

/**
 * 计算路径洁净度
 */
function calculateCleanliness(relations) {
  // 简化版：检查是否有冲突关系（如同时有生和克）
  let conflicts = 0;
  for (let i = 0; i < relations.length - 1; i++) {
    if ((relations[i] === '生' && relations[i + 1] === '克') ||
        (relations[i] === '克' && relations[i + 1] === '生')) {
      conflicts++;
    }
  }
  
  // 洁净度 = 1 - 冲突比例
  return Math.max(0, 1 - conflicts / relations.length);
}

/**
 * 计算做功力度
 */
function calculateWorkForce(path, strengthMap, cumWeight, cleanliness) {
  if (path.length < 2) {
    return 0;
  }
  
  // 计算路径中所有节点的强度乘积
  let strengthProduct = 1.0;
  for (const node of path) {
    const strength = strengthMap[node] || 0.5;
    strengthProduct *= strength;
  }
  
  // 做功力度公式
  const workForce = strengthProduct * cumWeight * cleanliness;
  
  return workForce;
}

/**
 * 分类做功类型
 */
function classifyWorkType(relations) {
  if (!relations || relations.length === 0) {
    return '未知';
  }
  
  // 统计关系类型
  const relCount = {};
  for (const rel of relations) {
    relCount[rel] = (relCount[rel] || 0) + 1;
  }
  
  // 确定主要关系
  let mainRelation = relations[0];
  let maxCount = 0;
  for (const [rel, count] of Object.entries(relCount)) {
    if (count > maxCount) {
      maxCount = count;
      mainRelation = rel;
    }
  }
  
  // 映射到做功类型
  const typeMap = {
    '生': '生助',
    '克': '克制',
    '合': '合取',
    '冲': '克制',
    '刑': '克制',
    '害': '克制'
  };
  
  return typeMap[mainRelation] || '未知';
}

/**
 * 按做功类型分类统计
 */
function summarizeByWorkType(paths) {
  const summary = {};
  
  for (const path of paths) {
    const type = path.type;
    summary[type] = (summary[type] || 0) + 1;
  }
  
  return summary;
}

