/**
 * 神煞元数据配置（JavaScript 版本）
 * 
 * 本文件定义了所有神煞的元数据信息，包括：
 * - 分类（group/subGroup）
 * - 作用域（scope）
 * - 重要性（isCore）
 * - 触发依据（primaryTrigger）
 * - 语义标签（tags）
 * 
 * 注意：元数据仅作为内部配置，不暴露给 API
 * 如需元数据，可通过 getShenshaMetadata() 函数获取
 */

/**
 * 所有神煞的元数据配置
 * 
 * 总计：38个神煞
 * - 核心贵人神煞：2个
 * - 辅助吉星神煞：5个
 * - 组合神煞：23个（含子分类，包含十惡大敗）
 * - 空亡系统：3个
 * - 流年神煞：5个
 */
export const SHENSHA_METADATA = [
  // ========== 核心贵人神煞（2个） ==========
  {
    id: 'tian_yi_gui_ren',
    name: '天乙贵人',
    group: 'core_noble',
    subGroup: null,
    scope: 'natal',
    isCore: true,
    primaryTrigger: 'dayStem',
    extraTriggers: ['yearStem'],
    tags: ['noble', 'fortune'],
  },
  {
    id: 'wen_chang_gui_ren',
    name: '文昌贵人',
    group: 'core_noble',
    subGroup: null,
    scope: 'natal',
    isCore: true,
    primaryTrigger: 'dayStem',
    extraTriggers: ['yearStem'],
    tags: ['noble', 'talent', 'academic'],
  },

  // ========== 辅助吉星神煞（5个） ==========
  {
    id: 'tai_ji_gui_ren',
    name: '太极贵人',
    group: 'extended_noble',
    subGroup: null,
    scope: 'natal',
    isCore: false,
    primaryTrigger: 'dayStem',
    extraTriggers: ['yearStem'],
    tags: ['noble', 'philosophy'],
  },
  {
    id: 'yue_de_gui_ren',
    name: '月德贵人',
    group: 'extended_noble',
    subGroup: null,
    scope: 'natal',
    isCore: false,
    primaryTrigger: 'monthBranch',
    tags: ['noble', 'virtue'],
  },
  {
    id: 'tian_de_gui_ren',
    name: '天德贵人',
    group: 'extended_noble',
    subGroup: null,
    scope: 'natal',
    isCore: false,
    primaryTrigger: 'monthBranch',
    tags: ['noble', 'virtue'],
  },
  {
    id: 'hong_luan',
    name: '红鸾',
    group: 'extended_noble',
    subGroup: null,
    scope: 'natal',
    isCore: false,
    primaryTrigger: 'yearBranch',
    tags: ['emotion', 'marriage'],
  },
  {
    id: 'tian_xi',
    name: '天喜',
    group: 'extended_noble',
    subGroup: null,
    scope: 'natal',
    isCore: false,
    primaryTrigger: 'yearBranch',
    tags: ['emotion', 'marriage', 'fortune'],
  },

  // ========== 组合神煞 - 三合局系（5个） ==========
  {
    id: 'tao_hua',
    name: '桃花',
    aliases: ['咸池'],
    group: 'combo',
    subGroup: 'triple_harmony',
    scope: 'natal',
    isCore: false,
    primaryTrigger: 'yearBranch',
    tags: ['emotion', 'charm', 'mobility'],
  },
  {
    id: 'yi_ma',
    name: '驿马',
    group: 'combo',
    subGroup: 'triple_harmony',
    scope: 'natal',
    isCore: false,
    primaryTrigger: 'yearBranch',
    tags: ['mobility', 'travel'],
  },
  {
    id: 'jiang_xing',
    name: '将星',
    group: 'combo',
    subGroup: 'triple_harmony',
    scope: 'natal',
    isCore: false,
    primaryTrigger: 'yearBranch',
    tags: ['leadership', 'talent'],
  },
  {
    id: 'hua_gai',
    name: '华盖',
    group: 'combo',
    subGroup: 'triple_harmony',
    scope: 'natal',
    isCore: false,
    primaryTrigger: 'yearBranch',
    tags: ['talent', 'philosophy', 'religion'],
  },
  {
    id: 'wang_shen_natal',
    name: '亡神',
    group: 'combo',
    subGroup: 'triple_harmony',
    scope: 'natal',
    isCore: false,
    primaryTrigger: 'yearBranch',
    tags: ['misfortune', 'loss'],
  },

  // ========== 组合神煞 - 孤寡丧吊系（5个） ==========
  {
    id: 'gu_chen',
    name: '孤辰',
    group: 'combo',
    subGroup: 'solitude_death',
    scope: 'natal',
    isCore: false,
    primaryTrigger: 'yearBranch',
    tags: ['solitude', 'isolation'],
  },
  {
    id: 'gua_su',
    name: '寡宿',
    group: 'combo',
    subGroup: 'solitude_death',
    scope: 'natal',
    isCore: false,
    primaryTrigger: 'yearBranch',
    tags: ['solitude', 'isolation'],
  },
  {
    id: 'sang_men',
    name: '丧门',
    group: 'combo',
    subGroup: 'solitude_death',
    scope: 'natal',
    isCore: false,
    primaryTrigger: 'yearBranch',
    tags: ['death', 'misfortune'],
  },
  {
    id: 'diao_ke',
    name: '吊客',
    group: 'combo',
    subGroup: 'solitude_death',
    scope: 'natal',
    isCore: false,
    primaryTrigger: 'yearBranch',
    tags: ['death', 'misfortune'],
  },
  {
    id: 'pi_ma',
    name: '披麻',
    group: 'combo',
    subGroup: 'solitude_death',
    scope: 'natal',
    isCore: false,
    primaryTrigger: 'yearBranch',
    tags: ['death', 'misfortune'],
  },

  // ========== 组合神煞 - 德合系（2个） ==========
  {
    id: 'yue_de_he',
    name: '月德合',
    group: 'combo',
    subGroup: 'de_he',
    scope: 'natal',
    isCore: false,
    primaryTrigger: 'monthBranch',
    tags: ['virtue', 'harmony'],
  },
  {
    id: 'tian_de_he',
    name: '天德合',
    group: 'combo',
    subGroup: 'de_he',
    scope: 'natal',
    isCore: false,
    primaryTrigger: 'monthBranch',
    tags: ['virtue', 'harmony'],
  },

  // ========== 组合神煞 - 禄位与才华系（10个） ==========
  {
    id: 'de_xiu_gui_ren',
    name: '德秀贵人',
    group: 'combo',
    subGroup: 'noble_lu',
    scope: 'natal',
    isCore: false,
    primaryTrigger: 'monthBranch',
    extraTriggers: ['dayStem', 'yearStem', 'hourStem'],
    tags: ['noble', 'talent', 'virtue'],
  },
  {
    id: 'long_de_gui_ren',
    name: '龙德贵人',
    group: 'combo',
    subGroup: 'noble_lu',
    scope: 'natal',
    isCore: false,
    primaryTrigger: 'yearBranch',
    tags: ['noble', 'fortune'],
  },
  {
    id: 'guo_yin_gui_ren',
    name: '国印贵人',
    group: 'combo',
    subGroup: 'noble_lu',
    scope: 'natal',
    isCore: false,
    primaryTrigger: 'dayStem',
    tags: ['noble', 'authority', 'career'],
  },
  {
    id: 'tian_chu_gui_ren',
    name: '天厨贵人',
    group: 'combo',
    subGroup: 'noble_lu',
    scope: 'natal',
    isCore: false,
    primaryTrigger: 'dayStem',
    tags: ['noble', 'food', 'fortune'],
  },
  {
    id: 'jian_lu',
    name: '建禄',
    group: 'combo',
    subGroup: 'noble_lu',
    scope: 'natal',
    isCore: false,
    primaryTrigger: 'special',
    tags: ['lu', 'career', 'wealth'],
  },
  {
    id: 'zhuan_lu',
    name: '专禄',
    group: 'combo',
    subGroup: 'noble_lu',
    scope: 'natal',
    isCore: false,
    primaryTrigger: 'special',
    tags: ['lu', 'strength', 'independence'],
  },
  {
    id: 'ci_guan',
    name: '词馆',
    group: 'combo',
    subGroup: 'noble_lu',
    scope: 'natal',
    isCore: false,
    primaryTrigger: 'dayStem',
    extraTriggers: ['yearStem'],
    tags: ['talent', 'academic', 'writing'],
  },
  {
    id: 'liu_xia',
    name: '流霞',
    group: 'combo',
    subGroup: 'noble_lu',
    scope: 'natal',
    isCore: false,
    primaryTrigger: 'dayStem',
    tags: ['beauty', 'charm'],
  },
  {
    id: 'ba_zhuan',
    name: '八专',
    group: 'combo',
    subGroup: 'noble_lu',
    scope: 'natal',
    isCore: false,
    primaryTrigger: 'special',
    tags: ['special', 'desire'],
  },
  {
    id: 'shi_e_da_bai',
    name: '十惡大敗',
    group: 'combo',
    subGroup: 'noble_lu',
    scope: 'natal',
    isCore: false,
    primaryTrigger: 'dayPillar',
    tags: ['wealth_loss'],
  },

  // ========== 空亡系统（3个） ==========
  {
    id: 'nian_kong_wang',
    name: '年空亡',
    group: 'void_system',
    subGroup: null,
    scope: 'natal',
    isCore: false,
    primaryTrigger: 'yearBranch',
    tags: ['void', 'emptiness'],
  },
  {
    id: 'yue_kong_wang',
    name: '月空亡',
    group: 'void_system',
    subGroup: null,
    scope: 'natal',
    isCore: false,
    primaryTrigger: 'monthBranch',
    tags: ['void', 'emptiness'],
  },
  {
    id: 'ri_kong_wang',
    name: '日空亡',
    group: 'void_system',
    subGroup: null,
    scope: 'natal',
    isCore: false,
    primaryTrigger: 'dayBranch',
    tags: ['void', 'emptiness'],
  },

  // ========== 流年神煞（5个） ==========
  {
    id: 'tai_sui',
    name: '太岁',
    group: 'flow_year',
    subGroup: null,
    scope: 'flow_year',
    isCore: false,
    primaryTrigger: 'yearBranch',
    tags: ['flow_year', 'authority'],
  },
  {
    id: 'sui_jia',
    name: '岁驾',
    group: 'flow_year',
    subGroup: null,
    scope: 'flow_year',
    isCore: false,
    primaryTrigger: 'yearBranch',
    tags: ['flow_year', 'authority'],
  },
  {
    id: 'bing_fu',
    name: '病符',
    group: 'flow_year',
    subGroup: null,
    scope: 'flow_year',
    isCore: false,
    primaryTrigger: 'yearBranch',
    tags: ['flow_year', 'health', 'misfortune'],
  },
  {
    id: 'wang_shen_flow',
    name: '亡神（流年）',
    group: 'flow_year',
    subGroup: null,
    scope: 'flow_year',
    isCore: false,
    primaryTrigger: 'yearBranch',
    tags: ['flow_year', 'misfortune', 'loss'],
  },
  {
    id: 'jie_sha_flow',
    name: '劫煞（流年）',
    group: 'flow_year',
    subGroup: null,
    scope: 'flow_year',
    isCore: false,
    primaryTrigger: 'yearBranch',
    tags: ['flow_year', 'misfortune', 'robbery'],
  },
];

/**
 * 根据名称获取元数据
 */
export function getMetadataByName(name) {
  return SHENSHA_METADATA.find(m => 
    m.name === name || 
    (m.aliases && m.aliases.includes(name))
  );
}

/**
 * 根据ID获取元数据
 */
export function getMetadataById(id) {
  return SHENSHA_METADATA.find(m => m.id === id);
}

/**
 * 根据分组获取元数据列表
 */
export function getMetadataByGroup(group) {
  return SHENSHA_METADATA.filter(m => m.group === group);
}

/**
 * 根据子分组获取元数据列表
 */
export function getMetadataBySubGroup(subGroup) {
  return SHENSHA_METADATA.filter(m => m.subGroup === subGroup);
}

/**
 * 获取所有神煞元数据
 */
export function getAllMetadata() {
  return SHENSHA_METADATA;
}

