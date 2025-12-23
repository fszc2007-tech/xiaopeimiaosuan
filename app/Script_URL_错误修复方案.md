# Script URL 错误修复方案 🔧

## 🚨 错误信息

```
No script URL provided. Make sure the packager is running 
or you have embedded a JS bundle in your application bundle.

unsanitizedScriptURLString = (null)
```

---

## 🔍 问题原因

这个错误表示 iOS 应用无法连接到 Metro bundler（开发服务器），常见原因：

1. **应用需要重新构建**：之前的构建可能有缓存问题
2. **网络配置问题**：应用无法访问 localhost:8081
3. **Info.plist 配置**：开发模式配置不正确

---

## ✅ 解决方案

### 方案 1：完全重新构建（推荐）⭐

#### 步骤 1：停止所有进程
```bash
# 停止所有 Expo 和构建进程
killall -9 node Xcode xcodebuild 2>/dev/null || true
```

#### 步骤 2：清理缓存
```bash
cd /Users/gaoxuxu/Desktop/小佩APP/app

# 清理 Expo 缓存
npx expo start --clear

# 清理 iOS 构建缓存
rm -rf ios/build ios/DerivedData

# 清理 watchman 缓存（如果安装了）
watchman watch-del-all 2>/dev/null || true

# 清理 npm 缓存
rm -rf node_modules/.cache
```

#### 步骤 3：重新构建并运行
```bash
# 方式 A：使用 Expo（推荐）
npx expo run:ios --device

# 方式 B：使用模拟器
npx expo run:ios

# 方式 C：指定模拟器
npx expo run:ios --simulator "iPhone 15 Pro"
```

---

### 方案 2：使用开发客户端（Expo Dev Client）

如果方案 1 不行，安装 expo-dev-client：

```bash
cd /Users/gaoxuxu/Desktop/小佩APP/app

# 1. 安装 expo-dev-client
npx expo install expo-dev-client

# 2. 重新构建
npx expo run:ios

# 3. 启动开发服务器
npx expo start --dev-client
```

---

### 方案 3：使用 Expo Go（临时测试）

如果以上都不行，可以先用 Expo Go 测试：

```bash
# 1. 启动开发服务器
npx expo start

# 2. 在 iOS 模拟器上：
#    - 安装 Expo Go: https://apps.apple.com/app/expo-go/id982107779
#    - 扫描二维码或按 'i' 打开

# 3. 在真机上：
#    - 下载 Expo Go App
#    - 扫描终端显示的二维码
```

⚠️ **注意**：Expo Go 可能不支持某些原生模块（如 @react-native-picker/picker）

---

## 🔧 当前正在执行的操作

### 已完成 ✅
1. 清理了端口 8081 上的冲突进程
2. 重启了 Metro bundler
3. 清理了 iOS 构建缓存

### 进行中 ⏳
```bash
# 正在后台运行 iOS 构建
xcodebuild -workspace app.xcworkspace -scheme app -configuration Debug
```

**预计时间**：3-5 分钟

**构建日志位置**：`/tmp/xcode-build.log`

---

## 📊 检查构建进度

### 方法 1：查看进程
```bash
ps aux | grep xcodebuild
```

### 方法 2：查看日志
```bash
tail -f /tmp/xcode-build.log
```

### 方法 3：监控构建完成
```bash
# 查找构建产物
find ~/Library/Developer/Xcode/DerivedData -name "*.app" -type d -mmin -10
```

---

## 🎯 构建完成后的操作

构建完成后，应用会自动在模拟器上启动。您应该看到：

1. ✅ 模拟器自动打开
2. ✅ 应用安装并启动
3. ✅ 连接到 Metro bundler（localhost:8081）
4. ✅ 显示最新的优化界面

---

## 🐛 如果构建失败

### 检查错误日志
```bash
# 查看完整日志
cat /tmp/xcode-build.log

# 只看错误
grep -i "error" /tmp/xcode-build.log
```

### 常见错误及解决方案

#### 错误 1：CocoaPods 问题
```bash
cd /Users/gaoxuxu/Desktop/小佩APP/app/ios
pod deintegrate
pod install
```

#### 错误 2：证书问题
```
# 在 Xcode 中打开项目
open ios/app.xcworkspace

# 修改 Signing & Capabilities:
# - Team: 选择您的团队或选择 "None"
# - Bundle Identifier: 确保唯一
```

#### 错误 3：Detox 相关错误
```swift
// 注释掉 AppDelegate.swift 中的 Detox 代码
// #if DEBUG
// import Detox
// #endif

// #if DEBUG
// DetoxManager.shared().start()
// #endif
```

---

## 📱 替代方案：手动在 Xcode 中构建

### 步骤 1：打开项目
```bash
cd /Users/gaoxuxu/Desktop/小佩APP/app
open ios/app.xcworkspace
```

### 步骤 2：选择设备
- 顶部工具栏选择：**app > iPhone 15 Pro（或其他模拟器）**

### 步骤 3：构建并运行
- 按 **⌘ + R** 或点击 ▶️ 按钮

### 步骤 4：确保 Metro bundler 运行
```bash
# 在另一个终端窗口
cd /Users/gaoxuxu/Desktop/小佩APP/app
npx expo start
```

---

## 🎉 成功标志

构建和运行成功后，您应该看到：

### 终端输出
```
✔ Built successfully
› Opening app://com.xiaopei.app on iPhone 15 Pro
```

### 模拟器
- 应用图标出现在主屏幕
- 应用自动启动
- 显示登录界面或主界面

### Metro bundler
```
› Bundling complete 1234ms
› Running application "main" on "iPhone 15 Pro"
```

---

## ⏱️ 预计等待时间

| 步骤 | 预计时间 |
|------|----------|
| 清理缓存 | 10-30 秒 |
| 安装依赖 | 1-2 分钟 |
| 编译 Native 代码 | 2-4 分钟 |
| 打包 JS Bundle | 30 秒 - 1 分钟 |
| **总计** | **4-8 分钟** |

---

## 🔔 通知

我已经在后台启动了构建进程。您可以：

1. **等待构建完成**（推荐）
   - 构建大约需要 3-5 分钟
   - 完成后应用会自动在模拟器上启动

2. **在 Xcode 中手动构建**
   - 打开 `ios/app.xcworkspace`
   - 按 ⌘ + R 构建并运行

3. **使用 Expo Go 临时测试**
   - `npx expo start`
   - 在 Expo Go 中扫描二维码

---

**当前状态**：🔄 正在后台构建 iOS 应用...

**完成时间**：预计 2025-11-19 21:35 左右

---

## 📝 构建完成后请告诉我

构建完成后（无论成功或失败），请：
1. 告诉我结果
2. 如果有错误，发送错误信息
3. 如果成功，确认是否能看到最新的 UI 优化

🙏 **感谢您的耐心等待！**

