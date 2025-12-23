/**
 * 财星根气分析模块
 * 
 * Phase 1 版本：简化版，只判断有根/部分有根/无根
 * Phase 2 版本：增强版，引入位置权重和精细计算（后续实现）
 */

/**
 * 标准化十神名称（简体）
 * 所有十神相关操作都先调用此函数
 */
function normalizeGodName(name) {
  const TEN_GOD_NAMES = {
    '正官': '正官',
    '七杀': '七杀',
    '七殺': '七杀',  // 兼容繁体输入
    '正财': '正财',
    '正財': '正财',  // 兼容繁体输入
    '偏财': '偏财',
    '偏財': '偏财',  // ✅ 修正：繁体 → 简体
    '比肩': '比肩',
    '劫财': '劫财',
    '劫財': '劫财',  // 兼容繁体输入
    '食神': '食神',
    '伤官': '伤官',
    '傷官': '伤官',  // 兼容繁体输入
    '正印': '正印',
    '偏印': '偏印',
  };
  return TEN_GOD_NAMES[name] || name;
}

/**
 * 财星根气分析 - Phase 1 简化版
 * 
 * 当前上线版本：只判断有根/部分有根/无根
 * 不涉及位置权重和精细计算
 * 
 * @param {Object} pillars - 四柱数据
 * @param {String} dayStem - 日主天干
 * @returns {Promise<Object>} { rooting: string, score: number }
 */
export async function analyzeWealthRooting(pillars, dayStem) {
  const { isGodRooted } = await import('./utils.js');
  
  // 标准化名称（防御性编程）
  const zhengCaiName = normalizeGodName('正财');
  const pianCaiName = normalizeGodName('偏财');
  
  // 检查正财和偏财的根气
  const hasZheng = await isGodRooted(pillars, zhengCaiName, dayStem);
  const hasPian = await isGodRooted(pillars, pianCaiName, dayStem);
  
  // 简单计数
  const count = (hasZheng ? 1 : 0) + (hasPian ? 1 : 0);
  
  // 判断等级
  let rooting = '無根';
  if (count === 1) rooting = '部分有根';
  if (count >= 2) rooting = '有根';
  
  return {
    rooting,
    score: count / 2  // 可选，0-1，用于后续增强版
  };
}





