"use strict";
/**
 * 投资理财聊天上下文构建器
 *
 * 从命盘结果中提取并构建 InvestChatContext
 * 尽可能复用系统已有的计算和数据
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildInvestChatContext = buildInvestChatContext;
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
    const strength = analysis.strengthAnalysis || {};
    const structure = analysis.structure || {};
    const yongshenPattern = analysis.yongshenPattern || {};
    const wuxingPercent = analysis.wuxingPercent || {};
    const W = structure.W || structure.tenGodWeights || {};
    return {
        dayMaster: dayMaster.gan && dayMaster.wuxing
            ? `${dayMaster.gan}${dayMaster.wuxing}`
            : '未知',
        dayMasterStrength: {
            // ⚠️ 重要：保持和 engine 一致，不私自转换
            // engine 返回什么标度就用什么标度（通常是 0-100）
            score: typeof strength.score === 'number' ? strength.score : 0,
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
            like: yongshenPattern.mainYongshen?.elements || yongshenPattern.mainYongshen || [],
            dislike: yongshenPattern.tabooElements || [],
            summary: yongshenPattern.summary || '',
        },
        wuxing: {
            木: wuxingPercent.木 || 0,
            火: wuxingPercent.火 || 0,
            土: wuxingPercent.土 || 0,
            金: wuxingPercent.金 || 0,
            水: wuxingPercent.水 || 0,
        },
    };
}
/**
 * 提取财富相关信息
 */
function extractWealthInfo(chartResult) {
    const analysis = chartResult.analysis || {};
    const guancaiPattern = analysis.guancaiPattern || {};
    return {
        // 优先使用 guancaiPattern.summary（如果有）
        guancaiSummary: guancaiPattern.summary || undefined,
        // 优先使用 wealthPattern.summary，否则简单组合
        wealthSummary: guancaiPattern.wealthPattern?.summary ||
            (guancaiPattern.wealthPattern?.wealthType && guancaiPattern.wealthPattern?.strength?.level
                ? `${guancaiPattern.wealthPattern.wealthType}，财运${guancaiPattern.wealthPattern.strength.level}`
                : undefined),
        // 从 careerPattern.structureTag 获取
        careerSummary: guancaiPattern.careerPattern?.structureTag || undefined,
    };
}
/**
 * 提取行运节奏总结
 */
function extractLuckRhythmSummary(chartResult) {
    const analysis = chartResult.analysis || {};
    const luckRhythm = analysis.luckRhythm || {};
    const currentLuck = luckRhythm.currentLuck || {};
    // 优先用 tone，其次用 stage
    return currentLuck.tone || currentLuck.stage || undefined;
}
/**
 * 将 highlightTag 映射为财富窗口类型
 */
function mapHighlightTagToWealthType(tag, favourLevel) {
    if (favourLevel === 'golden' || favourLevel === 'good') {
        if (tag === 'opportunity')
            return '适合拓展收入';
        if (tag === 'smooth')
            return '适合稳健理财';
        return '适合主动争取';
    }
    else if (favourLevel === 'normal') {
        if (tag === 'adjust')
            return '适合学习理财';
        return '适合稳住基本盘';
    }
    else {
        return '适合降低风险';
    }
}
/**
 * 生成原因说明
 */
function generateWealthReason(annual, favourLevel, type) {
    const tenGodToDay = annual.tenGodToDay || '';
    if (favourLevel === 'golden' || favourLevel === 'good') {
        if (tenGodToDay.includes('财'))
            return '财星得力，机会变多';
        if (tenGodToDay.includes('食') || tenGodToDay.includes('伤'))
            return '食伤生财，适合主动争取';
        return '整体运势对财富有利';
    }
    else if (favourLevel === 'normal') {
        return '适合稳扎稳打，积累为主';
    }
    else {
        return '压力偏大，适合守成，减少高风险操作';
    }
}
/**
 * V1 极简映射：基于 annualBrief 自带信息 + 简单 heuristic
 *
 * 算法：
 * 1. 以 favourLevel 作为基础分（-2 ~ +2，需要从 'good'|'mixed'|'bad'|'neutral' 映射）
 * 2. 根据十神简单微调（只针对财富相关：财、食伤、比劫）
 * 3. 根据命局财星权重微调
 * 4. 映射成 4 档（golden / good / normal / hard）
 * 5. 根据 highlightTag 翻译成 type
 */
function buildWealthWindows(annualBrief, weights, // ⚠️ 使用完整类型，不要只写 { cai: number }
currentYear) {
    // ⚠️ 健壮性：如果 annualBrief 为空或不存在，返回 undefined（而不是空数组）
    if (!annualBrief || annualBrief.length === 0) {
        return undefined;
    }
    // 1. 过滤：只取最近 5-7 年（当前年份前后）
    const filtered = annualBrief
        .filter(y => y.year >= currentYear - 1 && y.year <= currentYear + 5)
        .slice(0, 7);
    // 如果过滤后为空，返回 undefined
    if (filtered.length === 0) {
        return undefined;
    }
    return filtered.map(annual => {
        // 2. 基础分：从 favourLevel 映射到 -2 ~ +2
        let score = 0;
        if (annual.favourLevel === 'good')
            score = 1.5;
        else if (annual.favourLevel === 'mixed')
            score = 0;
        else if (annual.favourLevel === 'bad')
            score = -1.5;
        else
            score = 0; // neutral
        // 3. 根据十神微调（只针对财富相关）
        const tenGodToDay = annual.tenGodToDay || ''; // ⚠️ 使用 tenGodToDay，不是 shishen
        if (tenGodToDay.includes('财'))
            score += 1;
        if (tenGodToDay.includes('食') || tenGodToDay.includes('伤'))
            score += 0.5;
        if (tenGodToDay.includes('比') || tenGodToDay.includes('劫'))
            score -= 0.5;
        // 4. 根据命局财星权重微调
        if (weights.cai > 1.2)
            score += 0.5; // 财星本来就强 → 机会更好
        if (weights.cai < 0.8)
            score -= 0.5; // 财星太弱 → 分数上限略收敛
        // 5. 限制范围
        if (score > 2)
            score = 2;
        if (score < -2)
            score = -2;
        // 6. 映射 favourLevel
        let favourLevel;
        if (score >= 1.5)
            favourLevel = 'golden';
        else if (score >= 0.5)
            favourLevel = 'good';
        else if (score > -0.5)
            favourLevel = 'normal';
        else
            favourLevel = 'hard';
        // 7. type 根据 highlightTag 翻译
        const type = mapHighlightTagToWealthType(annual.highlightTag, favourLevel);
        // 8. reason 简单生成
        const reason = generateWealthReason(annual, favourLevel, type);
        return {
            year: annual.year,
            favourLevel,
            type,
            reason,
        };
    });
}
/**
 * 提取辅助信息
 */
function extractExtraInfo(chartResult) {
    const analysis = chartResult.analysis || {};
    return {
        // 直接使用 energyFlow.summary
        energyFlowSummary: analysis.energyFlow?.summary || undefined,
        // 如果有宫位/家庭相关 summary 就用，否则 undefined（不要硬抠）
        relationshipSummary: undefined, // V1 先不填，后续如果有专门字段再加
        familySummary: undefined, // V1 先不填，后续如果有专门字段再加
        // 直接使用 minggeSummary.summary，让 LLM 自己抓取相关部分
        minggeSummary: analysis.minggeSummary?.summary || undefined,
    };
}
/**
 * 从用户问题提取 concernType（V1 关键词匹配版本）
 *
 * V1 策略：简单关键词匹配，快速上线
 * V2 策略：可升级为 LLM 抽取（复用 jobChange 的 extractPlanFromQuestion）
 *
 * 匹配规则：
 * - 「买房」「房贷」「房子」「首付」→ "买房置业"
 * - 「副业」「兼职」「第二收入」「多一份收入」→ "副业/兼职"
 * - 「加薪」「涨工资」「收入」「赚钱」→ "收入增长"
 * - 「投资」「理财」「基金」「股票」「债券」「存款」「定投」→ "投资理财"
 * - 其他 → "整体财运"（兜底）
 */
function extractConcernTypeV1(question) {
    if (!question || !question.trim()) {
        return '整体财运'; // 兜底默认值
    }
    const q = question.toLowerCase();
    // 买房置业
    if (/买房|房贷|房子|首付|换房|购房/.test(q)) {
        return '买房置业';
    }
    // 副业/兼职
    if (/副业|兼职|第二收入|多一份收入|额外收入/.test(q)) {
        return '副业/兼职';
    }
    // 收入增长
    if (/加薪|涨工资|收入|赚钱|提高收入/.test(q)) {
        return '收入增长';
    }
    // 投资理财
    if (/投资|理财|基金|股票|债券|存款|定投|炒股|买基金/.test(q)) {
        return '投资理财';
    }
    // 兜底
    return '整体财运';
}
/**
 * 综合判断风险承受力
 *
 * ⚠️ 重要：当 userQuestion 为空时，允许返回 undefined
 * - V1 行为更保守：没有用户语言输入时，直接放弃判断
 * - 将来如果觉得命盘+energyFlow 的判断经得起打，可以删掉 early return
 *
 * 1. 问题里的显式意图：
 *    - 「保守」「稳健」「不敢亏」「先还债」→ 往「偏保守」靠
 *    - 「搏一把」「翻身」「不甘平庸」「试试高风险」→ 往「偏进取」靠
 *
 * 2. 命盘里的倾向：
 *    - 食伤很强、比劫旺、官印弱 → 行为上更容易冲动尝试 → 往「偏进取」多加 0.5 档
 *    - 印星重、官星重，财星不太露 → 更偏安全、规避风险 → 往「偏保守」多拉一点
 *    - energyFlowSummary 里如果多次提到「情绪波动、焦虑、冲动消费」→ 也可以往「偏进取但需管住手」方向说
 *
 * 3. 最后给三档之一：
 *    - 把「问题意图 + 命盘倾向」合在一个小评分里
 *    - >0.5 就「偏进取」，<-0.5 就「偏保守」，其余「中性」
 */
function deriveRiskToleranceHint(userQuestion, chartResult) {
    // ⚠️ V1：没有用户语言输入时，直接放弃判断
    // 后续如果觉得命盘判断足够稳，可以删掉这个 early return
    if (!userQuestion || !userQuestion.trim()) {
        return undefined;
    }
    const analysis = chartResult.analysis || {};
    const structure = analysis.structure || {};
    const W = structure.W || structure.tenGodWeights || {};
    const energyFlowSummary = analysis.energyFlow?.summary || '';
    let score = 0; // -1 ~ +1，最终映射到三档
    // 1. 问题显式意图
    const questionLower = userQuestion.toLowerCase();
    if (questionLower.includes('保守') || questionLower.includes('稳健') ||
        questionLower.includes('不敢亏') || questionLower.includes('先还债')) {
        score -= 0.5;
    }
    if (questionLower.includes('搏一把') || questionLower.includes('翻身') ||
        questionLower.includes('不甘平庸') || questionLower.includes('高风险')) {
        score += 0.5;
    }
    // 2. 命盘倾向
    const shishangWeight = (W.shi || 0) + (W.shang || 0);
    const bijieWeight = (W.bi || 0) + (W.jie || 0);
    const yinWeight = (W.yin || 0) + (W.zYin || 0) + (W.pYin || 0);
    const guanWeight = (W.guan || 0) + (W.zGuan || 0) + (W.sha || 0);
    const caiWeight = W.cai || W.caiXing || 0;
    // 食伤很强、比劫旺、官印弱 → 偏进取
    if (shishangWeight > 0.3 || bijieWeight > 0.3) {
        if (yinWeight < 0.2 && guanWeight < 0.2) {
            score += 0.3;
        }
    }
    // 印星重、官星重，财星不太露 → 偏保守
    if ((yinWeight > 0.3 || guanWeight > 0.3) && caiWeight < 0.15) {
        score -= 0.3;
    }
    // energyFlow 里提到情绪波动、冲动消费 → 偏进取但需管住手（这里先算进取倾向）
    if (energyFlowSummary.includes('情绪波动') || energyFlowSummary.includes('冲动消费') ||
        energyFlowSummary.includes('焦虑')) {
        score += 0.2;
    }
    // 3. 映射到三档
    if (score > 0.5)
        return '偏进取';
    if (score < -0.5)
        return '偏保守';
    return '中性';
}
/**
 * 从命盘结果中构建 InvestChatContext
 *
 * @param params 参数对象
 * @param params.chartResult 命盘分析结果（来自 engine）
 * @param params.gender 性别（从 chart_profiles 表获取）
 * @param params.userQuestion 用户问题（用于提取 concernType 和 riskToleranceHint）
 * @param params.now 当前时间（用于计算当前年份，可选）
 * @returns InvestChatContext
 */
async function buildInvestChatContext(params) {
    const { chartResult, gender, userQuestion, now = new Date() } = params;
    // 1. 提取基础信息
    const basic = extractBasicInfo(chartResult);
    // 2. 提取财富相关信息
    const wealth = extractWealthInfo(chartResult);
    // 3. 提取行运信息
    const analysis = chartResult.analysis || {};
    const luckRhythm = analysis.luckRhythm || {};
    const annualBrief = luckRhythm.annualBrief || [];
    const fortune = {
        luckRhythmSummary: extractLuckRhythmSummary(chartResult),
        wealthWindows: buildWealthWindows(annualBrief, basic.structure.weights, now.getFullYear()),
    };
    // 4. 提取辅助信息
    const extra = extractExtraInfo(chartResult);
    // 5. 提取元数据
    // ⚠️ concernType 必须有兜底值，不要返回 undefined
    const concernType = userQuestion
        ? extractConcernTypeV1(userQuestion) // V1 用关键词匹配，V2 可升级 LLM
        : '整体财运'; // 兜底默认值
    // ⚠️ riskToleranceHint 允许 undefined（当 userQuestion 为空时）
    const riskToleranceHint = deriveRiskToleranceHint(userQuestion, chartResult);
    // 6. 计算年龄
    const birthYear = chartResult.derived?.birth_year || now.getFullYear();
    const age = now.getFullYear() - birthYear;
    // 7. Debug 日志（仅在开发环境）
    if (process.env.NODE_ENV === 'development') {
        const wealthWindowsSummary = fortune.wealthWindows
            ? {
                golden: fortune.wealthWindows.filter(w => w.favourLevel === 'golden').length,
                good: fortune.wealthWindows.filter(w => w.favourLevel === 'good').length,
                normal: fortune.wealthWindows.filter(w => w.favourLevel === 'normal').length,
                hard: fortune.wealthWindows.filter(w => w.favourLevel === 'hard').length,
            }
            : null;
        console.log('[Invest] Context built:', {
            chartId: chartResult.profileId || 'unknown',
            concernType,
            riskToleranceHint,
            wealthWindowsCount: fortune.wealthWindows?.length || 0,
            wealthWindowsSummary,
        });
    }
    return {
        meta: {
            selfGender: gender,
            currentYear: now.getFullYear(),
            age,
            concernType,
            riskToleranceHint,
        },
        basic,
        wealth,
        fortune,
        extra,
    };
}
//# sourceMappingURL=investContextBuilder.js.map