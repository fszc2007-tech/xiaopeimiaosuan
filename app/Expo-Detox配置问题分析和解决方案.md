# Expo + Detox 配置问题分析和解决方案

## 🔍 问题分析

### 主要问题：WebSocket 连接失败

从错误日志可以看到：
```
Web socket failed to connect with error: There was a bad response from the server.
Task finished with error [-1011] Error Domain=NSURLErrorDomain Code=-1011
```

### 根本原因

1. **Expo 应用的特殊性**
   - Expo 使用 `expo run:ios` 构建后，应用已经包含了原生代码
   - 但是应用可能没有正确配置 Detox 的原生桥接

2. **Detox 服务器连接问题**
   - 应用尝试连接到 `localhost:54743`（Detox 服务器）
   - 但收到 502 Bad Gateway 错误
   - 说明 Detox 服务器可能没有正确启动，或者应用无法连接到它

3. **Metro Bundler 配置**
   - Metro 正在运行（已确认）
   - 但应用可能无法通过 Metro 加载 JavaScript 代码

## ✅ 已修复的配置

### 1. Detox 配置
- ✅ 移除了错误的 `launchArgs`（Detox 会自动设置）
- ✅ 配置了正确的应用路径
- ✅ 配置了正确的设备类型

### 2. Jest 配置
- ✅ 配置了正确的测试文件匹配模式
- ✅ 配置了 Detox 测试环境

### 3. 测试初始化
- ✅ 设置了正确的超时时间

## ⚠️ Expo + Detox 集成的关键问题

### 1. Expo 开发客户端 vs 原生构建

**问题**：Expo 应用有两种运行方式：
- **Expo Go**：不支持 Detox（无法访问原生代码）
- **开发构建（Development Build）**：支持 Detox，但需要特殊配置

**解决方案**：使用 `expo run:ios` 构建原生应用（已完成）

### 2. Detox 原生桥接

**问题**：Detox 需要在原生代码中注册桥接模块

**检查**：需要确认 `expo run:ios` 构建的应用是否包含了 Detox 的原生支持

### 3. Metro Bundler 配置

**问题**：Metro 需要正确配置才能与 Detox 工作

**检查**：`metro.config.js` 配置看起来正确

## 🔧 建议的解决方案

### 方案 1: 检查原生代码配置

检查 `ios/app/AppDelegate.mm` 或 `ios/app/AppDelegate.swift` 是否包含了 Detox 的初始化代码。

### 方案 2: 使用 Expo 开发构建

如果使用 Expo 开发构建，可能需要：
1. 安装 `expo-dev-client`
2. 配置开发构建
3. 确保 Detox 可以连接到开发构建

### 方案 3: 检查应用启动参数

确保应用在测试模式下启动时，Detox 可以正确注入启动参数。

## 📝 下一步操作

1. ✅ 已修复 Detox 配置
2. ⏳ 需要检查原生代码是否包含 Detox 支持
3. ⏳ 需要重新运行测试验证配置
4. ⏳ 如果仍有问题，可能需要检查 Expo 开发构建配置

## 🔍 调试建议

### 1. 检查应用日志
```bash
xcrun simctl spawn <device-id> log stream --level debug --style compact --predicate 'process == "app"'
```

### 2. 检查 Detox 服务器
确保 Detox 服务器正确启动，端口未被占用。

### 3. 简化测试
先运行最简单的测试，确保基本连接正常。

---

**修复时间**: 2025-11-19  
**状态**: ✅ 配置已修复，需要进一步测试和调试

