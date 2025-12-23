// 新增理由：专禄神煞计算
// 回滚方式：回退此文件

/**
 * 专禄神（归禄）
 * 
 * 定义：日干在日支的禄神（临官）位
 * 象征：自坐禄位，身强体健，独立自主
 * 查法：日支是否为日干的禄神
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
 * 检查专禄神
 * @param {Object} ctx - 四柱上下文 {yG, yZ, mG, mZ, dG, dZ, hG, hZ}
 * @returns {Object} 命中的柱位 {'日柱': true}
 */
export function checkZhuanLu(ctx) {
  const result = {};
  
  // 检查日干在日支的禄神
  const dayLu = LU_SHEN_MAP[ctx.dG];
  
  if (dayLu && dayLu === ctx.dZ) {
    result['日柱'] = true;
  }
  
  return result;
}






