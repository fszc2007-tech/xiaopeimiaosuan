/**
 * 喜用神/忌神推导
 * 
 * 基本原则：
 * - 身强：喜克泄耗（官杀、食伤、财星），忌印比
 * - 身弱：喜生扶（印星、比劫），忌财官食伤
 * - 从强：喜印比（顺从我党），忌财官食伤（破局）
 * - 从弱：喜财官食伤（顺从对方阵营），忌印比（逆势）
 * - 平衡：根据格局和用神判断
 * 
 * 排序规则：
 * - 稀缺优先（占比低的优先）
 * - 极旺（>35%）降到最后（避免已过量）
 * 
 * @param {Object} pillars - 四柱数据
 * @param {Object} strength - 日主强弱结果 { score, band }
 * @param {Object} wuxing - 五行占比 { 金: 32, 木: 18, ... }
 * @returns {Object} { favored: ['土','金'], avoid: ['木','火'], tenGodsHint: [...] }
 */

import { STEM_ELEMENT, GENERATES, CONTROLS, MOTHER_OF, CONTROLLER_OF, ROOT_BRANCH_BONUS, BRANCH_ELEMENT } from './constants.js';
import { computeWangXiang } from './wangxiang.js';

/**
 * 获取五行占比
 * @param {string} elem - 五行元素
 * @param {Object} wuxing - 五行占比对象
 * @returns {number} 占比百分比
 */
function wxPct(elem, wuxing) {
  if (!elem) return 0;
  return wuxing[elem] || 0;
}

/**
 * 判断日主是否有强根
 * @param {string} dmElement - 日主五行
 * @param {Object} pillars - 四柱数据
 * @returns {boolean} 是否有强根
 */
function hasStrongRoot(dmElement, pillars) {
  if (!dmElement || !pillars) return false;
  
  const rootConfig = ROOT_BRANCH_BONUS[dmElement];
  if (!rootConfig) return false;
  
  // 检查四支是否有日主的强根（临官/帝旺）
  const strongBranches = rootConfig.strong || [];
  for (const pos of ['year', 'month', 'day', 'hour']) {
    const branch = pillars[pos]?.branch;
    if (branch && strongBranches.includes(branch)) {
      return true; // 有临官/帝旺强根
    }
  }
  
  // 检查是否有本气根（地支本气为日主五行）
  for (const pos of ['year', 'month', 'day', 'hour']) {
    const branch = pillars[pos]?.branch;
    if (branch && BRANCH_ELEMENT[branch] === dmElement) {
      return true; // 有本气根
    }
  }
  
  return false;
}

/**
 * 判断是否为"杀重身弱"型命局
 * 条件：
 * 1. 官杀五行占比 ≥ 30%
 * 2. 印星五行占比 ≥ 22%
 * 3. 日主无强根
 * 4. 日主+印 ≤ 65%
 * 
 * @param {string} dmElement - 日主五行
 * @param {Object} pillars - 四柱数据
 * @param {Object} wuxing - 五行占比
 * @returns {boolean} 是否为杀重身弱型
 */
function isKillHeavyWeak(dmElement, pillars, wuxing) {
  if (!dmElement || !pillars || !wuxing) return false;
  
  // 获取相关五行
  const controller = Object.entries(CONTROLS).find(([k, v]) => v === dmElement)?.[0]; // 官杀
  const producer = Object.entries(GENERATES).find(([k, v]) => v === dmElement)?.[0];  // 印
  
  // 获取占比
  const selfPct = wxPct(dmElement, wuxing);
  const controllerPct = wxPct(controller, wuxing); // 官杀占比
  const producerPct = wxPct(producer, wuxing);     // 印占比
  
  // 检查是否有强根
  const hasRoot = hasStrongRoot(dmElement, pillars);
  
  // 计算日主+印的总占比
  const selfSide = selfPct + producerPct;
  
  // 通用条件（可调参数）
  const killHeavy = controllerPct >= 30;      // 官杀 ≥30%
  const producerStrong = producerPct >= 22;   // 印 ≥22%
  const selfSideWeak = selfSide <= 65;       // 日主+印 ≤65%
  
  // 官杀很重 & 日主没根 & 实际是靠印撑起来
  if (killHeavy && producerStrong && !hasRoot && selfSideWeak) {
    return true;
  }
  
  return false;
}

export function computeFavoredAvoid(pillars, strength, wuxing = {}) {
  const dayStem = pillars.day?.stem;
  const dmElement = STEM_ELEMENT[dayStem];
  
  // 🔹 1. 先拷一份当「可调整的 band」
  let effectiveBand = strength.band;
  
  // 🔹 2. 针对"杀重身弱型"，把身偏强 / 平衡 / 身偏弱 降一档为 身弱
  // ✅ V3.0：增加对 '身偏弱' 的处理
  if (effectiveBand === '身偏强' || effectiveBand === '平衡' || effectiveBand === '身偏弱') {
    if (isKillHeavyWeak(dmElement, pillars, wuxing)) {
      effectiveBand = '身弱';
      // 可选：添加日志输出便于调试
      // console.log('[Favored] 杀重身弱型：将', strength.band, '调整为身弱');
    }
  }
  
  const favored = [];
  const avoid = [];
  const tenHint = [];
  
  // 我生者（泄）
  const leak = GENERATES[dmElement];
  // 我克者（耗）
  const controlled = CONTROLS[dmElement];
  // 克我者（官杀）
  const controller = Object.entries(CONTROLS).find(([k, v]) => v === dmElement)?.[0];
  // 生我者（印）
  const producer = Object.entries(GENERATES).find(([k, v]) => v === dmElement)?.[0];
  
  // ✅ 从强格：顺从我党（印比），忌破局（财官食伤）
  if (effectiveBand === '从强') {
    favored.push(dmElement); // 比劫
    if (producer) favored.push(producer); // 印
    // 忌财官食伤
    if (leak) avoid.push(leak);
    if (controlled) avoid.push(controlled);
    if (controller) avoid.push(controller);
    
    tenHint.push('从强格：用印、比劫');
    
  // ✅ 从弱格：顺从对方阵营（财官食伤），忌逆势（印比）
  } else if (effectiveBand === '从弱') {
    // 喜财官食伤
    if (leak) favored.push(leak);
    if (controlled) favored.push(controlled);
    if (controller) favored.push(controller);
    // 忌印比
    avoid.push(dmElement); // 比劫
    if (producer) avoid.push(producer); // 印
    
    tenHint.push('从弱格：用财、官、食伤');
    
  } else if (effectiveBand === '身强') {
    // 身强：喜泄耗财官
    if (leak) favored.push(leak);
    if (controlled) favored.push(controlled);
    if (controller) favored.push(controller);
    // 忌比劫印
    avoid.push(dmElement); // 比劫
    if (producer) avoid.push(producer); // 印
    
    tenHint.push('用食伤、财、官');
    
  } else if (effectiveBand === '身弱') {
    // 身弱：喜印比
    favored.push(dmElement); // 比劫
    if (producer) favored.push(producer); // 印
    // 忌财官食伤
    if (leak) avoid.push(leak);
    if (controlled) avoid.push(controlled);
    if (controller) avoid.push(controller);
    
    tenHint.push('用印、比劫');
    
  } else if (effectiveBand === '身偏强') {
    // 身偏强：主要喜泄耗（食伤、财），忌印比和过度克我
    // 身偏强说明虽然可能印比力量较强，但整体还是偏强，需要泄耗为主
    if (leak) favored.push(leak);  // 食伤（泄）
    if (controlled) favored.push(controlled);  // 财（耗）
    // 比劫、印偏忌
    avoid.push(dmElement); // 比劫
    if (producer) avoid.push(producer); // 印
    // 官杀：只有当官杀本身≥25%时才明确列为忌
    const controllerPct = wxPct(controller, wuxing);
    if (controller && controllerPct >= 25) {
      avoid.push(controller); // 官杀（过度克我）
    }
    
    tenHint.push('偏强：以食伤、财为主用，官杀视局势而定');
    
  } else if (effectiveBand === '身偏弱') {
    // ✅ V3.0 新增：身偏弱：主要喜印比，但不如身弱那么急需
    // 身偏弱说明日主略有不足，需要适度帮扶
    favored.push(dmElement); // 比劫
    if (producer) favored.push(producer); // 印
    // 财官食伤偏忌，但程度比身弱轻
    if (leak) avoid.push(leak);  // 食伤
    if (controlled) avoid.push(controlled);  // 财
    // 官杀：只有当官杀本身≥25%时才明确列为忌
    const controllerPct2 = wxPct(controller, wuxing);
    if (controller && controllerPct2 >= 25) {
      avoid.push(controller); // 官杀（克身过重）
    }
    
    tenHint.push('偏弱：以印、比劫为主用，财官食伤视局势而定');
    
  } else {
    // 平衡：可顺势
    if (leak) favored.push(leak);
    if (controlled) favored.push(controlled);
    // 忌过度克我
    if (controller) avoid.push(controller);
    
    tenHint.push('平衡为贵，可顺势而为');
  }
  
  // ✅ 去重
  const uniqueFavored = Array.from(new Set(favored));
  const uniqueAvoid = Array.from(new Set(avoid));
  
  // ✅ 获取经典顺序（子平理论顺序）
  const getClassicOrder = (orderType) => {
    if (orderType === 'favored') {
      if (effectiveBand === '身强') {
        // 身强：我生→我克→克我（食伤→财→官）
        return ['食伤', '财', '官'];
      } else if (effectiveBand === '身弱') {
        // 身弱：生我→同我（印→比劫）
        return ['印', '比劫'];
      }
    } else if (orderType === 'avoid') {
      if (effectiveBand === '身强') {
        return ['比劫', '印'];
      } else if (effectiveBand === '身弱') {
        return ['财', '官', '食伤'];
      }
    }
    return [];
  };
  
  // ✅ 按稀缺度排序（占比低的优先）
  const sortByScarcity = (elements, wuxing) => {
    return elements.sort((a, b) => {
      const aPercent = wuxing[a] || 0;
      const bPercent = wuxing[b] || 0;
      
      // 极旺（>35%）降到最后
      if (aPercent > 35 && bPercent <= 35) return 1;
      if (bPercent > 35 && aPercent <= 35) return -1;
      
      // 其他按占比升序（稀缺优先）
      return aPercent - bPercent;
    });
  };
  
  // 排序喜用神
  const sortedFavored = sortByScarcity(uniqueFavored, wuxing);
  
  // 排序忌神
  const sortedAvoid = sortByScarcity(uniqueAvoid, wuxing);
  
  // 计算旺相休囚死
  const monthBranch = pillars.month?.branch;
  const wangxiang = computeWangXiang(monthBranch);
  
  return {
    favored: sortedFavored,
    avoid: sortedAvoid,
    tenGodsHint: tenHint,
    wangxiang: wangxiang
  };
}

