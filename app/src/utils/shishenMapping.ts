/**
 * 十神、格局、破格因素等名称简体转繁体映射表
 * 
 * 原则：
 * - Key: 简体（后端返回的格式）
 * - Value: 繁体（前端显示的格式）
 * - 后端统一使用简体，前端通过此映射表转换为繁体显示
 */

/**
 * 十神名称简体转繁体映射表
 * Key: 简体（后端返回）| Value: 繁体（前端显示）
 */
const SHISHEN_SIMPLIFIED_TO_TRADITIONAL: Record<string, string> = {
  '正官': '正官',
  '七杀': '七殺',
  '正印': '正印',
  '偏印': '偏印',
  '正财': '正財',
  '偏财': '偏財',
  '食神': '食神',
  '伤官': '傷官',
  '比肩': '比肩',
  '劫财': '劫財',
};

/**
 * 破格因素名称简体转繁体映射表
 * Key: 简体（后端返回）| Value: 繁体（前端显示）
 */
const POGE_TAG_SIMPLIFIED_TO_TRADITIONAL: Record<string, string> = {
  '官杀混杂': '官殺混雜',
  '比劫夺财': '比劫奪財',
  '财多身弱': '財多身弱',
  '伤官见官': '傷官見官',
  '财星坏印': '財星壞印',
  '枭神夺食': '梟神奪食',
  '根气受损': '根氣受損',
  '用神被合': '用神被合',
  '印重身埋': '印重身埋',
  '枭印太旺': '梟印太旺',
  '印星过重': '印星過重',
  '食伤过旺': '食傷過旺',
  '食伤偏旺': '食傷偏旺',
  '杀重无制': '殺重無制',
  '制杀太过': '制殺太過',
  '杀弱身强': '殺弱身強',
  '官星被合': '官星被合',
  '官星无根': '官星無根',
};

/**
 * 救应因素名称简体转繁体映射表
 * Key: 简体（后端返回）| Value: 繁体（前端显示）
 */
const RESCUE_TAG_SIMPLIFIED_TO_TRADITIONAL: Record<string, string> = {
  '印比护官': '印比護官',
  '食伤生财': '食傷生財',
  '财官有根': '財官有根',
  '官印相生': '官印相生',
  '印星制伤': '印星制傷',
  '印星化杀': '印星化殺',
  '食神制杀': '食神制殺',
};

/**
 * 格局名称简体转繁体映射表
 * Key: 简体（后端返回）| Value: 繁体（前端显示）
 */
const PATTERN_SIMPLIFIED_TO_TRADITIONAL: Record<string, string> = {
  '正官格': '正官格',
  '七杀格': '七殺格',
  '正财格': '正財格',
  '偏财格': '偏財格',
  '正印格': '正印格',
  '偏印格': '偏印格',
  '枭印格': '梟印格',
  '食神格': '食神格',
  '伤官格': '傷官格',
  '比肩格': '比肩格',
  '劫财格': '劫財格',
};

/**
 * 稳定度标签简体转繁体映射表
 * Key: 简体（后端返回）| Value: 繁体（前端显示）
 */
const STABILITY_SIMPLIFIED_TO_TRADITIONAL: Record<string, string> = {
  '穩定': '穩定',
  '偏穩': '偏穩',
  '多變': '多變',
  '多波折': '多波折',
  '起伏大': '起伏大',
  '周期波動': '周期波動',
};

/**
 * 强度等级简体转繁体映射表
 * Key: 简体（后端返回）| Value: 繁体（前端显示）
 */
const STRENGTH_SIMPLIFIED_TO_TRADITIONAL: Record<string, string> = {
  '很強': '很強',
  '較強': '較強',
  '中等': '中等',
  '偏弱': '偏弱',
};

/**
 * 根气等级简体转繁体映射表
 * Key: 简体（后端返回）| Value: 繁体（前端显示）
 */
const ROOTING_SIMPLIFIED_TO_TRADITIONAL: Record<string, string> = {
  '有根': '有根',
  '部分有根': '部分有根',
  '無根': '無根',
};

/**
 * 赚钱模式简体转繁体映射表
 * Key: 简体（后端返回）| Value: 繁体（前端显示）
 */
const INCOME_MODE_SIMPLIFIED_TO_TRADITIONAL: Record<string, string> = {
  '穩定工資型': '穩定工資型',
  '浮動績效型': '浮動績效型',
  '機會偏財型': '機會偏財型',
  '創業經營型': '創業經營型',
};

/**
 * 官財格局相关标签简体转繁体映射表
 * Key: 简体（后端返回）| Value: 繁体（前端显示）
 */
const GUANCAI_TAG_SIMPLIFIED_TO_TRADITIONAL: Record<string, string> = {
  '正官為主': '正官為主',
  '七殺為主': '七殺為主',
  '官殺並見': '官殺並見',
  '官殺不顯': '官殺不顯',
  '無明顯官星': '無明顯官星',
  '官殺混雜': '官殺混雜',
  '殺重無制': '殺重無制',
  '官殺有制': '官殺有制',
  '官殺格': '官殺格',
  '正財為主': '正財為主',
  '偏財為主': '偏財為主',
  '財官均衡': '財官均衡',
  '財弱': '財弱',
  '比劫奪財': '比劫奪財',
  '適合體制內': '適合體制內',
  '適合銷售/業績制': '適合銷售/業績制',
  '適合對接項目/資源': '適合對接項目/資源',
  '適合合夥/經營': '適合合夥/經營',
  '靠能力變現': '靠能力變現',
  '適合專業技術線': '適合專業技術線',
};

/**
 * 格局清浊度简体转繁体映射表
 * Key: 简体（后端返回）| Value: 繁体（前端显示）
 */
const PURITY_LEVEL_SIMPLIFIED_TO_TRADITIONAL: Record<string, string> = {
  '清': '清',
  '稍清': '稍清',
  '中和': '中和',
  '中浊': '中濁',
  '浊而有救': '濁而有救',
  '重浊': '重濁',
};

/**
 * 统一转换函数（带 fallback）
 * 
 * 按顺序查找：十神 → 破格因素 → 救应因素 → 格局名称 → 稳定度 → 强度 → 根气 → 赚钱模式 → 官財标签 → 清浊度
 * 找不到则原样返回（避免显示 undefined）
 * 
 * @param simplified 简体字符串（后端返回的格式）
 * @returns 繁体字符串（前端显示的格式）
 */
export function toTraditional(simplified: string): string {
  if (!simplified || typeof simplified !== 'string') {
    return simplified || '';
  }
  
  return SHISHEN_SIMPLIFIED_TO_TRADITIONAL[simplified] ||
         POGE_TAG_SIMPLIFIED_TO_TRADITIONAL[simplified] ||
         RESCUE_TAG_SIMPLIFIED_TO_TRADITIONAL[simplified] ||
         PATTERN_SIMPLIFIED_TO_TRADITIONAL[simplified] ||
         STABILITY_SIMPLIFIED_TO_TRADITIONAL[simplified] ||
         STRENGTH_SIMPLIFIED_TO_TRADITIONAL[simplified] ||
         ROOTING_SIMPLIFIED_TO_TRADITIONAL[simplified] ||
         INCOME_MODE_SIMPLIFIED_TO_TRADITIONAL[simplified] ||
         GUANCAI_TAG_SIMPLIFIED_TO_TRADITIONAL[simplified] ||
         PURITY_LEVEL_SIMPLIFIED_TO_TRADITIONAL[simplified] ||
         simplified;  // fallback：找不到就原样返回（可能是无繁简差异的词）
}

/**
 * 十神名称转换（专用）
 */
export function toTraditionalShishen(simplified: string): string {
  return SHISHEN_SIMPLIFIED_TO_TRADITIONAL[simplified] || simplified;
}

/**
 * 破格因素名称转换（专用）
 */
export function toTraditionalPoge(simplified: string): string {
  return POGE_TAG_SIMPLIFIED_TO_TRADITIONAL[simplified] || simplified;
}

/**
 * 救应因素名称转换（专用）
 */
export function toTraditionalRescue(simplified: string): string {
  return RESCUE_TAG_SIMPLIFIED_TO_TRADITIONAL[simplified] || simplified;
}

/**
 * 十神名称到代码的映射表
 * 支持简体和繁体
 */
const SHISHEN_NAME_TO_CODE: Record<string, string> = {
  // 简体
  '比肩': 'bi_jian',
  '劫财': 'jie_cai',
  '食神': 'shi_shen',
  '伤官': 'shang_guan',
  '正财': 'zheng_cai',
  '偏财': 'pian_cai',
  '正官': 'zheng_guan',
  '七杀': 'qi_sha',
  '正印': 'zheng_yin',
  '偏印': 'pian_yin',
  // 繁体
  '劫財': 'jie_cai',
  '傷官': 'shang_guan',
  '正財': 'zheng_cai',
  '偏財': 'pian_cai',
  '七殺': 'qi_sha',
};

/**
 * 将十神名称（中文）转换为代码（snake_case）
 * 
 * @param name 十神名称（中文，可能包含简繁体）
 * @returns 十神代码，如果找不到则返回 null
 */
export function getShishenCode(name: string): string | null {
  if (!name) return null;
  
  // 直接匹配
  if (SHISHEN_NAME_TO_CODE[name]) {
    return SHISHEN_NAME_TO_CODE[name];
  }
  
  return null;
}

/**
 * 将柱位标签（中文）转换为代码
 * 支持简体和繁体
 * 
 * 注意：此函数与 shenshaMapping.ts 中的 getPillarType 功能相同
 * 为了保持模块独立性，这里也提供一份实现
 */
export function getPillarType(pillarLabel: string): 'year' | 'month' | 'day' | 'hour' | null {
  const mapping: Record<string, 'year' | 'month' | 'day' | 'hour'> = {
    // 简体
    '年柱': 'year',
    '月柱': 'month',
    '日柱': 'day',
    '时柱': 'hour',
    // 繁体
    '時柱': 'hour',
  };
  
  return mapping[pillarLabel] || null;
}

