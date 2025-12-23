/**
 * 考试聊天上下文类型定义
 *
 * 对应 XIAOPEI_PROMPT_EXAM 中描述的字段结构
 */
/**
 * 考试聊天上下文
 */
export interface ExamChatContext {
    /** 模式：考试类型 */
    mode: 'exam' | 'postgrad' | 'civil' | 'other';
    /** 元数据 */
    meta: {
        /** 命盘性别 */
        selfGender: 'male' | 'female' | 'unknown';
        /** 当前公历年 */
        currentYear: number;
        /** 本轮对话的主要主题 */
        topic: 'postgrad' | 'civil' | 'both' | 'other';
        /** 年龄段提示 */
        ageStageHint: string;
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
    /** 学习与心理特质 */
    talent: {
        /** 学习天赋等级 */
        studyTalentLevel: '偏弱' | '普通' | '较强' | '很强';
        /** 学习风格 */
        focusStyle: string;
        /** 压力承受力 */
        stressResistance: '偏弱' | '中等' | '较强';
        /** 坚持度 */
        persistenceLevel: '容易放弃' | '波动型' | '能长期坚持';
        /** 考试基础友好度 */
        examLuckBaseline: string;
    };
    /** 职业路径倾向 */
    direction: {
        /** 适合学术/研究/专业技术深造（偏考研） */
        fitAcademia: '低' | '中' | '高';
        /** 适合体制、公职、机关单位（偏考公） */
        fitCivilService: '低' | '中' | '高';
        /** 适合企业、市场化环境 */
        fitEnterprise: '低' | '中' | '高';
        /** 关键标签 */
        coreTags: string[];
    };
    /** 时间轴：与考试相关的 3–5 年窗口 */
    timeline: {
        /** 当前年份 */
        currentYear: number;
        /** 当前年龄 */
        currentAge: number;
        /** 当前大运节奏简述 */
        currentLuckLabel: string;
        /** 考试窗口年份 */
        examWindows: Array<{
            year: number;
            favourLevel: 'golden' | 'good' | 'normal' | 'hard';
            reason: string;
        }>;
    };
    /** 用户当前计划与现实约束（可选，从用户问题中提取或默认值） */
    plan: {
        /** 目标类型 */
        targetType: '考研' | '考公' | '都在考虑' | '其他考试' | '还没想好';
        /** 目标年份 */
        targetYear?: number;
        /** 目标级别 */
        targetLevel?: string;
        /** 已参与考试次数 */
        attempts: number;
        /** 当前状态 */
        status: '在校备考' | '在职备考' | '全职备考' | '观望阶段';
        /** 每日时间预算 */
        timeBudgetPerDay: '少于3小时' | '3-5小时' | '5小时以上';
        /** 财务压力 */
        financialPressure: '轻' | '中' | '重';
        /** 家庭支持 */
        familySupport: '支持' | '中立' | '反对' | '未知';
    };
    /** 从其他卡片抽象过来的总结（可选） */
    extra: {
        /** 命局一句话总结 */
        chartOneLine?: string;
        /** 事业/官财一句话总结 */
        careerOneLine?: string;
        /** 能量流通中与学习节奏、压力转换有关的内容 */
        energyFlowSummary?: string;
        /** 行运节奏中关于"人生练的课题"对考试的影响简述 */
        luckRhythmSummary?: string;
    };
}
//# sourceMappingURL=exam.d.ts.map