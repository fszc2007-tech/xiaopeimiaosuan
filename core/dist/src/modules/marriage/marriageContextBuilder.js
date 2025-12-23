"use strict";
/**
 * 婚姻聊天上下文构建器
 *
 * 从命盘结果中提取并构建 MarriageChatContext
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
exports.buildMarriageChatContext = buildMarriageChatContext;
const marriagePatternCalculator_1 = require("./marriagePatternCalculator");
/**
 * 检查用户问题中是否提到伴侣或婚姻状态
 */
function detectMarriageMode(question) {
    const keywords = {
        single: ['单身', '未婚', '没对象', '没有对象', '没男朋友', '没女朋友'],
        inRelationship: ['恋爱', '男朋友', '女朋友', '对象', '另一半', '恋人'],
        married: ['已婚', '结婚', '老公', '老婆', '妻子', '丈夫'],
        divorced: ['离婚', '离异', '分手', '分开'],
        remarriage: ['再婚', '二婚', '复婚'],
    };
    for (const [mode, keys] of Object.entries(keywords)) {
        if (keys.some(key => question.includes(key))) {
            return mode;
        }
    }
    return 'single'; // 默认单身
}
/**
 * 提取关系状态提示
 */
function extractRelationStatusHint(mode, question) {
    const modeMap = {
        single: '未婚单身',
        inRelationship: '有稳定对象',
        married: '已婚',
        divorced: '离异',
        remarriage: '再婚',
    };
    return modeMap[mode] || '未知';
}
/**
 * 提取基础信息（复用恋爱桃花的逻辑）
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
            W: {
                guan: normalizeWeight((W.guan || 0) + (W.zGuan || 0) + (W.sha || 0)),
                cai: normalizeWeight(W.cai || W.caiXing || 0),
                shishang: normalizeWeight((W.shi || 0) + (W.shang || 0)),
                bijie: normalizeWeight((W.bi || 0) + (W.jie || 0)),
                yin: normalizeWeight((W.yin || 0) + (W.zYin || 0) + (W.pYin || 0)),
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
 * 归一化权重
 */
function normalizeWeight(weight) {
    return Math.max(0, Math.min(1, weight));
}
/**
 * 分析配偶星状态（复用恋爱桃花的逻辑）
 */
function analyzeSpouseStarStatus(W, spouseStarType, structure) {
    // 1. 判断强弱
    const spouseStarWeight = spouseStarType === '财星'
        ? normalizeWeight(W.cai || W.caiXing || 0)
        : normalizeWeight((W.guan || 0) + (W.zGuan || 0) + (W.sha || 0));
    const strength = spouseStarWeight < 0.3 ? '偏弱'
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
        conflict = pogeFactors.some((factor) => factor.type?.includes('比劫夺财') ||
            (factor.type?.includes('比劫') && factor.description?.includes('财')));
        if (!conflict) {
            const biJieWeight = normalizeWeight((W.bi || 0) + (W.jie || 0));
            conflict = biJieWeight > 0.5 && spouseStarWeight < 0.5;
        }
    }
    else {
        conflict = pogeFactors.some((factor) => factor.type?.includes('食伤制官') ||
            factor.type?.includes('伤官见官') ||
            (factor.type?.includes('食伤') && factor.description?.includes('官')));
        if (!conflict) {
            const shiShangWeight = normalizeWeight((W.shi || 0) + (W.shang || 0));
            conflict = shiShangWeight > 0.5 && spouseStarWeight < 0.5;
        }
    }
    // 4. 生成描述
    const parts = [];
    if (strength === '偏弱') {
        parts.push(`${spouseStarType}力量偏弱`);
    }
    else if (strength === '偏旺') {
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
        strength,
        mixed,
        conflict,
        description: parts.join('，') || `${spouseStarType}状态正常`,
    };
}
/**
 * 分析食伤状态（复用恋爱桃花的逻辑）
 */
function analyzeShiShangStatus(W) {
    const shishangWeight = normalizeWeight((W.shi || 0) + (W.shang || 0));
    const strength = shishangWeight < 0.3 ? '偏弱'
        : shishangWeight > 0.7 ? '偏旺'
            : '中等';
    const description = shishangWeight < 0.3
        ? '食伤力量较弱，表达方式相对内敛'
        : shishangWeight > 0.7
            ? '食伤力量较强，表达方式相对直接'
            : '食伤力量中等，表达方式较为平衡';
    return { strength, description };
}
/**
 * 构建配偶宫信息（复用恋爱桃花的逻辑）
 */
async function buildSpousePalace(chartResult) {
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
    // 生成总结文字
    const summaryParts = [];
    if (dayRelations.he.length > 0 || dayRelations.sanhe.length > 0) {
        summaryParts.push('配偶宫有合，关系相对稳定');
    }
    if (dayRelations.chong.length > 0) {
        summaryParts.push('配偶宫被冲，关系容易有波动');
    }
    if (dayRelations.xing.length > 0 || dayRelations.hai.length > 0) {
        summaryParts.push('配偶宫有刑害，需要注意沟通');
    }
    return {
        branch: dayBranch || '未知',
        relations: dayRelations,
        summary: summaryParts.join('；') || '配偶宫状态正常',
    };
}
/**
 * 构建配偶特征提示（基于配偶星和配偶宫）
 */
function buildSpouseProfileHint(spouseStarStatus, spousePalace, structure) {
    const hints = [];
    // 基于配偶星状态
    if (spouseStarStatus.strength === '偏旺') {
        hints.push('配偶能力较强');
    }
    if (spouseStarStatus.mixed) {
        hints.push('配偶性格可能较为复杂');
    }
    // 基于配偶宫
    if ((spousePalace.relations?.he || []).length > 0) {
        hints.push('配偶性格相对温和');
    }
    if ((spousePalace.relations?.chong || []).length > 0) {
        hints.push('配偶性格可能较为强势');
    }
    // 基于格局
    const structureName = structure?.name || '';
    if (structureName.includes('财')) {
        hints.push('配偶可能更注重现实和物质');
    }
    if (structureName.includes('官')) {
        hints.push('配偶可能更注重规则和原则');
    }
    return hints.length > 0
        ? hints.join('，')
        : '配偶特征需要结合具体命盘和实际情况分析';
}
/**
 * 构建大运流年信息（复用恋爱桃花的逻辑，调整筛选标准）
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
    const currentLuckGanzhi = currentLuckItem.ganzhi ||
        `${currentLuckItem.stem || ''}${currentLuckItem.branch || ''}` ||
        luckRhythm.currentLuck?.label || '未知';
    const currentLuckDescription = luckRhythm.currentLuck?.tone ||
        luckRhythm.currentLuck?.rhythmDescription ||
        '当前大运在婚姻上的氛围需要结合具体命盘分析';
    // 从 annualBrief 提取最近 5 年，筛选婚姻相关窗口
    const marriageWindows = [];
    const filteredYears = annualBrief
        .filter((y) => y.year >= currentYear && y.year <= currentYear + 5)
        .sort((a, b) => a.year - b.year);
    for (const item of filteredYears) {
        // 计算流年地支
        const yearBranch = item.ganzhi?.slice(1) || item.branch || '';
        // 计算流年与配偶宫的关系
        const branchRelationsModule = await Promise.resolve().then(() => __importStar(require('../../../engine/mingli/branchRelationships.js')));
        const { checkLiuHe, checkLiuChong } = branchRelationsModule;
        const hasHe = checkLiuHe(yearBranch, spouseBranch);
        const hasChong = checkLiuChong(yearBranch, spouseBranch);
        // 判断婚姻友好度
        let favourLevel = 'normal';
        let type = '';
        let reason = '';
        if (hasHe) {
            favourLevel = 'golden';
            type = '适合定下关系或领证/办婚礼';
            reason = '流年与配偶宫有合，关系容易稳定';
        }
        else if (hasChong) {
            favourLevel = 'hard';
            type = '适合调整关系或自我沉淀';
            reason = '流年与配偶宫有冲，需要特别注意沟通';
        }
        else {
            // 根据十神判断
            const tenGod = item.shishen || '';
            if (tenGod.includes('财') || tenGod.includes('官')) {
                favourLevel = 'good';
                type = '适合定下关系';
                reason = '流年有配偶星，有利于关系发展';
            }
            else {
                favourLevel = 'normal';
                type = '适合观察和磨合';
                reason = '流年对婚姻影响相对中性';
            }
        }
        marriageWindows.push({
            year: item.year,
            favourLevel,
            type,
            reason,
        });
    }
    return {
        currentLuck: currentLuckDescription,
        marriageWindows: marriageWindows.slice(0, 5), // 最多返回 5 个窗口
    };
}
/**
 * 提取辅助分析信息（复用恋爱桃花的逻辑）
 */
function extractExtraInfo(chartResult) {
    const analysis = chartResult.analysis || {};
    return {
        loveSummary: analysis.energyFlow?.summary || analysis.dogong?.summary || '',
        familySummary: analysis.guancaiPattern?.summary || '',
        careerBalanceSummary: analysis.minggeSummary?.summary || '',
    };
}
/**
 * 从命盘结果中构建 MarriageChatContext
 */
async function buildMarriageChatContext(params) {
    const { chartResult, gender, userQuestion, now = new Date() } = params;
    // 1. 提取基础信息
    const basic = extractBasicInfo(chartResult);
    // 2. 判断婚姻模式
    const mode = detectMarriageMode(userQuestion || '');
    const relationStatusHint = extractRelationStatusHint(mode, userQuestion || '');
    // 3. 构建配偶星信息
    const analysis = chartResult.analysis || {};
    const structure = analysis.structure || {};
    const W = structure.W || structure.tenGodWeights || {};
    const spouseStarType = gender === 'male' ? '财星' : '官杀';
    const spouseStarStatus = analyzeSpouseStarStatus(W, spouseStarType, structure);
    const shiShangStatus = analyzeShiShangStatus(W);
    // 4. 构建配偶宫信息（异步）
    const spousePalace = await buildSpousePalace(chartResult);
    const spouseProfileHint = buildSpouseProfileHint(spouseStarStatus, spousePalace, structure);
    // 5. 计算婚姻模式（核心逻辑）
    const marriagePattern = (0, marriagePatternCalculator_1.calculateMarriagePattern)({
        W,
        spouseStarStatus,
        spousePalace,
        breaking: analysis.breaking || analysis.patternBreaking || {},
        purityLevel: analysis.purity?.level || analysis.patternPurity?.level || '未知',
        dayMasterStrength: basic.dayMasterStrength,
        pillars: chartResult.pillars || {},
        yongshen: basic.yongshen,
        structure,
        shiShangStatus,
    });
    // 6. 构建大运流年信息（异步）
    const fortune = await buildFortuneContext(chartResult, spousePalace.branch, now);
    // 7. 提取辅助分析信息
    const extra = extractExtraInfo(chartResult);
    // 8. 计算年龄
    const birthYear = chartResult.derived?.birth_year || new Date().getFullYear();
    const age = now.getFullYear() - birthYear;
    return {
        mode,
        meta: {
            selfGender: gender,
            currentYear: now.getFullYear(),
            age,
            relationStatusHint,
        },
        basic,
        spouse: {
            spouseStarType,
            spouseStarStatus,
            spousePalace,
            spouseProfileHint,
        },
        marriagePattern,
        fortune,
        plan: {}, // 用户计划信息需要从对话或表单中收集
        extra,
    };
}
//# sourceMappingURL=marriageContextBuilder.js.map