# 小佩會員 & AI 解讀次數限制 —— 完整實施總結

> **項目**：小佩 App 會員訂閱與 AI 次數限制優化  
> **版本**：精簡技術方案 v1  
> **完成時間**：2024-12-02  
> **狀態**：✅ 全部完成（9/9 任務）

---

## 📋 項目概述

### 核心目標

1. **統一 AI 次數限制**：所有 AI 解讀功能（聊天、神煞、流年等）共用每日額度
2. **會員權益區分**：非會員（首日 10 次 / 次日 5 次）vs 小佩會員（每天 100 次）
3. **假支付流程**：支持月/季/年訂閱，暫不集成真實支付
4. **前端統一錯誤處理**：達到限制時自動彈窗引導升級

### P0 範圍（本輪實施）

✅ **要做的**：
- DB Migration：users 表新增 `ai_calls_today`、`ai_calls_date`
- AI 次數服務：`aiQuotaService.ts`
- LLM 調用封裝：`callDeepSeekStreamWithQuota`
- API 改造：`/api/v1/pro/status` 返回 AI 次數信息
- 假支付 API：`/api/v1/pro/fake-subscribe`
- 前端錯誤處理：統一處理 `AI_DAILY_LIMIT_REACHED`
- 前端訂閱頁面：完全重構

❌ **不做的**：
- 不改字段名（保持 `is_pro`、`pro_expires_at`、`pro_plan`）
- 不集成 Apple/Google IAP + Webhook
- 不新增 `ai_usage_logs` 表
- 不實現多 LLM 策略/降級（固定 DeepSeek）
- 不修改現有 `rateLimit` 中間件

---

## ✅ 已完成任務（9/9）

### 後端（7 項）

#### 1. DB Migration ✅
**文件**：`core/src/database/migrations/011_add_ai_quota_fields.sql`

**內容**：
```sql
ALTER TABLE users
  ADD COLUMN ai_calls_today INT NOT NULL DEFAULT 0 COMMENT '今日已使用 AI 解讀次數',
  ADD COLUMN ai_calls_date  VARCHAR(10) NOT NULL DEFAULT '' COMMENT 'AI 解讀次數計數日期 (YYYY-MM-DD)';

ALTER TABLE users
  MODIFY COLUMN pro_plan ENUM('yearly', 'monthly', 'quarterly', 'lifetime') NULL;

ALTER TABLE subscriptions
  MODIFY COLUMN plan ENUM('yearly', 'monthly', 'quarterly', 'lifetime') NOT NULL;
```

#### 2. AI 次數服務 ✅
**文件**：`core/src/modules/ai/aiQuotaService.ts`

**核心函數**：
- `isProValid()`: 檢查 Pro 狀態
- `isFirstDay()`: 判斷是否首日註冊
- `getDailyLimit()`: 計算每日額度（10/5/100）
- `resetAiCallsIfNeeded()`: 跨日重置
- `checkAndCountAIUsage()`: 檢查額度並計數

#### 3. LLM 調用封裝 ✅
**文件**：`core/src/modules/ai/aiService.ts`

**新增函數**：
```typescript
export async function* callDeepSeekStreamWithQuota(
  userId: string,
  payload: { model: LLMModel; request: LLMRequest }
): AsyncGenerator<StreamChunk> {
  await aiQuotaService.checkAndCountAIUsage(userId);
  const stream = await chatStream(payload);
  for await (const chunk of stream) {
    yield chunk;
  }
}
```

#### 4. LLM 調用入口改造 ✅
**文件**：`core/src/routes/conversation.ts`

**改動**：
- 使用 `callDeepSeekStreamWithQuota` 替代直接調用 `chatStream`
- 捕獲 `AiLimitReachedError` 並返回 429 錯誤

#### 5. /api/v1/pro/status API 改造 ✅
**文件**：`core/src/routes/pro.ts`

**新增返回字段**：
```typescript
{
  isPro: boolean;
  proPlan: string | null;
  proExpiresAt: string | null;
  aiCallsToday: number;      // 新增
  aiDailyLimit: number;      // 新增
  aiRemaining: number;       // 新增
}
```

#### 6. 假支付 API ✅
**文件**：`core/src/routes/pro.ts`

**新增 API**：
```typescript
POST /api/v1/pro/fake-subscribe
Body: { plan: 'monthly' | 'quarterly' | 'yearly' }
```

**邏輯**：
- 計算到期時間（月 +1、季 +3、年 +12）
- 更新 `is_pro`、`pro_plan`、`pro_expires_at`
- 支持續費（在現有到期時間基礎上累加）

#### 7. pro_plan ENUM 支援 quarterly ✅
**文件**：`core/src/database/migrations/011_add_ai_quota_fields.sql`

**改動**：
```sql
MODIFY COLUMN pro_plan ENUM('yearly', 'monthly', 'quarterly', 'lifetime') NULL;
```

---

### 前端（2 項）

#### 8. 統一處理 AI_DAILY_LIMIT_REACHED 錯誤 ✅

**文件變更**：
1. `app/src/services/api/apiClient.ts`：添加錯誤處理
2. `app/src/navigation/navigationRef.ts`（新建）：全局導航引用
3. `app/App.tsx`：註冊 navigationRef

**錯誤處理流程**：
```
用戶發送消息
  ↓
後端檢查 AI 次數
  ↓
達到上限 → 返回 429 + AI_DAILY_LIMIT_REACHED
  ↓
axios 攔截器捕獲
  ↓
顯示對話框：「今日解讀次數已用完」
  ↓
用戶點擊「去開通會員」
  ↓
跳轉到訂閱頁面
```

**對話框內容**：
```
標題：今日解讀次數已用完

內容：您今日的 AI 解讀次數已達上限（5 次）

升級成小佩會員，每天可使用 100 次 AI 解讀與問答。

按鈕：[稍後再說] [去開通會員]
```

#### 9. 重構訂閱頁面 ✅

**文件變更**：
1. `app/src/services/api/proService.ts`（新建）：Pro 會員 API 服務
2. `app/src/screens/ProSubscription/ProSubscriptionScreen.tsx`（重構）：完全重寫

**頁面結構**（按優化建議）：
```
┌─────────────────────────────────┐
│  頭部：小佩 Pro + Crown 圖標     │
├─────────────────────────────────┤
│  當前狀態卡片                    │
│  - 免費用戶/小佩會員（分兩種文案）│
│  - 今日解讀：X / Y 次            │
├─────────────────────────────────┤
│  綠色介紹卡片（僅非會員）         │
│  - 情緒價值文案                  │
│  - 無權益細節                    │
├─────────────────────────────────┤
│  權益對比表（僅非會員）           │
│  - AI 解讀 / 問答（第一行）      │
│  - 功能（第二行）                │
│  - 命盤數量（第三行）            │
│  - CTA 文案                      │
├─────────────────────────────────┤
│  訂閱計劃（僅非會員）             │
│  - 月：NT$ 39                    │
│  - 季：NT$ 99（早鳥價）          │
│  - 年：NT$ 348（早鳥價）         │
├─────────────────────────────────┤
│  底部按鈕（僅非會員）             │
│  - 立即訂閱 - NT$ XXX           │
└─────────────────────────────────┘
```

**權益對比表**（順序調整 + 文案優化）：

| | 非會員 | 小佩會員 |
|---|---|---|
| AI 解讀 / 問答 | 首日 10 次，之後每天 5 次 | **每天 100 次，日常幾乎不會用完** |
| 功能 | 可體驗全部功能 | **全功能 + 高額度，適合長期追蹤與反覆提問** |
| 命盤數量 | 最多 10 個 | 更寬鬆，適合長期使用 |

---

## 🎯 與優化建議的對應

### ✅ 權益比對表順序調整
**建議**：先講「今天痛點」（AI 解讀），再講命盤數量  
**實施**：順序改為 AI 解讀 → 功能 → 命盤數量

### ✅ 文案更 punch
**建議**：「每天 100 次，日常幾乎不會用完」  
**實施**：完全按建議修改

### ✅ 當前狀態卡片分兩種
**建議**：免費用戶和小佩會員顯示不同文案  
**實施**：
- 免費用戶：「已解鎖基礎排盤與簡要解讀」
- 小佩會員：「已解鎖全部解讀與高額 AI 問答」

### ✅ 綠色卡片只保留情緒價值
**建議**：刪除權益細節，只保留情緒價值  
**實施**：「小佩會陪你慢慢看懂自己的節奏，適合長期追蹤、反覆提問。」

### ✅ 命盤數量不做硬限制
**建議**：只在文案層面提示，後端暫時不做硬限制  
**實施**：在優化方案文檔中添加註解

### ✅ API 回傳型別說清楚
**建議**：getStatus() 直接返回 MembershipStatus 對象  
**實施**：使用 `get<T>()` 封裝，自動解包

### ✅ Loading / Error 顯示細節
**建議**：讀取失敗時顯示「載入中…」，不渲染 undefined  
**實施**：添加 loading 狀態和錯誤處理

---

## 📊 數據流程圖

### AI 次數檢查流程

```
用戶發起 AI 調用
  ↓
callDeepSeekStreamWithQuota(userId, payload)
  ↓
checkAndCountAIUsage(userId)
  ↓
1. 從 DB 讀取 user
  ↓
2. resetAiCallsIfNeeded(user)  // 跨日重置
  ↓
3. getDailyLimit(user)  // 計算額度（10/5/100）
  ↓
4. 檢查：aiCallsToday >= limit ?
  ↓
  是 → 拋出 AiLimitReachedError (429)
  ↓
  否 → aiCallsToday += 1，更新 DB
  ↓
調用 aiService.chatStream(payload)
  ↓
返回流式數據
```

### 訂閱流程

```
用戶進入訂閱頁面
  ↓
調用 proService.getStatus()
  ↓
顯示當前狀態（免費/會員）
  ↓
用戶選擇訂閱計劃（月/季/年）
  ↓
點擊「立即訂閱」
  ↓
調用 proService.fakeSubscribe({ plan })
  ↓
後端更新 is_pro、pro_plan、pro_expires_at
  ↓
前端重新調用 getStatus()
  ↓
顯示成功提示
  ↓
返回上一頁
```

---

## 🧪 測試清單

### 後端測試

- [ ] **DB Migration**
  - [ ] 執行 migration
  - [ ] 確認 `ai_calls_today`、`ai_calls_date` 字段存在
  - [ ] 確認 `pro_plan` ENUM 包含 `quarterly`

- [ ] **AI 次數限制**
  - [ ] 非會員首日：10 次後被限制
  - [ ] 非會員次日：5 次後被限制
  - [ ] 小佩會員：100 次後被限制
  - [ ] 跨日重置：第二天額度恢復

- [ ] **假支付 API**
  - [ ] 月訂閱：到期時間 +1 個月
  - [ ] 季訂閱：到期時間 +3 個月
  - [ ] 年訂閱：到期時間 +12 個月
  - [ ] 續費：在現有到期時間基礎上累加

- [ ] **Pro Status API**
  - [ ] 返回 `aiCallsToday`、`aiDailyLimit`、`aiRemaining`
  - [ ] 跨日自動重置

### 前端測試

- [ ] **錯誤處理**
  - [ ] 達到 AI 次數限制時顯示對話框
  - [ ] 點擊「去開通會員」跳轉到訂閱頁
  - [ ] 點擊「稍後再說」關閉對話框

- [ ] **訂閱頁面**
  - [ ] 非會員：顯示完整訂閱流程
  - [ ] 小佩會員：只顯示狀態卡片和「已是會員」提示
  - [ ] 網絡失敗：顯示「載入中…」或「無法載入狀態信息」

- [ ] **訂閱流程**
  - [ ] 選擇訂閱計劃（月/季/年）
  - [ ] 點擊「立即訂閱」
  - [ ] 成功後顯示 Alert
  - [ ] 狀態更新為「小佩會員」

- [ ] **權益對比表**
  - [ ] 順序：AI 解讀 → 功能 → 命盤數量
  - [ ] 文案：「日常幾乎不會用完」、「適合長期追蹤與反覆提問」
  - [ ] CTA：「想要更自由地問小佩，就升級成小佩會員吧。」

---

## 📝 重要注意事項

### 1. 命名一致性

**UI 層**：
- 標題：「小佩 Pro」
- 其他地方：「小佩會員」

**技術層**：
- 變數名：`isPro`, `proPlan`, `proExpiresAt`
- 字段名（DB）：`is_pro`, `pro_plan`, `pro_expires_at`
- API：`/api/v1/pro/status`, `/api/v1/pro/fake-subscribe`

### 2. 命盤數量限制

**重要**：
- ✅ 只在文案層面提示
- ✅ 後端暫時不做硬限制
- ✅ 之後如果真的要控，再開新任務

### 3. 假支付 API

**當前狀態**：
- ✅ 使用 `/api/v1/pro/fake-subscribe`
- ✅ 測試用，不需要真實支付

**未來升級**：
- 集成 Apple IAP
- 集成 Google Play Billing
- 添加 Webhook 處理

### 4. 只支持流式 LLM

**重要**：
- ✅ 所有 LLM 調用都是流式（`chatStream`）
- ✅ 不存在非流式調用
- ✅ 使用 `async function*` 和 `for await`

---

## 🚀 部署步驟

### 1. 執行 DB Migration

```bash
cd core
npm run migrate
```

**預期輸出**：
```
✅ Migration 011_add_ai_quota_fields.sql executed successfully
```

### 2. 重啟後端服務

```bash
cd core
npm run dev
```

**預期輸出**：
```
🚀 Core API Server running on http://localhost:3000
```

### 3. 啟動前端 App

```bash
cd app
npm start
```

### 4. 測試功能

1. **測試 AI 次數限制**
   - 創建非會員測試帳號
   - 連續發送 5 條聊天消息
   - 第 6 條應該觸發錯誤

2. **測試訂閱流程**
   - 進入訂閱頁面
   - 選擇訂閱計劃
   - 點擊「立即訂閱」
   - 確認狀態更新

3. **測試錯誤處理**
   - 達到 AI 次數限制
   - 確認顯示對話框
   - 點擊「去開通會員」
   - 確認跳轉到訂閱頁

---

## 📂 文件變更總結

### 後端文件

| 文件 | 變更類型 | 說明 |
|------|---------|------|
| `core/src/database/migrations/011_add_ai_quota_fields.sql` | 新建 | DB Migration |
| `core/src/modules/ai/aiQuotaService.ts` | 新建 | AI 次數服務 |
| `core/src/modules/ai/aiService.ts` | 修改 | 新增 callDeepSeekStreamWithQuota |
| `core/src/routes/conversation.ts` | 修改 | 使用新的 LLM 封裝 |
| `core/src/routes/pro.ts` | 修改 | 改造 status API + 新增假支付 API |

### 前端文件

| 文件 | 變更類型 | 說明 |
|------|---------|------|
| `app/src/services/api/apiClient.ts` | 修改 | 添加 AI 次數限制錯誤處理 |
| `app/src/services/api/proService.ts` | 新建 | Pro 會員 API 服務 |
| `app/src/navigation/navigationRef.ts` | 新建 | 全局導航引用 |
| `app/App.tsx` | 修改 | 註冊 navigationRef |
| `app/src/screens/ProSubscription/ProSubscriptionScreen.tsx` | 重構 | 完全重寫訂閱頁面 |

### 文檔文件

| 文件 | 變更類型 | 說明 |
|------|---------|------|
| `会员订阅与AI解读次数限制-优化方案.md` | 修改 | 更新權益表順序、文案、注意事項 |
| `后端实施完成总结.md` | 新建 | 後端實施總結 |
| `前端AI错误处理实施完成.md` | 新建 | 前端錯誤處理總結 |
| `前端订阅页面重构完成总结.md` | 新建 | 前端訂閱頁面總結 |
| `小佩会员与AI限制-完整实施总结.md` | 新建 | 完整實施總結（本文檔）|

---

## 🎉 項目完成

### 完成狀態

✅ **全部完成**（9/9 任務）

- ✅ 後端：DB Migration、AI 次數服務、LLM 封裝、API 改造（7 項）
- ✅ 前端：統一錯誤處理、訂閱頁面重構（2 項）

### 核心成果

1. **統一 AI 次數限制**：所有 AI 功能共用每日額度
2. **會員權益清晰**：非會員（5-10 次）vs 小佩會員（100 次）
3. **假支付流程完整**：支持月/季/年訂閱
4. **前端體驗優化**：統一錯誤處理 + 精簡訂閱頁面

### 待測試項

- [ ] 執行 DB Migration
- [ ] 重啟後端服務
- [ ] 測試 AI 次數限制
- [ ] 測試訂閱流程
- [ ] 測試錯誤處理

---

**項目狀態**：✅ 已完成，待測試

**文檔結束**


