/**
 * 婚姻聊天上下文类型定义
 * 
 * 对应 XIAOPEI_PROMPT_MARRIAGE 中描述的字段结构
 */

/**
 * 婚姻聊天上下文
 */
export interface MarriageChatContext {
  /** 模式：单身/恋爱中/已婚/离异/再婚 */
  mode: 'single' | 'inRelationship' | 'married' | 'divorced' | 'remarriage';
  
  /** 元数据 */
  meta: {
    /** 命盘性别 */
    selfGender: 'male' | 'female' | 'unknown';
    /** 当前公历年 */
    currentYear: number;
    /** 当前年龄 */
    age: number;
    /** 关系状态提示（如"未婚单身""有稳定对象""已婚""离异"等） */
    relationStatusHint: string;
  };
  
  /** 命盘基础信息 */
  basic: {
    /** 日主及五行（如"丙火"） */
    dayMaster: string;
    /** 日主强弱等级与说明 */
    dayMasterStrength: {
      score: number;  // 0-100 或 0-1
      level: string;
      description: string;
    };
    /** 格局名称、置信度与十神权重 */
    structure: {
      name: string;
      confidence?: number;
      W: {
        guan: number;      // 官
        cai: number;       // 财
        shishang: number;  // 食伤
        bijie: number;     // 比劫
        yin: number;       // 印
      };
    };
    /** 喜用/忌神五行及简要说明 */
    yongshen: {
      like: string[];       // 喜用五行
      dislike: string[];    // 忌神五行
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
  
  /** 配偶星 & 配偶宫 */
  spouse: {
    /** 配偶星类型：财星（男命妻星）或 官杀（女命夫星） */
    spouseStarType: '财星' | '官杀';
    /** 配偶星强弱、是否混杂、是否被克冲等整体情况说明 */
    spouseStarStatus: {
      strength: string;    // '偏弱' | '中等' | '偏旺'
      mixed: boolean;      // 是否混杂
      conflict: boolean;   // 是否被克冲
      description: string;
    };
    /** 配偶宫（日支）的信息及与其他地支的合冲刑害总结 */
    spousePalace: {
      branch: string;      // 日支
      relations: {
        he: string[];      // 六合
        sanhe: string[];   // 三合
        chong: string[];   // 冲
        xing: string[];    // 刑
        hai: string[];     // 害
      };
      summary: string;     // 总结文字
    };
    /** 对配偶/长期伴侣的大致性格、气质、背景的文字总结 */
    spouseProfileHint: string;
  };
  
  /** 婚姻模式与课题 */
  marriagePattern: {
    /** 早婚/晚婚倾向、不婚倾向等 */
    marriageTendency: string;
    /** 婚姻整体稳定度 */
    stabilityLevel: '偏稳' | '有波动' | '波动较大';
    /** 遇到矛盾时更容易是强硬对抗、冷战、逃避、委屈内耗等 */
    conflictStyle: string;
    /** 金钱、事业、家庭长辈、子女等现实压力落点 */
    realityPressureFocus: string;
    /** 婚姻中的主要风险提示 */
    riskHints: string[];
    /** 如何改善模式、修复关系的方向提示 */
    healingHints: string[];
  };
  
  /** 行运：与婚姻相关的时间窗口 */
  fortune: {
    /** 当前大运在婚姻上的大致氛围 */
    currentLuck: string;
    /** 婚姻时间窗口 */
    marriageWindows: Array<{
      year: number;
      favourLevel: 'golden' | 'good' | 'normal' | 'hard';
      type: string;        // 如"适合定下关系""适合领证/办婚礼""适合调整关系""适合自我沉淀"
      reason: string;       // 一两句自然语言原因说明
    }>;
  };
  
  /** 用户当前计划与关心点 */
  plan: {
    /** 心里期望的结婚年龄 */
    targetMarriageAge?: number;
    /** 大致希望进入婚姻的年份 */
    targetYear?: number;
    /** 是否有明确对象 */
    hasCurrentPartner?: boolean;
    /** 若有对象，关系大致维持了多久 */
    relationDurationYears?: number;
    /** 更关心的是「会不会结婚」「何时结婚」「婚后幸福度」「是否再婚」等 */
    concernType?: string;
  };
  
  /** 来自其他卡片的补充总结 */
  extra: {
    /** 恋爱专线对感情风格的一句话结论 */
    loveSummary?: string;
    /** 宫位六亲中与家庭、婚姻相关的总结 */
    familySummary?: string;
    /** 事业与家庭平衡方面的说明 */
    careerBalanceSummary?: string;
  };
}





