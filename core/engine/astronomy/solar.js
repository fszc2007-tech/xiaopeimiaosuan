// 新增理由：太阳黄经计算
// 回滚方式：回退此文件

import { DEG, J2000 } from '../utils/constants.js';
import { jd, cent, normDeg } from '../utils/math.js';

/**
 * 太阳平近点角
 */
export function sunMeanAnom(T) {
  return normDeg(357.52911 + T * (35999.05029 - 0.0001537 * T));
}

/**
 * 太阳平黄经
 */
export function sunMeanLong(T) {
  return normDeg(280.46646 + T * (36000.76983 + 0.0003032 * T));
}

/**
 * 太阳中心差
 */
export function sunEqCenter(T, M) {
  const r = M * DEG;
  return (1.914602 - T * (0.004817 + 0.000014 * T)) * Math.sin(r) +
         (0.019993 - 0.000101 * T) * Math.sin(2 * r) +
         0.000289 * Math.sin(3 * r);
}

/**
 * 太阳视黄经
 */
export function sunAppLong(T, L) {
  const omega = normDeg(125.04 - 1934.136 * T);
  return L - 0.00569 - 0.00478 * Math.sin(omega * DEG);
}

/**
 * 计算太阳黄经
 */
export function solarLongitude(date) {
  const jdUTC = jd(date);
  const jdTT = jdUTC + 69 / 86400; // 地球时修正
  const T = cent(jdTT);
  const L0 = sunMeanLong(T);
  const M = sunMeanAnom(T);
  const C = sunEqCenter(T, M);
  return normDeg(sunAppLong(T, L0 + C));
}
