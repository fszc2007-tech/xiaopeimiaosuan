// 新增理由：神煞批量计算统一入口
// 回滚方式：回退此文件

import { buildShenshaContext } from './context.js';
import { SHENSHA_RULES } from './rules.js';
import { uniqPush } from './helpers.js';
import { kongWangByIndex } from './kongwang.js';

/**
 * 计算所有神煞
 * @param {Object} pillars - 四柱对象 { year, month, day, hour }
 * @returns {Object} 计算结果 { hits_by_pillar: { 年柱: [], 月柱: [], 日柱: [], 时柱: [] } }
 */
export function computeAllShensha(pillars) {
  // 1. 构建上下文
  const ctx = buildShenshaContext(pillars);
  
  // 2. 初始化结果
  const out = { "年柱": [], "月柱": [], "日柱": [], "时柱": [] };
  
  // 3. 执行所有规则
  for (const name of Object.keys(SHENSHA_RULES)) {
    const hits = SHENSHA_RULES[name](ctx);
    for (const pillar in hits) {
      uniqPush(out, pillar, name);
      // 桃花和咸池是同一个神煞，两个名称都显示
      if (name === "桃花") {
        uniqPush(out, pillar, "咸池");
      }
    }
  }
  
  // 4. 计算空亡（年/月/日空亡）
  computeKongWang(ctx, out);
  
  return { hits_by_pillar: out };
}

/**
 * 计算空亡
 * @param {Object} ctx - 上下文对象
 * @param {Object} out - 输出对象
 */
function computeKongWang(ctx, out) {
  /**
   * 计算某柱的空亡并添加到结果
   * @param {number} targetIdx - 干支索引
   * @param {string} label - 空亡标签（如 "日空亡"）
   */
  function kongTo(targetIdx, label) {
    if (typeof targetIdx !== "number") return;
    const [a, b] = kongWangByIndex(targetIdx);
    const hit = new Set([a, b]);
    if (hit.has(ctx.yZ)) uniqPush(out, "年柱", label);
    if (hit.has(ctx.mZ)) uniqPush(out, "月柱", label);
    if (hit.has(ctx.dZ)) uniqPush(out, "日柱", label);
    if (hit.has(ctx.hZ)) uniqPush(out, "时柱", label);
  }
  
  // 日空亡、月空亡、年空亡
  kongTo(ctx.dayIdx, "日空亡");
  kongTo(ctx.monthIdx, "月空亡");
  kongTo(ctx.yearIdx, "年空亡");
}

/**
 * 计算单柱的神煞
 * @param {Object} pillars - 四柱对象
 * @param {string} pillarKey - 柱位名称（"year", "month", "day", "hour"）
 * @returns {string[]} 该柱的神煞列表
 */
export function computePillarShensha(pillars, pillarKey) {
  const result = computeAllShensha(pillars);
  const pillarNameMap = {
    "year": "年柱",
    "month": "月柱",
    "day": "日柱",
    "hour": "时柱"
  };
  return result.hits_by_pillar[pillarNameMap[pillarKey]] || [];
}

