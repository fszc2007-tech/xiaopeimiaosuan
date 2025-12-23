/**
 * 格局判断（候选打分制 V2.0）
 * 
 * 架构改进：
 * 1. 从 if-else 顺序判定 → 改为候选打分制
 * 2. 添加位置 × 季节 × 透干加权计算
 * 3. 官印相生：提高阈值 + 透干 + 洁净度 + 正比占比
 * 4. 所有格局并行打分，取最高分
 * 
 * @param {Object} pillars - 四柱数据
 * @param {Object} strength - 日主强弱结果
 * @param {Object} options - { school: 'ziping' | 'mangpai' }
 * @returns {Object} { structure: '食神生财', confidence: 0.85, reasons: [...] }
 */

import { 
  STEM_ELEMENT, 
  BRANCH_ELEMENT,
  HIDDEN_STEMS,
  GENERATES,
  CONTROLS,
  CONTROLLER_OF,
  MONTH_INDEX,
  SEASON_WEIGHT
} from './constants.js';
import { 
  collectAllStems, 
  tenGodOf, 
  seasonSupportOfTG,
  sum
} from './utils.js';
import { calculatePurity, calculateComprehensivePurity } from './purity.js';
import { calculatePatternPurity } from './patternPurity.js';
import { analyzePoGeFactors } from './poge.js';
import { diagnoseAllShishenPatterns } from './shishenPattern.js';
import { PatternKey, PATTERN_THRESHOLDS, selectMainPatterns } from './patternSelector.js';

/**
 * 主函数：格局判断
 */
export async function judgeStructure(pillars, strength, options = {}) {
  const school = options.school || 'ziping';
  const dm = pillars.day?.stem;
  const dmElement = STEM_ELEMENT[dm];
  
  if (!dm || !dmElement) {
    return { structure: '数据不完整', confidence: 0, reasons: ['日柱数据缺失'] };
  }
  
  const monthBranch = pillars.month?.branch;
  const monthIdx = monthBranch ? MONTH_INDEX[monthBranch] : -1;
  
  // ========== 1. 收集所有天干（含藏干）并加权 ==========
  const all = ['year', 'month', 'day', 'hour']
    .filter(k => pillars[k])
    .flatMap(k => {
      const p = pillars[k];
      const place = k === 'month' ? 1.30 : (k === 'day' ? 1.15 : 1.00); // 位置加权
      
      return collectAllStems(p).map(h => {
        const tg = tenGodOf(dm, h.stem);
        const season = seasonSupportOfTG(dmElement, tg, monthIdx); // 季节加权 (0~1)
        const see = h.isStem ? 1.20 : 1.00; // 透干加权
        const w = h.weight * place * (0.7 + 0.6 * season) * see; // 综合权重
        
        return {
          stem: h.stem,
          tg: tg,
          weight: w,
          pillar: k,
          isStem: h.isStem
        };
      });
    });
  
  // ========== 2. 计算各十神总权重 ==========
  const sumTenGod = (tg) => all.filter(x => x.tg === tg).reduce((s, x) => s + x.weight, 0);
  
  const W = {
    guan: sumTenGod('正官') + sumTenGod('七杀'),
    zGuan: sumTenGod('正官'),  // 正官
    sha: sumTenGod('七杀'),    // 七杀
    yin:  sumTenGod('正印') + sumTenGod('偏印'),
    zYin: sumTenGod('正印'),   // 正印
    pYin: sumTenGod('偏印'),   // 偏印
    cai:  sumTenGod('正财') + sumTenGod('偏财'),
    shi:  sumTenGod('食神') + sumTenGod('伤官'),
    shishen: sumTenGod('食神'), // 食神
    shang: sumTenGod('伤官'),   // 伤官
    bi:   sumTenGod('比肩') + sumTenGod('劫财'),
  };
  
  // 检查透干
  const hasGuanOnStem = all.some(x => x.isStem && (x.tg === '正官' || x.tg === '七杀'));
  const hasYinOnStem  = all.some(x => x.isStem && (x.tg === '正印' || x.tg === '偏印'));
  const hasPianYinOnStem = all.some(x => x.isStem && x.tg === '偏印'); // 偏印透干
  const hasZhengYinOnStem = all.some(x => x.isStem && x.tg === '正印'); // ✅ 新增：正印透干
  
  // 建禄格判断：月干在月支的禄位（临官位）
  const LU_SHEN_MAP = {
    '甲': '寅', '乙': '卯', '丙': '巳', '丁': '午', '戊': '巳',
    '己': '午', '庚': '申', '辛': '酉', '壬': '亥', '癸': '子'
  };
  const monthStem = pillars.month?.stem;
  const isJianLu = monthStem && monthBranch && LU_SHEN_MAP[monthStem] === monthBranch;
  
  // 调试日志：打印十神权重
  console.log('[Structure] 日主:', dm, dmElement, '月令:', monthBranch, '身强弱:', strength.band);
  console.log('[Structure] 十神权重:',
    '官', W.guan.toFixed(2), '(正', W.zGuan.toFixed(2), '杀', W.sha.toFixed(2), ')',
    '印', W.yin.toFixed(2),  '(正', W.zYin.toFixed(2),  '偏', W.pYin.toFixed(2),  ')',
    '财', W.cai.toFixed(2), '食伤', W.shi.toFixed(2), '(食', W.shishen.toFixed(2), '伤', W.shang.toFixed(2), ')',
    '比', W.bi.toFixed(2)
  );
  console.log('[Structure] 透干:', '官', hasGuanOnStem, '印', hasYinOnStem);
  
  // ========== 3. 候选格局打分（按优先级） ==========
  const candidates = [];
  const push = (name, score, reasons, category = '正格') => {
    if (score > 0) {
      candidates.push({ name, score, reasons, category });
    }
  };
  
  // ========== 3.1 第一优先级：化气格（条件最苛刻） ==========
  const huaqiResult1 = await checkHuaqiPattern(pillars, monthBranch, monthIdx);
  if (huaqiResult1) {
    push(huaqiResult1.name, huaqiResult1.score, huaqiResult1.reasons, '特殊格局');
  }
  
  // ========== 3.2 第二优先级：专旺格/从弱格 ==========
  // 专旺格（统一名称，删除"从强格"）
  // 注意：从强格已合并到专旺格，不再单独判断
  if (strength.score >= 0.80 && strength.band === '从强') {
    const zhuanwangResult = checkZhuanwangPattern(dm, dmElement, W, pillars, monthBranch, monthIdx, strength);
    if (zhuanwangResult) {
      push(zhuanwangResult.name, zhuanwangResult.score, zhuanwangResult.reasons, '特殊格局');
    }
  }
  
  // 从弱格
  if (strength.band === '从弱') {
    const congType = determineCongRuoSubtype(W, pillars);
    push(congType.name, congType.score, congType.reasons, '特殊格局');
  }
  
  // ========== 3.3 第三优先级：月令主格（正八格 + 外格） ==========
  const yuelingGe = await checkYuelingMainPattern(pillars, dm, all, monthBranch, monthIdx, strength);
  if (yuelingGe) {
    push(yuelingGe.name, yuelingGe.score, yuelingGe.reasons, '月令主格');
  }
  
  // 建禄格判断（外格，已在checkYuelingMainPattern中处理，但为了兼容性保留）
  if (isJianLu) {
    let score = 0.85;
    const reasons = ['月干在月支禄位', '建禄格'];
    if (W.yin > 0.60) { score += 0.05; reasons.push('有印生扶'); }
    if (W.guan > 0.50) { score += 0.05; reasons.push('有官约束'); }
    if (W.cai > 0.60) { score += 0.03; reasons.push('有财可用'); }
    push('建禄格', Math.min(0.95, score), reasons, '月令主格');
  }
  
  // 枭印格判断（偏印格，月令主格）
  if (W.pYin > 0.30 || (W.pYin > 0.25 && hasPianYinOnStem)) {
    let score = Math.min(0.80, W.pYin * 1.20);
    const reasons = ['偏印旺', '枭印格'];
    if (hasPianYinOnStem) { score += 0.10; reasons.push('偏印透干'); }
    if (W.pYin > W.zYin * 1.2) { score += 0.05; reasons.push('偏印强于正印'); }
    else if (W.pYin > 0.30 && W.yin > 1.0) { score += 0.03; reasons.push('印星成势'); }
    if (W.sha > 0.50 && W.pYin > 0.30) { score += 0.05; reasons.push('枭印化杀'); }
    push('枭印格', Math.min(0.95, score), reasons, '月令主格');
  }
  
  // ✅ 新增：正印格判断（与枭印格对称）
  // 条件：正印权重 > 0.30，或者正印透干且权重 > 0.25
  if (W.zYin > 0.30 || (W.zYin > 0.25 && hasZhengYinOnStem)) {
    let score = Math.min(0.80, W.zYin * 1.20);
    const reasons = ['正印旺', '正印格'];
    if (hasZhengYinOnStem) { 
      score += 0.10; 
      reasons.push('正印透干'); 
    }
    if (W.zYin > W.pYin * 1.2) { 
      score += 0.05; 
      reasons.push('正印强于偏印'); 
    } else if (W.zYin > 0.30 && W.yin > 1.0) { 
      score += 0.03; 
      reasons.push('印星成势'); 
    }
    // 正印护官
    if (W.zGuan > 0.50 && W.zYin > 0.30) { 
      score += 0.05; 
      reasons.push('正印护官'); 
    }
    push('正印格', Math.min(0.95, score), reasons, '月令主格');
  }
  
  // ========== 3.4 第四优先级：十神组合格局（可与主格并存） ==========
  // —— 食神生财 ——
  if (W.shishen > 0.65 && W.cai > 0.60) {
    let s = Math.min(W.shishen * 1.00, W.cai * 0.98);
    const reasons = ['食神有源', '财有气'];
    
    if (W.guan > 0.80) { s -= 0.05; reasons.push('官稍重'); }
    if (W.bi > 0.70)   { s -= 0.05; reasons.push('比劫夺财'); }
    
    push('食神生财', s, reasons, '十神组合');
  }
  
  // —— 伤官配印 ——
  if (W.shang > 0.60 && W.yin > 0.55 && W.guan < 0.70) {
    let s = Math.min(W.shang * 1.00, W.yin * 0.97);
    const reasons = ['伤官旺', '印来化泄'];
    
    if (W.cai > 0.75) { s -= 0.05; reasons.push('财多坏印'); }
    
    push('伤官配印', s, reasons, '十神组合');
  }
  
  // —— 财官双美（原"财官相辅"）——
  // ✅ V3.0：增加身偏强支持
  if ((strength.band === '身强' || strength.band === '身偏强' || strength.band === '平衡') && W.cai > 0.65 && W.guan > 0.55) {
    let s = Math.min(W.cai * 0.98, W.guan * 0.98);
    const reasons = ['财能生官', '势成体系'];
    
    if (W.bi > 0.70) { s -= 0.10; reasons.push('比劫犯官'); }
    
    push('财官双美', s, reasons, '十神组合');
  }
  
  // —— 杀印相生 ——
  if (W.sha > 0.65 && W.yin > 0.55) {
    let s = Math.min(W.sha * 1.00, W.yin * 0.97);
    const reasons = ['杀旺', '印化为用'];
    
    if (W.shang > 0.55) { s -= 0.08; reasons.push('伤官冲杀'); }
    
    push('杀印相生', s, reasons, '十神组合');
  }
  
  // —— 官印相生（关键修复：新门槛）——
  const guanOk = W.guan > 0.70;
  const yinOk  = W.yin  > 0.65;
  const visible = hasGuanOnStem || hasYinOnStem;
  const clean   = (W.shang < 0.50) && (W.cai < 0.70) && (W.bi < 1.0);
  const zRatioG = W.guan > 0 ? W.zGuan / W.guan : 0;
  const zRatioY = W.yin  > 0 ? W.zYin  / W.yin  : 0;
  const zRatioOk = (zRatioG >= 0.35 || zRatioY >= 0.35);
  
  if (guanOk && yinOk && visible && clean && zRatioOk && strength.band !== '从强') {
    let s = Math.min(W.guan * 0.97, W.yin * 0.97);
    const reasons = ['官有印生', '犯局不重', '有透干'];
    
    // 正印/正官占比加分
    if (zRatioG >= 0.70 || zRatioY >= 0.70) {
      s *= 1.05;
      reasons.push('正印/正官纯粹');
    }
    
    if (s > 0.40) {
      push('官印相生', s, reasons, '十神组合');
    }
  }
  
  // 从格判断已移到第二优先级（专旺格/从弱格）
  // 从强格已合并到专旺格，不再单独判断
  // 从弱格已在第二优先级判断，此处删除重复代码，避免计算错误
  
  // —— 建禄格 ——
  if (isJianLu) {
    let score = 0.85;
    const reasons = ['月干在月支禄位', '建禄格'];
    
    // 建禄格配合其他格局加分
    if (W.yin > 0.60) {
      score += 0.05;
      reasons.push('有印生扶');
    }
    if (W.guan > 0.50) {
      score += 0.05;
      reasons.push('有官约束');
    }
    if (W.cai > 0.60) {
      score += 0.03;
      reasons.push('有财可用');
    }
    
    push('建禄格', Math.min(0.95, score), reasons);
  }
  
  // —— 枭印格（偏印格）——
  // 条件：偏印权重 > 0.30，或者偏印透干且权重 > 0.25
  if (W.pYin > 0.30 || (W.pYin > 0.25 && hasPianYinOnStem)) {
    let score = Math.min(0.80, W.pYin * 1.20);
    const reasons = ['偏印旺', '枭印格'];
    
    if (hasPianYinOnStem) {
      score += 0.10;
      reasons.push('偏印透干');
    }
    if (W.pYin > W.zYin * 1.2) {
      score += 0.05;
      reasons.push('偏印强于正印');
    } else if (W.pYin > 0.30 && W.yin > 1.0) {
      // 即使正印更强，但偏印也有一定力量，且印总权重高
      score += 0.03;
      reasons.push('印星成势');
    }
    if (W.sha > 0.50 && W.pYin > 0.30) {
      score += 0.05;
      reasons.push('枭印化杀');
    }
    
    push('枭印格', Math.min(0.95, score), reasons);
  }
  
  // —— 专项格局（可选）——
  if (W.cai > 1.00) {
    const name = W.cai >= sumTenGod('偏财') ? '正财格' : '偏财格';
    push(name, Math.min(0.75, W.cai * 0.85), ['财星鲜明']);
  }
  
  // —— 专旺格 ——
  if (strength.score >= 0.80) {
    const zhuanwangResult = checkZhuanwangPattern(dm, dmElement, W, pillars, monthBranch, monthIdx, strength);
    if (zhuanwangResult) {
      push(zhuanwangResult.name, zhuanwangResult.score, zhuanwangResult.reasons);
    }
  }
  
  // 化气格已在第一优先级判断，此处删除重复判断
  
  // 删除盲派特殊格局（已合并到十神组合格局）
  // "杀印相生(盲)" → 已归入"杀印相生"（十神组合格局）
  // "伤官见官(盲)" → 已归入破格因素"伤官见官"
  
  // ========== 4. 使用主格/副格选择算法 ==========
  
  // 4.1 调试：打印分数样本，确认分数范围
  if (candidates.length > 0) {
    console.log('[PatternSelector] score sample:', 
      candidates.slice(0, 5).map(c => ({ name: c.name, score: c.score }))
    );
  }
  
  // 4.2 转换为 PatternScore[] 格式
  const patternScores = convertCandidatesToPatternScores(candidates);
  
  // 4.3 调用主格/副格选择算法
  const patternResult = selectMainPatterns(patternScores);
  
  // 4.4 从原始 candidates 中找回 reasons 和 category
  const main = patternResult.mainPattern;
  let mainReasons = [];
  let mainCategory = '正格';
  if (main) {
    const hit = candidates.find(c => c.name === main.label);
    if (hit) {
      mainReasons = hit.reasons || [];
      mainCategory = hit.category || '正格';
    }
  }
  
  // 4.5 确定最终格局名称（向后兼容）
  const finalName = main?.label || '平格';
  const finalReasons = mainReasons.length > 0 ? mainReasons : ['平衡杂气，未成主象'];
  
  // 4.6 计算置信度（保持原有逻辑）
  const confidence = main 
    ? Math.max(0.60, Math.min(0.90, 0.62 + (main.score / 100) * 0.20))
    : 0.60;
  
  // 4.7 调试日志：打印选择结果
  console.log('[Structure] 候选格局:');
  candidates.forEach(c => {
    console.log(`  - ${c.name}: ${c.score.toFixed(2)} (${c.reasons.join(', ')})`);
  });
  console.log(`[Structure] 主格: ${finalName} (成格度: ${main?.score || 0}%, confidence: ${confidence.toFixed(2)})`);
  if (patternResult.secondaryPatterns.length > 0) {
    console.log(`[Structure] 副格: ${patternResult.secondaryPatterns.map(p => p.label).join(', ')}`);
  }
  
  // 分析破格因子（使用主要格局名称）
  const mainStructureName = typeof finalName === 'string' && finalName.includes(' ') ? finalName.split(' ')[0] : finalName;
  const pogeResult = analyzePoGeFactors(pillars, W, mainStructureName, strength);
  const pogeFactors = pogeResult.factors;
  const pogeContext = pogeResult.context; // 保存 context 供后续使用
  
  // 计算格局纯度（真/假/一般/破格）- 传统命理中的标准概念
  const patternPurity = calculatePatternPurity(pillars, strength, W, mainStructureName, pogeFactors, { ...options, pogeContext });
  
  // 诊断十神组合格局
  const shishenPatterns = diagnoseAllShishenPatterns(pillars, strength, W, mainStructureName, pogeFactors, options);
  
  // 计算综合纯度（清浊等级）- 从多个维度对八字整体质量的评估
  // 传递 shishenPatterns 和 pogeFactors 给综合纯度计算
  const comprehensivePurity = calculateComprehensivePurity(pillars, strength, W, mainStructureName, {
    ...options,
    shishenPatterns,
    pogeFactors
  });
  
  // 将 W 对象附加到返回结果中，供后续使用
  const resultWithW = {
    // 原有字段（向后兼容）
    structure: finalName,
    type: determineStructureType(finalName, strength),
    confidence: confidence,
    reasons: finalReasons,
    
    // 新增字段：主格/副格
    mainPattern: main,
    secondaryPatterns: patternResult.secondaryPatterns,
    allPatterns: patternResult.allPatterns,
    
    // 其他现有字段
    comprehensivePurity: comprehensivePurity,  // 综合纯度（清浊等级）
    patternPurity: patternPurity,  // 格局纯度（真/假/一般/破格）
    shishenPatterns: shishenPatterns,  // 十神组合格局诊断结果
    pogeFactors: pogeFactors,  // 破格因素（独立分析，非格局）
    _internal: { W } // 内部使用，用于后续分析
  };
  
  return resultWithW;
}

/**
 * 格局名称到 PatternKey 的映射
 * 
 * @param {string} structureName - 格局名称
 * @returns {string|null} PatternKey 或 null
 */
function mapStructureNameToPatternKey(structureName) {
  if (!structureName || typeof structureName !== 'string') return null;
  
  const mapping = {
    // 特殊格局
    '从财格': PatternKey.CONG,
    '从杀格': PatternKey.CONG,
    '从儿格': PatternKey.CONG,
    '从势格': PatternKey.CONG,
    '从弱格': PatternKey.CONG,
    '化气格': PatternKey.HUAQI,
    '甲己化土': PatternKey.HUAQI,
    '乙庚化金': PatternKey.HUAQI,
    '丙辛化水': PatternKey.HUAQI,
    '丁壬化木': PatternKey.HUAQI,
    '戊癸化火': PatternKey.HUAQI,
    
    // 专旺格（暂时归入特殊格局，后续可细化）
    '曲直格': PatternKey.CONG,
    '炎上格': PatternKey.CONG,
    '稼穑格': PatternKey.CONG,
    '从革格': PatternKey.CONG,
    '润下格': PatternKey.CONG,
    '专旺格': PatternKey.CONG,
    
    // 八大正格
    '正官格': PatternKey.GUAN,
    '七杀格': PatternKey.SHAGUAN,
    '正财格': PatternKey.ZHENGCAI,
    '偏财格': PatternKey.PIANCAI,
    '食神格': PatternKey.SHISHEN,
    '伤官格': PatternKey.SHANGGUAN,
    '正印格': PatternKey.ZHENGYIN,
    '偏印格': PatternKey.PIANYIN,
    '枭印格': PatternKey.PIANYIN, // 别名
    
    // 基础格局
    '建禄格': PatternKey.JIANLU,
    '比劫格': PatternKey.BIJIE,
    '月劫格': PatternKey.BIJIE,  // ✅ 新增：月劫格映射到比劫格类型
    '羊刃格': PatternKey.YANGREN,
    '阳刃格': PatternKey.YANGREN, // 别名
  };
  
  return mapping[structureName] || null;
}

/**
 * 将 candidates 转换为 PatternScore[]
 * 
 * @param {Array} candidates - 原始候选格局数组 { name, score, reasons, category }
 * @returns {Array} PatternScore[] 格式的数组
 */
function convertCandidatesToPatternScores(candidates) {
  const T = PATTERN_THRESHOLDS;
  
  // 用于去重：如果同一个 key 有多个候选，保留分数最高的
  const keyMap = new Map();
  
  candidates.forEach(c => {
    const key = mapStructureNameToPatternKey(c.name);
    if (!key) return; // 过滤掉无法映射的格局
    
    // 确认分数范围：如果 score 是 0-1，则 *100；如果已经是 0-100，则直接使用
    let score100;
    if (c.score > 1) {
      score100 = Math.round(c.score);
    } else {
      score100 = Math.round(c.score * 100);
    }
    
    if (score100 < T.WEAK) return; // 过滤弱格
    
    const patternScore = {
      key,
      label: c.name,
      score: score100
    };
    
    // 如果同一个 key 已存在，保留分数更高的
    const existing = keyMap.get(key);
    if (!existing || score100 > existing.score) {
      keyMap.set(key, patternScore);
    }
  });
  
  return Array.from(keyMap.values());
}

/**
 * 判断格局类型
 */
function determineStructureType(structureName, strength) {
  if (!structureName || typeof structureName !== 'string') return '正格';
  
  if (structureName.includes('从')) return '从格';
  if (structureName.includes('专旺') || structureName.includes('曲直') || structureName.includes('炎上') || 
      structureName.includes('稼穑') || structureName.includes('从革') || structureName.includes('润下')) {
    return '专旺格';
  }
  if (structureName.includes('化')) return '化气格';
  if (structureName.includes('建禄') || structureName.includes('枭印')) return '正格';
  return '正格';
}

/**
 * 从强格细分判断（已废弃，合并到专旺格）
 * 
 * ⚠️ 警告：此函数已废弃，不应再被调用！
 * 从强格已统一合并到专旺格判断中（checkZhuanwangPattern）。
 * 
 * 保留此函数仅用于：
 * 1. 向后兼容（防止其他模块调用时报错）
 * 2. 代码历史记录
 * 
 * 如果发现此函数被调用，请检查调用位置并改用 checkZhuanwangPattern。
 * 
 * @deprecated 使用 checkZhuanwangPattern 代替
 */
function determineCongQiangSubtype(W, pillars) {
  // 返回null，表示不应使用此函数
  // 如果被意外调用，返回null而不是错误的格局名称，避免系统计算错误
  console.warn('[Structure] ⚠️ determineCongQiangSubtype 已被废弃，请使用 checkZhuanwangPattern');
  return null;
  
  // 以下代码已废弃，保留仅作参考
  /*
  const biStrength = W.bi;
  const yinStrength = W.yin;
  
  if (biStrength > yinStrength * 1.5) {
    return {
      name: '从强格',  // ❌ 错误：应返回专旺格
      reasons: ['比劫成势', '专旺比肩'],
      subtype: '比劫专旺'
    };
  } else if (yinStrength > biStrength * 1.5) {
    return {
      name: '从强格',  // ❌ 错误：应返回专旺格
      reasons: ['印星成势', '专旺印绶'],
      subtype: '印星专旺'
    };
  } else {
    return {
      name: '从强格',  // ❌ 错误：应返回专旺格
      reasons: ['比印成势', '共同专旺'],
      subtype: '比印并旺'
    };
  }
  */
}

/**
 * 从弱格细分判断
 */
function determineCongRuoSubtype(W, pillars) {
  // 找出最强的旺神
  const godStrengths = [
    { god: '财', strength: W.cai },
    { god: '官杀', strength: W.guan },
    { god: '食伤', strength: W.shi }
  ];
  
  godStrengths.sort((a, b) => b.strength - a.strength);
  const dominant = godStrengths[0];
  const secondDominant = godStrengths[1];
  
  // 判断是否单一旺神独旺（相差50%以上）
  if (dominant.strength > secondDominant.strength * 1.5 && dominant.strength > 0.8) {
    if (dominant.god === '财') {
      return analyzeFromCaiType(W, pillars, dominant.strength);
    } else if (dominant.god === '官杀') {
      return analyzeFromShaType(W, pillars, dominant.strength);
    } else if (dominant.god === '食伤') {
      return analyzeFromErType(W, pillars, dominant.strength);
    }
  }
  
  // 多势混杂，从势格
  return {
    name: '从势格',
    score: 0.88,
    reasons: ['多势混杂', '日主完全无助'],
    subtype: '多势并旺'
  };
}

/**
 * 从财格分析
 */
function analyzeFromCaiType(W, pillars, caiStrength) {
  const hasShishen = W.shi > 0.3;
  const hasBiJie = W.bi > 0.15;
  const hasYin = W.yin > 0.10;
  
  // 真从财格
  if (!hasBiJie && !hasYin && hasShishen && caiStrength > 1.2) {
    return {
      name: '从财格',
      score: 0.92,
      reasons: ['财星独旺', '有食伤生财', '真从'],
      subtype: '真从财',
      characteristics: '富格，易得大财'
    };
  }
  // 假从财格
  else if ((hasBiJie || hasYin) && caiStrength > 0.9) {
    return {
      name: '从财格',
      score: 0.85,
      reasons: ['财星旺', '日主微根', '假从'],
      subtype: '假从财',
      characteristics: '富而不久'
    };
  }
  // 从财杀格
  else if (W.guan > 0.6) {
    return {
      name: '从财杀格',
      score: 0.88,
      reasons: ['财官两旺', '财生官杀'],
      subtype: '财官并旺',
      characteristics: '富而多忧'
    };
  }
  
  return {
    name: '从财格',
    score: 0.90,
    reasons: ['财星旺盛', '日主从之'],
    subtype: '一般从财'
  };
}

/**
 * 从杀格分析
 */
function analyzeFromShaType(W, pillars, guanStrength) {
  const hasYin = W.yin > 0.3;
  const hasShang = W.shang > 0.3;
  
  // 真从杀格
  if (guanStrength > 1.2 && !hasYin && !hasShang) {
    return {
      name: '从杀格',
      score: 0.92,
      reasons: ['官杀极旺', '无印制杀', '真从'],
      subtype: '真从杀',
      characteristics: '贵格，易得权贵'
    };
  }
  // 假从杀格
  else if (guanStrength > 0.9 && (hasYin || hasShang)) {
    return {
      name: '从杀格',
      score: 0.85,
      reasons: ['官杀旺', '略有制化', '假从'],
      subtype: '假从杀',
      characteristics: '贵而不久'
    };
  }
  
  return {
    name: '从杀格',
    score: 0.90,
    reasons: ['官杀旺盛', '日主从之'],
    subtype: '一般从杀'
  };
}

/**
 * 从儿格分析
 */
function analyzeFromErType(W, pillars, shiStrength) {
  const hasCai = W.cai > 0.5;
  const hasYin = W.yin > 0.2;
  const hasGuan = W.guan > 0.3;
  
  // 真从儿格
  if (shiStrength > 1.2 && hasCai && !hasYin && !hasGuan) {
    return {
      name: '从儿格',
      score: 0.92,
      reasons: ['食伤极旺', '有财泄秀', '真从'],
      subtype: '真从儿',
      characteristics: '秀格，聪明多才'
    };
  }
  // 假从儿格
  else if (shiStrength > 0.9 && (hasYin || hasGuan)) {
    return {
      name: '从儿格',
      score: 0.85,
      reasons: ['食伤旺', '略有克泄', '假从'],
      subtype: '假从儿',
      characteristics: '秀而不纯'
    };
  }
  
  return {
    name: '从儿格',
    score: 0.90,
    reasons: ['食伤旺盛', '日主从之'],
    subtype: '一般从儿'
  };
}

/**
 * 专旺格判断
 */
function checkZhuanwangPattern(dm, dmElement, W, pillars, monthBranch, monthIdx, strength) {
  // 1. 计算同类五行强度
  const sameElementStrength = W.bi * 1.0 + W.yin * 0.8;
  
  // 2. 检查专旺条件
  if (!meetsZhuanwangConditions(dmElement, sameElementStrength, monthIdx, W, pillars)) {
    return null;
  }
  
  // 3. 确定专旺格类型
  return determineZhuanwangType(dmElement, sameElementStrength, pillars, monthIdx, W);
}

/**
 * 检查是否满足专旺条件
 */
function meetsZhuanwangConditions(dmElement, sameElementStrength, monthIdx, W, pillars) {
  // 条件1: 日主得令（季节权重 >= 0.70）
  const seasonWeight = SEASON_WEIGHT[dmElement]?.[monthIdx];
  if (!seasonWeight || seasonWeight < 0.70) return false;
  
  // 条件2: 同类五行数量 >= 3
  const sameElementCount = countSameElementPillars(pillars, dmElement);
  if (sameElementCount < 3) return false;
  
  // 条件3: 气势集中（专旺度 >= 1.5）
  if (sameElementStrength < 1.5) return false;
  
  // 条件4: 无破格五行（克我者不得力 < 0.5）
  const controllerElement = CONTROLLER_OF[dmElement];
  const controllerStrength = getElementStrengthFromW(controllerElement, W, dmElement);
  if (controllerStrength > 0.5) return false;
  
  return true;
}

/**
 * 确定专旺格类型
 */
function determineZhuanwangType(dmElement, sameElementStrength, pillars, monthIdx, W) {
  const zhuanwangTypes = {
    '木': { name: '曲直仁寿格', char: '仁德慈爱，文采出众' },
    '火': { name: '炎上格', char: '热情磊落，文明之象' },
    '土': { name: '稼穑格', char: '诚信厚重，包容承载' },
    '金': { name: '从革格', char: '刚毅果决，义气深重' },
    '水': { name: '润下格', char: '智慧流动，随机应变' }
  };
  
  const typeInfo = zhuanwangTypes[dmElement];
  if (!typeInfo) return null;
  
  // 简化版纯度计算
  const purity = calculateZhuanwangPuritySimple(pillars, dmElement, monthIdx, W);
  
  return {
    name: typeInfo.name,
    score: 0.92,
    reasons: ['专旺一气', `纯度${purity}%`, typeInfo.char],
    special: {
      subtype: typeInfo.name,
      element: dmElement,
      purity: purity,
      purityLevel: purity >= 80 ? '真专旺' : purity >= 60 ? '纯专旺' : '次专旺'
    }
  };
}

/**
 * 简化版专旺格纯度计算
 */
function calculateZhuanwangPuritySimple(pillars, zhuanwangElement, monthIdx, W) {
  let score = 50; // 基础分
  
  // 月令得令程度
  const seasonWeight = SEASON_WEIGHT[zhuanwangElement]?.[monthIdx] || 0;
  if (seasonWeight >= 0.90) score += 25;
  else if (seasonWeight >= 0.70) score += 20;
  
  // 同类五行数量
  const sameCount = countSameElementPillars(pillars, zhuanwangElement);
  if (sameCount >= 4) score += 20;
  else if (sameCount >= 3) score += 15;
  
  // 破格因素扣分
  const controllerElement = CONTROLLER_OF[zhuanwangElement];
  const controllerStrength = getElementStrengthFromW(controllerElement, W, zhuanwangElement);
  if (controllerStrength > 0.3) score -= 15;
  if (controllerStrength > 0.5) score -= 20;
  
  return Math.max(0, Math.min(100, score));
}

/**
 * 统计同类五行柱数
 */
function countSameElementPillars(pillars, element) {
  let count = 0;
  for (const pos of ['year', 'month', 'day', 'hour']) {
    const pillar = pillars[pos];
    if (!pillar) continue;
    const stemElement = STEM_ELEMENT[pillar.stem];
    const branchElement = BRANCH_ELEMENT[pillar.branch];
    if (stemElement === element || branchElement === element) count++;
  }
  return count;
}

/**
 * 从十神权重反推五行强度
 */
function getElementStrengthFromW(element, W, dmElement) {
  if (element === CONTROLLER_OF[dmElement]) return W.guan;  // 克我者 -> 官杀
  if (element === dmElement) return W.bi;  // 同类 -> 比劫
  return 0;
}

/**
 * 化气格判断
 */
async function checkHuaqiPattern(pillars, monthBranch, monthIdx) {
  // 动态导入天干关系模块
  const { checkStemWuHe } = await import('../mingli/stemRelationships.js');
  
  // 1. 检查所有天干五合
  const heResults = checkAllStemHe(pillars, checkStemWuHe);
  
  if (heResults.length === 0) {
    return null;
  }
  
  // 2. 对每个合局计算化气纯度
  for (const he of heResults) {
    const purity = calculateHuaqiPurity(he.element, pillars, monthBranch, monthIdx);
    
    // 纯度 >= 70% 可论化气格
    if (purity >= 70) {
      return determineHuaqiType(he, purity, pillars);
    }
  }
  
  return null;
}

/**
 * 检查所有天干五合
 */
function checkAllStemHe(pillars, checkStemWuHe) {
  const heResults = [];
  const positions = ['year', 'month', 'day', 'hour'];
  
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const pillar1 = pillars[positions[i]];
      const pillar2 = pillars[positions[j]];
      
      if (!pillar1 || !pillar2) continue;
      
      const heCheck = checkStemWuHe(pillar1.stem, pillar2.stem);
      if (heCheck && heCheck.isHe) {
        heResults.push({
          element: heCheck.element,
          stems: heCheck.pair,
          positions: [positions[i], positions[j]],
          pillars: [pillar1, pillar2]
        });
      }
    }
  }
  
  return heResults;
}

/**
 * 计算化气纯度
 */
function calculateHuaqiPurity(huashenElement, pillars, monthBranch, monthIdx) {
  let purity = 0;
  
  // 1. 化神得令 (30分)
  const seasonWeight = SEASON_WEIGHT[huashenElement]?.[monthIdx];
  if (seasonWeight >= 0.70) {
    purity += 30;
  } else if (seasonWeight >= 0.50) {
    purity += 15;
  }
  
  // 2. 化神旺相 (25分)
  const huashenCount = countElementInPillars(pillars, huashenElement);
  if (huashenCount >= 3) {
    purity += 25;
  } else if (huashenCount >= 2) {
    purity += 15;
  }
  
  // 3. 无破化之物 (20分)
  const controllerElement = CONTROLS[huashenElement];
  const controllerCount = countElementInPillars(pillars, controllerElement);
  if (controllerCount === 0) {
    purity += 20;
  } else if (controllerCount === 1) {
    purity += 10;
  }
  
  // 4. 有生扶化神 (15分)
  const motherElement = Object.keys(GENERATES).find(k => GENERATES[k] === huashenElement);
  const motherCount = countElementInPillars(pillars, motherElement);
  if (motherCount >= 2) {
    purity += 15;
  } else if (motherCount >= 1) {
    purity += 8;
  }
  
  // 5. 化神透干 (10分)
  const huashenTransparent = checkElementTransparent(pillars, huashenElement);
  if (huashenTransparent) {
    purity += 10;
  }
  
  return purity;
}

/**
 * 确定化气格类型
 */
function determineHuaqiType(he, purity, pillars) {
  const huaqiTypes = {
    '土': { name: '甲己化土格', char: '诚信厚重，有管理才能' },
    '金': { name: '乙庚化金格', char: '刚毅果决，有技术天赋' },
    '水': { name: '丙辛化水格', char: '智慧流动，善于变通' },
    '木': { name: '丁壬化木格', char: '仁德文雅，有艺术天赋' },
    '火': { name: '戊癸化火格', char: '热情文明，有表现欲望' }
  };
  
  const typeInfo = huaqiTypes[he.element];
  if (!typeInfo) return null;
  
  const genuineness = determineGenuineness(purity);
  
  return {
    name: typeInfo.name,
    score: 0.91,
    reasons: [
      `${he.stems[0]}${he.stems[1]}合化${he.element}`,
      `化气纯度${purity}%`,
      genuineness,
      typeInfo.char
    ],
    special: {
      subtype: typeInfo.name,
      purity: purity,
      purityLevel: genuineness
    }
  };
}

/**
 * 判断化气格真假
 */
function determineGenuineness(purity) {
  if (purity >= 90) return '真化·格纯';
  if (purity >= 80) return '真化·格正';
  if (purity >= 70) return '假化·待运';
  if (purity >= 60) return '假化·多瑕';
  return '不化·格破';
}

/**
 * 统计五行在四柱中的数量
 */
function countElementInPillars(pillars, element) {
  if (!element) return 0;
  
  let count = 0;
  for (const pos of ['year', 'month', 'day', 'hour']) {
    const pillar = pillars[pos];
    if (!pillar) continue;
    
    const stemElement = STEM_ELEMENT[pillar.stem];
    const branchElement = BRANCH_ELEMENT[pillar.branch];
    
    if (stemElement === element || branchElement === element) {
      count++;
    }
  }
  return count;
}

/**
 * 检查五行是否透干
 */
function checkElementTransparent(pillars, element) {
  for (const pos of ['year', 'month', 'day', 'hour']) {
    const pillar = pillars[pos];
    if (!pillar) continue;
    
    const stemElement = STEM_ELEMENT[pillar.stem];
    if (stemElement === element) {
      return true;
    }
  }
  return false;
}

/**
 * 判断月令主格（正八格 + 外格）
 * 核心：月令透干原则
 */
async function checkYuelingMainPattern(pillars, dm, all, monthBranch, monthIdx, strength) {
  if (!monthBranch || !pillars.month) return null;
  
  // 获取月支藏干
  const monthPillar = pillars.month;
  const hiddenStems = monthPillar.canggan || [];
  
  // 检查月支藏干是否透出到年、月、时天干
  const stemsOnTop = [pillars.year?.stem, pillars.month?.stem, pillars.hour?.stem].filter(Boolean);
  
  // 检查透干
  let touGanStem = null;
  let touGanTenGod = null;
  
  for (const hidden of hiddenStems) {
    const stem = Array.isArray(hidden) ? hidden[0] : hidden;
    if (stemsOnTop.includes(stem)) {
      touGanStem = stem;
      // 从all中找到对应的十神
      const found = all.find(x => x.stem === stem && x.isStem);
      if (found) {
        touGanTenGod = found.tg;
      }
      break;
    }
  }
  
  // 如果透干，取透出十神为格；否则取本气十神为格
  const targetStem = touGanStem || (hiddenStems[0] ? (Array.isArray(hiddenStems[0]) ? hiddenStems[0][0] : hiddenStems[0]) : null);
  if (!targetStem) return null;
  
  // 从all中找到对应的十神
  let targetTenGod = null;
  if (touGanStem) {
    const found = all.find(x => x.stem === touGanStem && x.isStem);
    if (found) targetTenGod = found.tg;
  } else {
    // 取本气，需要计算十神
    const found = all.find(x => x.stem === targetStem);
    if (found) targetTenGod = found.tg;
  }
  
  if (!targetTenGod) {
    // 如果all中找不到，使用tenGodOf计算
    const { tenGodOf } = await import('./utils.js');
    targetTenGod = tenGodOf(dm, targetStem);
  }
  
  // 判断正八格
  const zhengBaGeMap = {
    '正官': '正官格',
    '七杀': '七杀格',
    '正印': '正印格',
    '偏印': '枭印格',  // 偏印格统一显示为枭印格
    '食神': '食神格',
    '伤官': '伤官格',
    '正财': '正财格',
    '偏财': '偏财格'
  };
  
  if (zhengBaGeMap[targetTenGod]) {
    let score = 0.85;
    const reasons = [touGanStem ? '月令透干' : '月令本气', zhengBaGeMap[targetTenGod]];
    
    if (touGanStem) {
      score += 0.05;
      reasons.push('透干有力');
    }
    
    return {
      name: zhengBaGeMap[targetTenGod],
      score: Math.min(0.95, score),
      reasons
    };
  }
  
  // 判断外格：建禄格、阳刃格、月劫格
  // 建禄格：月干在月支的禄位（已在前面判断，这里不再重复）
  const LU_SHEN_MAP = {
    '甲': '寅', '乙': '卯', '丙': '巳', '丁': '午', '戊': '巳',
    '己': '午', '庚': '申', '辛': '酉', '壬': '亥', '癸': '子'
  };
  const monthStem = pillars.month?.stem;
  if (monthStem && LU_SHEN_MAP[monthStem] === monthBranch) {
    // 建禄格已在主函数中判断，这里不重复
  }
  
  // 阳刃格：月支为日主的帝旺位，且为劫财
  const yangRenResult = await checkYangRenPattern(pillars, dm, monthBranch);
  if (yangRenResult) {
    return yangRenResult;
  }
  
  // 月劫格：月支为比劫，但非建禄非阳刃
  if (targetTenGod === '比肩' || targetTenGod === '劫财') {
    // 已排除建禄和阳刃，所以是月劫格
    let score = 0.80;
    const reasons = ['月令为比劫', '月劫格'];
    return {
      name: '月劫格',
      score: Math.min(0.90, score),
      reasons
    };
  }
  
  return null;
}

/**
 * 检查阳刃格
 * 条件：月支为日主的帝旺位，且月支十神为劫财
 */
async function checkYangRenPattern(pillars, dm, monthBranch) {
  if (!monthBranch || !dm) return null;
  
  // 动态导入stage12
  const { stage12 } = await import('../mingli/stage12.js');
  const stage = stage12(dm, monthBranch);
  
  // 检查是否为帝旺
  if (stage !== '帝旺') return null;
  
  // 检查月支十神是否为劫财
  const monthPillar = pillars.month;
  const hiddenStems = monthPillar?.canggan || [];
  const benQi = hiddenStems[0] ? (Array.isArray(hiddenStems[0]) ? hiddenStems[0][0] : hiddenStems[0]) : null;
  if (!benQi) return null;
  
  const { tenGodOf } = await import('./utils.js');
  const tenGod = tenGodOf(dm, benQi);
  
  if (tenGod === '劫财') {
    return {
      name: '阳刃格',
      score: 0.90,
      reasons: ['月支为日主帝旺', '月支为劫财', '阳刃格']
    };
  }
  
  return null;
}

/**
 * 检查是否有羊刃（用于羊刃驾杀判断）
 */
async function checkYangRen(pillars, dm, monthBranch) {
  if (!monthBranch || !dm) return false;
  
  // 动态导入stage12
  const { stage12 } = await import('../mingli/stage12.js');
  const monthStage = stage12(dm, monthBranch);
  const dayStage = stage12(dm, pillars.day?.branch);
  
  return monthStage === '帝旺' || dayStage === '帝旺';
}

