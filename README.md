# 小佩命理 AI 助手 App

## 项目结构

```
小佩APP/
├── app.doc/              # App 开发文档
│   ├── security/         # 安全策略文档
│   ├── features/         # 功能设计文档
│   ├── APP开发文档.md    # 主开发文档
│   ├── UI_SPEC.md        # UI 设计规范
│   └── ...
├── admin.doc/            # Admin 管理后台文档
├── admin/                # Admin 管理后台代码
├── core/                 # Core 后端核心服务
│   └── engine/           # 八字引擎（算法）
├── src/                  # App 前端代码
└── ...
```

## 安全策略

**核心原则**: 前端只负责 UI，所有核心逻辑（算法、prompt、计费判断）都在 Core 后端。

详细规范请参考：
- `app.doc/security/Core架构与安全策略方案.md`
- `app.doc/security/前端开发安全规范.md`
- `app.doc/security/后端开发安全规范.md`

## 开发规范

### ESLint

项目配置了 ESLint 规则，禁止在前端代码中引入 `core/engine`：

```bash
npm run lint
npm run lint:fix
```

### Git Hooks

配置了 pre-commit hook，提交前自动检查安全规范：

```bash
npm run prepare  # 安装 husky
```

## 文档

- **App 开发文档**: `app.doc/APP开发文档.md`
- **安全策略**: `app.doc/security/`
- **功能设计**: `app.doc/features/`
- **Admin 文档**: `admin.doc/`

