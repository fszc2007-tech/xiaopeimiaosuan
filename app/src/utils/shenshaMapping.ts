/**
 * 神煞名称到代码的映射工具
 * 
 * 用于将前端显示的神煞名称（中文）映射到后端使用的代码（snake_case）
 */

// 神煞名称到代码的映射表
// 注意：需要与 core/engine/shensha/metadata.ts 保持一致
// 同时支持简体和繁体
const SHENSHA_NAME_TO_CODE: Record<string, string> = {
  // 核心贵人神煞（简体）
  '天乙贵人': 'tian_yi_gui_ren',
  '文昌贵人': 'wen_chang_gui_ren',
  '太极贵人': 'tai_ji_gui_ren',
  '月德贵人': 'yue_de_gui_ren',
  '天德贵人': 'tian_de_gui_ren',
  // 核心贵人神煞（繁体）
  '天乙貴人': 'tian_yi_gui_ren',
  '文昌貴人': 'wen_chang_gui_ren',
  '太極貴人': 'tai_ji_gui_ren',
  '月德貴人': 'yue_de_gui_ren',
  '天德貴人': 'tian_de_gui_ren',
  
  // 辅助吉星神煞（简体）
  '红鸾': 'hong_luan',
  '天喜': 'tian_xi',
  '桃花': 'tao_hua',
  '咸池': 'tao_hua', // 桃花的别名
  '驿马': 'yi_ma',
  '将星': 'jiang_xing',
  '华盖': 'hua_gai',
  // 辅助吉星神煞（繁体）
  '紅鸞': 'hong_luan',
  '驛馬': 'yi_ma',
  '將星': 'jiang_xing',
  '華蓋': 'hua_gai',
  
  // 孤寡丧吊系（简体）
  '孤辰': 'gu_chen',
  '寡宿': 'gua_su',
  '丧门': 'sang_men',
  '吊客': 'diao_ke',
  '披麻': 'pi_ma',
  // 孤寡丧吊系（繁体）
  '喪門': 'sang_men',
  
  // 德合系
  '月德合': 'yue_de_he',
  '天德合': 'tian_de_he',
  
  // 禄位与才华系（简体）
  '德秀贵人': 'de_xiu_gui_ren',
  '龙德贵人': 'long_de_gui_ren',
  '国印贵人': 'guo_yin_gui_ren',
  '天厨贵人': 'tian_chu_gui_ren',
  '建禄': 'jian_lu',
  '专禄': 'zhuan_lu',
  '专禄（归禄）': 'zhuan_lu',
  '词馆': 'ci_guan',
  '流霞': 'liu_xia',
  '八专': 'ba_zhuan',
  '十恶大败': 'shi_e_da_bai',
  // 禄位与才华系（繁体）
  '德秀貴人': 'de_xiu_gui_ren',
  '龍德貴人': 'long_de_gui_ren',
  '國印貴人': 'guo_yin_gui_ren',
  '天廚貴人': 'tian_chu_gui_ren',
  '建祿': 'jian_lu',
  '專祿': 'zhuan_lu',
  '專祿（歸祿）': 'zhuan_lu',
  '詞館': 'ci_guan',
  '八專': 'ba_zhuan',
  '十惡大敗': 'shi_e_da_bai',
  
  // 空亡系统
  '年空亡': 'nian_kong_wang',
  '月空亡': 'yue_kong_wang',
  '日空亡': 'ri_kong_wang',
  
  // 亡神（区分命局和流年）
  '亡神': 'wang_shen_natal',
  '亡神（命局）': 'wang_shen_natal',
  '亡神（流年）': 'wang_shen_flow',
  
  // 流年神煞（简体）
  '太岁': 'tai_sui',
  '岁驾': 'sui_jia',
  '病符': 'bing_fu',
  '劫煞（流年）': 'jie_sha_flow',
  // 流年神煞（繁体）
  '太歲': 'tai_sui',
  '歲駕': 'sui_jia',
};

/**
 * 去掉括号及括号内容
 */
function removeParentheses(text: string): string {
  return text.replace(/（[^）]*）|\([^)]*\)/g, '').trim();
}

/**
 * 将神煞名称（中文）转换为代码（snake_case）
 * 
 * @param name 神煞名称（中文，可能包含括号）
 * @returns 神煞代码，如果找不到则返回 null
 */
export function getShenshaCode(name: string): string | null {
  if (!name) return null;
  
  // 先尝试直接匹配
  if (SHENSHA_NAME_TO_CODE[name]) {
    return SHENSHA_NAME_TO_CODE[name];
  }
  
  // 去掉括号后匹配
  const cleanName = removeParentheses(name);
  if (SHENSHA_NAME_TO_CODE[cleanName]) {
    return SHENSHA_NAME_TO_CODE[cleanName];
  }
  
  // 特殊处理：亡神和劫煞（区分命局和流年版本）
  if (cleanName === '亡神') {
    // 如果原始名称包含"流年"，返回流年版本，否则返回命局版本
    if (name.includes('流年')) {
      return 'wang_shen_flow';
    }
    return 'wang_shen_natal';
  }
  
  if (cleanName === '劫煞') {
    // 如果原始名称包含"流年"，返回流年版本
    if (name.includes('流年')) {
      return 'jie_sha_flow';
    }
    // 目前只有流年版本的劫煞，所以默认返回流年版本
    return 'jie_sha_flow';
  }
  
  return null;
}

/**
 * 将柱位标签（中文）转换为代码
 * 支持简体和繁体
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

