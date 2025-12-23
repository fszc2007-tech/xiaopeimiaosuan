// 新增理由：真太阳时修正
// 回滚方式：回退此文件

/**
 * 真太阳时修正
 * @param {Date} localTime 本地时间
 * @param {number} longitude 经度（东经为正）
 * @param {number} standardMeridian 标准经线（默认120E）
 * @returns {Date} 修正后的时间
 */
export function applyTrueSolarTime(localTime, longitude, standardMeridian = 120) {
  // TST修正 = (经度 - 标准经线) × 4分钟
  const correctionMinutes = (longitude - standardMeridian) * 4;
  return new Date(localTime.getTime() + correctionMinutes * 60000);
}

/**
 * 根据小时获取时支索引
 */
export function hourIndexFromLocalHour(hour) {
  if (hour >= 23 || hour < 1) return 0;   // 子时
  if (hour < 3) return 1;                 // 丑时
  if (hour < 5) return 2;                 // 寅时
  if (hour < 7) return 3;                 // 卯时
  if (hour < 9) return 4;                 // 辰时
  if (hour < 11) return 5;                // 巳时
  if (hour < 13) return 6;                // 午时
  if (hour < 15) return 7;                // 未时
  if (hour < 17) return 8;                // 申时
  if (hour < 19) return 9;                // 酉时
  if (hour < 21) return 10;               // 戌时
  return 11;                              // 亥时
}
