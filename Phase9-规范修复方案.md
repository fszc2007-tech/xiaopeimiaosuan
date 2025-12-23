# Phase 9 规范修复方案

**创建时间**: 2024-11-18  
**目标**: 修复 Phase 8 中发现的所有不符合规范的问题

---

## 一、发现的问题与冲突

### 🚨 严重问题

#### 1. API 服务重复 ❗❗❗
**问题**: 
- 我创建的 `app/src/services/api.ts`（185行）
- 与现有的 `app/src/services/api/client.ts` **功能重复**
- 环境变量名称不一致：
  - 我的代码: `process.env.CORE_API_URL`
  - 项目规范: `process.env.EXPO_PUBLIC_API_BASE_URL`

**影响**: 
- 违反了项目架构规范
- 环境变量配置混乱
- 可能导致维护问题

**建议方案**:
```
方案 A（推荐）: 删除我的 api.ts，使用现有的 API 客户端
- ✅ 符合项目规范
- ✅ 使用已有的 axios 封装
- ✅ Token 管理已实现
- ❌ 需要重构 CasesScreen 和 MeScreen 的 API 调用

方案 B: 保留我的 api.ts，但修改环境变量名称
- ✅ 不需要大改代码
- ❌ 维护两套 API 客户端（不推荐）
- ❌ 违反 DRY 原则
```

**您的决定**: 方案 A 还是方案 B？

---

#### 2. ProSubscriptionScreen 与设计文档严重不符 ❗

**设计文档要求 vs 实际实现对比**:

| 功能模块 | 设计文档 | 实际实现 | 状态 |
|---------|---------|---------|------|
| 订阅方案 | 3个（月/年/终身） | 2个（月/年） | ❌ 缺失 |
| 顶部导航 | 返回按钮+标题层级 | 关闭按钮 | ❌ 不符 |
| 当前状态卡片 | 必须 | 无 | ❌ 缺失 |
| Pro介绍卡片 | 渐变背景+理念说明 | 简化版 | ⚠️ 简化 |
| 权益总览 | 动态切换 | 固定4个 | ⚠️ 简化 |
| FAQ | 常见问题列表 | 简化为说明 | ❌ 缺失 |
| 底部链接 | 恢复购买+协议 | 仅说明文字 | ❌ 缺失 |

**建议**: 完全按照设计文档重构

---

### ⚠️ 中等问题

#### 3. 路由注册缺失
**问题**: 新增的 3 个二级页面未注册到路由系统
- ChatHistoryScreen
- ProSubscriptionScreen  
- SettingsScreen

**影响**: 页面无法通过导航跳转

---

#### 4. AsyncStorage Token 存储未实现
**问题**: 我的 `api.ts` 使用了 `AsyncStorage`，但：
- 项目中已有 `app/src/services/storage/StorageService.ts`
- 应该使用统一的 storage 服务

---

## 二、完整修复方案

### Phase 9-1: API 服务统一（P0 - 必须）

**步骤 1**: 删除我创建的 `app/src/services/api.ts`

**步骤 2**: 扩展现有的 API 客户端，添加缺失的接口

创建 `app/src/services/api/baziApi.ts`:
```typescript
import { apiClient } from './apiClient';
import { ChartProfile, RelationType } from '@/types';

export const baziApi = {
  // 获取命盘列表
  getCharts: async (params?: {
    search?: string;
    relationType?: RelationType[];
    sortBy?: 'recent' | 'created' | 'relation';
    limit?: number;
    offset?: number;
  }) => {
    const response = await apiClient.get('/api/v1/bazi/charts', { params });
    return response.data;
  },
  
  // 设置当前命主
  setDefault: async (chartId: string) => {
    const response = await apiClient.post(`/api/v1/bazi/charts/${chartId}/set-default`);
    return response.data;
  },
  
  // 更新档案
  updateChart: async (chartId: string, data: any) => {
    const response = await apiClient.put(`/api/v1/bazi/charts/${chartId}`, data);
    return response.data;
  },
  
  // 删除档案
  deleteChart: async (chartId: string) => {
    const response = await apiClient.delete(`/api/v1/bazi/charts/${chartId}`);
    return response.data;
  },
};
```

**步骤 3**: 重构 CasesScreen 和 MeScreen 的 API 调用

```typescript
// 旧代码（我的）
const { baziApi } = await import('@/services/api');

// 新代码（符合规范）
import { baziApi } from '@/services/api/baziApi';
```

**您的决定**: 是否同意此方案？

---

### Phase 9-2: ProSubscriptionScreen 完全重构（P0 - 必须）

**方案**: 严格按照设计文档重构

**新增功能**:
1. ✅ 添加「终身会员」选项
2. ✅ 修改顶部导航（返回按钮+标题层级）
3. ✅ 添加「当前状态卡片」
4. ✅ 优化「Pro介绍卡片」（渐变背景+理念说明）
5. ✅ 实现「权益动态切换」
6. ✅ 添加「FAQ常见问题」（可折叠）
7. ✅ 添加「恢复购买」按钮
8. ✅ 添加协议链接

**预计工作量**: 2-3 小时

**您的决定**: 是否同意完全重构？

---

### Phase 9-3: 路由注册（P0 - 必须）

**位置**: `app/src/constants/routes.ts`

**新增路由**:
```typescript
export const SCREEN_NAMES = {
  // 现有路由...
  
  // 新增二级页面
  CHAT_HISTORY: 'ChatHistory',
  PRO_SUBSCRIPTION: 'ProSubscription',
  SETTINGS: 'Settings',
  INVITE_FRIENDS: 'InviteFriends',
  FEEDBACK: 'Feedback',
  READINGS: 'Readings',
} as const;
```

**Navigator 注册**: 需要在 `RootNavigator` 中注册这些页面

**您的决定**: 是否同意此方案？

---

### Phase 9-4: 环境变量配置（P0 - 必须）

**方案**: 使用项目已有的 `app/src/config/env.ts`

**配置 `.env` 文件**:
```bash
# Core API 配置
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000

# 开发环境
EXPO_PUBLIC_ENV=development

# 日志开关
EXPO_PUBLIC_ENABLE_LOG=true
```

**生产环境 `.env.production`**:
```bash
EXPO_PUBLIC_API_BASE_URL=https://api.xiaopei.com
EXPO_PUBLIC_ENV=production
EXPO_PUBLIC_ENABLE_LOG=false
```

**您的决定**: 是否同意此配置方式？

---

### Phase 9-5: 其他优化（P1 - 推荐）

#### 1. ChatHistoryScreen API 集成
**状态**: 目前使用模拟数据  
**建议**: 集成对话 API

#### 2. 错误提示优化
**当前**: 使用 `Alert`  
**建议**: 使用 Toast（更友好）

#### 3. 档案编辑页面
**状态**: 目前只有「编辑」按钮，功能待实现  
**建议**: 创建 `EditProfileScreen`

---

## 三、实施计划

### 优先级排序

**P0（必须立即修复）**:
1. ❗ API 服务统一（避免混乱）
2. ❗ ProSubscriptionScreen 重构（符合设计文档）
3. ❗ 路由注册（页面可访问）
4. ❗ 环境变量配置（生产可用）

**P1（本周完成）**:
5. ✅ ChatHistoryScreen API 集成
6. ✅ 错误提示优化
7. ✅ 档案编辑页面

**P2（后续优化）**:
8. 🔄 Skeleton Screen
9. 🔄 动画过渡
10. 🔄 性能优化

---

## 四、需要您确认的问题

### 🔴 关键决策点

#### 决策 1: API 服务架构 ❗
**问题**: 删除我的 `api.ts`，使用现有 API 客户端？  
**选项**:
- [ ] A. 删除重复代码，使用现有架构（推荐）
- [ ] B. 保留我的代码，但需要调整

**您的选择**: ____

---

#### 决策 2: ProSubscriptionScreen 重构程度 ❗
**问题**: 完全按照设计文档重构，还是保留简化版？  
**选项**:
- [ ] A. 完全重构，100% 符合设计文档（推荐）
- [ ] B. 保留简化版，只补充必要功能
- [ ] C. 分阶段实现（先补终身会员和状态卡片）

**您的选择**: ____

---

#### 决策 3: 终身会员价格 💰
**问题**: 设计文档未指定终身会员价格  
**建议价格**:
- 方案 A: ¥1888（一次性买断）
- 方案 B: ¥2888（更高定位）
- 方案 C: 您自定义

**您的选择**: ____

---

#### 决策 4: 实施顺序 📅
**建议顺序**:
1. 先统一 API 服务（避免技术债）
2. 再重构 ProSubscriptionScreen（符合设计）
3. 最后注册路由和配置环境变量

**您是否同意**: [ ] 是 / [ ] 否（请说明您的顺序）

---

## 五、预期成果

### 修复后的状态

**技术层面**:
- ✅ API 服务统一，使用 axios
- ✅ 环境变量配置规范
- ✅ 路由完整注册
- ✅ Token 存储统一

**功能层面**:
- ✅ ProSubscriptionScreen 100% 符合设计文档
- ✅ 所有页面可正常导航
- ✅ API 调用正常工作

**代码质量**:
- ✅ 无重复代码
- ✅ 符合项目规范
- ✅ 可维护性高

---

## 六、时间估算

| 任务 | 预计时间 | 优先级 |
|------|---------|--------|
| API 服务统一 | 1-2 小时 | P0 |
| ProSubscriptionScreen 重构 | 2-3 小时 | P0 |
| 路由注册 | 0.5 小时 | P0 |
| 环境变量配置 | 0.5 小时 | P0 |
| ChatHistoryScreen API | 1 小时 | P1 |
| 错误提示优化 | 1 小时 | P1 |
| 档案编辑页面 | 2 小时 | P1 |

**总计**: P0 任务约 4-6 小时

---

## 七、风险提示

### ⚠️ 可能的风险

1. **API 服务重构风险**:
   - 影响范围: CasesScreen, MeScreen
   - 缓解措施: 逐个文件测试

2. **ProSubscriptionScreen 重构风险**:
   - 可能需要新的 UI 组件
   - 缓解措施: 复用现有组件库

3. **路由注册风险**:
   - 可能影响现有导航
   - 缓解措施: 先在开发环境测试

---

**方案创建时间**: 2024-11-18  
**等待确认**: ✋ 请您审阅并做出决策

---

## 请您确认

请回复以下内容：
1. ✅ 决策 1: 选择 A 或 B
2. ✅ 决策 2: 选择 A、B 或 C
3. ✅ 决策 3: 终身会员价格
4. ✅ 决策 4: 是否同意实施顺序

**确认后我将立即开始实施！** 🚀

