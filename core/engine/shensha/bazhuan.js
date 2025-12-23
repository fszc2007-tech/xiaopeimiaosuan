// 新增理由：八专神煞计算
// 回滚方式：回退此文件

/**
 * 八专神煞
 * 
 * 象征：淫欲煞，干支同气，欲望强盛
 * 查法：只看日柱和时柱的干支组合
 * 
 * 八专组合（干支同气）：
 * 甲寅、乙卯、丁未、己未、庚申、辛酉、戊戌、癸丑
 */

const BA_ZHUAN_SET = new Set([
  '甲寅',
  '乙卯',
  '丁未',
  '己未',
  '庚申',
  '辛酉',
  '戊戌',
  '癸丑'
]);

/**
 * 检查八专
 * @param {Object} ctx - 四柱上下文 {yG, yZ, mG, mZ, dG, dZ, hG, hZ}
 * @returns {Object} 命中的柱位 {'日柱': true, '时柱': true}
 */
export function checkBaZhuan(ctx) {
  const result = {};
  
  // 只检查日柱和时柱
  const dayPillar = ctx.dG + ctx.dZ;
  const hourPillar = ctx.hG + ctx.hZ;
  
  if (BA_ZHUAN_SET.has(dayPillar)) {
    result['日柱'] = true;
  }
  
  if (BA_ZHUAN_SET.has(hourPillar)) {
    result['时柱'] = true;
  }
  
  return result;
}






