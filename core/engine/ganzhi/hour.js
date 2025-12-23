// 新增理由：时柱计算（五鼠遁）
// 回滚方式：回退此文件

import { STEMS, BRANCHES, HOUR_START_WUSHU, HOUR_START_ALT } from '../utils/constants.js';
import { mod } from '../utils/math.js';
import { hourIndexFromLocalHour } from '../astronomy/tst.js';

/**
 * 根据日干和时支索引计算时柱
 */
export function hourPillar(dayStem, hourIdx, rule = "wushudun") {
  const start = (rule === "wushudun" ? HOUR_START_WUSHU : HOUR_START_ALT)[dayStem];
  const startIdx = STEMS.indexOf(start);
  return {
    stem: STEMS[mod(startIdx + hourIdx, 10)],
    branch: BRANCHES[hourIdx]
  };
}

/**
 * 计算时柱（完整版本，包含日界处理）
 */
export function calculateHourPillar(dayStem, localHour, hourRef = "cur", rule = "wushudun") {
  let dayStemForHour = dayStem;
  
  // 处理夜子时归前一日的情况
  if (hourRef === "prev_zi" && (localHour >= 23 || localHour < 1)) {
    // 这里需要传入前一天的日干，由调用方处理
    // dayStemForHour = prevDayStem;
  } else if (hourRef === "prev_zi_chou" && (localHour >= 23 || localHour < 3)) {
    // 夜子时和丑时都归前一日
    // dayStemForHour = prevDayStem;
  }
  
  const hourIdx = hourIndexFromLocalHour(localHour);
  return hourPillar(dayStemForHour, hourIdx, rule);
}
