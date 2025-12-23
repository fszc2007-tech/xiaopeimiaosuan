/**
 * 天干刑冲合化关系模块
 * 完整实现天干五合、天干四冲
 */

import { STEMS } from '../utils/constants.js';

/**
 * 天干五合配置
 * 甲己合土、乙庚合金、丙辛合水、丁壬合木、戊癸合火
 */
export const STEM_WU_HE = {
  '甲': '己', '己': '甲',  // 甲己合土
  '乙': '庚', '庚': '乙',  // 乙庚合金
  '丙': '辛', '辛': '丙',  // 丙辛合水
  '丁': '壬', '壬': '丁',  // 丁壬合木
  '戊': '癸', '癸': '戊'   // 戊癸合火
};

/**
 * 天干五合生成的五行
 */
export const STEM_WU_HE_ELEMENT = {
  '甲己': '土',
  '己甲': '土',
  '乙庚': '金',
  '庚乙': '金',
  '丙辛': '水',
  '辛丙': '水',
  '丁壬': '木',
  '壬丁': '木',
  '戊癸': '火',
  '癸戊': '火'
};

/**
 * 天干四冲配置
 * 甲庚冲、乙辛冲、丙壬冲、丁癸冲
 * 注意：戊己土居中央不冲
 */
export const STEM_SI_CHONG = {
  '甲': '庚', '庚': '甲',  // 甲庚冲
  '乙': '辛', '辛': '乙',  // 乙辛冲
  '丙': '壬', '壬': '丙',  // 丙壬冲
  '丁': '癸', '癸': '丁'   // 丁癸冲
  // 戊己土居中央不冲
};

/**
 * 检查两个天干是否五合
 * @param {string} stem1 - 天干1
 * @param {string} stem2 - 天干2
 * @returns {Object|null} 合化信息或null
 */
export function checkStemWuHe(stem1, stem2) {
  if (STEM_WU_HE[stem1] === stem2) {
    const pair = stem1 + stem2;
    return {
      type: '五合',
      stem1,
      stem2,
      element: STEM_WU_HE_ELEMENT[pair] || '未知',
      strength: 3,
      description: `${stem1}${stem2}合化${STEM_WU_HE_ELEMENT[pair] || ''}`
    };
  }
  return null;
}

/**
 * 检查两个天干是否四冲
 * @param {string} stem1 - 天干1
 * @param {string} stem2 - 天干2
 * @returns {Object|null} 冲信息或null
 */
export function checkStemSiChong(stem1, stem2) {
  if (STEM_SI_CHONG[stem1] === stem2) {
    return {
      type: '四冲',
      stem1,
      stem2,
      strength: 2,
      description: `${stem1}${stem2}相冲`
    };
  }
  return null;
}

/**
 * 分析四柱天干之间的所有关系
 * @param {Object} pillars - 四柱信息
 * @param {Object} [pillars.year] - 年柱 {stem: string, branch: string}
 * @param {Object} [pillars.month] - 月柱 {stem: string, branch: string}
 * @param {Object} [pillars.day] - 日柱 {stem: string, branch: string}
 * @param {Object} [pillars.hour] - 时柱 {stem: string, branch: string}
 * @returns {Object} 关系分析结果
 * @returns {Array<Object>} result.wuhe - 五合关系列表
 * @returns {Array<Object>} result.sichong - 四冲关系列表
 */
export function analyzeStemRelationships(pillars) {
  const stems = [
    pillars.year?.stem,
    pillars.month?.stem,
    pillars.day?.stem,
    pillars.hour?.stem
  ].filter(Boolean);
  
  const relationships = {
    wuhe: [],      // 五合
    sichong: [],   // 四冲
    overview: {}   // 各柱关系总览
  };
  
  const checked_pairs = new Set();
  
  // 检查两两关系
  for (let i = 0; i < stems.length; i++) {
    for (let j = i + 1; j < stems.length; j++) {
      const s1 = stems[i];
      const s2 = stems[j];
      const pair_key = [s1, s2].sort().join('');
      
      if (checked_pairs.has(pair_key)) {
        continue;
      }
      
      // 五合
      const he = checkStemWuHe(s1, s2);
      if (he) {
        relationships.wuhe.push({
          ...he,
          pillar1: getPillarName(i),
          pillar2: getPillarName(j),
          position: `${getPillarName(i)}-${getPillarName(j)}`
        });
        checked_pairs.add(pair_key);
      }
      
      // 四冲
      const chong = checkStemSiChong(s1, s2);
      if (chong) {
        relationships.sichong.push({
          ...chong,
          pillar1: getPillarName(i),
          pillar2: getPillarName(j),
          position: `${getPillarName(i)}-${getPillarName(j)}`
        });
        checked_pairs.add(pair_key);
      }
    }
  }
  
  // 生成各柱关系总览
  stems.forEach((stem, index) => {
    const pillarName = getPillarName(index);
    const relations = [];
    
    // 检查该天干的合关系
    const he_stem = STEM_WU_HE[stem];
    if (he_stem && stems.includes(he_stem)) {
      const element = STEM_WU_HE_ELEMENT[stem + he_stem];
      relations.push(`与${he_stem}合化${element}`);
    }
    
    // 检查该天干的冲关系
    const chong_stem = STEM_SI_CHONG[stem];
    if (chong_stem && stems.includes(chong_stem)) {
      relations.push(`与${chong_stem}相冲`);
    }
    
    relationships.overview[`${pillarName}(${stem})`] = relations.length > 0 ? relations : ['无特殊关系'];
  });
  
  return relationships;
}

/**
 * 获取柱的名称
 * @param {number} index - 柱索引 (0-3)
 * @returns {string} 柱名称
 */
function getPillarName(index) {
  const names = ['年柱', '月柱', '日柱', '时柱'];
  return names[index] || '未知';
}

/**
 * 分析流年与命局天干的关系
 * @param {Object} pillars - 四柱信息
 * @param {Object} [pillars.year] - 年柱 {stem: string, branch: string}
 * @param {Object} [pillars.month] - 月柱 {stem: string, branch: string}
 * @param {Object} [pillars.day] - 日柱 {stem: string, branch: string}
 * @param {Object} [pillars.hour] - 时柱 {stem: string, branch: string}
 * @param {string} yearStem - 流年天干
 * @returns {Array<Object>} 关系列表
 */
export function analyzeStemFlowYear(pillars, yearStem) {
  const stems = [
    pillars.year?.stem,
    pillars.month?.stem,
    pillars.day?.stem,
    pillars.hour?.stem
  ].filter(Boolean);
  
  const results = [];
  
  stems.forEach((stem, index) => {
    const pillarName = getPillarName(index);
    
    // 检查五合
    const he = checkStemWuHe(yearStem, stem);
    if (he) {
      results.push({
        type: 'wuhe',
        pillar: pillarName,
        stem,
        description: `流年${yearStem}与${pillarName}${stem}合化${he.element}`
      });
    }
    
    // 检查四冲
    const chong = checkStemSiChong(yearStem, stem);
    if (chong) {
      results.push({
        type: 'sichong',
        pillar: pillarName,
        stem,
        description: `流年${yearStem}冲${pillarName}${stem}`
      });
    }
  });
  
  return results;
}

/**
 * 生成详细分析报告
 * @param {Object} pillars - 四柱信息
 * @returns {string} 分析报告文本
 */
export function generateStemRelationshipReport(pillars) {
  const relationships = analyzeStemRelationships(pillars);
  const stems = [
    pillars.year?.stem,
    pillars.month?.stem,
    pillars.day?.stem,
    pillars.hour?.stem
  ].filter(Boolean);
  
  const lines = [];
  lines.push('=== 四柱天干关系分析报告 ===');
  lines.push(`四柱天干: [${stems.join(', ')}]`);
  lines.push('');
  
  if (relationships.wuhe.length > 0) {
    lines.push('★ 天干五合:');
    relationships.wuhe.forEach(he => {
      lines.push(`  - ${he.stem1}-${he.stem2} (${he.position}) → ${he.description}`);
    });
  } else {
    lines.push('○ 无天干五合');
  }
  
  if (relationships.sichong.length > 0) {
    lines.push('★ 天干四冲:');
    relationships.sichong.forEach(chong => {
      lines.push(`  - ${chong.stem1}-${chong.stem2} (${chong.position}) → ${chong.description}`);
    });
  } else {
    lines.push('○ 无天干四冲');
  }
  
  lines.push('');
  lines.push('★ 各柱关系总览:');
  Object.entries(relationships.overview).forEach(([position, rels]) => {
    lines.push(`  ${position}: ${rels.join('; ')}`);
  });
  
  return lines.join('\n');
}