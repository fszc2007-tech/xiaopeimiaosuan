// 新增理由：流年神煞计算
// 回滚方式：删除此文件

import { BRANCHES } from '../utils/constants.js';
import { groupOf } from './group.js';

/**
 * 亡神规则（根据三合局）
 */
export const WANG_SHEN = {
  "申子辰": "亥",
  "亥卯未": "寅",
  "寅午戌": "巳",
  "巳酉丑": "申"
};

/**
 * 劫煞规则（根据三合局）
 */
export const JIE_SHA = {
  "申子辰": "巳",
  "亥卯未": "申",
  "寅午戌": "亥",
  "巳酉丑": "寅"
};

/**
 * 检查太岁
 * @param {string} currentYearBranch - 当年地支
 * @param {string} branch - 要检查的地支
 * @returns {boolean}
 */
export function checkTaiSui(currentYearBranch, branch) {
  return currentYearBranch === branch;
}

/**
 * 检查岁驾（与太岁相同）
 * @param {string} currentYearBranch - 当年地支
 * @param {string} branch - 要检查的地支
 * @returns {boolean}
 */
export function checkSuiJia(currentYearBranch, branch) {
  return checkTaiSui(currentYearBranch, branch);
}

/**
 * 检查病符（太岁前一位）
 * @param {string} currentYearBranch - 当年地支
 * @param {string} branch - 要检查的地支
 * @returns {boolean}
 */
export function checkBingFu(currentYearBranch, branch) {
  const idx = BRANCHES.indexOf(currentYearBranch);
  if (idx === -1) return false;
  const bingFuBranch = BRANCHES[(idx + 11) % 12];
  return bingFuBranch === branch;
}

/**
 * 检查亡神
 * @param {string} yearBranch - 年支或日支
 * @param {string} branch - 要检查的地支
 * @returns {boolean}
 */
export function checkWangShen(yearBranch, branch) {
  const group = groupOf(yearBranch);
  if (!group) return false;
  const wangShenBranch = WANG_SHEN[group.name];
  return wangShenBranch === branch;
}

/**
 * 检查劫煞
 * @param {string} yearBranch - 年支或日支
 * @param {string} branch - 要检查的地支
 * @returns {boolean}
 */
export function checkJieSha(yearBranch, branch) {
  const group = groupOf(yearBranch);
  if (!group) return false;
  const jieShaBranch = JIE_SHA[group.name];
  return jieShaBranch === branch;
}

