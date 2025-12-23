# Admin 會員管理設計方案 v1（修正版 - 與系統一致）

> **版本**：v1（只做最小可用 P0）  
> **適用範圍**：Core 後端（Node/TS/Express/MySQL） + Admin 後台（Web）  
> **修正日期**：2025-01-10  
> **修正說明**：已對齊現有系統參數、接口路徑、數據庫字段命名

---

## 📋 文檔依據

本方案已對齊以下現有文檔與代碼：

1. **數據庫結構**：
   - `core/src/database/migrations/002_phase4_tables.sql`（users 表 Pro 字段）
   - `core/src/database/migrations/011_add_ai_quota_fields.sql`（AI 次數字段）

2. **現有服務**：
   - `core/src/modules/ai/aiQuotaService.ts`（`getDailyLimit()`, `resetAiCallsIfNeeded()`, `getAIUsageStatus()`）

3. **Admin API 結構**：
   - `core/src/routes/admin/index.ts`（路徑前綴：`/api/admin/v1`）
   - `core/src/middleware/adminAuth.ts`（中間件：`requireAdminAuth`）

4. **類型定義**：
   - `core/src/types/database.ts`（`UserRow` 接口）

---

## ⚠️ 關鍵修正點（與原方案差異）

### 1. 數據庫字段名修正

| 原方案 | 實際系統 | 說明 |
|--------|---------|------|
| `id` | `user_id` | 用戶主鍵字段名 |
| `createdAt` | `created_at` | 數據庫使用 snake_case |
| `proExpiresAt` | `pro_expires_at` | 數據庫使用 snake_case |
| `aiCallsToday` | `ai_calls_today` | 數據庫使用 snake_case |
| `aiCallsDate` | `ai_calls_date` | 數據庫使用 snake_case |

### 2. API 路徑修正

| 原方案 | 實際系統 | 說明 |
|--------|---------|------|
| `/api/admin/membership/*` | `/api/admin/v1/membership/*` | 需遵循現有 Admin API 前綴 |

### 3. 中間件名稱修正

| 原方案 | 實際系統 | 說明 |
|--------|---------|------|
| `requireAdmin` | `requireAdminAuth` | 使用現有中間件名稱 |

### 4. 類型定義補充

- `UserRow` 接口需要補充 `ai_calls_today` 和 `ai_calls_date` 字段
- `pro_plan` 類型需要更新為包含 `'quarterly'`

---

## 1. 目的與背景

App 端已經有：

* Pro 會員欄位：`is_pro`, `pro_plan`, `pro_expires_at`

* AI 解讀次數限制欄位：`ai_calls_today`, `ai_calls_date`

* 非會員 / 會員每日 AI 次數規則（由 `aiQuotaService.ts` 實現）：

  * 非會員：註冊首日 10 次，之後每天 5 次

  * 會員：每天 100 次

* 會員方案價格（前端展示用）：

  * 月付方案：約 **$39 / 月**

  * 季付方案：約 **$99 / 季**

  * 年付方案：約 **$348 / 年**

需要一個 **Admin 後台頁面**，讓你和運營／客服可以：

* 查某個用戶現在是不是會員、什麼方案、何時到期

* 手動幫某個用戶開通 / 延長 / 取消會員（不經過支付）

* 查看 / 重置某個用戶今天的 AI 解讀次數（客服補償、測試用）

> 本方案**不處理** Apple / Google / Stripe 支付，只處理會員狀態 & AI 次數。

---

## 2. 範圍與非範圍

### 2.1 本次範圍（P0）

1. Admin 後台新增「會員管理」菜單與頁面

2. 用戶列表頁：搜尋、查看會員狀態與今日 AI 次數

3. 用戶詳情頁：

   * 顯示會員狀態、方案、到期時間

   * 顯示今日 AI 解讀次數與上限

   * 操作：

     * 手動開通 / 延長會員（月 / 季 / 年）

     * 立即取消會員（設為免費用戶）

     * 重置今日 AI 次數

4. 後端 Admin API：

   * 列表查詢

   * 單用戶詳情

   * Grant（開通／延長）

   * Revoke（取消）

   * Reset AI Today（重置今日次數）

5. 權限控制：只有 admin 角色可以呼叫這組 API

### 2.2 不在本次範圍（P1+）

* 不接 Apple / Google IAP / Stripe 支付

* 不處理支付 Webhook

* 不做完整 AI usage 日誌表（`ai_usage_logs`）

* 不做多模型策略 / 成本分析報表

* 不做全站 Dashboard（會員數、收入報表等）

---

## 3. 核心概念與資料結構

### 3.1 users 表（沿用現有欄位，**不改名**）

只列與會員 / AI 次數相關的欄位：

* `user_id`：用戶 ID（VARCHAR(36)，主鍵）⚠️ **注意：不是 `id`**

* `phone`：手機號（登入憑證）

* `created_at`：註冊時間（DATETIME）

* `is_pro`：是否 Pro 會員（BOOLEAN / TINYINT）

* `pro_plan`：會員方案：`'monthly' | 'quarterly' | 'yearly' | 'lifetime' | NULL`（ENUM）

* `pro_expires_at`：會員到期時間（DATETIME / NULL）

* `ai_calls_today`：今日已使用 AI 解讀次數（INT，預設 0）

* `ai_calls_date`：AI 次數計數日期（VARCHAR(10)，格式 `'YYYY-MM-DD'`，預設 ''）

> Code 裡一直用 **Pro** 命名（`is_pro` 等），對外文案顯示「小佩會員」。

### 3.2 方案與每日 AI 上限

* 會員方案（`pro_plan`）：

  * `monthly`：月付方案（App 展示價≈ **$39 / 月**）

  * `quarterly`：季付方案（≈ **$99 / 季**）

  * `yearly`：年付方案（≈ **$348 / 年**）

  * `lifetime`：終身會員（本次 P0 不涉及，但數據庫已支持）

* 每日 AI 上限（後端函式 `getDailyLimit(user)` 會計算，位於 `aiQuotaService.ts`）：

  * Pro 會員：`100`

  * 免費用戶（註冊首日）：`10`

  * 免費用戶（非首日）：`5`

Admin 端不用管具體條件，後端計算後直接回傳 `aiDailyLimit`。

---

## 4. Admin 會員管理：UI 與流程設計

在 Admin 後台左側加一個主菜單：

* 「會員管理」 Membership

  * 用戶列表 User List

  * （P1）簡易統計 Dashboard（可暫時不做）

### 4.1 用戶列表頁

> 目標：快速找到某個用戶，看清他是不是會員、何時到期、今天用了幾次 AI，並跳轉詳情。

#### 4.1.1 搜尋與篩選

頂部搜尋區：

* 搜尋框 `q`：

  * 支援輸入：手機號 或 用戶 ID（模糊匹配即可）

* 篩選條件：

  * 會員狀態下拉：

    * 全部

    * 只看免費用戶

    * 只看會員用戶

#### 4.1.2 列表欄位

表格建議欄位：

1. 用戶 ID `user_id` ⚠️ **注意：字段名是 `user_id`，不是 `id`**

2. 手機 `phone`

3. 註冊時間 `created_at`

4. 會員狀態

   * `免費用戶`

   * `小佩會員（月付）`

   * `小佩會員（季付）`

   * `小佩會員（年付）`

   * 若 `is_pro = true` 但已過期，可標註 `(已過期)` 或顯示為灰色

5. 會員到期時間 `pro_expires_at`

6. 今日 AI 解讀：`ai_calls_today / aiDailyLimit`

   * 例如：`3 / 10`、`25 / 100`

   * 超過 80% 或已用完可以用顏色標記

7. 操作：

   * 按鈕：`查看詳情`

#### 4.1.3 交互細節

* 點擊整行或「查看詳情」按鈕 → 跳到用戶詳情頁。

* 支援分頁：`page` + `pageSize`。

* 無結果時顯示「未找到符合條件的用戶」。

---

### 4.2 用戶詳情頁

> 目標：集中顯示一個用戶的會員狀態 + 今日 AI 使用情況，並提供管理操作。

建議分三個區塊。

#### 4.2.1 基本資訊

* 用戶 ID：`user_id` ⚠️ **注意：字段名是 `user_id`**

* 手機：`phone`

* 註冊時間：`created_at`

#### 4.2.2 會員資訊（核心）

展示：

* 會員狀態：

  * `免費用戶`

  * 或 `小佩會員（月付）`／`小佩會員（季付）`／`小佩會員（年付）`

* 方案：`pro_plan`

* 會員到期時間：`pro_expires_at`

* 若 `is_pro = true` 但 `pro_expires_at` 已過期，可以在 UI 顯示一個警告標記（方便排查邏輯錯誤）

**操作：**

1. 📌「手動開通 / 延長會員」

   表單內容：

   * 方案選擇：

     * `月付方案 (monthly)`

     * `季付方案 (quarterly)`

     * `年付方案 (yearly)`

   * 模式：

     * `從現在起算`（fromNow）

     * `從原到期日往後延長`（extend，預設）

   按鈕：`保存`

   行為（簡述）：

   * 調用後端 `POST /api/admin/v1/membership/users/:userId/grant` ⚠️ **注意：路徑前綴是 `/api/admin/v1`**

   * 後端按方案計算月數（1 / 3 / 12），從 base（現在 or 原到期）往後加，更新：

     * `is_pro = true`

     * `pro_plan = plan`

     * `pro_expires_at = newExpiresAt`

2. ❌「立即取消會員」

   * 按鈕：`設為免費用戶`

   * 彈窗確認：

     > 確定要立即取消該用戶的會員權益嗎？

     > 取消後，該用戶會恢復為免費用戶。

   行為：

   * 調用 `POST /api/admin/v1/membership/users/:userId/revoke` ⚠️ **注意：路徑前綴是 `/api/admin/v1`**

   * 後端將：

     * `is_pro = false`

     * `pro_plan = null`

     * `pro_expires_at = 現在（或 null，依現有習慣）`

> 提醒：這是 admin 人工操作，未來如果要和 App Store / Google 訂閱同步，再另外設計對應流程。

#### 4.2.3 AI 解讀次數區塊

展示：

* 今日日期：`ai_calls_date`（若和今天不同，代表後端還沒重置，可以在查詳情時順便觸發 `resetAiCallsIfNeeded`，再回寫）

* 今日 AI 解讀次數：`ai_calls_today / aiDailyLimit`

* 顯示判定文案（可選）：

  * `今日上限：10 次（註冊首日）`

  * `今日上限：5 次（免費用戶）`

  * `今日上限：100 次（小佩會員）`

**操作：**

* 🔁「重置今日 AI 次數」

  * 按鈕：`重置今日解讀次數`

  * 確認彈窗：

    > 確定要將該用戶今天的 AI 解讀次數重置為 0 嗎？

    > 通常用於客服補償或內部測試。

  行為：

  * 調用 `POST /api/admin/v1/membership/users/:userId/reset-ai-today` ⚠️ **注意：路徑前綴是 `/api/admin/v1`**

  * 後端：

    * `ai_calls_date = 今天`

    * `ai_calls_today = 0`

  * 更新畫面顯示為 `0 / aiDailyLimit`

---

## 5. 後端 Admin API 設計

API 前綴：`/api/admin/v1/membership` ⚠️ **注意：需遵循現有 Admin API 前綴 `/api/admin/v1`**

> 所有路由都要掛 `requireAdminAuth` 中間件 ⚠️ **注意：中間件名稱是 `requireAdminAuth`，不是 `requireAdmin`**，只允許 admin 角色呼叫。

### 5.1 用戶列表

`GET /api/admin/v1/membership/users`

**Query：**

* `q`（可選）：關鍵字（手機 / 用戶 ID）

* `isPro`（可選）：`true` / `false`

* `page`（可選，預設 1）

* `pageSize`（可選，預設 20）

**Response：**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "userId": "u_123",                    // ⚠️ 注意：對外 DTO 使用 camelCase
        "phone": "+85290000000",
        "createdAt": "2025-01-01T10:00:00.000Z",
        "isPro": true,
        "proPlan": "monthly",
        "proExpiresAt": "2025-02-01T00:00:00.000Z",
        "aiCallsToday": 3,
        "aiDailyLimit": 100
      }
    ],
    "page": 1,
    "pageSize": 20,
    "total": 120
  }
}
```

> `aiDailyLimit` 後端用 `getDailyLimit(user)` 算好再回（調用 `aiQuotaService.ts` 中的函數）。

> 查列表時也可以順便 `resetAiCallsIfNeeded(user)`，但至少在詳情頁要做一次。

---

### 5.2 用戶詳情

`GET /api/admin/v1/membership/users/:userId`

**Response：**

```json
{
  "success": true,
  "data": {
    "userId": "u_123",                        // ⚠️ 注意：對外 DTO 使用 camelCase
    "phone": "+85290000000",
    "createdAt": "2025-01-01T10:00:00.000Z",
    "isPro": true,
    "proPlan": "monthly",
    "proExpiresAt": "2025-02-01T00:00:00.000Z",
    "aiCallsToday": 3,
    "aiCallsDate": "2025-01-10",
    "aiDailyLimit": 100
  }
}
```

**實作要點：**

1. 先讀 user（使用 `user_id` 字段查詢）⚠️ **注意：數據庫字段是 `user_id`**

2. 調用 `resetAiCallsIfNeeded(user)` → 如有變化就寫回 DB（調用 `aiQuotaService.ts` 中的函數）

3. 用 `getDailyLimit(user)` 算 `aiDailyLimit`（調用 `aiQuotaService.ts` 中的函數）

4. 組合 DTO 回傳（snake_case → camelCase 轉換）

---

### 5.3 Admin 開通 / 延長會員

`POST /api/admin/v1/membership/users/:userId/grant`

**Body：**

```json
{
  "plan": "monthly",     // 'monthly' | 'quarterly' | 'yearly'
  "mode": "extend"       // 'extend' | 'fromNow'
}
```

**邏輯示例：**

```ts
import dayjs from 'dayjs';
import { getPool } from '../../database/connection';

async function adminGrantMembership(userId: string, plan: string, mode: string) {
  const pool = getPool();
  
  // 1. 查詢用戶（注意：字段名是 user_id）
  const [rows]: any = await pool.execute(
    `SELECT user_id, is_pro, pro_expires_at, pro_plan, created_at 
     FROM users 
     WHERE user_id = ?`,
    [userId]
  );

  if (rows.length === 0) {
    throw new Error('USER_NOT_FOUND');
  }

  const user = rows[0];
  const now = dayjs();

  // 2. 計算月數
  const months =
    plan === 'monthly' ? 1 :
    plan === 'quarterly' ? 3 :
    12; // yearly

  // 3. 計算基準時間
  const base =
    mode === 'extend' &&
    user.pro_expires_at &&
    dayjs(user.pro_expires_at).isAfter(now)
      ? dayjs(user.pro_expires_at)
      : now;

  // 4. 計算新到期時間
  const newExpiresAt = base.add(months, 'month');

  // 5. 更新數據庫（注意：字段名是 snake_case）
  await pool.execute(
    `UPDATE users 
     SET is_pro = true, 
         pro_plan = ?, 
         pro_expires_at = ?, 
         updated_at = NOW()
     WHERE user_id = ?`,
    [plan, newExpiresAt.toISOString(), userId]
  );

  return {
    isPro: true,
    proPlan: plan,
    proExpiresAt: newExpiresAt.toISOString()
  };
}
```

**Response：**

```json
{
  "success": true,
  "data": {
    "isPro": true,
    "proPlan": "monthly",
    "proExpiresAt": "2025-02-01T00:00:00.000Z"
  }
}
```

---

### 5.4 Admin 取消會員

`POST /api/admin/v1/membership/users/:userId/revoke`

**Body（可選）：**

```json
{
  "reason": "manual_cancel"
}
```

**邏輯示例：**

```ts
import { getPool } from '../../database/connection';

async function adminRevokeMembership(userId: string, reason?: string) {
  const pool = getPool();
  
  // 1. 查詢用戶（注意：字段名是 user_id）
  const [rows]: any = await pool.execute(
    `SELECT user_id FROM users WHERE user_id = ?`,
    [userId]
  );

  if (rows.length === 0) {
    throw new Error('USER_NOT_FOUND');
  }

  // 2. 更新數據庫（注意：字段名是 snake_case）
  await pool.execute(
    `UPDATE users 
     SET is_pro = false, 
         pro_plan = NULL, 
         pro_expires_at = NULL, 
         updated_at = NOW()
     WHERE user_id = ?`,
    [userId]
  );

  return {
    isPro: false,
    proPlan: null,
    proExpiresAt: null
  };
}
```

**Response：**

```json
{
  "success": true,
  "data": {
    "isPro": false,
    "proPlan": null,
    "proExpiresAt": null
  }
}
```

---

### 5.5 Admin 重置今日 AI 次數

`POST /api/admin/v1/membership/users/:userId/reset-ai-today`

**Body**：可為空（或加可選 `reason`）

**邏輯示例：**

```ts
import dayjs from 'dayjs';
import { getPool } from '../../database/connection';

async function adminResetTodayAiCalls(userId: string) {
  const pool = getPool();
  
  // 1. 查詢用戶（注意：字段名是 user_id）
  const [rows]: any = await pool.execute(
    `SELECT user_id FROM users WHERE user_id = ?`,
    [userId]
  );

  if (rows.length === 0) {
    throw new Error('USER_NOT_FOUND');
  }

  // 2. 重置為今天（注意：字段名是 snake_case）
  const todayStr = dayjs().format('YYYY-MM-DD');
  
  await pool.execute(
    `UPDATE users 
     SET ai_calls_today = 0, 
         ai_calls_date = ?, 
         updated_at = NOW()
     WHERE user_id = ?`,
    [todayStr, userId]
  );

  return {
    aiCallsToday: 0,
    aiCallsDate: todayStr
  };
}
```

**Response：**

```json
{
  "success": true,
  "data": {
    "aiCallsToday": 0,
    "aiCallsDate": "2025-01-10"
  }
}
```

---

## 6. 權限控制與安全要求

### 6.1 Admin 鑑權

* Admin API 必須使用單獨的 admin 登入與 Token：

  * Token 中攜帶 `role: 'admin'` 或 `role: 'super_admin'`

  * 中間件 `requireAdminAuth` ⚠️ **注意：中間件名稱是 `requireAdminAuth`** 驗證：

    * Token 有效

    * 角色為 admin 或 super_admin

* App 端普通用戶的 Token **不能** 調用 `/api/admin/*`。

### 6.2 其他安全注意

* Admin 後台只在內部或受控環境使用，全部走 HTTPS。

* Log 中如需打印 `phone`，建議做部分打碼（例如只顯示後 4 位）。

* 若未來實作 audit log，可在那邊追加變更紀錄，但不在本次 P0 scope 裡強制要求。

---

## 7. 類型定義修正

### 7.1 更新 `UserRow` 接口

需要在 `core/src/types/database.ts` 中補充：

```ts
export interface UserRow {
  user_id: string;
  phone?: string;
  email?: string;
  username?: string;
  password_hash?: string;
  password_set: boolean;
  app_region: 'CN' | 'HK';
  nickname: string;
  avatar_url?: string;
  is_pro: boolean;
  pro_expires_at?: Date;
  pro_plan?: 'yearly' | 'monthly' | 'quarterly' | 'lifetime';  // ⚠️ 需補充 'quarterly'
  invite_code: string;
  invited_by?: string;
  created_at: Date;
  updated_at: Date;
  last_login_at?: Date;
  ai_calls_today: number;      // ⚠️ 需補充
  ai_calls_date: string;       // ⚠️ 需補充
}
```

---

## 8. 開發優先級（To-do 給工程）

### P0（這一輪必做）

1. **後端類型定義修正**

   * 更新 `core/src/types/database.ts`：
     * 補充 `ai_calls_today: number`
     * 補充 `ai_calls_date: string`
     * 更新 `pro_plan` 類型為 `'yearly' | 'monthly' | 'quarterly' | 'lifetime'`

2. **後端 API 實作**

   * 新增路由文件：`core/src/routes/admin/membership.ts`
   * 在 `core/src/routes/admin/index.ts` 中掛載：`router.use('/membership', membershipRoutes);`
   * 實作：

     * `GET /api/admin/v1/membership/users`（列表）

     * `GET /api/admin/v1/membership/users/:userId`（詳情）

     * `POST /api/admin/v1/membership/users/:userId/grant`

     * `POST /api/admin/v1/membership/users/:userId/revoke`

     * `POST /api/admin/v1/membership/users/:userId/reset-ai-today`

   * 所有路由使用 `requireAdminAuth` 中間件。

   * 查詢時使用 `user_id` 字段（不是 `id`）。

   * 調用現有服務：
     * `getDailyLimit(user)`（來自 `aiQuotaService.ts`）
     * `resetAiCallsIfNeeded(user)`（來自 `aiQuotaService.ts`）

3. **Admin 前端**

   * 左側增加「會員管理」菜單。

   * 用戶列表頁：

     * 搜尋（手機 / userId）

     * 會員狀態篩選

     * 列表欄位：userId、phone、註冊時間、會員狀態、到期時間、今日 AI、操作。

   * 用戶詳情頁：

     * 基本資訊 + 會員資訊 + AI 次數區塊。

     * 三個按鈕：

       * 手動開通 / 延長會員

       * 取消會員

       * 重置今日 AI 次數

     * 基本的錯誤提示、loading 狀態。

### P1（之後有空再做）

* Audit log（記錄哪個 admin 在什麼時間對哪個 user 做了什麼變更）

* Dashboard（當前會員數、即將到期會員數等）

* 更多篩選條件（註冊日期區間、即將到期 7 天內等）

---

## 9. 關鍵注意事項總結

### 9.1 數據庫字段名（snake_case）

- ✅ `user_id`（不是 `id`）
- ✅ `is_pro`
- ✅ `pro_expires_at`
- ✅ `pro_plan`
- ✅ `ai_calls_today`
- ✅ `ai_calls_date`
- ✅ `created_at`

### 9.2 API 路徑

- ✅ 前綴：`/api/admin/v1`
- ✅ 完整路徑：`/api/admin/v1/membership/*`

### 9.3 中間件

- ✅ 使用：`requireAdminAuth`（不是 `requireAdmin`）

### 9.4 現有服務復用

- ✅ `getDailyLimit(user)` - 來自 `aiQuotaService.ts`
- ✅ `resetAiCallsIfNeeded(user)` - 來自 `aiQuotaService.ts`
- ✅ `getAIUsageStatus(userId)` - 來自 `aiQuotaService.ts`（可選，用於詳情頁）

### 9.5 類型定義

- ✅ 數據庫層：`UserRow`（snake_case）
- ✅ 對外 DTO：camelCase（`userId`, `isPro`, `proExpiresAt` 等）

---

## 10. 總結

這份 Admin 會員管理設計方案 v1（修正版）：

* ✅ **已對齊現有系統**：
  * 數據庫字段名（`user_id`, `is_pro`, `pro_expires_at` 等）
  * API 路徑前綴（`/api/admin/v1`）
  * 中間件名稱（`requireAdminAuth`）
  * 現有服務函數（`getDailyLimit`, `resetAiCallsIfNeeded`）

* ✅ **已根據你的要求**：
  * **完全移除「暱稱」相關設計**
  * 價格相關說明使用 **「$」作為貨幣符號**

* ✅ **嚴格控制在 P0 範圍**：
  查 + 改 `is_pro / pro_plan / pro_expires_at`，以及看 / 重置 `ai_calls_today`。

* ✅ **不涉及支付與多模型**，工程實作成本可控，跟你現有的 Core 設計完全對得上。

你可以直接把這份文檔丟給工程 / Cursor，讓他們按這個方案實作。

---

## 附錄：與原方案的主要差異對照表

| 項目 | 原方案 | 修正後 | 說明 |
|------|--------|--------|------|
| 用戶主鍵 | `id` | `user_id` | 數據庫實際字段名 |
| API 前綴 | `/api/admin/membership` | `/api/admin/v1/membership` | 遵循現有 Admin API 規範 |
| 中間件 | `requireAdmin` | `requireAdminAuth` | 使用現有中間件 |
| 類型定義 | 未提及 | 需補充 `ai_calls_today`, `ai_calls_date`, `quarterly` | 確保類型完整 |
| 服務復用 | 未明確 | 明確使用 `aiQuotaService.ts` | 避免重複實現 |

