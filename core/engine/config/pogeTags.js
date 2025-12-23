/**
 * 破格因素分类配置
 * 
 * 用于稳定度判断、风险因素收集等场景
 * 统一管理，避免在多个地方重复定义
 * 
 * Phase 1：定义但不使用（判断逻辑写死在 buildGuancaiPattern 中）
 * Phase 2：从配置文件读取
 */

export const POGE_TAG_CATEGORIES = {
  // 官杀相关
  officer: [
    '官杀混杂',
    '伤官见官',
    '杀重无制',
    '制杀太过',
    '杀弱身强',
    '官星被合',
    '官星无根'
  ],
  
  // 财星相关
  wealth: [
    '财多身弱',
    '比劫夺财',
    '财星坏印',
    '比劫成群'
  ],
  
  // 通用（可能同时影响官和财）
  common: [
    '根气受损',
    '用神被合',
    '印重身埋',
    '枭印太旺',
    '枭印太旺（身埋）',
    '印星过重',
    '食伤过旺',
    '食伤偏旺',
    '枭神夺食'
  ]
};

/**
 * 判断破格因素是否与官相关
 */
export function isOfficerRelated(factor) {
  const type = factor.type || '';
  return POGE_TAG_CATEGORIES.officer.includes(type) ||
         type.includes('官') || type.includes('殺') || type.includes('杀');
}

/**
 * 判断破格因素是否与财相关
 */
export function isWealthRelated(factor) {
  const type = factor.type || '';
  return POGE_TAG_CATEGORIES.wealth.includes(type) ||
         type.includes('財') || type.includes('财') || type.includes('比劫');
}





