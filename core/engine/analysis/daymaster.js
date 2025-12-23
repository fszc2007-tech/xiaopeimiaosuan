/**
 * 日主强弱判断（子平 + 盲派）
 * 
 * 算法（V3.0 修正版）：
 * 1. 得令：月令五行与日主关系（子平45%，盲派45%）
 * 2. 得地：地支通根情况（子平35%，盲派35%）+ 日支旺地加分
 *    - V3.0 修正：使用 filter 允许一支多根
 * 3. 得助：比劫/印星帮扶（子平25%，盲派20%）
 *    - V3.0 修正：分离 biPower 和 printPower，避免重复计算
 * 4. 耗身：财官食伤（考虑印星化杀）
 * 5. 位置加权：月柱1.3倍，日柱1.15倍（子平）
 * 6. 季节加权：当令十神权重更高
 * 
 * 分档（V3.0 增加身偏弱）：
 * - 0.0 - 0.22: 从弱（需满足：不得令 w_month≤0.4 且 无根 root≤0.6）
 * - 0.22 - 0.35: 身弱
 * - 0.35 - 0.45: 身偏弱（当耗身 > 1.2 × 帮身）或 身弱
 * - 0.45 - 0.50: 平衡
 * - 0.50 - 0.62: 身偏强（当帮身 > 1.2 × 耗身）或 平衡
 * - 0.62 - 0.85: 身强
 * - 0.85 - 1.0: 从强（需满足：得令 w_month≥0.7 或 得地 root≥0.9）
 * 
 * @param {Object} pillars - 四柱数据
 * @param {Object} options - { school: 'ziping' | 'mangpai' }
 * @returns {Object} { score: 0.65, band: '身强', detail: {...} }
 */

import { 
  STEM_ELEMENT, 
  HIDDEN_STEMS, 
  SEASON_WEIGHT, 
  MONTH_INDEX,
  CONTROLLER_OF,  // ✅ 新增：克我者（官杀）五行映射
  BRANCH_ELEMENT  // ✅ 新增：地支本气五行
} from './constants.js';
import { 
  clamp01, 
  collectAllStems, 
  tenGodOf, 
  seasonSupportOfTG, 
  rootStageBonus 
} from './utils.js';

/**
 * ✅ V3.1 新增：检查官杀是否有通根
 * 从强格的核心条件：满盘印比，几乎无财官食伤的根气
 * 如果官杀有通根，说明有制化力量，不能算从强
 * 
 * @param {string} dmElement - 日主五行
 * @param {Object} pillars - 四柱数据
 * @returns {boolean} 官杀是否有通根
 */
function hasControllerRoot(dmElement, pillars) {
  if (!dmElement || !pillars) return false;
  
  // 获取官杀五行（克我者）
  const controllerElement = CONTROLLER_OF[dmElement];
  if (!controllerElement) return false;
  
  // 检查四支
  for (const pos of ['year', 'month', 'day', 'hour']) {
    const branch = pillars[pos]?.branch;
    if (!branch) continue;
    
    // 1. 检查地支本气是否为官杀五行
    if (BRANCH_ELEMENT[branch] === controllerElement) {
      return true; // 官杀有本气根
    }
    
    // 2. 检查藏干中是否有官杀五行的天干
    const hidden = HIDDEN_STEMS[branch] || [];
    for (const h of hidden) {
      const hStem = typeof h === 'string' ? h : h.stem;
      const hWeight = typeof h === 'string' ? 1 / hidden.length : h.weight;
      
      // 如果藏干五行是官杀五行，且权重 >= 0.2（非余气）
      if (STEM_ELEMENT[hStem] === controllerElement && hWeight >= 0.2) {
        return true; // 官杀有藏干根
      }
    }
  }
  
  return false;
}

export function computeDayMasterStrength(pillars, options = {}) {
  const school = options.school || 'ziping';
  
  if (!pillars.day || !pillars.day.stem) {
    return { score: 0.5, band: '平衡', detail: {} };
  }
  
  const dayStem = pillars.day.stem;
  const dmElement = STEM_ELEMENT[dayStem];
  const monthBranch = pillars.month?.branch;
  if (!monthBranch) {
    return { score: 0.5, band: '平衡', detail: {} };
  }
  const monthIdx = MONTH_INDEX[monthBranch];
  if (monthIdx === undefined) {
    return { score: 0.5, band: '平衡', detail: {} };
  }
  
  // ✅ 学派权重配置（V2.0 - 软归一化，V2.1优化）
  const cfg = school === 'ziping'
    ? { 
        k_season: 0.45, k_root: 0.35, k_help: 0.25,  // ✅ V2.0 调整系数
        drainCoef: 0.35, printMitigate: 0.35,        // ✅ V2.1 进一步降低耗身扣分，提高印星化杀权重
        monthBoost: 1.30, dayBoost: 1.15, 
        rootBonusScale: 0.5,
        normScale: { root: 1.50, help: 3.50, drain: 1.50 },  // ✅ V2.1 提高得助归一化scale
        baseBonus: 0.12  // ✅ V2.1 基础加分（考虑印比力量明显强于耗身的情况）
      }
    : { 
        k_season: 0.45, k_root: 0.35, k_help: 0.20, 
        drainCoef: 0.50, printMitigate: 0.30, 
        monthBoost: 1.15, dayBoost: 1.10, 
        rootBonusScale: 0.9,
        normScale: { root: 1.50, help: 2.00, drain: 1.50 }  // ✅ V2.0 软归一化
      };
  
  // 1. 得令（月令）
  const w_month = SEASON_WEIGHT[dmElement]?.[monthIdx] || 0.5;
  
  // 2. 得地（通根）：日主在各支的藏干出现
  // ✅ V3.0 修正：使用 filter 允许一支多根（原 find 只取第一个）
  let root = 0;
  const rootWeights = {};
  ['year', 'month', 'day', 'hour'].forEach((k) => {
    const p = pillars[k];
    if (!p) return;
    
    const hidden = p.canggan || HIDDEN_STEMS[p.branch] || [];
    // ✅ 使用 filter 找出所有符合条件的藏干
    const hits = hidden.filter(h => {
      const hStem = typeof h === 'string' ? h : h.stem;
      return hStem === dayStem || STEM_ELEMENT[hStem] === dmElement;
    });
    
    // ✅ 累加所有符合条件的藏干权重
    hits.forEach(hit => {
      const hStem = typeof hit === 'string' ? hit : hit.stem;
      const hWeight = typeof hit === 'string' ? 1 / hidden.length : hit.weight;
      // 同干权重1.0，同五行权重0.6
      const w = hStem === dayStem ? hWeight * 1.0 : hWeight * 0.6;
      root += w;
      rootWeights[k] = (rootWeights[k] || 0) + w;
    });
  });
  
  // ✅ 添加日支为旺地的加分
  const dayBranchBonus = rootStageBonus(dmElement, pillars.day.branch);
  root += dayBranchBonus * cfg.rootBonusScale;
  
  // 3. 比劫助身 & 印星护身；财官食伤耗身（考虑位置加权和季节加权）
  // ✅ V3.0 修正：分离 biPower 和 printPower，避免重复计算
  let biPower = 0, printPower = 0, drain = 0;
  const helperDetail = {};
  
  ['year', 'month', 'day', 'hour'].forEach((k, i) => {
    const p = pillars[k];
    if (!p) return;
    
    // ✅ 位置加权
    const placeBoost = p === pillars.month ? cfg.monthBoost 
                      : p === pillars.day ? cfg.dayBoost 
                      : 1.0;
    
    const idx = ['Y', 'M', 'D', 'H'][i];
    collectAllStems(p).forEach(h => {
      const tg = tenGodOf(dayStem, h.stem);
      
      // ✅ 季节加权
      const tgSeason = seasonSupportOfTG(dmElement, tg, monthIdx);
      const seasonBoost = 0.7 + 0.6 * tgSeason; // 0.7~1.3
      
      const w = h.weight * placeBoost * seasonBoost;
      
      if (tg === '比肩' || tg === '劫财') {
        biPower += 0.8 * w;  // ✅ 比劫单独记录
        helperDetail[idx + tg] = (helperDetail[idx + tg] || 0) + 0.8 * w;
      } else if (tg === '正印' || tg === '偏印') {
        printPower += 0.85 * w;  // ✅ 印星单独记录
        helperDetail[idx + tg] = (helperDetail[idx + tg] || 0) + 0.85 * w;
      } else if (tg === '正官' || tg === '七杀') {
        drain += 0.85 * w;
      } else if (tg === '正财' || tg === '偏财') {
        drain += 0.75 * w;
      } else if (tg === '食神' || tg === '伤官') {
        drain += 0.55 * w;
      }
    });
  });
  
  // ✅ V3.0: help = biPower + printPower（总帮扶力量）
  const help = biPower + printPower;
  
  // ✅ 印星化杀机制
  const drainEffective = drain * (1 - Math.min(0.30, printPower * cfg.printMitigate));
  
  // ✅ V3.0: 软归一化函数
  const norm = (x, scale) => Math.max(0, Math.min(1, x / scale));
  
  // 4. 综合计算（V3.0 优化）
  const pos = cfg.k_season * w_month 
            + cfg.k_root * norm(root, cfg.normScale.root) 
            + cfg.k_help * norm(help, cfg.normScale.help);
  const baseBonus = cfg.baseBonus !== undefined ? cfg.baseBonus : 0.08;
  const raw = pos - cfg.drainCoef * norm(drainEffective, cfg.normScale.drain) + baseBonus;
  
  const score = clamp01(raw);
  
  // ✅ V3.0 修正：helpPower = help（不再重复加 printPower）
  const helpPower = help;  // help 已经 = biPower + printPower
  const drainPower = drainEffective;
  
  // ✅ V3.0: 分档逻辑（增加身偏弱，对称处理）
  let band;
  if (score >= 0.85) {
    band = '从强';
  } else if (score >= 0.62) {
    band = '身强';
  } else if (score >= 0.50) {
    // ✅ 50%-62%：判断为"身偏强"（当帮身 > 1.2 × 耗身）或"平衡"
    if (helpPower > drainPower * 1.2) {
      band = '身偏强';
    } else {
      band = '平衡';
    }
  } else if (score >= 0.45) {
    band = '平衡';
  } else if (score >= 0.35) {
    // ✅ V3.0 新增：35%-45%：判断为"身偏弱"（当耗身 > 1.2 × 帮身）或"身弱"
    if (drainPower > helpPower * 1.2) {
      band = '身偏弱';
    } else {
      band = '身弱';
    }
  } else if (score >= 0.22) {
    band = '身弱';
  } else {
    band = '从弱';
  }
  
  // ✅ V3.1: 从格闸门（防止误判）- 增强版
  if (band === '从强') {
    // 从强闸门条件：
    // 1. 印比力量 ≥ 1.6 × 财官食伤
    // 2. 财官食伤 ≤ 0.55
    // 3. 得令或得地其一很高（w_month≥0.7 或 root≥0.9）
    // 4. ✅ 新增：官杀无通根（有官杀根气就不能算从强）
    const hasKillerRoot = hasControllerRoot(dmElement, pillars);
    const meetsCondition = (helpPower >= 1.6 * drainPower && drainPower <= 0.55) &&
                           (w_month >= 0.7 || root >= 0.9) &&
                           !hasKillerRoot;  // ✅ 官杀无通根
    
    if (!meetsCondition) {
      console.log('[DayMaster] ⚠️ 从强闸门：条件不满足，下调为身强');
      console.log(`  helpPower=${helpPower.toFixed(2)}, drainPower=${drainPower.toFixed(2)}, w_month=${w_month.toFixed(2)}, root=${root.toFixed(2)}, hasKillerRoot=${hasKillerRoot}`);
      band = '身强';
    }
  } else if (band === '从弱') {
    // ✅ V3.0 修正：从弱闸门补上「不得令、不得地」限制
    // 从弱条件：财官食伤 ≥ 1.6 × 印比，且印比 ≤ 0.45
    // 同时要求不得令（w_month ≤ 0.4）且无强根（root ≤ 0.6）
    const meetsCondition = (drainPower >= 1.6 * helpPower && helpPower <= 0.45) &&
                           (w_month <= 0.4 && root <= 0.6);
    
    if (!meetsCondition) {
      console.error('[DayMaster] ⚠️ 从弱闸门：条件不满足，上调为身弱');
      console.error(`  helpPower=${helpPower.toFixed(2)}, drainPower=${drainPower.toFixed(2)}, w_month=${w_month.toFixed(2)}, root=${root.toFixed(2)}`);
      band = '身弱';
    }
  }
  
  return {
    score: isNaN(score) ? 0.5 : score,  // ✅ 防止 NaN
    band,
    detail: {
      w_month,
      root,
      help,
      drain: drainEffective,
      biPower,        // ✅ V3.0 新增：比劫力量
      printPower,     // ✅ 印星力量
      helpPower,      // ✅ 总帮扶力量（= biPower + printPower）
      drainPower,     // ✅ 有效耗身力量
      ...helperDetail,
      ...rootWeights
    }
  };
}

