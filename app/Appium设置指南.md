# Appium E2E 测试设置指南

## ✅ 已完成的配置

### 1. 安装依赖
- ✅ Appium
- ✅ WebdriverIO
- ✅ Mocha 测试框架
- ✅ Appium 服务

### 2. 创建配置文件
- ✅ `wdio.conf.js` - WebdriverIO 配置
- ✅ `e2e-appium/auth.spec.js` - 认证测试
- ✅ `e2e-appium/navigation.spec.js` - 导航测试

### 3. 更新 package.json
- ✅ 添加了 Appium 测试脚本

## 🚀 快速开始

### 1. 安装 Appium Server（全局）

```bash
npm install -g appium
```

### 2. 安装 iOS 驱动

```bash
appium driver install xcuitest
```

### 3. 启动 Appium Server

```bash
# 在一个终端窗口
npm run appium:server

# 或者
appium
```

### 4. 运行测试

```bash
# 在另一个终端窗口
npm run test:appium:ios
```

## 📝 测试文件说明

### auth.spec.js - 认证流程测试
- 登录页面显示
- 输入手机号
- 请求验证码
- 完成登录

### navigation.spec.js - 导航测试
- 底部导航切换
- 页面跳转验证

## 🔧 配置说明

### wdio.conf.js 配置要点

1. **应用路径**
   ```javascript
   'appium:app': '/path/to/app.app'
   ```

2. **设备配置**
   ```javascript
   'appium:deviceName': 'iPhone 17 Pro',
   'appium:platformVersion': '17.0',
   ```

3. **Bundle ID**
   ```javascript
   'appium:bundleId': 'com.xiaopei.app',
   ```

## ⚠️ 注意事项

### 1. Appium Server 必须运行
- 测试前需要启动 Appium Server
- 默认端口：4723

### 2. 应用路径
- 需要更新 `wdio.conf.js` 中的应用路径
- 使用实际构建的应用路径

### 3. 设备配置
- 确保设备名称和版本正确
- 可以使用 `xcrun simctl list devices` 查看可用设备

## 📚 更多资源

- [Appium 官方文档](http://appium.io/docs/en/about-appium/intro/)
- [WebdriverIO 文档](https://webdriver.io/)
- [Appium iOS 测试指南](http://appium.io/docs/en/drivers/ios-xcuitest/)

## ✅ 优势

1. **成熟稳定** - 广泛使用的测试框架
2. **跨平台** - 支持 iOS 和 Android
3. **功能强大** - 支持复杂的测试场景
4. **社区支持** - 活跃的社区和文档

---

**状态**: ✅ Appium 已配置完成  
**下一步**: 安装 Appium Server 和驱动，然后运行测试

