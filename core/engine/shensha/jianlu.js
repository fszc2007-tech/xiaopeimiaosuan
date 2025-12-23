// 新增理由：建禄神煞计算
// 回滚方式：回退此文件

/**
 * 建禄神
 * 
 * 定义：月干在月支的禄神（临官）位
 * 象征：月令当旺，得禄于月，主事业、财富、健康
 * 查法：月支是否为月干的禄神
 * 
 * 禄神对应表（临官之位）：
 * - 甲 -> 寅
 * - 乙 -> 卯
 * - 丙 -> 巳
 * - 丁 -> 午
 * - 戊 -> 巳
 * - 己 -> 午
 * - 庚 -> 申
 * - 辛 -> 酉
 * - 壬 -> 亥
 * - 癸 -> 子
 * 
 * 口诀：甲寅乙卯丙戊巳，丁己午庚申，辛酉壬亥癸子
 */

const LU_SHEN_MAP = {
  '甲': '寅',
  '乙': '卯',
  '丙': '巳',
  '丁': '午',
  '戊': '巳',
  '己': '午',
  '庚': '申',
  '辛': '酉',
  '壬': '亥',
  '癸': '子'
};

/**
 * 检查建禄神
 * @param {Object} ctx - 四柱上下文 {yG, yZ, mG, mZ, dG, dZ, hG, hZ}
 * @returns {Object} 命中的柱位 {'月柱': true}
 */
export function checkJianLu(ctx) {
  const result = {};
  
  // 检查月干在月支的禄神
  const monthLu = LU_SHEN_MAP[ctx.mG];
  
  if (monthLu && monthLu === ctx.mZ) {
    result['月柱'] = true;
  }
  
  return result;
}






