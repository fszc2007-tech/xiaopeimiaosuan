"use strict";
/**
 * 工作跳槽聊天上下文构建器
 *
 * 从命盘结果中提取并构建 JobChangeChatContext
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
exports.buildJobChangeChatContext = buildJobChangeChatContext;
const aiService = __importStar(require("../ai/aiService"));
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
            score: typeof strength.score === 'number' ? strength.score / 100 : (strength.score ?? 0),
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
            木: wuxing.木 || 0,
            火: wuxing.火 || 0,
            土: wuxing.土 || 0,
            金: wuxing.金 || 0,
            水: wuxing.水 || 0,
        },
    };
}
/**
 * 推导适合体制/大机构程度
 */
function deriveFitSystem(chartResult) {
    const analysis = chartResult.analysis || {};
    const structure = analysis.structure || {};
    const W = structure.W || structure.tenGodWeights || {};
    const structureName = structure.name || '';
    const yongshenPattern = analysis.yongshenPattern || {};
    const yongshen = yongshenPattern.mainYongshen?.elements || yongshenPattern.mainYongshen || [];
    const guanWeight = (W.guan || 0) + (W.zGuan || 0) + (W.sha || 0);
    // 简化判断：官星多为金水
    const guanIsFavored = Array.isArray(yongshen) &&
        (yongshen.includes('金') || yongshen.includes('水'));
    if (guanWeight > 0.25 || structureName.includes('官') || guanIsFavored) {
        return '高';
    }
    else if (guanWeight > 0.15) {
        return '中';
    }
    else {
        return '低';
    }
}
/**
 * 推导适合企业程度
 */
function deriveFitEnterprise(chartResult) {
    const analysis = chartResult.analysis || {};
    const structure = analysis.structure || {};
    const W = structure.W || structure.tenGodWeights || {};
    const structureName = structure.name || '';
    const caiWeight = W.cai || W.caiXing || 0;
    if (caiWeight > 0.25 || structureName.includes('财')) {
        return '高';
    }
    else if (caiWeight > 0.15) {
        return '中';
    }
    else {
        return '低';
    }
}
/**
 * 推导适合小公司/创业/不确定性高程度
 */
function deriveFitStartup(chartResult) {
    const analysis = chartResult.analysis || {};
    const structure = analysis.structure || {};
    const W = structure.W || structure.tenGodWeights || {};
    const structureName = structure.name || '';
    const dogongResult = analysis.dogongResult || analysis.dogong || {};
    const mainLine = dogongResult?.workPatterns?.mainLine ||
        dogongResult?.workTypeSummary?.mainLine || '';
    const bijieWeight = (W.bi || 0) + (W.jie || 0);
    const shishangWeight = (W.shi || 0) + (W.shang || 0);
    const caiWeight = W.cai || W.caiXing || 0;
    // 食伤生财格局 → 适合创业
    if (mainLine.includes('食傷生財') || mainLine.includes('食伤生财')) {
        return '高';
    }
    // 比劫+食伤组合 → 适合小团队
    if (bijieWeight > 0.25 && shishangWeight > 0.2) {
        return '高';
    }
    // 比劫+财星组合 → 适合创业
    if (bijieWeight > 0.25 && caiWeight > 0.2) {
        return '中';
    }
    return '低';
}
/**
 * 推导适合自由职业/创业程度
 */
function deriveFitFreelanceOrBiz(chartResult) {
    const analysis = chartResult.analysis || {};
    const structure = analysis.structure || {};
    const W = structure.W || structure.tenGodWeights || {};
    const dogongResult = analysis.dogongResult || analysis.dogong || {};
    const mainLine = dogongResult?.workPatterns?.mainLine ||
        dogongResult?.workTypeSummary?.mainLine || '';
    const shishangWeight = (W.shi || 0) + (W.shang || 0);
    const caiWeight = W.cai || W.caiXing || 0;
    // 食伤生财 → 适合自由职业
    if (mainLine.includes('食傷生財') || mainLine.includes('食伤生财')) {
        if (shishangWeight > 0.25 && caiWeight > 0.2) {
            return '高';
        }
    }
    // 食伤旺 → 适合创意类自由职业
    if (shishangWeight > 0.3) {
        return '中';
    }
    return '低';
}
/**
 * 推导角色偏好
 */
function deriveRolePreference(chartResult) {
    const analysis = chartResult.analysis || {};
    const structure = analysis.structure || {};
    const W = structure.W || structure.tenGodWeights || {};
    const yinWeight = (W.yin || 0) + (W.zYin || 0) + (W.pYin || 0);
    const guanWeight = (W.guan || 0) + (W.zGuan || 0) + (W.sha || 0);
    const shishangWeight = (W.shi || 0) + (W.shang || 0);
    const bijieWeight = (W.bi || 0) + (W.jie || 0);
    const caiWeight = W.cai || W.caiXing || 0;
    // 找出权重最高的
    const weights = [
        { type: '技术专家型', weight: yinWeight },
        { type: '管理型', weight: guanWeight },
        { type: '创意表达型', weight: shishangWeight },
        { type: '综合协调型', weight: (caiWeight + bijieWeight) / 2 },
    ];
    weights.sort((a, b) => b.weight - a.weight);
    return weights[0].type;
}
/**
 * 推导工作风格标签
 */
function deriveWorkStyleTags(chartResult, careerFit) {
    const analysis = chartResult.analysis || {};
    const structure = analysis.structure || {};
    const W = structure.W || structure.tenGodWeights || {};
    const guancaiPattern = analysis.guancaiPattern || {};
    const stability = guancaiPattern?.stability?.career;
    const tags = [];
    // 根据稳定度
    if (stability === '稳定' || stability === '偏稳') {
        tags.push('适合项目制');
    }
    else {
        tags.push('需要一定自由度');
    }
    // 根据比劫权重（人际关系）
    const bijieWeight = (W.bi || 0) + (W.jie || 0);
    if (bijieWeight < 0.2) {
        tags.push('不太适合高强度人情应酬');
    }
    // 根据食伤权重（创意）
    const shishangWeight = (W.shi || 0) + (W.shang || 0);
    if (shishangWeight > 0.25) {
        tags.push('适合创意表达型工作');
    }
    return tags;
}
/**
 * 推导职业匹配倾向
 */
function deriveCareerFit(chartResult) {
    const fitSystem = deriveFitSystem(chartResult);
    const fitEnterprise = deriveFitEnterprise(chartResult);
    const fitStartup = deriveFitStartup(chartResult);
    const fitFreelanceOrBiz = deriveFitFreelanceOrBiz(chartResult);
    const rolePreference = deriveRolePreference(chartResult);
    const careerFit = {
        fitSystem,
        fitEnterprise,
        fitStartup,
        fitFreelanceOrBiz,
        rolePreference,
        workStyleTags: [],
    };
    careerFit.workStyleTags = deriveWorkStyleTags(chartResult, careerFit);
    return careerFit;
}
/**
 * 推导稳定偏好
 */
function deriveStabilityPreference(chartResult) {
    const analysis = chartResult.analysis || {};
    const guancaiPattern = analysis.guancaiPattern || {};
    const stability = guancaiPattern?.stability?.career;
    const structure = analysis.structure || {};
    const W = structure.W || structure.tenGodWeights || {};
    if (stability === '稳定' || stability === '偏稳') {
        return '偏稳';
    }
    const bijieWeight = (W.bi || 0) + (W.jie || 0);
    if (bijieWeight > 0.3) {
        return '偏变动';
    }
    return '平衡';
}
/**
 * 推导矛盾处理风格
 */
function deriveConflictStyle(chartResult) {
    const analysis = chartResult.analysis || {};
    const structure = analysis.structure || {};
    const W = structure.W || structure.tenGodWeights || {};
    const dayMasterStrength = analysis.strengthAnalysis || {};
    const shishangWeight = (W.shi || 0) + (W.shang || 0);
    const bijieWeight = (W.bi || 0) + (W.jie || 0);
    const yinWeight = (W.yin || 0) + (W.zYin || 0) + (W.pYin || 0);
    const guanWeight = (W.guan || 0) + (W.zGuan || 0) + (W.sha || 0);
    const dayMasterScore = typeof dayMasterStrength.score === 'number'
        ? dayMasterStrength.score / 100
        : (dayMasterStrength.score ?? 0.5);
    const dayMasterStrong = dayMasterScore >= 0.62;
    const styles = [];
    // 强硬对抗型
    if (bijieWeight > 0.4 && dayMasterStrong) {
        styles.push('硬刚');
    }
    // 直接表达型
    if (shishangWeight > 0.4) {
        styles.push('容易说出口');
    }
    // 冷战型
    if (shishangWeight < 0.3 && bijieWeight < 0.3) {
        styles.push('容易冷战，不太会主动沟通');
    }
    // 逃避型
    if (yinWeight > 0.4 && !dayMasterStrong) {
        styles.push('容易逃避，不太愿意正面冲突');
    }
    // 规则型
    if (guanWeight > 0.4) {
        styles.push('比较注重规则和原则，容易较真');
    }
    return styles.join('、') || '平衡型';
}
/**
 * 推导与上级/规则的关系
 */
function deriveAuthorityRelationHint(chartResult) {
    const analysis = chartResult.analysis || {};
    const structure = analysis.structure || {};
    const W = structure.W || structure.tenGodWeights || {};
    const guanWeight = (W.guan || 0) + (W.zGuan || 0) + (W.sha || 0);
    const bijieWeight = (W.bi || 0) + (W.jie || 0);
    const shishangWeight = (W.shi || 0) + (W.shang || 0);
    if (guanWeight > 0.3) {
        return '比较服从规则，但可能缺乏灵活性';
    }
    if (bijieWeight > 0.3) {
        return '不太喜欢被管束，需要一定自由度';
    }
    if (shishangWeight > 0.3) {
        return '需要表达空间，不太适合过于严格的层级';
    }
    return '平衡型，能适应不同管理风格';
}
/**
 * 推导钱/成长/生活平衡
 */
function deriveMoneyVsGrowthPreference(chartResult) {
    const analysis = chartResult.analysis || {};
    const structure = analysis.structure || {};
    const W = structure.W || structure.tenGodWeights || {};
    const guancaiPattern = analysis.guancaiPattern || {};
    const incomeMode = guancaiPattern?.incomeMode?.mainMode;
    const caiWeight = W.cai || W.caiXing || 0;
    const yinWeight = (W.yin || 0) + (W.zYin || 0) + (W.pYin || 0);
    const shishangWeight = (W.shi || 0) + (W.shang || 0);
    if (caiWeight > 0.25 || incomeMode === '穩定工資型') {
        return '更看重稳定收入和财务安全';
    }
    if (yinWeight > 0.25) {
        return '更看重成长空间和学习机会';
    }
    if (shishangWeight > 0.25) {
        return '更看重工作与生活的平衡';
    }
    return '平衡型，会根据阶段调整';
}
/**
 * 推导风险提示
 */
function deriveRiskHints(chartResult, workPattern) {
    const analysis = chartResult.analysis || {};
    const guancaiPattern = analysis.guancaiPattern || {};
    const riskFactors = guancaiPattern?.riskFactors?.tags || [];
    const structure = analysis.structure || {};
    const W = structure.W || structure.tenGodWeights || {};
    const hints = [];
    // 从官财格局的风险因素中提取
    riskFactors.forEach((tag) => {
        if (tag.includes('跳槽') || tag.includes('变动') || tag.includes('不稳定')) {
            hints.push(tag);
        }
    });
    // 根据稳定偏好
    if (workPattern.stabilityPreference === '偏变动') {
        hints.push('容易情绪化裸辞');
    }
    // 根据矛盾处理风格
    if (workPattern.conflictStyle.includes('硬刚')) {
        hints.push('容易与上级产生冲突');
    }
    // 根据财星权重
    const caiWeight = W.cai || W.caiXing || 0;
    if (caiWeight > 0.3) {
        hints.push('容易只看短期钱忽略长期成长');
    }
    return hints.slice(0, 3); // 最多返回3条
}
/**
 * 推导职场模式
 */
function deriveWorkPattern(chartResult) {
    const stabilityPreference = deriveStabilityPreference(chartResult);
    const conflictStyle = deriveConflictStyle(chartResult);
    const authorityRelationHint = deriveAuthorityRelationHint(chartResult);
    const moneyVsGrowthPreference = deriveMoneyVsGrowthPreference(chartResult);
    const workPattern = {
        stabilityPreference,
        conflictStyle,
        authorityRelationHint,
        moneyVsGrowthPreference,
        riskHints: [],
    };
    workPattern.riskHints = deriveRiskHints(chartResult, workPattern);
    return workPattern;
}
/**
 * 构建行运信息
 */
function buildFortuneInfo(chartResult, now) {
    const analysis = chartResult.analysis || {};
    const luckRhythm = analysis.luckRhythm || {};
    const annualBrief = luckRhythm.annualBrief || [];
    const currentYear = now.getFullYear();
    // 当前大运节奏
    const currentLuck = luckRhythm.currentLuck?.stage ||
        luckRhythm.currentLuck?.tone ||
        '积累期';
    // 映射 favourLevel 到跳槽友好度
    function mapFavourLevelToJob(favLevel, shishen) {
        // 财星或官星为 good → golden（适合跳槽）
        if (favLevel === 'good' && (shishen === '正财' || shishen === '偏财' ||
            shishen === '正官' || shishen === '七杀')) {
            return 'golden';
        }
        if (favLevel === 'good') {
            return 'good';
        }
        if (favLevel === 'neutral') {
            return 'normal';
        }
        if (favLevel === 'bad') {
            return 'hard';
        }
        return 'normal';
    }
    // 生成跳槽窗口类型
    function generateJobWindowType(item) {
        const shishen = item.shishen || '';
        const favLevel = item.favourLevel;
        if (favLevel === 'good' && (shishen === '正财' || shishen === '偏财')) {
            return '适合跳槽抬一档';
        }
        if (favLevel === 'good' && (shishen === '正官' || shishen === '七杀')) {
            return '适合内部调整或跳槽';
        }
        if (favLevel === 'bad') {
            return '适合稳住打基础';
        }
        return '适合休整恢复';
    }
    // 生成跳槽窗口原因
    function generateJobWindowReason(item) {
        const shishen = item.shishen || '';
        if (shishen === '正财' || shishen === '偏财') {
            return '财星得力，有利职业发展和收入提升';
        }
        if (shishen === '正官' || shishen === '七杀') {
            return '官星得力，有利职位提升和机会';
        }
        return '中性年份，适合打基础';
    }
    // 提取未来 5 年的跳槽窗口
    const jobWindows = annualBrief
        .filter((item) => item.year >= currentYear && item.year <= currentYear + 5)
        .slice(0, 5)
        .map((item) => ({
        year: item.year,
        favourLevel: mapFavourLevelToJob(item.favourLevel || 'neutral', item.shishen),
        type: generateJobWindowType(item),
        reason: generateJobWindowReason(item),
    }));
    return {
        currentLuck,
        jobWindows,
    };
}
/**
 * 正则兜底提取用户计划
 */
function extractPlanWithRegex(question) {
    // 提取当前状态
    let currentStatus = '在职想观望';
    if (/已经离职|离职|失业|待业/.test(question)) {
        currentStatus = '已经离职';
    }
    else if (/强烈想走|很想跳|必须走|待不下去/.test(question)) {
        currentStatus = '在职强烈想走';
    }
    else if (/刚毕业|应届|找工作/.test(question)) {
        currentStatus = '刚毕业找工作';
    }
    // 提取行业
    let currentIndustry;
    if (/互联网|IT|软件/.test(question))
        currentIndustry = '互联网';
    if (/制造|工厂/.test(question))
        currentIndustry = '制造';
    if (/教育|教师/.test(question))
        currentIndustry = '教育';
    if (/金融|银行/.test(question))
        currentIndustry = '金融';
    if (/公务员|体制/.test(question))
        currentIndustry = '公务员';
    // 提取岗位
    let currentRole;
    if (/技术|开发|程序员/.test(question))
        currentRole = '技术';
    if (/产品/.test(question))
        currentRole = '产品';
    if (/运营/.test(question))
        currentRole = '运营';
    if (/销售/.test(question))
        currentRole = '销售';
    if (/行政/.test(question))
        currentRole = '行政';
    if (/财务|会计/.test(question))
        currentRole = '财务';
    if (/教师/.test(question))
        currentRole = '教师';
    // 提取痛点（简单提取）
    let currentPainPoints;
    const painKeywords = ['钱少', '烦人', '没成长', '太累', '压力大', '人际关系', '加班'];
    const foundPains = painKeywords.filter(keyword => question.includes(keyword));
    if (foundPains.length > 0) {
        currentPainPoints = foundPains.join('、');
    }
    // 提取是否有 offer
    const hasOffer = /有offer|收到offer|拿到offer|有新的工作/.test(question);
    // 提取目标变动类型
    let targetChangeType;
    if (/加薪|涨薪/.test(question))
        targetChangeType = '加薪跳槽';
    if (/换行业|转行/.test(question))
        targetChangeType = '换行业';
    if (/换城市|搬家/.test(question))
        targetChangeType = '换城市';
    if (/转岗位|转岗/.test(question))
        targetChangeType = '转岗位';
    if (/回老家|回家/.test(question))
        targetChangeType = '回老家';
    if (/创业|自由职业|freelance/.test(question))
        targetChangeType = '创业 / 自由职业';
    // 提取风险承受度
    let riskTolerance = '平衡';
    if (/保守|稳妥|稳定/.test(question))
        riskTolerance = '偏保守';
    if (/激进|冒险|大胆/.test(question))
        riskTolerance = '偏激进';
    return {
        currentStatus,
        currentIndustry,
        currentRole,
        currentPainPoints,
        hasOffer,
        targetChangeType,
        riskTolerance,
    };
}
/**
 * 校验提取的数据
 */
function validatePlanData(data) {
    const validStatus = ['在职想观望', '在职强烈想走', '已经离职', '刚毕业找工作'];
    const validRiskTolerance = ['偏保守', '平衡', '偏激进'];
    return (validStatus.includes(data.currentStatus) &&
        (data.currentIndustry === null || data.currentIndustry === undefined || typeof data.currentIndustry === 'string') &&
        (data.currentRole === null || data.currentRole === undefined || typeof data.currentRole === 'string') &&
        (data.currentPainPoints === null || data.currentPainPoints === undefined || typeof data.currentPainPoints === 'string') &&
        typeof data.hasOffer === 'boolean' &&
        (data.targetChangeType === null || data.targetChangeType === undefined || typeof data.targetChangeType === 'string') &&
        validRiskTolerance.includes(data.riskTolerance));
}
/**
 * 使用 LLM 提取用户工作跳槽计划信息
 *
 * 主策略：LLM + Few-Shot
 * 兜底策略：正则匹配关键字段
 */
async function extractPlanFromQuestion(question) {
    // 1. 构建 Few-Shot 示例
    const fewShotExamples = [
        {
            input: "我现在在职，想跳槽，目前在互联网做技术，觉得钱少而且太累，想换个行业",
            output: JSON.stringify({
                currentStatus: "在职想观望",
                currentIndustry: "互联网",
                currentRole: "技术",
                currentPainPoints: "钱少、太累",
                hasOffer: false,
                targetChangeType: "换行业",
                riskTolerance: "平衡"
            })
        },
        {
            input: "我已经离职了，正在找工作，有收到一个offer但还在考虑，想看看适不适合跳槽",
            output: JSON.stringify({
                currentStatus: "已经离职",
                currentIndustry: null,
                currentRole: null,
                currentPainPoints: null,
                hasOffer: true,
                targetChangeType: null,
                riskTolerance: "平衡"
            })
        },
        {
            input: "我刚毕业，在找工作，想回老家发展，比较保守",
            output: JSON.stringify({
                currentStatus: "刚毕业找工作",
                currentIndustry: null,
                currentRole: null,
                currentPainPoints: null,
                hasOffer: false,
                targetChangeType: "回老家",
                riskTolerance: "偏保守"
            })
        },
        {
            input: "我在职但强烈想走，现在做销售，压力大，想转岗位做产品，比较激进",
            output: JSON.stringify({
                currentStatus: "在职强烈想走",
                currentIndustry: null,
                currentRole: "销售",
                currentPainPoints: "压力大",
                hasOffer: false,
                targetChangeType: "转岗位",
                riskTolerance: "偏激进"
            })
        }
    ];
    // 2. 构建 LLM Prompt
    const extractionPrompt = `你是一个信息提取助手，需要从用户关于工作跳槽的问题中提取结构化信息。

## 输出格式要求

必须输出 **纯 JSON 对象**，不要包含任何其他文字。JSON 结构如下：

\`\`\`json
{
  "currentStatus": "在职想观望" | "在职强烈想走" | "已经离职" | "刚毕业找工作",
  "currentIndustry": "互联网" | "制造" | "教育" | "金融" | "公务员" 等字符串或 null,
  "currentRole": "技术" | "产品" | "运营" | "销售" | "行政" | "财务" | "教师" 等字符串或 null,
  "currentPainPoints": "文本简述当前工作里最难受的 1–3 个点" 或 null,
  "hasOffer": true | false,
  "targetChangeType": "加薪跳槽" | "换行业" | "换城市" | "转岗位" | "回老家" | "创业 / 自由职业" 或 null,
  "riskTolerance": "偏保守" | "平衡" | "偏激进"
}
\`\`\`

## Few-Shot 示例

${fewShotExamples.map((ex, i) => `
[示例 ${i + 1}]
输入: ${ex.input}
输出: ${ex.output}
`).join('\n')}

## 提取规则

1. **currentStatus**：
   - "在职"、"上班" → "在职想观望"
   - "强烈想走"、"很想跳"、"必须走" → "在职强烈想走"
   - "已经离职"、"离职"、"失业" → "已经离职"
   - "刚毕业"、"应届"、"找工作" → "刚毕业找工作"

2. **currentIndustry**：
   - 提取行业（如"互联网"、"制造"、"教育"、"金融"、"公务员"等）
   - 如果没提到 → null

3. **currentRole**：
   - 提取岗位类型（如"技术"、"产品"、"运营"、"销售"、"行政"、"财务"、"教师"等）
   - 如果没提到 → null

4. **currentPainPoints**：
   - 提取痛点（如"钱少"、"烦人"、"没成长"、"太累"、"压力大"等）
   - 如果没提到 → null

5. **hasOffer**：
   - "有offer"、"收到offer"、"拿到offer" → true
   - 如果没提到 → false

6. **targetChangeType**：
   - "加薪"、"涨薪" → "加薪跳槽"
   - "换行业"、"转行" → "换行业"
   - "换城市"、"搬家" → "换城市"
   - "转岗位"、"转岗" → "转岗位"
   - "回老家"、"回家" → "回老家"
   - "创业"、"自由职业" → "创业 / 自由职业"
   - 如果没提到 → null

7. **riskTolerance**：
   - "保守"、"稳妥"、"稳定" → "偏保守"
   - "激进"、"冒险"、"大胆" → "偏激进"
   - 如果没提到 → "平衡"（默认值）

## 用户问题

${question}

## 输出（只输出 JSON，不要其他文字）

`;
    try {
        // 3. 调用 LLM
        const defaultModel = await aiService.getDefaultModel();
        const response = await aiService.chat({
            model: defaultModel,
            request: {
                messages: [
                    {
                        role: 'system',
                        content: '你是一个信息提取助手，严格按照要求输出 JSON 格式。'
                    },
                    {
                        role: 'user',
                        content: extractionPrompt
                    }
                ],
                temperature: 0.3, // 降低温度，提高准确性
                maxTokens: 500
            }
        });
        // 4. 解析 JSON
        const content = response.content.trim();
        // 移除可能的 markdown 代码块标记
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            // 5. 本地校验
            if (validatePlanData(parsed)) {
                return {
                    currentStatus: parsed.currentStatus,
                    currentIndustry: parsed.currentIndustry || undefined,
                    currentRole: parsed.currentRole || undefined,
                    currentPainPoints: parsed.currentPainPoints || undefined,
                    hasOffer: parsed.hasOffer || false,
                    targetChangeType: parsed.targetChangeType || undefined,
                    riskTolerance: parsed.riskTolerance || '平衡',
                };
            }
        }
        // 6. LLM 失败，使用正则兜底
        console.warn('[JobChange] LLM extraction failed or validation failed, using regex fallback');
        return extractPlanWithRegex(question);
    }
    catch (error) {
        console.error('[JobChange] LLM extraction failed, using regex fallback:', error);
        return extractPlanWithRegex(question);
    }
}
/**
 * 获取默认计划
 */
function getDefaultPlan() {
    return {
        currentStatus: '在职想观望',
        hasOffer: false,
        riskTolerance: '平衡',
    };
}
/**
 * 提取辅助分析信息
 */
function extractExtraInfo(chartResult) {
    const analysis = chartResult.analysis || {};
    const guancaiPattern = analysis.guancaiPattern || {};
    return {
        careerSummary: guancaiPattern?.careerPattern?.structureTag ||
            `${analysis.structure?.name || '未知格局'}，${analysis.yongshenPattern?.summary || ''}`,
        wealthSummary: guancaiPattern?.wealthPattern?.wealthType ||
            `${analysis.structure?.name || '未知格局'}，财运${guancaiPattern?.wealthPattern?.strength?.level || '未知'}`,
        energyFlowSummary: analysis.energyFlow?.summary || '',
    };
}
/**
 * 判断模式
 */
function detectMode(plan) {
    if (plan.currentStatus === '已经离职') {
        return 'betweenJobs';
    }
    if (plan.currentStatus === '刚毕业找工作') {
        return 'student';
    }
    if (plan.targetChangeType === '创业 / 自由职业') {
        return 'freelance';
    }
    if (plan.targetChangeType?.includes('创业')) {
        return 'business';
    }
    return 'working';
}
/**
 * 判断职业阶段提示
 */
function deriveCareerStageHint(chartResult, now) {
    const analysis = chartResult.analysis || {};
    const luckRhythm = analysis.luckRhythm || {};
    const currentAge = luckRhythm.currentAge || 0;
    if (currentAge < 25) {
        return '刚毕业 1–3 年';
    }
    else if (currentAge < 30) {
        return '工作 5–10 年';
    }
    else {
        return '工作 10 年以上';
    }
}
/**
 * 从命盘结果中构建 JobChangeChatContext
 *
 * @param params 参数对象
 * @param params.chartResult 命盘分析结果（来自 engine）
 * @param params.gender 性别（从 chart_profiles 表获取）
 * @param params.userQuestion 用户问题（用于提取计划）
 * @param params.now 当前时间（用于计算当前年份，可选）
 * @returns JobChangeChatContext
 */
async function buildJobChangeChatContext(params) {
    const { chartResult, gender, userQuestion, now = new Date() } = params;
    // 1. 提取基础信息
    const basic = extractBasicInfo(chartResult);
    // 2. 推导职业匹配倾向
    const careerFit = deriveCareerFit(chartResult);
    // 3. 推导职场模式
    const workPattern = deriveWorkPattern(chartResult);
    // 4. 构建行运信息
    const fortune = buildFortuneInfo(chartResult, now);
    // 5. 提取用户计划（使用 LLM 或默认值）
    const plan = userQuestion
        ? await extractPlanFromQuestion(userQuestion)
        : getDefaultPlan();
    // 6. 提取辅助分析信息
    const extra = extractExtraInfo(chartResult);
    // 7. 判断模式和职业阶段
    const mode = detectMode(plan);
    const careerStageHint = deriveCareerStageHint(chartResult, now);
    // 8. 获取当前年龄
    const analysis = chartResult.analysis || {};
    const luckRhythm = analysis.luckRhythm || {};
    const age = luckRhythm.currentAge || 0;
    return {
        mode,
        meta: {
            selfGender: gender,
            currentYear: now.getFullYear(),
            age,
            careerStageHint,
        },
        basic,
        careerFit,
        workPattern,
        fortune,
        plan,
        extra,
    };
}
//# sourceMappingURL=jobChangeContextBuilder.js.map