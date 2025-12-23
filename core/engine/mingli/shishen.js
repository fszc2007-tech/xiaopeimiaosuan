// 新增理由：十神计算
// 回滚方式：回退此文件

import { STEM_ELEMENT, STEM_YY, GEN, KE } from '../utils/constants.js';

/**
 * 计算十神关系
 */
export function relation(a, b) {
  if (a === b) return "same";
  if (GEN[a] === b) return "a_gen_b";
  if (GEN[b] === a) return "b_gen_a";
  if (KE[a] === b) return "a_ctrl_b";
  return "b_ctrl_a";
}

/**
 * 计算十神
 */
export function tenGod(dayStem, otherStem) {
  const aE = STEM_ELEMENT[dayStem];
  const aY = STEM_YY[dayStem];
  const bE = STEM_ELEMENT[otherStem];
  const bY = STEM_YY[otherStem];
  
  const rel = relation(aE, bE);
  const same = aY === bY;
  
  switch (rel) {
    case "same": return same ? "比肩" : "劫财";
    case "a_gen_b": return same ? "食神" : "伤官";
    case "b_gen_a": return same ? "偏印" : "正印";
    case "a_ctrl_b": return same ? "偏财" : "正财";
    case "b_ctrl_a": return same ? "七杀" : "正官";
    default: return "";
  }
}
