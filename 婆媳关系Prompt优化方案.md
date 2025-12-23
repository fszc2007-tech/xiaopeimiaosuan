# 婆媳关系 Prompt 优化方案

## 📋 方案概述

**目标**：优化用户提供的 `XIAOPEI_PROMPT_INLAW`，确保所有字段引用与系统实际参数一致，同时保持 prompt 的完整性和风格不变。

**原则**：
- ✅ 不简化内容，保持原有风格和完整性
- ✅ 字段名称以系统实际参数为准
- ✅ 对于系统中不存在的字段，在 prompt 中说明处理方式

---

## 一、字段映射对照表 & 可用性说明

### 1.1 字段使用约定

**字段分类**：
- ✅ **真实字段**：DTO 中实际存在的字段，直接使用
- 📝 **虚拟分析维度**：不是真实字段，而是从现有字段推导出的分析维度
- ⚠️ **可选字段**：如果存在则使用，不存在则跳过或推导

### 1.2 真实字段（需要修正引用路径）

| 用户 Prompt 中的字段 | 系统实际字段路径 | 字段类型 | 说明 |
|---------------------|-----------------|---------|------|
| `basic.structure.W` | `basic.structure.weights` | ✅ 真实字段 | 十神权重对象（包含 guan/cai/yin/bijie/shishang） |
| `spouse.spouseStarStatus` | `spouseAndExpression.spouseStarStatus` | ✅ 真实字段 | 配偶星状态 |
| `spouse.spouseStarType` | `spouseAndExpression.spouseStarType` | ✅ 真实字段 | 配偶星类型 |
| `spousePalace.relationsSummary` | `palace.relations` | ✅ 真实字段 | 配偶宫关系（对象，包含 he/sanhe/chong/xing/hai 数组） |
| `fortune.currentLuck.favorLevel` | `fortune.currentLuck.favourLevel` | ✅ 真实字段 | 注意拼写是 `favour` 不是 `favor` |
| `fortune.currentLuck.rhythmDescription` | `fortune.currentLuck.rhythmDescription` | ✅ 真实字段 | 当前大运节奏说明 |

### 1.3 系统实际存在的字段（用户 prompt 中未充分利用）

| 系统字段路径 | 字段类型 | 说明 | 建议用途 |
|-------------|---------|------|---------|
| `spouseAndExpression.expressionHints` | ✅ 真实字段 | 感情表达方式提示 | 可用于分析沟通模式、冲突风格 |
| `patternAndBearing.purityLevel` | ✅ 真实字段 | 命局清浊等级 | 可用于分析关系复杂度 |
| `patternAndBearing.tiaoHouSummary` | ✅ 真实字段 | 调候分析 | 可用于分析情绪平衡、冲突风格 |
| `patternAndBearing.tiYongSummary` | ✅ 真实字段 | 体用分析 | 可用于分析承载压力能力、现实压力聚焦点 |
| `patternAndBearing.riskHints` | ✅ 真实字段 | 风险提示 | 可用于替代 `marriagePattern.riskHints` |
| `palace.loveEnvironmentNotes` | ✅ 真实字段 | 恋爱环境提示 | 可用于分析家庭环境 |
| `extra.energyFlowSummary` | ✅ 真实字段 | 能量流通总结 | 可用于分析关系动态 |
| `extra.guancaiSummary` | ✅ 真实字段 | 官财格局总结 | 可用于分析事业与家庭平衡 |
| `extra.minggeSummary` | ✅ 真实字段 | 命格总评 | 可用于整体性格分析 |

### 1.4 虚拟分析维度（不是真实字段，需从现有字段推导）

| 虚拟维度名称 | 对应原字段 | 推导来源 | 说明 |
|------------|-----------|---------|------|
| `marriagePattern.marriageTendency` | 婚姻节奏 | `patternAndBearing.purityLevel` + `tiYongSummary` + `riskHints` | 从清浊、体用、风险提示综合判断 |
| `marriagePattern.stabilityLevel` | 婚姻稳定度 | `patternAndBearing.purityLevel` + `tiYongSummary` + `riskHints` | 同上 |
| `marriagePattern.conflictStyle` | 冲突风格 | `spouseAndExpression.expressionHints` + `patternAndBearing.tiaoHouSummary` | 从表达方式和情绪平衡分析 |
| `marriagePattern.realityPressureFocus` | 现实压力聚焦点 | `patternAndBearing.riskHints` + `extra.guancaiSummary` + `palace`（年柱、月柱含义） | 从风险提示、官财格局、宫位含义综合判断 |
| `marriagePattern.riskHints` | 婚姻风险提示 | `patternAndBearing.riskHints` | 直接使用现有字段 |
| `marriagePattern.healingHints` | 改善方向 | 从 `patternAndBearing` 和 `spouseAndExpression` 综合推导 | 基于现有字段给出建议 |
| `extra.familySummary` | 家庭总结 | `palace`（年柱、月柱含义）+ `patternAndBearing.tiYongSummary` | 从宫位和体用分析推导 |
| `extra.loveSummary` | 感情风格总结 | `spouseAndExpression.expressionHints` + `palace.loveEnvironmentNotes` | 从表达方式和环境提示推导 |
| `extra.careerBalanceSummary` | 事业家庭平衡 | `extra.guancaiSummary` | 直接使用现有字段 |
| `extra.luckRhythmSummary` | 行运节奏总结 | `fortune.currentLuck.rhythmDescription` | 直接使用现有字段 |
| `fortune.marriageWindows` | 婚姻时间窗口 | `fortune.years` + `fortune.currentLuck` | 从流年列表中筛选相关年份 |
| `meta.age` | 当前年龄 | `meta.currentYear` + 用户档案 | 从年份和档案推算 |
| `meta.relationStatusHint` | 关系状态提示 | `USER_QUESTION` 文字内容 | 从用户问题中提取 |
| `plan.concernType` | 关注类型 | `USER_QUESTION` 文字内容 | 从用户问题中提取 |

---

## 二、具体优化点

### 2.1 字段引用修正

#### 修正 1：`basic.structure.W` → `basic.structure.weights`

**原文**：
```
- structure.W：官、财、印、比劫、食伤权重，帮助判断：
```

**修正后**：
```
- structure.weights：官、财、印、比劫、食伤权重，帮助判断：
  - weights.guan：官杀权重
  - weights.cai：财星权重
  - weights.yin：印星权重
  - weights.bijie：比劫权重
  - weights.shishang：食伤权重
```

#### 修正 2：`spouse` → `spouseAndExpression`

**原文多处**：
```
- spouse.spouseStarType / spouse.spouseStarStatus：配偶星状态
- spousePalace.relationsSummary：日支与其他地支的合冲刑害
```

**修正后**：
```
- spouseAndExpression.spouseStarType / spouseAndExpression.spouseStarStatus：配偶星状态
- palace.relations：配偶宫与其他地支的合冲刑害关系（对象，包含 he/sanhe/chong/xing/hai 数组）
```

#### 修正 3：`spousePalace.relationsSummary` → `palace.relations`

**原文**：
```
- spousePalace.relationsSummary：日支与其他地支的合冲刑害，往往暗示：
  - 配偶与原生家庭的拉扯、你与公婆 / 岳父母之间的磁场。
```

**修正后**：
```
- palace.relations：配偶宫（日支）与其他地支的合冲刑害关系，是一个对象，包含：
  - relations.he：六合关系数组
  - relations.sanhe：三合关系数组
  - relations.chong：冲关系数组
  - relations.xing：刑关系数组
  - relations.hai：害关系数组
  这些关系往往暗示：配偶与原生家庭的拉扯、你与公婆 / 岳父母之间的磁场。
```

### 2.2 虚拟字段的推导来源说明

以下维度**不是 JSON 里的真实字段**，而是需要从已有字段中「读出来」的分析维度。在 prompt 中需要明确说明推导来源。

#### 虚拟维度 1：婚姻/家庭稳定度（相当于 `marriagePattern.marriageTendency` / `stabilityLevel`）

**推导来源**：
- 优先结合：`patternAndBearing.purityLevel` + `tiYongSummary` + `riskHints`
- 辅助参考：`basic.structure.weights`（格局稳定性）、`spouseAndExpression.spouseStarStatus`（配偶星状态）

**在 prompt 中的说明**：
```
以下维度不是 JSON 里的字段，而是你需要从已有字段中「读出来」：

- **婚姻/家庭稳定度**（相当于 marriageTendency / stabilityLevel）：
  - 优先结合：`patternAndBearing.purityLevel`（清浊等级，清则关系更纯粹稳定）+ `tiYongSummary`（体用分析，看承载能力）+ `riskHints`（风险提示，看潜在问题）
  - 辅助参考：`basic.structure.weights`（格局稳定性）、`spouseAndExpression.spouseStarStatus`（配偶星状态）
```

#### 虚拟维度 2：冲突风格（相当于 `marriagePattern.conflictStyle`）

**推导来源**：
- 优先结合：`spouseAndExpression.expressionHints` + `patternAndBearing.tiaoHouSummary`（情绪平衡相关内容）
- 辅助参考：`basic.structure.weights`（比劫强则容易硬刚，印强则容易忍，食伤强则容易说出口）

**在 prompt 中的说明**：
```
- **冲突风格**（相当于 conflictStyle）：
  - 优先结合：`spouseAndExpression.expressionHints`（表达方式提示，如"主动/被动""会不会说甜话"）+ `patternAndBearing.tiaoHouSummary`（调候分析中的情绪平衡内容）
  - 辅助参考：`basic.structure.weights`（比劫权重高容易硬刚，印权重高容易忍，食伤权重高容易直接表达）
```

#### 虚拟维度 3：家庭压力聚焦点（相当于 `marriagePattern.realityPressureFocus` / `extra.familySummary`）

**推导来源**：
- 优先结合：`patternAndBearing.riskHints` + `extra.guancaiSummary` + `palace`（年柱、月柱含义，代表原生家庭、父母）
- 辅助参考：`patternAndBearing.tiYongSummary`（体用分析中的现实负担）

**在 prompt 中的说明**：
```
- **家庭压力聚焦点**（相当于 realityPressureFocus / familySummary）：
  - 优先结合：`patternAndBearing.riskHints`（风险提示，看哪些方面容易出问题）+ `extra.guancaiSummary`（官财格局，看事业与家庭平衡）+ `palace`（年柱、月柱含义，代表原生家庭、父母关系）
  - 辅助参考：`patternAndBearing.tiYongSummary`（体用分析中的现实负担、内心底盘）
```

#### 虚拟维度 4：婚姻时间窗口（相当于 `fortune.marriageWindows`）

**推导来源**：
- 如果 `fortune` 中存在专门的婚姻/家庭窗口字段，优先使用
- 否则从 `fortune.years` + `fortune.currentLuck` 中筛选：
  - 挑选 `favLevel` 较高（> 0）的年份
  - 或 `branchRelationsToSpousePalace` 包含"合"的年份
  - 或 `loveShenSha` 包含桃花、红鸾、天喜等神煞的年份
  - 自行归纳出对婚姻/家庭情绪波动影响较大的 3–5 个年份

**在 prompt 中的说明**：
```
- **婚姻/家庭时间窗口**（相当于 marriageWindows）：
  - 如果 `fortune` 中存在专门的婚姻/家庭窗口字段，优先使用
  - 否则从 `fortune.years` 中筛选：
    - `favLevel` 较高（> 0）的年份
    - `branchRelationsToSpousePalace` 包含"合"的年份（如六合、三合）
    - `loveShenSha` 包含桃花、红鸾、天喜等神煞的年份
  - 自行归纳出对婚姻/家庭情绪波动影响较大的 3–5 个重点年份
```

#### 虚拟维度 5：用户阶段与状态（相当于 `meta.age` / `meta.relationStatusHint` / `plan.concernType`）

**推导来源**：
- 优先从 `USER_QUESTION` 的文字内容中提取：
  - 年龄阶段：从问题中提到的"刚结婚""结婚几年""有孩子"等推断
  - 关系状态：从问题中提到的"住一起""分开住""公婆""岳父母"等推断
  - 关注类型：从问题中提到的"钱""带娃""谁说了算""过年回谁家"等推断
- 辅助参考：`meta.currentYear` + 用户档案（如果有）

**在 prompt 中的说明**：
```
- **用户阶段与状态**（相当于 age / relationStatusHint / plan.concernType）：
  - 优先从 `USER_QUESTION` 的文字内容中自行判断：
    - 年龄阶段：从"刚结婚""结婚几年""有孩子"等推断
    - 关系状态：从"住一起""分开住""公婆""岳父母"等推断
    - 关注类型：从"钱""带娃""谁说了算""过年回谁家"等推断
  - 如果看不出来，就弱化这部分，不要硬编
  - 辅助参考：`meta.currentYear` + 用户档案（如果有）
```

#### 虚拟维度 6：其他 extra 字段

**推导来源**：
- `extra.loveSummary`：如果存在则使用，否则从 `spouseAndExpression.expressionHints` + `palace.loveEnvironmentNotes` 推导
- `extra.careerBalanceSummary`：如果存在则使用，否则从 `extra.guancaiSummary` 推导
- `extra.luckRhythmSummary`：如果存在则使用，否则从 `fortune.currentLuck.rhythmDescription` 推导

**在 prompt 中的说明**：
```
- **extra 字段**（来自其他卡片的总结）：
  - 如果 `extra` 中已经有相关总结（例如 `energyFlowSummary` / `guancaiSummary` / `minggeSummary` 或宫位六亲卡的家庭说明），就优先引用
  - 若没有，就由模型基于 `basic` + `palace` + `patternAndBearing` 自己归纳一两句「家庭/婚姻相关小结」
```

### 2.3 字段使用建议优化

在 prompt 中添加「字段使用原则」部分：

```
## 字段使用原则

1. **优先使用存在的字段**：
   - 如果 JSON 中存在某个字段，直接使用
   - 如果字段值为 `null` 或 `undefined`，视为不存在

2. **字段不存在时的处理**：
   - 对于可选字段（如 `marriagePattern`、`extra.familySummary`），如果不存在：
     - 在分析中明确说明「由于缺少 XX 字段，以下分析基于其他可用字段推导」
     - 从相关字段中推导（如从 `patternAndBearing` 推导冲突风格）
     - 不要因为缺少字段而拒绝回答，而是基于现有字段给出分析

3. **字段类型注意**：
   - `palace.relations` 是一个对象，不是字符串，需要遍历其属性（he/sanhe/chong/xing/hai）来获取关系
   - `structure.weights` 是一个对象，包含 guan/cai/yin/bijie/shishang 等属性
   - `fortune.years` 是一个数组，需要遍历来查找相关年份

4. **字段组合使用**：
   - 多个字段可以组合使用，如 `spouseAndExpression` + `palace.relations` 来分析伴侣在家庭中的位置
   - `patternAndBearing.riskHints` 可以补充 `marriagePattern.riskHints`（如果后者不存在）
```

---

## 三、追问规则优化

### 3.1 追问规则（避免重复追问）

**问题**：之前恋爱专线出现过"每轮都问同样两个问题"的体验问题，需要规避。

**规则**：

1. **首轮回答**：
   - 可以给一段「可选想补充的信息」作为一次性提示
   - 追问数量：最多 2–3 个
   - 示例格式：
     ```
     「如果你愿意，之后也可以告诉我：
     - 你们现在是住在一起，还是分开住？
     - 主要矛盾更偏向钱、带娃、还是谁说了算？
     - 你自己更在意的是'关系舒不舒服'，还是'在家里有没有话语权'？」
     ```

2. **后续追问阶段**：
   - **不要再重复同一段追问文案**
   - **不要每条回复都附带一串问题**
   - 追问数量：每条回复最多 1 个，而且可以不问
   - 如果用户后续已经给出这些信息，就不要再追问
   - 追问应该是针对本轮回答的**自然延伸**，而不是模板化的问题列表

3. **追问原则**：
   - 追问应该是**可选回答**，不要形成"审问感"
   - 每轮最多 1–3 个小问题，且是**可选回答**
   - 如果用户已经提供了相关信息，就不要再问

**在 prompt 中的说明**：
```
## 追问规则（非常重要）

1. **首轮回答**：
   - 可以给一段「可选想补充的信息」作为一次性提示
   - 追问数量：最多 2–3 个
   - 格式示例：「如果你愿意，之后也可以告诉我：……（2–3 个问题）」

2. **后续追问阶段**：
   - **禁止重复同一段追问文案**
   - **禁止每条回复都附带一串问题**
   - 追问数量：每条回复最多 1 个，而且可以不问
   - 如果用户后续已经给出这些信息，就不要再追问
   - 追问应该是针对本轮回答的**自然延伸**，而不是模板化的问题列表

3. **追问原则**：
   - 追问应该是**可选回答**，不要形成"审问感"
   - 如果用户已经提供了相关信息，就不要再问
```

---

## 四、文化 & 价值观保护规则

### 4.1 避免刻板印象和攻击性语言

**问题**：婆媳/长辈关系容易滑向性别刻板印象、骂婆婆等负面内容。

**规则**：

1. **禁止内容**：
   - ❌ 不要放大「婆婆 vs 媳妇谁对谁错」「男的都是妈宝」这类刻板印象
   - ❌ 禁止地域黑、阶层嘲笑、外貌羞辱
   - ❌ 不要使用攻击性、污名化的说法

2. **鼓励方式**：
   - ✅ 从「家庭结构 / 角色分工 / 代际差异」去解释，而不是简单贴标签
   - ✅ 可以适度吐槽生活里的小尴尬，但要用善意、不过度损人的方式
   - ✅ 多用「从结构上看，这段关系更像是……」这类表述

**在 prompt 中的说明**：
```
## 文化 & 价值观保护规则

在描述婆媳 / 长辈关系时：

1. **禁止内容**：
   - ❌ 不要放大「婆婆 vs 媳妇谁对谁错」「男的都是妈宝」这类性别刻板印象
   - ❌ 禁止地域黑、阶层嘲笑、外貌羞辱
   - ❌ 不要使用攻击性、污名化的说法（如「极品婆婆」「没用老公」）

2. **鼓励方式**：
   - ✅ 从「家庭结构 / 角色分工 / 代际差异 / 沟通方式 / 边界感」去解释问题，而不是简单地说「谁坏」
   - ✅ 可以适度吐槽生活里的小尴尬，但要用善意、不过度损人的方式
   - ✅ 多用「从结构上看，这段关系更像是……」这类表述
   - ✅ 不偏袒单一一方，重点帮用户看清"结构"
```

---

## 五、长度 & 层级控制

### 5.1 输出长度约束

**问题**：现在几条专线的 prompt 都挺长，婆媳这条又很「故事化」，需要控制输出长度。

**规则**：

1. **首轮回答**：
   - 字数范围：控制在 600–900 字
   - 层级：最多 3–4 个一级标题（如「整体氛围 / 你的角色 / 伴侣的作用 / 时间节奏 / 建议」）
   - 避免太多嵌套子标题

2. **追问回答**：
   - 字数范围：控制在 300–600 字
   - 层级：最多 2–3 个一级标题
   - 避免长篇大论

**在 prompt 中的说明**：
```
## 输出长度 & 层级控制

1. **首轮回答**：
   - 字数范围：控制在 600–900 字
   - 层级：最多 3–4 个一级标题（如「整体氛围 / 你的角色 / 伴侣的作用 / 时间节奏 / 建议」）
   - 避免太多嵌套子标题

2. **追问回答**：
   - 字数范围：控制在 300–600 字
   - 层级：最多 2–3 个一级标题
   - 避免长篇大论，不要重复首轮总评
```

---

## 六、对齐其他情感专线的规则

### 6.1 风险提示口径统一

**目标**：统一恋爱、婚姻、婆媳三条情感专线的风险提示和敏感话题处理规则。

**统一规则**：

1. **风险提示口径**：
   - 统一使用：「AI 命理视角下的一种看法，仅供参考和娱乐，真正的决定在你自己手里」
   - 或：「这些是从命理角度看的一些倾向和模式，**只适合作为参考，不是给谁定性**。」

2. **敏感话题处理**（家暴、严重心理问题等）：
   - 统一规则：遇到以下内容，要严肃一点、少开玩笑：
     - 家暴、冷暴力、严重控制
     - 明确的心理崩溃、强烈自责或自伤倾向
   - 统一话术：温和提示「命理解读只能陪你聊聊，真正的安全和帮助，需要现实中的支持系统和专业资源。」

3. **「不要宣判式结论」规则**：
   - 统一话术：不使用"注定、永远如此、这辈子都……"等绝对化表述
   - 统一话术：多用"更容易、倾向于、比较有可能、适合"等

**在 prompt 中的说明**：
```
## 风险提示与敏感话题处理（与其他情感专线统一）

1. **风险提示口径**：
   - 统一使用：「AI 命理视角下的一种看法，仅供参考和娱乐，真正的决定在你自己手里」
   - 或：「这些是从命理角度看的一些倾向和模式，**只适合作为参考，不是给谁定性**。」

2. **敏感话题处理**：
   - 遇到以下内容，要严肃一点、少开玩笑：
     - 家暴、冷暴力、严重控制
     - 明确的心理崩溃、强烈自责或自伤倾向
   - 统一话术：温和提示「命理解读只能陪你聊聊，真正的安全和帮助，需要现实中的支持系统和专业资源。」

3. **「不要宣判式结论」规则**：
   - 不使用"注定、永远如此、这辈子都……"等绝对化表述
   - 多用"更容易、倾向于、比较有可能、适合"等
```

---

## 七、Prompt 结构调整建议

### 3.1 在「一、字段来源与含义」部分

**位置**：在列出字段之前，添加一段说明：

```
## 一、字段来源与含义（尽量复用现有字段）

⚠️ **重要提示**：InLawChatContext 的结构基本等同于 MarriageChatContext + 宫位六亲卡的 extra 字段。

以下字段列表中：
- ✅ 标记为「存在」的字段：系统会提供，直接使用
- ⚠️ 标记为「可选」的字段：如果存在则使用，如果不存在则从其他字段推导或忽略
- 📝 标记为「推导」的字段：如果不存在，需要从其他字段推导

你在分析时，要**优先使用存在的字段**，对于不存在的字段，要灵活处理，不要因为缺少某个字段就拒绝分析。
```

### 3.2 在具体字段说明中

对于每个可能不存在的字段，添加标记：

```
- **marriagePattern**（婚姻模式与家庭压力）⚠️ 可选字段：
  - 如果存在，使用以下字段：
    - marriageTendency：整体婚姻节奏
    - stabilityLevel：婚姻整体稳不稳
    - conflictStyle：遇到冲突时的倾向
    - realityPressureFocus：现实压力主要落在哪一块
    - riskHints：婚姻风险提示（如果不存在，可用 `patternAndBearing.riskHints` 替代）
    - healingHints：改善方向（如果存在则使用）
  - 如果不存在，从以下字段推导：
    - 冲突风格：从 `spouseAndExpression.expressionHints` 推断
    - 现实压力：从 `patternAndBearing.tiYongSummary` 推断
    - 风险提示：从 `patternAndBearing.riskHints` 获取
```

---

## 四、具体修改清单

### 修改点 1：字段引用路径修正

1. ✅ `basic.structure.W` → `basic.structure.weights`
2. ✅ `spouse.*` → `spouseAndExpression.*`
3. ✅ `spousePalace.relationsSummary` → `palace.relations`（并说明是对象结构）
4. ✅ `fortune.currentLuck.favorLevel` → `fortune.currentLuck.favourLevel`（拼写修正）

### 修改点 2：添加字段存在性说明

1. ✅ 在「字段来源与含义」开头添加「字段使用原则」
2. ✅ 为 `marriagePattern` 相关字段添加「可选字段」标记和处理说明
3. ✅ 为 `extra` 字段添加「如果存在则使用，否则推导」的说明
4. ✅ 为 `fortune.marriageWindows` 添加「如果不存在则从 years 筛选」的说明
5. ✅ 为 `meta.age` 和 `meta.relationStatusHint` 添加「可选字段」标记

### 修改点 3：补充系统实际存在的字段

1. ✅ 在字段说明中补充 `spouseAndExpression.expressionHints`
2. ✅ 在字段说明中补充 `patternAndBearing.purityLevel`、`tiaoHouSummary`、`tiYongSummary`
3. ✅ 在字段说明中补充 `palace.loveEnvironmentNotes`
4. ✅ 在字段说明中补充 `extra.energyFlowSummary`、`guancaiSummary`、`minggeSummary`

### 修改点 4：保持风格和完整性

1. ✅ 不删除任何原有内容
2. ✅ 保持原有的轻松、幽默风格
3. ✅ 保持所有分析结构和建议
4. ✅ 只修正字段引用，不改变分析逻辑

---

## 五、实施建议

### 5.1 修改方式

1. **直接替换字段路径**：在 prompt 中全局替换错误的字段引用
2. **添加说明段落**：在「字段来源与含义」部分添加字段存在性说明
3. **补充字段说明**：为系统实际存在但 prompt 中未提及的字段添加说明

### 5.2 测试建议

1. **字段存在性测试**：确保 prompt 在字段存在和不存在的情况下都能正常工作
2. **字段路径测试**：确保所有字段引用路径正确
3. **风格一致性测试**：确保修改后的 prompt 风格与原文一致

---

## 六、总结

本次优化主要解决以下问题：

1. ✅ **字段路径不一致**：修正所有字段引用路径，使其与系统实际参数一致
2. ✅ **字段存在性处理**：为可能不存在的字段添加处理说明，确保 prompt 在字段缺失时也能正常工作
3. ✅ **字段补充**：补充系统实际存在但 prompt 中未提及的字段说明

**优化原则**：
- 不简化内容
- 保持原有风格
- 以系统参数为准
- 灵活处理字段缺失情况

---

## 八、典型问题示例（供开发参考，不放入 prompt）

以下是一些典型的婆媳关系问题示例，帮助理解「中国式婆媳场景」的语感，**不放入 prompt**，仅供开发参考：

1. **住一起问题**：
   - 「我跟婆婆住一起每天都很别扭，还要不要继续住在一起？」
   - 「公婆想让我们搬过去一起住，但我更想有自己的空间，这种命盘适合怎么相处？」

2. **话语权问题**：
   - 「公婆总觉得我要听他们的，但我也有自己的想法，这种命盘适合怎么相处？」
   - 「在家里总是婆婆说了算，我该怎么争取一点话语权？」

3. **伴侣角色问题**：
   - 「老公在中间很夹缝，我该怎么跟他沟通？」
   - 「我老公总是站在他妈那边，我该怎么办？」

4. **现实压力问题**：
   - 「婆婆总想管我们怎么花钱，但我也有自己的规划，该怎么平衡？」
   - 「公婆催我们要孩子，但我们还想再等等，这种矛盾怎么处理？」

5. **沟通方式问题**：
   - 「我跟婆婆说话总是容易起冲突，是不是我命里就跟她合不来？」
   - 「婆婆总是用长辈的身份压我，我该怎么回应？」

6. **时间节点问题**：
   - 「什么时候适合跟公婆分开住？」
   - 「这几年跟长辈的关系会不会有改善？」

---

## 九、下一步

1. 根据本方案修改 `XIAOPEI_PROMPT_INLAW` prompt
2. 创建 `InLawChatContext` 类型定义（参考 `LoveChatContext` 和 `ExamChatContext`）
3. 创建 `buildInLawChatContext` 函数（参考 `buildLoveChatContext`）
4. 在 `promptTemplates.ts` 中添加 `XIAOPEI_PROMPT_INLAW` 导出
5. 在对话路由中添加婆媳关系专线处理逻辑

