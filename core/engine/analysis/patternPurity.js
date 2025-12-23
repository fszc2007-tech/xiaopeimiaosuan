/**
 * 格局纯度判断系统
 * 
 * 用于判断格局的成败高低，是传统命理中的标准概念。
 * 判断格局是否成立以及成立的质量：真/假/一般/破格
 * 
 * 核心逻辑：
 * 1. 收集破格因素（不修改破格因素系统，仅读取）
 * 2. 检查救应因素
 * 3. 综合评定纯度等级
 * 
 * @param {Object} pillars - 四柱数据
 * @param {Object} strength - 日主强弱结果
 * @param {Object} W - 十神权重对象
 * @param {String} structureName - 格局名称
 * @param {Array} pogeFactors - 破格因素数组（从 analyzePoGeFactors 获取）
 * @param {Object} options - 选项
 * @returns {Object} {
 *   level: '真' | '假' | '一般' | '破格',
 *   score: 85,  // 0-100分
 *   pogeFactors: [],  // 破格因素列表
 *   rescueFactors: [],  // 救应因素列表
 *   description: '...'  // 描述文本
 * }
 */

import { STEM_ELEMENT, BRANCH_ELEMENT, HIDDEN_STEMS } from './constants.js';
import { tenGodOf, collectAllStems, canUseShiAsRescue, canUseYinAsRescue, canUseBiAsRescue, canUseCaiAsRescue } from './utils.js';
import { checkStemWuHe, analyzeStemRelationships } from '../mingli/stemRelationships.js';

/**
 * 格局诊断映射表
 * 将格局名称映射到对应的诊断函数
 */
const PATTERN_DIAGNOSIS_MAP = {
  // 月令主格（11个）
  '正官格': 'diagnoseZhengGuanGe',
  '七杀格': 'diagnoseQiShaGe',
  '正财格': 'diagnoseZhengCaiGe',
  '偏财格': 'diagnosePianCaiGe',
  '正印格': 'diagnoseZhengYinGe',
  '偏印格': 'diagnosePianYinGe',
  '枭印格': 'diagnosePianYinGe',  // 偏印格别名
  '食神格': 'diagnoseShiShenGe',
  '伤官格': 'diagnoseShangGuanGe',
  '建禄格': 'diagnoseJianLuGe',
  '阳刃格': 'diagnoseYangRenGe',
  '月劫格': 'diagnoseYueJieGe',
  
  // 专旺格（5个）
  '曲直仁寿格': 'diagnoseZhuanWangGe',
  '炎上格': 'diagnoseZhuanWangGe',
  '稼穑格': 'diagnoseZhuanWangGe',
  '从革格': 'diagnoseZhuanWangGe',
  '润下格': 'diagnoseZhuanWangGe',
  '专旺格': 'diagnoseZhuanWangGe',
  
  // 从弱格（4个）
  '从财格': 'diagnoseCongRuoGe',
  '从杀格': 'diagnoseCongRuoGe',
  '从儿格': 'diagnoseCongRuoGe',
  '从势格': 'diagnoseCongRuoGe',
  '从弱格': 'diagnoseCongRuoGe',
  
  // 化气格（5个）
  '甲己化土格': 'diagnoseHuaQiGe',
  '乙庚化金格': 'diagnoseHuaQiGe',
  '丙辛化水格': 'diagnoseHuaQiGe',
  '丁壬化木格': 'diagnoseHuaQiGe',
  '戊癸化火格': 'diagnoseHuaQiGe'
};

/**
 * 计算格局纯度
 */
export function calculatePatternPurity(pillars, strength, W, structureName, pogeFactors = [], options = {}) {
  // 初始化诊断结果
  const diagnosisResult = {
    patternSpecificPogeFactors: [],  // 格局专用破格因素
    patternSpecificRescueFactors: [],  // 格局专用救应因素
    patternName: structureName
  };
  
  // 1. 尝试调用格局专用诊断函数
  const diagnosisFuncName = getDiagnosisFunctionName(structureName);
  if (diagnosisFuncName) {
    const diagnosisFunc = getDiagnosisFunction(diagnosisFuncName);
    if (diagnosisFunc) {
      diagnosisFunc(pillars, strength, W, diagnosisResult, options);
    }
  }
  
  // 2. 收集破格因素（从传入的 pogeFactors 中筛选 + 格局专用破格因素）
  const relevantPogeFactors = [
    ...filterRelevantPogeFactors(pogeFactors, structureName),
    ...diagnosisResult.patternSpecificPogeFactors
  ];
  
  // 3. 检查救应因素（通用 + 格局专用）
  const pogeContext = options.pogeContext || { flags: {} };
  const allRescueFactors = [
    ...checkRescueFactors(pillars, strength, W, structureName, relevantPogeFactors, pogeContext),
    ...diagnosisResult.patternSpecificRescueFactors
  ];
  
  // 去重：相同类型的救应因素只保留一个（保留权重最高的）
  const rescueFactorsMap = new Map();
  for (const rescue of allRescueFactors) {
    const type = rescue.type;
    const existing = rescueFactorsMap.get(type);
    if (!existing || (rescue.weight || 0) > (existing.weight || 0)) {
      rescueFactorsMap.set(type, rescue);
    }
  }
  const rescueFactors = Array.from(rescueFactorsMap.values());
  
  // 4. 综合评定
  const result = evaluatePurityLevel(relevantPogeFactors, rescueFactors, structureName, W, strength);
  
  return {
    level: result.level,  // '真' | '假' | '一般' | '破格'
    score: result.score,  // 0-100分
    pogeFactors: relevantPogeFactors,  // 破格因素列表
    rescueFactors: rescueFactors,  // 救应因素列表
    description: result.description  // 描述文本
  };
}

/**
 * 获取格局对应的诊断函数名称
 */
function getDiagnosisFunctionName(structureName) {
  if (!structureName) return null;
  
  // 直接匹配
  if (PATTERN_DIAGNOSIS_MAP[structureName]) {
    return PATTERN_DIAGNOSIS_MAP[structureName];
  }
  
  // 模糊匹配（处理组合格局，如"建禄格 枭印格"）
  const mainPattern = structureName.split(' ')[0];
  if (PATTERN_DIAGNOSIS_MAP[mainPattern]) {
    return PATTERN_DIAGNOSIS_MAP[mainPattern];
  }
  
  // 包含匹配
  for (const [pattern, funcName] of Object.entries(PATTERN_DIAGNOSIS_MAP)) {
    if (structureName.includes(pattern)) {
      return funcName;
    }
  }
  
  return null;
}

/**
 * 获取诊断函数
 */
function getDiagnosisFunction(funcName) {
  const funcMap = {
    'diagnoseZhengGuanGe': diagnoseZhengGuanGe,
    'diagnoseQiShaGe': diagnoseQiShaGe,
    'diagnoseZhengCaiGe': diagnoseZhengCaiGe,
    'diagnosePianCaiGe': diagnosePianCaiGe,
    'diagnoseZhengYinGe': diagnoseZhengYinGe,
    'diagnosePianYinGe': diagnosePianYinGe,
    'diagnoseShiShenGe': diagnoseShiShenGe,
    'diagnoseShangGuanGe': diagnoseShangGuanGe,
    'diagnoseJianLuGe': diagnoseJianLuGe,
    'diagnoseYangRenGe': diagnoseYangRenGe,
    'diagnoseYueJieGe': diagnoseYueJieGe,
    'diagnoseZhuanWangGe': diagnoseZhuanWangGe,
    'diagnoseCongRuoGe': diagnoseCongRuoGe,
    'diagnoseHuaQiGe': diagnoseHuaQiGe
  };
  
  return funcMap[funcName] || null;
}

/**
 * 辅助函数：检查天干是否被合
 */
function checkStemIsCombined(pillars, targetStem) {
  const stems = [
    pillars.year?.stem,
    pillars.month?.stem,
    pillars.day?.stem,
    pillars.hour?.stem
  ].filter(Boolean);
  
  for (const stem of stems) {
    if (stem === targetStem) {
      // 检查该天干是否与其他天干相合
      for (const otherStem of stems) {
        if (otherStem !== stem) {
          const he = checkStemWuHe(stem, otherStem);
          if (he) return true;
        }
      }
    }
  }
  return false;
}

/**
 * 辅助函数：检查天干在地支是否有根
 */
function checkStemHasRoot(pillars, targetStem) {
  const allBranches = [
    pillars.year?.branch,
    pillars.month?.branch,
    pillars.day?.branch,
    pillars.hour?.branch
  ].filter(Boolean);
  
  for (const branch of allBranches) {
    const hidden = HIDDEN_STEMS[branch] || [];
    if (Array.isArray(hidden)) {
      for (const item of hidden) {
        const stem = typeof item === 'string' ? item : item.stem;
        if (stem === targetStem) {
          return true;
        }
      }
    }
  }
  return false;
}

/**
 * 辅助函数：检查是否有官杀混杂
 */
function checkGuanShaHunZa(W) {
  return W.zGuan > 0.3 && W.sha > 0.3;
}

/**
 * 诊断正官格
 * 破格因素：伤官见官(10)、官杀混杂(8)、官星被合(7)、官星无根(6)
 */
function diagnoseZhengGuanGe(pillars, strength, W, result, options) {
  // 检查伤官见官
  if (W.shang > 0.5 && W.yin < 0.3) {
    result.patternSpecificPogeFactors.push({
      type: '伤官见官',
      weight: 10,
      description: '伤官直接克制正官，严重破格'
    });
  }
  
  // 检查官杀混杂
  if (checkGuanShaHunZa(W)) {
    result.patternSpecificPogeFactors.push({
      type: '官杀混杂',
      weight: 8,
      description: '正官七杀并存，格局不清'
    });
  }
  
  // 检查官星被合（需要找到正官天干）
  const guanStem = findStemByTenGod(pillars, '正官');
  if (guanStem && checkStemIsCombined(pillars, guanStem)) {
    result.patternSpecificPogeFactors.push({
      type: '官星被合',
      weight: 7,
      description: '官星被合化失用'
    });
  }
  
  // 检查官星无根
  if (guanStem && !checkStemHasRoot(pillars, guanStem)) {
    result.patternSpecificPogeFactors.push({
      type: '官星无根',
      weight: 6,
      description: '官星在地支无根气'
    });
  }
  
  // 检查救应因素
  if (W.shang > 0.5 && W.yin > 0.5) {
    result.patternSpecificRescueFactors.push({
      type: '印星制伤',
      weight: 10,
      description: '印星制约伤官保护官星',
      counterPoge: '伤官见官'
    });
  }
  
  if (checkGuanShaHunZa(W) && W.yin > 0.6) {
    result.patternSpecificRescueFactors.push({
      type: '印星化杀',
      weight: 9,
      description: '印星化杀，取清格局',
      counterPoge: '官杀混杂'
    });
  }
}

/**
 * 诊断七杀格
 * 破格因素：杀重无制(10)、制杀太过(8)、杀弱身强(6)
 */
function diagnoseQiShaGe(pillars, strength, W, result, options) {
  const dayMasterStrength = strength.score || 0.5;
  
  // 检查杀重无制
  if (W.sha > 0.7 && W.shishen < 0.5 && W.yin < 0.5) {
    result.patternSpecificPogeFactors.push({
      type: '杀重无制',
      weight: 10,
      description: '七杀旺而无制化'
    });
  }
  
  // 检查制杀太过
  if (W.sha > 0.5 && (W.shishen > W.sha * 1.5 || W.yin > W.sha * 1.5)) {
    result.patternSpecificPogeFactors.push({
      type: '制杀太过',
      weight: 8,
      description: '制化七杀太过反失威权'
    });
  }
  
  // 检查杀弱身强
  if (W.sha < 0.3 && dayMasterStrength > 0.7) {
    result.patternSpecificPogeFactors.push({
      type: '杀弱身强',
      weight: 6,
      description: '七杀太弱无法显威'
    });
  }
  
  // 检查救应因素
  if (W.sha > 0.7 && W.shishen > 0.5) {
    result.patternSpecificRescueFactors.push({
      type: '食神制杀',
      weight: 10,
      description: '食神有效制约七杀',
      counterPoge: '杀重无制'
    });
  }
  
  if (W.sha > 0.7 && W.yin > 0.5) {
    result.patternSpecificRescueFactors.push({
      type: '印星化杀',
      weight: 8,
      description: '印星转化七杀压力',
      counterPoge: '杀重无制'
    });
  }
}

/**
 * 诊断正财格
 * 破格因素：比劫夺财(10)、财多身弱(8)、财星被合(7)
 */
function diagnoseZhengCaiGe(pillars, strength, W, result, options) {
  const dayMasterStrength = strength.score || 0.5;
  
  // 检查比劫夺财
  if (W.bi > 0.7 && W.guan < 0.4) {
    result.patternSpecificPogeFactors.push({
      type: '比劫夺财',
      weight: 10,
      description: '比劫争夺财星'
    });
  }
  
  // 检查财多身弱
  if (W.cai > 0.8 && dayMasterStrength < 0.4) {
    result.patternSpecificPogeFactors.push({
      type: '财多身弱',
      weight: 8,
      description: '财星过旺日主不堪'
    });
  }
  
  // 检查财星被合
  const caiStem = findStemByTenGod(pillars, '正财');
  if (caiStem && checkStemIsCombined(pillars, caiStem)) {
    result.patternSpecificPogeFactors.push({
      type: '财星被合',
      weight: 7,
      description: '财星被合化失用'
    });
  }
  
  // 检查救应因素
  if (W.bi > 0.7 && W.guan > 0.5) {
    result.patternSpecificRescueFactors.push({
      type: '官星护财',
      weight: 8,
      description: '官星制约比劫保护财星',
      counterPoge: '比劫夺财'
    });
  }
  
  if (W.cai > 0.8 && dayMasterStrength < 0.4 && W.shi > 0.5) {
    result.patternSpecificRescueFactors.push({
      type: '食伤生财',
      weight: 7,
      description: '食伤转化生财减轻压力',
      counterPoge: '财多身弱'
    });
  }
}

/**
 * 诊断偏财格
 * 破格因素：比劫夺财(10)、财多身弱(8)、财星被合(7)
 */
function diagnosePianCaiGe(pillars, strength, W, result, options) {
  const dayMasterStrength = strength.score || 0.5;
  
  // 检查比劫夺财
  if (W.bi > 0.7 && W.guan < 0.4) {
    result.patternSpecificPogeFactors.push({
      type: '比劫夺财',
      weight: 10,
      description: '比劫争夺财星'
    });
  }
  
  // 检查财多身弱
  if (W.cai > 0.8 && dayMasterStrength < 0.4) {
    result.patternSpecificPogeFactors.push({
      type: '财多身弱',
      weight: 8,
      description: '财星过旺日主不堪'
    });
  }
  
  // 检查财星被合
  const caiStem = findStemByTenGod(pillars, '偏财');
  if (caiStem && checkStemIsCombined(pillars, caiStem)) {
    result.patternSpecificPogeFactors.push({
      type: '财星被合',
      weight: 7,
      description: '财星被合化失用'
    });
  }
  
  // 检查救应因素
  if (W.bi > 0.7 && W.guan > 0.5) {
    result.patternSpecificRescueFactors.push({
      type: '官星护财',
      weight: 8,
      description: '官星制约比劫保护财星',
      counterPoge: '比劫夺财'
    });
  }
  
  if (W.cai > 0.8 && dayMasterStrength < 0.4 && W.shi > 0.5) {
    result.patternSpecificRescueFactors.push({
      type: '食伤生财',
      weight: 7,
      description: '食伤转化生财减轻压力',
      counterPoge: '财多身弱'
    });
  }
}

/**
 * 诊断正印格
 * 破格因素：财星坏印(10)、印重身埋(8)、印星被合(6)
 */
function diagnoseZhengYinGe(pillars, strength, W, result, options) {
  const dayMasterStrength = strength.score || 0.5;
  
  // 检查财星坏印
  if (W.cai > 0.8 && W.bi < 0.4) {
    result.patternSpecificPogeFactors.push({
      type: '财星坏印',
      weight: 10,
      description: '财星克制印星'
    });
  }
  
  // 检查印重身埋
  if (W.yin > 1.2 && dayMasterStrength < 0.5) {
    result.patternSpecificPogeFactors.push({
      type: '印重身埋',
      weight: 8,
      description: '印星过重反埋没日主'
    });
  }
  
  // 检查印星被合
  const yinStem = findStemByTenGod(pillars, '正印');
  if (yinStem && checkStemIsCombined(pillars, yinStem)) {
    result.patternSpecificPogeFactors.push({
      type: '印星被合',
      weight: 6,
      description: '印星被合化失用'
    });
  }
  
  // 检查救应因素
  if (W.cai > 0.8 && W.bi > 0.5) {
    result.patternSpecificRescueFactors.push({
      type: '比劫解围',
      weight: 7,
      description: '比劫解围，减轻财星对印星的伤害',
      counterPoge: '财星坏印'
    });
  }
  
  if (W.cai > 0.8 && W.guan > 0.5) {
    result.patternSpecificRescueFactors.push({
      type: '官星生印',
      weight: 7,
      description: '官星生印增强印星力量',
      counterPoge: '财星坏印'
    });
  }
}

/**
 * 诊断偏印格
 * 破格因素：财星坏印(10)、印重身埋(8)、印星被合(6)
 */
function diagnosePianYinGe(pillars, strength, W, result, options) {
  const dayMasterStrength = strength.score || 0.5;
  
  // 检查财星坏印
  if (W.cai > 0.8 && W.bi < 0.4) {
    result.patternSpecificPogeFactors.push({
      type: '财星坏印',
      weight: 10,
      description: '财星克制印星'
    });
  }
  
  // 检查印重身埋
  if (W.yin > 1.2 && dayMasterStrength < 0.5) {
    result.patternSpecificPogeFactors.push({
      type: '印重身埋',
      weight: 8,
      description: '印星过重反埋没日主'
    });
  }
  
  // 检查印星被合
  const yinStem = findStemByTenGod(pillars, '偏印');
  if (yinStem && checkStemIsCombined(pillars, yinStem)) {
    result.patternSpecificPogeFactors.push({
      type: '印星被合',
      weight: 6,
      description: '印星被合化失用'
    });
  }
  
  // 检查救应因素
  if (W.cai > 0.8 && W.bi > 0.5) {
    result.patternSpecificRescueFactors.push({
      type: '比劫解围',
      weight: 7,
      description: '比劫解围，减轻财星对印星的伤害',
      counterPoge: '财星坏印'
    });
  }
  
  if (W.cai > 0.8 && W.guan > 0.5) {
    result.patternSpecificRescueFactors.push({
      type: '官星生印',
      weight: 7,
      description: '官星生印增强印星力量',
      counterPoge: '财星坏印'
    });
  }
  
  // 检查食伤泄秀（针对印重身埋或枭印太旺的情况）
  // 如果印星过重，食伤可以转化印星能量，避免印重身埋
  if (W.yin > 1.0 && W.shi > 0.4 && dayMasterStrength > 0.5) {
    result.patternSpecificRescueFactors.push({
      type: '食伤泄秀',
      weight: 8,
      description: '食伤转化印星能量，避免印重身埋',
      counterPoge: '印重身埋'
    });
  }
}

/**
 * 辅助函数：根据十神查找对应的天干
 */
function findStemByTenGod(pillars, tenGod) {
  const dayStem = pillars.day?.stem;
  if (!dayStem) return null;
  
  const allPillars = ['year', 'month', 'day', 'hour'];
  for (const key of allPillars) {
    const pillar = pillars[key];
    if (!pillar) continue;
    
    const allStems = collectAllStems(pillar);
    for (const item of allStems) {
      const tg = tenGodOf(dayStem, item.stem);
      if (tg === tenGod && item.isStem) {
        return item.stem;
      }
    }
  }
  return null;
}

/**
 * 诊断食神格
 * 破格因素：枭神夺食(10)、食伤过旺(7)
 */
function diagnoseShiShenGe(pillars, strength, W, result, options) {
  const dayMasterStrength = strength.score || 0.5;
  
  // 检查枭神夺食
  if (W.pYin > 0.6 && W.cai < 0.4) {
    result.patternSpecificPogeFactors.push({
      type: '枭神夺食',
      weight: 10,
      description: '偏印克制食神'
    });
  }
  
  // 检查食伤过旺
  if (W.shi > 1.5 && dayMasterStrength < 0.5) {
    result.patternSpecificPogeFactors.push({
      type: '食伤过旺',
      weight: 7,
      description: '食伤过旺泄身太过'
    });
  }
  
  // 检查救应因素
  if (W.pYin > 0.6 && W.cai > 0.5) {
    result.patternSpecificRescueFactors.push({
      type: '财星制印',
      weight: 8,
      description: '财星制偏印，保护食神',
      counterPoge: '枭神夺食'
    });
  }
}

/**
 * 诊断伤官格
 * 破格因素：伤官见官(10)、食伤过旺(7)
 */
function diagnoseShangGuanGe(pillars, strength, W, result, options) {
  const dayMasterStrength = strength.score || 0.5;
  
  // 检查伤官见官
  if (W.shang > 0.5 && W.zGuan > 0.3 && W.yin < 0.3) {
    result.patternSpecificPogeFactors.push({
      type: '伤官见官',
      weight: 10,
      description: '伤官克制正官'
    });
  }
  
  // 检查食伤过旺
  if (W.shi > 1.5 && dayMasterStrength < 0.5) {
    result.patternSpecificPogeFactors.push({
      type: '食伤过旺',
      weight: 7,
      description: '食伤过旺泄身太过'
    });
  }
  
  // 检查救应因素
  if (W.shang > 0.5 && W.zGuan > 0.3 && W.yin > 0.5) {
    result.patternSpecificRescueFactors.push({
      type: '印星制伤',
      weight: 10,
      description: '印星制约伤官保护官星',
      counterPoge: '伤官见官'
    });
  }
}

/**
 * 诊断建禄格
 * 破格因素：比劫成群(8)、官杀混杂(7)
 */
function diagnoseJianLuGe(pillars, strength, W, result, options) {
  // 检查比劫成群
  if (W.bi > 1.0) {
    result.patternSpecificPogeFactors.push({
      type: '比劫成群',
      weight: 8,
      description: '比劫过多争夺资源'
    });
  }
  
  // 检查官杀混杂
  if (checkGuanShaHunZa(W)) {
    result.patternSpecificPogeFactors.push({
      type: '官杀混杂',
      weight: 7,
      description: '官杀并存格局不清'
    });
  }
  
  // 检查救应因素
  if (W.bi > 1.0 && W.shi > 0.5) {
    result.patternSpecificRescueFactors.push({
      type: '食伤泄秀',
      weight: 7,
      description: '食伤转化比劫能量',
      counterPoge: '比劫成群'
    });
  }
  
  if (checkGuanShaHunZa(W) && W.yin > 0.6) {
    result.patternSpecificRescueFactors.push({
      type: '印星化杀',
      weight: 6,
      description: '印星化解官杀混杂',
      counterPoge: '官杀混杂'
    });
  }
}

/**
 * 诊断阳刃格
 * 破格因素：比劫成群(8)、官杀混杂(7)
 */
function diagnoseYangRenGe(pillars, strength, W, result, options) {
  // 检查比劫成群
  if (W.bi > 1.0) {
    result.patternSpecificPogeFactors.push({
      type: '比劫成群',
      weight: 8,
      description: '比劫过多争夺资源'
    });
  }
  
  // 检查官杀混杂
  if (checkGuanShaHunZa(W)) {
    result.patternSpecificPogeFactors.push({
      type: '官杀混杂',
      weight: 7,
      description: '官杀并存格局不清'
    });
  }
  
  // 检查救应因素
  if (W.bi > 1.0 && W.shi > 0.5) {
    result.patternSpecificRescueFactors.push({
      type: '食伤泄秀',
      weight: 7,
      description: '食伤转化比劫能量',
      counterPoge: '比劫成群'
    });
  }
  
  if (checkGuanShaHunZa(W) && W.yin > 0.6) {
    result.patternSpecificRescueFactors.push({
      type: '印星化杀',
      weight: 6,
      description: '印星化解官杀混杂',
      counterPoge: '官杀混杂'
    });
  }
}

/**
 * 诊断月劫格
 * 破格因素：比劫夺财(9)、比劫成群(8)、官杀混杂(7)
 */
function diagnoseYueJieGe(pillars, strength, W, result, options) {
  // 检查比劫夺财
  if (W.bi > 0.7 && W.cai > 0.3 && W.guan < 0.4) {
    result.patternSpecificPogeFactors.push({
      type: '比劫夺财',
      weight: 9,
      description: '比劫争夺财星'
    });
  }
  
  // 检查比劫成群
  if (W.bi > 1.0) {
    result.patternSpecificPogeFactors.push({
      type: '比劫成群',
      weight: 8,
      description: '比劫过多争夺资源'
    });
  }
  
  // 检查官杀混杂
  if (checkGuanShaHunZa(W)) {
    result.patternSpecificPogeFactors.push({
      type: '官杀混杂',
      weight: 7,
      description: '官杀并存格局不清'
    });
  }
  
  // 检查救应因素
  if (W.bi > 0.7 && W.cai > 0.3 && W.guan > 0.5) {
    result.patternSpecificRescueFactors.push({
      type: '官星制劫',
      weight: 8,
      description: '官星制约比劫保护财星',
      counterPoge: '比劫夺财'
    });
  }
  
  if (W.bi > 1.0 && W.shi > 0.5) {
    result.patternSpecificRescueFactors.push({
      type: '食伤泄秀',
      weight: 7,
      description: '食伤转化比劫能量',
      counterPoge: '比劫成群'
    });
  }
  
  if (checkGuanShaHunZa(W) && W.yin > 0.6) {
    result.patternSpecificRescueFactors.push({
      type: '印星化杀',
      weight: 6,
      description: '印星化解官杀混杂',
      counterPoge: '官杀混杂'
    });
  }
}

/**
 * 诊断专旺格
 * 破格因素：格局不纯(10)、五行破格(8)
 * 覆盖：曲直仁寿格、炎上格、稼穑格、从革格、润下格
 */
function diagnoseZhuanWangGe(pillars, strength, W, result, options) {
  const patternName = result.patternName;
  
  // 确定专旺五行
  let wangElement = null;
  if (patternName.includes('曲直') || patternName.includes('木')) {
    wangElement = '木';
  } else if (patternName.includes('炎上') || patternName.includes('火')) {
    wangElement = '火';
  } else if (patternName.includes('稼穑') || patternName.includes('土')) {
    wangElement = '土';
  } else if (patternName.includes('从革') || patternName.includes('金')) {
    wangElement = '金';
  } else if (patternName.includes('润下') || patternName.includes('水')) {
    wangElement = '水';
  }
  
  if (!wangElement) return;
  
  // 检查格局不纯（有其他五行干扰）
  const allElements = getAllElements(pillars);
  const wangCount = allElements[wangElement] || 0;
  const totalCount = Object.values(allElements).reduce((a, b) => a + b, 0);
  const wangRatio = wangCount / totalCount;
  
  if (wangRatio < 0.7) {
    result.patternSpecificPogeFactors.push({
      type: '格局不纯',
      weight: 10,
      description: '专旺格局不纯粹'
    });
  }
  
  // 检查五行破格（有克制专旺五行的力量）
  const poGeElement = getPoGeElement(wangElement);
  const poGeCount = allElements[poGeElement] || 0;
  
  if (poGeCount > 0.3) {
    result.patternSpecificPogeFactors.push({
      type: `${poGeElement}星破格`,
      weight: 8,
      description: `${poGeElement}星破坏${wangElement}专旺`
    });
  }
}

/**
 * 诊断从弱格
 * 破格因素：日主有根(10)、所从不强(8)
 * 覆盖：从财格、从杀格、从儿格、从势格
 */
function diagnoseCongRuoGe(pillars, strength, W, result, options) {
  const patternName = result.patternName;
  const dayMasterStrength = strength.score || 0.5;
  
  // 检查日主有根
  const dayStem = pillars.day?.stem;
  if (dayStem && checkStemHasRoot(pillars, dayStem)) {
    result.patternSpecificPogeFactors.push({
      type: '日主有根',
      weight: 10,
      description: '日主有根气不从弱'
    });
  }
  
  // 检查所从不强
  let congStrength = 0;
  if (patternName.includes('从财')) {
    congStrength = W.cai;
  } else if (patternName.includes('从杀')) {
    congStrength = W.sha;
  } else if (patternName.includes('从儿')) {
    congStrength = W.shi;
  } else if (patternName.includes('从势')) {
    // 从势格：财、官、食伤中最强的
    congStrength = Math.max(W.cai, W.guan, W.shi);
  }
  
  if (congStrength < 0.6) {
    result.patternSpecificPogeFactors.push({
      type: '所从不强',
      weight: 8,
      description: '所从十神力量不足'
    });
  }
}

/**
 * 诊断化气格
 * 破格因素：化气不成(10)、破格五行(8)
 * 覆盖：甲己化土格、乙庚化金格、丙辛化水格、丁壬化木格、戊癸化火格
 */
function diagnoseHuaQiGe(pillars, strength, W, result, options) {
  const patternName = result.patternName;
  
  // 确定化气五行
  let huaElement = null;
  if (patternName.includes('化土')) {
    huaElement = '土';
  } else if (patternName.includes('化金')) {
    huaElement = '金';
  } else if (patternName.includes('化水')) {
    huaElement = '水';
  } else if (patternName.includes('化木')) {
    huaElement = '木';
  } else if (patternName.includes('化火')) {
    huaElement = '火';
  }
  
  if (!huaElement) return;
  
  // 检查化气不成（需要检查天干是否真的合化）
  const stems = [
    pillars.year?.stem,
    pillars.month?.stem,
    pillars.day?.stem,
    pillars.hour?.stem
  ].filter(Boolean);
  
  let hasHe = false;
  for (let i = 0; i < stems.length; i++) {
    for (let j = i + 1; j < stems.length; j++) {
      const he = checkStemWuHe(stems[i], stems[j]);
      if (he && he.element === huaElement) {
        hasHe = true;
        break;
      }
    }
    if (hasHe) break;
  }
  
  if (!hasHe) {
    result.patternSpecificPogeFactors.push({
      type: '化气不成',
      weight: 10,
      description: '化气条件不满足'
    });
  }
  
  // 检查破格五行（有克制化气五行的力量）
  const poGeElement = getPoGeElement(huaElement);
  const allElements = getAllElements(pillars);
  const poGeCount = allElements[poGeElement] || 0;
  
  if (poGeCount > 0.3) {
    result.patternSpecificPogeFactors.push({
      type: '破格五行',
      weight: 8,
      description: '有克制化气五行的力量'
    });
  }
}

/**
 * 辅助函数：获取所有五行的数量
 */
function getAllElements(pillars) {
  const elements = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  
  const allPillars = ['year', 'month', 'day', 'hour'];
  for (const key of allPillars) {
    const pillar = pillars[key];
    if (!pillar) continue;
    
    // 天干五行
    if (pillar.stem) {
      const el = STEM_ELEMENT[pillar.stem];
      if (el) elements[el] = (elements[el] || 0) + 1;
    }
    
    // 地支五行
    if (pillar.branch) {
      const el = BRANCH_ELEMENT[pillar.branch];
      if (el) elements[el] = (elements[el] || 0) + 1;
    }
    
    // 藏干五行
    const hidden = HIDDEN_STEMS[pillar.branch] || [];
    if (Array.isArray(hidden)) {
      for (const item of hidden) {
        const stem = typeof item === 'string' ? item : item.stem;
        if (stem) {
          const el = STEM_ELEMENT[stem];
          if (el) elements[el] = (elements[el] || 0) + 0.3; // 藏干权重较低
        }
      }
    }
  }
  
  return elements;
}

/**
 * 辅助函数：获取破格五行（克制目标五行的五行）
 */
function getPoGeElement(targetElement) {
  const poGeMap = {
    '木': '金',  // 金克木
    '火': '水',  // 水克火
    '土': '木',  // 木克土
    '金': '火',  // 火克金
    '水': '土'   // 土克水
  };
  return poGeMap[targetElement] || null;
}

/**
 * 筛选与当前格局相关的破格因素
 */
function filterRelevantPogeFactors(pogeFactors, structureName) {
  if (!pogeFactors || pogeFactors.length === 0) return [];
  
  // 根据格局类型筛选相关破格因素
  const relevantTypes = [];
  
  if (structureName.includes('官') && !structureName.includes('从')) {
    relevantTypes.push('伤官见官', '官杀混杂');
  }
  if (structureName.includes('财') && !structureName.includes('从')) {
    relevantTypes.push('比劫夺财');
  }
  if (structureName.includes('印') && !structureName.includes('从')) {
    relevantTypes.push('财星坏印');
  }
  if (structureName.includes('食神')) {
    relevantTypes.push('枭神夺食');
  }
  
  // 通用破格因素（所有格局都适用）
  const commonTypes = ['官杀混杂', '印重身埋', '财多身弱', '食伤过旺', '比劫成群', '根气受损', '用神被合'];
  relevantTypes.push(...commonTypes);
  
  return pogeFactors.filter(factor => relevantTypes.includes(factor.type));
}

/**
 * 检查救应因素
 */
function checkRescueFactors(pillars, strength, W, structureName, pogeFactors, context) {
  const rescueFactors = [];
  const flags = context?.flags || {};
  
  // 根据格局类型和破格因素检查救应
  const specificRescues = [];
  for (const poge of pogeFactors) {
    const rescue = checkRescueForPoge(poge, pillars, strength, W, structureName, flags);
    if (rescue) {
      specificRescues.push(rescue);
      rescueFactors.push(rescue);
    }
  }
  
  // 通用救应检查（需要排除已被判为过旺的因素）
  // ✅ 使用工具函数统一检查（已在文件顶部导入）
  // 如果已经有针对特定破格因素的食伤泄秀救应，则不再添加通用的
  const hasShiXieXiuRescue = specificRescues.some(r => r.type === '食伤泄秀');
  
  if (canUseShiAsRescue(flags) && !hasShiXieXiuRescue) {
    // 食伤泄秀（仅当食伤未过旺时）
    // 条件放宽：身强（>0.5）且有食伤（>0.4）即可，不要求食伤必须在0.6-1.3之间
    if (W.shi > 0.4 && W.shi < 1.5 && strength.score > 0.5) {
      // 检查是否有比劫成群或印重的情况，如果有则更明确
      const hasBiOverflow = flags?.bi_overflow || pogeFactors.some(p => p.type === '比劫成群');
      const hasYinOverflow = pogeFactors.some(p => p.type === '枭印太旺' || p.type === '印重身埋');
      
      if (hasBiOverflow || hasYinOverflow || strength.score > 0.6) {
        rescueFactors.push({
          type: '食伤泄秀',
          effectiveness: W.shi > 0.6 ? '有效' : '一般',
          description: hasBiOverflow 
            ? '食伤转化比劫能量，才华得以发挥'
            : hasYinOverflow
            ? '食伤转化印星能量，避免印重身埋'
            : '食伤转化日主能量，才华得以发挥',
          counterPoge: hasBiOverflow ? '比劫成群' : hasYinOverflow ? '印重身埋' : '身强无泄'
        });
      }
    }
    
    // 食伤制官（泛用版，仅当食伤未过旺时）
    if (W.guan > 0.5 && W.shi > W.guan * 0.8 && W.shi < 1.3) {
      rescueFactors.push({
        type: '食伤制官',
        effectiveness: '有效',
        description: '食伤制约官星，化解官杀压力',
        counterPoge: '官杀过重'
      });
    }
  }
  
  return rescueFactors;
}

/**
 * 检查特定破格因素的救应（优化版：接收 flags）
 */
function checkRescueForPoge(pogeFactor, pillars, strength, W, structureName, flags) {
  const type = pogeFactor.type;
  // ✅ 工具函数已在文件顶部导入
  
  switch (type) {
    case '伤官见官':
      // 救应：印星制伤护官
      if (canUseYinAsRescue(flags, '伤官见官')) {
        if (W.yin > 0.5) {
          return {
            type: '印星制伤',
            target: '伤官见官',
            effectiveness: W.yin > 0.7 ? '有效' : '一般',
            description: '印星制伤护官，化解伤官见官之害'
          };
        }
      }
      break;
      
    case '官杀混杂':
      // 救应：合去其一，或印星化杀（即使印星过重，化杀也是有效的）
      if (canUseYinAsRescue(flags, '官杀混杂')) {
        if (W.yin > 0.6) {
          return {
            type: '印星化杀',
            target: '官杀混杂',
            effectiveness: '有效',
            description: '印星化杀，取清格局'
          };
        }
      }
      break;
      
    case '比劫夺财':
      // 救应：官星制比劫
      if (W.guan > 0.5) {
        return {
          type: '官星制劫',
          target: '比劫夺财',
          effectiveness: W.guan > 0.7 ? '有效' : '一般',
          description: '官星制比劫，保护财星'
        };
      }
      break;
      
    case '财星坏印':
      // 救应：比劫解围
      if (canUseBiAsRescue(flags)) {
        if (W.bi > 0.5) {
          return {
            type: '比劫解围',
            target: '财星坏印',
            effectiveness: W.bi > 0.7 ? '有效' : '一般',
            description: '比劫解围，减轻财星对印星的伤害'
          };
        }
      }
      break;
      
    case '枭神夺食':
      // 救应：财星制印
      if (canUseCaiAsRescue(flags)) {
        if (W.cai > 0.5) {
          return {
            type: '财星制印',
            target: '枭神夺食',
            effectiveness: W.cai > 0.7 ? '有效' : '一般',
            description: '财星制偏印，保护食神'
          };
        }
      }
      break;
      
    case '杀重无制':
      // 救应：食神制杀或印星化杀
      // 使用 W.shi（食伤合并）更稳妥，因为 W.shishen 可能在某些情况下不存在
      if (canUseShiAsRescue(flags) && W.shi > 0.5) {
        return {
          type: '食神制杀',
          target: '杀重无制',
          effectiveness: W.shi > 0.7 ? '有效' : '一般',
          description: '食神制杀，化压力为权力'
        };
      } else if (canUseYinAsRescue(flags, '杀重无制') && W.yin > 0.5) {
        return {
          type: '印星化杀',
          target: '杀重无制',
          effectiveness: W.yin > 0.7 ? '有效' : '一般',
          description: '印星化杀，化压力为助力'
        };
      }
      break;
      
    case '比劫成群':
      // 救应：食伤泄秀（食伤转化比劫能量）
      if (canUseShiAsRescue(flags) && W.shi > 0.4) {
        return {
          type: '食伤泄秀',
          target: '比劫成群',
          effectiveness: W.shi > 0.6 ? '有效' : '一般',
          description: '食伤转化比劫能量，才华得以发挥'
        };
      }
      break;
      
    case '枭印太旺':
    case '印重身埋':
      // 救应：食伤泄秀（食伤转化印星能量，避免印重身埋）
      if (canUseShiAsRescue(flags) && W.shi > 0.4 && strength.score > 0.5) {
        return {
          type: '食伤泄秀',
          target: type,
          effectiveness: W.shi > 0.6 ? '有效' : '一般',
          description: '食伤转化印星能量，避免印重身埋'
        };
      }
      break;
  }
  
  return null;
}

/**
 * 综合评定纯度等级
 */
function evaluatePurityLevel(pogeFactors, rescueFactors, structureName, W, strength) {
  // 计算破格严重程度
  const pogeScore = calculatePogeScore(pogeFactors);
  
  // 计算救应有效程度
  const rescueScore = calculateRescueScore(rescueFactors);
  
  // 计算基础分数
  let baseScore = 100;
  
  // 根据格局类型调整基础分数
  if (structureName.includes('专旺') || structureName.includes('从弱') || structureName.includes('化')) {
    // 特殊格局基础分数稍低
    baseScore = 95;
  }
  
  // 最终分数 = 基础分数 - 破格分数 + 救应分数
  const finalScore = Math.max(0, Math.min(100, baseScore - pogeScore + rescueScore));
  
  // 判断等级
  let level, description;
  
  if (pogeFactors.length === 0 || (pogeScore === 0 && rescueScore > 0)) {
    level = '真';
    description = generateDescription('真', structureName, pogeFactors, rescueFactors);
  } else if (pogeScore > 0 && rescueScore >= pogeScore * 0.8) {
    level = '假';
    description = generateDescription('假', structureName, pogeFactors, rescueFactors);
  } else if (pogeScore > 0 && rescueScore > 0 && rescueScore < pogeScore * 0.8) {
    level = '一般';
    description = generateDescription('一般', structureName, pogeFactors, rescueFactors);
  } else {
    level = '破格';
    description = generateDescription('破格', structureName, pogeFactors, rescueFactors);
  }
  
  return {
    level,
    score: Math.round(finalScore),
    description
  };
}

/**
 * 计算破格分数
 */
function calculatePogeScore(pogeFactors) {
  if (!pogeFactors || pogeFactors.length === 0) return 0;
  
  let totalScore = 0;
  
  for (const factor of pogeFactors) {
    // 根据破格因素的严重程度计算分数
    const severity = factor.severity || { score: 1.0 };
    const baseWeight = getPogeBaseWeight(factor.type);
    
    totalScore += baseWeight * (severity.score || 1.0);
  }
  
  return Math.min(100, totalScore);
}

/**
 * 获取破格因素的基础权重
 */
function getPogeBaseWeight(type) {
  const weights = {
    // 严重破格
    '伤官见官': 10,
    '官杀混杂': 10,
    '杀重无制': 10,
    '比劫夺财': 8,
    '财星坏印': 8,
    '枭神夺食': 9,
    
    // 中等破格
    '官星被合': 5,
    '用神被合': 5,
    '根气受损': 6,
    
    // 轻微破格
    '印重身埋': 3,
    '财多身弱': 3,
    '食伤过旺': 2,
    '比劫成群': 2
  };
  
  return weights[type] || 5;
}

/**
 * 计算救应分数
 */
function calculateRescueScore(rescueFactors) {
  if (!rescueFactors || rescueFactors.length === 0) return 0;
  
  let totalScore = 0;
  
  for (const rescue of rescueFactors) {
    const baseWeight = getRescueBaseWeight(rescue.type);
    const effectiveness = rescue.effectiveness === '有效' ? 1.0 : 0.6;
    
    totalScore += baseWeight * effectiveness;
  }
  
  return Math.min(50, totalScore);  // 救应分数上限为50分
}

/**
 * 获取救应因素的基础权重
 */
function getRescueBaseWeight(type) {
  const weights = {
    '印星制伤': 10,
    '印星化杀': 10,
    '食神制杀': 10,
    '官星制劫': 8,
    '比劫解围': 7,
    '财星制印': 8,
    '食伤泄秀': 9,   // 通用救应：食伤转化日主能量
    '食伤制官': 9    // 通用救应：食伤制约官星
  };
  
  return weights[type] || 5;
}

/**
 * 生成描述文本
 */
function generateDescription(level, structureName, pogeFactors, rescueFactors) {
  const descriptions = {
    '真': {
      base: `${structureName}格局纯粹，用神有力，无破格因素，为大贵之格。`,
      withRescue: `${structureName}格局清纯，虽有轻微瑕疵但已化解，格局成立。`
    },
    '假': {
      base: `${structureName}格局成立但有瑕疵，用神受制，有救应但不够完美。`,
      withRescue: `${structureName}格局成立，虽有破格因素但有救应化解，小富小贵。`
    },
    '一般': {
      base: `${structureName}格局勉强成立，纯度不高，用神无力，忌神无制。`,
      withRescue: `${structureName}格局成立但质量一般，有破格因素且救应不足。`
    },
    '破格': {
      base: `${structureName}格局被严重破坏，忌神猖獗，用神受损，贫贱困苦。`,
      withRescue: `${structureName}格局被破坏，虽有救应但力度不足，难以挽回。`
    }
  };
  
  const desc = descriptions[level];
  if (!desc) return `${structureName}格局纯度：${level}`;
  
  if (pogeFactors.length > 0 && rescueFactors.length > 0) {
    return desc.withRescue;
  } else if (pogeFactors.length > 0) {
    return desc.base;
  } else {
    return desc.base;
  }
}

