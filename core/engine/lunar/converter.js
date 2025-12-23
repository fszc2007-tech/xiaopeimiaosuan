// 新增理由：公历农历互转算法
// 回滚方式：回退此文件

import { lunarInfo } from './data.js';
import { daysBetweenUTC } from '../utils/timezone.js';

/**
 * 获取农历某月的天数
 */
export function lunarMonthDays(y, m) {
  return ((lunarInfo[y - 1900] >>> (16 - m)) & 1) ? 30 : 29;
}

/**
 * 获取农历某年的闰月
 */
export function leapMonth(y) {
  return lunarInfo[y - 1900] & 0xf;
}

/**
 * 获取农历某年闰月的天数
 */
export function leapDays(y) {
  const leap = leapMonth(y);
  return leap ? (((lunarInfo[y - 1900] & 0x10000) ? 30 : 29)) : 0;
}

/**
 * 获取农历某年的总天数
 */
export function lYearDays(y) {
  let sum = 348; // 12个月的基础天数
  for (let i = 0x8000; i > 0x8; i >>= 1) {
    sum += (lunarInfo[y - 1900] & i) ? 1 : 0;
  }
  return sum + leapDays(y);
}

/**
 * 公历转农历
 */
export function solarToLunar(y, m, d) {
  let offset = daysBetweenUTC(1900, 1, 31, y, m, d);
  let yr = 1900;
  
  while (true) {
    const ly = lYearDays(yr);
    if (offset < ly) break;
    offset -= ly;
    yr++;
  }
  
  const leap = leapMonth(yr);
  const months = [], flags = [];
  
  for (let mm = 1; mm <= 12; mm++) {
    months.push(lunarMonthDays(yr, mm));
    flags.push([mm, false]);
    
    if (leap && mm === leap) {
      months.push(leapDays(yr));
      flags.push([mm, true]);
    }
  }
  
  let i = 0;
  while (i < months.length && offset >= months[i]) {
    offset -= months[i];
    i++;
  }
  
  const lunarDay = offset + 1;
  const lunarMonth = flags[i][0];
  const isLeap = flags[i][1];
  
  return {
    year: yr,
    month: lunarMonth,
    day: lunarDay,
    isLeap,
    leapMonth: leap || 0
  };
}

/**
 * 农历转公历
 */
export function lunarToSolar(y, m, d, isLeap) {
  let offset = 0;
  
  // 累加前面年份的天数
  for (let yy = 1900; yy < y; yy++) {
    offset += lYearDays(yy);
  }
  
  const leap = leapMonth(y);
  
  // 累加前面月份的天数
  for (let mm = 1; mm < m; mm++) {
    offset += lunarMonthDays(y, mm);
    if (leap && mm === leap) {
      offset += leapDays(y);
    }
  }
  
  // 如果是闰月
  if (leap && m === leap && isLeap) {
    offset += lunarMonthDays(y, m);
  }
  
  offset += (d - 1);
  
  const ms = Date.UTC(1900, 0, 31) + offset * 86400000;
  const dt = new Date(ms);
  
  return {
    year: dt.getUTCFullYear(),
    month: dt.getUTCMonth() + 1,
    day: dt.getUTCDate()
  };
}
