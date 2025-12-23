# Phase 11 - P3 优化实施方案

**任务来源**: `开发完成总结-全栈实现.md` (238-246行)  
**实施时间**: 2024-11-18

---

## 📋 优化任务总览

### P0（核心功能，立即实施）
1. ✅ **追问建议展示**（ChatScreen）
   - Core API: `POST /api/v1/reading/follow-ups`
   - 数据结构: `{ suggestions: string[] }`
   - 显示位置: 消息气泡下方

2. ✅ **五行分布图表**（基本信息页 - BasicInfoTab）
   - 数据来源: `chart.analysis.wuxingPercent`
   - 格式: `{ '木': 18, '火': 16, '土': 20, '金': 32, '水': 14 }`
   - 可视化: 柱状图 / 饼图

3. ✅ **身强身弱评分条**（基本信息页 - BasicInfoTab）
   - 数据来源: `chart.analysis.dayMaster`
   - 格式: `{ score: 0.65, band: '身强', detail: {...} }`
   - 可视化: 渐变色进度条 + 分档标记

### P1（重要功能）
4. ⏳ **四柱总表完整实现**（命盘总览页 - OverviewTab）
   - 数据来源: `chart.pillars`
   - 包含: 天干、地支、藏干、十神、神煞

5. ⏳ **大运序列完整实现**（大运流年页 - FortuneTab）
   - 数据来源: `chart.fortune.luckCycle`
   - 显示: 起运年龄、大运干支、年龄区间

### P2（后续优化）
6. ⏳ **国际化（zh-HK）**
   - i18next 配置
   - 翻译文件

7. ⏳ **单元测试**
   - Jest 配置
   - 核心组件测试

8. ⏳ **E2E 测试**
   - Detox 配置
   - 关键流程测试

---

## 🎯 Phase 11-1: 追问建议展示

### 需求分析

**设计文档**: `app.doc/features/聊天页设计文档（公共组件版）.md`

**核心功能**:
- 在 AI 回复消息气泡下方显示 3个追问建议（Chip样式）
- 点击追问建议 = 发送该消息
- 追问建议由后端异步生成，前端轮询或监听更新

**API 接口**:
```typescript
// 流式消息接口已包含追问建议生成（异步）
POST /api/v1/chat/conversations/:conversationId/messages
// 返回 SSE 流：
// data: { type: 'done', conversationId, messageId }

// 查询消息详情（包含 follow_ups 字段）
GET /api/v1/chat/conversations/:conversationId/messages
// 返回: { messages: [ { id, content, follow_ups: string[] } ] }

// 手动生成追问建议（可选）
POST /api/v1/reading/follow-ups
Body: { lastUserQuestion, lastAssistantResponse, model? }
Response: { success: true, data: { suggestions: string[] } }
```

**数据结构**:
```typescript
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  followUps?: string[]; // 追问建议（最多3个）
  createdAt: string;
}
```

**实现方案**:
1. ChatScreen 从 API 获取消息列表时，解析 `follow_ups` 字段
2. 在 MessageBubble 组件下方添加 FollowUpChips 组件
3. 点击 Chip 调用 `handleSendMessage(suggestion)`

**UI 设计**:
- Chip 样式: 浅蓝色背景 (`blueSoftBg`)
- 文字颜色: `brandBlue`
- 间距: `spacing.sm`
- 位置: 紧贴 AI 消息气泡下方

---

## 🎯 Phase 11-2: 五行分布图表

### 需求分析

**设计文档**: `app.doc/features/基本信息设计文档.md`

**数据来源**:
```typescript
// ChartDetailScreen > BasicInfoTab
const wuxingData = currentChart.analysis.wuxingPercent;
// 示例: { '木': 18, '火': 16, '土': 20, '金': 32, '水': 14 }
```

**可视化方案**:

**方案 A: 柱状图（推荐）**
- 五个柱子，高度对应百分比
- 每个柱子颜色对应五行（木绿、火红、土黄、金白、水蓝）
- 柱子上方显示百分比数字

**方案 B: 饼图**
- 五个扇区，大小对应百分比
- 每个扇区颜色对应五行

**实现方案**:
1. 创建 `WuXingChart` 组件
2. 使用 `react-native-svg` 绘制图表（0依赖图表库）
3. 放置在 BasicInfoTab 卡片中

**UI 设计**:
```typescript
// 五行颜色映射
const WUXING_COLORS = {
  '木': colors.brandGreen,  // 绿色
  '火': colors.brandRed,    // 红色
  '土': colors.yellowPro,   // 黄色
  '金': colors.ink,         // 深色（金）
  '水': colors.brandBlue,   // 蓝色
};
```

---

## 🎯 Phase 11-3: 身强身弱评分条

### 需求分析

**设计文档**: `app.doc/features/基本信息设计文档.md`

**数据来源**:
```typescript
// ChartDetailScreen > BasicInfoTab
const dayMasterData = currentChart.analysis.dayMaster;
// 示例: { score: 0.65, band: '身强', detail: {...} }
```

**分档标准**:
- 0.0 - 0.22: 从弱（红色）
- 0.22 - 0.45: 身弱（橙色）
- 0.45 - 0.62: 平衡（绿色）
- 0.62 - 0.85: 身强（蓝色）
- 0.85 - 1.0: 从强（深蓝色）

**实现方案**:
1. 创建 `DayMasterStrengthBar` 组件
2. 渐变色进度条：从红到蓝
3. 在 score 位置显示指示器
4. 下方显示分档标记（5个刻度）
5. 右侧显示当前等级文字

**UI 设计**:
```typescript
// 渐变色配置
const GRADIENT_COLORS = [
  colors.brandRed,    // 0.0 - 从弱
  '#FF9800',          // 0.22 - 身弱
  colors.brandGreen,  // 0.45 - 平衡
  colors.brandBlue,   // 0.62 - 身强
  colors.ink,         // 0.85 - 从强
];

// 分档标记位置
const BAND_POSITIONS = [0, 0.22, 0.45, 0.62, 0.85, 1.0];
const BAND_LABELS = ['从弱', '身弱', '平衡', '身强', '从强'];
```

---

## 🎯 Phase 11-4: 四柱总表完整实现

### 需求分析

**设计文档**: `app.doc/features/命盤總覽设计文档.md`

**数据来源**:
```typescript
// ChartDetailScreen > OverviewTab
const pillarsData = currentChart.pillars;
// 格式: { year, month, day, hour }
// 每柱包含: stem, branch, canggan, shishen, shensha...
```

**显示内容**:
1. **四柱表头**: 年柱、月柱、日柱、时柱
2. **天干行**: 甲、乙、丙、丁...
3. **地支行**: 子、丑、寅、卯...
4. **藏干行**: 子(癸)、丑(己癸辛)...
5. **十神行**: 比肩、劫财、食神...
6. **神煞行**: 天乙贵人、文昌、桃花...（可点击）

**实现方案**:
1. 创建 `FourPillarsTable` 组件
2. 使用 `View` + `Text` 构建表格
3. 神煞行支持点击，打开 `ShenShaBottomSheet`

---

## 🎯 Phase 11-5: 大运序列完整实现

### 需求分析

**设计文档**: `app.doc/features/大运流年页面设计文档.md`（假设存在）

**数据来源**:
```typescript
// ChartDetailScreen > FortuneTab
const luckCycleData = currentChart.fortune.luckCycle;
// 格式: [ { stem, branch, startAge, endAge, ... } ]
```

**显示内容**:
1. **起运年龄**: 如"起运年龄：3岁2个月"
2. **大运序列**: 横向滚动卡片
3. **每个大运卡片**:
   - 干支（如"癸卯"）
   - 年龄区间（如"3-12岁"）
   - 当前标记（如果在当前大运）

**实现方案**:
1. 创建 `LuckCycleList` 组件
2. 使用 `FlatList` 横向滚动
3. 高亮当前大运

---

## 📦 技术选型

### 图表库选择
**0 依赖方案（推荐）**:
- 使用 `react-native-svg` 绘制自定义图表
- 优势: 轻量、可控、符合 UI 规范
- 劣势: 需手写绘制逻辑

**第三方库方案**:
- `victory-native`: 功能强大，但体积大
- `react-native-chart-kit`: 简单易用，但定制性差

**决策**: 采用 `react-native-svg` 0 依赖方案

### 国际化策略
- 使用现有 `i18next` 配置
- 创建 `zh-HK.json` 翻译文件
- 所有文本通过 `t()` 函数包裹

---

## 🚀 实施顺序

### Phase 11-1（本次）
1. ✅ 追问建议展示（ChatScreen）
2. ✅ 五行分布图表（BasicInfoTab）
3. ✅ 身强身弱评分条（BasicInfoTab）

### Phase 11-2（下次）
4. 四柱总表完整实现（OverviewTab）
5. 大运序列完整实现（FortuneTab）

### Phase 11-3（后续）
6. 国际化 zh-HK
7. 单元测试
8. E2E 测试

---

## 📝 开发规范

### 遵循文档
- ✅ UI_SPEC.md - 100% 使用 Design Tokens
- ✅ API接口统一规范.md - 所有 API 调用遵循规范
- ✅ 前端路由与页面结构设计文档.md（如果存在）
- ✅ 状态管理与数据模型规范.md（如果存在）

### 代码质量
- ✅ TypeScript 类型完整
- ✅ 无硬编码颜色/尺寸
- ✅ 组件注释完整
- ✅ 无 Linter 错误

### API 集成
- ✅ 使用现有 `apiClient` (axios + interceptors)
- ✅ 错误处理统一
- ✅ 加载状态清晰

---

## ⏱️ 工作量预估

| 任务 | 预计时间 | 优先级 |
|------|---------|--------|
| 追问建议展示 | 1-2 小时 | P0 |
| 五行分布图表 | 2-3 小时 | P0 |
| 身强身弱评分条 | 2-3 小时 | P0 |
| 四柱总表 | 3-4 小时 | P1 |
| 大运序列 | 2-3 小时 | P1 |
| 国际化 | 1-2 小时 | P2 |
| 单元测试 | 4-6 小时 | P2 |
| E2E 测试 | 4-6 小时 | P2 |

**Phase 11-1 总计**: 5-8 小时

---

## ✅ 验收标准

### 追问建议
- ✅ AI 回复后显示追问建议
- ✅ 点击追问建议 = 发送消息
- ✅ 加载状态清晰
- ✅ 无追问时不显示

### 五行分布图表
- ✅ 图表正确显示百分比
- ✅ 五行颜色正确
- ✅ 数字标签清晰
- ✅ 响应式布局

### 身强身弱评分条
- ✅ 进度条正确显示 score
- ✅ 指示器位置准确
- ✅ 分档标记清晰
- ✅ 当前等级文字显示

---

**方案确认时间**: 2024-11-18  
**开始实施**: 立即开始 🚀

