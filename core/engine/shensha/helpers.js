// 新增理由：神煞计算统一辅助函数
// 回滚方式：回退此文件

/**
 * 天干常量
 */
export const TG = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];

/**
 * 地支常量
 */
export const DZ = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];

/**
 * 检查哪些柱命中指定地支
 * @param {Object} ctx - 上下文对象（包含 yZ, mZ, dZ, hZ）
 * @param {Set} targets - 目标地支集合
 * @returns {Object} 命中的柱位对象，如 { "年柱": true, "月柱": true }
 */
export function whichPillarsHitBranch(ctx, targets) {
  const r = {};
  if (targets.has(ctx.yZ)) r["年柱"] = true;
  if (targets.has(ctx.mZ)) r["月柱"] = true;
  if (targets.has(ctx.dZ)) r["日柱"] = true;
  if (targets.has(ctx.hZ)) r["时柱"] = true;
  return r;
}

/**
 * 检查哪些柱命中指定天干
 * @param {Object} ctx - 上下文对象（包含 yG, mG, dG, hG）
 * @param {Set} targets - 目标天干集合
 * @returns {Object} 命中的柱位对象
 */
export function whichPillarsHitStem(ctx, targets) {
  const r = {};
  if (targets.has(ctx.yG)) r["年柱"] = true;
  if (targets.has(ctx.mG)) r["月柱"] = true;
  if (targets.has(ctx.dG)) r["日柱"] = true;
  if (targets.has(ctx.hG)) r["时柱"] = true;
  return r;
}

/**
 * 三合局目标查找
 * @param {string} z - 地支
 * @param {Object} table - 映射表，key 为三合局字符串，value 为目标
 * @returns {string|null} 匹配的目标
 */
export function triTarget(z, table) {
  for (const k in table) {
    if (k.includes(z)) return table[k];
  }
  return null;
}

/**
 * 去重添加到数组
 * @param {Object} map - 目标对象（如 { "年柱": [], "月柱": [] }）
 * @param {string} pillar - 柱位名称
 * @param {string} name - 神煞名称
 */
export function uniqPush(map, pillar, name) {
  if (!map[pillar]) map[pillar] = [];
  if (!map[pillar].includes(name)) map[pillar].push(name);
}

/**
 * 根据天干地支计算干支索引（0-59）
 * @param {string} stem - 天干
 * @param {string} branch - 地支
 * @returns {number|undefined} 干支索引，无效时返回 undefined
 */
export function idxFromStemBranch(stem, branch) {
  const s = TG.indexOf(stem);
  const b = DZ.indexOf(branch);
  if (s < 0 || b < 0) return undefined;
  let t = s;
  while (t % 12 !== b) t += 10;
  return t % 60;
}

