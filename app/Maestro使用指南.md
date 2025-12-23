# Maestro E2E 测试使用指南

## ✅ Maestro 已安装成功！

### 安装状态
- ✅ Maestro 已安装到 `~/.maestro/bin`
- ✅ 已添加到 PATH（需要重新打开终端或运行 `export PATH="$PATH:$HOME/.maestro/bin"`）

## 🚀 快速开始

### 1. 设置 PATH（如果未自动设置）

```bash
export PATH="$PATH:$HOME/.maestro/bin"
```

或者添加到 `~/.zshrc` 或 `~/.bash_profile`：
```bash
echo 'export PATH="$PATH:$HOME/.maestro/bin"' >> ~/.zshrc
source ~/.zshrc
```

### 2. 验证安装

```bash
maestro --version
```

### 3. 运行测试

```bash
cd /Users/gaoxuxu/Desktop/小佩APP/app

# 运行所有测试
npm run test:maestro

# 在 iOS 上运行
npm run test:maestro:ios

# 在 Android 上运行（需要 Java）
npm run test:maestro:android
```

## 📝 测试文件

### 已创建的测试文件

1. **maestro/auth.yaml** - 认证流程测试
   - 登录页面显示
   - 输入手机号
   - 请求验证码
   - 完成登录

2. **maestro/navigation.yaml** - 导航测试
   - 底部导航切换
   - 页面跳转验证

## 🎯 Maestro 的优势

### 与 Expo 完美兼容
- ✅ **不需要修改原生代码** - 不需要修改 Podfile 或 AppDelegate
- ✅ **不需要添加 testID** - 可以通过文本、ID、坐标定位元素
- ✅ **支持 Expo Go** - 可以直接在 Expo Go 中测试
- ✅ **配置简单** - YAML 格式，易于编写和维护

### 功能强大
- ✅ 支持复杂的测试场景
- ✅ 支持截图和视频录制
- ✅ 支持并行测试
- ✅ 支持条件逻辑和循环

## 📚 测试示例

### 基础测试

```yaml
appId: com.xiaopei.app
---
- launchApp
- assertVisible: "登录"
- tapOn: "登录"
```

### 输入文本

```yaml
- inputText: "13800138000", into: "手机号"
- tapOn: "发送验证码"
```

### 断言

```yaml
- assertVisible: "首页"
- assertNotVisible: "登录"
```

## 🔧 常用命令

### 运行测试

```bash
# 运行所有测试
maestro test maestro/

# 运行特定测试
maestro test maestro/auth.yaml

# 在特定设备上运行
maestro test maestro/ --device "iPhone 17 Pro"
```

### 录制测试

```bash
# 启动录制模式
maestro studio
```

### 查看测试结果

```bash
# 运行测试并查看详细输出
maestro test maestro/ --format junit
```

## ⚠️ 注意事项

### Java 要求
- **iOS 测试**：不需要 Java
- **Android 测试**：需要安装 Java（如果需要测试 Android）

### 设备要求
- 确保模拟器或设备已启动
- iOS 模拟器：`xcrun simctl list devices`
- Android 模拟器：`adb devices`

## 📖 更多资源

- [Maestro 官方文档](https://maestro.mobile.dev/)
- [Maestro GitHub](https://github.com/mobile-dev-inc/maestro)
- [Maestro 示例](https://maestro.mobile.dev/examples)

## ✅ 下一步

1. ✅ Maestro 已安装
2. ✅ 测试文件已创建
3. ⏳ 运行测试验证

---

**状态**: ✅ Maestro 已安装并配置完成  
**优势**: 与 Expo 完美兼容，配置简单  
**使用**: 运行 `npm run test:maestro:ios` 开始测试

