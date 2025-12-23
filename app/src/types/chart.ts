/**
 * 命盘相关类型定义
 * 
 * 注意：与 Core 后端的 ChartProfileDto、BaziChartDto 保持一致
 */

/**
 * 单柱详细信息（与引擎输出完全一致）
 */
export interface PillarDetail {
  stem: string;              // 天干
  branch: string;            // 地支
  gan?: string;              // 天干（别名，兼容）
  zhi?: string;              // 地支（别名，兼容）
  nayin?: string;            // 纳音
  canggan?: string[];        // 藏干数组
  hidden_tagged?: string[][]; // 藏干带标签 [["庚","本"],["壬","中"]]
  shishen?: string;          // 主星（十神）
  sub_stars?: string[];      // 副星（藏干十神）
  zizuo?: string;            // 自坐（十二长生）
  self_sit?: string;         // 自坐（别名）
  xingyun?: string;          // 星运
  kongwang?: string[];       // 空亡
  shensha?: string[];        // 神煞列表
}

export interface ChartProfile {
  chartProfileId: string;
  userId: string;
  name: string;
  relationType: 'self' | 'partner' | 'parent' | 'child' | 'friend' | 'other';
  birthday: string; // YYYY-MM-DD
  birthTime?: string; // HH:mm:ss
  timeAccuracy?: 'exact' | 'approx' | 'unknown';
  location?: string;
  timezone?: string;
  useTrueSolarTime: boolean;
  gender: 'male' | 'female';
  calendarType: 'solar' | 'lunar';
  lunarMonth?: number;
  lunarDay?: number;
  isLeapMonth?: boolean;
  baziChartId?: string;
  oneLineSummary?: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface BaziResult {
  chartId: string;
  chartProfileId: string;
  engineVersion: string;
  birthInfo: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    timezone: string;
    calendarType: 'solar' | 'lunar';
  };
  result: any; // 八字引擎计算结果（JSON）
  needsUpdate: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface CreateChartRequest {
  name: string;
  relationType: 'self' | 'partner' | 'parent' | 'child' | 'friend' | 'other';
  birthday: string; // YYYY-MM-DD
  birthTime?: string; // HH:mm:ss
  timeAccuracy?: 'exact' | 'approx' | 'unknown';
  location?: string;
  timezone?: string;
  useTrueSolarTime: boolean;
  gender: 'male' | 'female';
  calendarType: 'solar' | 'lunar';
  lunarMonth?: number;
  lunarDay?: number;
  isLeapMonth?: boolean;
}

/**
 * 命盘详情 DTO
 * 包含命盘档案信息和八字计算结果
 */
export interface BaziChartDto {
  profile: {
    chartProfileId: string;
    userId: string;
    name: string;
    relationType: 'self' | 'partner' | 'parent' | 'child' | 'friend' | 'other';
    gender: 'male' | 'female';
    birthdayGregorian: string; // YYYY-MM-DD HH:mm
    birthdayLunar?: string;
    location?: string;
    timezone?: string;
    calendarType: 'solar' | 'lunar';
    createdAt: string;
    updatedAt: string;
  };
  result: {
    chartId: string;
    engineVersion: string;
    pillars: {
      year: PillarDetail;
      month: PillarDetail;
      day: PillarDetail;
      hour: PillarDetail;
    };
    analysis: {
      dayMaster?: {
        gan: string;
        zhi: string;
        wuxing: string;
        yinyang: string;
        strength: number; // 0-100
        strengthLabel: string;
        description?: string;
      };
      wuxingPercent?: {
        金: number;
        木: number;
        水: number;
        火: number;
        土: number;
      };
      nayin?: {
        year: string;
        month: string;
        day: string;
        hour: string;
      };
      hiddenStems?: {
        [key: string]: number;
      };
      strengthAnalysis?: {
        score: number;
        label: string;
        factors: {
          得令: boolean;
          得地: boolean;
          得生: boolean;
          得助: boolean;
        };
      };
      gods?: {
        favorable: string[];
        unfavorable: string[];
        neutral?: string[];
      };
      // 格局分析
      structure?: {
        name: string; // 向后兼容：主格名称
        confidence: number; // 0-1，向后兼容
        reasons: string[]; // 向后兼容
        // 新增：主格/副格字段
        mainPattern?: {
          key: string; // PatternKey
          label: string; // 展示名称，如「正官格」「建禄格」
          score: number; // 0-100 成格度
        } | null;
        secondaryPatterns?: Array<{
          key: string;
          label: string;
          score: number;
        }>;
        allPatterns?: Array<{
          key: string;
          label: string;
          score: number;
        }>;
        tenGodWeights?: {
          guan?: number;
          zGuan?: number;
          sha?: number;
          yin?: number;
          zYin?: number;
          pYin?: number;
          cai?: number;
          shi?: number;
          shishen?: number;
          shang?: number;
          bi?: number;
        };
      };
      // 体用分析
      tiyong?: {
        carryingCapacity: number; // 0-1
        bodyStrength: number; // 0-1
        useStrength: number; // 0-1
        passThroughDegree: number; // 0-1
        destructionPenalty: number; // 0-1
        capacityLevel: string; // 极高/高/中上/中等/中下/低/极低
        interpretation: string;
      };
      // 做功分析
      dogong?: {
        coreLine: any; // 核心做功路径
        strongestPaths: any[]; // 最强做功路径数组
        workTypeSummary: any; // 做功类型统计
      };
      // 清浊分析
      purity?: {
        score: number; // 0-100
        level: string; // 如"中清"、"清"、"浊"等
        details?: {
          yongshenPurity?: number;
          wuxingFlow?: number;
          shishenMatch?: number;
          seasonBalance?: number;
        };
      };
      // 用神格局
      yongshenPattern?: {
        mainYongshen: {
          elements: string[];
          tenGods?: string[];
          type: '單一用神' | '複合用神';
        };
        assistElements: string[];
        tabooElements: string[];
        yongshenPower: {
          score: number;
          level: '偏弱' | '中等' | '較強' | '很強';
        };
        flow: {
          level: '順暢' | '通而不暢' | '阻塞較多' | '嚴重阻塞';
          score?: number;
        };
        tiYongBalance: {
          level: '體強用弱' | '體弱用強' | '體用相協' | '體用失衡';
          carrierScore?: number;
          passScore?: number;
        };
        workPatterns: {
          mainLine: string;
          strength: '強' | '中' | '弱';
          tags: string[];
        };
        tiaohouLabel?: string;
      };
      // 官財格局
      guancaiPattern?: {
        careerPattern: {
          officerType: '正官為主' | '七殺為主' | '官殺並見' | '官殺不顯' | '無明顯官星';
          structureTag: string;
          strength: {
            score: number;
            level: '偏弱' | '中等' | '較強' | '很強';
          };
        };
        wealthPattern: {
          wealthType: '正財為主' | '偏財為主' | '財官均衡' | '財弱' | '比劫奪財';
          strength: {
            score: number;
            level: '偏弱' | '中等' | '較強' | '很強';
          };
          rooting: '有根' | '部分有根' | '無根';
        };
        incomeMode: {
          mainMode: '穩定工資型' | '浮動績效型' | '機會偏財型' | '創業經營型';
          tags: string[];
        };
        stability: {
          career: '穩定' | '偏穩' | '多變' | '多波折';
          wealth: '穩定' | '偏穩' | '起伏大' | '周期波動';
        };
        riskFactors: {
          tags: string[];
        };
        supportFactors: {
          tags: string[];
        };
        workPatterns: {
          mainLine: string;
          relatedLines: string[];
        };
      };
      // 能量流通
      energyFlow?: {
        dmStrengthLevel: '偏弱' | '中和' | '偏强';
        structure: string;
        yongshenSummary: string;
        wuxingBalanceSummary: string;
        workPathCount: number;
        coreWorkPaths: Array<{
          id: string;
          label: string;
          type: 'productive' | 'control' | 'rescue' | 'conflict';
          strength: number;
          direction: string;
          notes?: string[];
        }>;
        otherWorkPaths: Array<{
          id: string;
          label: string;
          type: 'productive' | 'control' | 'rescue' | 'conflict';
          strength: number;
          direction: string;
          notes?: string[];
        }>;
        flowScore: number;
        flowLevel: '流通顺畅' | '整体尚可' | '局部堵塞';
        mainFlowDirections: Array<{
          id: string;
          label: string;
          weight: number;
        }>;
        summary: string;
        riskFlags: string[];
        notes: string[];
      };
      // 时间坐标
      timeCoordinate?: {
        currentDaYun: {
          stemBranch: string;
          tenGod: string;
          ageRange: [number, number];
          startYear?: number;
          endYear?: number;
          phaseTag: 'accelerate' | 'adjust' | 'stable';
          phaseText: '加速期' | '调整期' | '平稳期';
          favourLevel?: 'good' | 'neutral' | 'tense';
        };
        currentLiuNian?: {
          stemBranch: string;
          year: number;
          tenGod: string;
          shortTag?: string;
          riskTag?: string;
        };
        currentLiuYue?: {
          stemBranch: string;
          year: number;
          monthIndex?: number;
          tenGod: string;
          shortTip?: string;
        };
      };
      // 行运节奏
      luckRhythm?: {
        startAge: number;
        luckDirection: '顺行' | '逆行';
        currentAge: number;
        currentLuck: {
          index: number;
          label: string;
          ageRange: string;
          stem: string;
          branch: string;
          tenGod: string;
          element: string;
          favourLevel: '用神' | '中性' | '忌神';
          stage: '打基础期' | '拓展冲刺期' | '调整转折期' | '沉淀收获期';
          intensity: '偏平稳' | '起伏感较强' | '变动明显';
          mainDomains: ('学习' | '事业' | '财富' | '关系' | '家庭' | '自我修炼')[];
          tone: '偏主动' | '偏被动' | '内修型' | '外拓型';
          strengthScore: number;
          clashHarmPunish: string[];
        };
        prevNextLuckSummary: {
          prev?: {
            label: string;
            shortComment: string;
          };
          next?: {
            label: string;
            shortComment: string;
          };
          stageShiftHint: string;
        };
        currentYear: {
          year: number;
          effect: '推动' | '减速' | '提醒调整';
          description: string;
        };
        comingYearsTrend: {
          summary: string;
          tendency: '整体偏顺' | '有起伏的小坡道' | '以调整为主';
        };
        notes: string[];
        // 未来十年流年列表
        annualBrief?: Array<{
          year: number;
          ganzhi: string;
          shishen: string;  // 十神（与系统其他部分保持一致）
          favourLevel: 'good' | 'mixed' | 'bad' | 'neutral';
          highlightTag: 'opportunity' | 'smooth' | 'stress' | 'trial' | 'adjust';
          scores?: {
            overall: number;  // 内部分数，用于排序和调参（不用于前端显示）
          };
          meta?: {
            luckIndex: number;
            inCurrentLuck: boolean;
            isCurrentYear: boolean;
          };
        }>;
      };
      // 宫位分析
      palaces?: {
        // 四柱宫位含义（八字基本概念）
        fourPillarsPalaces?: {
          year: {
            name: string;
            meanings: string[];
            ganMeaning: string;
            zhiMeaning: string;
          };
          month: {
            name: string;
            meanings: string[];
            ganMeaning: string;
            zhiMeaning: string;
          };
          day: {
            name: string;
            meanings: string[];
            ganMeaning: string;
            zhiMeaning: string;
          };
          hour: {
            name: string;
            meanings: string[];
            ganMeaning: string;
            zhiMeaning: string;
          };
        };
        // 命宫、胎元、身宫（紫微斗数概念，保留作为补充）
        mingGong?: {
          stem: string;
          branch: string;
          ganzhi: string;
          palaceName: string;
          interpretation: string;
        };
        taiYuan?: {
          stem: string;
          branch: string;
          ganzhi: string;
          interpretation: string;
        };
        shenGong?: {
          stem: string;
          branch: string;
          ganzhi: string;
          palaceName: string;
          interpretation: string;
        };
        mingShenRelation?: string;
      };
      // 命格總評
      minggeSummary?: {
        dayMaster: {
          level: '身弱' | '稍弱' | '平衡' | '稍強' | '身強' | '從弱' | '從強';
          score: number; // 0-100
          factors?: {
            deLing: boolean; // 得令
            deDi: boolean; // 得地
            deSheng: boolean; // 得生
            deZhu: boolean; // 得助
            haoShen: boolean; // 耗身
          };
        };
        mainPattern: {
          name: string; // 如 "正印格"
          confidence: number; // 0-100，成格度
          category?: '印格' | '官格' | '殺格' | '財格' | '食傷格' | '雜格' | '其他';
          reasonBrief?: string; // 简短理由
          secondaryPatterns?: Array<{
            name: string; // 副格名称，如 "建禄格"
            score: number; // 0-100，成格度
          }>;
        };
        overallScore: {
          score: number; // 0-100
          grade: '上等' | '中上' | '中等' | '中下' | '偏弱';
        };
        patternPurity: {
          level: '清' | '稍清' | '中和' | '中浊' | '浊而有救' | '重浊';
          score?: number; // 0-100，可选
        };
        breakingFactors: {
          hasBreaking: boolean;
          tags: string[]; // 例如 ["官殺混雜", "用神逢沖"]
        };
        remedyFactors: {
          hasRemedy: boolean;
          tags: string[]; // 例如 ["印星通根", "行運火土幫扶"]
        };
        tiaohou: {
          label: string; // 四字，例如 "寒重喜火"
          tendency: '寒' | '熱' | '燥' | '濕' | '平';
          suggestionBrief?: string; // 如 "喜行火土運"
        };
      };
    };
    derived?: {
      // ✅ 唯一对外暴露的大运时间轴字段
      luckCycle?: Array<{
        id: string;
        stemBranch: string;
        shishen: string;
        startAge: number;
        endAge: number;
        startYear: number;
        endYear: number;
        favourLevel: 'good' | 'wave' | 'flat';
        toneTag: string;
        keywords: string[];
      }>;
      // 向后兼容：内部字段，前端不应直接使用
      luck_cycle?: Array<any>;
      flow_years?: Array<{
        stem: string;
        branch: string;
        ganzhi: string;
      }>;
      qi_yun?: {
        years: number;
        months: number;
      };
      yun_direction?: string;
      start_age?: number;
    };
    needsUpdate: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

