// 新增理由：三合神煞计算
// 回滚方式：回退此文件

/**
 * 三合局配置
 */
export const GROUPS = [
  { 
    name: "申子辰", 
    members: ["申","子","辰"], 
    taohua: "酉", 
    yima: "寅", 
    jiangxing: "子", 
    huagai: "辰" 
  },
  { 
    name: "寅午戌", 
    members: ["寅","午","戌"], 
    taohua: "卯", 
    yima: "申", 
    jiangxing: "午", 
    huagai: "戌" 
  },
  { 
    name: "亥卯未", 
    members: ["亥","卯","未"], 
    taohua: "子", 
    yima: "巳", 
    jiangxing: "卯", 
    huagai: "未" 
  },
  { 
    name: "巳酉丑", 
    members: ["巳","酉","丑"], 
    taohua: "午", 
    yima: "亥", 
    jiangxing: "酉", 
    huagai: "丑" 
  }
];

/**
 * 月德贵人配置
 */
export const YUE_DE_GROUP_TO_STEM = {
  "寅午戌": "丙",
  "申子辰": "壬", 
  "亥卯未": "甲",
  "巳酉丑": "庚"
};

/**
 * 根据地支获取三合局
 */
export function groupOf(branch) {
  return GROUPS.find(g => g.members.includes(branch));
}

/**
 * 根据三合局获取神煞地支
 */
export function starsFromAnchorBranch(anchorBranch) {
  const g = groupOf(anchorBranch);
  if (!g) return null;
  return {
    taohua: g.taohua,
    yima: g.yima,
    jiangxing: g.jiangxing,
    huagai: g.huagai
  };
}

/**
 * 检查桃花
 */
export function checkTaohua(yearBranch, branch) {
  const pack = starsFromAnchorBranch(yearBranch);
  return pack && pack.taohua === branch;
}

/**
 * 检查驿马
 */
export function checkYima(yearBranch, branch) {
  const pack = starsFromAnchorBranch(yearBranch);
  return pack && pack.yima === branch;
}

/**
 * 检查将星
 */
export function checkJiangxing(yearBranch, branch) {
  const pack = starsFromAnchorBranch(yearBranch);
  return pack && pack.jiangxing === branch;
}

/**
 * 检查华盖
 */
export function checkHuagai(yearBranch, branch) {
  const pack = starsFromAnchorBranch(yearBranch);
  return pack && pack.huagai === branch;
}
