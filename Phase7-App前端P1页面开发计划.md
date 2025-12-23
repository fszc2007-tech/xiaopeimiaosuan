# Phase 7 开发计划：App 前端 P1 页面

**规划时间**: 2024-11-18  
**开发范围**: 小佩主页、命盘列表、我的页面（P1 次要页面）

---

## ✅ 前置工作完成情况（Phase 1-6）

### Phase 1: 数据库与 API（✅ 已完成）

#### 1.1 数据库表
- ✅ 创建 `chart_profiles` 表（`004_chart_profiles.sql`）
  - 档案管理信息（关系、备注、当前命主等）
  - 一对一关联 `bazi_charts` 表

#### 1.2 服务层
- ✅ 创建 `chartProfileService.ts`
  - 命主档案的增删改查
  - 当前命主切换
  - 档案列表查询与筛选

#### 1.3 API 更新
- ✅ 更新 `POST /api/v1/bazi/chart` - 同时创建档案
- ✅ 更新 `GET /api/v1/bazi/charts` - 返回档案列表
- ✅ 更新 `GET /api/v1/auth/me` - 返回当前命主
- ✅ 更新 `PUT /api/v1/bazi/charts/:chartId` - 更新档案
- ✅ 更新 `DELETE /api/v1/bazi/charts/:chartId` - 删除档案
- ✅ 更新 `POST /api/v1/bazi/charts/:chartId/set-default` - 设置当前命主

---

### Phase 2: 底部导航修复（✅ 已完成）

- ✅ 在 `MainTabNavigator.tsx` 添加"排盤"Tab
- ✅ 配置点击跳转到手动排盘页
- ✅ 底部导航现在包含 4 个 Tab：
  - 排盤（跳转）
  - 檔案
  - 小佩
  - 我的

---

## 📋 Phase 3: Screen 开发（待进行）

### 开发策略

| Screen | 现状 | 策略 | 工作量 |
|--------|------|------|--------|
| CasesScreen | 15行占位符 | **完全重写** | 大 |
| MeScreen | 13行占位符 | **完全重写** | 中 |
| XiaoPeiHomeScreen | 232行部分实现 | **扩展完善** | 中 |

---

### 3.1 CasesScreen（命盘列表）

**参考文档**: `app.doc/features/檔案－命盤列表設計文檔.md`

**核心功能**:
- 命主档案列表展示
- 当前命主管理
- 搜索与筛选
- 新增/编辑/删除档案
- 跳转到命盘详情页

**所需 API**:
- ✅ `GET /api/v1/bazi/charts` - 获取档案列表
- ✅ `POST /api/v1/bazi/charts/:chartId/set-default` - 设置当前命主
- ✅ `PUT /api/v1/bazi/charts/:chartId` - 更新档案
- ✅ `DELETE /api/v1/bazi/charts/:chartId` - 删除档案

**组件拆分**:
```
CasesScreen/
├── CasesScreen.tsx (主组件)
├── components/
│   ├── CasesHeader.tsx (顶部栏)
│   ├── CurrentProfileHint.tsx (当前命主提示)
│   ├── SearchAndFilter.tsx (搜索筛选)
│   ├── ProfileCard.tsx (命盘卡片)
│   ├── ProfileList.tsx (列表)
│   ├── EmptyState.tsx (空状态)
│   ├── FilterBottomSheet.tsx (筛选弹窗)
│   └── ProfileMenuBottomSheet.tsx (操作菜单)
├── hooks/
│   ├── useProfiles.ts (档案列表管理)
│   └── useSearchAndFilter.ts (搜索筛选逻辑)
└── types.ts
```

---

### 3.2 MeScreen（我的页面）

**参考文档**: `app.doc/features/我的-一级设计文档.md`

**核心功能**:
- 个人信息卡片
- 我的命理（命盘/解读/聊天记录）
- 小佩服务（Pro/时运提醒/学堂）
- 工具与帮助（邀请/反馈/设置）

**所需 API**:
- ✅ `GET /api/v1/auth/me` - 获取用户信息

**组件拆分**:
```
Me/
├── MeScreen.tsx (主组件)
├── components/
│   ├── UserProfileCard.tsx (个人卡片)
│   ├── Section.tsx (分组组件)
│   └── Cell.tsx (单元格)
└── types.ts
```

---

### 3.3 XiaoPeiHomeScreen（小佩主页）

**参考文档**: `app.doc/features/小佩主页设计文档.md`

**现状分析**:
- ✅ 已有基本结构和样式
- ❌ 话题配置与设计文档不匹配
- ❌ 缺少命主卡片详细信息
- ❌ 导航逻辑未完成

**需要调整**:
1. 话题枚举改为设计文档的 6 个：
   - peach（桃花·恋爱）
   - marriage（婚姻·关系）
   - career（事业）
   - wealth（财富）
   - family（家庭）
   - rhythm（节奏·运势）
   
2. 完善命主卡片（头像、关系、出生信息）
3. 实现自由输入框
4. 完成导航跳转逻辑

**所需 API**:
- ✅ `GET /api/v1/auth/me` - 获取当前命主

---

## 🚀 开发顺序建议

### 方案 A：由易到难
```
1. MeScreen（最简单）
2. XiaoPeiHomeScreen（扩展完善）
3. CasesScreen（最复杂）
```

### 方案 B：由难到易
```
1. CasesScreen（最复杂，完成后其他更容易）
2. XiaoPeiHomeScreen（扩展完善）
3. MeScreen（最简单）
```

### 方案 C：按用户流程
```
1. XiaoPeiHomeScreen（用户入口）
2. CasesScreen（命盘管理）
3. MeScreen（个人中心）
```

**建议**: 采用 **方案 C**（按用户流程）
- 用户首先看到小佩主页
- 然后管理命盘
- 最后进入个人中心

---

## 📝 开发规范reminder

### 1. 严格遵循设计文档
- 每个页面都有详细的设计文档
- UI 样式遵循 `UI_SPEC.md`
- 组件命名遵循 `routes.ts`

### 2. API 调用规范
- ❌ 不使用 mock 数据
- ✅ 使用已实现的 Core API
- ✅ 统一的错误处理

### 3. 数据流规范
- 使用 Zustand 管理全局状态
- 命主信息、用户信息等全局共享
- 页面级状态使用 React State

### 4. 代码质量
- TypeScript 类型完整
- 组件职责单一
- 代码复用（公共组件）

---

## 🎯 Phase 3 目标

### 核心目标
- ✅ 3 个 Screen 全部完成
- ✅ 与 Core API 完整对接
- ✅ 遵循所有设计文档
- ✅ 无 lint 错误

### 交付物
1. 3 个完整的 Screen 组件
2. 所有必需的子组件
3. Hooks 和工具函数
4. 完整的类型定义
5. 开发完成报告

---

## 📊 总体进度

```
Phase 1: 数据库与API         ████████████ 100%
Phase 2: 底部导航修复         ████████████ 100%
Phase 3: Screen开发          ░░░░░░░░░░░░   0%
  ├─ XiaoPeiHomeScreen      ░░░░░░░░░░░░   0%
  ├─ CasesScreen            ░░░░░░░░░░░░   0%
  └─ MeScreen               ░░░░░░░░░░░░   0%

总体进度                      ████░░░░░░░░  33%
```

---

## ⏭️ 下一步行动

**立即开始 Phase 3 开发**：
1. 先开发 XiaoPeiHomeScreen（扩展完善）
2. 再开发 CasesScreen（完全新建）
3. 最后开发 MeScreen（完全新建）

**预计总耗时**: 4-6 小时

---

**计划创建时间**: 2024-11-18  
**当前状态**: Phase 1-2 完成，Phase 3 待开始  
**准备就绪**: ✅ 可以立即开始开发

