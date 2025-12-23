// 新增理由：星运计算模块
// 回滚方式：回退此文件

import { stage12 } from './stage12.js';

/**
 * 计算星运
 * 
 * 星运：日主天干在四柱各地支的十二长生状态
 * 
 * 区别于自坐：
 * - 星运：日主天干在该地支的十二长生（反映日主在该宫位的能量状态）
 * - 自坐：该柱天干在该柱地支的十二长生（反映该宫位自身的根基和稳固程度）
 * 
 * @param {string} dayStem - 日主天干
 * @param {string} branch - 该柱的地支
 * @returns {string} 十二长生状态（长生、沐浴、冠带、临官、帝旺、衰、病、死、墓、绝、胎、养）
 */
export function computeXingyun(dayStem, branch) {
  return stage12(dayStem, branch);
}

