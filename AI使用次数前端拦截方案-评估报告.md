# AI 使用次数前端拦截方案 - 评估报告

> **评估时间**：2025-01-XX  
> **评估范围**：方案与系统现状的匹配度、改造范围、影响分析

---

## 一、方案与系统现状匹配度分析

### ✅ 已完全匹配的部分（无需改造）

#### 1. 后端 API 协议
- ✅ `/api/v1/pro/status` **已返回** `aiCallsToday`, `aiDailyLimit`, `aiRemaining`
- ✅ 后端已有 `getAIUsageStatus()` 函数，逻辑完整
- ✅ 后端已有 `checkAndCountAIUsage()` 作为硬限制兜底
- ✅ 错误协议：`AI_DAILY_LIMIT_REACHED` 已统一返回

**匹配度：100%** - 后端完全符合方案要求，无需改动

#### 2. 前端服务层
- ✅ `proService.getStatus()` 已存在，返回 `MembershipStatus` 接口
- ✅ `MembershipStatus` 接口已包含 `aiCallsToday`, `aiDailyLimit`, `aiRemaining`
- ✅ API 调用封装完整

**匹配度：100%** - 前端服务层已就绪

#### 3. 错误处理基础
- ✅ ChatScreen 已处理 `AI_DAILY_LIMIT_REACHED` 错误
- ✅ 已显示 Alert 弹窗
- ✅ 已移除 `console.error`（刚刚修复）

**匹配度：90%** - 基础已就绪，需要统一 UI 函数

---

### ⚠️ 部分匹配的部分（需要改造）

#### 1. 状态管理（useProStore）
**现状**：
```typescript
// 当前 proStore.ts
interface ProState {
  isPro: boolean;
  plan: 'yearly' | 'monthly' | 'lifetime' | null;
  expiresAt: string | null;
  features: string[];
  // ❌ 缺少 AI 使用状态字段
  // ❌ refreshProStatus() 是 TODO，未实现
}
```

**方案要求**：
```typescript
interface ProState {
  // 已有字段...
  aiUsageStatus: AiUsageStatus | null;
  isAiUsageLoading: boolean;
  fetchAiUsageStatus: (options?: { force?: boolean }) => Promise<void>;
  consumeAiUsageLocally: () => void;
  resetAiUsage: () => void;
}
```

**匹配度：30%** - 需要扩展 store

#### 2. ChatScreen 拦截逻辑
**现状**：
- ✅ 已有 `handleSendMessage` 函数
- ✅ 已有错误处理（后端兜底）
- ❌ **缺少前端拦截检查**（在调用流式接口前）
- ❌ 缺少 AI 使用状态获取
- ❌ 缺少本地状态同步

**匹配度：40%** - 需要添加拦截逻辑

#### 3. 页面聚焦刷新
**现状**：
- ✅ 项目中已有 `useFocusEffect` 使用模式（MeScreen, CasesScreen 等）
- ❌ ChatScreen **未使用** `useFocusEffect` 刷新 AI 状态

**匹配度：50%** - 需要添加聚焦刷新

---

## 二、改造范围详细清单

### 📝 需要修改的文件

#### 1. **app/src/store/proStore.ts**（核心改造）
**改造内容**：
- 扩展 `ProState` 接口，添加 AI 使用状态字段
- 实现 `fetchAiUsageStatus()` 方法（调用 `proService.getStatus()`）
- 实现 `consumeAiUsageLocally()` 方法（本地减 1）
- 实现 `resetAiUsage()` 方法
- 添加节流逻辑（30 秒内不重复请求）
- 在 `reset()` 中清空 AI 状态

**影响范围**：中等
- 可能影响已使用 `useProStore` 的页面（需要检查）
- 需要确保向后兼容

**风险评估**：
- ⚠️ **低风险**：只是扩展，不破坏现有功能
- ⚠️ 需要确保 `refreshProStatus()` 的实现不影响现有逻辑

---

#### 2. **app/src/screens/Chat/ChatScreen.tsx**（核心改造）
**改造内容**：
- 导入 `useProStore` 和 `useFocusEffect`
- 在 `useEffect` 或 `useFocusEffect` 中获取 AI 使用状态
- 在 `handleSendMessage` **开头**添加拦截逻辑：
  ```typescript
  if (!isPro && aiUsageStatus && aiUsageStatus.remaining <= 0) {
    showLimitReachedUi();
    return; // 不调用流式接口
  }
  ```
- 发送成功后调用 `consumeAiUsageLocally()`
- 统一错误处理函数 `showLimitReachedUi()`
- 在流式错误处理中同步状态

**影响范围**：高
- 直接影响聊天功能的核心流程
- 需要充分测试各种边界情况

**风险评估**：
- ⚠️ **中风险**：修改核心发送逻辑，需要仔细测试
- ⚠️ 需要确保拦截逻辑不会误杀（状态为空时的处理）
- ⚠️ 需要确保多端并发场景下的体验

---

#### 3. **app/src/services/api/proService.ts**（可选优化）
**改造内容**：
- 检查返回类型是否完全匹配 `MembershipStatus`
- 确保 `resetAt` 字段（如果后端返回）

**影响范围**：低
- 可能只是类型检查，不涉及逻辑改动

**风险评估**：
- ✅ **低风险**：主要是类型对齐

---

#### 4. **app/src/store/authStore.ts**（可选改造）
**改造内容**：
- 在 `logout()` 中调用 `useProStore.getState().resetAiUsage()`
- 确保切换账号时清空 AI 状态

**影响范围**：低
- 只是添加一个调用

**风险评估**：
- ✅ **低风险**：清理逻辑，不影响功能

---

### 📦 可能需要新建的文件

#### 1. **app/src/utils/aiUsage.ts**（可选）
**用途**：统一的 AI 使用状态工具函数
- `showLimitReachedUi()` - 统一的限制提示 UI
- `formatAiUsageStatus()` - 格式化显示

**影响范围**：低
- 新建文件，不影响现有代码

---

## 三、影响分析

### 🎯 功能影响

#### 正面影响
1. ✅ **用户体验提升**
   - 非会员用完次数后，不再看到"发送失败"的错误
   - 直接提示"开通会员"，转化路径更短

2. ✅ **减少无效请求**
   - 前端拦截后，不会调用流式接口
   - 节省服务器资源（特别是 LLM 调用成本）

3. ✅ **多端一致性**
   - 后端仍是最终裁判，保证多端不超限
   - 前端只是优化体验，不影响安全性

#### 潜在风险
1. ⚠️ **状态延迟问题**
   - 用户在其他设备用完次数，本地状态可能过期
   - **缓解**：后端兜底 + 错误时强制刷新

2. ⚠️ **API 失败场景**
   - 如果 `/pro/status` 失败，前端拦截可能误杀
   - **缓解**：状态为空时允许发送，交给后端判断

3. ⚠️ **并发请求**
   - 快速连续点击可能绕过检查
   - **缓解**：已有 `isSending` 标志，需要确保使用

---

### 🔄 代码影响

#### 依赖关系
```
ChatScreen
  ├─ useProStore (扩展后)
  │   └─ proService.getStatus()
  │       └─ apiClient.get()
  └─ useFocusEffect (新增)
```

#### 可能受影响的页面
- **ChatScreen**：直接改造
- **ProSubscriptionScreen**：可能已使用 `useProStore`，需要检查兼容性
- **其他使用 `useProStore` 的页面**：需要检查是否有破坏性变更

---

### 📊 测试范围

#### 必须测试的场景
1. ✅ **正常流程**
   - 非会员：前 5 次正常发送
   - 第 6 次：前端拦截，显示弹窗
   - Pro 会员：不受限制

2. ✅ **边界情况**
   - 状态为空时：允许发送（后端兜底）
   - API 失败时：允许发送（后端兜底）
   - 多端并发：后端正确限流

3. ✅ **状态同步**
   - 发送成功后：本地状态减 1
   - 收到 `AI_DAILY_LIMIT_REACHED`：同步后端状态
   - 页面聚焦：刷新状态

4. ✅ **Pro 开通**
   - 开通后：不再拦截
   - 从订阅页返回：状态更新

5. ✅ **登出/切换账号**
   - 登出：清空 AI 状态
   - 切换账号：新账号状态正确

---

## 四、实施建议

### 🎯 分阶段实施（推荐）

#### Phase 1：基础拦截（P0 - 核心功能）
**目标**：实现前端拦截，减少无效请求

**任务清单**：
1. ✅ 扩展 `useProStore`，添加 AI 使用状态字段和方法
2. ✅ 在 `ChatScreen` 中添加 `useFocusEffect` 获取状态
3. ✅ 在 `handleSendMessage` 开头添加拦截逻辑
4. ✅ 统一 `showLimitReachedUi()` 函数

**预计工作量**：2-3 小时
**风险等级**：中

---

#### Phase 2：状态同步（P1 - 体验优化）
**目标**：发送成功后本地更新状态，体验更顺滑

**任务清单**：
1. ✅ 发送成功后调用 `consumeAiUsageLocally()`
2. ✅ 收到 `AI_DAILY_LIMIT_REACHED` 时强制刷新状态
3. ✅ 在 `authStore.logout()` 中清空 AI 状态

**预计工作量**：1 小时
**风险等级**：低

---

#### Phase 3：UI 优化（P2 - 锦上添花）
**目标**：显示剩余次数，提升用户感知

**任务清单**：
1. ✅ 在输入框下方显示"今日剩余 X/5 次"
2. ✅ 接近限制时显示提示
3. ✅ Pro 用户显示"无限制"标签

**预计工作量**：1-2 小时
**风险等级**：低

---

### ⚠️ 注意事项

#### 1. 向后兼容
- `useProStore` 的扩展不能破坏现有使用
- 确保 `aiUsageStatus` 为 `null` 时不影响现有逻辑

#### 2. 错误处理
- 状态获取失败时，**不要禁止用户使用**
- 采用"后端兜底"策略，允许发送

#### 3. 性能考虑
- `fetchAiUsageStatus` 需要节流（30 秒内不重复请求）
- 避免在每次 `handleSendMessage` 都调用 API

#### 4. 测试覆盖
- 必须测试多端并发场景
- 必须测试 API 失败场景
- 必须测试状态过期场景

---

## 五、总结

### ✅ 方案可行性：**高度可行**

**理由**：
1. 后端基础设施已完全就绪（100% 匹配）
2. 前端服务层已就绪（100% 匹配）
3. 改造范围可控（主要是 2 个核心文件）
4. 风险可控（有后端兜底，不会影响安全性）

---

### 📋 改造范围总结

| 文件 | 改造类型 | 工作量 | 风险等级 |
|------|---------|--------|----------|
| `proStore.ts` | 扩展 | 中等 | 低 |
| `ChatScreen.tsx` | 核心逻辑 | 高 | 中 |
| `authStore.ts` | 清理逻辑 | 低 | 低 |
| `proService.ts` | 类型检查 | 低 | 低 |

**总计**：预计 4-6 小时完成 Phase 1 + Phase 2

---

### 🎯 建议

1. **立即实施 Phase 1**：核心功能，价值最大
2. **后续实施 Phase 2**：体验优化，成本低
3. **可选实施 Phase 3**：根据产品需求决定

**关键成功因素**：
- ✅ 确保状态为空时允许发送（后端兜底）
- ✅ 确保多端并发场景下后端正确限流
- ✅ 充分测试边界情况

---

## 六、风险评估矩阵

| 风险项 | 概率 | 影响 | 风险等级 | 缓解措施 |
|--------|------|------|----------|----------|
| 状态延迟导致误拦截 | 中 | 中 | 🟡 中 | 状态为空时允许发送 |
| API 失败导致功能不可用 | 低 | 高 | 🟡 中 | 后端兜底策略 |
| 多端并发超限 | 低 | 中 | 🟢 低 | 后端硬限制 |
| Store 扩展破坏现有功能 | 低 | 中 | 🟢 低 | 向后兼容设计 |
| 并发请求绕过检查 | 低 | 低 | 🟢 低 | 已有 isSending 标志 |

**总体风险等级**：🟡 **中等** - 可控，有缓解措施

---

**报告完成时间**：2025-01-XX  
**评估人**：AI Assistant  
**下一步**：等待确认后开始实施 Phase 1


