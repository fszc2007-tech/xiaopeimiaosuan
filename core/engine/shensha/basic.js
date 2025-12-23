// 新增理由：基础神煞计算
// 回滚方式：回退此文件

/**
 * 天乙贵人
 */
export const TIAN_YI = {
  "甲": ["丑","未"], "戊": ["丑","未"], "庚": ["丑","未"],
  "乙": ["子","申"], "己": ["子","申"],
  "丙": ["亥","酉"], "丁": ["亥","酉"],
  "辛": ["寅","午"],
  "壬": ["巳","卯"], "癸": ["巳","卯"]
};

/**
 * 文昌贵人
 */
export const WEN_CHANG = {
  "甲":"巳","乙":"午","丙":"申","丁":"酉","戊":"申","己":"酉",
  "庚":"亥","辛":"戌","壬":"寅","癸":"卯"
};

/**
 * 检查天乙贵人
 */
export function checkTianYi(stem, branch) {
  return (TIAN_YI[stem] || []).includes(branch);
}

/**
 * 检查文昌贵人
 */
export function checkWenChang(stem, branch) {
  return WEN_CHANG[stem] === branch;
}
