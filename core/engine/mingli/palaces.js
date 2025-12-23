/**
 * 命宫、胎元、身宫计算模块
 * Palaces Calculation - Ming Gong (Life Palace), Tai Yuan (Fetal Origin), Shen Gong (Body Palace)
 * 
 * 职责：
 * - 计算命宫（先天命运之所）
 * - 计算胎元（先天根基）
 * - 计算身宫（后天发展方向）
 * - 分析命身关系
 */

import { STEMS, BRANCHES } from '../utils/constants.js';

// ========== 常量定义 ==========

/**
 * 月支到月份数字的映射（以寅月为正月）
 */
const MONTH_ZHI_TO_NUM = {
  '寅': 1, '卯': 2, '辰': 3, '巳': 4, '午': 5, '未': 6,
  '申': 7, '酉': 8, '戌': 9, '亥': 10, '子': 11, '丑': 12
};

/**
 * 五虎遁月口诀：根据年干推寅月天干
 * 甲己之年丙作首，乙庚之岁戊为头
 * 丙辛之年寻庚起，丁壬壬寅顺行流
 * 若问戊癸何处起，甲寅之上好追求
 */
const WU_HU_DUN = {
  '甲': '丙', '己': '丙',  // 甲己年，寅月天干为丙
  '乙': '戊', '庚': '戊',  // 乙庚年，寅月天干为戊
  '丙': '庚', '辛': '庚',  // 丙辛年，寅月天干为庚
  '丁': '壬', '壬': '壬',  // 丁壬年，寅月天干为壬
  '戊': '甲', '癸': '甲'   // 戊癸年，寅月天干为甲
};

/**
 * 地支对应的宫位名称
 */
const ZHI_PALACE_NAMES = {
  '子': '子宫', '丑': '丑宫', '寅': '寅宫', '卯': '卯宫',
  '辰': '辰宫', '巳': '巳宫', '午': '午宫', '未': '未宫',
  '申': '申宫', '酉': '酉宫', '戌': '戌宫', '亥': '亥宫'
};

/**
 * 命宫地支解读
 */
const MING_GONG_INTERPRETATIONS = {
  '子': '天贵星，志向远大，聪明智慧',
  '丑': '天厄星，先难后易，晚年发达',
  '寅': '天权星，权威在握，领导才能',
  '卯': '天赦星，善良仁慈，逢凶化吉',
  '辰': '天如星，事多反复，机谋多变',
  '巳': '天文星，文采出众，学业有成',
  '午': '天福星，福泽深厚，贵人相助',
  '未': '天驿星，奔波劳碌，变动较多',
  '申': '天孤星，独立自主，六亲缘薄',
  '酉': '天秘星，心思缜密，保守谨慎',
  '戌': '天艺星，多才多艺，技艺超群',
  '亥': '天寿星，健康长寿，晚运佳美'
};

/**
 * 身宫地支解读
 */
const SHEN_GONG_INTERPRETATIONS = {
  '子': '后天发展方向偏向智慧、交际',
  '丑': '后天重视积累，务实发展',
  '寅': '后天追求权力，事业发展',
  '卯': '后天注重人际关系，仁慈为怀',
  '辰': '后天多变，善于把握机会',
  '巳': '后天学业精进，文化发展',
  '午': '后天福运深厚，贵人运佳',
  '未': '后天奔波劳碌，变动求财',
  '申': '后天独立发展，专业技术',
  '酉': '后天谨慎保守，精于计算',
  '戌': '后天技艺发展，专业成就',
  '亥': '后天健康长寿，晚运发展'
};

/**
 * 地支五行映射
 */
const ZHI_WUXING = {
  '子': '水', '亥': '水',
  '寅': '木', '卯': '木',
  '巳': '火', '午': '火',
  '申': '金', '酉': '金',
  '辰': '土', '戌': '土', '丑': '土', '未': '土'
};

// ========== 辅助函数 ==========

/**
 * 计算宫位天干（五虎遁月法）
 * @param {String} yearStem - 年干
 * @param {String} palaceZhi - 宫位地支
 * @returns {String} 宫位天干
 */
function calculatePalaceGan(yearStem, palaceZhi) {
  // 找到寅月的天干
  const yinGan = WU_HU_DUN[yearStem] || '丙';
  const yinIndex = STEMS.indexOf(yinGan);
  
  // 计算目标宫位相对于寅宫的位置
  const targetIndex = BRANCHES.indexOf(palaceZhi);
  const yinZhiIndex = BRANCHES.indexOf('寅');
  
  // 计算偏移量
  const offset = (targetIndex - yinZhiIndex + 12) % 12;
  
  // 计算天干
  const palaceGanIndex = (yinIndex + offset) % 10;
  const palaceGan = STEMS[palaceGanIndex];
  
  return palaceGan;
}

/**
 * 判断地支相生关系
 * @param {String} zhi1 - 地支1
 * @param {String} zhi2 - 地支2
 * @returns {Boolean}
 */
function isShengRelation(zhi1, zhi2) {
  const wuxing1 = ZHI_WUXING[zhi1];
  const wuxing2 = ZHI_WUXING[zhi2];
  
  const shengRules = {
    '水': '木',
    '木': '火',
    '火': '土',
    '土': '金',
    '金': '水'
  };
  
  return shengRules[wuxing1] === wuxing2;
}

/**
 * 判断地支相克关系
 * @param {String} zhi1 - 地支1
 * @param {String} zhi2 - 地支2
 * @returns {Boolean}
 */
function isKeRelation(zhi1, zhi2) {
  const wuxing1 = ZHI_WUXING[zhi1];
  const wuxing2 = ZHI_WUXING[zhi2];
  
  const keRules = {
    '水': '火',
    '火': '金',
    '金': '木',
    '木': '土',
    '土': '水'
  };
  
  return keRules[wuxing1] === wuxing2;
}

/**
 * 判断是否同一五行
 * @param {String} zhi1 - 地支1
 * @param {String} zhi2 - 地支2
 * @returns {Boolean}
 */
function isSameWuxing(zhi1, zhi2) {
  return ZHI_WUXING[zhi1] === ZHI_WUXING[zhi2];
}

// ========== 核心计算函数 ==========

/**
 * 计算命宫
 * 算法：从寅宫起正月，顺数到出生月，再从月宫起子时，逆数到出生时
 * @param {String} yearStem - 年干
 * @param {String} monthZhi - 月支
 * @param {String} hourZhi - 时支
 * @returns {Object} 命宫信息
 */
export function calculateMingGong(yearStem, monthZhi, hourZhi) {
  console.log('[Palaces] 计算命宫:', { yearStem, monthZhi, hourZhi });
  
  // 第一步：从寅宫起正月，顺数到出生月
  const yueNum = MONTH_ZHI_TO_NUM[monthZhi] || 1;
  const startIndex = BRANCHES.indexOf('寅');
  const yuePalaceIndex = (startIndex + (yueNum - 1)) % 12;
  const yuePalace = BRANCHES[yuePalaceIndex];
  
  console.log(`  步骤1: 从寅宫起正月，顺数到${monthZhi}月(第${yueNum}月)：到达${yuePalace}宫`);
  
  // 第二步：从月宫起子时，逆数到出生时
  const shiIndex = BRANCHES.indexOf(hourZhi);
  // 逆数：从月宫位置开始，逆时针数到出生时
  const mingGongIndex = (yuePalaceIndex - shiIndex + 12) % 12;
  const mingGongZhi = BRANCHES[mingGongIndex];
  
  console.log(`  步骤2: 从${yuePalace}宫起子时，逆数到${hourZhi}时：到达${mingGongZhi}宫`);
  
  // 第三步：计算命宫天干（用五虎遁月法，根据年干推月干）
  const mingGongGan = calculatePalaceGan(yearStem, mingGongZhi);
  
  console.log(`  步骤3: 年干${yearStem}，${mingGongZhi}宫天干为${mingGongGan}`);
  
  const result = {
    stem: mingGongGan,
    branch: mingGongZhi,
    ganzhi: `${mingGongGan}${mingGongZhi}`,
    palaceName: ZHI_PALACE_NAMES[mingGongZhi] || '',
    interpretation: MING_GONG_INTERPRETATIONS[mingGongZhi] || '需结合整体命局分析',
    calculationSteps: [
      `从寅宫起正月，顺数到${monthZhi}月：到达${yuePalace}宫`,
      `从${yuePalace}宫起子时，逆数到${hourZhi}时：到达${mingGongZhi}宫`,
      `命宫天干：年干${yearStem}，${mingGongZhi}宫天干为${mingGongGan}`
    ]
  };
  
  console.log(`  结果: 命宫 ${result.ganzhi}`);
  
  return result;
}

/**
 * 计算胎元
 * 算法：月干进一位，月支进三位
 * @param {String} monthStem - 月干
 * @param {String} monthZhi - 月支
 * @returns {Object} 胎元信息
 */
export function calculateTaiYuan(monthStem, monthZhi) {
  console.log('[Palaces] 计算胎元:', { monthStem, monthZhi });
  
  // 月干进一位
  const yueGanIndex = STEMS.indexOf(monthStem);
  const taiYuanGanIndex = (yueGanIndex + 1) % 10;
  const taiYuanGan = STEMS[taiYuanGanIndex];
  
  console.log(`  月干${monthStem}进一位：${taiYuanGan}`);
  
  // 月支进三位
  const yueZhiIndex = BRANCHES.indexOf(monthZhi);
  const taiYuanZhiIndex = (yueZhiIndex + 3) % 12;
  const taiYuanZhi = BRANCHES[taiYuanZhiIndex];
  
  console.log(`  月支${monthZhi}进三位：${taiYuanZhi}`);
  
  const result = {
    stem: taiYuanGan,
    branch: taiYuanZhi,
    ganzhi: `${taiYuanGan}${taiYuanZhi}`,
    interpretation: '先天根基，代表遗传禀赋和生命起点',
    calculationSteps: [
      `月干${monthStem}进一位：${taiYuanGan}`,
      `月支${monthZhi}进三位：${taiYuanZhi}`,
      `胎元：${taiYuanGan}${taiYuanZhi}`
    ]
  };
  
  console.log(`  结果: 胎元 ${result.ganzhi}`);
  
  return result;
}

/**
 * 计算身宫
 * 算法：从寅宫起正月，顺数到出生月，再从月宫起子时，顺数到出生时
 * @param {String} yearStem - 年干
 * @param {String} monthZhi - 月支
 * @param {String} hourZhi - 时支
 * @returns {Object} 身宫信息
 */
export function calculateShenGong(yearStem, monthZhi, hourZhi) {
  console.log('[Palaces] 计算身宫:', { yearStem, monthZhi, hourZhi });
  
  // 第一步：从寅宫起正月，顺数到出生月
  const yueNum = MONTH_ZHI_TO_NUM[monthZhi] || 1;
  const startIndex = BRANCHES.indexOf('寅');
  const yuePalaceIndex = (startIndex + (yueNum - 1)) % 12;
  const yuePalace = BRANCHES[yuePalaceIndex];
  
  console.log(`  步骤1: 从寅宫起正月，顺数到${monthZhi}月(第${yueNum}月)：到达${yuePalace}宫`);
  
  // 第二步：从月宫起子时，顺数到出生时
  const shiIndex = BRANCHES.indexOf(hourZhi);
  // 顺数：从月宫位置开始，顺时针数到出生时
  const shenGongIndex = (yuePalaceIndex + shiIndex) % 12;
  const shenGongZhi = BRANCHES[shenGongIndex];
  
  console.log(`  步骤2: 从${yuePalace}宫起子时，顺数到${hourZhi}时：到达${shenGongZhi}宫`);
  
  // 第三步：计算身宫天干
  const shenGongGan = calculatePalaceGan(yearStem, shenGongZhi);
  
  console.log(`  步骤3: 年干${yearStem}，${shenGongZhi}宫天干为${shenGongGan}`);
  
  const result = {
    stem: shenGongGan,
    branch: shenGongZhi,
    ganzhi: `${shenGongGan}${shenGongZhi}`,
    palaceName: ZHI_PALACE_NAMES[shenGongZhi] || '',
    interpretation: SHEN_GONG_INTERPRETATIONS[shenGongZhi] || '需结合整体命局分析',
    calculationSteps: [
      `从寅宫起正月，顺数到${monthZhi}月：到达${yuePalace}宫`,
      `从${yuePalace}宫起子时，顺数到${hourZhi}时：到达${shenGongZhi}宫`,
      `身宫天干：年干${yearStem}，${shenGongZhi}宫天干为${shenGongGan}`
    ]
  };
  
  console.log(`  结果: 身宫 ${result.ganzhi}`);
  
  return result;
}

/**
 * 分析命宫身宫关系
 * @param {Object} mingGong - 命宫信息
 * @param {string} mingGong.stem - 命宫天干
 * @param {string} mingGong.branch - 命宫地支
 * @param {Object} shenGong - 身宫信息
 * @param {string} shenGong.stem - 身宫天干
 * @param {string} shenGong.branch - 身宫地支
 * @returns {String} 关系描述
 */
export function analyzeMingShenRelation(mingGong, shenGong) {
  const mingZhi = mingGong.branch;
  const shenZhi = shenGong.branch;
  
  // 命身同宫
  if (mingZhi === shenZhi) {
    return '命身同宫，先天后天一致，人生目标明确';
  }
  
  // 命身相生
  if (isShengRelation(mingZhi, shenZhi)) {
    return '命宫生身宫，先天助后天，发展顺利';
  }
  
  // 命身相克
  if (isKeRelation(mingZhi, shenZhi)) {
    return '命宫克身宫，先天制约后天，需努力突破';
  }
  
  // 命身比和
  if (isSameWuxing(mingZhi, shenZhi)) {
    return '命身比和，先天后天协调，稳步发展';
  }
  
  return '命身各有侧重，需平衡发展';
}

/**
 * 综合计算命宫、胎元、身宫
 * @param {Object} pillars - 四柱数据
 * @param {Object} [pillars.year] - 年柱 {stem: string, branch: string}
 * @param {Object} [pillars.month] - 月柱 {stem: string, branch: string}
 * @param {Object} [pillars.hour] - 时柱 {stem: string, branch: string}
 * @returns {Object} 综合分析结果
 * @returns {Object} result.mingGong - 命宫信息
 * @returns {Object} result.taiYuan - 胎元信息
 * @returns {Object} result.shenGong - 身宫信息
 */
export function calculateAllPalaces(pillars) {
  console.log('[Palaces] 开始综合计算命宫、胎元、身宫');
  
  const { year, month, hour } = pillars;
  
  if (!year || !month || !hour) {
    throw new Error('缺少必要的四柱数据');
  }
  
  // 计算命宫
  const mingGong = calculateMingGong(year.stem, month.branch, hour.branch);
  
  // 计算胎元
  const taiYuan = calculateTaiYuan(month.stem, month.branch);
  
  // 计算身宫
  const shenGong = calculateShenGong(year.stem, month.branch, hour.branch);
  
  // 分析命身关系
  const mingShenRelation = analyzeMingShenRelation(mingGong, shenGong);
  
  const result = {
    mingGong,
    taiYuan,
    shenGong,
    mingShenRelation,
    interpretations: [
      `命宫${mingGong.ganzhi}：${mingGong.interpretation}`,
      `胎元${taiYuan.ganzhi}：${taiYuan.interpretation}`,
      `身宫${shenGong.ganzhi}：${shenGong.interpretation}`,
      `命身关系：${mingShenRelation}`
    ]
  };
  
  console.log('[Palaces] 计算完成');
  
  return result;
}

/**
 * 生成详细报告
 * @param {Object} palacesResult - calculateAllPalaces 的结果
 * @param {Object} palacesResult.mingGong - 命宫信息
 * @param {Object} palacesResult.taiYuan - 胎元信息
 * @param {Object} palacesResult.shenGong - 身宫信息
 * @param {Object} pillars - 四柱数据
 * @param {Object} [pillars.year] - 年柱 {stem: string, branch: string}
 * @param {Object} [pillars.month] - 月柱 {stem: string, branch: string}
 * @param {Object} [pillars.day] - 日柱 {stem: string, branch: string}
 * @param {Object} [pillars.hour] - 时柱 {stem: string, branch: string}
 * @returns {String} 详细报告文本
 */
export function generatePalacesReport(palacesResult, pillars) {
  const lines = [];
  
  lines.push('=== 命宫、胎元、身宫分析报告 ===');
  lines.push(`输入数据：年${pillars.year.stem}${pillars.year.branch} 月${pillars.month.stem}${pillars.month.branch} 时${pillars.hour.branch}`);
  lines.push('');
  
  // 命宫部分
  const mg = palacesResult.mingGong;
  lines.push('★ 命宫推算:');
  lines.push(`  结果：${mg.ganzhi} (${mg.palaceName})`);
  lines.push('  推算步骤:');
  mg.calculationSteps.forEach(step => {
    lines.push(`    • ${step}`);
  });
  lines.push(`  解读：${mg.interpretation}`);
  lines.push('');
  
  // 胎元部分
  const ty = palacesResult.taiYuan;
  lines.push('★ 胎元推算:');
  lines.push(`  结果：${ty.ganzhi}`);
  lines.push('  推算步骤:');
  ty.calculationSteps.forEach(step => {
    lines.push(`    • ${step}`);
  });
  lines.push(`  解读：${ty.interpretation}`);
  lines.push('');
  
  // 身宫部分
  const sg = palacesResult.shenGong;
  lines.push('★ 身宫推算:');
  lines.push(`  结果：${sg.ganzhi} (${sg.palaceName})`);
  lines.push('  推算步骤:');
  sg.calculationSteps.forEach(step => {
    lines.push(`    • ${step}`);
  });
  lines.push(`  解读：${sg.interpretation}`);
  lines.push('');
  
  // 综合解读
  lines.push('★ 综合解读:');
  palacesResult.interpretations.forEach(interpretation => {
    lines.push(`  • ${interpretation}`);
  });
  
  return lines.join('\n');
}

