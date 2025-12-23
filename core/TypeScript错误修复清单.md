# TypeScript 错误修复清单

**总错误数**: 48个  
**修复时间**: 2024-11-18

---

## 错误分类

### 1. 导入错误（已修复 ✅）
- ✅ `../database` → `../database/connection`
- ✅ 安装 `bcrypt`

### 2. database/connection 默认导出问题（需修复）
**错误**: `Module has no default export`  
**文件**: 
- `src/middleware/requirePro.ts`
- `src/modules/admin/adminAuthService.ts`
- `src/modules/admin/adminUserService.ts`
- `src/modules/admin/llmConfigService.ts`
- `src/modules/pro/proService.ts`

**修复**: 改为 `import { getPool } from ...`

### 3. Request 类型缺少自定义属性（需修复）
**错误**: `Property 'user' | 'adminId' does not exist on type 'Request'`

**修复**: 创建类型扩展文件

### 4. API 文档 tags 字段（需修复）
**错误**: `'tags' does not exist in type 'ApiDoc'`

**修复**: 更新 `ApiDoc` 类型定义或删除 tags 字段

### 5. 其他缺失导出（需修复）
- `generateInviteCode` from `authService`
- `decrypt` from `encryption`
- `adminAuthMiddleware` from `adminAuth`

---

## 修复策略

**优先级 P0**（阻止启动）:
1. 修复 database 导入
2. 修复 Request 类型
3. 修复缺失的导出

**优先级 P1**（类型检查）:
1. API 文档 tags
2. 隐式 any 类型

