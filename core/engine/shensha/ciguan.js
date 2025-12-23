// 新增理由：词馆神煞计算
// 回滚方式：回退此文件

/**
 * 词馆神煞
 * 
 * 象征：文章、学业、科甲、学术研究能力
 * 查法：以年干或日干为主，查地支
 * 
 * 对应表：
 * - 甲干 -> 寅
 * - 乙干 -> 卯
 * - 丙干 -> 巳
 * - 丁干 -> 午
 * - 戊干 -> 巳
 * - 己干 -> 午
 * - 庚干 -> 申
 * - 辛干 -> 酉
 * - 壬干 -> 亥
 * - 癸干 -> 戌
 */

const CI_GUAN_MAP = {
  '甲': '寅',
  '乙': '卯',
  '丙': '巳',
  '丁': '午',
  '戊': '巳',
  '己': '午',
  '庚': '申',
  '辛': '酉',
  '壬': '亥',
  '癸': '戌'
};

/**
 * 检查词馆
 * @param {Object} ctx - 四柱上下文 {yG, yZ, mG, mZ, dG, dZ, hG, hZ}
 * @returns {Object} 命中的柱位 {'年柱': true, '月柱': true, ...}
 */
export function checkCiGuan(ctx) {
  const result = {};
  
  // 以年干和日干为主查地支
  const yearTarget = CI_GUAN_MAP[ctx.yG];
  const dayTarget = CI_GUAN_MAP[ctx.dG];
  
  if (!yearTarget && !dayTarget) return result;
  
  // 检查四柱地支
  const targets = new Set([yearTarget, dayTarget].filter(Boolean));
  
  if (targets.has(ctx.yZ)) result['年柱'] = true;
  if (targets.has(ctx.mZ)) result['月柱'] = true;
  if (targets.has(ctx.dZ)) result['日柱'] = true;
  if (targets.has(ctx.hZ)) result['时柱'] = true;
  
  return result;
}






