# 用神格局 Prompt 重组方案

## 📋 方案概述

**目标**：将用神格局的 Prompt 重组为三部分结构，明确分工，提升解读质量和一致性。

**核心改动**：
1. 将 Prompt 拆分为：任务说明 + 输出排版要求 + 解读内容要求
2. 补充缺失的数据提取（辅喜五行、做功格局）
3. 优化输出排版要求（表格示例使用占位符）
4. 扩展解读内容要求（从 7 点扩展为 8 点，增加做功格局分析）

---

## 一、当前状态分析

### 1.1 数据结构现状

**引擎层已计算并组装的数据**（`core/engine/index.js`）：

```javascript
yongshenPattern: {
  mainYongshen: {
    elements: string[],      // ✅ 已计算
    tenGods?: string[],     // ✅ 已计算
    type: '單一用神' | '複合用神'  // ✅ 已计算
  },
  assistElements: string[],  // ✅ 已计算（第525行）
  tabooElements: string[],    // ✅ 已计算
  yongshenPower: {
    score: number,           // ✅ 已计算
    level: string            // ✅ 已计算
  },
  flow: {
    level: string,           // ✅ 已计算
    score?: number           // ✅ 已计算
  },
  tiYongBalance: {
    level: string,           // ✅ 已计算
    carrierScore?: number,   // ✅ 已计算
    passScore?: number       // ✅ 已计算
  },
  workPatterns: {
    mainLine: string,        // ✅ 已计算（第575行）
    strength: string,        // ✅ 已计算
    tags: string[]           // ✅ 已计算
  },
  tiaohouLabel?: string      // ✅ 已计算
}
```

**结论**：所有数据已在引擎层计算完成，保存到数据库，无需新增计算逻辑。

### 1.2 Prompt 代码现状

**当前 `buildYongshenPatternPrompt` 函数**（`core/src/modules/prompt/promptTemplates.ts`）：

**已提取的字段**：
- ✅ `mainYongshen`（主用神）
- ✅ `jishen`（忌神）
- ✅ `yongshenPower`（用神力度）
- ✅ `flowLevelText`（流通等级）
- ✅ `tiyongBalance`（体用平衡）
- ✅ `tiaohou`（调候）

**缺失的字段**：
- ❌ `assistElements`（辅喜五行）
- ❌ `workPatterns.mainLine`（做功格局）

**当前 Prompt 结构**：
- 混合了任务说明、排版要求、内容要求
- 使用了 `XIAOPEI_OUTPUT_STYLE`，但未针对用神格局做增强
- 解读逻辑只有 7 点，缺少辅喜五行和做功格局的详细说明

---

## 二、重组方案设计

### 2.1 三部分结构

```
┌─────────────────────────────────────────┐
│  第一部分：任务说明 + 命盘数据          │
│  - 明确解读任务                         │
│  - 提供完整命盘数据（JSON）             │
│  - 用户问题                             │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│  第二部分：输出排版要求（增强版）       │
│  - 复用 XIAOPEI_OUTPUT_STYLE 基础内容   │
│  - 针对用神格局的表格示例（占位符）     │
│  - 标题结构示例                         │
│  - 第一行标题要求                       │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│  第三部分：解读内容要求（8点逻辑）      │
│  - 角色设定                             │
│  - 面板数据关键信息（占位符格式）       │
│  - 8 点解读逻辑                         │
│  - 写作要求                             │
└─────────────────────────────────────────┘
```

### 2.2 数据提取补充

需要在 `buildYongshenPatternPrompt` 函数中补充：

```typescript
// 辅喜五行
const assistElements = yp?.assistElements || [];
const assistElementsText = assistElements.length > 0 
  ? assistElements.join('、') 
  : '無';

// 做功格局
const workPatternsMainLine = yp?.workPatterns?.mainLine || '未知';
```

---

## 三、完整 Prompt 模板

### 3.1 第一部分：任务说明 + 命盘数据

```typescript
你现在要解读用户命盘的「用神格局：分析主用神、辅喜五行、忌神、用神力度、流通等级、體用平衡、做功格局、调候需求」部分。

## 用户命盘信息

${JSON.stringify(baziData, null, 2)}

## 用户问题

${userQuestion}
```

### 3.2 第二部分：输出排版要求（增强版）

```typescript
## 输出排版要求（非常重要）

1. **使用 Markdown 语法排版**，不要输出 HTML。

   - 不要使用 `<div>`、`<p>`、`<span>` 等 HTML 标签。

   - 段落之间使用空行分隔，方便阅读。

2. **标题层级**：

   - 一级标题用 `### `（三个井号 + 空格）

   - 二级小标题用 `#### `（四个井号 + 空格）

   - 三级小标题用 `##### `（五个井号 + 空格）

   - 不要只输出井号不写内容，例如不要只写 `###`。

3. **强调文本**：

   - 重要关键词用 **粗体**（两个星号包围），例如：**日主丙火**、**身弱**、**喜用神**。

   - 可以适度使用 *斜体* 做轻微强调，但不要过度使用。

4. **表格使用**：

   - 当需要对比**不同五行、不同格局要素、不同等级（如用神力度、流通等级、體用平衡）**时，优先使用 Markdown 表格呈现，而不是一长段文字堆叠。

   - 表格中的内容要**简短清晰**，每个单元格控制在 1–2 句话以内，避免把整段长文塞进单元格。

   - 注意：下面的表格只是「格式示例」，其中带有 `{{...}}` 的部分表示要从实际命盘数据中填入对应用语，**不要照抄示例中的具体文字或数字**。

     | 项目         | 情况                      | 说明                          |
     | ------------ | ------------------------- | ----------------------------- |
     | 主用神五行   | {{mainYongshenElements}}  | {{mainYongshenBrief}}         |
     | 辅喜五行     | {{assistElements}}        | {{assistElementsBrief}}      |
     | 忌神五行     | {{tabooElements}}         | {{tabooBrief}}                |
     | 用神力度     | {{yongshenPowerText}}     | {{yongshenPowerBrief}}        |
     | 流通等级     | {{flowLevelText}}         | {{flowBrief}}                 |
     | 體用平衡     | {{tiYongBalanceText}}     | {{tiYongBalanceBrief}}        |
     | 做功格局     | {{workPatternsText}}      | {{workPatternsBrief}}         |

   - 示例中各占位符含义说明（回答时自行根据数据组文案，不必原样输出）：

     - `{{mainYongshenElements}}`：例如「木、火（複合）」  

     - `{{assistElements}}`：例如「木」或「無」

     - `{{tabooElements}}`：例如「金、土、水」  

     - `{{yongshenPowerText}}`：例如「75/100・較強」  

     - `{{flowLevelText}}`：例如「嚴重阻塞（12/100）」  

     - `{{tiYongBalanceText}}`：例如「體強用弱」  

     - `{{workPatternsText}}`：例如「食傷生財」或「印比護身」

5. **表情符号使用**（适度增强可读性）：

   - 感情相关：❤️ 💕  

   - 事业相关：💼 📈  

   - 财富相关：💰 💎  

   - 健康相关：🩺 💪  

   - 学业相关：📚 ✨  

   - 家庭相关：🏠 👨‍👩‍👧‍👦  

   - 每个主要小节最多使用 1–2 个表情符号，不要密集堆砌。

6. **列表使用**：

   - 无序列表用 `- `（短横线 + 空格），用于罗列特点、建议等。

   - 有序列表用 `1. `（数字 + 点 + 空格），用于步骤或层次分明的说明。

   - 列表项尽量简洁，不要写成整段长句。

7. **禁止事项**：

   - 不要输出 HTML 标签。

   - 不要在同一段文字中混用多种标题层级导致结构混乱。

   - 不要输出与用神格局无关的大段内容（如具体流年灾祸预测）。

   - 避免使用「注定」「必然失败」等绝对化、制造恐慌的说法。

8. **标题结构示例**（仅供格式参考，内容请根据实际命盘生成）：

   ### 用神格局解读

   #### 1. 整体格局概览

   （概括命局偏向什么气势，如偏寒、偏燥，身强或身弱，给出一两句总评）

   #### 2. 主用神、辅喜五行与忌神

   （说明主用神五行与十神代表的特质，命局为什么需要它们；再简述忌神过多时的倾向与需留意之处）

   #### 3. 用神力度、流通与體用平衡

   （结合用神分数、流通等级、體用平衡做分析，可配合表格展示）

   #### 4. 调候与生活建议

   （结合调候标签说明命局在寒热燥湿上的状态，最后给出 2–3 条温和的生活/性格/方向建议）

9. **标题要求**：

   - 第一行必须使用类似 `### 用神格局解读` 的标题，表明这一部分是在解读用神格局。

   - 小节标题可依实际内容调整用词，但建议保持「1. 概览」「2. 用神与忌神」「3. 力度与流通」「4. 调候与建议」这样的结构。
```

### 3.3 第三部分：解读内容要求（8点逻辑）

```typescript
---

## 解读内容要求（重点）

你是一位经验丰富、风格温和细致的八字命理师「小佩」。

现在有一块「用神格局」面板，需要你写一段给普通用户看的详细说明文字（小佩解读）。

【面板数据关键信息示意】

- 主用神：{{main_yongshen}}      （例如：木、火（複合））

- 辅喜五行：{{assist_elements}}  （例如：木 或 無）

- 忌神：{{jishen}}               （例如：金、土、水）

- 用神力度：{{yongshen_power}}   （例如：75/100・較強）

- 流通等级：{{flow_level}}       （例如：嚴重阻塞（12/100））

- 體用平衡：{{tiyong_balance}}   （例如：體強用弱、身弱喜扶、體用均衡等）

- 做功格局：{{work_patterns}}    （例如：食傷生財、印比護身等）

- 调候：{{tiaohou}}              （例如：寒重喜火、燥重喜水等）

请你写一段 **约 350–550 字** 的解读，重点说明「这个命局中用神的作用、局限和建议」。请按下面思路组织内容：

1. 用 1–2 句话先整体评价：这个命局气势大致偏哪一边（例如偏寒、偏燥、身强或身弱），以及属于「顺势而行相对轻松」还是「需要后天多用心调整」的类型。

2. 详细解释【主用神 {{main_yongshen}}】代表的能量与性格倾向（比如木＝成长、规划、学习，火＝热情、表达、行动力等），说明：

   - 为什么命局需要这种五行来平衡整体；

   - 当这种力量发挥得好时，容易带来哪些优点、机会或资源。

3. 说明【辅喜五行 {{assist_elements}}】在命局中的辅助作用，可以简要带到它如何配合主用神，让整体气势更顺。如果辅喜五行为「無」，可以说明命局主要依赖主用神，相对集中。

4. 说明【忌神 {{jishen}}】的大致含义：它们在命局中过多时，可能带来的倾向或困扰（例如冲动、压力、消耗、情绪起伏等），并提醒用户在生活中可以怎样意识到这些模式，但语气要温和，不要吓人或绝对化。

5. 结合【用神力度 {{yongshen_power}}】、【流通等级 {{flow_level}}】和【做功格局 {{work_patterns}}】解释：

   - 用神本身的「底子」强不强（有无根气、有没有帮手）；

   - 能量运行的主线路（例如食伤生财、印比助身）代表怎样的用力方式；

   - 气势是顺畅流通还是中间有阻隔、绕路；

   - 如果「用神有力但流通受阻」，说明为「实力在，但发挥不顺畅」；如果「用神偏弱」，说明需要更多后天努力或等待运势配合。

6. 再结合【體用平衡 {{tiyong_balance}}】说明「自身状态」与「外界资源/用神」之间的关系：

   - 如果是「體強用弱」，解释为内在底子不错，但要学会主动使用用神所代表的那种方式；

   - 如果是「體弱用強」，说明需要借助环境、人脉或学习成长来增强自己；

   - 如果是「體用相協」，可以说明更容易在中庸和平衡中发挥。

7. 用通俗语言解释【调候 {{tiaohou}}】：说明命局在寒、热、燥、湿上的失衡点，例如「整体偏寒，需要火来增温」，或者「火气较重，需要水来降温润泽」。点明这就是命局的「生活环境设定」，不是好坏，而是需要被调和。

8. 最后给出 2–3 句温和的建议，和现实生活联系起来，比如：

   - 性格与行为可以怎样向主用神的方向多靠近；

   - 在学习、职业、人际、作息养生上，有哪些小方向可以顺势而为；

   - 鼓励用户把命理当作了解自己的参考，而不是被命局束缚。

## 写作要求

- 不要直接复制面板原话和分数，用自己的话做解释和串联。

- 用词尽量通俗，遇到专业术语要顺口解释一下，让没有命理基础的人也能看懂大意。

- 语气温和、理性，避免「注定」「必然失败」「一生如何如何」等绝对化、吓人的说法，多用「倾向于」「适合」「可以尝试」「建议留意」等表达。

- 使用 Markdown 格式排版，适当使用标题、列表、强调等，让内容结构清晰易读。
```

---

## 四、数据提取完整代码

### 4.1 需要补充的提取逻辑

在 `buildYongshenPatternPrompt` 函数中，在现有提取逻辑后添加：

```typescript
// 辅喜五行
const assistElements = yp?.assistElements || [];
const assistElementsText = assistElements.length > 0 
  ? assistElements.join('、') 
  : '無';

// 做功格局
const workPatternsMainLine = yp?.workPatterns?.mainLine || '未知';
```

### 4.2 完整的数据提取代码

```typescript
function buildYongshenPatternPrompt(params: {
  userQuestion: string;
  baziData: any;
}): string {
  const { userQuestion, baziData } = params;
  
  // 从 baziData 中提取用神格局数据
  const yp = baziData?.analysis?.yongshenPattern;
  
  // ========== 数据提取 ==========
  
  // 主用神
  const mainYongshenElements = yp?.mainYongshen?.elements || [];
  const mainYongshen = mainYongshenElements.length > 0 
    ? mainYongshenElements.join('、') 
    : '未知';
  const mainYongshenType = yp?.mainYongshen?.type === '複合用神' ? '（複合）' : '';
  
  // 辅喜五行（新增）
  const assistElements = yp?.assistElements || [];
  const assistElementsText = assistElements.length > 0 
    ? assistElements.join('、') 
    : '無';
  
  // 忌神
  const jishenElements = yp?.tabooElements || [];
  const jishen = jishenElements.length > 0 
    ? jishenElements.join('、') 
    : '未知';
  
  // 用神力度
  const yongshenPowerScore = yp?.yongshenPower?.score ?? 0;
  const yongshenPowerLevel = yp?.yongshenPower?.level || '未知';
  const yongshenPower = `${yongshenPowerScore}/100·${yongshenPowerLevel}`;
  
  // 流通等级
  const flowLevel = yp?.flow?.level || '未知';
  const flowScore = yp?.flow?.score;
  const flowLevelText = flowScore !== undefined 
    ? `${flowLevel}（${flowScore}/100）` 
    : flowLevel;
  
  // 体用平衡
  const tiyongBalance = yp?.tiYongBalance?.level || '未知';
  
  // 做功格局（新增）
  const workPatternsMainLine = yp?.workPatterns?.mainLine || '未知';
  
  // 调候
  const tiaohou = yp?.tiaohouLabel || '未知';
  
  // ========== Prompt 组装 ==========
  // （使用上面的三部分结构）
}
```

---

## 五、占位符替换映射

### 5.1 占位符与实际变量的对应关系

| 占位符（Prompt 中） | 实际变量（代码中） | 说明 |
|-------------------|------------------|------|
| `{{main_yongshen}}` | `${mainYongshen}${mainYongshenType}` | 主用神（含类型标识） |
| `{{assist_elements}}` | `${assistElementsText}` | 辅喜五行 |
| `{{jishen}}` | `${jishen}` | 忌神 |
| `{{yongshen_power}}` | `${yongshenPower}` | 用神力度 |
| `{{flow_level}}` | `${flowLevelText}` | 流通等级 |
| `{{tiyong_balance}}` | `${tiyongBalance}` | 體用平衡 |
| `{{work_patterns}}` | `${workPatternsMainLine}` | 做功格局 |
| `{{tiaohou}}` | `${tiaohou}` | 调候 |

### 5.2 在 Prompt 中的使用位置

1. **面板数据关键信息示意**部分：使用占位符格式（如 `{{main_yongshen}}`）
2. **解读内容要求**部分：在 8 点逻辑中引用占位符（如 `【主用神 {{main_yongshen}}】`）
3. **实际替换**：在组装 Prompt 时，将占位符替换为实际变量值

---

## 六、实施步骤

### Step 1: 补充数据提取

在 `buildYongshenPatternPrompt` 函数中：
1. 添加 `assistElements` 提取逻辑
2. 添加 `workPatterns.mainLine` 提取逻辑

### Step 2: 重组 Prompt 结构

将函数返回的 Prompt 字符串重组为三部分：

1. **第一部分**：任务说明 + 命盘数据
   ```typescript
   你现在要解读用户命盘的「用神格局：...」部分。
   
   ## 用户命盘信息
   ${JSON.stringify(baziData, null, 2)}
   
   ## 用户问题
   ${userQuestion}
   ```

2. **第二部分**：输出排版要求（增强版）
   - 复用 `XIAOPEI_OUTPUT_STYLE` 的基础内容
   - 添加用神格局专用的表格示例（使用占位符）
   - 添加标题结构示例
   - 明确第一行标题要求

3. **第三部分**：解读内容要求（8点逻辑）
   - 角色设定
   - 面板数据关键信息（使用占位符格式）
   - 8 点解读逻辑（包含辅喜五行和做功格局）
   - 写作要求

### Step 3: 占位符替换

在 Prompt 字符串中：
- 使用占位符格式（如 `{{main_yongshen}}`）作为示例
- 在实际解读逻辑中，将占位符替换为实际变量（如 `${mainYongshen}${mainYongshenType}`）

### Step 4: 测试验证

1. 测试正常数据：确保所有字段都有值时，Prompt 正确生成
2. 测试缺失数据：确保部分字段缺失时，使用默认值
3. 测试空数据：确保 `yongshenPattern` 完全缺失时，不会报错

---

## 七、关键改动点总结

### 7.1 数据提取

- ✅ 补充 `assistElements`（辅喜五行）
- ✅ 补充 `workPatterns.mainLine`（做功格局）

### 7.2 Prompt 结构

- ✅ 明确三部分分工：任务说明 + 排版要求 + 内容要求
- ✅ 排版要求和内容要求配合使用，不是二选一

### 7.3 输出排版要求

- ✅ 复用 `XIAOPEI_OUTPUT_STYLE` 基础内容
- ✅ 增强表格示例（使用占位符，不写死数值）
- ✅ 添加标题结构示例
- ✅ 明确第一行标题要求

### 7.4 解读内容要求

- ✅ 从 7 点扩展为 8 点（增加辅喜五行说明）
- ✅ 第 5 点增强（增加做功格局分析）
- ✅ 所有数据引用使用占位符格式

### 7.5 字数要求

- ✅ 保持 350-550 字

---

## 八、注意事项

### 8.1 数据安全

- 所有字段都有默认值处理（"未知"、"無"、空数组等）
- 使用可选链操作符（`?.`）和空值合并（`??`）
- 数组字段检查长度后再 join

### 8.2 占位符使用

- 在「面板数据关键信息示意」部分使用占位符格式（作为示例说明）
- 在实际解读逻辑中，将占位符替换为实际变量值
- 表格示例中的占位符仅作为格式说明，LLM 需要根据实际数据生成内容

### 8.3 向后兼容

- 保持 `XIAOPEI_OUTPUT_STYLE` 不变（其他 sectionKey 仍使用）
- 只在 `yongshenPattern` 的专用 Prompt 中增强
- 不影响其他 sectionKey 的解读逻辑

---

## 九、预期效果

### 9.1 结构清晰

- 三部分明确分工，易于理解和维护
- 排版要求和内容要求配合使用，确保输出质量和格式一致

### 9.2 内容完整

- 8 点解读逻辑覆盖所有关键信息
- 包含辅喜五行和做功格局的详细分析

### 9.3 格式规范

- 表格示例使用占位符，避免写死数值
- 标题结构明确，确保输出格式统一

### 9.4 语气温和

- 避免绝对化表达
- 强调参考性而非宿命性
- 提供实用的生活建议

---

**文档版本**：v1.0  
**创建时间**：2024年12月  
**最后更新**：2024年12月





