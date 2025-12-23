// 新增理由：节气计算
// 回滚方式：回退此文件

import { SOLAR_NAMES } from '../utils/constants.js';
import { solarLongitude } from './solar.js';
import { bisectionSolve } from '../utils/math.js';

/**
 * 根据节气名称获取月支
 */
export function monthBranchByPrevTerm(name) {
  const map = {
    "立春":"寅","雨水":"寅","惊蛰":"卯","春分":"卯","清明":"辰","谷雨":"辰",
    "立夏":"巳","小满":"巳","芒种":"午","夏至":"午","小暑":"未","大暑":"未",
    "立秋":"申","处暑":"申","白露":"酉","秋分":"酉","寒露":"戌","霜降":"戌",
    "立冬":"亥","小雪":"亥","大雪":"子","冬至":"子","小寒":"丑","大寒":"丑"
  };
  return map[name] || "申";
}

/**
 * 求解指定黄经的节气时间
 */
export function solveSolarLongitude(dateGuess, target) {
  const f = d => {
    let y = solarLongitude(d) - target;
    return ((y + 540) % 360) - 180;
  };
  
  const a = new Date(dateGuess.getTime() - 36 * 3600 * 1000);
  const b = new Date(dateGuess.getTime() + 36 * 3600 * 1000);
  
  // 使用时间戳进行二分法求解
  const result = bisectionSolve(
    (timestamp) => f(new Date(timestamp)),
    a.getTime(),
    b.getTime()
  );
  
  return new Date(result);
}

/**
 * 获取当前时间的前后节气
 */
export function solarWindow(dateUTC) {
  const lambda = solarLongitude(dateUTC);
  const prevK = Math.floor(lambda / 15);
  const nextK = prevK + 1;
  
  const prev = solveSolarLongitude(
    new Date(dateUTC.getTime() - 10 * 86400000), 
    prevK * 15
  );
  const next = solveSolarLongitude(
    new Date(dateUTC.getTime() + 10 * 86400000), 
    nextK * 15
  );
  
  return [
    {
      name: SOLAR_NAMES[(prevK % 24 + 24) % 24],
      time: prev
    },
    {
      name: SOLAR_NAMES[(nextK % 24 + 24) % 24],
      time: next
    }
  ];
}
