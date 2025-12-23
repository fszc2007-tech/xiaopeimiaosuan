"use strict";
/**
 * 婚姻模式计算器
 *
 * 基于命盘结构、配偶星状态、十神组合等综合判断婚姻模式
 * 复用系统已有的计算能力，新增针对婚姻场景的分析逻辑
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateMarriageTendency = calculateMarriageTendency;
exports.calculateStabilityLevel = calculateStabilityLevel;
exports.calculateConflictStyle = calculateConflictStyle;
exports.calculateRealityPressureFocus = calculateRealityPressureFocus;
exports.calculateMarriageRiskHints = calculateMarriageRiskHints;
exports.calculateHealingHints = calculateHealingHints;
exports.calculateMarriagePattern = calculateMarriagePattern;
/**
 * 检查神煞
 */
function checkShenSha(pillars, shenshaName) {
    if (!pillars)
        return false;
    const allPillars = ['year', 'month', 'day', 'hour'];
    for (const pillarName of allPillars) {
        const pillar = pillars[pillarName];
        if (!pillar)
            continue;
        const shenshaList = pillar.shensha || [];
        if (shenshaList.some((s) => s.includes(shenshaName))) {
            return true;
        }
    }
    return false;
}
/**
 * 归一化日主强弱分数（统一为 0-1）
 */
function normalizeDayMasterScore(dayMasterStrength) {
    const score = dayMasterStrength?.score ?? 0;
    // 如果已经是 0-1，直接返回；如果是 0-100，转换为 0-1
    return score > 1 ? score / 100 : score;
}
/**
 * 归一化十神权重（确保在 0-1 范围内）
 */
function normalizeWeight(weight) {
    // 如果权重总和可能超过 1，这里做归一化处理
    // 实际使用时，W 应该已经是归一化的，这里做保护
    return Math.max(0, Math.min(1, weight));
}
/**
 * 计算早婚/晚婚/不婚倾向
 */
function calculateMarriageTendency(params) {
    const { spouseStarStatus, spousePalace, W, pillars, dayMasterStrength } = params;
    // 1. 检查神煞
    const hasHongLuan = checkShenSha(pillars, '红鸾');
    const hasTianXi = checkShenSha(pillars, '天喜');
    const hasGuChen = checkShenSha(pillars, '孤辰');
    const hasGuaSu = checkShenSha(pillars, '寡宿');
    // 2. 配偶星强弱（使用数值判断）
    const spouseStarWeak = spouseStarStatus.strength === '偏弱';
    const spouseStarStrong = spouseStarStatus.strength === '偏旺';
    // 3. 配偶宫是否被冲
    const spousePalaceChong = (spousePalace.relations?.chong || []).length > 0;
    // 4. 比劫权重（归一化）
    const biJieWeight = normalizeWeight((W.bi || 0) + (W.jie || 0));
    // 5. 食伤权重（归一化）
    const shiShangWeight = normalizeWeight((W.shi || 0) + (W.shang || 0));
    // 6. 日主强弱（使用数值分数）
    const dayMasterScore = normalizeDayMasterScore(dayMasterStrength);
    const dayMasterWeak = dayMasterScore < 0.45; // 0.45 以下为身弱
    // 综合判断（使用评分制）
    let score = 0;
    // 早婚倾向加分
    if (hasHongLuan || hasTianXi)
        score += 2;
    if (spouseStarStrong && !spouseStarStatus.conflict)
        score += 2;
    if (!spousePalaceChong)
        score += 1;
    if (biJieWeight < 0.2)
        score += 1;
    // 晚婚倾向加分
    if (hasGuChen || hasGuaSu)
        score -= 2;
    if (spouseStarWeak || spouseStarStatus.conflict)
        score -= 2;
    if (spousePalaceChong)
        score -= 1;
    if (biJieWeight > 0.4)
        score -= 1;
    if (shiShangWeight > 0.4)
        score -= 1;
    if (dayMasterWeak)
        score -= 1;
    // 不婚倾向（极端情况，文案柔和化）
    if (spouseStarWeak && spousePalaceChong && (biJieWeight > 0.5 || shiShangWeight > 0.5)) {
        return '进入婚姻往往不太顺利，可能需要比较长时间才能稳定下来，或更适合保持相对独立的关系模式';
    }
    // 返回结果
    if (score >= 3) {
        return '有早婚倾向，容易在较早年龄进入婚姻';
    }
    else if (score <= -3) {
        return '有晚婚倾向，适合在较晚年龄进入婚姻';
    }
    else {
        return '不早不晚，看缘分和机会结构，适合在适婚年龄进入婚姻';
    }
}
/**
 * 计算婚姻稳定度
 */
function calculateStabilityLevel(params) {
    const { spouseStarStatus, spousePalace, breaking, purityLevel } = params;
    let score = 5; // 基础分 5 分（中等）
    // 配偶星混杂扣分
    if (spouseStarStatus.mixed)
        score -= 2;
    // 配偶星强而不受克加分（新增）
    if (spouseStarStatus.strength === '偏旺' && !spouseStarStatus.conflict) {
        score += 1;
    }
    // 配偶宫被冲扣分
    if ((spousePalace.relations?.chong || []).length > 0)
        score -= 2;
    // 配偶宫被刑害扣分
    if ((spousePalace.relations?.xing || []).length > 0)
        score -= 1;
    if ((spousePalace.relations?.hai || []).length > 0)
        score -= 1;
    // 破格因素扣分
    const factors = breaking?.factors || [];
    if (factors.some((f) => f.type?.includes('比劫夺财')))
        score -= 2;
    if (factors.some((f) => f.type?.includes('食伤制官')))
        score -= 2;
    if (factors.some((f) => f.type?.includes('官杀混杂')))
        score -= 1;
    // 清浊度影响
    if (purityLevel && (purityLevel.includes('浊') || purityLevel.includes('混杂'))) {
        score -= 1;
    }
    if (purityLevel && (purityLevel.includes('清') || purityLevel.includes('纯'))) {
        score += 1;
    }
    // 配偶宫有合加分（稳定）
    if ((spousePalace.relations?.he || []).length > 0)
        score += 1;
    if ((spousePalace.relations?.sanhe || []).length > 0)
        score += 1;
    // Clamp 到 0-9 范围
    score = Math.max(0, Math.min(9, score));
    // 判断等级
    if (score >= 7) {
        return '偏稳';
    }
    else if (score >= 4) {
        return '有波动';
    }
    else {
        return '波动较大';
    }
}
/**
 * 计算矛盾处理风格
 */
function calculateConflictStyle(params) {
    const { W, dayMasterStrength, shiShangStatus } = params;
    const shiShangWeight = normalizeWeight((W.shi || 0) + (W.shang || 0));
    const biJieWeight = normalizeWeight((W.bi || 0) + (W.jie || 0));
    const yinWeight = normalizeWeight((W.yin || 0) + (W.zYin || 0) + (W.pYin || 0));
    const guanWeight = normalizeWeight((W.guan || 0) + (W.zGuan || 0) + (W.sha || 0));
    const dayMasterScore = normalizeDayMasterScore(dayMasterStrength);
    const dayMasterStrong = dayMasterScore >= 0.62; // 0.62 以上为身强
    // 判断主要风格（按权重排序，取 top 2-3）
    const styles = [];
    // 强硬对抗型（比劫旺 + 身强）
    if (biJieWeight > 0.4 && dayMasterStrong) {
        styles.push({ type: '强硬对抗', weight: biJieWeight });
    }
    // 直接表达型（食伤旺）
    if (shiShangWeight > 0.4 && shiShangStatus?.strength === '偏旺') {
        styles.push({ type: '直接表达，容易说出口', weight: shiShangWeight });
    }
    // 冷战型（食伤弱 + 比劫弱）
    if (shiShangWeight < 0.3 && biJieWeight < 0.3) {
        styles.push({ type: '容易冷战，不太会主动沟通', weight: 1 - shiShangWeight - biJieWeight });
    }
    // 逃避型（印旺 + 身弱）
    if (yinWeight > 0.4 && !dayMasterStrong) {
        styles.push({ type: '容易逃避，不太愿意正面冲突', weight: yinWeight });
    }
    // 委屈内耗型（身弱 + 食伤弱）
    if (!dayMasterStrong && shiShangWeight < 0.3) {
        styles.push({ type: '容易委屈内耗，不太会表达需求', weight: 1 - dayMasterScore - shiShangWeight });
    }
    // 规则型（官杀旺）
    if (guanWeight > 0.4) {
        styles.push({ type: '比较注重规则和原则，容易较真', weight: guanWeight });
    }
    // 按权重排序，取 top 2-3
    styles.sort((a, b) => b.weight - a.weight);
    const topStyles = styles.slice(0, 3);
    if (topStyles.length === 0) {
        return '遇到矛盾时，会根据具体情况选择处理方式，相对灵活';
    }
    // 返回最多 2-3 个核心标签
    return topStyles.map(s => s.type).join('、') + '，需要多注意沟通方式';
}
/**
 * 计算现实压力落点
 */
function calculateRealityPressureFocus(params) {
    const { W, structure } = params;
    // 使用与系统一致的字段名
    const caiWeight = normalizeWeight(W.cai || W.caiXing || 0);
    const guanWeight = normalizeWeight((W.guan || 0) + (W.zGuan || 0) + (W.sha || 0));
    const yinWeight = normalizeWeight((W.yin || 0) + (W.zYin || 0) + (W.pYin || 0));
    const biJieWeight = normalizeWeight((W.bi || 0) + (W.jie || 0));
    const shiShangWeight = normalizeWeight((W.shi || 0) + (W.shang || 0));
    const pressures = [];
    if (caiWeight > 0.3) {
        pressures.push({ type: '金钱和物质基础', weight: caiWeight });
    }
    if (guanWeight > 0.3) {
        pressures.push({ type: '事业发展和工作压力', weight: guanWeight });
    }
    if (yinWeight > 0.3) {
        pressures.push({ type: '长辈和家庭责任', weight: yinWeight });
    }
    if (biJieWeight > 0.3) {
        pressures.push({ type: '竞争和人际关系', weight: biJieWeight });
    }
    if (shiShangWeight > 0.3) {
        pressures.push({ type: '子女教育和培养', weight: shiShangWeight });
    }
    // 按权重排序，取前 2-3 个
    pressures.sort((a, b) => b.weight - a.weight);
    const topPressures = pressures.slice(0, 3);
    if (topPressures.length === 0) {
        return '现实压力相对分散，没有特别突出的落点';
    }
    return topPressures.map(p => p.type).join('、') + '方面的压力会比较明显';
}
/**
 * 计算风险提示
 */
function calculateMarriageRiskHints(params) {
    const { breaking, spouseStarStatus, spousePalace, conflictStyle } = params;
    const hints = [];
    const factors = breaking?.factors || [];
    // 从破格因素提取（复用恋爱桃花的逻辑）
    if (factors.some((f) => f.type?.includes('比劫夺财'))) {
        hints.push('容易遇到感情竞争，需要主动争取和维护关系');
    }
    if (factors.some((f) => f.type?.includes('食伤制官'))) {
        hints.push('容易因为表达方式不当而产生矛盾，需要注意沟通方式');
    }
    if (factors.some((f) => f.type?.includes('官杀混杂'))) {
        hints.push('容易遇到复杂的情况，需要明确自己的选择');
    }
    // 配偶星相关风险
    if (spouseStarStatus.mixed) {
        hints.push('配偶星混杂，容易在感情选择上犹豫不决');
    }
    if (spouseStarStatus.conflict) {
        hints.push('配偶星被克冲，婚姻关系容易受到外界因素影响');
    }
    // 配偶宫相关风险
    if ((spousePalace.relations?.chong || []).length > 0) {
        hints.push('配偶宫被冲，婚姻关系容易有波动，需要特别注意稳定');
    }
    if ((spousePalace.relations?.xing || []).length > 0) {
        hints.push('配偶宫被刑，容易在婚姻中遇到摩擦和矛盾');
    }
    // 矛盾处理风格相关风险
    if (conflictStyle.includes('强硬对抗')) {
        hints.push('遇到矛盾时容易强硬对抗，需要学会妥协和沟通');
    }
    if (conflictStyle.includes('冷战')) {
        hints.push('遇到矛盾时容易冷战，需要主动沟通和表达');
    }
    if (conflictStyle.includes('逃避')) {
        hints.push('遇到矛盾时容易逃避，需要正面面对和解决');
    }
    return hints.slice(0, 5); // 最多返回 5 条
}
/**
 * 计算改善方向
 */
function calculateHealingHints(params) {
    const { riskHints, conflictStyle, yongshen, realityPressureFocus } = params;
    const hints = [];
    // 基于矛盾处理风格给出建议
    if (conflictStyle.includes('强硬对抗')) {
        hints.push('学会在矛盾中寻找共同点，避免过度坚持己见');
    }
    if (conflictStyle.includes('冷战')) {
        hints.push('主动表达自己的感受和需求，避免沉默和压抑');
    }
    if (conflictStyle.includes('逃避')) {
        hints.push('正面面对问题，与伴侣一起寻找解决方案');
    }
    if (conflictStyle.includes('委屈内耗')) {
        hints.push('学会表达自己的边界和需求，不要过度牺牲自己');
    }
    // 基于现实压力落点给出建议
    if (realityPressureFocus.includes('金钱')) {
        hints.push('在金钱问题上与伴侣坦诚沟通，共同规划财务');
    }
    if (realityPressureFocus.includes('事业')) {
        hints.push('平衡事业和家庭，避免因为工作忽略伴侣');
    }
    if (realityPressureFocus.includes('长辈')) {
        hints.push('在长辈问题上与伴侣达成共识，避免因为家庭矛盾影响关系');
    }
    // 基于喜用神给出建议
    const likeElements = yongshen?.like || [];
    if (likeElements.length > 0) {
        hints.push(`多接触和培养${likeElements.join('、')}相关的能量，有助于改善关系`);
    }
    // 通用建议
    if (hints.length < 3) {
        hints.push('定期与伴侣沟通，了解彼此的需求和感受');
        hints.push('在关系中保持一定的独立空间，避免过度依赖');
    }
    return hints.slice(0, 4); // 最多返回 4 条
}
/**
 * 统一计算婚姻模式
 */
function calculateMarriagePattern(params) {
    const { W, spouseStarStatus, spousePalace, breaking, purityLevel, dayMasterStrength, pillars, yongshen, structure, shiShangStatus, } = params;
    // 1. 计算早婚/晚婚倾向
    const marriageTendency = calculateMarriageTendency({
        spouseStarStatus,
        spousePalace,
        W,
        pillars,
        dayMasterStrength,
    });
    // 2. 计算稳定度
    const stabilityLevel = calculateStabilityLevel({
        spouseStarStatus,
        spousePalace,
        breaking,
        purityLevel,
    });
    // 3. 计算矛盾处理风格
    const conflictStyle = calculateConflictStyle({
        W,
        dayMasterStrength,
        shiShangStatus,
    });
    // 4. 计算现实压力落点
    const realityPressureFocus = calculateRealityPressureFocus({
        W,
        structure,
    });
    // 5. 计算风险提示
    const riskHints = calculateMarriageRiskHints({
        breaking,
        spouseStarStatus,
        spousePalace,
        conflictStyle,
    });
    // 6. 计算改善方向
    const healingHints = calculateHealingHints({
        riskHints,
        conflictStyle,
        yongshen,
        realityPressureFocus,
    });
    return {
        marriageTendency,
        stabilityLevel,
        conflictStyle,
        realityPressureFocus,
        riskHints,
        healingHints,
    };
}
//# sourceMappingURL=marriagePatternCalculator.js.map