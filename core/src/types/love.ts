/**
 * 恋爱聊天上下文类型定义
 * 
 * 对应 XIAOPEI_PROMPT_LOVE 中描述的字段结构
 */

/**
 * 单柱恋爱信息
 */
export interface PillarLoveInfo {
  /** 干支 */
  ganzhi: string;
  /** 相对日主十神 */
  tenGodToDay: string;
  /** 主气十神 */
  mainTenGod: string;
  /** 与恋爱相关神煞 */
  shenshaLoveRelated: string[];
  /** 十二长生状态 */
  changsheng: string;
}

/**
 * 恋爱聊天上下文
 */
export interface LoveChatContext {
  /** 模式：单人分析 or 合盘分析 */
  mode: 'single' | 'synastry';
  
  /** 元数据 */
  meta: {
    /** 命盘性别 */
    selfGender: 'male' | 'female' | 'unknown';
    /** 当前公历年 */
    currentYear: number;
    /** 本轮问题中是否提到伴侣 */
    partnerMentioned: boolean;
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
        guan: number;      // 官
        cai: number;        // 财
        shishang: number;   // 食伤
        bijie: number;      // 比劫
        yin: number;        // 印
      };
    };
    /** 喜用五行、忌神五行与简要说明 */
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
  
  /** 四柱恋爱信息 */
  pillars: {
    year: PillarLoveInfo;
    month: PillarLoveInfo;
    day: PillarLoveInfo;
    hour: PillarLoveInfo;
  };
  
  /** 宫位与环境 */
  palace: {
    /** 日支（配偶宫） */
    spouseBranch: string;
    /** 配偶宫与其他地支的关系 */
    relations: {
      he: string[];        // 六合
      sanhe: string[];      // 三合
      chong: string[];     // 冲
      xing: string[];       // 刑
      hai: string[];       // 害
    };
    /** 关于恋爱环境的提示 */
    loveEnvironmentNotes: string;
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
    /** 食神/伤官强弱状态 */
    shiShangStatus: {
      strength: string;
      description: string;
    };
    /** 感情表达方式的提示 */
    expressionHints: string[];
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
  
  /** 时间维度：大运/流年/流月 */
  fortune: {
    /** 当前大运信息 */
    currentLuck: {
      ganzhi: string;
      ageRange: string;
      favourLevel: number;  // -2 ~ +2
      loveShenSha: string[];
      rhythmDescription: string;  // 系统对本步大运的节奏说明
    };
    /** 流年信息 */
    years: Array<{
      year: number;
      ganzhi: string;
      tenGodToDay: string;
      favLevel: number;  // -2 ~ +2
      branchRelationsToSpousePalace: string[];
      loveShenSha: string[];
    }>;
    /** 流月信息（可选） */
    months?: Array<{
      year: number;
      month: number;
      ganzhi: string;
      tenGodToDay: string;
      favLevel: number;
      branchRelationsToSpousePalace: string[];
      loveShenSha: string[];
    }>;
  };
  
  /** 其他与恋爱相关的辅助分析 */
  extra: {
    /** 能量流通分析中可用于理解情绪、沟通、关系链条的内容 */
    energyFlowSummary: string;
    /** 官财格局中与「感情和现实、事业与感情平衡」相关的内容 */
    guancaiSummary: string;
    /** 命格总评中可以帮助理解感情特质的那部分内容 */
    minggeSummary: string;
  };
}

