/**
 * 婆媳关系聊天上下文类型定义
 *
 * 对应 XIAOPEI_PROMPT_INLAW 中描述的字段结构
 *
 * 结构基本等同于 LoveChatContext + 宫位六亲卡的 extra 字段
 */
/**
 * 婆媳关系聊天上下文
 */
export interface InLawChatContext {
    /** 元数据 */
    meta: {
        /** 命盘性别 */
        selfGender: 'male' | 'female' | 'unknown';
        /** 当前公历年 */
        currentYear: number;
    };
    /** 命盘基础信息 */
    basic: {
        /** 日主及五行（如"丙火"） */
        dayMaster: string;
        /** 日主强弱评分、等级与说明 */
        dayMasterStrength: {
            score: number;
            level: string;
            description: string;
        };
        /** 格局名称、置信度与十神权重 */
        structure: {
            name: string;
            confidence?: number;
            weights: {
                guan: number;
                cai: number;
                shishang: number;
                bijie: number;
                yin: number;
            };
        };
        /** 喜用五行、忌神五行与简要说明 */
        yongshen: {
            like: string[];
            dislike: string[];
            summary: string;
        };
        /** 五行分布（木火土金水的比例） */
        wuxing: {
            木: number;
            火: number;
            土: number;
            金: number;
            水: number;
        };
    };
    /** 配偶星与表达方式 */
    spouseAndExpression: {
        /** 配偶星类型：财星（男命妻星）或 官杀（女命夫星） */
        spouseStarType: '财星' | '官杀';
        /** 配偶星分布位置的文字说明 */
        spouseStarDistribution: string;
        /** 配偶星强弱、是否混杂、是否被克冲等 */
        spouseStarStatus: {
            strength: string;
            mixed: boolean;
            conflict: boolean;
            description: string;
        };
        /** 感情表达方式的提示 */
        expressionHints: string[];
    };
    /** 宫位与环境 */
    palace: {
        /** 日支（配偶宫） */
        spouseBranch: string;
        /** 配偶宫与其他地支的关系 */
        relations: {
            he: string[];
            sanhe: string[];
            chong: string[];
            xing: string[];
            hai: string[];
        };
        /** 关于恋爱环境的提示 */
        loveEnvironmentNotes: string;
    };
    /** 清浊、调候与承载力 */
    patternAndBearing: {
        /** 命局清浊等级 */
        purityLevel: string;
        /** 调候分析中与整体气场、情绪平衡相关的结论 */
        tiaoHouSummary: string;
        /** 体用分析中与承载压力、现实负担、内心底盘相关的结论 */
        tiYongSummary: string;
        /** 可能影响感情的风险提示 */
        riskHints: string[];
    };
    /** 时间维度：大运/流年 */
    fortune: {
        /** 当前大运信息 */
        currentLuck: {
            ganzhi: string;
            ageRange: string;
            favourLevel: number;
            rhythmDescription: string;
        };
        /** 流年信息 */
        years: Array<{
            year: number;
            ganzhi: string;
            tenGodToDay: string;
            favLevel: number;
            branchRelationsToSpousePalace: string[];
        }>;
    };
    /** 从其他卡片抽象过来的总结（可选） */
    extra: {
        /** 能量流通分析中可用于理解情绪、沟通、关系链条的内容 */
        energyFlowSummary?: string;
        /** 官财格局中与「感情和现实、事业与感情平衡」相关的内容 */
        guancaiSummary?: string;
        /** 命格总评中可以帮助理解感情特质的那部分内容 */
        minggeSummary?: string;
    };
}
//# sourceMappingURL=inlaw.d.ts.map