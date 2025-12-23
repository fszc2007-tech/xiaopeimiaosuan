// 新增理由：神煞计算上下文构建
// 回滚方式：回退此文件

import { idxFromStemBranch } from './helpers.js';

/**
 * 构建神煞计算所需的上下文对象
 * @param {Object} pillars - 四柱对象 { year, month, day, hour }
 * @returns {Object} 上下文对象
 */
export function buildShenshaContext(pillars) {
  const P = pillars;
  
  return {
    // 天干
    yG: P.year.stem,   // 年干
    mG: P.month.stem,  // 月干
    dG: P.day.stem,    // 日干
    hG: P.hour.stem,   // 时干
    
    // 地支
    yZ: P.year.branch,   // 年支
    mZ: P.month.branch,  // 月支
    dZ: P.day.branch,    // 日支
    hZ: P.hour.branch,   // 时支
    
    // 干支索引（用于空亡计算）
    yearIdx:  idxFromStemBranch(P.year.stem, P.year.branch),
    monthIdx: idxFromStemBranch(P.month.stem, P.month.branch),
    dayIdx:   idxFromStemBranch(P.day.stem, P.day.branch),
    hourIdx:  idxFromStemBranch(P.hour.stem, P.hour.branch),
  };
}

