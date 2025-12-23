"use strict";
/**
 * 婆媳关系聊天上下文构建器
 *
 * 从命盘结果中提取并构建 InLawChatContext
 * 尽可能复用系统已有的计算和数据
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildInLawChatContext = buildInLawChatContext;
/**
 * 标准化性别
 */
function normalizeGender(gender) {
    if (gender === 'male' || gender === 'female') {
        return gender;
    }
    return 'unknown';
}
/**
 * 提取基础信息
 */
function extractBasicInfo(chartResult) {
    const analysis = chartResult.analysis || {};
    const dayMaster = analysis.dayMaster || {};
    const strength = analysis.strengthAnalysis || analysis.minggeSummary?.dayMaster || {};
    const structure = analysis.structure || analysis.minggeSummary?.mainPattern || {};
    const yongshenPattern = analysis.yongshenPattern || {};
    const wuxing = analysis.wuxingPercent || {};
    const W = structure.W || structure.tenGodWeights || {};
    return {
        dayMaster: dayMaster.gan && dayMaster.wuxing
            ? `${dayMaster.gan}${dayMaster.wuxing}`
            : '未知',
        dayMasterStrength: {
            score: strength.score ?? Math.round((strength.score ?? 0) * 100),
            level: strength.level || strength.label || '未知',
            description: strength.description || strength.comment || '',
        },
        structure: {
            name: structure.name || structure.label || '未知格局',
            confidence: structure.confidence || structure.score,
            weights: {
                guan: (W.guan || 0) + (W.zGuan || 0) + (W.sha || 0),
                cai: W.cai || W.caiXing || 0,
                shishang: (W.shi || 0) + (W.shang || 0),
                bijie: (W.bi || 0) + (W.jie || 0),
                yin: (W.yin || 0) + (W.zYin || 0) + (W.pYin || 0),
            },
        },
        yongshen: {
            like: yongshenPattern.mainYongshen?.elements || yongshenPattern.favoredElements || [],
            dislike: yongshenPattern.tabooElements || yongshenPattern.avoidElements || [],
            summary: yongshenPattern.summary || yongshenPattern.interpretation || '',
        },
        wuxing: {
            木: wuxing.木 || wuxing.wood || 0,
            火: wuxing.火 || wuxing.fire || 0,
            土: wuxing.土 || wuxing.earth || 0,
            金: wuxing.金 || wuxing.metal || 0,
            水: wuxing.水 || wuxing.water || 0,
        },
    };
}
/**
 * 构建配偶星与表达方式信息
 * 复用恋爱专线的逻辑
 */
async function buildSpouseAndExpression(chartResult, gender) {
    const analysis = chartResult.analysis || {};
    const pillars = chartResult.pillars || {};
    const dayMaster = analysis.dayMaster || {};
    const dayMasterGan = dayMaster.gan || '';
    // 判断配偶星类型
    const isMale = gender === 'male';
    const spouseStarType = isMale ? '财星' : '官杀';
    // 构建配偶星分布
    const utilsModule = await Promise.resolve().then(() => __importStar(require('../../../engine/analysis/utils.js')));
    const { getShishenPositions } = utilsModule;
    const spouseStarPositions = getShishenPositions(pillars, dayMasterGan, spouseStarType === '财星' ? ['cai', 'pCai'] : ['guan', 'sha']);
    const spouseStarDistribution = spouseStarPositions.length > 0
        ? `配偶星主要分布在${spouseStarPositions.join('、')}`
        : '配偶星分布较为分散';
    // 构建配偶星状态
    const spouseStarStatus = {
        strength: '中等',
        mixed: false,
        conflict: false,
        description: '配偶星状态需要结合具体命盘分析',
    };
    // 构建表达方式提示
    const expressionHints = [];
    const structure = analysis.structure || {};
    const W = structure.W || structure.tenGodWeights || {};
    if ((W.shi || 0) + (W.shang || 0) > 0.3) {
        expressionHints.push('表达方式较为直接，容易说出真实想法');
    }
    else if ((W.yin || 0) > 0.3) {
        expressionHints.push('表达方式较为内敛，倾向于忍耐');
    }
    else {
        expressionHints.push('表达方式较为平衡');
    }
    return {
        spouseStarType,
        spouseStarDistribution,
        spouseStarStatus,
        expressionHints,
    };
}
/**
 * 构建宫位关系
 * 复用恋爱专线的逻辑
 */
async function buildPalaceContext(chartResult) {
    const pillars = chartResult.pillars || {};
    const dayBranch = pillars.day?.branch || '';
    // 动态导入 analyzeBranchRelationships
    const branchRelationsModule = await Promise.resolve().then(() => __importStar(require('../../../engine/mingli/branchRelationships.js')));
    const { analyzeBranchRelationships } = branchRelationsModule;
    // 调用系统函数分析地支关系
    const relationships = analyzeBranchRelationships(pillars);
    // 提取与日支相关的关系
    const dayRelations = {
        he: (relationships.liuhe || []).filter((r) => (r.branch1 === dayBranch || r.branch2 === dayBranch)).map((r) => `${r.branch1}${r.branch2}六合`),
        sanhe: (relationships.sanhe || []).filter((r) => (r.branches || []).includes(dayBranch)).map((r) => r.description || '三合'),
        chong: (relationships.liuchong || []).filter((r) => (r.branch1 === dayBranch || r.branch2 === dayBranch)).map((r) => `${r.branch1}${r.branch2}六冲`),
        xing: (relationships.sanxing || []).filter((r) => (r.branches || []).includes(dayBranch)).map((r) => r.description || '三刑'),
        hai: (relationships.liuhai || []).filter((r) => (r.branch1 === dayBranch || r.branch2 === dayBranch)).map((r) => `${r.branch1}${r.branch2}六害`),
    };
    // 生成环境提示
    const loveEnvironmentNotes = '家庭环境需要结合具体命盘分析';
    return {
        spouseBranch: dayBranch || '未知',
        relations: dayRelations,
        loveEnvironmentNotes,
    };
}
/**
 * 提取清浊调候信息
 */
function extractPatternInfo(chartResult) {
    const analysis = chartResult.analysis || {};
    const purity = analysis.purity || analysis.patternPurity || {};
    const tiaohou = analysis.tiaohou || {};
    const tiyong = analysis.tiyong || {};
    const breaking = analysis.breaking || analysis.patternBreaking || {};
    // 从破格因素中提取风险提示
    const riskHints = [];
    const factors = breaking?.factors || [];
    for (const factor of factors) {
        const type = factor.type || '';
        const description = factor.description || '';
        // 提取与家庭相关的风险
        if (type.includes('比劫夺财') || (description.includes('比劫') && description.includes('财'))) {
            riskHints.push('家庭关系中容易遇到竞争，需要主动争取');
        }
        if (type.includes('食伤制官') || (description.includes('食伤') && description.includes('官'))) {
            riskHints.push('家庭关系中容易因为表达方式不当而产生矛盾');
        }
        if (type.includes('官杀混杂')) {
            riskHints.push('家庭关系中容易遇到复杂的情况，需要明确自己的选择');
        }
    }
    // 如果 riskHints 为空，添加默认提示
    if (riskHints.length === 0) {
        riskHints.push('需要关注家庭关系的平衡与沟通');
    }
    return {
        purityLevel: purity.level || purity.label || '未知',
        tiaoHouSummary: tiaohou.summary || tiaohou.label || '',
        tiYongSummary: tiyong.interpretation || tiyong.summary || '',
        riskHints: riskHints.slice(0, 3), // 最多返回 3 条
    };
}
/**
 * 映射喜忌等级到数字
 */
function mapFavourLevel(favourLevel) {
    if (typeof favourLevel === 'number') {
        return Math.max(-2, Math.min(2, favourLevel));
    }
    if (typeof favourLevel === 'string') {
        const map = {
            'good': 2,
            'favorable': 2,
            'neutral': 0,
            'bad': -2,
            'unfavorable': -2,
        };
        return map[favourLevel.toLowerCase()] || 0;
    }
    return 0;
}
/**
 * 计算流年与配偶宫的关系
 */
async function calcYearBranchRelations(yearBranch, spouseBranch) {
    if (!yearBranch || !spouseBranch)
        return [];
    const branchRelationsModule = await Promise.resolve().then(() => __importStar(require('../../../engine/mingli/branchRelationships.js')));
    const { checkLiuHe, checkLiuChong, checkSanXing, checkLiuHai, checkXiangPo } = branchRelationsModule;
    const relations = [];
    // 六合
    const he = checkLiuHe(yearBranch, spouseBranch);
    if (he)
        relations.push(`${yearBranch}${spouseBranch}六合`);
    // 六冲
    const chong = checkLiuChong(yearBranch, spouseBranch);
    if (chong)
        relations.push(`${yearBranch}${spouseBranch}六冲`);
    // 三刑
    const xing = checkSanXing(yearBranch, spouseBranch);
    if (xing)
        relations.push(`${yearBranch}${spouseBranch}三刑`);
    // 六害
    const hai = checkLiuHai(yearBranch, spouseBranch);
    if (hai)
        relations.push(`${yearBranch}${spouseBranch}六害`);
    // 相破
    const po = checkXiangPo(yearBranch, spouseBranch);
    if (po)
        relations.push(`${yearBranch}${spouseBranch}相破`);
    return relations;
}
/**
 * 构建大运流年信息
 */
async function buildFortuneContext(chartResult, spouseBranch, now) {
    const analysis = chartResult.analysis || {};
    const luckRhythm = analysis.luckRhythm || {};
    const annualBrief = luckRhythm.annualBrief || [];
    const derived = chartResult.derived || {};
    const luckCycle = derived.luck_cycle || [];
    const currentYear = now.getFullYear();
    // 获取当前大运
    const currentLuckItem = luckCycle.find((luck) => luck.isCurrent) ||
        luckCycle.find((luck) => {
            const ageRange = luck.ageRange || '';
            const [start, end] = ageRange.split('-').map(Number);
            const currentAge = currentYear - (derived.start_age || 0);
            return currentAge >= start && currentAge <= end;
        }) ||
        luckCycle[0] || {};
    // 提取当前大运信息
    const currentLuck = {
        ganzhi: currentLuckItem.ganzhi ||
            `${currentLuckItem.stem || ''}${currentLuckItem.branch || ''}` ||
            luckRhythm.currentLuck?.label || '未知',
        ageRange: currentLuckItem.ageRange || luckRhythm.currentLuck?.ageRange || '',
        favourLevel: mapFavourLevel(luckRhythm.currentLuck?.favourLevel || currentLuckItem.favourLevel),
        rhythmDescription: luckRhythm.currentLuck?.tone ||
            luckRhythm.currentLuck?.rhythmDescription || '',
    };
    // 从 annualBrief 提取最近 3 年
    const years = [];
    const filteredYears = annualBrief
        .filter((y) => Math.abs(y.year - currentYear) <= 1)
        .sort((a, b) => a.year - b.year)
        .slice(0, 3);
    for (const item of filteredYears) {
        // 计算流年地支（从干支中提取）
        const yearBranch = item.ganzhi?.slice(1) || item.branch || '';
        // 计算流年与配偶宫的关系
        const branchRelations = await calcYearBranchRelations(yearBranch, spouseBranch);
        years.push({
            year: item.year,
            ganzhi: item.ganzhi || `${item.stem || ''}${item.branch || ''}`,
            tenGodToDay: item.shishen || '未知',
            favLevel: mapFavourLevel(item.favourLevel),
            branchRelationsToSpousePalace: branchRelations,
        });
    }
    return {
        currentLuck,
        years,
    };
}
/**
 * 提取辅助分析信息
 */
function extractExtraInfo(chartResult) {
    const analysis = chartResult.analysis || {};
    return {
        energyFlowSummary: analysis.energyFlow?.summary || analysis.dogong?.summary || '',
        guancaiSummary: analysis.guancaiPattern?.summary || '',
        minggeSummary: analysis.minggeSummary?.summary || '',
    };
}
/**
 * 构建婆媳关系聊天上下文
 */
async function buildInLawChatContext(params) {
    const { chartResult, gender, now = new Date() } = params;
    // 提取基础信息
    const basic = extractBasicInfo(chartResult);
    // 构建配偶星与表达方式
    const spouseAndExpression = await buildSpouseAndExpression(chartResult, gender);
    // 构建宫位关系
    const palace = await buildPalaceContext(chartResult);
    // 提取清浊调候信息
    const patternAndBearing = extractPatternInfo(chartResult);
    // 构建大运流年信息
    const fortune = await buildFortuneContext(chartResult, palace.spouseBranch, now);
    // 提取辅助分析信息
    const extra = extractExtraInfo(chartResult);
    return {
        meta: {
            selfGender: gender,
            currentYear: now.getFullYear(),
        },
        basic,
        spouseAndExpression,
        palace,
        patternAndBearing,
        fortune,
        extra,
    };
}
//# sourceMappingURL=inlawContextBuilder.js.map