/**
 * 工作跳槽聊天上下文类型定义
 *
 * 对应 XIAOPEI_PROMPT_JOB_CHANGE 中描述的字段结构
 */
/**
 * 工作跳槽聊天上下文
 */
export interface JobChangeChatContext {
    /** 模式：工作状态 */
    mode: 'working' | 'betweenJobs' | 'student' | 'freelance' | 'business';
    /** 元数据 */
    meta: {
        /** 命盘性别 */
        selfGender: 'male' | 'female' | 'unknown';
        /** 当前公历年 */
        currentYear: number;
        /** 当前年龄 */
        age: number;
        /** 职业阶段提示 */
        careerStageHint: string;
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
    /** 职业匹配倾向 */
    careerFit: {
        /** 适合体制/大机构稳定路线 */
        fitSystem: '低' | '中' | '高';
        /** 适合企业/市场化环境 */
        fitEnterprise: '低' | '中' | '高';
        /** 适合小公司/创业/不确定性高环境 */
        fitStartup: '低' | '中' | '高';
        /** 适合自由职业/创业 */
        fitFreelanceOrBiz: '低' | '中' | '高';
        /** 角色偏好 */
        rolePreference: '技术专家型' | '管理型' | '综合协调型' | '创意表达型';
        /** 工作风格标签 */
        workStyleTags: string[];
    };
    /** 职场模式与课题 */
    workPattern: {
        /** 稳定偏好 */
        stabilityPreference: '偏稳' | '平衡' | '偏变动';
        /** 矛盾处理风格 */
        conflictStyle: string;
        /** 与上级/规则的关系 */
        authorityRelationHint: string;
        /** 钱/成长/生活平衡 */
        moneyVsGrowthPreference: string;
        /** 风险提示 */
        riskHints: string[];
    };
    /** 行运：与职业/跳槽相关的时间窗口 */
    fortune: {
        /** 当前大运在事业/职场上的整体氛围 */
        currentLuck: string;
        /** 跳槽窗口年份 */
        jobWindows: Array<{
            year: number;
            favourLevel: 'golden' | 'good' | 'normal' | 'hard';
            type: string;
            reason: string;
        }>;
    };
    /** 用户当前工作与打算 */
    plan: {
        /** 当前状态 */
        currentStatus: string;
        /** 当前行业 */
        currentIndustry?: string;
        /** 当前岗位类型 */
        currentRole?: string;
        /** 当前痛点 */
        currentPainPoints?: string;
        /** 是否已有新 offer */
        hasOffer: boolean;
        /** 目标变动类型 */
        targetChangeType?: string;
        /** 风险承受度 */
        riskTolerance: '偏保守' | '平衡' | '偏激进';
    };
    /** 其他卡片的补充总结 */
    extra: {
        /** 事业/官财格局里，对职业发展的一句话总结 */
        careerSummary?: string;
        /** 财运&金钱观的一句话总结 */
        wealthSummary?: string;
        /** 能量流通中，对压力转换、身心状态相关的总结 */
        energyFlowSummary?: string;
    };
}
//# sourceMappingURL=jobChange.d.ts.map