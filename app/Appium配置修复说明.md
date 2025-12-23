# Appium 配置修复说明

## ✅ 已修复的问题

### 平台版本错误
- ❌ 之前配置：`platformVersion: '17.0'`
- ✅ 已修复为：`platformVersion: '26.1'`

### 错误信息
```
'17.0' does not exist in the list of simctl SDKs. 
Only the following Simulator SDK versions are available on your system: 26.1, 26.0
```

## 🔧 当前配置

### wdio.conf.js
```javascript
capabilities: [{
  platformName: 'iOS',
  'appium:platformVersion': '26.1',  // ✅ 已修复
  'appium:deviceName': 'iPhone 17 Pro',
  'appium:app': '/path/to/app.app',
  'appium:automationName': 'XCUITest',
  'appium:bundleId': 'com.xiaopei.app',
}]
```

## 🚀 运行测试

### 确保 Appium Server 运行
```bash
# 检查 Appium Server 状态
curl http://localhost:4723/status

# 如果未运行，启动它
npm run appium:server
```

### 运行测试
```bash
npm run test:appium:ios
```

## 📝 测试文件

### auth.spec.js
- 使用 testID 定位元素
- 测试登录流程

### navigation.spec.js
- 测试底部导航
- 测试页面跳转

## ⚠️ 注意事项

1. **平台版本必须匹配**
   - 使用 `xcrun simctl list devices` 查看可用版本
   - 当前系统支持：26.1, 26.0

2. **应用路径**
   - 确保应用已构建
   - 路径指向正确的 .app 文件

3. **Appium Server**
   - 必须运行在端口 4723
   - 检查：`curl http://localhost:4723/status`

---

**状态**: ✅ 配置已修复，测试运行中

