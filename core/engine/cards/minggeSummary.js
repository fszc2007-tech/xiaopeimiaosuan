// 新增理由：命格总评卡片数据构建（从 index.js 拆分）
// 回滚方式：回退此文件，恢复 index.js 中的原方法

import { 
  generateTiaohouLabel, 
  mapTiaohouTendency, 
  generateTiaohouSuggestion 
} from '../analysis/tiaohou.js';

/**
 * 组装命格總評数据
 * 
 * @param {Object} dayMasterStrength - 日主强度结果
 * @param {Object} structureResult - 格局结果
 * @param {Object} purityResult - 纯度结果
 * @param {Object} patternPurityResult - 格局纯度结果
 * @param {Object} tiaohouResult - 调候结果
 * @returns {Object} 命格总评数据
 */
export function buildMinggeSummary(
  dayMasterStrength, 
  structureResult, 
  purityResult, 
  patternPurityResult, 
  tiaohouResult
) {
  return {
    dayMaster: {
      level: mapDayMasterBand(dayMasterStrength.band),
      score: Math.round(dayMasterStrength.score * 100),
      factors: {
        deLing: dayMasterStrength.detail?.w_month > 0.4,
        deDi: dayMasterStrength.detail?.root > 0.3,
        deSheng: dayMasterStrength.detail?.help > 0.2,
        deZhu: dayMasterStrength.detail?.help > 0.15,
        haoShen: dayMasterStrength.detail?.drain > 0.3
      }
    },
    mainPattern: (() => {
      // 优先使用新的 mainPattern 字段（从选择算法返回）
      if (structureResult.mainPattern) {
        return {
          name: structureResult.mainPattern.label,
          confidence: structureResult.mainPattern.score,
          category: determinePatternCategory(structureResult.mainPattern.label),
          reasonBrief: (structureResult.reasons || []).slice(0, 2).join('，') || '',
          secondaryPatterns: (structureResult.secondaryPatterns || []).map(p => ({
            name: p.label,
            score: p.score
          }))
        };
      }
      // 向后兼容：使用旧的 structure 字段
      return {
        name: structureResult.structure || '未知格局',
        confidence: Math.round((structureResult.confidence || 0) * 100),
        category: determinePatternCategory(structureResult.structure),
        reasonBrief: (structureResult.reasons || []).slice(0, 2).join('，') || '',
        secondaryPatterns: []
      };
    })(),
    overallScore: {
      score: purityResult.score || 0,
      grade: calculateOverallGrade(purityResult.score || 0)
    },
    patternPurity: {
      level: mapPatternPurityToPurityLevel(
        patternPurityResult?.level || '一般',
        (patternPurityResult?.rescueFactors?.length || 0) > 0
      ),
      score: patternPurityResult?.score
    },
    breakingFactors: {
      hasBreaking: (structureResult.pogeFactors?.length || 0) > 0,
      tags: (structureResult.pogeFactors || []).map(f => f.type || f).filter(Boolean)
    },
    remedyFactors: {
      hasRemedy: (patternPurityResult?.rescueFactors?.length || 0) > 0,
      tags: (patternPurityResult?.rescueFactors || []).map(f => f.type || f).filter(Boolean)
    },
    tiaohou: {
      label: generateTiaohouLabel(tiaohouResult),
      tendency: mapTiaohouTendency(tiaohouResult),
      suggestionBrief: generateTiaohouSuggestion(tiaohouResult)
    }
  };
}

/**
 * 映射日主强弱等级
 */
export function mapDayMasterBand(band) {
  const map = {
    '从弱': '從弱',
    '身弱': '身弱',
    '平衡': '平衡',
    '身强': '身強',
    '从强': '從強'
  };
  return map[band] || band;
}

/**
 * 判断格局类别
 */
export function determinePatternCategory(structureName) {
  if (!structureName) return '其他';
  if (structureName.includes('印')) return '印格';
  if (structureName.includes('官') || structureName.includes('杀') || structureName.includes('殺')) return '官格';
  if (structureName.includes('财') || structureName.includes('財')) return '財格';
  if (structureName.includes('食') || structureName.includes('伤') || structureName.includes('傷')) return '食傷格';
  return '雜格';
}

/**
 * 根据综合纯度分数判断等级
 */
export function calculateOverallGrade(score) {
  if (score >= 80) return '上等';
  if (score >= 70) return '中上';
  if (score >= 60) return '中等';
  if (score >= 50) return '中下';
  return '偏弱';
}

/**
 * 映射格局纯度等级到清浊等级
 */
export function mapPatternPurityToPurityLevel(patternPurityLevel, hasRescue) {
  // 如果有救应因素，优先考虑"浊而有救"
  if (hasRescue && (patternPurityLevel === '假' || patternPurityLevel === '一般')) {
    return '浊而有救';
  }
  
  // 根据格局纯度等级映射
  const map = {
    '真': '清',
    '假': '稍清',
    '一般': '中浊',
    '破格': '重浊'
  };
  
  return map[patternPurityLevel] || '中和';
}

