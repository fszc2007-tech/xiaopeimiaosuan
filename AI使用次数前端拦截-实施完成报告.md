# AI 使用次数前端拦截 - 实施完成报告

> **完成时间**：2025-01-XX  
> **实施规格**：AI使用次数前端拦截方案-最终实施规格.md v1.1  
> **实施状态**：✅ 全部完成

---

## 一、实施概览

### ✅ 已完成的核心功能

1. **proStore 扩展**：添加 AI 使用状态字段和方法
2. **fetchAiUsageStatus**：实现节流和状态同步
3. **consumeAiUsageLocally 和 resetAiUsage**：本地状态管理
4. **ChatScreen 拦截逻辑**：实现规则 2 + 规则 7 的前端拦截
5. **showLimitReachedUi**：统一的 AI 次数限制提示 UI
6. **authStore 集成**：登出时清空 AI 状态
7. **isPro 监听**：Pro 开通后清空 AI 状态
8. **流式错误处理**：统一错误格式（规则 3.5）

---

## 二、文件修改清单

### 1. app/src/store/proStore.ts（核心改造）

#### 新增接口
```typescript
interface AiUsageStatus {
  aiCallsToday: number;
  aiDailyLimit: number | null;
  aiRemaining: number;
  resetAt?: string | null;
  lastFetchedAt: number;
}
```

#### 扩展 ProState
- ✅ 新增字段：`aiUsageStatus`, `isAiUsageLoading`
- ✅ 新增方法：`fetchAiUsageStatus`, `consumeAiUsageLocally`, `resetAiUsage`

#### 实现的方法

**fetchAiUsageStatus**
- ✅ 调用 `proService.getStatus()`
- ✅ 实现 30 秒节流逻辑（`force: true` 时忽略）
- ✅ 同时更新会员状态（`isPro`, `plan`, `expiresAt`, `features`）- 规则 3.3
- ✅ 同时更新 AI 使用状态（`aiUsageStatus`）
- ✅ 静默失败处理（不阻止用户使用）

**consumeAiUsageLocally**
- ✅ 本地 `aiCallsToday++`
- ✅ 本地 `aiRemaining--`（但不小于 0）
- ✅ 不调用 API

**resetAiUsage**
- ✅ 清空 `aiUsageStatus = null`
- ✅ 重置 `isAiUsageLoading = false`

---

### 2. app/src/store/authStore.ts（必须改造）

#### 修改的方法

**logout**
- ✅ 在登出时调用 `useProStore.getState().resetAiUsage()`
- ✅ 清空 AI 使用状态，避免切换账号时残留

---

### 3. app/src/screens/Chat/ChatScreen.tsx（核心改造）

#### 新增导入
- ✅ `Alert` from 'react-native'
- ✅ `useFocusEffect` from '@react-navigation/native'
- ✅ `useProStore` from '@/store'

#### 新增状态
- ✅ `isSending` state（规则 5：并发保护）
- ✅ 从 `useProStore` 获取：`isPro`, `aiUsageStatus`, `fetchAiUsageStatus`, `consumeAiUsageLocally`, `resetAiUsage`

#### 新增 useEffect / useFocusEffect

**isPro 监听（规则 4.2）**
```typescript
useEffect(() => {
  if (isPro) {
    resetAiUsage();
  }
}, [isPro, resetAiUsage]);
```

**页面聚焦获取状态（规则 3）**
```typescript
useFocusEffect(
  useCallback(() => {
    if (user && !isPro) {
      fetchAiUsageStatus().catch(() => {});
    }
  }, [user, isPro, fetchAiUsageStatus]),
);
```

#### 新增函数

**showLimitReachedUi（规则 6）**
- ✅ 统一的 AI 次数限制提示 UI
- ✅ 显示「今日解讀次數已用完」
- ✅ 提供「稍後再說」和「去開通會員」按钮

#### 修改的函数

**handleSendMessage（规则 2 + 规则 5 + 规则 7）**

1. **并发保护（规则 5）**
   - ✅ 检查 `isSending`，防止连点
   - ✅ 在 `finally` 中重置 `setIsSending(false)`

2. **拦截检查（规则 2）**
   - ✅ 状态为空时尝试拉取，失败则放行（后端兜底）
   - ✅ 只有 `aiUsageStatus != null && aiRemaining <= 0` 时才拦截

3. **跨日重置保护（规则 7）**
   - ✅ 当 `aiRemaining <= 0` 时，强制刷新一次确认（`force: true`）
   - ✅ 用最新状态再判断，只有仍然 `<= 0` 才拦截
   - ✅ 避免因「跨日重置 + 节流」导致的误拦截

4. **本地状态同步（规则 5.4）**
   - ✅ 发送成功后调用 `consumeAiUsageLocally()`
   - ✅ 只要接口返回 2xx 并开始输出，就算一次使用

5. **错误处理**
   - ✅ 检查 `error.code === 'AI_DAILY_LIMIT_REACHED'`
   - ✅ 统一使用 `showLimitReachedUi()`
   - ✅ 不输出 `console.error`（规则 6）

**sendMessageWithStream（规则 3.5）**

1. **流式错误处理**
   - ✅ `data.type === 'error'` 且 `data.code === 'AI_DAILY_LIMIT_REACHED'` 时：
     - 移除已添加的 assistant 消息
     - 调用 `showLimitReachedUi()`
     - 统一错误格式 reject：`{ code, message, data }`
   - ✅ 其他错误也使用统一格式：`{ code, message }`

2. **xhr.onload 错误处理**
   - ✅ 429 状态码且 `AI_DAILY_LIMIT_REACHED`：统一错误格式
   - ✅ 其他 HTTP 错误：统一错误格式

3. **xhr.onerror / xhr.onabort**
   - ✅ 统一错误格式：`{ code: 'NETWORK_ERROR', message }`
   - ✅ 统一错误格式：`{ code: 'REQUEST_ABORTED', message }`

---

## 三、实施的硬规则检查

### ✅ 规则 1：类型与命名统一
- ✅ 所有字段使用 `aiCallsToday`, `aiDailyLimit`, `aiRemaining`
- ✅ 禁止使用 `remaining`, `left`, `used` 等别名

### ✅ 规则 2：状态拿不到时一律放行
- ✅ 只在 `aiUsageStatus != null` 且 `aiRemaining <= 0` 时拦截
- ✅ 状态为空或 API 失败时允许发送（后端兜底）

### ✅ 规则 3：fetchAiUsageStatus 调用时机
- ✅ 页面聚焦时调用（非 Pro 用户）
- ✅ 实现 30 秒节流（`force: true` 时忽略）
- ✅ 禁止在每次 `handleSendMessage` 都调用

### ✅ 规则 3.3：isPro 同步
- ✅ `fetchAiUsageStatus` 同时更新会员状态和 AI 状态
- ✅ 确保 `isPro` 状态与 AI 使用状态始终同步

### ✅ 规则 3.5：错误格式统一
- ✅ 流式和非流式接口统一为 `{ code, message, data? }` 格式
- ✅ 所有 reject 使用统一格式

### ✅ 规则 4：Pro 开通/登出行为
- ✅ 登出时调用 `resetAiUsage()`
- ✅ Pro 开通后（`isPro` 变化）调用 `resetAiUsage()`

### ✅ 规则 5：并发保护
- ✅ `isSending` guard 防止连点
- ✅ `setIsSending(false)` 放在 `finally` 中

### ✅ 规则 6：UI 统一
- ✅ 前端拦截和后端错误都只调用 `showLimitReachedUi()`
- ✅ 禁止额外的 `console.error` 或 toast

### ✅ 规则 7：跨日重置保护
- ✅ 当 `aiRemaining <= 0` 时，拦截前先强制刷新一次（`force: true`）
- ✅ 用最新状态再判断，只有仍然 `<= 0` 才拦截

---

## 四、代码质量检查

### ✅ Linter 检查
- ✅ `app/src/store/proStore.ts`：无错误
- ✅ `app/src/store/authStore.ts`：无错误
- ✅ `app/src/screens/Chat/ChatScreen.tsx`：无错误

### ✅ 命名规范
- ✅ 所有字段使用 `aiRemaining`（不是 `remaining`）
- ✅ 所有字段使用 `aiCallsToday`, `aiDailyLimit`（与后端一致）
- ✅ 函数名：`fetchAiUsageStatus`, `consumeAiUsageLocally`, `resetAiUsage`

### ✅ 错误处理
- ✅ `fetchAiUsageStatus` 失败时静默失败
- ✅ `AI_DAILY_LIMIT_REACHED` 不输出 `console.error`
- ✅ 状态为空时允许发送

### ✅ 性能优化
- ✅ `fetchAiUsageStatus` 实现 30 秒节流
- ✅ 禁止在每次 `handleSendMessage` 都调用 API
- ✅ `isSending` 防止并发请求

---

## 五、测试建议

### 必须测试的场景

#### 1. 正常流程
- [ ] 非会员：前 5 次正常发送
- [ ] 第 6 次：前端拦截，显示 `showLimitReachedUi()` 弹窗
- [ ] Pro 会员：不受限制，正常发送

#### 2. 边界情况
- [ ] **状态为空时**：允许发送（后端兜底）
- [ ] **API 失败时**：允许发送（后端兜底）
- [ ] **多端并发**：后端正确限流，不会超限

#### 3. 状态同步
- [ ] 发送成功后：本地状态减 1
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
- [ ] 等到「后端日统计重置」之后
- [ ] 再次发送消息 → 前端会先强制刷新（`force: true`），然后允许发送

#### 7. 流式中途错误场景
- [ ] 开启一个会产生较长流式输出的请求
- [ ] 中途模拟网络中断 / 服务端关闭连线
- [ ] 确认：
  - 若后端仍计次 → 下次再发送时，后端正确返回 `AI_DAILY_LIMIT_REACHED`
  - 前端能正确识别这个错误（统一错误格式）
  - 本地状态已更新（`consumeAiUsageLocally` 已调用）

---

## 六、关键实现细节

### 1. 节流逻辑
```typescript
// 30 秒内不重复请求（除非 force）
if (!options?.force && state.aiUsageStatus?.lastFetchedAt) {
  const elapsed = now - state.aiUsageStatus.lastFetchedAt;
  if (elapsed < 30 * 1000) {
    return; // 节流，直接返回
  }
}
```

### 2. 跨日重置保护
```typescript
// 如果本地剩余 <= 0，强制刷新一次确认
if (currentStatus && currentStatus.aiRemaining <= 0) {
  await fetchAiUsageStatus({ force: true });
  const latest = useProStore.getState().aiUsageStatus;
  if (latest && latest.aiRemaining <= 0) {
    showLimitReachedUi();
    return;
  }
}
```

### 3. 统一错误格式
```typescript
// 流式错误
reject({
  code: 'AI_DAILY_LIMIT_REACHED',
  message: data.message || '今日解讀次數已用完',
  data: data.details,
});

// HTTP 错误
reject({
  code: 'HTTP_ERROR',
  message: `HTTP error! status: ${xhr.status}`,
});
```

### 4. 并发保护
```typescript
if (isSending) return;
setIsSending(true);

try {
  // ... 发送逻辑
} finally {
  setIsSending(false); // 必须在 finally 中
}
```

---

## 七、与规格的符合度

| 规格要求 | 实施状态 | 备注 |
|---------|---------|------|
| 规则 1：命名统一 | ✅ 完成 | 所有字段使用 `aiRemaining` 等统一命名 |
| 规则 2：状态为空放行 | ✅ 完成 | 后端兜底策略 |
| 规则 3：调用时机 | ✅ 完成 | `useFocusEffect` + 节流 |
| 规则 3.3：isPro 同步 | ✅ 完成 | 同时更新会员和 AI 状态 |
| 规则 3.5：错误格式统一 | ✅ 完成 | `{ code, message, data? }` |
| 规则 4：Pro 开通/登出 | ✅ 完成 | 清空 AI 状态 |
| 规则 5：并发保护 | ✅ 完成 | `isSending` guard |
| 规则 6：UI 统一 | ✅ 完成 | `showLimitReachedUi()` 唯一入口 |
| 规则 7：跨日重置保护 | ✅ 完成 | 强制刷新确认 |

**总体符合度**：100%

---

## 八、后续优化建议（可选）

### Phase 3：UI 优化（P2）
1. 在输入框下方显示"今日剩余 X/5 次"
2. 接近限制时显示提示（例如剩余 1 次时）
3. Pro 用户显示"无限制"标签

### 未来扩展
- 如果其他功能也共用同一个 AI 日限，应该复用同一套 `aiUsageStatus` 逻辑
- 避免到处出现第二个 `xxxDailyLimit`

---

## 九、总结

### ✅ 已完成的核心功能
1. ✅ proStore 扩展（AI 使用状态字段和方法）
2. ✅ fetchAiUsageStatus（节流 + 状态同步）
3. ✅ consumeAiUsageLocally 和 resetAiUsage
4. ✅ ChatScreen 拦截逻辑（规则 2 + 规则 7）
5. ✅ showLimitReachedUi 统一函数
6. ✅ authStore 集成（登出清空）
7. ✅ isPro 监听（Pro 开通清空）
8. ✅ 流式错误处理（统一格式）

### ✅ 符合所有硬规则
- 规则 1-7 全部实现
- 规则 3.3（isPro 同步）已实现
- 规则 3.5（错误格式统一）已实现

### ✅ 代码质量
- 无 linter 错误
- 命名规范统一
- 错误处理完善
- 性能优化到位

### 🎯 下一步
- 进行功能测试（按测试清单）
- 验证多端并发场景
- 验证跨日重置场景
- 可选：实施 Phase 3 UI 优化

---

**实施完成时间**：2025-01-XX  
**实施人员**：AI Assistant  
**实施状态**：✅ **全部完成，可以进入测试阶段**

