# 小佩 App - React Native

小佩妙算 AI 助手的移动端应用。

## 技术栈

- **React Native**: 0.73+
- **Expo**: Managed Workflow
- **TypeScript**: 类型安全
- **React Navigation**: 路由导航
- **Zustand**: 状态管理
- **Axios**: HTTP 请求
- **React Query**: 数据缓存和同步

## 目录结构

```
app/
├── src/
│   ├── screens/          # 页面组件
│   ├── components/       # UI 组件
│   ├── navigation/       # 路由配置
│   ├── store/            # 状态管理
│   ├── services/         # 服务层（API、Storage 等）
│   ├── types/            # TypeScript 类型
│   ├── theme/            # UI 主题（Design Tokens）
│   ├── constants/        # 常量定义
│   ├── utils/            # 工具函数
│   └── i18n/             # 国际化
├── assets/               # 静态资源
├── App.tsx               # 应用入口
└── package.json
```

## 开发规范

### ⚠️ 重要：前端安全规范

**禁止行为**:
- ❌ 引入 `core/engine` 模块
- ❌ 包含 prompt 模板
- ❌ 进行计费判断（业务逻辑）
- ❌ 包含算法计算逻辑

**允许行为**:
- ✅ UI 渲染和用户交互
- ✅ 状态管理（UI 状态）
- ✅ API 调用（通过 `apiClient`）
- ✅ 数据展示和格式化

详细规范请参考：`app.doc/security/前端开发安全规范.md`

### API 调用规范

所有 API 请求统一使用：
- 路径前缀：`/api/v1/`
- 路径参数：`chartId`（而不是 `id`）
- 响应格式：`{ success: boolean, data?: T, error?: {...} }`

详细规范请参考：`app.doc/API接口统一规范.md`

### UI 设计规范

严格遵循 `app.doc/UI_SPEC.md` 中的设计规范：
- 使用 Design Tokens（`colors`, `typography`, `spacing`, `radius`, `shadows`）
- 禁止硬编码颜色、字号、间距等
- 统一使用官方 Logo 和头像

## 开发命令

```bash
# 安装依赖
npm install

# 启动开发服务器
npm start

# Android 开发
npm run android

# iOS 开发
npm run ios

# Web 开发
npm run web

# 类型检查
npm run type-check

# Lint 检查
npm run lint
```

## 环境配置

复制 `.env.example` 为 `.env`，并填写相应配置：

```bash
cp .env.example .env
```

## 参考文档

- **开发文档**: `app.doc/APP开发文档.md`
- **UI 规范**: `app.doc/UI_SPEC.md`
- **功能设计**: `app.doc/features/` 目录
- **安全规范**: `app.doc/security/` 目录

## 注意事项

1. **所有业务逻辑都在后端 Core 服务中实现**
2. **前端只负责 UI 展示和用户交互**
3. **所有 API 调用通过统一的 `apiClient`**
4. **严格遵循安全规范，禁止引入 `core/engine`**
5. **严格遵循 UI 设计规范，使用 Design Tokens**

---

更多信息请参考项目文档。

