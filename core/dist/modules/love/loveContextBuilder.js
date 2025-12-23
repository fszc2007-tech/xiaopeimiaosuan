"use strict";
/**
 * 恋爱聊天上下文构建器
 *
 * 从命盘结果中提取并构建 LoveChatContext
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
exports.buildLoveChatContext = buildLoveChatContext;
/**
 * 检查用户问题中是否提到伴侣
 */
function detectPartnerMention(question) {
    const keywords = [
        '男朋友', '女朋友', '老公', '老婆', '对象', '另一半',
        '伴侣', '恋人', '他', '她', '对方', 'ta', '男友', '女友'
    ];
    return keywords.some(keyword => question.includes(keyword));
}
/**
 * 提取恋爱相关神煞
 */
function extractLoveShenSha(shenshaList) {
    const loveShenSha = [
        '桃花', '咸池', '红鸾', '天喜', '流霞', '孤辰', '寡宿',
        '天乙贵人', '月德', '天德'
    ];
    return (shenshaList || []).filter((s) => loveShenSha.some(keyword => s.includes(keyword)));
}
/**
 * 提取单柱恋爱信息
 * 修复：使用 stem/branch 而不是 gan/zhi
 */
function extractPillarLoveInfo(pillar, dayMasterGan) {
    const shenshaList = pillar.shensha || [];
    const shenshaLoveRelated = extractLoveShenSha(shenshaList);
    return {
        ganzhi: `${pillar.stem || ''}${pillar.branch || ''}`,
        tenGodToDay: pillar.shishen || '未知',
        mainTenGod: pillar.shishen || '未知',
        shenshaLoveRelated,
        changsheng: pillar.zizuo || pillar.self_sit || '未知',
    };
}
/**
 * 提取四柱恋爱信息
 */
function extractPillarsLoveInfo(chartResult) {
    const pillars = chartResult.pillars || {};
    const dayMasterGan = chartResult.analysis?.dayMaster?.gan || '';
    return {
        year: extractPillarLoveInfo(pillars.year || {}, dayMasterGan),
        month: extractPillarLoveInfo(pillars.month || {}, dayMasterGan),
        day: extractPillarLoveInfo(pillars.day || {}, dayMasterGan),
        hour: extractPillarLoveInfo(pillars.hour || {}, dayMasterGan),
    };
}
/**
 * 构建配偶宫关系
 * 复用系统已有的 analyzeBranchRelationships 函数
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
    // 生成恋爱环境提示
    const loveEnvironmentNotes = buildLoveEnvironmentNotes(pillars, relationships);
    return {
        spouseBranch: dayBranch || '未知',
        relations: dayRelations,
        loveEnvironmentNotes,
    };
}
/**
 * 生成恋爱环境提示
 */
function buildLoveEnvironmentNotes(pillars, relationships) {
    const notes = [];
    // 检查月支和时支
    const monthBranch = pillars.month?.branch || '';
    const hourBranch = pillars.hour?.branch || '';
    // 如果月支或时支有桃花
    const monthShenSha = pillars.month?.shensha || [];
    const hourShenSha = pillars.hour?.shensha || [];
    if (monthShenSha.some((s) => s.includes('桃花')) ||
        hourShenSha.some((s) => s.includes('桃花'))) {
        notes.push('桃花在月支或时支，容易在社交或工作环境中遇到对象');
    }
    // 检查配偶宫是否有合
    if (relationships.liuhe && relationships.liuhe.length > 0) {
        notes.push('配偶宫有合，恋爱多发生在熟人圈');
    }
    return notes.join('；') || '恋爱环境需要结合具体命盘分析';
}
/**
 * 构建配偶星分布文字描述
 * 使用系统已有的 getShishenPositions 函数
 */
async function buildSpouseStarDistribution(pillars, dayMasterGan, spouseStarType) {
    const utilsModule = await Promise.resolve().then(() => __importStar(require('../../../engine/analysis/utils.js')));
    const { getShishenPositions } = utilsModule;
    // 根据配偶星类型确定目标十神
    const targetGods = spouseStarType === '财星'
        ? ['正财', '偏财']
        : ['正官', '七杀'];
    // 获取所有配偶星位置
    const allPositions = [];
    for (const god of targetGods) {
        const positions = getShishenPositions(pillars, god, dayMasterGan);
        allPositions.push(...positions);
    }
    if (allPositions.length === 0) {
        return `${spouseStarType}不明显`;
    }
    // 按位置分组
    const positionMap = {
        '年柱': [],
        '月柱': [],
        '日柱': [],
        '时柱': [],
    };
    const positionNames = {
        'year': '年柱',
        'month': '月柱',
        'day': '日柱',
        'hour': '时柱',
    };
    for (const pos of allPositions) {
        const pillarName = positionNames[pos.position] || pos.position;
        if (positionMap[pillarName]) {
            positionMap[pillarName].push(pos.type === 'stem' ? '天干' : '地支');
        }
    }
    // 生成描述
    const parts = [];
    for (const [pillar, types] of Object.entries(positionMap)) {
        if (types.length > 0) {
            parts.push(`${pillar}${types.join('和')}`);
        }
    }
    return parts.length > 0
        ? `${spouseStarType}主要分布在${parts.join('、')}`
        : `${spouseStarType}分布不明显`;
}
/**
 * 分析配偶星状态
 * 基于十神权重和破格因素
 */
function analyzeSpouseStarStatus(W, spouseStarType, structure) {
    // 1. 判断强弱
    const spouseStarWeight = spouseStarType === '财星'
        ? (W.cai || W.caiXing || 0)
        : ((W.guan || W.guanSha || 0) + (W.sha || W.qiSha || 0));
    const level = spouseStarWeight < 0.3 ? '偏弱'
        : spouseStarWeight > 0.7 ? '偏旺'
            : '中等';
    // 2. 判断是否混杂
    let mixed = false;
    if (spouseStarType === '财星') {
        const hasZhengCai = (W.zCai || W.zhengCai || 0) > 0;
        const hasPianCai = (W.pCai || W.pianCai || 0) > 0;
        mixed = hasZhengCai && hasPianCai;
    }
    else {
        const hasZhengGuan = (W.zGuan || W.zhengGuan || 0) > 0;
        const hasQiSha = (W.sha || W.qiSha || 0) > 0;
        mixed = hasZhengGuan && hasQiSha;
    }
    // 3. 判断是否被克冲
    let conflict = false;
    const pogeFactors = structure?.pogeFactors || structure?.breaking?.factors || [];
    if (spouseStarType === '财星') {
        // 财星被克：比劫夺财
        conflict = pogeFactors.some((factor) => factor.type?.includes('比劫夺财') ||
            (factor.type?.includes('比劫') && factor.description?.includes('财')));
        // 如果破格因素中没有，使用权重判断
        if (!conflict) {
            const biJieWeight = (W.bi || 0) + (W.jie || 0);
            conflict = biJieWeight > 0.5 && spouseStarWeight < 0.5;
        }
    }
    else {
        // 官杀被克：食伤制官
        conflict = pogeFactors.some((factor) => factor.type?.includes('食伤制官') ||
            factor.type?.includes('伤官见官') ||
            (factor.type?.includes('食伤') && factor.description?.includes('官')));
        // 如果破格因素中没有，使用权重判断
        if (!conflict) {
            const shiShangWeight = (W.shi || 0) + (W.shang || 0);
            conflict = shiShangWeight > 0.5 && spouseStarWeight < 0.5;
        }
    }
    // 4. 生成描述
    const parts = [];
    if (level === '偏弱') {
        parts.push(`${spouseStarType}力量偏弱`);
    }
    else if (level === '偏旺') {
        parts.push(`${spouseStarType}力量偏旺`);
    }
    else {
        parts.push(`${spouseStarType}力量中等`);
    }
    if (mixed) {
        if (spouseStarType === '财星') {
            parts.push('正偏财混杂');
        }
        else {
            parts.push('官杀混杂');
        }
    }
    if (conflict) {
        if (spouseStarType === '财星') {
            parts.push('容易被比劫所夺');
        }
        else {
            parts.push('容易被食伤所制');
        }
    }
    return {
        level,
        mixed,
        conflict,
        description: parts.join('，') || `${spouseStarType}状态正常`,
    };
}
/**
 * 分析食伤状态
 */
function analyzeShiShangStatus(W) {
    const shishangWeight = (W.shi || 0) + (W.shang || 0);
    const level = shishangWeight < 0.3 ? '偏弱'
        : shishangWeight > 0.7 ? '偏旺'
            : '中等';
    const description = shishangWeight < 0.3
        ? '食伤力量较弱，表达方式相对内敛'
        : shishangWeight > 0.7
            ? '食伤力量较强，表达方式相对直接'
            : '食伤力量中等，表达方式较为平衡';
    return { level, description };
}
/**
 * 构建感情表达方式提示
 */
function buildExpressionHints(params) {
    const hints = [];
    const { spouseStarStatus, shiShangStatus, structure, pillars } = params;
    // 1. 根据食伤状态判断表达方式
    if (shiShangStatus.level === '偏旺') {
        hints.push('你在感情中表达方式比较直接，不太会拐弯抹角');
    }
    else if (shiShangStatus.level === '偏弱') {
        hints.push('你在感情中表达方式相对内敛，不太会说甜话');
    }
    // 2. 根据配偶星状态判断主动/被动
    if (spouseStarStatus.level === '偏弱') {
        hints.push('你在感情中相对被动，不太会主动追求');
    }
    else if (spouseStarStatus.level === '偏旺') {
        hints.push('你在感情中相对主动，容易主动表达好感');
    }
    // 3. 根据格局判断其他特质
    const structureName = structure?.name || '';
    if (structureName.includes('食伤')) {
        hints.push('你比较注重精神层面的交流，喜欢有共同话题的对象');
    }
    if (structureName.includes('比劫')) {
        hints.push('你在感情中比较重视朋友和同伴关系');
    }
    return hints.slice(0, 4); // 最多返回 4 条
}
/**
 * 构建配偶星与表达方式信息
 */
async function buildSpouseAndExpression(chartResult, gender) {
    const analysis = chartResult.analysis || {};
    const structure = analysis.structure || {};
    const pillars = chartResult.pillars || {};
    const W = structure.W || structure.tenGodWeights || {};
    const dayMasterGan = analysis.dayMaster?.gan || '';
    // 判断配偶星类型
    const spouseStarType = gender === 'male' ? '财星' : '官杀';
    // 构建配偶星分布
    const spouseStarDistribution = await buildSpouseStarDistribution(pillars, dayMasterGan, spouseStarType);
    // 分析配偶星状态
    const spouseStarStatus = analyzeSpouseStarStatus(W, spouseStarType, structure);
    // 分析食伤状态
    const shiShangStatus = analyzeShiShangStatus(W);
    // 构建感情表达方式提示
    const expressionHints = buildExpressionHints({
        spouseStarStatus,
        shiShangStatus,
        structure,
        pillars,
    });
    return {
        spouseStarType,
        spouseStarDistribution,
        spouseStarStatus: {
            strength: spouseStarStatus.level,
            mixed: spouseStarStatus.mixed,
            conflict: spouseStarStatus.conflict,
            description: spouseStarStatus.description,
        },
        shiShangStatus: {
            strength: shiShangStatus.level,
            description: shiShangStatus.description,
        },
        expressionHints,
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
    const riskHints = buildRiskHintsFromBreaking(breaking);
    return {
        purityLevel: purity.level || purity.label || '未知',
        tiaoHouSummary: tiaohou.summary || tiaohou.label || '',
        tiYongSummary: tiyong.interpretation || tiyong.summary || '',
        riskHints,
    };
}
/**
 * 从破格因素中提取风险提示
 */
function buildRiskHintsFromBreaking(breaking) {
    const hints = [];
    const factors = breaking?.factors || [];
    for (const factor of factors) {
        const type = factor.type || '';
        const description = factor.description || '';
        // 提取与感情相关的风险
        if (type.includes('比劫夺财') || description.includes('比劫') && description.includes('财')) {
            hints.push('感情中容易遇到竞争，需要主动争取');
        }
        if (type.includes('食伤制官') || description.includes('食伤') && description.includes('官')) {
            hints.push('感情中容易因为表达方式不当而产生矛盾');
        }
        if (type.includes('官杀混杂')) {
            hints.push('感情中容易遇到复杂的情况，需要明确自己的选择');
        }
    }
    return hints.slice(0, 3); // 最多返回 3 条
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
 * 提取流年恋爱神煞
 */
function extractYearLoveShenSha(yearData) {
    // 优先从 yearData.shensha 中提取
    if (yearData.shensha && Array.isArray(yearData.shensha)) {
        return extractLoveShenSha(yearData.shensha);
    }
    // 如果没有，返回空数组（其他年份需要重新计算）
    return [];
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
        loveShenSha: extractYearLoveShenSha(currentLuckItem),
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
        // 提取流年神煞（优先从 flow_years 中查找）
        const flowYear = derived.flow_years?.find((y) => y.year === item.year);
        const loveShenSha = extractYearLoveShenSha(flowYear || item);
        years.push({
            year: item.year,
            ganzhi: item.ganzhi || `${item.stem || ''}${item.branch || ''}`,
            tenGodToDay: item.shishen || '未知',
            favLevel: mapFavourLevel(item.favourLevel),
            branchRelationsToSpousePalace: branchRelations,
            loveShenSha,
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
            like: yongshenPattern.mainYongshen?.elements || [],
            dislike: yongshenPattern.tabooElements || [],
            summary: yongshenPattern.summary || '',
        },
        wuxing: {
            木: wuxing.木 || 0,
            火: wuxing.火 || 0,
            土: wuxing.土 || 0,
            金: wuxing.金 || 0,
            水: wuxing.水 || 0,
        },
    };
}
/**
 * 从命盘结果中构建 LoveChatContext
 *
 * @param params 参数对象
 * @param params.chartResult 命盘分析结果（来自 engine）
 * @param params.gender 性别（从 chart_profiles 表获取）
 * @param params.userQuestion 用户问题（用于判断 partnerMentioned）
 * @param params.now 当前时间（用于计算当前年份，可选）
 * @returns LoveChatContext
 */
async function buildLoveChatContext(params) {
    const { chartResult, gender, userQuestion, now = new Date() } = params;
    // 1. 提取基础信息
    const basic = extractBasicInfo(chartResult);
    // 2. 提取四柱恋爱信息
    const pillars = extractPillarsLoveInfo(chartResult);
    // 3. 提取宫位信息（需要异步调用）
    const palace = await buildPalaceContext(chartResult);
    // 4. 提取配偶星信息（需要异步调用）
    const spouseAndExpression = await buildSpouseAndExpression(chartResult, gender);
    // 5. 提取清浊调候信息
    const patternAndBearing = extractPatternInfo(chartResult);
    // 6. 提取大运流年信息（需要异步调用）
    const fortune = await buildFortuneContext(chartResult, palace.spouseBranch, now);
    // 7. 提取辅助分析信息
    const extra = extractExtraInfo(chartResult);
    // 8. 判断是否提到伴侣
    const partnerMentioned = detectPartnerMention(userQuestion || '');
    return {
        mode: 'single', // 当前只支持单人分析
        meta: {
            selfGender: gender,
            currentYear: now.getFullYear(),
            partnerMentioned,
        },
        basic,
        pillars,
        palace,
        spouseAndExpression,
        patternAndBearing,
        fortune,
        extra,
    };
}
//# sourceMappingURL=loveContextBuilder.js.map