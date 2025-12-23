/**
 * 地支刑冲合害关系模块
 * 完整实现六合、三合、六冲、三刑、六害、自刑
 */

import { BRANCHES } from '../utils/constants.js';

/**
 * 地支六合配置
 */
export const LIU_HE = {
  '子': '丑', '丑': '子',  // 子丑合土
  '寅': '亥', '亥': '寅',  // 寅亥合木
  '卯': '戌', '戌': '卯',  // 卯戌合火
  '辰': '酉', '酉': '辰',  // 辰酉合金
  '巳': '申', '申': '巳',  // 巳申合水
  '午': '未', '未': '午'   // 午未合土/火
};

/**
 * 地支六合生成的五行
 */
export const LIU_HE_ELEMENT = {
  '子丑': '土',
  '丑子': '土',  // 反向组合
  '寅亥': '木',
  '亥寅': '木',  // 反向组合
  '卯戌': '火',
  '戌卯': '火',  // 反向组合
  '辰酉': '金',
  '酉辰': '金',  // 反向组合
  '巳申': '水',
  '申巳': '水',  // 反向组合
  '午未': '土',
  '未午': '土'   // 反向组合
};

/**
 * 地支三合配置
 */
export const SAN_HE = {
  '申子辰': '水',
  '亥卯未': '木',
  '寅午戌': '火',
  '巳酉丑': '金'
};

/**
 * 地支三会局配置
 */
export const SAN_HUI = {
  '寅卯辰': '木',  // 三会东方木
  '巳午未': '火',  // 三会南方火
  '申酉戌': '金',  // 三会西方金
  '亥子丑': '水'   // 三会北方水
};

/**
 * 地支六冲配置
 */
export const LIU_CHONG = {
  '子': '午', '午': '子',  // 子午冲
  '丑': '未', '未': '丑',  // 丑未冲
  '寅': '申', '申': '寅',  // 寅申冲
  '卯': '酉', '酉': '卯',  // 卯酉冲
  '辰': '戌', '戌': '辰',  // 辰戌冲
  '巳': '亥', '亥': '巳'   // 巳亥冲
};

/**
 * 地支三刑配置
 */
export const SAN_XING = {
  // 无恩之刑
  '寅': ['巳', '申'],
  '巳': ['申', '寅'],
  '申': ['寅', '巳'],
  
  // 持势之刑
  '丑': ['戌', '未'],
  '戌': ['未', '丑'],
  '未': ['丑', '戌'],
  
  // 无礼之刑
  '子': ['卯'],
  '卯': ['子']
};

/**
 * 地支自刑配置
 */
export const ZI_XING = ['辰', '午', '酉', '亥'];

/**
 * 地支六害配置
 */
export const LIU_HAI = {
  '子': '未', '未': '子',  // 子未害
  '丑': '午', '午': '丑',  // 丑午害
  '寅': '巳', '巳': '寅',  // 寅巳害
  '卯': '辰', '辰': '卯',  // 卯辰害
  '申': '亥', '亥': '申',  // 申亥害
  '酉': '戌', '戌': '酉'   // 酉戌害
};

/**
 * 地支相破配置
 */
export const XIANG_PO = {
  '子': '酉', '酉': '子',  // 子酉相破
  '卯': '午', '午': '卯',  // 卯午相破
  '辰': '丑', '丑': '辰',  // 辰丑相破
  '未': '戌', '戌': '未',  // 未戌相破
  '寅': '亥', '亥': '寅',  // 寅亥相破
  '巳': '申', '申': '巳'   // 巳申相破
};

/**
 * 检查两个地支是否六合
 * @param {string} branch1 - 地支1
 * @param {string} branch2 - 地支2
 * @returns {Object|null} 合化信息或null
 */
export function checkLiuHe(branch1, branch2) {
  if (LIU_HE[branch1] === branch2) {
    const pair = [branch1, branch2].sort().join('');
    return {
      type: '六合',
      branch1,
      branch2,
      element: LIU_HE_ELEMENT[pair] || '未知',
      strength: 4,
      description: `${branch1}${branch2}合化${LIU_HE_ELEMENT[pair] || ''}`
    };
  }
  return null;
}

/**
 * 检查多个地支是否构成三合
 * @param {Array<string>} branches - 地支数组
 * @returns {Array<Object>} 三合局信息数组
 */
export function checkSanHe(branches) {
  const results = [];
  
  for (const [pattern, element] of Object.entries(SAN_HE)) {
    const chars = pattern.split('');
    const matches = chars.filter(c => branches.includes(c));
    
    if (matches.length === 3) {
      // 完整三合局
      results.push({
        type: '三合',
        branches: chars,
        element,
        strength: 5,
        isComplete: true,
        description: `${pattern}三合${element}局`
      });
    } else if (matches.length === 2) {
      // 半合局
      results.push({
        type: '半合',
        branches: matches,
        element,
        strength: 3,
        isComplete: false,
        description: `${matches.join('')}半合${element}局`
      });
    }
  }
  
  return results;
}

/**
 * 检查多个地支是否构成三会局
 * @param {Array<string>} branches - 地支数组
 * @returns {Array<Object>} 三会局信息数组
 */
export function checkSanHui(branches) {
  const results = [];
  
  for (const [pattern, element] of Object.entries(SAN_HUI)) {
    const chars = pattern.split('');
    const matches = chars.filter(c => branches.includes(c));
    
    if (matches.length === 3) {
      // 完整三会局
      results.push({
        type: '三会',
        branches: chars,
        element,
        strength: 6,  // 三会局力量比三合更强
        isComplete: true,
        description: `${pattern}三会${element}方`
      });
    } else if (matches.length === 2) {
      // 半会局
      results.push({
        type: '半会',
        branches: matches,
        element,
        strength: 4,
        isComplete: false,
        description: `${matches.join('')}半会${element}方`
      });
    }
  }
  
  return results;
}

/**
 * 检查两个地支是否六冲
 * @param {string} branch1 - 地支1
 * @param {string} branch2 - 地支2
 * @returns {Object|null} 冲信息或null
 */
export function checkLiuChong(branch1, branch2) {
  if (LIU_CHONG[branch1] === branch2) {
    return {
      type: '六冲',
      branch1,
      branch2,
      strength: 5,
      isNegative: true,
      description: `${branch1}${branch2}相冲`
    };
  }
  return null;
}

/**
 * 检查两个地支是否三刑
 * @param {string} branch1 - 地支1
 * @param {string} branch2 - 地支2
 * @returns {Object|null} 刑信息或null
 */
export function checkSanXing(branch1, branch2) {
  const xingTargets = SAN_XING[branch1];
  if (xingTargets && xingTargets.includes(branch2)) {
    let xingType = '三刑';
    
    // 判断刑的类型
    if (['寅', '巳', '申'].includes(branch1) && ['寅', '巳', '申'].includes(branch2)) {
      xingType = '无恩之刑';
    } else if (['丑', '戌', '未'].includes(branch1) && ['丑', '戌', '未'].includes(branch2)) {
      xingType = '持势之刑';
    } else if (['子', '卯'].includes(branch1) && ['子', '卯'].includes(branch2)) {
      xingType = '无礼之刑';
    }
    
    return {
      type: xingType,
      branch1,
      branch2,
      strength: 4,
      isNegative: true,
      description: `${branch1}${branch2}${xingType}`
    };
  }
  return null;
}

/**
 * 检查地支是否自刑
 * @param {Array<string>} branches - 地支数组
 * @returns {Array<Object>} 自刑信息数组
 */
export function checkZiXing(branches) {
  const results = [];
  const counts = {};
  
  // 统计每个地支出现次数
  branches.forEach(b => {
    counts[b] = (counts[b] || 0) + 1;
  });
  
  // 检查自刑地支是否重复出现
  for (const branch of ZI_XING) {
    if (counts[branch] >= 2) {
      results.push({
        type: '自刑',
        branch,
        count: counts[branch],
        strength: 3,
        isNegative: true,
        description: `${branch}自刑（出现${counts[branch]}次）`
      });
    }
  }
  
  return results;
}

/**
 * 检查两个地支是否六害
 * @param {string} branch1 - 地支1
 * @param {string} branch2 - 地支2
 * @returns {Object|null} 害信息或null
 */
export function checkLiuHai(branch1, branch2) {
  if (LIU_HAI[branch1] === branch2) {
    return {
      type: '六害',
      branch1,
      branch2,
      strength: 3,
      isNegative: true,
      description: `${branch1}${branch2}相害`
    };
  }
  return null;
}

/**
 * 检查两个地支是否相破
 * @param {string} branch1 - 地支1
 * @param {string} branch2 - 地支2
 * @returns {Object|null} 相破信息或null
 */
export function checkXiangPo(branch1, branch2) {
  if (XIANG_PO[branch1] === branch2) {
    return {
      type: '相破',
      branch1,
      branch2,
      strength: 3,
      isNegative: true,
      description: `${branch1}${branch2}相破`
    };
  }
  return null;
}

/**
 * 分析四柱地支之间的所有关系
 * @param {Object} pillars - 四柱信息
 * @param {Object} [pillars.year] - 年柱 {stem: string, branch: string}
 * @param {Object} [pillars.month] - 月柱 {stem: string, branch: string}
 * @param {Object} [pillars.day] - 日柱 {stem: string, branch: string}
 * @param {Object} [pillars.hour] - 时柱 {stem: string, branch: string}
 * @returns {Object} 关系分析结果
 * @returns {Array<Object>} result.liuhe - 六合关系列表
 * @returns {Array<Object>} result.sanhe - 三合关系列表
 * @returns {Array<Object>} result.liuchong - 六冲关系列表
 * @returns {Array<Object>} result.sanxing - 三刑关系列表
 */
export function analyzeBranchRelationships(pillars) {
  const branches = [
    pillars.year?.branch,
    pillars.month?.branch,
    pillars.day?.branch,
    pillars.hour?.branch
  ].filter(Boolean);
  
  const relationships = {
    liuhe: [],      // 六合
    sanhe: [],      // 三合
    sanhui: [],     // 三会
    liuchong: [],   // 六冲
    sanxing: [],    // 三刑
    zixing: [],     // 自刑
    liuhai: [],     // 六害
    xiangpo: []     // 相破
  };
  
  // 检查两两关系
  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      const b1 = branches[i];
      const b2 = branches[j];
      
      // 六合
      const he = checkLiuHe(b1, b2);
      if (he) relationships.liuhe.push(he);
      
      // 六冲
      const chong = checkLiuChong(b1, b2);
      if (chong) relationships.liuchong.push(chong);
      
      // 三刑
      const xing = checkSanXing(b1, b2);
      if (xing) relationships.sanxing.push(xing);
      
      // 六害
      const hai = checkLiuHai(b1, b2);
      if (hai) relationships.liuhai.push(hai);
      
      // 相破
      const po = checkXiangPo(b1, b2);
      if (po) relationships.xiangpo.push(po);
    }
  }
  
  // 检查三合
  const sanhe = checkSanHe(branches);
  relationships.sanhe = sanhe;
  
  // 检查三会
  const sanhui = checkSanHui(branches);
  relationships.sanhui = sanhui;
  
  // 检查自刑
  const zixing = checkZiXing(branches);
  relationships.zixing = zixing;
  
  return relationships;
}

/**
 * 分析流年与命局地支的关系
 * @param {Object} pillars - 四柱信息
 * @param {Object} [pillars.year] - 年柱 {stem: string, branch: string}
 * @param {Object} [pillars.month] - 月柱 {stem: string, branch: string}
 * @param {Object} [pillars.day] - 日柱 {stem: string, branch: string}
 * @param {Object} [pillars.hour] - 时柱 {stem: string, branch: string}
 * @param {string} yearBranch - 流年地支
 * @returns {Array<Object>} 关系列表
 */
export function analyzeYearRelationships(pillars, yearBranch) {
  const branches = [
    pillars.year?.branch,
    pillars.month?.branch,
    pillars.day?.branch,
    pillars.hour?.branch
  ].filter(Boolean);
  
  const relationships = [];
  
  // 检查与各柱的关系
  const pillarNames = ['年柱', '月柱', '日柱', '时柱'];
  branches.forEach((branch, index) => {
    const pillarName = pillarNames[index];
    
    // 伏吟（流年地支与柱相同）
    if (yearBranch === branch) {
      relationships.push({
        type: '伏吟',
        pillar: pillarName,
        description: `流年${yearBranch}与${pillarName}${branch}伏吟`
      });
    }
    
    // 六合
    const he = checkLiuHe(yearBranch, branch);
    if (he) {
      relationships.push({
        ...he,
        pillar: pillarName,
        description: `流年${yearBranch}与${pillarName}${branch}六合`
      });
    }
    
    // 六冲
    const chong = checkLiuChong(yearBranch, branch);
    if (chong) {
      relationships.push({
        ...chong,
        pillar: pillarName,
        description: `流年${yearBranch}冲${pillarName}${branch}`
      });
    }
    
    // 三刑
    const xing = checkSanXing(yearBranch, branch);
    if (xing) {
      relationships.push({
        ...xing,
        pillar: pillarName,
        description: `流年${yearBranch}刑${pillarName}${branch}`
      });
    }
    
    // 六害
    const hai = checkLiuHai(yearBranch, branch);
    if (hai) {
      relationships.push({
        ...hai,
        pillar: pillarName,
        description: `流年${yearBranch}害${pillarName}${branch}`
      });
    }
    
    // 相破
    const po = checkXiangPo(yearBranch, branch);
    if (po) {
      relationships.push({
        ...po,
        pillar: pillarName,
        description: `流年${yearBranch}与${pillarName}${branch}相破`
      });
    }
  });
  
  // 检查流年是否与命局构成三合
  const allBranches = [yearBranch, ...branches];
  const sanhe = checkSanHe(allBranches);
  if (sanhe.length > 0) {
    relationships.push(...sanhe.map(sh => ({
      ...sh,
      description: `流年${yearBranch}与命局${sh.description}`
    })));
  }
  
  // 检查流年是否与命局构成三会
  const sanhui = checkSanHui(allBranches);
  if (sanhui.length > 0) {
    relationships.push(...sanhui.map(sh => ({
      ...sh,
      description: `流年${yearBranch}与命局${sh.description}`
    })));
  }
  
  return relationships;
}

/**
 * 分析流月与命局地支的关系
 * @param {Object} pillars - 四柱信息
 * @param {Object} [pillars.year] - 年柱 {stem: string, branch: string}
 * @param {Object} [pillars.month] - 月柱 {stem: string, branch: string}
 * @param {Object} [pillars.day] - 日柱 {stem: string, branch: string}
 * @param {Object} [pillars.hour] - 时柱 {stem: string, branch: string}
 * @param {string} monthBranch - 流月地支
 * @returns {Array<Object>} 关系列表
 */
export function analyzeMonthRelationships(pillars, monthBranch) {
  const branches = [
    pillars.year?.branch,
    pillars.month?.branch,
    pillars.day?.branch,
    pillars.hour?.branch
  ].filter(Boolean);
  
  const relationships = [];
  
  // 检查与各柱的关系
  const pillarNames = ['年柱', '月柱', '日柱', '时柱'];
  branches.forEach((branch, index) => {
    const pillarName = pillarNames[index];
    
    // 伏吟（流月地支与柱相同）
    if (monthBranch === branch) {
      relationships.push({
        type: '伏吟',
        pillar: pillarName,
        description: `流月${monthBranch}与${pillarName}${branch}伏吟`
      });
    }
    
    // 六合
    const he = checkLiuHe(monthBranch, branch);
    if (he) {
      relationships.push({
        ...he,
        pillar: pillarName,
        description: `流月${monthBranch}与${pillarName}${branch}六合`
      });
    }
    
    // 六冲
    const chong = checkLiuChong(monthBranch, branch);
    if (chong) {
      relationships.push({
        ...chong,
        pillar: pillarName,
        description: `流月${monthBranch}冲${pillarName}${branch}`
      });
    }
    
    // 三刑
    const xing = checkSanXing(monthBranch, branch);
    if (xing) {
      relationships.push({
        ...xing,
        pillar: pillarName,
        description: `流月${monthBranch}刑${pillarName}${branch}`
      });
    }
    
    // 六害
    const hai = checkLiuHai(monthBranch, branch);
    if (hai) {
      relationships.push({
        ...hai,
        pillar: pillarName,
        description: `流月${monthBranch}害${pillarName}${branch}`
      });
    }
    
    // 相破
    const po = checkXiangPo(monthBranch, branch);
    if (po) {
      relationships.push({
        ...po,
        pillar: pillarName,
        description: `流月${monthBranch}与${pillarName}${branch}相破`
      });
    }
  });
  
  // 检查流月是否与命局构成三合
  const allBranches = [monthBranch, ...branches];
  const sanhe = checkSanHe(allBranches);
  if (sanhe.length > 0) {
    relationships.push(...sanhe.map(sh => ({
      ...sh,
      description: `流月${monthBranch}与命局${sh.description}`
    })));
  }
  
  // 检查流月是否与命局构成三会
  const sanhui = checkSanHui(allBranches);
  if (sanhui.length > 0) {
    relationships.push(...sanhui.map(sh => ({
      ...sh,
      description: `流月${monthBranch}与命局${sh.description}`
    })));
  }
  
  return relationships;
}

/**
 * 获取关系的简要描述
 * @param {Object} relationships - 关系分析结果
 * @returns {Array<string>} 描述数组
 */
export function getRelationshipDescriptions(relationships) {
  const descriptions = [];
  
  if (relationships.liuhe?.length > 0) {
    descriptions.push(...relationships.liuhe.map(r => r.description));
  }
  if (relationships.sanhe?.length > 0) {
    descriptions.push(...relationships.sanhe.map(r => r.description));
  }
  if (relationships.sanhui?.length > 0) {
    descriptions.push(...relationships.sanhui.map(r => r.description));
  }
  if (relationships.liuchong?.length > 0) {
    descriptions.push(...relationships.liuchong.map(r => r.description));
  }
  if (relationships.sanxing?.length > 0) {
    descriptions.push(...relationships.sanxing.map(r => r.description));
  }
  if (relationships.zixing?.length > 0) {
    descriptions.push(...relationships.zixing.map(r => r.description));
  }
  if (relationships.liuhai?.length > 0) {
    descriptions.push(...relationships.liuhai.map(r => r.description));
  }
  if (relationships.xiangpo?.length > 0) {
    descriptions.push(...relationships.xiangpo.map(r => r.description));
  }
  
  return descriptions.length > 0 ? descriptions : ['平和'];
}

