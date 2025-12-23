# 小佩 Pro-订阅页面设计文档

## 页面概述

### 页面名称
小佩 Pro 订阅页 / Pro Subscription Page

### 页面定位
- **页面类型**: 订阅/付费页面
- **用户类型**: 所有用户（免费和付费用户）
- **页面层级**: 从「我的」主页进入
- **访问条件**: 用户登录后可见

### 页面目的
在**克制、不打擾**的前提下，向已经使用过免费功能的用户，说清楚小佩 Pro 的价值与三种开通方式。

### 路径
**「我的」 → 「小佩 Pro」**

---

## 功能需求

### 2.1 核心功能

#### 2.1.1 订阅方案选择
- 年度会员（推荐）
- 月度会员
- 终身会员
- 方案切换和权益动态更新

#### 2.1.2 订阅开通
- 选择方案后开通
- 支付流程（后续接入）

#### 2.1.3 状态展示
- 当前用户状态（免费/付费）
- 已选方案摘要

---

## 页面设计

### 3.1 整体布局

**整体风格**:
- 底色: 纯白 `colors.bg`（#ffffff）
- 整体布局: 上下结构，顶部为导航，其余内容可垂直滚动
- 元素风格: 圆角卡片、细边框、浅色背景，避免强烈「销售」感

**主要模块**（从上到下）:
1. 顶部导航栏（返回 + 标题）
2. 当前状态卡片（免费用户状态）
3. 小佩 Pro 介绍卡片（理念与风格）
4. 权益总览卡片（**随选中的方案变化**）
5. 价格方案区（年度 / 月度 / 终身）
6. 当前选中方案摘要 + CTA
7. FAQ 常见问题
8. 底部：恢复购买 + 协议与隐私政策

---

### 3.2 详细区块设计

#### 3.2.1 顶部导航栏

**位置**: 页面最上方，固定于顶部

**样式**:
- 背景: `colors.bg`（白色）
- 边框: 底部 `colors.border`（1px）
- 内边距: 左右 `spacing.lg`，顶部 `spacing.xl`，底部 `spacing.md`

**结构**:

**左侧：返回按钮**:
- 图标: ArrowLeft
- 样式: 圆形按钮
- 尺寸: 36x36px
- 背景: 透明，hover 时 `colors.disabledBg`（浅灰色）
- 点击行为: 返回「我的」页
- 右侧间距: `spacing.sm`

**中间：标题区域**:
- 行 1（小字）: 「我的」
  - 字体大小: `fontSizes.xs`
  - 文字颜色: `colors.textSecondary`
- 行 2: 图标 + 标题
  - 图标: Crown（金色，`colors.brandOrange` 或金色）
  - 尺寸: 16x16px
  - 标题: 「小佩 Pro」
  - 字体大小: `fontSizes.base`
  - 字体粗细: `fontWeights.semibold`
  - 文字颜色: `colors.ink`
  - 图标和文字间距: `spacing.xs`

---

#### 3.2.2 当前状态卡片

**位置**: 顶部导航栏下方

**目的**: 让用户知道「自己不是白用的，已经获得什么」

**卡片样式**:
- 背景: `colors.disabledBg`（浅灰色，60% 透明度）
- 圆角: `radius.lg`
- 边框: `colors.border`（1px）
- 内边距: `spacing.md`
- 上下间距: `spacing.lg`

**内容布局**:

```
┌─────────────────────────────────────────┐
│  [图标]  当前状态              [标签]   │
│          免费用户 · 已解鎖基礎排盤...   │
└─────────────────────────────────────────┘
```

**左侧图标**:
- 背景: `colors.greenSoftBg`（粉绿色）
- 圆角: `radius.md`
- 尺寸: 36x36px
- 图标: Crown（粉绿色，`colors.brandGreen`）
- 图标尺寸: 20x20px
- 右侧间距: `spacing.md`

**中间文字**:
- 小标: 「当前状态」
  - 字体大小: `fontSizes.xs`
  - 文字颜色: `colors.textSecondary`
  - 底部间距: `spacing.xs`
- 主文案: 「免费用户 · 已解锁基础排盤与简要解读」
  - 字体大小: `fontSizes.sm`
  - 字体粗细: `fontWeights.medium`
  - 文字颜色: `colors.ink`

**右侧标签**:
- 文案: 「想要更深入的陪伴？」
- 背景: `colors.greenSoftBg`（浅绿色）
- 边框: `colors.brandGreen`（1px，浅色）
- 圆角: `radius.pill`
- 内边距: 左右 `spacing.sm`，上下 `spacing.xs`
- 字体大小: `fontSizes.xs`
- 文字颜色: `colors.brandGreen`

**行为**: 纯展示，无交互

---

#### 3.2.3 小佩 Pro 介绍卡片

**位置**: 当前状态卡片下方

**卡片样式**:
- 背景: 淡粉绿渐变（`from-emerald-100 via-emerald-50 to-slate-50`）
- 圆角: `radius.xl`（16px）
- 边框: `colors.brandGreen`（1px，60% 透明度）
- 内边距: `spacing.md`
- 上下间距: `spacing.lg`
- 装饰: 右上角圆形装饰（`colors.brandGreen`，20% 透明度）

**内容结构**:

1. **右上角小标签**:
   - 位置: 绝对定位，右上角
   - 图标: Sparkles
   - 文案: 「命理師級別陪伴」
   - 背景: 白色，70% 透明度，毛玻璃效果
   - 边框: `colors.brandGreen`（1px，浅色）
   - 圆角: `radius.pill`
   - 内边距: 左右 `spacing.sm`，上下 `spacing.xs`
   - 字体大小: `fontSizes.xs`
   - 文字颜色: `colors.brandGreen`

2. **标题 & 说明**:
   - 标题: 「升級小佩 Pro」
     - 字体大小: `fontSizes.base`
     - 字体粗细: `fontWeights.semibold`
     - 文字颜色: `colors.ink`
     - 底部间距: `spacing.sm`
   - 说明文案:
     > 不改變你現在的使用方式，只是在你需要更深入解讀的時候，小佩可以走得更遠一點，陪你看懂大運、流年，以及你正在經歷的關鍵階段。
     - 字体大小: `fontSizes.sm`
     - 文字颜色: `colors.textSecondary`
     - 行高: `lineHeights.relaxed`

3. **两组理念说明**:

   **第一组**:
   - 图标: Shield（粉绿色）
   - 标题: 「按照自己的節奏使用」
   - 文案: 「先專心處理你眼前的事情，想看得更完整時，再回來慢慢展開就好。」
   - 布局: 水平排列，左侧图标，右侧文字
   - 图标背景: 白色，80% 透明度，圆形
   - 图标边框: `colors.brandGreen`（1px，浅色）
   - 图标尺寸: 24x24px
   - 标题字体大小: `fontSizes.sm`
   - 标题字体粗细: `fontWeights.medium`
   - 文案字体大小: `fontSizes.xs`
   - 文案文字颜色: `colors.textSecondary`
   - 底部间距: `spacing.sm`

   **第二组**:
   - 图标: MessageCircle（粉绿色）
   - 标题: 「更長久、更完整的對話」
   - 文案: 「對同一張命盤，可以持續追問、記錄與回看，不再被次數打斷。」
   - 样式同第一组

---

#### 3.2.4 权益总览卡片

**位置**: 小佩 Pro 介绍卡片下方

**标题**:
- 文案: 「升級後你可以獲得」
- 字体大小: `fontSizes.sm`
- 字体粗细: `fontWeights.semibold`
- 文字颜色: `colors.ink`
- 底部间距: `spacing.sm`

**卡片样式**:
- 背景: `colors.disabledBg`（浅灰色，60% 透明度）
- 圆角: `radius.lg`
- 边框: `colors.border`（1px）
- 内边距: `spacing.md`
- 上下间距: `spacing.lg`

**权益列表**:
- 显示当前**选中的方案**对应的 3 条权益
- 每条权益前面有粉绿勾勾（Check 图标）

**权益项样式**:
- 布局: 水平排列，左侧图标，右侧文字
- 图标: Check（粉绿色）
- 图标背景: `colors.brandGreen`（90% 透明度），圆形
- 图标尺寸: 16x16px
- 图标颜色: 白色
- 权益文字:
  - 字体大小: `fontSizes.sm`
  - 文字颜色: `colors.textSecondary`
  - 行高: `lineHeights.relaxed`
- 权益项之间间距: `spacing.sm`

**动态行为**:
- 使用 `selectedPlanId` 变量记录当前选中的方案（yearly / monthly / lifetime）
- `planBenefitsMap` 根据方案 id 返回不同权益列表
- 每次点击不同方案卡片时，这个列表会即时切换

---

#### 3.2.5 价格方案区

**位置**: 权益总览卡片下方

**标题区域**:
- 左侧标题: 「選擇一個適合你的方式」
  - 字体大小: `fontSizes.sm`
  - 字体粗细: `fontWeights.semibold`
  - 文字颜色: `colors.ink`
- 右侧灰字: 「價格只是示意，可在代碼中自行調整」
  - 字体大小: `fontSizes.xs`
  - 文字颜色: `colors.textSecondary`
- 布局: 水平排列，两端对齐
- 底部间距: `spacing.sm`

**方案列表**:

每个方案是一张可点击卡片：

```
┌─────────────────────────────────────────┐
│  [年度會員] [推薦]      ¥*** / 年  [○] │
│  長期陪伴，性價比更高   折算約 ¥** / 月 │
└─────────────────────────────────────────┘
```

**卡片样式**:
- 背景: `colors.cardBg`（白色）
- 圆角: `radius.lg`
- 边框: `colors.border`（1px）
- 阴影: `shadows.card`
- 内边距: `spacing.md`
- 方案之间间距: `spacing.sm`
- 点击反馈: `activeOpacity: 0.7`

**选中状态样式**:
- 边框: `colors.brandGreen`（2px）
- 背景: `colors.greenSoftBg`（浅绿色，60% 透明度）

**年度方案特殊样式**（`highlight: true`）:
- 默认边框: `colors.brandGreen`（1px，浅色）
- 默认背景: `colors.greenSoftBg`（浅绿色，40% 透明度）
- 选中时更突出

**卡片内容布局**:

**左侧**:
- 标题: 「年度會員」「月度會員」「終身會員」
  - 字体大小: `fontSizes.sm`
  - 字体粗细: `fontWeights.semibold`
  - 文字颜色: `colors.ink`
- 标签: 「推薦」「先試一試」「深度用戶」
  - 背景: `colors.ink`（黑色）
  - 文字颜色: 白色
  - 圆角: `radius.pill`
  - 内边距: 左右 `spacing.xs`，上下 `spacing.xs / 2`
  - 字体大小: `fontSizes.xs`
  - 左侧间距: `spacing.xs`
- 说明: 「長期陪伴，性價比更高」等
  - 字体大小: `fontSizes.sm`
  - 文字颜色: `colors.textSecondary`
  - 顶部间距: `spacing.xs`

**右侧**:
- 价格: 「¥*** / 年」「¥*** / 月」「¥*** 一次性」
  - 字体大小: `fontSizes.sm`
  - 字体粗细: `fontWeights.semibold`
  - 文字颜色: `colors.ink`
- 补充说明: 「折算約 ¥** / 月」「隨時可取消」「適合已非常認同小佩的你」
  - 字体大小: `fontSizes.xs`
  - 文字颜色: `colors.textSecondary`
  - 顶部间距: `spacing.xs`

**最右侧：单选圆点**:
- 未选中: 圆形边框，白色背景
- 选中: 粉绿实心圆（`colors.brandGreen`）
- 尺寸: 20x20px
- 边框: `colors.border`（1px）

**点击行为**:
- 点击卡片 → `selectedPlanId = plan.id`
- 同时更新:
  - 上方「升級後你可以獲得」列表
  - 下方「已選擇 XXX · 價格」区域

---

#### 3.2.6 当前选中方案摘要 + CTA

**位置**: 价格方案区下方

**卡片样式**:
- 背景: `colors.disabledBg`（浅灰色，80% 透明度）
- 圆角: `radius.lg`
- 边框: `colors.border`（1px）
- 内边距: `spacing.md`
- 上下间距: `spacing.lg`

**内容布局**:

**左侧**:
- 小字: 「已選擇」
  - 字体大小: `fontSizes.xs`
  - 文字颜色: `colors.textSecondary`
- 方案与价格: 「{{selectedPlan.label}} · {{selectedPlan.priceLabel}}」
  - 字体大小: `fontSizes.sm`
  - 字体粗细: `fontWeights.medium`
  - 文字颜色: `colors.ink`

**右侧主按钮**:
- 文案: 「開通小佩 Pro」
- 按钮类型: `PrimaryButton`
- 背景色: `colors.ink`（黑色）
- 文字颜色: 白色
- 圆角: `radius.pill`
- 内边距: 左右 `spacing.lg`，上下 `spacing.sm`
- 字体大小: `fontSizes.sm`
- 字体粗细: `fontWeights.medium`
- 点击行为: 调用 `handleSelectPlan(selectedPlan.id)`，后续接入支付流程

**下方灰字提示**:
- 文案: 「訂閱可隨時在應用商店取消續費；已支付的周期內，你的權益不會被中斷。小佩不會以任何形式出售或外泄你的命盤與聊天內容。」
- 字体大小: `fontSizes.xs`
- 文字颜色: `colors.textSecondary`
- 行高: `lineHeights.relaxed`
- 顶部间距: `spacing.sm`

---

#### 3.2.7 FAQ 区域

**位置**: 当前选中方案摘要下方

**标题**:
- 文案: 「常見問題」
- 字体大小: `fontSizes.sm`
- 字体粗细: `fontWeights.semibold`
- 文字颜色: `colors.ink`
- 底部间距: `spacing.sm`

**卡片样式**:
- 背景: `colors.cardBg`（白色）
- 圆角: `radius.lg`
- 边框: `colors.border`（1px）
- 内边距: 0
- 上下间距: `spacing.lg`

**FAQ 项样式**:
- 使用折叠形式（Accordion）
- 每个 FAQ 项之间用分割线分隔
- 内边距: 左右 `spacing.md`，上下 `spacing.sm`

**问题（Summary）**:
- 布局: 水平排列，左侧问题，右侧箭头
- 字体大小: `fontSizes.sm`
- 文字颜色: `colors.ink`
- 箭头: 向右（›），展开时旋转 90 度
- 箭头颜色: `colors.textSecondary`
- 点击行为: 展开/收起答案

**答案（Details）**:
- 字体大小: `fontSizes.sm`
- 文字颜色: `colors.textSecondary`
- 行高: `lineHeights.relaxed`
- 顶部间距: `spacing.sm`
- 内边距: 底部 `spacing.sm`

---

#### 3.2.8 底部：恢复购买与协议

**位置**: 页面最底部

**样式**:
- 内边距: 顶部 `spacing.md`，底部 `spacing.lg`
- 对齐方式: 居中

**恢复购买按钮**:
- 文案: 「恢復購買」
- 按钮类型: `GhostButton`（文字按钮）
- 文字颜色: `colors.textSecondary`
- 字体大小: `fontSizes.xs`
- 下划线: hover 时显示
- 底部间距: `spacing.sm`

**协议区**:
- 布局: 水平排列，用「·」分隔
- 链接: 「用戶協議」「隱私政策」
- 文字颜色: `colors.textSecondary`
- 字体大小: `fontSizes.xs`
- 下划线: hover 时显示
- 点击行为: 跳转到对应协议页面

---

## 数据需求

### 4.1 方案数据

#### 4.1.1 方案列表

```typescript
interface Plan {
  id: 'yearly' | 'monthly' | 'lifetime';
  label: string;           // 方案名称
  tag?: string;            // 标签（推荐/先試一試/深度用戶）
  description: string;     // 说明
  priceLabel: string;      // 价格显示（如「¥*** / 年」）
  subLabel: string;        // 补充说明
  highlight: boolean;      // 是否高亮（年度方案）
}

const plans: Plan[] = [
  {
    id: 'yearly',
    label: '年度會員',
    tag: '推薦',
    description: '長期陪伴，性價比更高',
    priceLabel: '¥*** / 年',
    subLabel: '折算約 ¥** / 月',
    highlight: true,
  },
  {
    id: 'monthly',
    label: '月度會員',
    tag: '先試一試',
    description: '適合想先體驗一段時間',
    priceLabel: '¥*** / 月',
    subLabel: '隨時可取消',
    highlight: false,
  },
  {
    id: 'lifetime',
    label: '終身會員',
    tag: '深度用戶',
    description: '一次開通，長期使用',
    priceLabel: '¥*** 一次性',
    subLabel: '適合已非常認同小佩的你',
    highlight: false,
  },
];
```

#### 4.1.2 权益映射

```typescript
interface PlanBenefitsMap {
  [key: string]: string[];
}

const planBenefitsMap: PlanBenefitsMap = {
  yearly: [
    '在未來 12 個月內，完整使用大運 / 流年 / 流月等深度解讀功能。',
    '一年內和小佩針對同一張命盤反覆追問，所有重點問題都能慢慢展開。',
    '年度期間可持續累積紀錄與標註，方便回顧這一年走過的關鍵節點。',
  ],
  monthly: [
    '在這一個計費週期內，解鎖完整的大運 / 流年 / 流月深度解讀。',
    '期間內可暢聊當前最在意的主題，享受與年度方案相同的 Pro 權益。',
    '適合短期試用，或在當下階段集中處理一件重要的事情。',
  ],
  lifetime: [
    '一次開通後，長期享有小佩 Pro 的所有核心功能與後續升級。',
    '人生不同階段（轉職、結婚、生子等）都可以回到同一張命盤持續追問。',
    '為自己與家人建立穩定的命盤檔案庫，之後新增的高級能力也會優先開啟。',
  ],
  default: [
    '完整大運 / 流年 / 流月深度解讀',
    '針對財運 / 感情 / 事業的專題分析',
    '和小佩長聊、多聊，追問不再受次數限制',
    '可為自己與家人建立多個命盤檔案',
    '未來新增的大部分高級功能優先解鎖',
  ],
};
```

---

### 4.2 用户状态接口

#### 4.2.1 获取用户订阅状态

**接口**: `GET /api/pro/status`

**请求参数**: 无（从 token 中获取用户 ID）

**响应**:
```typescript
interface GetProStatusResponse {
  is_pro: boolean;           // 是否为 Pro 用户
  current_plan?: {
    id: 'yearly' | 'monthly' | 'lifetime';
    label: string;
    expires_at?: string;     // 到期时间（年度/月度）
  };
  free_features: string[];   // 免费功能列表
}
```

---

### 4.3 订阅接口

#### 4.3.1 创建订阅订单

**接口**: `POST /api/pro/subscribe`

**请求参数**:
```typescript
interface CreateSubscriptionRequest {
  plan_id: 'yearly' | 'monthly' | 'lifetime';
  payment_method: 'app_store' | 'google_play' | 'other'; // 支付方式
}
```

**响应**:
```typescript
interface CreateSubscriptionResponse {
  order_id: string;          // 订单 ID
  payment_url?: string;      // 支付链接（如果需要）
  // 其他支付相关信息
}
```

#### 4.3.2 恢复购买

**接口**: `POST /api/pro/restore`

**请求参数**: 无（从 token 中获取用户 ID）

**响应**:
```typescript
interface RestorePurchaseResponse {
  success: boolean;
  message: string;
  subscription?: {
    id: string;
    plan_id: string;
    expires_at?: string;
  };
}
```

---

## 交互流程

### 5.1 用户操作流程

1. **进入页面**
   - 用户从「我的」主页点击「小佩 Pro」
   - 页面加载用户状态和方案列表
   - 默认选中年度方案（`selectedPlanId = 'yearly'`）

2. **查看介绍**
   - 用户滚动查看当前状态、Pro 介绍、权益说明

3. **选择方案**
   - 点击不同的方案卡片
   - 方案卡片选中状态更新
   - 权益列表即时切换
   - 底部摘要区域更新

4. **开通订阅**
   - 点击「開通小佩 Pro」按钮
   - 调用 `handleSelectPlan(selectedPlan.id)`
   - 后续接入支付流程

5. **查看 FAQ**
   - 点击 FAQ 项展开/收起
   - 查看常见问题答案

6. **恢复购买**
   - 点击「恢復購買」按钮
   - 调用恢复购买接口

---

### 5.2 状态管理

#### 5.2.1 React 状态

```typescript
const [selectedPlanId, setSelectedPlanId] = useState<'yearly' | 'monthly' | 'lifetime'>('yearly');
```

#### 5.2.2 事件处理

```typescript
const handleSelectPlan = (id: string) => {
  setSelectedPlanId(id);
  // TODO: 在这里接入实际支付流程 / Router 跳转
};
```

---

## 技术实现

### 6.1 技术要点

- 页面滚动实现（ScrollView）
- 方案选择状态管理
- 权益列表动态更新
- Accordion 折叠组件
- 支付流程集成（后续）
- 数据加载和错误处理

### 6.2 相关文件结构

```
src/
├── screens/
│   └── Pro/
│       ├── ProSubscriptionScreen.tsx  # Pro 订阅页面
│       └── components/
│           ├── StatusCard.tsx         # 当前状态卡片
│           ├── IntroCard.tsx          # Pro 介绍卡片
│           ├── BenefitsCard.tsx       # 权益总览卡片
│           ├── PlanCard.tsx           # 方案卡片组件
│           ├── SummaryCard.tsx        # 摘要卡片组件
│           └── FAQAccordion.tsx       # FAQ 折叠组件
├── services/
│   └── api/
│       └── proService.ts              # Pro API
└── types/
    └── pro.ts                         # Pro 类型定义
```

---

## 设计规范

### 7.1 视觉设计

- **遵循 UI_SPEC.md 中的设计规范**
- 使用 Design Tokens（colors, typography, layout）
- 整体背景为纯白色
- 卡片使用圆角、边框、阴影区分层级
- 保持充足的留白
- **克制、不打擾**的设计风格

### 7.2 交互设计

- 页面滚动流畅
- 方案选择反馈明确
- 权益列表切换平滑
- FAQ 展开/收起动画

### 7.3 响应式设计

- 适配不同屏幕尺寸
- 内容在小屏设备上可正常滚动

---

## 待确认事项

- [x] 页面布局和区块设计（已确认）
- [ ] 具体价格设置
- [ ] 支付流程的具体实现方式
- [ ] 恢复购买的具体实现方式
- [ ] 是否需要支持试用期

---

## 更新记录

- **创建日期**: 2024年11月
- **文档版本**: v1.0.0
- **最后更新**: 2024年11月
- **更新内容**: 
  - 初始版本
  - 包含完整的订阅页面设计
- **维护者**: 开发团队

