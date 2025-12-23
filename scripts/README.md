# 小佩项目自动化检测与修复脚本

## 简介

`check-and-fix.js` 是一个自动化工具，用于检测和修复小佩项目中的常见问题，包括：

- ✅ 检查 Node.js 和 npm 版本
- ✅ 检查所有子项目的依赖（app, admin, core）
- ✅ 检查配置文件（tsconfig.json, babel.config.js, metro.config.js, vite.config.ts）
- ✅ 检查环境变量文件（.env）
- ✅ 检查路径别名配置
- ✅ 检查端口配置
- ✅ 检查版本兼容性
- ✅ 自动安装缺失的依赖
- ✅ 自动创建缺失的 .env 文件
- ✅ 清理缓存

## 使用方法

### 基本检查

```bash
npm run check
```

或直接运行：

```bash
node scripts/check-and-fix.js
```

### 自动修复

自动修复可修复的问题（如安装缺失的依赖、创建 .env 文件等）：

```bash
npm run check:fix
```

或：

```bash
node scripts/check-and-fix.js --fix
```

### 清理缓存

清理所有项目的缓存：

```bash
npm run check:clean
```

或：

```bash
node scripts/check-and-fix.js --clean
```

### 查看帮助

```bash
node scripts/check-and-fix.js --help
```

## 检查项说明

### 1. 环境检查
- Node.js 版本（需要 18+）
- npm 版本

### 2. 依赖检查
- 检查 `package.json` 是否存在
- 检查 `node_modules` 是否存在
- 检查 `package-lock.json` 是否存在
- 自动安装缺失的依赖

### 3. 配置文件检查
- **App**: `tsconfig.json`, `babel.config.js`, `metro.config.js`
- **Admin**: `tsconfig.json`, `vite.config.ts`
- **Core**: `tsconfig.json`

### 4. 环境变量检查
- 检查 `.env` 文件是否存在
- 检查必需的环境变量是否配置
- 自动从 `.env.example` 创建 `.env` 文件

**Core 必需环境变量**：
- `XIAOPEI_CORE_PORT`
- `XIAOPEI_MYSQL_HOST`
- `XIAOPEI_MYSQL_PORT`
- `XIAOPEI_MYSQL_USER`
- `XIAOPEI_MYSQL_PASSWORD`
- `XIAOPEI_MYSQL_DATABASE`
- `XIAOPEI_JWT_SECRET`
- `XIAOPEI_ENCRYPTION_KEY`

**App 必需环境变量**：
- `EXPO_PUBLIC_API_BASE_URL`

### 5. 路径别名检查
- 检查 `tsconfig.json` 中的 `@/*` 路径别名配置
- 检查 `baseUrl` 配置

### 6. 端口配置检查
- **Core**: 检查是否使用环境变量 `XIAOPEI_CORE_PORT`（默认 3000）
- **Admin**: 检查 Vite 配置中的端口（5173）

### 7. 版本兼容性检查
- 检查所有项目的 TypeScript 版本是否一致

## 自动修复功能

脚本可以自动修复以下问题：

1. **安装缺失的依赖**
   - 如果 `node_modules` 不存在，自动运行 `npm install`

2. **创建 .env 文件**
   - 如果 `.env` 不存在但 `.env.example` 存在，自动复制

3. **生成 package-lock.json**
   - 如果 `package-lock.json` 不存在，自动生成

## 清理缓存

清理以下缓存：

- **App**: `.expo` 目录
- **Admin**: `node_modules/.vite` 目录
- **所有项目**: `node_modules/.cache` 目录

## 输出说明

- ✅ **绿色**: 检查通过
- ✗ **红色**: 发现问题
- ⚠️ **黄色**: 警告信息
- ℹ️ **蓝色**: 信息提示
- 📋 **青色**: 章节标题

## 示例输出

```
============================================================
小佩项目自动化检测与修复
============================================================
运行时间: 2024-11-18 14:30:00

============================================================
1. 环境检查
============================================================
  ✓ Node.js 版本: v20.10.0 ✓
  ✓ npm 版本: 10.2.3 ✓

============================================================
2. 依赖检查
============================================================
  ✓ App (React Native): node_modules 存在 ✓
  ✓ Admin (Vite + React): node_modules 存在 ✓
  ✓ Core (Node.js + Express): node_modules 存在 ✓

...

============================================================
检查完成
============================================================
✓ 所有检查通过！
```

## 注意事项

1. **首次运行**：建议先运行 `npm run check` 查看问题，然后使用 `npm run check:fix` 自动修复

2. **环境变量**：自动创建的 `.env` 文件需要手动填写实际的配置值

3. **依赖安装**：自动安装依赖可能需要一些时间，请耐心等待

4. **权限问题**：如果遇到权限问题，可能需要使用 `sudo`（不推荐）或检查文件权限

## 故障排除

### 问题：脚本无法运行

**解决方案**：
```bash
chmod +x scripts/check-and-fix.js
```

### 问题：依赖安装失败

**解决方案**：
1. 检查网络连接
2. 清理 npm 缓存：`npm cache clean --force`
3. 删除 `node_modules` 和 `package-lock.json` 后重新安装

### 问题：环境变量检查失败

**解决方案**：
1. 确保 `.env.example` 文件存在
2. 手动创建 `.env` 文件并填写配置
3. 检查环境变量名称是否正确

## 贡献

如果发现问题或需要添加新的检查项，请修改 `scripts/check-and-fix.js` 文件。

