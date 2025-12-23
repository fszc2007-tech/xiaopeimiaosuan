# Expo + Detox 原生支持修复说明

## ✅ 已完成的修复

### 1. 添加 Detox Pod 依赖
在 `ios/Podfile` 中添加了：
```ruby
pod 'Detox', :path => '../node_modules/detox/ios'
```

### 2. 添加 Detox 导入
在 `ios/app/AppDelegate.swift` 中添加了：
```swift
#if DEBUG
import Detox
#endif
```

### 3. 初始化 Detox
在 `application:didFinishLaunchingWithOptions` 中添加了：
```swift
#if DEBUG
// Initialize Detox for E2E testing
DetoxManager.shared().start()
#endif
```

## 🔧 下一步操作

### 1. 重新安装 Pods
```bash
cd ios
pod install
cd ..
```

### 2. 重新构建应用
```bash
npx expo run:ios
```

### 3. 重新运行测试
```bash
npm run test:e2e:ios
```

## ⚠️ 重要提示

1. **必须重新安装 Pods**
   - 添加了新的 pod 依赖
   - 需要运行 `pod install`

2. **必须重新构建应用**
   - 修改了原生代码
   - 需要重新构建才能生效

3. **仅在 DEBUG 模式下启用**
   - Detox 只在 DEBUG 模式下初始化
   - 不会影响生产构建

## 📝 修复说明

### 问题原因
Expo 构建的应用默认不包含 Detox 的原生桥接模块，需要手动添加：
1. Pod 依赖
2. 导入语句
3. 初始化代码

### 解决方案
按照 Detox 官方文档，添加了必要的原生代码支持。

---

**修复时间**: 2025-11-19  
**状态**: ✅ 原生代码已修复，需要重新构建

