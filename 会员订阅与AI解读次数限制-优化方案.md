# 小佩會員 & AI 解讀次數限制 —— 精簡技術方案 v1

> **版本**：v1（只做最小可用版 P0）  
> **目標**：
> * 不改 Pro 命名
> * 不接 IAP / Webhook（先用假支付）
> * 不搞多模型策略 / 日誌大表
> * 固定使用 DeepSeek（可在後台配置 default provider）

---

## 0. 原則（必看）

### 0.1 明確不要做的（直接砍掉）

1. ❌ **不要全系統改名 `pro → vip`**
   * 後端保留 `is_pro` / `pro_expires_at` / `pro_plan` 命名不變。
   * 對用戶顯示「小佩會員」即可，code 層仍然用 Pro。

2. ❌ **不要現在接 Apple / Google IAP + Webhook**
   * 不實作：
     * `POST /membership/webhook/apple`
     * `POST /membership/webhook/google`
     * auto_renew 狀態、退款處理等。
   * 目前只需要一個「假支付」：
     → 前端點「開通會員」→ 後端直接把 user 設成 Pro（測試用）。

3. ❌ **不要新增 `ai_usage_logs` 這種完整日誌表**
   * 不需要新增任何新的表來記錄每次 LLM 調用。
   * 需要 debug 看 log 可以靠現有 log 系統。

4. ❌ **不要做 LLM 多提供商策略 / fallback / 依會員選模型**
   * 目前雖然已配置 3 個 provider（DeepSeek、GPT-4o、Qwen），
   * 但 **這一輪固定使用 DeepSeek**，其他只當備用，不寫任何選擇策略。
   * 不做：
     * 根據會員狀態挑不同模型
     * 根據場景自動選模型
     * DeepSeek 失敗自動切 GPT / Qwen 等降級機制

5. ❌ **不要動現有 `rateLimit` 中間件邏輯**
   * 先保留原有「排盤 / chat 限流」當多一層安全網。
   * 這次新增的「AI 解讀次數限制」是一套**額外**邏輯。

---

## 1. 這次要完成的功能（P0 範圍）

1. ✅ 統一「AI 解讀次數」邏輯（與 LLM provider 無關）
   * 概念：只要調用一次 DeepSeek，就算 1 次。
   * 所有 AI 解讀（問答 / 總覽 / 專項 / 流年）共用同一個「次數池」。

2. ✅ 非會員 / 會員的每日上限規則
   * **非會員（Free）**
     * 註冊首日：每天 10 次
     * 第二天開始：每天 5 次
   * **會員（Pro / 小佩會員）**
     * 每天 100 次

3. ✅ 在 `users` 表新增兩個欄位：
   * `ai_calls_today`：今日已使用次數（INT，預設 0）
   * `ai_calls_date`：計數日期（VARCHAR(10)，格式 `'YYYY-MM-DD'`）

4. ✅ 實作一套通用的「檢查 & 累計 AI 次數」工具函式：
   * `isProValid(user)`
   * `isFirstDay(user)`
   * `getDailyLimit(user)`
   * `resetAiCallsIfNeeded(user)`
   * `checkAndCountAIUsage(userId)`

5. ✅ 封裝 DeepSeek 調用：
   * `callDeepSeekStreamWithQuota(userId, payload)`（流式）
   
   **要求：所有調用 DeepSeek 的地方都要改成走這個封裝，不再直接調 `aiService.chatStream()`。**

6. ✅ 新增會員狀態查詢 API（或擴充現有 `/pro/status`）：
   * 回傳：`isPro`, `proPlan`, `proExpiresAt`, `aiCallsToday`, `aiDailyLimit`, `aiRemaining`。

7. ✅ 前端訂閱頁：
   * 顯示三個方案（39 / 99 / 348 元）＋早鳥文案。
   * 顯示：今日解讀 `aiCallsToday / aiDailyLimit`。
   * 「開通會員」按鈕先打假接口，把帳號設成 Pro，設一個過期時間（測試流）。

---

## 2. LLM / Provider 部分要怎麼改（保持最小）

> 前提：系統已支援多 provider（DeepSeek、GPT-4o、Qwen），且可以在後台設 default provider。

**這一輪的要求：**

1. **後台配置層**
   * 仍然允許配置多個 provider 的 key。
   * 仍然保留「設置預設模型」的功能，但運營上請務必把 default 設為 DeepSeek。

2. **程式邏輯層**
   * quota 邏輯**完全不關心是用哪個 LLM**，只關心「有沒有調用一次 aiService.chatStream」。
   * `callDeepSeekStreamWithQuota` 裡：
     * 先調 `checkAndCountAIUsage(userId)`
     * 再用現有 `aiService.chatStream()`
     * `aiService.chatStream()` 內部會自己根據系統設定選 default provider（務必配置為 DeepSeek）。

3. **不新增任何與 provider 有關的條件判斷**
   * 不要有「如果 is_pro 就用某模型」這種 if。
   * 不要有 fallback 邏輯。

---

## 3. DB 變更（實作層）

### 3.1 users 表

假設目前 `users` 表已經有：
* `is_pro`（TINYINT or BOOLEAN）
* `pro_expires_at`（DATETIME / TIMESTAMP）
* `pro_plan`（VARCHAR / ENUM）
* `created_at`

**此次新增：**

```sql
ALTER TABLE users
  ADD COLUMN ai_calls_today INT NOT NULL DEFAULT 0,
  ADD COLUMN ai_calls_date  VARCHAR(10) NOT NULL DEFAULT '';
```

> 不要刪、不改欄位名 `is_pro` / `pro_expires_at` / `pro_plan`。

**初始化建議：**
* `ai_calls_today = 0`
* `ai_calls_date = ''`（第一次使用時會被重置）

---

### 3.2 subscriptions 表（可選，用於支援季度方案）

如果 `pro_plan` 是 ENUM，需要新增 `quarterly`：

```sql
ALTER TABLE users
  MODIFY COLUMN pro_plan ENUM('yearly', 'monthly', 'quarterly', 'lifetime') NULL;
```

如果 `subscriptions` 表的 `plan` 欄位也需要支援季度：

```sql
ALTER TABLE subscriptions
  MODIFY COLUMN plan ENUM('yearly', 'monthly', 'quarterly', 'lifetime') NOT NULL;
```

---

## 4. AI 次數邏輯（程式層）

> 可以放在 `core/src/modules/ai/aiQuotaService.ts` 之類的文件，或你們認為合適的地方。
> 
> **重要**：以下程式碼中的欄位名稱（如 `created_at`、`pro_expires_at`）請以實際 User 模型為準。
> 系統中資料庫層使用 snake_case（`created_at`、`pro_expires_at`），
> 但如果在 TypeScript 中使用 ORM 或 DTO 轉換，可能是 camelCase（`createdAt`、`proExpiresAt`）。
> 實作時請根據實際的 User 模型定義調整。

### 4.1 判斷 Pro 是否有效

```ts
import dayjs from 'dayjs';

function isProValid(user: User): boolean {
  // 注意：欄位名稱請以實際 User 模型為準（可能是 pro_expires_at 或 proExpiresAt）
  if (!user.is_pro) return false;
  if (!user.pro_expires_at) return false;
  return dayjs(user.pro_expires_at).isAfter(dayjs());
}
```

### 4.2 判斷是否註冊首日

```ts
function isFirstDay(user: User): boolean {
  // 注意：欄位名稱請以實際 User 模型為準（可能是 created_at 或 createdAt）
  const created = dayjs(user.created_at);
  const today = dayjs();
  return created.isSame(today, 'day');
}
```

> 時區先沿用後端系統時間。之後要改用特定時區再優化。

### 4.3 計算今日上限

```ts
function getDailyLimit(user: User): number {
  const PRO_DAILY_LIMIT = 100;
  const FREE_FIRST_DAY_LIMIT = 10;
  const FREE_DAILY_LIMIT = 5;

  if (isProValid(user)) {
    return PRO_DAILY_LIMIT;
  }

  if (isFirstDay(user)) {
    return FREE_FIRST_DAY_LIMIT;
  }

  return FREE_DAILY_LIMIT;
}
```

### 4.4 跨天重置次數

```ts
function resetAiCallsIfNeeded(user: User): void {
  const todayStr = dayjs().format('YYYY-MM-DD');
  // 注意：欄位名稱請以實際 User 模型為準
  if (user.ai_calls_date !== todayStr) {
    user.ai_calls_date = todayStr;
    user.ai_calls_today = 0;
  }
}
```

### 4.5 檢查 & 累計

```ts
class AiLimitReachedError extends Error {
  limit: number;
  constructor(limit: number) {
    super(`AI_DAILY_LIMIT_REACHED:${limit}`);
    this.name = 'AiLimitReachedError';
    this.limit = limit;
  }
}

async function checkAndCountAIUsage(userId: string): Promise<void> {
  const user = await userRepo.findById(userId);
  if (!user) throw new Error('USER_NOT_FOUND');

  resetAiCallsIfNeeded(user);
  const limit = getDailyLimit(user);

  // 注意：欄位名稱請以實際 User 模型為準
  if (user.ai_calls_today >= limit) {
    throw new AiLimitReachedError(limit);
  }

  user.ai_calls_today += 1;
  await userRepo.save(user);
}
```

---

## 5. 封裝 LLM 調用（流式）

```ts
async function* callDeepSeekStreamWithQuota(userId: string, payload: any) {
  await checkAndCountAIUsage(userId);
  
  // 這裡不要自己選模型，直接用現有 aiService
  // 確保 aiService.chatStream() 會按照後台配置選 default model（請設為 DeepSeek）
  // 注意：如果 chatStream 本身是 async 函數，需要 await
  const stream = await aiService.chatStream(payload);
  for await (const chunk of stream) {
    yield chunk;
  }
}
```

---

## 6. 需要改造的入口（必改）

### 6.1 `readingService.ts`

* `readShensha()` → 改用 `callDeepSeekStreamWithQuota`
* `readOverview()` → 改用 `callDeepSeekStreamWithQuota`
* `readGeneral()` → 改用 `callDeepSeekStreamWithQuota`
* 所有其他 LLM 調用 → 改用 `callDeepSeekStreamWithQuota`

### 6.2 `conversation.ts` / chat 路由

* 所有聊天 API（流式） → 改用 `callDeepSeekStreamWithQuota`

> 原本直接調 `aiService.chatStream()` 的地方，都要改成使用 `callDeepSeekStreamWithQuota` 封裝。

### 6.3 統一錯誤處理

所有使用 `callDeepSeekStreamWithQuota` 封裝的 API：

* 捕捉 `AiLimitReachedError` → 回傳 429 + 統一 JSON：

```json
{
  "success": false,
  "error": {
    "code": "AI_DAILY_LIMIT_REACHED",
    "message": "今日解讀次數已用完",
    "details": {
      "limit": 5,
      "used": 5,
      "remaining": 0
    }
  }
}
```

> **注意**：以上 `details` 中的數值為示例，實際會根據 `getDailyLimit(user)` 計算，可能是 10（非會員首日）、5（非會員次日）或 100（會員）。

---

## 7. 會員狀態查詢 API

**實作建議**：直接改造現有 `/api/v1/pro/status`，保持原欄位不變，新增 `aiCallsToday` / `aiDailyLimit` / `aiRemaining`。

這樣不會多出一個新 route，也不用擔心「兩個 API 回東西還不一樣」。

### 7.1 回傳格式（建議）

```json
{
  "success": true,
  "data": {
    "isPro": true,
    "proPlan": "monthly",
    "proExpiresAt": "2025-01-01T00:00:00.000Z",
    "aiCallsToday": 3,
    "aiDailyLimit": 100,
    "aiRemaining": 97
  }
}
```

### 7.2 實作要點

* 讀取 user；
* 調用 `resetAiCallsIfNeeded(user)` → 算出最新的 `ai_calls_today`；
* 用 `getDailyLimit(user)` 算出 `aiDailyLimit`；
* 寫回 user（如有 reset）；
* 回傳上述 JSON。

---

## 8. 訂閱（會員）流程：先用假支付

### 8.1 保留現有 `proService` 結構（不 rename）

* `pro_plan` 支援：`monthly` | `quarterly` | `yearly`
  * `quarterly` 是新增的枚舉值。

### 8.2 假支付 API（測試用）

例如：

```ts
// POST /api/v1/pro/fake-subscribe
// body: { plan: 'monthly' | 'quarterly' | 'yearly' }

app.post('/api/v1/pro/fake-subscribe', async (req, res) => {
  const userId = req.user.id;
  const { plan } = req.body;

  if (!['monthly', 'quarterly', 'yearly'].includes(plan)) {
    return res.status(400).json({ error: 'INVALID_PLAN' });
  }

  const user = await userRepo.findById(userId);
  if (!user) return res.status(404).json({ error: 'USER_NOT_FOUND' });

  const now = dayjs();
  const months = plan === 'monthly' ? 1 : plan === 'quarterly' ? 3 : 12;

  // 如果已經是 Pro 且未過期，從原過期日往後加；否則從當前時間開始
  // 注意：欄位名稱請以實際 User 模型為準（可能是 pro_expires_at 或 proExpiresAt）
  const base = user.pro_expires_at && dayjs(user.pro_expires_at).isAfter(now)
    ? dayjs(user.pro_expires_at)
    : now;

  const newExpiresAt = base.add(months, 'month');

  user.is_pro = true;
  user.pro_plan = plan;
  user.pro_expires_at = newExpiresAt.toISOString();

  await userRepo.save(user);

  return res.json({ success: true });
});
```

> 未來接 Stripe / IAP 時，只要把這段當作「支付成功之後」的後處理邏輯。

---

## 9. 前端訂閱頁（跟 AI 限制配合）

這部分主要是給工程一個需求：

1. **訂閱頁進來時：**
   * 調用 `/api/v1/pro/status`（改造後的版本）；
   * 顯示「今日解讀：`aiCallsToday / aiDailyLimit`」。
   * **注意**：讀取失敗時顯示「載入中…」，不要在 undefined 狀態下渲染 0 / undefined 次。

2. **當前狀態卡片：**
   * **免費用戶**：「免費用戶 · 已解鎖基礎排盤與簡要解讀」
   * **小佩會員**：「小佩會員 · 已解鎖全部解讀與高額 AI 問答」

3. **顯示三個方案：**
   * 月：NT$ 39 / 月
   * 季：NT$ 99 / 季（約 33 / 月）
   * 年：NT$ 348 / 年（約 29 / 月）
   * 文案標「早鳥價」即可，程式不用管這個字。

3. **權益對比表（精簡版）：**

   | | 非會員 | 小佩會員 |
   |---|---|---|
   | AI 解讀 / 問答 | 首日 10 次，之後每天 5 次 | 每天 100 次，日常幾乎不會用完 |
   | 功能 | 可體驗全部功能 | 全功能 + 高額度，適合長期追蹤與反覆提問 |
   | 命盤數量 | 最多 10 個 | 更寬鬆，適合長期使用 |

   **CTA 文案**：想要更自由地問小佩，就升級成小佩會員吧。
   
   **注意**：命盤數量目前**只在文案層面提示**，後端暫時不做硬限制，之後如果真的要控，再開新任務。

4. **綠色介紹卡片：**
   * 保留「情緒價值」文案（陪伴、節奏、長期追蹤）
   * 刪除任何「權益細節」句子
   * 讓具體差異全部集中在權益對比表

5. **點「開通會員」：**
   * 先走假 API：`POST /api/v1/pro/fake-subscribe`；
   * 成功後重新拉一次 `/api/v1/pro/status` 更新 isPro、剩餘次數等。

6. **當任意 AI API 返回 `AI_DAILY_LIMIT_REACHED`：**
   * 前端統一彈窗提示 & 提供「去開通會員」的按鈕（跳訂閱頁）。

---

## 10. 實作優先級（給工程的待辦清單）

### P0（這一輪必做）

1. ✅ **DB：`users` 表新增 `ai_calls_today`、`ai_calls_date`**
   - 執行 Migration 腳本
   - 初始化現有用戶數據（設為 0 和空字串）

2. ✅ **新增 quota 工具函式**
   - `isProValid` / `isFirstDay` / `getDailyLimit` / `resetAiCallsIfNeeded` / `checkAndCountAIUsage`
   - 放在 `core/src/modules/ai/aiQuotaService.ts`
   - **注意**：欄位名稱請以實際 User 模型為準

3. ✅ **新增封裝函式**
   - `callDeepSeekStreamWithQuota`（流式）
   - 並改造所有 LLM 調用入口使用它
   - **注意**：如果 `chatStream` 本身是 async 函數，需要 await

4. ✅ **改造會員狀態 API**
   - 直接改造現有 `/api/v1/pro/status`
   - 保持原欄位不變，新增 `aiCallsToday` / `aiDailyLimit` / `aiRemaining`

5. ✅ **前端統一處理 `AI_DAILY_LIMIT_REACHED` 錯誤碼**
   - 彈窗提示
   - 引導跳轉訂閱頁

6. ✅ **前端訂閱頁至少要能：**
   - 顯示方案價格（39/99/348）
   - 顯示今日解讀次數（調用 status API，失敗時顯示「載入中…」）
   - 顯示權益對比表（3 行，順序：AI 解讀 → 功能 → 命盤數量）
   - 顯示 CTA 文案：「想要更自由地問小佩，就升級成小佩會員吧。」
   - 調用假訂閱 API 開通 Pro
   - 當前狀態卡片根據會員狀態顯示不同文案

### P1（之後再說，不在這版範圍內）

* Apple / Google IAP 集成
* 真實支付通道（Stripe 等）
* 多模型路由 / fallback 策略
* ai_usage_logs 表 & 分析報表
* 取消訂閱功能
* 訂閱 Webhook 處理

---

## 11. 注意事項

### 11.1 數據遷移

* 新增欄位時，現有用戶的 `ai_calls_today` 初始化為 0，`ai_calls_date` 初始化為空字串
* 第一次調用時會自動重置為當天日期

### 11.2 向後兼容

* 保留現有 `/api/v1/pro/*` 路由不變
* 直接改造 `/api/v1/pro/status`，保持原欄位不變，新增欄位

### 11.3 時區處理

* 跨天重置使用後端系統時區（或 UTC）
* 使用 `dayjs` 庫處理日期比較

### 11.4 測試要點

* 測試首日/次日邏輯（需要模擬不同註冊日期）
* 測試跨天重置（需要修改系統時間或使用 Mock）
* 測試訂閱續費邏輯（已有會員續費）
* 測試 AI 次數限制（達到上限後返回 429）

### 11.5 與現有 rateLimit 的關係

* 現有 `rateLimit` 中間件**保留不變**，作為額外的安全網
* 新的 AI 次數限制是**獨立邏輯**，在 LLM 調用前檢查
* 兩個限制可以同時生效（取更嚴格的限制）

### 11.6 欄位命名注意事項

* 資料庫層使用 snake_case：`created_at`、`pro_expires_at`、`ai_calls_today`、`ai_calls_date`
* TypeScript 類型定義（`UserRow`）使用 snake_case
* API 響應（DTO）使用 camelCase：`createdAt`、`proExpiresAt`、`aiCallsToday`、`aiCallsDate`
* 實作時請根據實際的 User 模型定義調整欄位名稱

---

## 12. 系統現狀檢查（簡要）

### 12.1 已實現部分

* ✅ LLM 服務：DeepSeek、ChatGPT、Qwen 三種 provider 已實現
* ✅ 統一 `aiService` 接口
* ✅ `users` 表有 `is_pro`、`pro_expires_at`、`pro_plan` 欄位
* ✅ `subscriptions` 表已存在
* ✅ 現有 `rateLimit` 中間件（區分排盤/對話）

### 12.2 缺失部分（本次要補）

* ❌ 統一的 AI 解讀次數限制邏輯
* ❌ 首日/次日區分邏輯
* ❌ 跨天重置邏輯
* ❌ 統一的 LLM 調用封裝（帶次數檢查）
* ❌ 會員狀態 API 返回 AI 次數信息
* ❌ 季度方案支援
* ❌ 假支付接口（測試用）

---

## 13. 總結

本方案是**精簡版 v1**，只做 P0 最小可用版本：

**核心改進點**：
1. 統一 AI 解讀次數限制（所有 LLM 調用統一計數）
2. 實現首日/次日區分（非會員：首日 10 次，次日 5 次；會員：100 次/天）
3. 封裝 LLM 調用（加入次數檢查）
4. 會員狀態 API 返回 AI 次數信息
5. 假支付接口（測試用，未來可替換為真實支付）

**明確不做**：
1. ❌ 不改 Pro 命名（保留 `is_pro` 等欄位名）
2. ❌ 不接 IAP / Webhook（先用假支付）
3. ❌ 不搞多模型策略（固定使用 DeepSeek）
4. ❌ 不新增日誌表（`ai_usage_logs`）
5. ❌ 不動現有 `rateLimit` 中間件

**下一步行動**：
1. 確認方案是否符合預期
2. 開始實施 P0 優先級任務
3. 逐步推進 P1 任務（未來版本）

---

**文檔結束**
