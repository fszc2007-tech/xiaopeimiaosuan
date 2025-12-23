/**
 * 分析模块共享工具函数
 * 从 baziAnalysis.js 提取
 */

import { 
  STEM_ELEMENT, 
  STEM_YIN_YANG, 
  BRANCH_ELEMENT, 
  HIDDEN_STEMS,
  GENERATES,
  CONTROLS,
  MOTHER_OF,
  CONTROLLER_OF,
  ROOT_BRANCH_BONUS,
  MONTH_INDEX,
  SEASON_WEIGHT
} from './constants.js';
import { tenGod } from '../mingli/shishen.js';

/**
 * 限制数值在 0-1 之间
 */
export function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}

/**
 * 对象值求和
 */
export function sum(obj) {
  return Object.values(obj).reduce((a, b) => a + b, 0);
}

/**
 * 收集柱中所有天干（含藏干）
 * 
 * @param {Object} pillar - 柱数据 { stem, branch, canggan }
 * @returns {Array} [{ stem, weight, isStem }, ...]
 */
export function collectAllStems(pillar) {
  if (!pillar || !pillar.stem) return [];
  
  const hidden = pillar.canggan || HIDDEN_STEMS[pillar.branch] || [];
  let hiddenWithWeights = [];
  
  // 处理不同格式的藏干数据
  if (Array.isArray(hidden) && hidden.length > 0) {
    if (typeof hidden[0] === 'string') {
      // 如果是字符串数组，转换为 {stem, weight, isStem} 格式
      hiddenWithWeights = hidden.map(stem => ({ stem, weight: 1 / hidden.length, isStem: false }));
    } else if (typeof hidden[0] === 'object' && hidden[0].stem) {
      // 如果已经是 {stem, weight} 格式，添加 isStem 标记
      hiddenWithWeights = hidden.map(h => ({ ...h, isStem: false }));
    } else {
      // 其他格式，使用默认权重
      hiddenWithWeights = [];
    }
  }
  
  // ✅ 天干标记为 isStem: true（透干）
  return [{ stem: pillar.stem, weight: 1, isStem: true }, ...hiddenWithWeights];
}

/**
 * 获取十神对应的五行元素
 * @param {String} dmEl - 日主五行
 * @param {String} tg - 十神
 * @returns {String} 五行元素
 */
export function tenGodElement(dmEl, tg) {
  if (tg === '比肩' || tg === '劫财') return dmEl;               // 同我
  if (tg === '食神' || tg === '伤官') return GENERATES[dmEl];     // 我生
  if (tg === '正财' || tg === '偏财') return CONTROLS[dmEl];       // 我克
  if (tg === '正印' || tg === '偏印') return MOTHER_OF[dmEl];       // 生我
  // 官杀
  return CONTROLLER_OF[dmEl];                                     // 克我
}

/**
 * 计算十神在月令季节的支持度
 * @param {String} dmEl - 日主五行
 * @param {String} tg - 十神
 * @param {Number} monthIdx - 月支索引（0-11）
 * @returns {Number} 支持度（0-1）
 */
export function seasonSupportOfTG(dmEl, tg, monthIdx) {
  const tgEl = tenGodElement(dmEl, tg);
  return SEASON_WEIGHT[tgEl]?.[monthIdx] || 0.5;
}

/**
 * 计算日支为旺地的加分
 * @param {String} dmEl - 日主五行
 * @param {String} dayBranch - 日支
 * @returns {Number} 加分值（0/0.4/0.8）
 */
export function rootStageBonus(dmEl, dayBranch) {
  const conf = ROOT_BRANCH_BONUS[dmEl];
  if (!conf) return 0;
  if (conf.strong.includes(dayBranch)) return 0.8; // 临官/帝旺
  if (conf.minor.includes(dayBranch)) return 0.4;  // 长生/余气
  return 0;
}

/**
 * 十神计算（使用 engine/mingli/shishen.js 中的函数）
 * @param {String} dayStem - 日主天干
 * @param {String} otherStem - 他干
 * @returns {String} 十神名称
 */
export { tenGod as tenGodOf };

// ========== 十神分组和关系判断 ==========

/**
 * 十神分组
 */
const TEN_GOD_GROUPS = {
  '比劫': ['比肩', '劫财'],
  '食伤': ['食神', '伤官'],
  '财星': ['正财', '偏财'],
  '官杀': ['正官', '七杀'],
  '印星': ['正印', '偏印']
};

/**
 * 获取十神分组
 * @param {String} shishen - 十神名称
 * @returns {String} 分组名称
 */
function getTenGodGroup(shishen) {
  for (const [group, members] of Object.entries(TEN_GOD_GROUPS)) {
    if (members.includes(shishen)) {
      return group;
    }
  }
  return shishen;
}

/**
 * 十神生关系（用于 dogong 分析）
 * 基于分组判断：印星→比劫→食伤→财星→官杀→印星
 * @param {String} from - 源十神
 * @param {String} to - 目标十神
 * @returns {Boolean}
 */
export function hasGenerateRelation(from, to) {
  const relations = {
    '印星': ['比劫'],
    '比劫': ['食伤'],
    '食伤': ['财星'],
    '财星': ['官杀'],
    '官杀': ['印星']
  };
  
  const fromGroup = getTenGodGroup(from);
  const toGroup = getTenGodGroup(to);
  
  return relations[fromGroup]?.includes(toGroup) || false;
}

/**
 * 十神克关系（用于 dogong 分析）
 * 基于分组判断：比劫→财星→印星→食伤→官杀→比劫
 * @param {String} from - 源十神
 * @param {String} to - 目标十神
 * @returns {Boolean}
 */
export function hasControlRelation(from, to) {
  const relations = {
    '比劫': ['财星'],
    '财星': ['印星'],
    '印星': ['食伤'],
    '食伤': ['官杀'],
    '官杀': ['比劫']
  };
  
  const fromGroup = getTenGodGroup(from);
  const toGroup = getTenGodGroup(to);
  
  return relations[fromGroup]?.includes(toGroup) || false;
}

/**
 * 十神生关系（用于 timeline 分析）
 * 基于具体十神判断
 */
const SHENG_RELATIONS = {
  '正印': ['比肩', '劫财'],
  '偏印': ['比肩', '劫财'],
  '比肩': ['食神', '伤官'],
  '劫财': ['食神', '伤官'],
  '食神': ['正财', '偏财'],
  '伤官': ['正财', '偏财'],
  '正财': ['正官', '七杀'],
  '偏财': ['正官', '七杀'],
  '正官': ['正印', '偏印'],
  '七杀': ['正印', '偏印']
};

/**
 * 十神克关系（用于 timeline 分析）
 * 基于具体十神判断
 */
const KE_RELATIONS = {
  '比肩': ['正财', '偏财'],
  '劫财': ['正财', '偏财'],
  '正财': ['正印', '偏印'],
  '偏财': ['正印', '偏印'],
  '正印': ['食神', '伤官'],
  '偏印': ['食神', '伤官'],
  '食神': ['七杀'],
  '伤官': ['正官'],
  '正官': ['比肩', '劫财'],
  '七杀': ['比肩', '劫财']
};

/**
 * 判断是否有生关系（用于 timeline 分析）
 * @param {String} sourceGod - 源十神
 * @param {String} targetGod - 目标十神
 * @returns {Boolean}
 */
export function hasShengRelation(sourceGod, targetGod) {
  const targets = SHENG_RELATIONS[sourceGod];
  return targets && targets.includes(targetGod);
}

/**
 * 判断是否有克关系（用于 timeline 分析）
 * @param {String} sourceGod - 源十神
 * @param {String} targetGod - 目标十神
 * @returns {Boolean}
 */
export function hasKeRelation(sourceGod, targetGod) {
  const targets = KE_RELATIONS[sourceGod];
  return targets && targets.includes(targetGod);
}

// ========== 位置关系分析工具函数 ==========

/**
 * 位置强度权重配置
 * 用于计算不同位置、不同类型（天干/地支）的强度
 */
const POSITION_STRENGTH_WEIGHTS = {
  month: { stem: 1.0, branch: 0.8 },
  day: { stem: 0.9, branch: 1.0 },
  hour: { stem: 0.7, branch: 0.6 },
  year: { stem: 0.6, branch: 0.5 }
};

/**
 * 计算位置强度权重
 * @param {String} position - 位置：'year' | 'month' | 'day' | 'hour'
 * @param {String} type - 类型：'stem' | 'branch'
 * @returns {Number} 强度权重（0-1）
 */
export function calculatePositionStrength(position, type) {
  return POSITION_STRENGTH_WEIGHTS[position]?.[type] || 0.5;
}

/**
 * 获取十神在四柱中的位置信息
 * @param {Object} pillars - 四柱数据 { year, month, day, hour }
 * @param {String} targetGod - 目标十神名称（如 '食神'、'七杀'）
 * @param {String} dayStem - 日主天干
 * @returns {Array} 位置信息数组 [{ position, type, god, pillar, strength, hiddenStem? }, ...]
 */
export function getShishenPositions(pillars, targetGod, dayStem) {
  if (!pillars || !dayStem || !targetGod) return [];
  
  const positions = [];
  const positionOrder = ['year', 'month', 'day', 'hour'];
  
  for (const position of positionOrder) {
    const pillar = pillars[position];
    if (!pillar) continue;
    
    // 检查天干
    // ✅ 修复：使用 tenGod 而不是 tenGodOf（文件内部直接使用导入的函数）
    const stemGod = tenGod(dayStem, pillar.stem);
    if (stemGod === targetGod) {
      positions.push({
        position,
        type: 'stem',
        god: stemGod,
        pillar,
        strength: calculatePositionStrength(position, 'stem')
      });
    }
    
    // 检查地支藏干
    const allStems = collectAllStems(pillar);
    for (const h of allStems) {
      if (!h.isStem) { // 只检查藏干，不重复检查天干
        // ✅ 修复：使用 tenGod 而不是 tenGodOf
        const branchGod = tenGod(dayStem, h.stem);
        if (branchGod === targetGod) {
          positions.push({
            position,
            type: 'branch',
            god: branchGod,
            pillar,
            hiddenStem: h.stem,
            strength: calculatePositionStrength(position, 'branch') * h.weight
          });
        }
      }
    }
  }
  
  return positions;
}

/**
 * 检查十神是否透干
 * @param {Object} pillars - 四柱数据
 * @param {String} targetGod - 目标十神名称
 * @param {String} dayStem - 日主天干
 * @returns {Boolean}
 */
export function isGodRevealed(pillars, targetGod, dayStem) {
  if (!pillars || !dayStem || !targetGod) return false;
  
  for (const position of ['year', 'month', 'day', 'hour']) {
    const pillar = pillars[position];
    if (!pillar) continue;
    
    // ✅ 修复：使用 tenGod 而不是 tenGodOf（文件内部直接使用导入的函数）
    const stemGod = tenGod(dayStem, pillar.stem);
    if (stemGod === targetGod) {
      return true;
    }
  }
  
  return false;
}

/**
 * 检查十神是否得地（有强根）
 * @param {Object} pillars - 四柱数据
 * @param {String} targetGod - 目标十神名称
 * @param {String} dayStem - 日主天干
 * @returns {Boolean}
 */
export async function isGodRooted(pillars, targetGod, dayStem) {
  if (!pillars || !dayStem || !targetGod) return false;
  
  const positions = getShishenPositions(pillars, targetGod, dayStem);
  
  // 检查是否有地支藏干
  const branchPositions = positions.filter(p => p.type === 'branch');
  if (branchPositions.length === 0) return false;
  
  // 动态导入 stage12 来检查十二运
  const { stage12 } = await import('../mingli/stage12.js');
  const strongStages = ['临官', '帝旺', '长生'];
  
  for (const pos of branchPositions) {
    if (pos.hiddenStem && pos.pillar?.branch) {
      const stage = stage12(pos.hiddenStem, pos.pillar.branch);
      if (strongStages.includes(stage)) {
        return true;
      }
    }
  }
  
  // 如果没有强根，但至少有藏干，也算有根（弱根）
  return branchPositions.length > 0;
}

/**
 * 检查制化有效性（用于十神组合格局判断）
 * 判断两个十神之间是否形成有效的制化关系
 * @param {Array} controllerPositions - 制化方位置数组（如食神位置）
 * @param {Array} controlledPositions - 被制化方位置数组（如七杀位置）
 * @returns {Object} { effective: Boolean, controlType: String, description: String }
 */
export function checkZhishaEffectiveness(controllerPositions, controlledPositions) {
  if (!controllerPositions || !controlledPositions || 
      controllerPositions.length === 0 || controlledPositions.length === 0) {
    return {
      effective: false,
      controlType: '无制化',
      description: '缺少制化关系'
    };
  }
  
  const positionOrder = ['year', 'month', 'day', 'hour'];
  
  // 1. 检查同柱制化（最强）
  for (const controller of controllerPositions) {
    for (const controlled of controlledPositions) {
      if (controller.position === controlled.position) {
        if (controller.type === 'stem' && controlled.type === 'stem') {
          return {
            effective: true,
            controlType: '同柱制化（最强）',
            description: '制化双方同柱透干，制化效果最强'
          };
        } else {
          return {
            effective: true,
            controlType: '同柱制化',
            description: '制化双方同柱，制化效果良好'
          };
        }
      }
    }
  }
  
  // 2. 检查相邻制化（次强）
  for (const controller of controllerPositions) {
    for (const controlled of controlledPositions) {
      const controllerIndex = positionOrder.indexOf(controller.position);
      const controlledIndex = positionOrder.indexOf(controlled.position);
      
      if (controllerIndex === -1 || controlledIndex === -1) continue;
      
      const distance = Math.abs(controllerIndex - controlledIndex);
      
      if (distance === 1) {
        // 相邻
        if (controllerIndex < controlledIndex) {
          return {
            effective: true,
            controlType: '顺位制化（良好）',
            description: '制化方在前，被制化方在后，顺位制化'
          };
        } else {
          return {
            effective: true,
            controlType: '逆位制化（次之）',
            description: '制化方在后，被制化方在前，逆位制化'
          };
        }
      } else if (distance === 2) {
        // 间隔一柱
        return {
          effective: true,
          controlType: '遥制（较弱）',
          description: '制化双方间隔一柱，制化效果较弱'
        };
      }
    }
  }
  
  // 3. 遥制（最弱）
  return {
    effective: true,
    controlType: '遥制（最弱）',
    description: '制化双方距离较远，制化效果最弱'
  };
}

/**
 * 检查是否有有效的制化关系（简化版，用于快速判断）
 * @param {Array} controllerPositions - 制化方位置数组
 * @param {Array} controlledPositions - 被制化方位置数组
 * @returns {Boolean}
 */
export function hasEffectiveControl(controllerPositions, controlledPositions) {
  const result = checkZhishaEffectiveness(controllerPositions, controlledPositions);
  return result.effective;
}

/**
 * 检查是否可以使用食伤作为救应因素
 * @param {Object} flags - context.flags 对象
 * @returns {Boolean}
 */
export function canUseShiAsRescue(flags) {
  return !flags?.shi_overflow;
}

/**
 * 检查是否可以使用印星作为救应因素（针对非印星相关的破格）
 * @param {Object} flags - context.flags 对象
 * @param {String} targetPoge - 目标破格类型（如 '官杀混杂'）
 * @returns {Boolean}
 */
export function canUseYinAsRescue(flags, targetPoge) {
  // 如果印星本身过重，且不是针对特定破格的救应，则不能用
  if (flags?.yin_overflow) {
    // 特殊情况：印星化杀（针对官杀混杂）可以保留
    if (targetPoge === '官杀混杂') {
      return true; // 即使印星过重，化杀也是有效的
    }
    return false;
  }
  return true;
}

/**
 * 检查是否可以使用比劫作为救应因素
 * @param {Object} flags - context.flags 对象
 * @returns {Boolean}
 */
export function canUseBiAsRescue(flags) {
  return !flags?.bi_overflow;
}

/**
 * 检查是否可以使用财星作为救应因素
 * @param {Object} flags - context.flags 对象
 * @returns {Boolean}
 */
export function canUseCaiAsRescue(flags) {
  return !flags?.cai_overflow;
}

