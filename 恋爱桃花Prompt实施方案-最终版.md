# 恋爱桃花 Prompt 实施方案（最终版）

## 方案定位

**核心原则**：只动方案、不动 prompt 大结构

- ✅ 保留现有的 `XIAOPEI_PROMPT_LOVE` prompt 文本（不做大改）
- ✅ 优化**使用方式**和**系统集成**
- ✅ 明确**类型定义**和**构建函数**的落地方式
- ✅ 提供清晰的**实现 Checklist**

---

## 一、保留「恋爱专线特殊格式」，避开系统冲突

### 1.1 问题分析

恋爱专线有自己的输出格式要求（表情符号、标题层级、表格用法等），如果同时使用 `XIAOPEI_OUTPUT_STYLE`，会导致双重规范冲突。

### 1.2 解决方案

**方案 A（推荐）：恋爱专线独立调用，不拼接系统级输出格式**

```typescript
// ❌ 错误做法：双重规范
const prompt = XIAOPEI_PROMPT_LOVE.replace(...) + XIAOPEI_OUTPUT_STYLE;

// ✅ 正确做法：只用恋爱专线 prompt
const systemPrompt = XIAOPEI_SYSTEM_PROMPT_CHAT;  // 通用小佩人设
const userPrompt = XIAOPEI_PROMPT_LOVE
  .replace('{{LOVE_CHAT_CONTEXT_JSON}}', JSON.stringify(loveChatContext, null, 2))
  .replace('{{USER_QUESTION}}', userQuestion)
  .replace('{{IS_FIRST_MESSAGE}}', isFirstMessage ? 'true' : 'false');
```

**理由**：
- `XIAOPEI_PROMPT_LOVE` 内部已经包含了完整的输出格式要求
- 避免与 `XIAOPEI_OUTPUT_STYLE` 产生冲突
- 保持恋爱专线的独立性和特殊气质

### 1.3 系统级约定（可选）

如果未来需要统一管理，可以在 `XIAOPEI_OUTPUT_STYLE` 或 `XIAOPEI_SYSTEM_PROMPT_CHAT` 中加一句说明：

> 「若专题 Prompt（如恋爱桃花、婚姻家庭等）中有单独的输出格式要求，以专题 Prompt 为准。」

**但现阶段不需要**，因为恋爱专线已经独立调用，不会触发系统级格式规范。

---

## 二、长 Prompt 没问题，但要保持「一专线一 Prompt」

### 2.1 设计原则

- ✅ **每条专线单独一份 Prompt**
- ✅ **前端路由 / topic 明确区分**
- ✅ **按需加载，不混用**

### 2.2 专线 Prompt 清单

| 专线 | Prompt 常量 | 状态 | 说明 |
|------|------------|------|------|
| 恋爱桃花 | `XIAOPEI_PROMPT_LOVE` | ✅ 已完成 | 当前方案 |
| 官财格局 | `XIAOPEI_PROMPT_GUANCAI` | ✅ 已有 | 卡片解读模式 |
| 婚姻家庭 | `XIAOPEI_PROMPT_MARRIAGE` | ⏳ 待开发 | 未来扩展 |
| 健康养生 | `XIAOPEI_PROMPT_HEALTH` | ⏳ 待开发 | 未来扩展 |
| 学业考试 | `XIAOPEI_PROMPT_STUDY` | ⏳ 待开发 | 未来扩展 |

### 2.3 路由区分机制

**前端路由参数**：

```typescript
// 导航到恋爱专线
navigation.navigate('Chat', {
  conversationId: 'new',
  topic: 'love',  // ✅ 明确标识恋爱专线
  masterId: chartData.profile.chartProfileId,
  source: 'love_card',  // 来源：恋爱桃花卡片
});

// 导航到通用解读
navigation.navigate('Chat', {
  conversationId: 'new',
  topic: 'general',  // ✅ 通用解读
  masterId: chartData.profile.chartProfileId,
});
```

**后端路由处理**：

```typescript
// core/src/routes/conversation.ts
router.post('/:conversationId/messages', async (req, res) => {
  const { message, topic, context } = req.body;
  
  // ✅ 根据 topic 选择对应的 prompt
  if (topic === 'love') {
    // 使用恋爱专线 prompt
    const loveChatContext = buildLoveChatContext(chartResult);
    const isFirstMessage = checkIsFirstMessage(conversationId);
    const userPrompt = XIAOPEI_PROMPT_LOVE
      .replace('{{LOVE_CHAT_CONTEXT_JSON}}', JSON.stringify(loveChatContext, null, 2))
      .replace('{{USER_QUESTION}}', message)
      .replace('{{IS_FIRST_MESSAGE}}', isFirstMessage ? 'true' : 'false');
    
    systemPrompt = XIAOPEI_SYSTEM_PROMPT_CHAT;
    // ❌ 不再拼接 XIAOPEI_OUTPUT_STYLE
  } else if (topic === 'general') {
    // 使用通用解读 prompt
    userPrompt = buildGeneralPrompt({ userQuestion: message, baziData: chartResult });
    systemPrompt = XIAOPEI_SYSTEM_PROMPT_CHAT;
    // ✅ 通用解读可以拼接 XIAOPEI_OUTPUT_STYLE
  }
  // ... 其他专线
});
```

### 2.4 优势

- **按需加载**：每条对话只加载对应的 prompt，不会把所有内容堆一起
- **独立维护**：每条专线可以有自己的风格和格式要求
- **清晰扩展**：未来新增专线时，只需要新增对应的 prompt 和路由判断

---

## 三、LoveChatContext：保持详细说明，不压缩，但做好「类型落地」

### 3.1 设计原则

- ✅ **保留 prompt 中的详细字段说明**（不压缩）
- ✅ **在代码中定义正式类型**（TypeScript 接口）
- ✅ **提供构建函数**（确保所有字段都有真实数据）

### 3.2 类型定义（建议位置：`core/src/types/love.ts`）

```typescript
/**
 * 恋爱聊天上下文类型定义
 * 
 * 对应 XIAOPEI_PROMPT_LOVE 中描述的字段结构
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

/**
 * 单柱恋爱信息
 */
interface PillarLoveInfo {
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
```

### 3.3 构建函数（建议位置：`core/src/modules/love/loveContextBuilder.ts`）

```typescript
/**
 * 从命盘结果中构建 LoveChatContext
 * 
 * @param chartResult 命盘分析结果（来自 engine）
 * @param userQuestion 用户问题（用于判断 partnerMentioned）
 * @returns LoveChatContext
 */
export function buildLoveChatContext(
  chartResult: any,
  userQuestion?: string
): LoveChatContext {
  // 1. 提取基础信息
  const basic = extractBasicInfo(chartResult);
  
  // 2. 提取四柱恋爱信息
  const pillars = extractPillarsLoveInfo(chartResult);
  
  // 3. 提取宫位信息
  const palace = extractPalaceInfo(chartResult);
  
  // 4. 提取配偶星信息
  const spouseAndExpression = extractSpouseInfo(chartResult);
  
  // 5. 提取清浊调候信息
  const patternAndBearing = extractPatternInfo(chartResult);
  
  // 6. 提取大运流年信息
  const fortune = extractFortuneInfo(chartResult);
  
  // 7. 提取辅助分析信息
  const extra = extractExtraInfo(chartResult);
  
  // 8. 判断是否提到伴侣
  const partnerMentioned = checkPartnerMentioned(userQuestion || '');
  
  return {
    mode: 'single',  // 当前只支持单人分析
    meta: {
      selfGender: extractGender(chartResult),
      currentYear: new Date().getFullYear(),
      partnerMentioned,
    },
    basic,
    pillars,
    palace,
    spouseAndExpression,
    patternAndBearing,
    fortune,
    extra,
  };
}

/**
 * 检查用户问题中是否提到伴侣
 */
function checkPartnerMentioned(question: string): boolean {
  const keywords = [
    '男朋友', '女朋友', '老公', '老婆', '对象', '另一半',
    '伴侣', '恋人', '他', '她', '对方', 'ta'
  ];
  return keywords.some(keyword => question.includes(keyword));
}

// ... 其他提取函数的具体实现
```

### 3.4 关键要求

- ✅ **所有字段必须有真实数据**：不能 prompt 里写了，JSON 里是 `null` 或 `undefined`
- ✅ **字段命名与 prompt 说明一致**：便于 LLM 理解
- ✅ **类型安全**：使用 TypeScript 接口，避免运行时错误

---

## 四、合盘预留：认可现状，再多想半步结构

### 4.1 当前状态

- ✅ 接受 `mode: 'single' | 'synastry'` 的设计
- ✅ 当前只实现 `'single'` 模式
- ✅ 合盘功能未来扩展

### 4.2 未来合盘结构蓝图（预留，暂不实现）

```typescript
/**
 * 合盘上下文结构（未来扩展）
 */
export interface SynastryContext {
  /** 自己的恋爱上下文 */
  self: LoveChatContext;
  
  /** 对方的恋爱上下文（精简版） */
  partner: LoveChatContext;
  
  /** 合盘关系分析 */
  relation: {
    /** 一段整体关系小结 */
    summary: string;
    
    /** 几条关键词式总结 */
    patternHighlights: string[];
    
    /** 容易出现的冲突点 */
    riskHints: string[];
    
    /** 日主关系（相生/相克/相合等） */
    dayMasterRelation: string;
    
    /** 配偶宫合冲关系 */
    spousePalaceRelation: string;
    
    /** 官财呼应情况 */
    guancaiEcho: string;
  };
}
```

### 4.3 实现思路（未来）

当需要实现合盘时：

1. **扩展 `buildLoveChatContext`**：
   ```typescript
   function buildSynastryContext(
     selfChart: any,
     partnerChart: any
   ): SynastryContext {
     const self = buildLoveChatContext(selfChart);
     const partner = buildLoveChatContext(partnerChart);
     const relation = analyzeSynastry(self, partner);
     
     return { self, partner, relation };
   }
   ```

2. **在 prompt 中加条件判断**：
   - `mode === 'single'` → 用现在这套结构
   - `mode === 'synastry'` → 多讲「两个人互动」那块

3. **现在不需要动 prompt**，只需要在设计其他模块时，脑子里有这个「合盘容器」的模样。

---

## 五、isFirstMessage：只保留占位符，不在 meta 中重复

### 5.1 设计原则

- ✅ **LoveChatContext.meta 里不包含 isFirstMessage 字段**
- ✅ **只通过占位符 `{{IS_FIRST_MESSAGE}}` 控制**
- ✅ **前端逻辑简单清晰**

### 5.2 实现方式

**后端判断逻辑**（建议位置：`core/src/routes/conversation.ts`）：

```typescript
/**
 * 判断是否为该对话的首次消息
 */
function checkIsFirstMessage(conversationId: string): boolean {
  // 查询该对话是否已有消息
  const [messages] = await pool.execute(
    `SELECT COUNT(*) as count FROM messages 
     WHERE conversation_id = ? AND role = 'user'`,
    [conversationId]
  );
  
  return messages[0].count === 0;
}
```

**调用方式**：

```typescript
// 构建恋爱专线 prompt
const isFirstMessage = checkIsFirstMessage(conversationId);
const userPrompt = XIAOPEI_PROMPT_LOVE
  .replace('{{LOVE_CHAT_CONTEXT_JSON}}', JSON.stringify(loveChatContext, null, 2))
  .replace('{{USER_QUESTION}}', message)
  .replace('{{IS_FIRST_MESSAGE}}', isFirstMessage ? 'true' : 'false');
```

### 5.3 前端逻辑

**用户点击「恋爱桃花」卡片**：

```typescript
// 前端：创建新对话
navigation.navigate('Chat', {
  conversationId: 'new',  // 新对话
  topic: 'love',
  masterId: chartData.profile.chartProfileId,
  source: 'love_card',
});

// 后端：检测到 conversationId === 'new' 或不存在
// → 创建新对话 → isFirstMessage = true
```

**后续追问**：

```typescript
// 前端：在已有对话中发送消息
api.post(`/conversations/${conversationId}/messages`, {
  message: userInput,
  topic: 'love',
});

// 后端：检测到对话已存在且有历史消息
// → isFirstMessage = false
```

### 5.4 优势

- ✅ **单一信号来源**：模型只有一个 `isFirstMessage` 信号，不会困惑
- ✅ **逻辑清晰**：前端只需要创建新对话，后端自动判断
- ✅ **易于维护**：以后要改「到底哪一次算首轮」，只需要改后端判断逻辑，不用动 prompt

---

## 六、实现 Checklist

### 6.1 代码层面

- [ ] **1. 添加 `XIAOPEI_PROMPT_LOVE` 到 `promptTemplates.ts`**
  - 位置：`core/src/modules/prompt/promptTemplates.ts`
  - 操作：将 `XIAOPEI_PROMPT_LOVE.ts` 中的内容复制过去

- [ ] **2. 定义 `LoveChatContext` 类型**
  - 位置：`core/src/types/love.ts`（新建文件）
  - 操作：定义完整的 TypeScript 接口

- [ ] **3. 实现 `buildLoveChatContext()` 函数**
  - 位置：`core/src/modules/love/loveContextBuilder.ts`（新建文件）
  - 操作：从 `chartResult` 中提取并构建 `LoveChatContext`

- [ ] **4. 实现 `checkIsFirstMessage()` 函数**
  - 位置：`core/src/routes/conversation.ts`
  - 操作：查询对话历史，判断是否为首次消息

- [ ] **5. 修改对话路由，支持 `topic === 'love'`**
  - 位置：`core/src/routes/conversation.ts`
  - 操作：根据 `topic` 选择对应的 prompt，恋爱专线不拼接 `XIAOPEI_OUTPUT_STYLE`

### 6.2 前端层面

- [ ] **6. 修改导航逻辑，支持 `topic: 'love'`**
  - 位置：`app/src/screens/.../LoveCard.tsx`（或对应的卡片组件）
  - 操作：点击「恋爱桃花」卡片时，传递 `topic: 'love'`

- [ ] **7. 确保前端传递正确的参数**
  - `conversationId`: 'new' 或已有对话 ID
  - `topic`: 'love'
  - `message`: 用户问题

### 6.3 测试层面

- [ ] **8. 测试首轮解读**
  - 创建新对话，发送第一个问题
  - 验证 `isFirstMessage = true`，返回完整总览

- [ ] **9. 测试追问**
  - 在已有对话中发送后续问题
  - 验证 `isFirstMessage = false`，返回针对性回答

- [ ] **10. 测试 LoveChatContext 数据完整性**
  - 验证所有字段都有真实数据
  - 验证 JSON 格式正确

- [ ] **11. 测试输出格式**
  - 验证 Markdown 格式正确
  - 验证表情符号、表格等特殊格式正常显示

### 6.4 文档层面

- [ ] **12. 更新 API 文档**
  - 说明 `topic: 'love'` 的使用方式
  - 说明 `LoveChatContext` 的数据结构

- [ ] **13. 更新开发文档**
  - 说明如何新增其他专线（婚姻、健康等）
  - 说明合盘功能的预留结构

---

## 七、后续优化建议（可选）

### 7.1 Prompt 小打磨（未来）

如果未来需要对 `XIAOPEI_PROMPT_LOVE` 本身做优化：

- ✅ 只改语气和少量结构
- ❌ 不改字段和逻辑
- ✅ 让它更贴合系统其他 prompt 的风格

**但现在不需要**，当前版本已经可以直接使用。

### 7.2 其他专线扩展

按照同样的模式，可以扩展：

- 婚姻家庭专线：`XIAOPEI_PROMPT_MARRIAGE`
- 健康养生专线：`XIAOPEI_PROMPT_HEALTH`
- 学业考试专线：`XIAOPEI_PROMPT_STUDY`

**每条专线独立维护，互不干扰。**

---

## 八、总结

### 8.1 核心要点

1. ✅ **保留恋爱专线的独立格式**，不拼接系统级输出格式
2. ✅ **一专线一 Prompt**，按需加载，不混用
3. ✅ **类型落地**：定义 `LoveChatContext` 接口 + `buildLoveChatContext()` 函数
4. ✅ **只通过占位符控制 isFirstMessage**，不在 meta 中重复
5. ✅ **合盘预留结构**，现在不实现，但设计时考虑

### 8.2 实施顺序

1. **第一步**：添加 prompt 和类型定义（1-2 天）
2. **第二步**：实现构建函数和路由逻辑（2-3 天）
3. **第三步**：前端集成和测试（1-2 天）
4. **第四步**：文档更新和优化（1 天）

**总计**：约 5-8 个工作日

---

## 附录：关键代码片段参考

### A. 路由处理示例

```typescript
// core/src/routes/conversation.ts
if (topic === 'love') {
  const loveChatContext = buildLoveChatContext(chartResult, message);
  const isFirstMessage = await checkIsFirstMessage(conversationId);
  
  const userPrompt = XIAOPEI_PROMPT_LOVE
    .replace('{{LOVE_CHAT_CONTEXT_JSON}}', JSON.stringify(loveChatContext, null, 2))
    .replace('{{USER_QUESTION}}', message)
    .replace('{{IS_FIRST_MESSAGE}}', isFirstMessage ? 'true' : 'false');
  
  systemPrompt = XIAOPEI_SYSTEM_PROMPT_CHAT;
  // ❌ 不再拼接 XIAOPEI_OUTPUT_STYLE
}
```

### B. 前端导航示例

```typescript
// app/src/screens/.../LoveCard.tsx
const handleLoveCardPress = () => {
  navigation.navigate('Chat', {
    conversationId: 'new',
    topic: 'love',
    masterId: chartData.profile.chartProfileId,
    source: 'love_card',
  });
};
```

---

**文档版本**：v1.0  
**最后更新**：2025-01-XX  
**维护者**：开发团队

