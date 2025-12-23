/**
 * 五行占比计算
 * 
 * 算法：
 * 1. 天干：每个权重 1.0
 * 2. 地支藏干：按 HIDDEN_STEMS 权重
 * 3. 地支本气：环境加权 0.5
 * 4. 转换为百分比（总和 = 100）
 * 
 * @param {Object} pillars - 四柱数据 { year, month, day, hour }
 * @returns {Object} { 金: 32, 木: 18, 水: 14, 火: 16, 土: 20 }
 */
import { STEM_ELEMENT, BRANCH_ELEMENT } from './constants.js';
import { collectAllStems, sum } from './utils.js';

export function computeWuXing(pillars) {
  const acc = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
  
  // 遍历四柱
  ['year', 'month', 'day', 'hour'].forEach(pillarName => {
    const pillar = pillars[pillarName];
    if (!pillar) return;
    
    // 1. 天干 + 藏干（按权重）
    collectAllStems(pillar).forEach(h => {
      const element = STEM_ELEMENT[h.stem];
      if (element) acc[element] += h.weight;
    });
    
    // 2. 地支本气（环境加权 0.5）
    const branchElement = BRANCH_ELEMENT[pillar.branch];
    if (branchElement) acc[branchElement] += 0.5;
  });
  
  // 转换为百分比
  const total = sum(acc);
  const wuxingPercent = {};
  
  if (total > 0) {
    Object.keys(acc).forEach(key => {
      wuxingPercent[key] = Math.round((acc[key] / total) * 100);
    });
    
    // 确保总和为 100（处理四舍五入误差）
    const currentSum = sum(wuxingPercent);
    if (currentSum !== 100) {
      const diff = 100 - currentSum;
      const maxKey = Object.keys(wuxingPercent).reduce((a, b) => 
        wuxingPercent[a] > wuxingPercent[b] ? a : b
      );
      wuxingPercent[maxKey] += diff;
    }
  } else {
    // 默认平均分配
    Object.keys(acc).forEach(key => {
      wuxingPercent[key] = 20;
    });
  }
  
  return wuxingPercent;
}

