# Expo + Detox 集成配置修复

## 🔍 发现的问题

### 1. 缺少 Detox 启动参数
- Detox 配置中缺少 `launchArgs`
- 应用无法正确连接到 Detox 服务器

### 2. 应用入口点未配置 Detox
- `index.ts` 和 `App.tsx` 中没有 Detox 相关代码
- Expo 应用需要特殊配置才能与 Detox 工作

### 3. Metro 配置未检查
- 需要确保 Metro 配置正确

## ✅ 已修复的配置

### 1. 更新 Detox 配置
在 `detox.config.js` 和 `.detoxrc.js` 中添加了 `launchArgs`：

```javascript
launchArgs: {
  detoxServer: 'ws://localhost:0',
  detoxSessionId: 'test',
}
```

### 2. 更新测试初始化
在 `e2e/init.js` 中添加了 Detox 适配器配置。

## ⚠️ Expo + Detox 集成的重要说明

### Expo 项目的特殊要求

1. **需要使用裸工作流（Bare Workflow）**
   - Expo 托管工作流不支持 Detox
   - 需要运行 `npx expo run:ios` 生成原生代码

2. **应用需要正确初始化**
   - Expo 应用使用 `registerRootComponent` 注册
   - Detox 需要能够连接到应用

3. **Metro Bundler 必须运行**
   - 测试时 Metro 必须运行
   - 应用通过 Metro 加载 JavaScript 代码

## 🔧 还需要检查的配置

### 1. 检查 Metro 配置
确保 `metro.config.js` 配置正确。

### 2. 检查应用入口
确保应用正确初始化，没有阻塞操作。

### 3. 检查网络配置
确保应用可以连接到 Detox 服务器。

## 📝 下一步

1. ✅ 已添加 `launchArgs` 配置
2. ⏳ 需要测试配置是否生效
3. ⏳ 如果仍有问题，可能需要调整应用入口点

---

**修复时间**: 2025-11-19  
**状态**: ✅ 配置已更新，待测试

