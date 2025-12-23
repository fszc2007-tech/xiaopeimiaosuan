/**
 * 投资理财聊天上下文类型定义
 *
 * 对应 XIAOPEI_PROMPT_INVEST 中描述的字段结构
 */
import { TenGodWeightsAgg, WuXingPercent } from './common';
/**
 * 投资理财聊天上下文
 */
export interface InvestChatContext {
    /** 元数据 */
    meta: {
        /** 命盘性别 */
        selfGender: 'male' | 'female' | 'unknown';
        /** 当前公历年 */
        currentYear: number;
        /** 当前年龄 */
        age: number;
        /** 本轮问题重心（从用户问题提取，V1 必须有兜底值） */
        concernType: string;
        /** 风险承受力总体判断（问题 + 命盘综合，userQuestion 为空时允许 undefined） */
        riskToleranceHint?: '偏保守' | '中性' | '偏进取';
    };
    /** 命盘基础信息（完全复用现有结构） */
    basic: {
        /** 日主及五行（如"丙火"） */
        dayMaster: string;
        /** 日主强弱评分、等级与说明 */
        dayMasterStrength: {
            score: number;
            level: string;
            description: string;
        };
        /** 格局名称、置信度与十神权重（复用公共类型） */
        structure: {
            name: string;
            confidence?: number;
            weights: TenGodWeightsAgg;
        };
        /** 喜用五行、忌神五行与简要说明 */
        yongshen: {
            like: string[];
            dislike: string[];
            summary: string;
        };
        /** 五行分布（使用公共类型） */
        wuxing: WuXingPercent;
    };
    /** 财富相关总结（优先使用现有 summary） */
    wealth: {
        /** 官财格局总结（直接使用 guancaiPattern.summary，如果有） */
        guancaiSummary?: string;
        /** 财富总结（优先用 wealthPattern.summary，否则从 wealthType + strength.level 组合） */
        wealthSummary?: string;
        /** 事业总结（从 careerPattern.structureTag 获取） */
        careerSummary?: string;
    };
    /** 时间维度：行运与财富窗口 */
    fortune: {
        /** 行运节奏总结（从 luckRhythm.currentLuck.tone 或 stage 获取） */
        luckRhythmSummary?: string;
        /** 财富时间窗口（V1 用极简映射，只取最近 5-7 年） */
        wealthWindows?: Array<{
            year: number;
            favourLevel: 'golden' | 'good' | 'normal' | 'hard';
            type: string;
            reason: string;
        }>;
    };
    /** 其他卡片的补充总结（允许为空） */
    extra: {
        /** 能量流通总结（直接使用 energyFlow.summary） */
        energyFlowSummary?: string;
        /** 关系与金钱互动（如果有宫位/家庭相关 summary 就用，否则 undefined） */
        relationshipSummary?: string;
        /** 家庭对金钱观的影响（如果有就用，否则 undefined，不要硬抠） */
        familySummary?: string;
        /** 命格总评（直接使用 minggeSummary.summary，让 LLM 自己抓取相关部分） */
        minggeSummary?: string;
    };
}
//# sourceMappingURL=invest.d.ts.map