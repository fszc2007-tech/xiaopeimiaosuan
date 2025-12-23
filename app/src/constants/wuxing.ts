/**
 * 五行生克关系常量配置
 * 
 * 这些是固定的命理学术规则，类似于数学公式
 */

// 五行颜色配置（与 BasicInfoTab 保持一致）
export const WUXING_COLORS = {
  '木': { main: '#52b788', bg: '#d8f3dc', light: '#e8f5ee' },
  '火': { main: '#ff6b6b', bg: '#ffe5e5', light: '#fff0f0' },
  '土': { main: '#d4a373', bg: '#f5ebe0', light: '#faf5f0' },
  '金': { main: '#ffd700', bg: '#fffacd', light: '#fffde7' },
  '水': { main: '#4a90e2', bg: '#e3f2fd', light: '#f0f7ff' },
};

// 日主强弱配色
export const STRENGTH_COLORS = {
  '从弱': { main: '#ef4444', bg: '#fef2f2' },
  '身弱': { main: '#f59e0b', bg: '#fef3c7' },
  '平衡': { main: '#10b981', bg: '#d1fae5' },
  '身强': { main: '#3b82f6', bg: '#dbeafe' },
  '从强': { main: '#8b5cf6', bg: '#ede9fe' },
};

// 天干→五行映射
export const STEM_WUXING_MAP: Record<string, string> = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水',
};

// 地支→五行映射（使用主气）
export const BRANCH_WUXING_MAP: Record<string, string> = {
  '子': '水', '丑': '土', '寅': '木', '卯': '木',
  '辰': '土', '巳': '火', '午': '火', '未': '土',
  '申': '金', '酉': '金', '戌': '土', '亥': '水',
};

// 五行生克关系映射
export const WUXING_RELATIONS: Record<string, {
  我生: string;
  我克: string;
  克我: string;
  生我: string;
  同我: string;
}> = {
  '木': { 我生: '火', 我克: '土', 克我: '金', 生我: '水', 同我: '木' },
  '火': { 我生: '土', 我克: '金', 克我: '水', 生我: '木', 同我: '火' },
  '土': { 我生: '金', 我克: '水', 克我: '木', 生我: '火', 同我: '土' },
  '金': { 我生: '水', 我克: '木', 克我: '火', 生我: '土', 同我: '金' },
  '水': { 我生: '木', 我克: '火', 克我: '土', 生我: '金', 同我: '水' },
};

// 身强/身弱对应的箭头方向映射
export const ARROW_MAP: Record<string, Record<string, 'up' | 'down' | 'none'>> = {
  '身强': {
    '我生': 'up',    // 食伤 - 最喜
    '我克': 'up',    // 财星 - 次喜
    '克我': 'up',    // 官杀 - 三喜
    '生我': 'down',  // 印星 - 次忌
    '同我': 'down',  // 比劫 - 最忌
  },
  '身弱': {
    '生我': 'up',    // 印星 - 最喜
    '同我': 'up',    // 比劫 - 次喜
    '克我': 'down',  // 官杀 - 次忌
    '我克': 'down',  // 财星 - 忌
    '我生': 'down',  // 食伤 - 最忌
  },
  // 平衡格局：根据具体情况，暂时不显示箭头
  '平衡': {
    '我生': 'none',
    '我克': 'none',
    '克我': 'none',
    '生我': 'none',
    '同我': 'none',
  },
  // 从强格局：类似身强
  '从强': {
    '我生': 'up',
    '我克': 'up',
    '克我': 'up',
    '生我': 'down',
    '同我': 'down',
  },
  // 从弱格局：类似身弱但反向
  '从弱': {
    '生我': 'down',
    '同我': 'down',
    '克我': 'up',
    '我克': 'up',
    '我生': 'up',
  },
};

/**
 * 获取天干五行
 */
export function getStemWuxing(stem: string): string {
  return STEM_WUXING_MAP[stem] || '水';
}

/**
 * 获取地支主气五行
 */
export function getBranchWuxing(branch: string): string {
  return BRANCH_WUXING_MAP[branch] || '水';
}

/**
 * 计算天干/地支相对于日主的箭头趋势
 * 
 * @param stemOrBranch - 天干或地支
 * @param dayMasterWuxing - 日主五行
 * @param strengthLabel - 身强/身弱/平衡/从强/从弱
 * @param isStem - 是否为天干
 * @returns 箭头方向 'up' | 'down' | 'none'
 */
export function getPillarTrend(
  stemOrBranch: string,
  dayMasterWuxing: string,
  strengthLabel: string,
  isStem: boolean = true
): 'up' | 'down' | 'none' {
  // 1. 获取该字的五行
  const wuxing = isStem 
    ? getStemWuxing(stemOrBranch) 
    : getBranchWuxing(stemOrBranch);
  
  // 2. 判断与日主的关系
  const relations = WUXING_RELATIONS[dayMasterWuxing];
  if (!relations) return 'none';
  
  let relationType: string;
  
  if (wuxing === relations.我生) relationType = '我生';
  else if (wuxing === relations.我克) relationType = '我克';
  else if (wuxing === relations.克我) relationType = '克我';
  else if (wuxing === relations.生我) relationType = '生我';
  else if (wuxing === relations.同我) relationType = '同我';
  else return 'none';
  
  // 3. 根据身强/身弱映射箭头
  const arrowMap = ARROW_MAP[strengthLabel];
  if (!arrowMap) return 'none';
  
  return arrowMap[relationType] || 'none';
}

/**
 * 获取五行与日主的生克关系描述
 */
export function getWuxingRelation(
  wuxing: string,
  dayMasterWuxing: string
): string {
  const relations = WUXING_RELATIONS[dayMasterWuxing];
  if (!relations) return '未知';
  
  if (wuxing === relations.我生) return '我生的';
  if (wuxing === relations.我克) return '我克的';
  if (wuxing === relations.克我) return '剋我的'; // ✅ 繁体：克→剋
  if (wuxing === relations.生我) return '生我的';
  if (wuxing === relations.同我) return '同我的';
  
  return '未知';
}

/**
 * 获取喜忌等级描述
 */
export function getGodsLevel(
  index: number,
  isFavorable: boolean
): string {
  if (isFavorable) {
    if (index === 0) return '最喜用神';
    if (index === 1) return '次喜用神';
    return '三喜用神';
  } else {
    if (index === 0) return '最忌神';
    return '次忌神';
  }
}
