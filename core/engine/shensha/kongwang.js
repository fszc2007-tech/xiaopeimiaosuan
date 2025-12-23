// 新增理由：空亡计算
// 回滚方式：回退此文件

import { BRANCHES } from '../utils/constants.js';

/**
 * 根据干支索引计算空亡地支
 */
export function kongWangByIndex(idx) {
  const group = Math.floor(((idx % 60) + 60) % 60 / 10);
  return [
    ["戌","亥"], ["申","酉"], ["午","未"], 
    ["辰","巳"], ["寅","卯"], ["子","丑"]
  ][group];
}

/**
 * 检查空亡
 */
export function checkKongWang(stem, branch, dayIdx) {
  const [kong1, kong2] = kongWangByIndex(dayIdx);
  return branch === kong1 || branch === kong2;
}
