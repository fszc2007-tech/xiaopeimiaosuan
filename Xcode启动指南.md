# 使用 Xcode 启动 iOS 模拟器指南

## 🚀 方式 1: 自动启动（推荐）

### Step 1: 预构建并启动

```bash
cd /Users/gaoxuxu/Desktop/小佩APP/app
npx expo run:ios
```

**这会自动完成**：
- ✅ 预构建原生 iOS 代码（首次需要几分钟）
- ✅ 打开 iOS 模拟器
- ✅ 安装并运行 App
- ✅ 启动 Metro bundler

**首次运行可能需要 5-10 分钟**（下载依赖和编译）

---

### Step 2: 等待启动完成

终端会显示：
```
› Building iOS app
› Installing app on simulator
› Opening iOS simulator
```

模拟器会自动打开，App 会自动安装并启动。

---

## 🔧 方式 2: 手动在 Xcode 中打开

### Step 1: 预构建原生代码

```bash
cd /Users/gaoxuxu/Desktop/小佩APP/app
npx expo prebuild
```

**这会创建**：
- `ios/` 目录（原生 iOS 项目）
- `android/` 目录（原生 Android 项目）

---

### Step 2: 在 Xcode 中打开

```bash
# 打开 Xcode 项目
open ios/*.xcworkspace
```

**注意**：必须打开 `.xcworkspace`，不是 `.xcodeproj`！

---

### Step 3: 在 Xcode 中运行

1. **选择模拟器**：在 Xcode 顶部选择 iOS 模拟器（例如：iPhone 15 Pro）
2. **点击运行按钮**：▶️ 或按 `Cmd + R`
3. **等待编译完成**：首次编译可能需要几分钟

---

## ⚙️ 配置说明

### 环境变量

确保 `.env` 文件存在：

```bash
cd /Users/gaoxuxu/Desktop/小佩APP/app
cat .env
```

应该包含：
```
EXPO_PUBLIC_API_BASE_URL=http://10.89.148.75:3000
```

---

### 后端服务

确保后端正在运行：

```bash
# 检查后端
curl http://localhost:3000/health
```

应该返回：
```json
{"status":"ok"}
```

---

## 🐛 常见问题

### 问题 1: 预构建失败

**错误信息**：
```
Error: CocoaPods not installed
```

**解决方案**：
```bash
# 安装 CocoaPods
sudo gem install cocoapods

# 进入 ios 目录安装依赖
cd ios
pod install
cd ..
```

---

### 问题 2: Xcode 版本不兼容

**检查 Xcode 版本**：
```bash
xcodebuild -version
```

**要求**：Xcode 14.0 或更高版本

---

### 问题 3: 模拟器无法启动

**解决方案**：
```bash
# 列出可用模拟器
xcrun simctl list devices

# 启动特定模拟器
xcrun simctl boot "iPhone 15 Pro"
```

---

### 问题 4: 编译错误

**清理并重新构建**：
```bash
cd /Users/gaoxuxu/Desktop/小佩APP/app

# 清理构建缓存
rm -rf ios/build
rm -rf ios/Pods
rm -rf ios/Podfile.lock

# 重新预构建
npx expo prebuild --clean

# 重新安装 Pods
cd ios
pod install
cd ..
```

---

### 问题 5: API 连接失败

**原因**：模拟器无法访问 `localhost`

**解决方案**：

#### 方法 A: 使用电脑的 IP 地址（已配置）

`.env` 文件已配置为：
```
EXPO_PUBLIC_API_BASE_URL=http://10.89.148.75:3000
```

#### 方法 B: 使用特殊地址（macOS）

iOS 模拟器可以使用 `localhost`，但需要确保后端允许：

```bash
# 检查后端 CORS 配置
# 应该允许 localhost:19006
```

---

## 📋 开发工作流

### 日常开发

```bash
# 1. 启动后端（如果还没启动）
cd /Users/gaoxuxu/Desktop/小佩APP/core
npm run dev

# 2. 启动 App（新终端）
cd /Users/gaoxuxu/Desktop/小佩APP/app
npx expo run:ios
```

### 修改代码后

- **自动重载**：保存文件后，App 会自动刷新
- **手动重载**：在模拟器中按 `Cmd + R`
- **重新构建**：如果修改了原生代码，需要重新运行 `npx expo run:ios`

---

## 🎯 推荐流程

### 第一次运行

```bash
cd /Users/gaoxuxu/Desktop/小佩APP/app
npx expo run:ios
```

**等待**：
- 预构建完成（5-10 分钟）
- 模拟器启动
- App 安装并运行

---

### 后续运行

如果已经预构建过：

```bash
# 方式 1: 直接运行（推荐）
npx expo run:ios

# 方式 2: 在 Xcode 中打开
open ios/*.xcworkspace
# 然后在 Xcode 中点击运行
```

---

## 🔍 调试技巧

### 查看日志

在 Xcode 中：
1. 打开 Xcode
2. 运行 App
3. 查看底部控制台输出

### React Native 调试

在模拟器中：
1. 按 `Cmd + D` 打开开发菜单
2. 选择 "Debug" → 打开 Chrome DevTools
3. 查看 Console 日志

### 网络请求调试

在 Xcode 控制台查看网络请求日志，或使用：
- React Native Debugger
- Flipper

---

## ✅ 检查清单

启动前确认：
- [ ] 后端正在运行（`curl http://localhost:3000/health`）
- [ ] `.env` 文件已配置
- [ ] Xcode 已安装并配置
- [ ] CocoaPods 已安装（如果需要）

---

**现在可以运行 `npx expo run:ios` 了！** 🚀

