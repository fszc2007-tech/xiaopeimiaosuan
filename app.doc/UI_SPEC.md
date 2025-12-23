# 小佩命理 App – UI 設計規範 v1.0

> 目標：**所有前端開發與自動生成代碼，都必須遵守本規範。**

> 要求：**禁止在頁面/組件中直接寫死顏色與尺寸，必須用 Design Token。**

---

## 1. 設計原則（給 Cursor 的高層指導）

1. 風格關鍵詞：**理性、溫和、乾淨、不花哨**。

2. 命理 App，不是遊戲，也不是社交 App：

   * 顏色控制在少數幾個重點色上，避免彩虹風。

   * 留白充足，讓文字與卡片可閱讀、可信任。

3. 底色永遠是**純白**，層級感靠「卡片 + 邊框 + 陰影」解決，不靠一堆不同底色。

---

## 2. Design Tokens 實作規範

### 2.1 顏色（`src/theme/colors.ts`）

**要求**：

* 建立 `colors.ts`，所有顏色**只能從這裡取值**。

* 禁止在任何組件中使用裸的 `'#xxxxxx'`。

```ts
// src/theme/colors.ts

export const colors = {
  // 文字
  ink: '#32343a',             // 主文字（標題、正文）
  textSecondary: '#6b7280',   // 次文字（說明、placeholder）

  // 品牌主色
  brandGreen: '#83cbac',      // 粉綠：療癒、輕提示
  brandBlue: '#648e93',       // 晚波藍：主品牌色 / 主按鈕 / 重點操作
  brandOrange: '#f9723d',     // 莓鶯紅：數據、高亮文字

  // 背景 & 邊框
  bg: '#ffffff',              // App 頁面底色
  cardBg: '#ffffff',          // 卡片底色
  border: '#e5e7eb',          // 分割線、卡片描邊、輸入框邊框

  // 柔色背景（Tag / Icon / 提示用）
  greenSoftBg: '#e3f4ee',     // 粉綠淺底，輕提示、示例 chip
  blueSoftBg: '#e5edf0',      // 淺藍底
  orangeSoftBg: '#fff2e9',    // 淺橘底，警示/提醒

  // 狀態色（後續可用在表單、Toast 等）
  success: '#3fb489',
  error: '#f97373',
  warning: '#fbbf24',

  // 互動態
  brandBluePressed: '#50747a', // 主按鈕 / 氣泡按下
  disabledBg: '#f3f4f6',
  disabledText: '#9ca3af',
};
```

### 顏色使用規範（必須遵守）

* 頁面背景：**一律 `colors.bg`**。

* 卡片背景：`colors.cardBg`，加陰影或邊框。

* 主標題/正文文字：`colors.ink`。

* 次要說明文字 / placeholder：`colors.textSecondary`。

* 主按鈕背景 / 選中狀態：`colors.brandBlue`；文字固定白色。

* 高亮數字 / 關鍵詞：少量使用 `colors.brandOrange`。

* 輕提示、示例 chips、小 icon 背景：`colors.greenSoftBg` 或 `colors.blueSoftBg`。

> 禁止在同一個卡片裡大量同時使用 `brandBlue + brandOrange` 兩種大面積底色，橘色只作為 **點綴**。

---

### 2.2 字體（`src/theme/typography.ts`）

**要求**：

* 定義字體 Token，所有字級從這裡取，不在組件裡寫魔法數字。

* 文案多，以閱讀舒適為主，不要太小。

```ts
// src/theme/typography.ts

export const fontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
};

export const fontWeights = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const lineHeights = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.8,
};
```

**用法建議：**

* App 標題（如「小佩 · 命理助手」）：`fontSizes['2xl']` + `semibold`

* 卡片標題：`fontSizes.lg` + `medium`

* 正文：`fontSizes.base` + `regular`

* 次要說明 / 輕提示：`fontSizes.sm` + `regular`

---

### 2.3 間距 / 圓角 / 陰影（`src/theme/layout.ts`）

```ts
// src/theme/layout.ts

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
};

export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  pill: 9999,
};

export const shadows = {
  card: {
    // React Native style
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
};
```

**規則：**

* 頁面左右內距：預設 `spacing.lg`。

* 卡片內距：上下 `spacing.md`，左右 `spacing.md` 或 `lg`。

* 卡片圓角：預設 `radius.lg`。

* 圓形/膠囊 chips：`radius.pill`。

---

## 3. Logo 與品牌標識

### 3.1 Logo 設計規範

#### 3.1.1 Logo 描述
小佩 App 的 Logo 採用以下設計：

* **核心元素**: 中文「佩」字，以霓虹燈風格呈現
* **視覺風格**: 數位化、未來感、簡約
* **顏色**: 藍紫色漸變（從亮青色到深紫色）
* **外框**: 電路板風格的抽象外框，帶有數位介面元素
* **背景**: 深色背景（接近黑色），帶有微妙的毛玻璃/新擬態效果
* **發光效果**: 霓虹燈發光效果，線條本身具有強烈的發光感

#### 3.1.2 Logo 使用場景

1. **App 圖標**
   * 用於應用商店、桌面圖標
   * 尺寸：1024x1024px（原始尺寸）
   * 格式：PNG（透明背景）

2. **App 內 Logo**
   * 啟動頁、歡迎頁、關於頁面
   * 尺寸：根據使用場景調整（建議 120x120px - 200x200px）

3. **小佩頭像**
   * 聊天介面中的 AI 助手頭像
   * 尺寸：40x40px - 60x60px（圓形顯示）
   * 使用圓形裁剪，保留 Logo 核心視覺

#### 3.1.3 Logo 使用規範

**必須遵守：**

* ✅ Logo 必須保持原始比例，不得拉伸變形
* ✅ 在淺色背景上使用深色版本 Logo
* ✅ 在深色背景上使用發光版本 Logo
* ✅ 頭像使用時，必須使用圓形遮罩
* ✅ 保持 Logo 周圍有足夠的留白（至少 Logo 寬度的 20%）

**禁止：**

* ❌ 不得改變 Logo 的顏色（除非特殊場景需要單色版本）
* ❌ 不得旋轉 Logo（除非特殊設計需求）
* ❌ 不得在 Logo 上添加文字或其他元素
* ❌ 不得使用低解析度版本（避免模糊）

#### 3.1.4 Logo 文件規範

**文件結構：**

```
src/assets/images/
├── logo/
│   ├── logo-full.png          # 完整 Logo（1024x1024）
│   ├── logo-app.png           # App 內使用（200x200）
│   ├── logo-small.png         # 小尺寸（120x120）
│   ├── avatar.png             # 頭像版本（圓形，60x60）
│   ├── avatar-small.png       # 小頭像（40x40）
│   └── logo-icon.svg          # SVG 版本（可選，用於特殊場景）
```

**命名規範：**

* 使用 `logo-` 前綴
* 尺寸在文件名中標註（如 `logo-200.png`）
* 頭像使用 `avatar` 前綴

#### 3.1.5 Logo 在組件中的使用

**導入方式：**

```typescript
// 在組件中導入 Logo
import LogoFull from '@/assets/images/logo/logo-app.png';
import Avatar from '@/assets/images/logo/avatar.png';

// 使用示例
<Image source={LogoFull} style={styles.logo} />
<Image source={Avatar} style={styles.avatar} />
```

**樣式規範：**

```typescript
// Logo 樣式
const logoStyles = {
  logo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30, // 圓形
    resizeMode: 'cover',
  },
};
```

### 3.2 品牌色彩與 Logo 的關係

* Logo 的藍紫色漸變與 `colors.brandBlue` 相呼應
* 在需要強調品牌時，可以使用 Logo 的漸變色作為背景或裝飾元素
* Logo 的發光效果可以在特殊場景（如啟動頁）中作為動畫元素

---

## 4. 組件設計規範

> 要求：所有 UI 組件優先用專案內的封裝（如 `components/common/Button`），不要在頁面直接拼 raw `<Pressable>` + style。

### 4.1 按鈕（Button）

**類型：**

1. `PrimaryButton`

   * 背景：`colors.brandBlue`

   * 文字：白

   * 圓角：`radius.lg`

   * 高度：約 48

   * Pressed 狀態：背景 `colors.brandBluePressed`

2. `SecondaryButton`

   * 背景：白

   * 邊框：`colors.brandBlue`

   * 文字：`colors.brandBlue`

3. `GhostButton`（文字按鈕）

   * 無背景

   * 文字：`colors.brandBlue`

4. Disabled 狀態（所有類型）

   * 背景：`colors.disabledBg`

   * 文字：`colors.disabledText`

   * 禁止交互

**場景規範：**

* 關鍵操作（開始排盤、確認信息、開始分析）→ 必須用 `PrimaryButton`。

* 次要操作（取消、稍後再說、查看詳情）→ `SecondaryButton` 或 `GhostButton`。

---

### 4.2 輸入框（Input）

* 背景：`colors.cardBg`（白）

* 邊框：`colors.border`，圓角 `radius.md`

* 聚焦時邊框色：`colors.brandBlue`

* 文字：`colors.ink`

* placeholder：`colors.textSecondary`

> 禁止使用無邊框樣式的輸入框（命理場景需要「穩」而不是「輕浮」）。

---

### 4.3 Chip / Tag

**品類：**

1. **選擇型 Chip**（如性別、公曆/農曆、本人）

   * 選中：

     * 背景：`colors.brandBlue`

     * 文本：白

   * 未選：

     * 背景：`colors.bg` 或 `colors.disabledBg`

     * 邊框：`colors.border`

     * 文本：`colors.ink`

2. **Quick Chip（示例話術 / 推薦問題）**

   * 背景：`colors.greenSoftBg`

   * 文本：`colors.ink`

   * 圓角：`radius.pill`

   * 內距：左右 `spacing.md`，上下 `spacing.xs`

---

### 4.4 卡片（Card）

* 背景：`colors.cardBg`（白）

* 圓角：`radius.lg`

* 邊框：`colors.border`（細線）

* 陰影：`shadows.card`（視平台可調整）

* 內距：`spacing.md` 或 `lg`

**用於：**

* 首頁歡迎卡片（用戶名 + 歡迎文案）

* 排盤結果卡（四柱 + 日主 + 小摘要）

* 單一命題卡（財富 / 感情 / 事業入口）

---

### 4.5 聊天氣泡（ChatBubble）

**使用規範：**

* 用戶訊息氣泡：

  * 背景：`colors.brandBlue`

  * 文字：白

  * 靠右對齊

  * 圓角：右側較大，左下小角

* 小佩訊息氣泡：

  * 背景：白

  * 邊框：`colors.border`

  * 文字：`colors.ink`

  * 靠左對齊

**小佩頭像 / Icon：**

* 使用官方 Logo 頭像版本（`avatar.png`）

* 尺寸：40x40px - 60x60px

* 圓形顯示，保持 Logo 核心視覺

* 在聊天列表中，頭像右側可配合 `colors.blueSoftBg` 作為背景裝飾（可選）

---

## 5. 版面與布局

1. 每個 Screen 使用統一的 `Container` 組件：

   * 背景色一律 `colors.bg`

   * 左右 padding：`spacing.lg`

   * 底部預留空間給安全區 + 底部輸入框（聊天頁）

2. 使用 `SafeAreaView` 包裹所有頁面，避免瀏海遮擋。

3. 列表頁（如歷史記錄 / 命盤列表）：

   * 頂部標題 + 簡短說明文字

   * 下方採用卡片列表，每卡之間 `spacing.md` 間距

---

## 6. 代碼層規範（Cursor 必須遵守）

1. **禁止**在組件中寫死顏色字串：

   * ❌ `color: '#648e93'`

   * ✅ `color: colors.brandBlue`

2. 樣式一律通過 `StyleSheet.create` 或封裝的 `styled` 函數；

   不在 JSX 裡大量 inline style。

3. 新增 UI 組件時，優先放在：

   * 通用：`src/components/common/`

   * 布局：`src/components/layout/`

   * 命理專用：`src/components/bazi/`（例如 `BaziCard`、`BirthInfoForm`）

4. 所有頁面禁止直接使用 `react-native-paper` 的 default theme 顏色，

   如有使用，必須透過我們的 `colors` 覆寫。

---

## 7. 給 Cursor 的總指令示例（你可以直接貼）

> 從現在開始，請你在重構或新建 React Native UI 時，嚴格遵守以下規則：
>
> 1. 在 `src/theme/colors.ts, typography.ts, layout.ts` 中定義的 Design Tokens 是唯一的顏色、字體與間距來源。
>
> 2. 所有樣式都必須使用這些 Token，不得出現硬編碼的十六進位顏色與隨機數字尺寸。
>
> 3. 主品牌色為 `brandBlue`，用於主按鈕與關鍵操作；`brandOrange` 僅用於高亮數字與關鍵詞；`brandGreen` 及其 soft 背景用於提示、chips 與 icon 背景。
>
> 4. 頁面底色固定為白色卡片 + 邊框/陰影區分層級，不得使用大面積彩色背景。
>
> 5. 聊天氣泡、按鈕、卡片等組件須遵循本規範描述的形狀、顏色與對齊方式，若有不確定，優先選擇簡潔、留白多、文字清晰的方案。
>
> 6. Logo 和頭像必須使用 `src/assets/images/logo/` 目錄下的官方版本，不得使用其他圖標替代。小佩的頭像在聊天介面中必須使用官方 Logo 頭像版本。

---

**文檔版本**: v1.0.0  
**最後更新**: 2024年  
**維護者**: 開發團隊

