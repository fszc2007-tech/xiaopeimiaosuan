/**
 * 旺相休囚死计算模块
 * 
 * 基于月令（月支）判断五行的旺衰状态
 * 
 * 传统理论：
 * - 旺：当令之五行（如春木、夏火）
 * - 相：当令五行所生（春木生火，火为相）
 * - 休：生当令五行（春水生木，水为休）
 * - 囚：当令克的五行（春木克土，土为囚）
 * - 死：克当令的五行（春金克木，金为死）
 * 
 * @module wangxiang
 */

import { BRANCH_ELEMENT, GENERATES, CONTROLS } from './constants.js';

/**
 * 计算五行的旺相休囚死状态
 * 
 * @param {String} monthBranch - 月支（如"寅"、"午"、"子"）
 * @returns {Object} { '木': '旺', '火': '相', '水': '休', '土': '囚', '金': '死' }
 */
export function computeWangXiang(monthBranch) {
  // 默认值（平衡状态）
  const defaultStatus = { '木': '休', '火': '休', '土': '休', '金': '休', '水': '休' };
  
  if (!monthBranch) {
    return defaultStatus;
  }
  
  // 获取月令五行
  const seasonElement = BRANCH_ELEMENT[monthBranch];
  if (!seasonElement) {
    return defaultStatus;
  }
  
  const result = {};
  
  // 遍历五行，判断每个五行的状态
  const allElements = ['木', '火', '土', '金', '水'];
  
  allElements.forEach(element => {
    if (element === seasonElement) {
      // 1. 旺：当令之五行
      result[element] = '旺';
    } else if (GENERATES[seasonElement] === element) {
      // 2. 相：当令五行所生（我生者为相）
      result[element] = '相';
    } else if (GENERATES[element] === seasonElement) {
      // 3. 休：生当令五行（生我者为休）
      result[element] = '休';
    } else if (CONTROLS[seasonElement] === element) {
      // 4. 囚：当令克的五行（我克者为囚）
      result[element] = '囚';
    } else if (CONTROLS[element] === seasonElement) {
      // 5. 死：克当令的五行（克我者为死）
      result[element] = '死';
    } else {
      // 默认（理论上不应该到达这里）
      result[element] = '休';
    }
  });
  
  return result;
}

/**
 * 获取月令主气五行
 * 
 * @param {String} monthBranch - 月支
 * @returns {String} 五行（如"木"、"火"）
 */
export function getSeasonElement(monthBranch) {
  return BRANCH_ELEMENT[monthBranch] || '木';
}

/**
 * 获取旺相休囚死的简要说明
 * 
 * @param {String} status - 状态（旺/相/休/囚/死）
 * @returns {String} 说明文字
 */
export function getWangXiangExplanation(status) {
  const explanations = {
    '旺': '当令最旺',
    '相': '次旺有力',
    '休': '休息中和',
    '囚': '受制较弱',
    '死': '最弱无力'
  };
  
  return explanations[status] || '中和';
}

