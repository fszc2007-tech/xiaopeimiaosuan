# 投资理财 Prompt 实施方案（优化版）

## 一、方案定位与原则

### 1.1 核心定位
- **专线名称**：财富·投资理财专线
- **主任务**：构建 `InvestChatContext`，为投资理财专题对话提供命理上下文
- **设计原则**：
  - ✅ **最大化复用**：优先使用现有 analysis / 卡片结果，不另起炉灶
  - ✅ **V1 极简优先**：先做最小可用版本，`wealthWindows` 用极简规则
  - ✅ **类型对齐**：复用现有类型结构，避免重复定义
  - ✅ **字段瘦身**：能直接用 summary 就用，不要过度结构化

### 1.2 版本规划
- **V1 版本**：最小可用版本
  - 基础字段（meta + basic + wealth + fortune + extra）
  - `wealthWindows` 用极简映射规则
  - `concernType` 用 LLM 抽取 + 兜底默认
  - `riskToleranceHint` 问题 + 命盘综合判断
- **V2 版本**（后续优化）：
  - `wealthWindows` 精细化打分（食伤生财/比劫夺财/官杀护财等）
  - 根据实际使用反馈调整字段

---

## 二、InvestChatContext 类型定义（优化版）

### 2.1 公共类型定义（建议抽到 `core/src/types/common.ts`）

```typescript
/**
 * 十神权重聚合类型（各专线共用）
 * 
 * 用于 LoveChatContext、JobChangeChatContext、InvestChatContext 等
 */
export interface TenGodWeightsAgg {
  guan: number;      // 官（聚合 zGuan + sha）
  cai: number;       // 财
  shishang: number;   // 食伤（聚合 shi + shang）
  bijie: number;     // 比劫（聚合 bi + jie）
  yin: number;       // 印（聚合 zYin + pYin）
}

/**
 * 五行分布类型（各专线共用）
 * 
 * 直接对应 engine 的 wuxingPercent，保持 key 为中文
 */
export interface WuXingPercent {
  木: number;
  火: number;
  土: number;
  金: number;
  水: number;
}
```

### 2.2 完整类型结构

```typescript
/**
 * 投资理财聊天上下文类型定义
 * 
 * 对应 XIAOPEI_PROMPT_INVEST 中描述的字段结构
 */

import { TenGodWeightsAgg, WuXingPercent } from '../../types/common';

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
    concernType: string;  // "整体财运" | "收入增长" | "投资理财" | "买房置业" | "副业/兼职"
    /** 风险承受力总体判断（问题 + 命盘综合，userQuestion 为空时允许 undefined） */
    riskToleranceHint?: '偏保守' | '中性' | '偏进取';
  };
  
  /** 命盘基础信息（完全复用现有结构） */
  basic: {
    /** 日主及五行（如"丙火"） */
    dayMaster: string;
    /** 日主强弱评分、等级与说明 */
    dayMasterStrength: {
      score: number;      // 保持和 engine 一致，不私自转换（engine 是 0-100 就 0-100，是 0-1 就 0-1）
      level: string;       // 如"身弱"
      description: string;
    };
    /** 格局名称、置信度与十神权重（复用公共类型） */
    structure: {
      name: string;
      confidence?: number;
      weights: TenGodWeightsAgg;  // 使用公共类型
    };
    /** 喜用五行、忌神五行与简要说明 */
    yongshen: {
      like: string[];       // 喜用五行
      dislike: string[];    // 忌神五行
      summary: string;
    };
    /** 五行分布（使用公共类型） */
    wuxing: WuXingPercent;  // 使用公共类型
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
      type: string;  // 如"适合拓展收入"、"适合稳住基本盘"、"适合学习理财"、"适合降低风险"
      reason: string;  // 一两句原因说明
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
```

### 2.3 类型对齐说明

#### ✅ 复用公共类型
- `basic.structure.weights`：使用 `TenGodWeightsAgg` 公共类型，与 `JobChangeChatContext` / `LoveChatContext` 保持一致
- `basic.wuxing`：使用 `WuXingPercent` 公共类型，直接对应 `analysis.wuxingPercent`，保持 key 为中文（`木/火/土/金/水`）
- `basic.yongshen`：与现有专线保持一致

#### ✅ 字段瘦身原则
- `wealth.guancaiSummary`：直接使用 `guancaiPattern.summary`（如果有）
- `wealth.wealthSummary`：优先用 `guancaiPattern.wealthPattern.summary`，否则简单组合
- `extra.relationshipSummary` / `extra.familySummary`：**允许为空**，不要硬抠字符串

#### ⚠️ 重要约定
- `dayMasterStrength.score`：**保持和 engine 一致**，不要私自转换（engine 是 0-100 就 0-100，是 0-1 就 0-1）
  - LLM 对 0.68 和 68 没啥敏感差别，Prompt 里只会说「偏弱/微弱」，不会用到数值做计算
  - 如果想统一，就在 engine 那一端统一，不要在各个专线 builder 里私自转一次

---

## 三、数据提取与构建逻辑

### 3.1 basic（命盘基础）- ✅ 完全复用

**数据来源**：`chartResult.analysis`

```typescript
function extractBasicInfo(chartResult: any): InvestChatContext['basic'] {
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
      // ⚠️ 重要：保持和 engine 一致，不要私自转换
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
```

### 3.2 wealth（财富相关）- ✅ 优先使用现有 summary

```typescript
function extractWealthInfo(chartResult: any): InvestChatContext['wealth'] {
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
```

### 3.3 fortune（时间维度）- ⚠️ V1 极简映射

#### 3.3.1 luckRhythmSummary（直接复用）

```typescript
function extractLuckRhythmSummary(chartResult: any): string | undefined {
  const analysis = chartResult.analysis || {};
  const luckRhythm = analysis.luckRhythm || {};
  const currentLuck = luckRhythm.currentLuck || {};
  
  // 优先用 tone，其次用 stage
  return currentLuck.tone || currentLuck.stage || undefined;
}
```

#### 3.3.2 wealthWindows（V1 极简映射规则）

**输入**：`luckRhythm.annualBrief`（未来十年流年列表）

**V1 极简规则**：

```typescript
/**
 * V1 极简映射：基于 annualBrief 自带信息 + 简单 heuristic
 * 
 * 算法：
 * 1. 以 favourLevel 作为基础分（-2 ~ +2，需要从 'good'|'mixed'|'bad'|'neutral' 映射）
 * 2. 根据十神简单微调（只针对财富相关：财、食伤、比劫）
 * 3. 根据命局财星权重微调
 * 4. 映射成 4 档（golden / good / normal / hard）
 * 5. 根据 highlightTag 翻译成 type
 * 
 * ⚠️ 注意：
 * - 函数签名要完整，使用 TenGodWeightsAgg 而不是只写 { cai: number }
 * - 字段名统一用 tenGodToDay（和 engine 对齐），不要独创 shishen
 */
function buildWealthWindows(
  annualBrief: Array<{
    year: number;
    ganzhi: string;
    tenGodToDay: string;  // ⚠️ 统一用 tenGodToDay（和 engine/其他专线对齐），不要用 shishen
    favourLevel: 'good' | 'mixed' | 'bad' | 'neutral';
    highlightTag: 'opportunity' | 'smooth' | 'stress' | 'trial' | 'adjust';
  }>,
  weights: TenGodWeightsAgg,  // ⚠️ 使用完整类型，不要只写 { cai: number }
  currentYear: number
): InvestChatContext['fortune']['wealthWindows'] | undefined {
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
    if (annual.favourLevel === 'good') score = 1.5;
    else if (annual.favourLevel === 'mixed') score = 0;
    else if (annual.favourLevel === 'bad') score = -1.5;
    else score = 0;  // neutral
    
    // 3. 根据十神微调（只针对财富相关）
    const tenGodToDay = annual.tenGodToDay || '';  // ⚠️ 使用 tenGodToDay，不是 shishen
    if (tenGodToDay.includes('财')) score += 1;
    if (tenGodToDay.includes('食') || tenGodToDay.includes('伤')) score += 0.5;
    if (tenGodToDay.includes('比') || tenGodToDay.includes('劫')) score -= 0.5;
    
    // 4. 根据命局财星权重微调
    if (weights.cai > 1.2) score += 0.5;  // 财星本来就强 → 机会更好
    if (weights.cai < 0.8) score -= 0.5;   // 财星太弱 → 分数上限略收敛
    
    // 5. 限制范围
    if (score > 2) score = 2;
    if (score < -2) score = -2;
    
    // 6. 映射 favourLevel
    let favourLevel: 'golden' | 'good' | 'normal' | 'hard';
    if (score >= 1.5) favourLevel = 'golden';
    else if (score >= 0.5) favourLevel = 'good';
    else if (score > -0.5) favourLevel = 'normal';
    else favourLevel = 'hard';
    
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
 * 将 highlightTag 映射为财富窗口类型
 */
function mapHighlightTagToWealthType(
  tag: string,
  favourLevel: 'golden' | 'good' | 'normal' | 'hard'
): string {
  if (favourLevel === 'golden' || favourLevel === 'good') {
    if (tag === 'opportunity') return '适合拓展收入';
    if (tag === 'smooth') return '适合稳健理财';
    return '适合主动争取';
  } else if (favourLevel === 'normal') {
    if (tag === 'adjust') return '适合学习理财';
    return '适合稳住基本盘';
  } else {
    return '适合降低风险';
  }
}

/**
 * 生成原因说明
 */
function generateWealthReason(
  annual: any,
  favourLevel: 'golden' | 'good' | 'normal' | 'hard',
  type: string
): string {
  const tenGodToDay = annual.tenGodToDay || '';  // ⚠️ 使用 tenGodToDay
  if (favourLevel === 'golden' || favourLevel === 'good') {
    if (tenGodToDay.includes('财')) return '财星得力，机会变多';
    if (tenGodToDay.includes('食') || tenGodToDay.includes('伤')) return '食伤生财，适合主动争取';
    return '整体运势对财富有利';
  } else if (favourLevel === 'normal') {
    return '适合稳扎稳打，积累为主';
  } else {
    return '压力偏大，适合守成，减少高风险操作';
  }
}
```

**V1 版本特点**：
- ✅ 算法非常短，完全基于现有字段
- ✅ 好调参：只需调整 score 逻辑或阈值
- ✅ 方向与文档一致，精度够用
- ✅ 只取最近 5-7 年，控制 token

### 3.4 extra（其他总结）- ✅ 允许为空

```typescript
function extractExtraInfo(chartResult: any): InvestChatContext['extra'] {
  const analysis = chartResult.analysis || {};
  
  return {
    // 直接使用 energyFlow.summary
    energyFlowSummary: analysis.energyFlow?.summary || undefined,
    
    // 如果有宫位/家庭相关 summary 就用，否则 undefined（不要硬抠）
    relationshipSummary: undefined,  // V1 先不填，后续如果有专门字段再加
    familySummary: undefined,       // V1 先不填，后续如果有专门字段再加
    
    // 直接使用 minggeSummary.summary，让 LLM 自己抓取相关部分
    minggeSummary: analysis.minggeSummary?.summary || undefined,
  };
}
```

### 3.5 meta（元数据）- ⚠️ 需要提取/推导

#### 3.5.1 concernType（V1 关键词匹配 + 兜底，V2 可升级 LLM）

**⚠️ 重要**：V1 不建议返回 `undefined`，给兜底默认值，避免 Prompt 里写复杂分支

**V1 实现**：极简关键词匹配（先不用 LLM）

```typescript
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
function extractConcernTypeV1(question: string): string {
  if (!question || !question.trim()) {
    return '整体财运';  // 兜底默认值
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
 * V2 版本：LLM 抽取（后续实现）
 * 
 * 复用 jobChange 的 extractPlanFromQuestion 工具，增加 few-shot 示例
 */
async function extractConcernTypeV2(userQuestion: string): Promise<string> {
  // TODO: 实现 LLM 抽取（参考 jobChangeContextBuilder.ts 的 extractPlanFromQuestion）
  // 如果模型抽不出来，兜底返回 "整体财运"
  // 暂时调用 V1 版本
  return extractConcernTypeV1(userQuestion);
}
```

#### 3.5.2 riskToleranceHint（问题 + 命盘综合判断）

**实现逻辑**：

```typescript
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
function deriveRiskToleranceHint(
  userQuestion: string | undefined,
  chartResult: any
): '偏保守' | '中性' | '偏进取' | undefined {
  // ⚠️ V1：没有用户语言输入时，直接放弃判断
  // 后续如果觉得命盘判断足够稳，可以删掉这个 early return
  if (!userQuestion || !userQuestion.trim()) {
    return undefined;
  }
  const analysis = chartResult.analysis || {};
  const structure = analysis.structure || {};
  const W = structure.W || structure.tenGodWeights || {};
  const energyFlowSummary = analysis.energyFlow?.summary || '';
  
  let score = 0;  // -1 ~ +1，最终映射到三档
  
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
  if (score > 0.5) return '偏进取';
  if (score < -0.5) return '偏保守';
  return '中性';
}
```

---

## 四、主构建函数

```typescript
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
export async function buildInvestChatContext(params: {
  chartResult: any;
  gender: 'male' | 'female' | 'unknown';
  userQuestion?: string;
  now?: Date;
}): Promise<InvestChatContext> {
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
    wealthWindows: buildWealthWindows(
      annualBrief,
      basic.structure.weights,
      now.getFullYear()
    ),
  };
  
  // 4. 提取辅助信息
  const extra = extractExtraInfo(chartResult);
  
  // 5. 提取元数据
  // ⚠️ concernType 必须有兜底值，不要返回 undefined
  const concernType = userQuestion 
    ? extractConcernTypeV1(userQuestion)  // V1 用关键词匹配，V2 可升级 LLM
    : '整体财运';  // 兜底默认值
  
  // ⚠️ riskToleranceHint 允许 undefined（当 userQuestion 为空时）
  const riskToleranceHint = deriveRiskToleranceHint(userQuestion, chartResult);
  
  // 6. 计算年龄
  const birthYear = chartResult.derived?.birth_year || now.getFullYear();
  const age = now.getFullYear() - birthYear;
  
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
```

---

## 五、文件结构

```
core/src/modules/invest/
  ├── invest.ts                    # Prompt 模板（从 promptTemplates.ts 导入）
  ├── investContextBuilder.ts      # 构建 InvestChatContext（本文档描述的逻辑）
  ├── investDataService.ts         # 数据服务层（调用 builder，类似 loveDataService.ts）
  └── types/
      └── invest.ts                # InvestChatContext 类型定义（本文档第 2.1 节）
```

---

## 六、实施步骤（V1 版本）

### 阶段 1：最小可用版本
1. ✅ 创建类型定义文件 `core/src/types/invest.ts`
2. ✅ 创建 Prompt 模板文件 `core/src/modules/prompt/invest.ts`（将您提供的 Prompt 放入）
3. ✅ 创建 ContextBuilder `core/src/modules/invest/investContextBuilder.ts`
   - 实现 `extractBasicInfo`（完全复用现有逻辑）
   - 实现 `extractWealthInfo`（优先使用现有 summary）
   - 实现 `extractLuckRhythmSummary`（直接复用）
   - 实现 `buildWealthWindows`（V1 极简映射）
   - 实现 `extractExtraInfo`（允许为空）
   - 实现 `deriveRiskToleranceHint`（问题 + 命盘综合）
   - 实现 `buildInvestChatContext`（主函数）
   - `extractConcernType` 先返回 `undefined`（后续实现）
4. ✅ 创建 DataService `core/src/modules/invest/investDataService.ts`
5. ✅ 在 `promptTemplates.ts` 中导出 Prompt
6. ✅ 在路由中集成（参考 `conversation.ts` 中的 love 专线）

### 阶段 2：完善抽取逻辑
7. ⚠️ 实现 `extractConcernType`（LLM 抽取 + 兜底）

### 阶段 3：V2 优化（后续）
8. ⚠️ `wealthWindows` 精细化打分（食伤生财/比劫夺财/官杀护财等）
9. ⚠️ 根据实际使用反馈调整字段

---

## 七、关键确认点（已明确）

### ✅ 1. wealthWindows 计算逻辑
- **V1 版本**：用极简映射（favourLevel + 十神简单加减 + 财星权重微调 → 映射成 4 档 + type）
- **V2 版本**：后续加入「食伤生财/比劫夺财/官杀护财」等精细规则

### ✅ 2. riskToleranceHint
- **策略**：问题 + 命盘一起看
- **实现**：问题显式意图 + 十神结构 + energyFlow 里的情绪稳定度，综合成三档

### ✅ 3. concernType
- **策略**：LLM 抽取 + 兜底默认
- **实现**：复用 jobChange 的 LLM 抽取工具，兜底 `"整体财运"`

### ✅ 4. relationshipSummary / familySummary
- **策略**：允许为空，不要硬抠字符串
- **实现**：有宫位/家庭相关 summary 就直接挂过去，没有就让 Prompt 少用这一块信息

---

## 八、健壮性与可观测性

### 8.1 空数据兜底策略

**重要原则**：空数据返回 `undefined`，而不是空字符串或空数组

#### 具体策略：

1. **`analysis` / `analysis.luckRhythm` / `annualBrief` 不存在时**：
   - `fortune.luckRhythmSummary = undefined`
   - `fortune.wealthWindows = undefined`（而不是 `[]` 或造假）

2. **`guancaiPattern` 不存在时**：
   - `wealth` 下三项都允许是 `undefined`

3. **`energyFlow` / `minggeSummary` 不存在时**：
   - `extra` 下对应字段为 `undefined`

**这样做的重要性**：
- Prompt 里可以明确告诉大模型：
  > 如果某个字段为 `null` / `undefined`，就不要引用对应信息，也不要硬编。
- 这比「给个空字符串」要清晰太多。

### 8.2 Debug 日志建议

在 V1 阶段，可以给 `buildInvestChatContext` 加一层 debug（未来只在 dev 环境开启）：

**记录内容**：
- 输入的 `chartId` / `userQuestion`
- 输出的 `riskToleranceHint` / `wealthWindows.length`
- 对 `wealthWindows` 再加一个简短的汇总（比如：多少 golden/good/hard）

**示例**：
```typescript
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
    chartId: chartResult.profileId,
    concernType,
    riskToleranceHint,
    wealthWindowsCount: fortune.wealthWindows?.length || 0,
    wealthWindowsSummary,
  });
}
```

**好处**：
- 一旦发现某些命盘怎么老是全部 `hard`
- 或者所有用户都被判为「偏进取」
- 可以很快回溯到算法问题，而不是在前端/LLM 输出上慢慢猜

---

## 九、与 Prompt 的契合度

### 9.1 字段名一致性

✅ **已对齐**：InvestChatContext 的字段名与 Prompt 中描述的完全一致
- `wealthWindows[]`：`year`, `favourLevel`, `type`, `reason`
- `meta.concernType`, `meta.riskToleranceHint`
- `wealth.guancaiSummary`, `wealth.wealthSummary`, `wealth.careerSummary`

### 9.2 Prompt 补充说明建议

在 Prompt 里补一句：

> 如果 `wealthWindows` 为空或缺失，就不要硬性为每一年造财运结论，可以更多从 `luckRhythmSummary` 谈「阶段性」的财富主题。

**避免**：LLM 在没窗口的时候瞎编「某某年金光闪闪」。

### 9.3 `minggeSummary` 的使用

✅ **已在 extra 中放置**：`minggeSummary?: string`

**好处**：
- 不需要在 backend 再二次「抽取和钱相关的部分」
- 可以在 Prompt 里说一句：
  > 你可以从 minggeSummary 中挑和「钱 / 稳定 / 现实压力」有关的那几句，作为理解财富体质的补充，但不要逐字朗读。

**这样做**：把「语义理解」工作交给 LLM，而不是在 builder 里做 NLP。

---

## 十、Token 控制建议

- summary 类型字段（guancaiSummary / minggeSummary / energyFlowSummary 等）：
  - 尝试在生成 summary 时就限制在 ~100–150 字左右
  - 这样 InvestChatContext 不会炸 token

---

## 十一、总结

### ✅ 方案优势
1. **最大化复用**：大部分字段直接使用现有 analysis / 卡片结果
2. **V1 极简**：`wealthWindows` 用极简规则，先上线再优化
3. **类型对齐**：复用现有类型结构，避免重复定义
4. **字段瘦身**：能直接用 summary 就用，不要过度结构化
5. **允许缺省**：`relationshipSummary` / `familySummary` 允许为空

### ⚠️ 注意事项
1. **wealthWindows V1 版本**：算法简单，后续可根据反馈调整
2. **concernType**：V1 用关键词匹配，必须有兜底值，不要返回 `undefined`
3. **riskToleranceHint**：当 userQuestion 为空时允许返回 `undefined`
4. **空数据兜底**：返回 `undefined` 而不是空字符串或空数组
5. **字段名对齐**：使用 `tenGodToDay` 而不是 `shishen`，与 engine 保持一致
6. **类型对齐**：使用公共类型 `TenGodWeightsAgg` 和 `WuXingPercent`
7. **score 标度**：保持和 engine 一致，不要私自转换
8. **Token 控制**：注意 summary 字段长度，避免 context 过大

### 📝 后续优化方向
1. 实现 `extractConcernType` 的 LLM 抽取逻辑（V2）
2. `wealthWindows` 精细化打分（V2：食伤生财/比劫夺财/官杀护财等）
3. 如果命盘判断足够稳，可以去掉 `riskToleranceHint` 的 early return
4. 根据实际使用反馈调整字段和规则
5. 创建公共类型文件 `core/src/types/common.ts`，统一管理 `TenGodWeightsAgg` 和 `WuXingPercent`

