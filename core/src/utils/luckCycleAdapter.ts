/**
 * 大运时间轴适配层
 * 
 * 职责：将引擎原始大运数据转换为前端格式
 * 
 * 设计文档：大运时间轴卡片优化方案-最终版.md
 */

// ===== 类型定义 =====

/**
 * 引擎层输出（内部结构，private）
 */
export interface RawLuckCycle {
  stem: string;              // 天干
  branch: string;            // 地支
  stemBranch?: string;       // 干支组合，如 "甲子"（如果没有则从 stem+branch 拼接）
  shishen: string;           // 十神，如 "偏财"、"正官"
  startAge: number;          // 起运虚岁
  endAge: number;            // 下一步大运起运虚岁（不包含）
  startUTC: Date | string;   // 起运精确时间
  endUTC: Date | string;     // 结束精确时间
  rawFavour?: '用神' | '中性' | '忌神';  // 原始喜忌判断
  favourScore?: number;      // -2 ~ +2，喜忌强度，Phase 1 不强依赖
  // ... 其他命理相关字段
}

/**
 * 适配层输出（对前端公开）
 */
export interface LuckCycleData {
  id: string;                // 唯一 ID，如 "甲子-31"
  stemBranch: string;        // "甲子"
  shishen: string;           // 十神（如 "偏财"）
  startAge: number;          // 31
  endAge: number;            // 41（下一运起运虚岁，不包含）
  startYear: number;         // 比如 2025
  endYear: number;           // 比如 2035（下一运起运年，不包含）
  favourLevel: 'good' | 'wave' | 'flat';  // 顺 / 波动 / 平
  toneTag: string;           // 一行简评，例如 "整体偏顺"
  keywords: string[];        // 3–5 个关键词
  isCurrent: boolean;        // 是否当前大运
}

// ===== 核心转换函数 =====

/**
 * 将引擎原始大运数据转换为前端格式
 */
export function buildLuckCycleForApp(
  rawLuckCycle: RawLuckCycle[],
  currentAge: number
): LuckCycleData[] {
  return rawLuckCycle.map((raw) => {
    const startYear = getYearFromUTC(raw.startUTC);
    const endYear = getYearFromUTC(raw.endUTC);
    
    // 确保 stemBranch 存在
    const stemBranch = raw.stemBranch || `${raw.stem}${raw.branch}`;
    
    // 映射 favourLevel
    const favourLevel = mapFavourLevel(raw.rawFavour, raw.favourScore);
    
    // 生成 toneTag（规则表）
    const toneTag = getToneTag(favourLevel, raw.shishen);
    
    // 生成 keywords（规则表）
    const keywords = getKeywords(favourLevel, raw.shishen);
    
    // 判断是否当前大运（半开区间 [startAge, endAge)）
    const isCurrent = currentAge >= raw.startAge && currentAge < raw.endAge;
    
    return {
      id: `${stemBranch}-${raw.startAge}`,
      stemBranch,
      shishen: raw.shishen,
      startAge: raw.startAge,
      endAge: raw.endAge,
      startYear,
      endYear,
      favourLevel,
      toneTag,
      keywords,
      isCurrent,
    };
  });
}

/**
 * 从 UTC 时间提取年份
 */
function getYearFromUTC(utc: Date | string): number {
  const date = typeof utc === 'string' ? new Date(utc) : utc;
  return date.getFullYear();
}

// ===== favourLevel 映射 =====

/**
 * 映射原始喜忌为 UI 展示档位
 *
 * 目前 Phase 1 仅使用 rawFavour，
 * favourScore 作为后续精细化调整的预留字段。
 *
 * 向后兼容：如果 rawFavour 缺失，则一律按 'flat'（平稳）处理。
 */
function mapFavourLevel(
  rawFavour?: '用神' | '中性' | '忌神',
  favourScore?: number
): 'good' | 'wave' | 'flat' {
  if (!rawFavour) {
    // 兼容旧数据：一律按平稳处理
    return 'flat';
  }
  
  if (rawFavour === '用神') return 'good';
  if (rawFavour === '中性') return 'flat';
  
  // rawFavour === '忌神'
  // 统一映射为 'wave'（波动），避免吓用户
  return 'wave';
}

// ===== toneTag 规则表 =====

/**
 * toneTag 规则表
 * 格式：`${favourLevel}-${shishen}` → 标签文本
 */
const toneTagMap: Record<string, string> = {
  // ===== 用神 + 吉十神 =====
  'good-正官': '整体偏顺',
  'good-偏官': '压力中有机会',
  'good-正财': '收获期，资源聚拢',
  'good-偏财': '机会多、人脉活跃',
  'good-食神': '学习成长期',
  'good-伤官': '突破创新期',
  'good-正印': '贵人相助，稳步提升',
  'good-偏印': '思考深入，适合学习',
  'good-比肩': '合作机会增多',
  'good-劫财': '竞争激烈但有机会',
  
  // ===== 中性 =====
  'flat-正官': '稳中小进',
  'flat-偏官': '压力与机会并存',
  'flat-正财': '脚踏实地慢慢来',
  'flat-偏财': '机会与风险并存',
  'flat-食神': '平稳发展期',
  'flat-伤官': '需要控制情绪',
  'flat-正印': '调整蓄力期',
  'flat-偏印': '思考期，不宜冲动',
  'flat-比肩': '合作需谨慎',
  'flat-劫财': '竞争压力略大',
  
  // ===== 忌神 → 波动 =====
  'wave-正官': '压力增大，需要稳住',
  'wave-偏官': '压力与突破并存',
  'wave-正财': '财务压力，需谨慎',
  'wave-偏财': '花费增多，要懂取舍',
  'wave-食神': '情绪波动，注意调节',
  'wave-伤官': '容易冲动，需冷静',
  'wave-正印': '依赖心理，需独立',
  'wave-偏印': '思虑过多，需行动',
  'wave-比肩': '竞争压力略大',
  'wave-劫财': '竞争激烈，需谨慎',
};

/**
 * 获取 toneTag（含向后兼容）
 */
function getToneTag(
  level: 'good' | 'wave' | 'flat',
  shishen?: string
): string {
  if (!shishen) {
    // 极端情况下 shishen 为空的 fallback
    if (level === 'good') return '整体偏顺';
    if (level === 'wave') return '压力与机会并存';
    return '整体平稳，适合内调整';
  }
  
  const key = `${level}-${shishen}`;
  const tag = toneTagMap[key];
  
  if (tag) return tag;
  
  // toneTagMap 未覆盖的组合
  if (level === 'good') return '整体偏顺';
  if (level === 'wave') return '压力与机会并存';
  return '整体平稳，适合内调整';
}

// ===== keywords 规则表 =====

/**
 * keywords 规则表
 * 格式：`${favourLevel}-${shishen}` → 关键词数组
 */
const keywordMap: Record<string, string[]> = {
  // ===== 用神 + 吉十神 =====
  'good-正官': ['事业稳定发展', '责任感提升', '适合规划长远'],
  'good-偏官': ['压力中有机会', '适合挑战', '需要主动出击'],
  'good-正财': ['收获期', '资源聚拢', '适合理财规划'],
  'good-偏财': ['偏财机会多', '人际应酬多', '适合拓展副业'],
  'good-食神': ['学习成长期', '适合进修', '创意灵感多'],
  'good-伤官': ['突破创新期', '适合尝试新方向', '表达欲增强'],
  'good-正印': ['贵人相助', '稳步提升', '适合学习'],
  'good-偏印': ['思考深入', '适合研究', '灵感增多'],
  'good-比肩': ['合作机会增多', '适合团队协作', '人脉拓展'],
  'good-劫财': ['竞争激烈但有机会', '需要主动争取', '适合合作'],
  
  // ===== 中性 =====
  'flat-正官': ['稳中小进', '适合规划', '不要急躁'],
  'flat-偏官': ['压力与机会并存', '需要平衡', '谨慎决策'],
  'flat-正财': ['脚踏实地', '慢慢积累', '不宜冒进'],
  'flat-偏财': ['机会与风险并存', '需要谨慎', '不宜大额投资'],
  'flat-食神': ['平稳发展', '适合学习', '保持节奏'],
  'flat-伤官': ['需要控制情绪', '避免冲动', '理性思考'],
  'flat-正印': ['调整蓄力期', '适合学习', '不要急于求成'],
  'flat-偏印': ['思考期', '不宜冲动', '需要沉淀'],
  'flat-比肩': ['合作需谨慎', '避免竞争', '保持和谐'],
  'flat-劫财': ['竞争压力略大', '需要谨慎', '避免冲突'],
  
  // ===== 忌神 → 波动 =====
  'wave-正官': ['压力增大', '需要稳住', '不要硬扛'],
  'wave-偏官': ['压力与突破并存', '适合磨炼心性', '不要硬扛，学会求助'],
  'wave-正财': ['财务压力', '需谨慎', '不宜大额支出'],
  'wave-偏财': ['消费欲增强', '投资需谨慎', '容易冲动花钱'],
  'wave-食神': ['情绪波动', '注意调节', '保持冷静'],
  'wave-伤官': ['容易冲动', '需冷静', '避免口舌'],
  'wave-正印': ['依赖心理', '需独立', '不要过度依赖'],
  'wave-偏印': ['思虑过多', '需行动', '避免钻牛角尖'],
  'wave-比肩': ['竞争压力略大', '需要谨慎', '避免冲突'],
  'wave-劫财': ['竞争激烈', '需谨慎', '避免破财'],
};

/**
 * 获取 keywords（含向后兼容）
 */
function getKeywords(
  favourLevel: 'good' | 'wave' | 'flat',
  shishen?: string
): string[] {
  if (!shishen) {
    // 极端情况下 shishen 为空，返回空数组
    return [];
  }
  
  const key = `${favourLevel}-${shishen}`;
  const keywords = keywordMap[key];
  
  // 如果查不到配置，就返回空数组 []，UI 可直接不渲染关键词区域
  return keywords || [];
}





