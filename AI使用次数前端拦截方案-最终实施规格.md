# AI 使用次数前端拦截方案 - 最终实施规格

> **文档版本**：v1.1 - 优化版  
> **创建时间**：2025-01-XX  
> **最后更新**：2025-01-XX  
> **用途**：开发实施规格书，可直接作为 PR 检查清单

---

## 📋 目录

1. [核心目标与原则](#核心目标与原则)
2. [硬规则与约束](#硬规则与约束)
3. [数据模型与类型定义](#数据模型与类型定义)
4. [实施清单](#实施清单)
5. [代码实现要求](#代码实现要求)
6. [测试检查清单](#测试检查清单)

---

## 一、核心目标与原则

### 1.1 功能目标

1. **非会员每天有固定免费次数**（例如 5 次）；用完后：
   - ❌ **不再调用聊天流式接口**
   - ✅ **直接在前端提示「今日免费额度已用完，请开通会员」**

2. **会员（Pro）不受次数限制**，正常使用。

3. **保证前端体验友好**，但**后端仍是最终裁判**（防多端、作弊、API 直接调用）。

### 1.2 设计原则

- **单一真相来源**：AI 使用状态单一来源是后端 `/api/v1/pro/status`
- **前端负责优化体验**：尽量减少「发出去才报 429 / AI_DAILY_LIMIT_REACHED」这种体验
- **后端负责硬限制**：就算前端出 bug 或被绕过，后端也要正确限流
- **不写死数字**：前端不写死「5 次」，所有 limit 以后端为准
- **多端一致**：允许状态延迟，但最终由后端保证不超额

### 1.3 未登入 / 游客策略

**必须明确**：系统是否允许未登入用户使用 AI 功能？

#### 情况 A：未登入不允许使用 AI
- `handleSendMessage` 在做任何 AI 次数判断前，先检查 `user`：
  - 没有登入 → 直接弹「请先登入」的 UI，`return`
- 此时**不会走** `/pro/status` / 次数逻辑

#### 情况 B：允许未登入也有每日免费次数
- 需要确认 `/pro/status` 对未登入是否可用：
  - **如果不可用**：未登入状态下**不能调 `fetchAiUsageStatus`**，只能完全靠后端 `AI_DAILY_LIMIT_REACHED` 做兜底
  - **如果可用**（例如用 deviceId 当 key）：ChatScreen 对未登入也可以走相同的前端拦截逻辑

**当前系统要求**：请根据实际业务需求选择情况 A 或 B，并在实现时明确处理。

---

## 二、硬规则与约束

### 🔴 规则 1：类型与命名必须统一

**要求**：
- 所有 AI 使用状态字段**必须使用**以下命名：
  - `aiCallsToday`（不是 `callsToday` 或 `usedToday`）
  - `aiDailyLimit`（不是 `dailyLimit` 或 `limit`）
  - `aiRemaining`（不是 `remaining` 或 `left`）

**禁止**：
- ❌ 禁止在代码中使用 `aiUsageStatus.remaining`（必须用 `aiUsageStatus.aiRemaining`）
- ❌ 禁止创建别名或简写

**检查点**：
```typescript
// ✅ 正确
if (aiUsageStatus && aiUsageStatus.aiRemaining <= 0) { ... }

// ❌ 错误
if (aiUsageStatus && aiUsageStatus.remaining <= 0) { ... }
```

---

### 🔴 规则 2：状态拿不到时一律放行（后端兜底）

**硬规则**：
> **只在 `aiUsageStatus != null` 且 `aiRemaining <= 0` 时，前端才拦截；**
> 
> **任何 `/pro/status` 失败 或 `aiUsageStatus === null` 的情况，前端一律不拦截，让请求发出去，交后端判断。**

**原则**：
- **宁可少拦，不可以错拦**
- 避免 `/pro/status` 挂了结果整个聊天功能死掉

**必须实现的代码结构**：
```typescript
if (!isPro) {
  // 如果状态为空，尝试拉一次（但不强制）
  if (!aiUsageStatus) {
    try {
      await fetchAiUsageStatus();
    } catch {
      // 拉不到 → 不拦截，允许发送（后端兜底）
    }
  }
  
  // 只有状态存在且剩余 <= 0 时才拦截
  if (aiUsageStatus && aiUsageStatus.aiRemaining <= 0) {
    showLimitReachedUi();
    return; // 不调用流式接口
  }
}

// 通过所有检查，继续发送
```

**禁止的实现**：
```typescript
// ❌ 错误：状态为空时也拦截
if (!isPro && (!aiUsageStatus || aiUsageStatus.aiRemaining <= 0)) {
  showLimitReachedUi();
  return;
}
```

---

### 🔴 规则 3：fetchAiUsageStatus 调用时机

**必须调用的时机**：
1. ChatScreen **首次进入 / 得到焦点的 `useFocusEffect`**，且：
   - 用户已登入
   - `!isPro`

**可以额外调用的时机**（可选）：
2. 后端返回 `AI_DAILY_LIMIT_REACHED` 时，强制 `force: true` 再拉一次同步状态

**明确禁止**：
- ❌ 禁止在每次 `handleSendMessage` 里无条件调用 `fetchAiUsageStatus`
- ❌ 禁止在拦截检查时每次都调用 API

**节流要求**：
- `fetchAiUsageStatus` 内部**必须实现节流逻辑**
- 例如：`lastFetchedAt` 距今 < 30 秒时直接 return，不再打 API
- 只有 `force: true` 时才忽略节流

**实现要求**：
```typescript
fetchAiUsageStatus: async (options?: { force?: boolean }) => {
  const state = get();
  const now = Date.now();
  
  // 节流：30 秒内不重复请求（除非 force）
  if (!options?.force && state.aiUsageStatus?.lastFetchedAt) {
    const elapsed = now - state.aiUsageStatus.lastFetchedAt;
    if (elapsed < 30 * 1000) {
      return; // 节流，直接返回
    }
  }
  
  // 调用 API...
}
```

---

### 🔴 规则 4：Pro 开通 / 登出行为

#### 4.1 登出时

**要求**：
- `authStore.logout()` 时**必须调用** `proStore.resetAiUsage()`
- 清空 `aiUsageStatus`，避免切换账号时残留上一个账号的状态

**实现位置**：
```typescript
// app/src/store/authStore.ts
logout: async () => {
  // ... 现有逻辑 ...
  
  // 清空 AI 使用状态
  useProStore.getState().resetAiUsage();
  
  // ... 其他清理逻辑 ...
}
```

#### 4.2 开通 Pro 成功后

**要求**：
- 当用户完成 Pro 购买后：
  1. 更新 `proStore.isPro = true`
  2. **同时调用** `resetAiUsage()`
  3. 之后 ChatScreen 不再做日次数限制判断，只走 `isPro` 分支

**ChatScreen 配合逻辑**：
```typescript
// app/src/screens/Chat/ChatScreen.tsx
useEffect(() => {
  if (isPro) {
    // Pro 用户完全不需要 aiUsageStatus
    proStore.resetAiUsage();
  }
}, [isPro]);
```

**目的**：
- 避免「已经付费了还被提示今日次数用完」这种致命体验事故

---

### 🔴 规则 5：并发 / 连点行为（isSending 必须）

**硬需求**：
> `handleSendMessage` 里**必须有一个 `isSending` guard**，当前一次请求未结束时禁止再次发送。

**必须实现的代码结构**：
```typescript
const [isSending, setIsSending] = useState(false);

const handleSendMessage = async () => {
  // 1. 基础检查
  if (!inputText.trim() || !effectiveMasterId) return;
  
  // 2. 并发保护（必须）
  if (isSending) return;
  
  setIsSending(true);
  
  try {
    // 3. 拦截检查
    if (!isPro && aiUsageStatus && aiUsageStatus.aiRemaining <= 0) {
      showLimitReachedUi();
      return;
    }
    
    // 4. 发送逻辑
    await sendMessageWithStream(...);
    
  } catch (error) {
    // 错误处理
  } finally {
    setIsSending(false); // 必须放在 finally
  }
};
```

**目的**：
- 避免快速连点导致「前端判断时 `aiRemaining = 1`，但两个请求同时发出」的情况

---

### 🔴 规则 6：UI 统一（showLimitReachedUi 唯一入口）

**硬规则**：
> 任何「今日免费次数用完」的情况（不论前端拦截还是后端返回 `AI_DAILY_LIMIT_REACHED`），**一律只允许走 `showLimitReachedUi()` 这一个函数**，禁止额外 toast / console.error。

---

### 🔴 规则 7：跨日重置时的强制刷新确认

**硬规则**：
> 当本地判断 `aiRemaining <= 0` 要拦截时，**必须先强制刷新一次状态确认**，避免因「跨日重置 + 节流」导致的误拦截。

**问题场景**：
- 假设晚上 23:59:50 拉了一次，`aiRemaining = 0`
- 00:00:05 其实后端已经重置了，但因为 30 秒节流，前端不会再拉
- 使用者在 00:00:10 再点发送 → 本地仍觉得 `aiRemaining = 0`，直接前端拦截（误杀）

**必须实现的代码结构**：
```typescript
if (!isPro) {
  // 如果状态为空，尝试拉一次（但不强制）
  if (!aiUsageStatus) {
    try {
      await fetchAiUsageStatus();
    } catch {
      // 拉不到 → 不拦截，允许发送（后端兜底）
    }
  }
  
  // ⚠️ 关键：如果本地看起来要用完了，再强制拉一次确认
  if (aiUsageStatus && aiUsageStatus.aiRemaining <= 0) {
    try {
      // 强制刷新，忽略节流
      await fetchAiUsageStatus({ force: true });
    } catch {
      // 拉不到 → 宁可放行，交给后端兜底
      // 不拦截，继续发送
    }
    
    // 用最新的状态再做一次判断
    const latest = proStore.getState().aiUsageStatus;
    if (latest && latest.aiRemaining <= 0) {
      // 确认仍然 <= 0，才拦截
      showLimitReachedUi();
      return;
    }
    // 如果刷新后 > 0，继续发送（跨日重置了）
  }
}
```

**目的**：
- 避免因「刚过零点 + 节流」把用户错误拦住
- 确保跨日重置后能及时恢复使用

**函数要求**：
- `showLimitReachedUi()` 至少要包含：
  1. 描述文案（今日免费占卜已用完）
  2. 一个「知道了」/关闭按钮
  3. 一个「去开通 Pro」跳转付费页

**禁止**：
- ❌ 禁止在拦截时使用 `Alert.alert()` 直接写死
- ❌ 禁止在错误处理时额外显示 toast
- ❌ 禁止对 `AI_DAILY_LIMIT_REACHED` 使用 `console.error`

**实现位置**：
- 可以放在 `ChatScreen.tsx` 内部作为私有函数
- 或放在 `app/src/utils/aiUsage.ts` 作为工具函数（推荐）

**统一调用**：
```typescript
// 前端拦截
if (!isPro && aiUsageStatus && aiUsageStatus.aiRemaining <= 0) {
  showLimitReachedUi();
  return;
}

// 后端返回错误
if (error?.code === 'AI_DAILY_LIMIT_REACHED') {
  showLimitReachedUi();
  // 同步状态（可选）
  if (error.data) {
    updateAiUsageFromServer(error.data);
  }
  return;
}
```

---

## 三、数据模型与类型定义

### 3.1 AiUsageStatus 接口（必须使用）

```typescript
interface AiUsageStatus {
  aiCallsToday: number;        // 今天已使用次数
  aiDailyLimit: number | null; // 当日总额度；Pro 可以为 null 或非常大
  aiRemaining: number;         // 剩余次数（已帮前端算好）
  resetAt?: string | null;     // 可选：本次统计重置时间（用于展示，不参与逻辑判断）
  lastFetchedAt: number;       // timestamp：最后获取时间（用于节流）
}
```

### 3.2 useProStore 扩展（必须实现）

```typescript
interface ProState {
  // ===== 已有字段 =====
  isPro: boolean;
  plan: 'yearly' | 'monthly' | 'lifetime' | null;
  expiresAt: string | null;
  features: string[];
  
  // ===== 新增 AI 使用状态字段 =====
  aiUsageStatus: AiUsageStatus | null;
  isAiUsageLoading: boolean;
  
  // ===== 新增方法 =====
  fetchAiUsageStatus: (options?: { force?: boolean }) => Promise<void>;
  consumeAiUsageLocally: () => void;  // 本地减 1（发送成功后调用）
  resetAiUsage: () => void;           // 清空状态（登出/开通 Pro 时调用）
  
  // ===== 已有方法（需要确保兼容）=====
  setProStatus: (isPro: boolean, plan?: ..., expiresAt?: string) => void;
  refreshProStatus: () => Promise<void>;
  reset: () => void;  // 需要在 reset() 中清空 aiUsageStatus
}
```

### 3.3 isPro 的唯一真相来源

**硬规则**：
> `isPro` 的唯一真相来源是 `/api/v1/pro/status` API。

**同步要求**：
- `proStore.refreshProStatus()` 和 `proStore.fetchAiUsageStatus()` 如果都调用 `proService.getStatus()`，那这两个方法内部**都要把 `isPro / plan / expiresAt` 同步进 store**
- 避免出现「一个 API 调两次、一个只更新会员、一个只更新 AI」那种奇怪分裂

**实现要求**：
```typescript
// fetchAiUsageStatus 内部
const status = await proService.getStatus();

set({
  // 同时更新会员状态
  isPro: status.isPro,
  plan: status.proPlan,
  expiresAt: status.proExpiresAt,
  features: status.features,
  
  // 同时更新 AI 使用状态
  aiUsageStatus: {
    aiCallsToday: status.aiCallsToday,
    aiDailyLimit: status.aiDailyLimit,
    aiRemaining: status.aiRemaining,
    lastFetchedAt: Date.now(),
  },
});
```

**目的**：
- 确保 `isPro` 状态与 AI 使用状态始终同步
- 避免 `isPro` 在不同地方有不同值

### 3.4 后端 API 返回格式（已有，无需改动）

```typescript
// /api/v1/pro/status 返回
interface MembershipStatus {
  isPro: boolean;
  proPlan: 'monthly' | 'quarterly' | 'yearly' | null;
  proExpiresAt: string | null;
  features: string[];
  aiCallsToday: number;
  aiDailyLimit: number;
  aiRemaining: number;
}
```

**注意**：后端返回的字段名必须与前端 `AiUsageStatus` 字段名一致。

### 3.5 错误对象统一格式（必须遵守）

**硬规则**：
> 不论是非流式还是流式接口，**错误对象的结构必须统一为**：

```typescript
type AppError = {
  code?: string;      // 错误码，如 'AI_DAILY_LIMIT_REACHED'
  message?: string;   // 错误消息
  data?: any;         // 可选：错误数据，如 { aiCallsToday, aiDailyLimit, aiRemaining }
};
```

**实现要求**：
- 流式接口内部 `reject()` 时也要用这个类型
- 非流式接口（axios）返回的错误也要统一为这个格式
- 这样 `handleSendError` 才能稳定判断 `error.code === 'AI_DAILY_LIMIT_REACHED'`

**禁止**：
- ❌ 禁止流式返回 `{ error: { code, message } }`，非流式返回 `{ code, message }`
- ❌ 禁止错误对象结构不一致

**流式错误处理示例**：
```typescript
// 在流式响应中
if (data.type === 'error' && data.code === 'AI_DAILY_LIMIT_REACHED') {
  reject({
    code: 'AI_DAILY_LIMIT_REACHED',
    message: data.message,
    data: data.details, // 可选：包含最新状态
  });
}
```

---

## 四、实施清单

### 📝 文件改造清单

#### 1. **app/src/store/proStore.ts**（核心改造）

**必须实现**：
- [ ] 扩展 `ProState` 接口，添加 `aiUsageStatus`, `isAiUsageLoading` 字段
- [ ] 实现 `fetchAiUsageStatus(options?: { force?: boolean })`：
  - [ ] 调用 `proService.getStatus()`
  - [ ] 实现 30 秒节流逻辑（`lastFetchedAt` 检查，`force: true` 时忽略节流）
  - [ ] **同时更新会员状态**（`isPro`, `plan`, `expiresAt`, `features`）- 规则 3.3
  - [ ] **同时更新 AI 使用状态**（`aiUsageStatus` 并设置 `lastFetchedAt`）
  - [ ] 处理错误（静默失败，不影响功能）
- [ ] 实现 `consumeAiUsageLocally()`：
  - [ ] 本地 `aiCallsToday++`
  - [ ] 本地 `aiRemaining--`（但不小于 0）
  - [ ] 不调用 API
  - [ ] **触发时机**：只要聊天接口返回 2xx 并开始输出，就视为已计入当天使用次数（流式中途中断亦不回退次数）
  - [ ] 在 `sendMessageWithStream` **确认没有 throw** 即可视为成功，然后调用一次 `consumeAiUsageLocally()`
- [ ] 实现 `resetAiUsage()`：
  - [ ] 清空 `aiUsageStatus = null`
  - [ ] 重置 `isAiUsageLoading = false`
- [ ] 在 `reset()` 中调用 `resetAiUsage()`

**向后兼容要求**：
- [ ] 确保 `aiUsageStatus` 为 `null` 时不影响现有使用 `useProStore` 的页面

---

#### 2. **app/src/screens/Chat/ChatScreen.tsx**（核心改造）

**必须实现**：
- [ ] 导入 `useProStore` 和 `useFocusEffect`
- [ ] 添加 `isSending` state（如果还没有）
- [ ] 在 `useFocusEffect` 中获取 AI 使用状态：
  ```typescript
  useFocusEffect(
    useCallback(() => {
      if (user && !isPro) {
        fetchAiUsageStatus().catch(() => {
          // 静默失败，后端兜底
        });
      }
    }, [user?.id, isPro]),
  );
  ```
- [ ] 在 `handleSendMessage` **开头**添加拦截逻辑（必须按规则 2 + 规则 7 实现）：
  ```typescript
  // 1. 并发保护
  if (isSending) return;
  setIsSending(true);
  
  try {
    // 2. 拦截检查（规则 2：状态为空时放行）
    if (!isPro) {
      if (!aiUsageStatus) {
        try {
          await fetchAiUsageStatus();
        } catch {
          // 拉不到 → 不拦截，允许发送（后端兜底）
        }
      }
      
      // 规则 7：如果本地剩余 <= 0，强制刷新一次确认（避免跨日误拦截）
      if (aiUsageStatus && aiUsageStatus.aiRemaining <= 0) {
        try {
          await fetchAiUsageStatus({ force: true });
        } catch {
          // 拉不到 → 宁可放行，交给后端兜底
          // 不拦截，继续发送
        }
        
        // 用最新的状态再做一次判断
        const latest = proStore.getState().aiUsageStatus;
        if (latest && latest.aiRemaining <= 0) {
          // 确认仍然 <= 0，才拦截
          showLimitReachedUi();
          return;
        }
        // 如果刷新后 > 0，继续发送（跨日重置了）
      }
    }
    
    // 3. 发送逻辑
    await sendMessageWithStream(...);
    
    // 4. 成功后本地更新（可选，Phase 2）
    // 注意：只要接口返回 2xx 并开始输出，就算一次使用
    if (!isPro && aiUsageStatus) {
      consumeAiUsageLocally();
    }
  } catch (error) {
    // 5. 错误处理
    handleSendError(error);
  } finally {
    setIsSending(false);
  }
  ```
- [ ] 实现 `showLimitReachedUi()` 统一函数（规则 6）
- [ ] 在错误处理中统一使用 `showLimitReachedUi()`（规则 6）
- [ ] 添加 `useEffect` 监听 `isPro` 变化，Pro 时清空 AI 状态（规则 4.2）

---

#### 3. **app/src/store/authStore.ts**（必须改造）

**必须实现**：
- [ ] 在 `logout()` 中调用 `useProStore.getState().resetAiUsage()`

**实现位置**：
```typescript
logout: async () => {
  // ... 现有逻辑 ...
  
  // 清空 AI 使用状态
  useProStore.getState().resetAiUsage();
  
  // ... 其他清理逻辑 ...
}
```

---

#### 4. **app/src/utils/aiUsage.ts**（可选，推荐）

**可选实现**：
- [ ] 创建 `showLimitReachedUi()` 工具函数
- [ ] 创建 `formatAiUsageStatus()` 格式化函数（如果 Phase 3 需要）

**如果创建此文件**：
- 所有「今日次数用完」的 UI 都调用这个函数

---

#### 5. **ProSubscriptionScreen**（可选改造）

**可选实现**：
- [ ] 在 Pro 开通成功后，调用 `proStore.resetAiUsage()`
- [ ] 确保 `isPro` 状态更新

---

## 五、代码实现要求

### 5.1 命名规范

**必须遵守**：
- 字段名：`aiCallsToday`, `aiDailyLimit`, `aiRemaining`（与后端一致）
- 函数名：`fetchAiUsageStatus`, `consumeAiUsageLocally`, `resetAiUsage`
- UI 函数：`showLimitReachedUi`

**禁止**：
- ❌ 禁止使用 `remaining`, `left`, `used` 等别名

---

### 5.2 错误处理规范

**必须遵守**：
- `fetchAiUsageStatus` 失败时：**静默失败**，不阻止用户使用
- `AI_DAILY_LIMIT_REACHED` 错误：**不输出 `console.error`**，只调用 `showLimitReachedUi()`
- 状态为空时：**允许发送**，交给后端判断
- **错误对象格式统一**：流式和非流式接口的错误对象必须统一为 `{ code, message, data? }` 格式（规则 3.5）

### 5.4 本地状态同步的 Trade-off

**规则**：
- 本地状态（`aiUsageStatus`）**仅作为 UI 参考**，不作为安全逻辑依据
- 以后端为准：即使前端显示 `aiRemaining = 1`，如果后端已用完，仍会返回 `AI_DAILY_LIMIT_REACHED`
- 允许误差：在误差不大的情况下，UI 显示的剩余有时候比实际多 1，但不会影响安全性

**触发时机**：
- `consumeAiUsageLocally()` 在 `sendMessageWithStream` 确认没有 throw 时调用
- 只要接口返回 2xx 并开始输出，就视为已计入当天使用次数
- 流式中途中断亦不回退次数（因为后端通常一进接口就先扣）

---

### 5.3 性能要求

**必须遵守**：
- `fetchAiUsageStatus` 必须实现 30 秒节流
- 禁止在每次 `handleSendMessage` 都调用 API
- `isSending` 必须正确使用，防止并发请求

---

## 六、测试检查清单

### ✅ 功能测试

#### 1. 正常流程
- [ ] 非会员：前 5 次正常发送
- [ ] 第 6 次：前端拦截，显示 `showLimitReachedUi()` 弹窗
- [ ] Pro 会员：不受限制，正常发送

#### 2. 边界情况
- [ ] **状态为空时**：允许发送（后端兜底）
- [ ] **API 失败时**：允许发送（后端兜底）
- [ ] **多端并发**：后端正确限流，不会超限

#### 3. 状态同步
- [ ] 发送成功后：本地状态减 1（如果实现了 Phase 2）
- [ ] 收到 `AI_DAILY_LIMIT_REACHED`：同步后端状态或强制刷新
- [ ] 页面聚焦：刷新状态（30 秒内不重复请求）

#### 4. Pro 开通
- [ ] 开通后：不再拦截
- [ ] 从订阅页返回：状态更新，`isPro = true`
- [ ] Pro 用户：不显示「今日剩余 X/5 次」

#### 5. 登出/切换账号
- [ ] 登出：清空 AI 状态
- [ ] 切换账号：新账号状态正确

#### 6. 跨日重置场景（规则 7）
- [ ] 在当天用完免费额度 → `aiRemaining = 0`，前端会拦截
- [ ] 等到「后端日统计重置」之后（可以让后端暂时缩短重置周期测试）
- [ ] 再次发送消息 → 前端会先强制刷新（`force: true`），然后允许发送，不会继续提示「今日已用完」

#### 7. 流式中途错误场景
- [ ] 开启一个会产生较长流式输出的请求
- [ ] 中途模拟网络中断 / 服务端关闭连线
- [ ] 确认：
  - 若后端仍计次 → 下次再发送时，后端正确返回 `AI_DAILY_LIMIT_REACHED`
  - 前端 `handleSendError` 能正确识别这个错误（统一错误格式）
  - 本地状态已更新（`consumeAiUsageLocally` 已调用），不会重复扣次

---

### ✅ 代码检查

#### 1. 命名检查
- [ ] 所有字段使用 `aiRemaining`（不是 `remaining`）
- [ ] 所有字段使用 `aiCallsToday`, `aiDailyLimit`（与后端一致）

#### 2. 拦截逻辑检查
- [ ] 状态为空时**不拦截**（允许发送）
- [ ] 只有 `aiUsageStatus != null && aiRemaining <= 0` 时才拦截
- [ ] 拦截时调用 `showLimitReachedUi()`，不调用流式接口

#### 3. 并发保护检查
- [ ] `isSending` 正确使用，防止连点
- [ ] `setIsSending(false)` 放在 `finally` 中

#### 4. UI 统一检查
- [ ] 前端拦截和后端错误都只调用 `showLimitReachedUi()`
- [ ] 没有额外的 `console.error` 或 toast

#### 5. 状态管理检查
- [ ] `fetchAiUsageStatus` 实现 30 秒节流（`force: true` 时忽略节流）
- [ ] `fetchAiUsageStatus` 同时更新会员状态和 AI 使用状态（规则 3.3）
- [ ] `logout()` 时清空 AI 状态
- [ ] Pro 开通后清空 AI 状态

#### 6. 跨日重置检查（规则 7）
- [ ] 当 `aiRemaining <= 0` 时，拦截前先强制刷新一次（`force: true`）
- [ ] 刷新后再次判断，只有仍然 `<= 0` 才拦截

#### 7. 错误格式检查
- [ ] 流式和非流式接口的错误对象格式统一（`{ code, message, data? }`）
- [ ] `handleSendError` 能正确识别 `error.code === 'AI_DAILY_LIMIT_REACHED'`

---

### ✅ 性能检查

- [ ] `fetchAiUsageStatus` 不会在每次发送时都调用
- [ ] 节流逻辑正确（30 秒内不重复请求）
- [ ] `isSending` 防止并发请求

---

## 七、实施优先级（仅供参考）

> **注意**：以下 Phase 只是实施建议，开发时可以根据实际情况调整。重点是**功能需求必须全部实现**。

### Phase 1：核心功能（P0）
- `proStore` 扩展
- `ChatScreen` 拦截逻辑
- `showLimitReachedUi()` 统一函数
- `authStore.logout()` 清理

### Phase 2：体验优化（P1）
- 发送成功后本地更新状态
- 错误时强制刷新状态

### Phase 3：UI 优化（P2 - 可选）
- 显示剩余次数 UI
- 接近限制时提示

---

## 八、关键成功因素

1. ✅ **状态为空时允许发送**（后端兜底）
2. ✅ **命名统一**（`aiRemaining`，不是 `remaining`）
3. ✅ **UI 统一**（只走 `showLimitReachedUi()`）
4. ✅ **并发保护**（`isSending` 必须）
5. ✅ **Pro 开通/登出**（清空状态）
6. ✅ **节流控制**（30 秒内不重复请求）
7. ✅ **跨日重置保护**（规则 7：剩余为 0 时强制刷新确认）
8. ✅ **isPro 同步**（`fetchAiUsageStatus` 同时更新会员状态）
9. ✅ **错误格式统一**（流式和非流式统一格式）

---

## 九、PR Review 检查点

在 PR review 时，用以下硬规则 check 一遍：

- [ ] ✅ 有没有 `aiRemaining <= 0` 的前端拦截
- [ ] ✅ `/pro/status` 失败时有没有误杀（状态为空时允许发送）
- [ ] ✅ `AI_DAILY_LIMIT_REACHED` 是不是只走一个 UI（`showLimitReachedUi`）
- [ ] ✅ 登出 / 开通 Pro 之后有没有清干净状态
- [ ] ✅ `isSending` 是否正确使用
- [ ] ✅ 命名是否统一（`aiRemaining`，不是 `remaining`）
- [ ] ✅ 节流逻辑是否正确（30 秒内不重复请求，`force: true` 时忽略）
- [ ] ✅ 跨日重置保护（规则 7：剩余为 0 时是否强制刷新确认）
- [ ] ✅ `fetchAiUsageStatus` 是否同时更新会员状态和 AI 状态
- [ ] ✅ 错误格式是否统一（流式和非流式统一为 `{ code, message, data? }`）
- [ ] ✅ 未登入策略是否明确（根据业务需求选择情况 A 或 B）

---

## 十、未来扩展说明（可选）

### 多 AI 功能的共用配额

**当前规格**：本规格目前仅针对 ChatScreen 的聊天占卜功能。

**未来扩展建议**：
- 若未来其他功能也共用同一个 AI 日限（例如：八字报告生成、塔罗单抽、合盘分析），应该**复用同一套 `aiUsageStatus` 逻辑**，而不是重新实作另一套次数判断。

**复用方式**：
- 所有使用 AI 的功能都调用 `proStore.fetchAiUsageStatus()` 获取状态
- 所有使用 AI 的功能都在发送前检查 `aiRemaining <= 0`
- 所有使用 AI 的功能都使用统一的 `showLimitReachedUi()` UI

**目的**：
- 避免到处出现第二个 `xxxDailyLimit`
- 保持系统一致性

---

**文档完成时间**：2025-01-XX  
**文档版本**：v1.1 - 优化版（补充跨日重置、isPro 同步、错误格式统一等细节）  
**下一步**：根据此规格开始实施

