# iOS 订阅 Mock 流程 - 实施完成报告

> **实施时间**：2025-12-03  
> **目标**：提供可快速测试的 iOS 订阅流程，支持 Mock 和正式两种模式  
> **状态**：✅ 完成

---

## 📋 实施概览

### 核心目标

在 iOS App 里**完整走一遍订阅流程**，点完「订阅」后，App & 后端都把这个帐号当成**付费会员（Pro）**来用，方便测试体验，不影响正式上线。

### 实施策略

采用**统一订阅入口 + 环境开关**的方式：
- **Mock 模式**（`EXPO_PUBLIC_MOCK_IOS_SUBSCRIPTION=1` 且 `__DEV__`）：调用 `/dev/force-pro`
- **正式模式**：调用 `/api/v1/pro/subscribe`
- UI 层完全不需要改动，只需要切换环境变量

---

## 🎯 完成项目清单

### 一、后端改动（Core）

#### 1.1 数据库 Migration ✅

**文件**：`core/src/database/migrations/012_add_quarterly_plan.sql`

**内容**：
- 修改 `subscriptions.plan` 字段，增加 `quarterly` 选项
- 修改 `users.pro_plan` 字段，增加 `quarterly` 选项
- 支持月付（monthly）/ 季付（quarterly）/ 年付（yearly）/ 终身（lifetime）

**执行方式**：
```bash
cd core
mysql -u root -p xiaopei < src/database/migrations/012_add_quarterly_plan.sql
```

#### 1.2 开发专用路由 ✅

**文件**：`core/src/routes/dev.ts`（新建）

**接口**：

1. **`POST /dev/force-pro`** - 强制升级为 Pro 会员
   - 需要认证（`requireAuth`）
   - 支持 `monthly` / `quarterly` / `yearly` / `lifetime`
   - 直接更新数据库，标记为 `dev-mock` 来源
   - 返回更新后的用户信息

2. **`POST /dev/reset-pro`** - 重置 Pro 状态（额外提供）
   - 用于测试时快速恢复免费状态

**安全措施**：
- ✅ 仅在 `NODE_ENV !== 'production'` 时注册
- ✅ 需要用户认证
- ✅ 生产环境调用 `/dev/*` → 404

#### 1.3 注册 Dev 路由 ✅

**文件**：`core/src/server.ts`

**改动**：
```typescript
// 开发专用路由（仅非生产环境）
if (process.env.NODE_ENV !== 'production') {
  import('./routes/dev').then(devRoutes => {
    app.use('/dev', devRoutes.default);
    console.log('[Dev] Development routes registered at /dev/*');
  });
}
```

#### 1.4 更新 Pro 路由支持 quarterly ✅

**文件**：`core/src/routes/pro.ts`

**改动**：
- `/api/v1/pro/fake-subscribe` 支持 `quarterly`
- 添加废弃提示，建议使用新的统一接口

---

### 二、前端改动（App）

#### 2.1 环境变量配置 ✅

**文件**：`app/src/config/env.ts`

**新增配置**：
```typescript
// iOS 订阅 Mock 开关（仅开发模式有效）
MOCK_IOS_SUBSCRIPTION: process.env.EXPO_PUBLIC_MOCK_IOS_SUBSCRIPTION === '1',
```

**启动日志**：
```
[ENV Config] 🎭 Mock iOS 订阅: ✅ 开启 / ❌ 关闭
```

**手动操作**：需要创建 `app/.env.example` 文件（因为 .gitignore 限制，需要手动创建）：

```bash
# 小佩 App 环境变量配置示例

# API 服务器地址
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000

# iOS 订阅 Mock 开关（仅开发模式有效）
# 1 = 开启 Mock（订阅走 /dev/force-pro，快速测试）
# 0 = 关闭 Mock（订阅走正式 API）
# 默认：0（关闭）
EXPO_PUBLIC_MOCK_IOS_SUBSCRIPTION=0
```

#### 2.2 Pro 服务统一订阅入口 ✅

**文件**：`app/src/services/api/proService.ts`

**新增方法**：
```typescript
async subscribe(data: SubscribeRequest): Promise<SubscribeResponse> {
  // 判斷是否使用 Mock 模式
  const isMockMode = __DEV__ && ENV.MOCK_IOS_SUBSCRIPTION;
  
  if (isMockMode) {
    // Mock 模式：調用開發專用接口
    return await post<SubscribeResponse>('/dev/force-pro', { plan: data.plan });
  } else {
    // 正式模式：調用真實訂閱接口
    return await post<SubscribeResponse>('/api/v1/pro/subscribe', data);
  }
}
```

**废弃方法**：
- `fakeSubscribe()` - 标记为 `@deprecated`，建议使用新的 `subscribe()`

#### 2.3 订阅页面更新 ✅

**文件**：`app/src/screens/ProSubscription/ProSubscriptionScreen.tsx`

**改动**：
```typescript
// 修改前：
await proService.fakeSubscribe({ plan: selectedPlan });

// 修改后：
await proService.subscribe({ plan: selectedPlan });
```

**效果**：
- UI 层完全不需要关心 Mock 还是正式
- 统一调用 `subscribe()`，底层自动根据环境变量选择

---

## 🚀 使用指南

### 开发阶段 - 启用 Mock 模式

#### 1. 配置环境变量

编辑 `app/.env`（如果没有，从 `.env.example` 复制）：

```bash
EXPO_PUBLIC_MOCK_IOS_SUBSCRIPTION=1
```

#### 2. 执行数据库迁移

```bash
cd core
mysql -u root -p xiaopei < src/database/migrations/012_add_quarterly_plan.sql
```

#### 3. 重启服务

```bash
# 重启 Core 服务
cd core
npm run dev

# 重启 App
cd app
npx expo start -c
```

#### 4. 测试订阅流程

1. 在 App 中登录
2. 进入「小佩 Pro」页面
3. 选择任意方案（月付/季付/年付）
4. 点击「立即订阅」
5. ✅ 看到「订阅成功」提示
6. ✅ 页面显示「您已是小佩會員」
7. ✅ AI 次数变成 100 次/天

#### 5. 验证后端状态

```bash
# 查看用户的 Pro 状态
mysql -u root -p xiaopei -e "SELECT user_id, is_pro, pro_plan, pro_expires_at FROM users WHERE is_pro = 1;"

# 查看订阅记录
mysql -u root -p xiaopei -e "SELECT * FROM subscriptions ORDER BY created_at DESC LIMIT 5;"
```

#### 6. 重置测试（可选）

如果需要重新测试免费用户订阅流程：

```bash
# 方法 1：使用 Dev 接口
curl -X POST http://localhost:3000/dev/reset-pro \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# 方法 2：直接修改数据库
mysql -u root -p xiaopei -e "UPDATE users SET is_pro = 0, pro_plan = NULL, pro_expires_at = NULL WHERE user_id = 'YOUR_USER_ID';"
```

---

### 生产阶段 - 使用正式 API

#### 1. 关闭 Mock 开关

编辑 `app/.env`：

```bash
EXPO_PUBLIC_MOCK_IOS_SUBSCRIPTION=0
```

或者使用 `.env.production`：

```bash
EXPO_PUBLIC_MOCK_IOS_SUBSCRIPTION=0
```

#### 2. 实现真实订阅逻辑

修改 `core/src/routes/pro.ts` 的 `/api/v1/pro/subscribe` 接口：
- 接入 App Store 收据验证
- 调用真实支付 SDK
- 验证订单状态

#### 3. 前端无需改动

因为使用统一的 `subscribe()` 方法，前端 UI 完全不需要修改。

---

## 📊 订阅方案配置

### 当前支持的方案

| 方案 | 标识 | 价格 | 时长 | 推荐 |
|------|------|------|------|------|
| 月付 | `monthly` | HK$ 39 | 30 天 | - |
| **季付** | `quarterly` | **HK$ 99** | **90 天** | **✅ 推荐** |
| 年付 | `yearly` | HK$ 348 | 365 天 | - |
| 终身 | `lifetime` | - | 永久 | - |

### 方案配置位置

**后端**：`core/src/modules/pro/proService.ts`

```typescript
const PLAN_CONFIG = {
  monthly: { duration: 30, name: '月度会员' },
  quarterly: { duration: 90, name: '季度会员' },
  yearly: { duration: 365, name: '年度会员' },
  lifetime: { duration: null, name: '终身会员' },
};
```

**前端**：`app/src/screens/ProSubscription/ProSubscriptionScreen.tsx`

```typescript
const PLANS: Plan[] = [
  { type: 'monthly', label: '按月訂閱', price: 39, period: '/ 每月', tag: '早鳥價' },
  { type: 'quarterly', label: '按季訂閱', price: 99, period: '/ 每季', tag: '早鳥價 · 推薦', recommended: true },
  { type: 'yearly', label: '按年訂閱', price: 348, period: '/ 每年', tag: '早鳥價' },
];
```

---

## 🔍 工作流程对比

### Mock 模式流程

```
用户点击「订阅」
    ↓
前端：proService.subscribe({ plan })
    ↓
检查：__DEV__ && MOCK_IOS_SUBSCRIPTION === '1'
    ↓
POST /dev/force-pro
    ↓
后端：直接更新数据库
    - users.is_pro = TRUE
    - users.pro_plan = 'quarterly'
    - users.pro_expires_at = NOW() + 90天
    - subscriptions 插入记录（payment_provider = 'none'）
    ↓
返回：{ user: { isPro: true, ... }, source: 'dev-mock' }
    ↓
前端：更新状态 → 显示「订阅成功」
```

### 正式模式流程

```
用户点击「订阅」
    ↓
前端：proService.subscribe({ plan })
    ↓
检查：MOCK_IOS_SUBSCRIPTION === '0' 或生产环境
    ↓
POST /api/v1/pro/subscribe
    ↓
后端：调用真实支付 API
    - App Store / Google Play 收据验证
    - 支付成功后更新数据库
    - 记录外部订单号
    ↓
返回：{ subscription: { ... }, user: { isPro: true, ... } }
    ↓
前端：更新状态 → 显示「订阅成功」
```

---

## ⚠️ 注意事项

### 1. 数据库迁移

**必须执行** `012_add_quarterly_plan.sql`，否则插入 `quarterly` 会报错：

```
Data truncated for column 'plan' at row 1
```

### 2. 环境变量命名

遵循项目规范，使用 `EXPO_PUBLIC_` 前缀：
- ✅ `EXPO_PUBLIC_MOCK_IOS_SUBSCRIPTION`
- ❌ `MOCK_IOS_SUBSCRIPTION`（Expo 无法读取）

### 3. Dev 路由安全

**重要**：`/dev/*` 路由只在非生产环境存在

```typescript
// 生产环境检查
if (process.env.NODE_ENV === 'production') {
  return res.status(404).end(); // 装死
}
```

### 4. 缓存清除

订阅后需要清除 Pro 状态缓存：

```typescript
clearProStatusCache(userId);
```

否则可能出现订阅成功但权限未生效的问题。

### 5. 测试用户标识

建议在数据库中添加 `pro_source` 字段（可选），用于区分测试订阅：

```sql
ALTER TABLE users ADD COLUMN pro_source VARCHAR(20) DEFAULT NULL COMMENT '订阅来源';
```

标记测试用户：
```typescript
pro_source: 'dev-mock'  // Mock 模式
pro_source: 'apple'     // 真实 App Store
pro_source: 'google'    // 真实 Google Play
```

---

## 🎉 测试验证清单

### Mock 模式测试

- [ ] 环境变量设置为 `EXPO_PUBLIC_MOCK_IOS_SUBSCRIPTION=1`
- [ ] Core 服务启动时显示 `[Dev] Development routes registered at /dev/*`
- [ ] App 启动时显示 `[ENV Config] 🎭 Mock iOS 订阅: ✅ 开启`
- [ ] 订阅流程：
  - [ ] 选择月付方案 → 订阅成功 → is_pro = TRUE, pro_plan = 'monthly'
  - [ ] 选择季付方案 → 订阅成功 → is_pro = TRUE, pro_plan = 'quarterly'
  - [ ] 选择年付方案 → 订阅成功 → is_pro = TRUE, pro_plan = 'yearly'
- [ ] AI 次数显示变为 100 次/天
- [ ] 订阅页面显示「您已是小佩會員」
- [ ] 数据库 `subscriptions` 表有新记录

### 正式模式测试

- [ ] 环境变量设置为 `EXPO_PUBLIC_MOCK_IOS_SUBSCRIPTION=0`
- [ ] App 启动时显示 `[ENV Config] 🎭 Mock iOS 订阅: ❌ 关闭`
- [ ] 订阅调用走 `/api/v1/pro/subscribe`
- [ ] 真实支付流程正常（待实现 App Store 集成）

---

## 📚 相关文档

- **订阅页面设计**：`app.doc/features/小佩Pro-订阅页面设计文档.md`
- **Pro 功能说明**：`app.doc/features/小佩Pro-功能与服务说明文档.md`
- **会员限制方案**：`会员订阅与AI解读次数限制-优化方案.md`
- **数据库结构**：`core/src/database/migrations/002_phase4_tables.sql`

---

## 🔧 故障排查

### 问题 1：订阅返回 500 错误

**原因**：数据库表不支持 `quarterly`

**解决**：
```bash
mysql -u root -p xiaopei < core/src/database/migrations/012_add_quarterly_plan.sql
```

### 问题 2：订阅成功但状态未更新

**原因**：缓存未清除

**解决**：在 `subscribe()` 后调用 `clearProStatusCache(userId)`

### 问题 3：/dev/force-pro 返回 401

**原因**：请求未携带认证 Token

**解决**：确保在前端调用时 `apiClient` 已配置 `Authorization` header

### 问题 4：生产环境可以访问 /dev/*

**原因**：`NODE_ENV` 未设置为 `production`

**解决**：
```bash
export NODE_ENV=production
```

---

## ✅ 实施总结

### 改动统计

| 分类 | 新建文件 | 修改文件 | 代码行数 |
|------|---------|---------|---------|
| **后端** | 2 | 2 | ~200 行 |
| **前端** | 1 | 3 | ~80 行 |
| **文档** | 1 | 0 | ~600 行 |
| **总计** | 4 | 5 | ~880 行 |

### 核心优势

1. ✅ **好 Mock**：一个开关控制，无需改代码
2. ✅ **好关闭**：生产环境自动切换正式 API
3. ✅ **不影响上线**：`/dev/*` 路由生产环境不存在
4. ✅ **多设备同步**：Mock 模式走后端，数据库真实更新
5. ✅ **易于测试**：提供 `reset-pro` 接口快速恢复免费状态

### 后续工作

1. **接入真实支付**：实现 `/api/v1/pro/subscribe` 的 App Store / Google Play 集成
2. **收据验证**：添加支付收据验证逻辑
3. **订阅管理**：实现订阅取消、续费、退款等功能
4. **数据统计**：添加订阅转化率、收入统计等

---

**实施完成时间**：2025-12-03  
**实施人员**：AI Assistant  
**审核状态**：待用户测试验证

🎉 **Mock 订阅流程已完整实施，可以开始测试！**


