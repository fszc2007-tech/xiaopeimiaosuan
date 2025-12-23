"use strict";
/**
 * 考试聊天上下文构建器
 *
 * 从命盘结果中提取并构建 ExamChatContext
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
exports.buildExamChatContext = buildExamChatContext;
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
 * 推导学习天赋等级
 */
function deriveStudyTalentLevel(chartResult) {
    const analysis = chartResult.analysis || {};
    const structure = analysis.structure || {};
    const W = structure.W || structure.tenGodWeights || {};
    const strength = analysis.strengthAnalysis || {};
    const yinWeight = (W.yin || 0) + (W.zYin || 0) + (W.pYin || 0);
    const structureName = structure.name || '';
    const strengthLabel = strength.label || strength.band || '';
    if (yinWeight > 0.3 && (strengthLabel === '身弱' || strengthLabel === '平衡')) {
        return '很强';
    }
    else if (yinWeight > 0.2 || structureName.includes('印')) {
        return '较强';
    }
    else if (yinWeight > 0.1) {
        return '普通';
    }
    else {
        return '偏弱';
    }
}
/**
 * 推导学习风格
 */
function deriveFocusStyle(chartResult) {
    const analysis = chartResult.analysis || {};
    const structure = analysis.structure || {};
    const W = structure.W || structure.tenGodWeights || {};
    const yinWeight = (W.yin || 0) + (W.zYin || 0) + (W.pYin || 0);
    const shishangWeight = (W.shi || 0) + (W.shang || 0);
    const bijieWeight = (W.bi || 0) + (W.jie || 0);
    const guanWeight = (W.guan || 0) + (W.zGuan || 0) + (W.sha || 0);
    if (yinWeight > 0.25) {
        return '理解型';
    }
    else if (shishangWeight > 0.25) {
        return '实践型';
    }
    else if (bijieWeight > 0.3) {
        return '易分心';
    }
    else if (guanWeight > 0.2) {
        return '记忆型';
    }
    else {
        return '综合型';
    }
}
/**
 * 推导压力承受力
 */
function deriveStressResistance(chartResult) {
    const analysis = chartResult.analysis || {};
    const strength = analysis.strengthAnalysis || {};
    const structure = analysis.structure || {};
    const strengthLabel = strength.label || strength.band || '';
    const structureName = structure.name || '';
    if (strengthLabel === '从强' || strengthLabel === '从弱' ||
        structureName.includes('从') || structureName.includes('化气')) {
        return '较强';
    }
    else if (strengthLabel === '身强' || strengthLabel === '平衡') {
        return '较强';
    }
    else {
        return '偏弱';
    }
}
/**
 * 推导坚持度
 */
function derivePersistenceLevel(chartResult) {
    const analysis = chartResult.analysis || {};
    const structure = analysis.structure || {};
    const W = structure.W || structure.tenGodWeights || {};
    const yinWeight = (W.yin || 0) + (W.zYin || 0) + (W.pYin || 0);
    const bijieWeight = (W.bi || 0) + (W.jie || 0);
    const purity = structure.patternPurity?.level;
    if (yinWeight > 0.25 && purity === '真') {
        return '能长期坚持';
    }
    else if (bijieWeight > 0.3) {
        return '容易放弃';
    }
    else {
        return '波动型';
    }
}
/**
 * 推导考试基础友好度
 */
function deriveExamLuckBaseline(chartResult) {
    const analysis = chartResult.analysis || {};
    const structure = analysis.structure || {};
    const W = structure.W || structure.tenGodWeights || {};
    const yongshenPattern = analysis.yongshenPattern || {};
    const yongshen = yongshenPattern.mainYongshen?.elements || yongshenPattern.mainYongshen || [];
    const guanWeight = (W.guan || 0) + (W.zGuan || 0) + (W.sha || 0);
    const yinWeight = (W.yin || 0) + (W.zYin || 0) + (W.pYin || 0);
    // 简化判断：官星多为金水，印星多为木火
    const guanIsFavored = Array.isArray(yongshen) &&
        (yongshen.includes('金') || yongshen.includes('水'));
    const yinIsFavored = Array.isArray(yongshen) &&
        (yongshen.includes('木') || yongshen.includes('火'));
    if ((guanWeight > 0.2 && guanIsFavored) || (yinWeight > 0.25 && yinIsFavored)) {
        return '略占优势';
    }
    else if (guanWeight > 0.15 || yinWeight > 0.2) {
        return '中性';
    }
    else {
        return '不占优势';
    }
}
/**
 * 推导学习与心理特质
 */
function deriveTalentInfo(chartResult) {
    return {
        studyTalentLevel: deriveStudyTalentLevel(chartResult),
        focusStyle: deriveFocusStyle(chartResult),
        stressResistance: deriveStressResistance(chartResult),
        persistenceLevel: derivePersistenceLevel(chartResult),
        examLuckBaseline: deriveExamLuckBaseline(chartResult),
    };
}
/**
 * 推导适合学术/研究程度
 */
function deriveFitAcademia(chartResult) {
    const analysis = chartResult.analysis || {};
    const structure = analysis.structure || {};
    const W = structure.W || structure.tenGodWeights || {};
    const structureName = structure.name || '';
    const yongshenPattern = analysis.yongshenPattern || {};
    const yongshen = yongshenPattern.mainYongshen?.elements || yongshenPattern.mainYongshen || [];
    const yinWeight = (W.yin || 0) + (W.zYin || 0) + (W.pYin || 0);
    const shiWeight = W.shi || 0;
    if (yinWeight > 0.3 || structureName.includes('印') ||
        (shiWeight > 0.2 && structureName.includes('食神'))) {
        return '高';
    }
    else if (yinWeight > 0.2) {
        return '中';
    }
    else {
        return '低';
    }
}
/**
 * 推导适合体制/公职程度
 */
function deriveFitCivilService(chartResult) {
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
 * 推导核心标签
 */
function deriveCoreTags(chartResult, direction) {
    const analysis = chartResult.analysis || {};
    const structure = analysis.structure || {};
    const W = structure.W || structure.tenGodWeights || {};
    const talent = deriveTalentInfo(chartResult);
    const tags = [];
    if (direction.fitCivilService === '高') {
        tags.push('适合体制内');
    }
    if (direction.fitAcademia === '高') {
        tags.push('适合专业技术岗');
    }
    if ((W.bi || 0) + (W.jie || 0) < 0.2 && (W.cai || 0) < 0.2) {
        tags.push('不喜复杂人情');
    }
    if (talent.persistenceLevel === '能长期坚持') {
        tags.push('能熬长期备考');
    }
    return tags;
}
/**
 * 推导职业路径倾向
 */
function deriveDirectionInfo(chartResult) {
    const fitAcademia = deriveFitAcademia(chartResult);
    const fitCivilService = deriveFitCivilService(chartResult);
    const fitEnterprise = deriveFitEnterprise(chartResult);
    const direction = {
        fitAcademia,
        fitCivilService,
        fitEnterprise,
        coreTags: [],
    };
    direction.coreTags = deriveCoreTags(chartResult, direction);
    return direction;
}
/**
 * 构建时间轴信息
 */
function buildTimelineInfo(chartResult, now) {
    const analysis = chartResult.analysis || {};
    const luckRhythm = analysis.luckRhythm || {};
    const annualBrief = luckRhythm.annualBrief || [];
    const currentYear = now.getFullYear();
    const currentAge = luckRhythm.currentAge || 0;
    // 当前大运节奏
    const currentLuckLabel = luckRhythm.currentLuck?.stage ||
        luckRhythm.currentLuck?.tone ||
        '积累期';
    // 映射 favourLevel 到考试友好度
    function mapFavourLevelToExam(favLevel, shishen) {
        // 如果是官星或印星，且 favLevel 为 good，则可能是 golden
        if (favLevel === 'good' && (shishen === '正官' || shishen === '正印' || shishen === '偏印')) {
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
    // 生成考试原因
    function generateExamReason(item) {
        const shishen = item.shishen || '';
        if (shishen === '正官' || shishen === '正印') {
            return '官印得力，有利考试与选拔';
        }
        if (shishen === '七杀') {
            return '压力大但有逼迫力';
        }
        return '中性年份，适合打基础';
    }
    // 提取未来 5 年的考试窗口
    const examWindows = annualBrief
        .filter((item) => item.year >= currentYear && item.year <= currentYear + 5)
        .slice(0, 5)
        .map((item) => ({
        year: item.year,
        favourLevel: mapFavourLevelToExam(item.favourLevel || 'neutral', item.shishen),
        reason: generateExamReason(item),
    }));
    return {
        currentYear,
        currentAge,
        currentLuckLabel,
        examWindows,
    };
}
/**
 * 正则兜底提取用户计划
 */
function extractPlanWithRegex(question) {
    // 提取目标类型
    const hasPostgrad = /考研|研究生|学硕|专硕/.test(question);
    const hasCivil = /考公|公务员|事业编|体制/.test(question);
    const targetType = hasPostgrad && hasCivil ? '都在考虑' :
        hasPostgrad ? '考研' :
            hasCivil ? '考公' :
                /资格证|证书/.test(question) ? '其他考试' : '还没想好';
    // 提取目标年份
    const yearMatch = question.match(/(\d{4})年/);
    const targetYear = yearMatch ? parseInt(yearMatch[1]) : undefined;
    // 提取目标级别（简单匹配）
    let targetLevel;
    if (/双一流|985|211/.test(question))
        targetLevel = '双一流学硕';
    if (/学硕/.test(question))
        targetLevel = '学硕';
    if (/专硕/.test(question))
        targetLevel = '专硕';
    if (/国考/.test(question))
        targetLevel = '国考';
    if (/省考/.test(question))
        targetLevel = '省考';
    if (/事业编/.test(question))
        targetLevel = '事业编';
    // 提取考试次数
    let attempts = 0;
    if (/第二次|二战/.test(question))
        attempts = 1;
    if (/第三次|三战/.test(question))
        attempts = 2;
    const attemptMatch = question.match(/第(\d+)次/);
    if (attemptMatch) {
        attempts = parseInt(attemptMatch[1]) - 1;
    }
    // 提取状态
    const status = /在校|上学/.test(question) ? '在校备考' :
        /在职|上班/.test(question) ? '在职备考' :
            /全职|辞职/.test(question) ? '全职备考' : '观望阶段';
    // 提取时间预算
    let timeBudgetPerDay = '3-5小时';
    if (/少于3小时|1-2小时|1小时|2小时/.test(question)) {
        timeBudgetPerDay = '少于3小时';
    }
    else if (/5小时以上|6小时|全天|8小时/.test(question)) {
        timeBudgetPerDay = '5小时以上';
    }
    // 提取财务压力
    let financialPressure = '中';
    if (/经济压力大|缺钱|负债|经济困难/.test(question)) {
        financialPressure = '重';
    }
    else if (/经济压力小|不差钱|经济宽裕/.test(question)) {
        financialPressure = '轻';
    }
    // 提取家庭支持
    let familySupport = '未知';
    if (/家里支持|家人支持|支持我/.test(question)) {
        familySupport = '支持';
    }
    else if (/家里反对|家人反对|不支持/.test(question)) {
        familySupport = '反对';
    }
    else if (/家里中立|无所谓/.test(question)) {
        familySupport = '中立';
    }
    return {
        targetType,
        targetYear,
        targetLevel,
        attempts,
        status,
        timeBudgetPerDay,
        financialPressure,
        familySupport,
    };
}
/**
 * 校验提取的数据
 */
function validatePlanData(data) {
    const validTargetTypes = ['考研', '考公', '都在考虑', '其他考试', '还没想好'];
    const validStatus = ['在校备考', '在职备考', '全职备考', '观望阶段'];
    const validTimeBudget = ['少于3小时', '3-5小时', '5小时以上'];
    const validFinancialPressure = ['轻', '中', '重'];
    const validFamilySupport = ['支持', '中立', '反对', '未知'];
    return (validTargetTypes.includes(data.targetType) &&
        (data.targetYear === null || data.targetYear === undefined ||
            (typeof data.targetYear === 'number' && data.targetYear >= 2020 && data.targetYear <= 2050)) &&
        (data.targetLevel === null || data.targetLevel === undefined || typeof data.targetLevel === 'string') &&
        typeof data.attempts === 'number' && data.attempts >= 0 &&
        validStatus.includes(data.status) &&
        validTimeBudget.includes(data.timeBudgetPerDay) &&
        validFinancialPressure.includes(data.financialPressure) &&
        validFamilySupport.includes(data.familySupport));
}
/**
 * 使用 LLM 提取用户考试计划信息
 *
 * 主策略：LLM + Few-Shot
 * 兜底策略：正则匹配关键字段
 */
async function extractPlanFromQuestion(question) {
    // 1. 构建 Few-Shot 示例
    const fewShotExamples = [
        {
            input: "我想考研，目标是2026年上岸，现在还在上学，每天能学3-5小时",
            output: JSON.stringify({
                targetType: "考研",
                targetYear: 2026,
                targetLevel: null,
                attempts: 0,
                status: "在校备考",
                timeBudgetPerDay: "3-5小时",
                financialPressure: "轻",
                familySupport: "未知"
            })
        },
        {
            input: "我在考虑考公，已经考过一次了，现在在职，每天只能学少于3小时，家里经济压力比较大",
            output: JSON.stringify({
                targetType: "考公",
                targetYear: null,
                targetLevel: null,
                attempts: 1,
                status: "在职备考",
                timeBudgetPerDay: "少于3小时",
                financialPressure: "重",
                familySupport: "未知"
            })
        },
        {
            input: "考研和考公都在考虑，还没想好，现在全职备考，家里支持",
            output: JSON.stringify({
                targetType: "都在考虑",
                targetYear: null,
                targetLevel: null,
                attempts: 0,
                status: "全职备考",
                timeBudgetPerDay: "5小时以上",
                financialPressure: "轻",
                familySupport: "支持"
            })
        },
        {
            input: "我想考双一流学硕，2027年冲刺，已经考过2次了",
            output: JSON.stringify({
                targetType: "考研",
                targetYear: 2027,
                targetLevel: "双一流学硕",
                attempts: 2,
                status: "观望阶段",
                timeBudgetPerDay: "3-5小时",
                financialPressure: "中",
                familySupport: "未知"
            })
        }
    ];
    // 2. 构建 LLM Prompt
    const extractionPrompt = `你是一个信息提取助手，需要从用户关于考试的问题中提取结构化信息。

## 输出格式要求

必须输出 **纯 JSON 对象**，不要包含任何其他文字。JSON 结构如下：

\`\`\`json
{
  "targetType": "考研" | "考公" | "都在考虑" | "其他考试" | "还没想好",
  "targetYear": 数字年份（如 2026）或 null,
  "targetLevel": "双一流学硕" | "普通一本专硕" | "国考" | "省考" | "事业编" | "资格证" 等字符串或 null,
  "attempts": 数字（0, 1, 2+）,
  "status": "在校备考" | "在职备考" | "全职备考" | "观望阶段",
  "timeBudgetPerDay": "少于3小时" | "3-5小时" | "5小时以上",
  "financialPressure": "轻" | "中" | "重",
  "familySupport": "支持" | "中立" | "反对" | "未知"
}
\`\`\`

## Few-Shot 示例

${fewShotExamples.map((ex, i) => `
[示例 ${i + 1}]
输入: ${ex.input}
输出: ${ex.output}
`).join('\n')}

## 提取规则

1. **targetType**：
   - 如果明确提到"考研"、"研究生"、"学硕"、"专硕" → "考研"
   - 如果明确提到"考公"、"公务员"、"事业编"、"体制" → "考公"
   - 如果同时提到两者 → "都在考虑"
   - 如果提到"资格证"、"证书"等 → "其他考试"
   - 如果完全没提到 → "还没想好"

2. **targetYear**：
   - 提取明确的年份（如"2026年"、"明年"需要转换为具体年份）
   - 如果没提到 → null

3. **targetLevel**：
   - 提取具体级别（如"双一流"、"学硕"、"国考"、"省考"等）
   - 如果没提到 → null

4. **attempts**：
   - 提取考试次数（"第一次" → 0，"第二次" → 1，"第三次" → 2）
   - 如果没提到 → 0

5. **status**：
   - "在校"、"上学" → "在校备考"
   - "在职"、"上班" → "在职备考"
   - "全职"、"辞职" → "全职备考"
   - 如果没提到 → "观望阶段"

6. **timeBudgetPerDay**：
   - "少于3小时"、"1-2小时" → "少于3小时"
   - "3-5小时"、"4小时" → "3-5小时"
   - "5小时以上"、"6小时"、"全天" → "5小时以上"
   - 如果没提到 → "3-5小时"（默认值）

7. **financialPressure**：
   - "经济压力大"、"缺钱"、"负债" → "重"
   - "经济压力一般"、"还行" → "中"
   - "经济压力小"、"不差钱" → "轻"
   - 如果没提到 → "中"（默认值）

8. **familySupport**：
   - "家里支持"、"家人支持" → "支持"
   - "家里反对"、"家人反对" → "反对"
   - "家里中立"、"无所谓" → "中立"
   - 如果没提到 → "未知"

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
                    targetType: parsed.targetType,
                    targetYear: parsed.targetYear || undefined,
                    targetLevel: parsed.targetLevel || undefined,
                    attempts: parsed.attempts || 0,
                    status: parsed.status,
                    timeBudgetPerDay: parsed.timeBudgetPerDay,
                    financialPressure: parsed.financialPressure,
                    familySupport: parsed.familySupport,
                };
            }
        }
        // 6. LLM 失败，使用正则兜底
        console.warn('[Exam] LLM extraction failed or validation failed, using regex fallback');
        return extractPlanWithRegex(question);
    }
    catch (error) {
        console.error('[Exam] LLM extraction failed, using regex fallback:', error);
        return extractPlanWithRegex(question);
    }
}
/**
 * 获取默认计划
 */
function getDefaultPlan() {
    return {
        targetType: '还没想好',
        targetYear: undefined,
        targetLevel: undefined,
        attempts: 0,
        status: '观望阶段',
        timeBudgetPerDay: '3-5小时',
        financialPressure: '中',
        familySupport: '未知',
    };
}
/**
 * 提取辅助分析信息
 */
function extractExtraInfo(chartResult) {
    const analysis = chartResult.analysis || {};
    const dayMaster = analysis.dayMaster || {};
    const structure = analysis.structure || {};
    const strength = analysis.strengthAnalysis || {};
    return {
        chartOneLine: analysis.minggeSummary?.summary ||
            `${dayMaster.gan || ''}${dayMaster.wuxing || ''}日主，${structure.name || '未知格局'}，${strength.label || strength.band || ''}`,
        careerOneLine: analysis.guancaiPattern?.summary ||
            `${structure.name || '未知格局'}，${analysis.yongshenPattern?.summary || ''}`,
        energyFlowSummary: analysis.energyFlow?.summary || analysis.dogong?.summary || '',
        luckRhythmSummary: analysis.luckRhythm?.currentLuck?.tone ||
            analysis.luckRhythm?.currentLuck?.stage || '',
    };
}
/**
 * 判断主题类型
 */
function detectTopic(question, plan) {
    const hasPostgrad = /考研|研究生|学硕|专硕/.test(question) || plan.targetType === '考研';
    const hasCivil = /考公|公务员|事业编|体制/.test(question) || plan.targetType === '考公';
    if (hasPostgrad && hasCivil) {
        return 'both';
    }
    else if (hasPostgrad) {
        return 'postgrad';
    }
    else if (hasCivil) {
        return 'civil';
    }
    else {
        return 'other';
    }
}
/**
 * 判断年龄段提示
 */
function deriveAgeStageHint(chartResult, now) {
    const analysis = chartResult.analysis || {};
    const luckRhythm = analysis.luckRhythm || {};
    const currentAge = luckRhythm.currentAge || 0;
    if (currentAge < 25) {
        return '在校阶段';
    }
    else if (currentAge < 30) {
        return '初入职场';
    }
    else {
        return '工作多年';
    }
}
/**
 * 判断模式
 */
function detectMode(plan, topic) {
    if (topic === 'postgrad') {
        return 'postgrad';
    }
    else if (topic === 'civil') {
        return 'civil';
    }
    else if (topic === 'both') {
        return 'exam';
    }
    else {
        return 'other';
    }
}
/**
 * 从命盘结果中构建 ExamChatContext
 *
 * @param params 参数对象
 * @param params.chartResult 命盘分析结果（来自 engine）
 * @param params.gender 性别（从 chart_profiles 表获取）
 * @param params.userQuestion 用户问题（用于提取计划）
 * @param params.now 当前时间（用于计算当前年份，可选）
 * @returns ExamChatContext
 */
async function buildExamChatContext(params) {
    const { chartResult, gender, userQuestion, now = new Date() } = params;
    // 1. 提取基础信息
    const basic = extractBasicInfo(chartResult);
    // 2. 推导学习与心理特质
    const talent = deriveTalentInfo(chartResult);
    // 3. 推导职业路径倾向
    const direction = deriveDirectionInfo(chartResult);
    // 4. 构建时间轴信息
    const timeline = buildTimelineInfo(chartResult, now);
    // 5. 提取用户计划（使用 LLM 或默认值）
    const plan = userQuestion
        ? await extractPlanFromQuestion(userQuestion)
        : getDefaultPlan();
    // 6. 提取辅助分析信息
    const extra = extractExtraInfo(chartResult);
    // 7. 判断主题和模式
    const topic = detectTopic(userQuestion || '', plan);
    const mode = detectMode(plan, topic);
    const ageStageHint = deriveAgeStageHint(chartResult, now);
    return {
        mode,
        meta: {
            selfGender: gender,
            currentYear: now.getFullYear(),
            topic,
            ageStageHint,
        },
        basic,
        talent,
        direction,
        timeline,
        plan,
        extra,
    };
}
//# sourceMappingURL=examContextBuilder.js.map