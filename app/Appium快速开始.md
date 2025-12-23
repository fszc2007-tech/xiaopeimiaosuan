# Appium E2E 测试快速开始

## ✅ 已完成的配置

### 1. 安装依赖
- ✅ Appium (全局安装)
- ✅ WebdriverIO
- ✅ Mocha 测试框架
- ✅ Appium WDIO 服务

### 2. 创建测试文件
- ✅ `wdio.conf.js` - WebdriverIO 配置
- ✅ `e2e-appium/auth.spec.js` - 认证测试
- ✅ `e2e-appium/navigation.spec.js` - 导航测试

### 3. 安装 iOS 驱动
- ✅ XCUITest 驱动

## 🚀 运行测试

### 步骤 1: 启动 Appium Server

在一个终端窗口运行：
```bash
cd /Users/gaoxuxu/Desktop/小佩APP/app
npm run appium:server
```

或者：
```bash
appium server --port 4723
```

### 步骤 2: 运行测试

在另一个终端窗口运行：
```bash
cd /Users/gaoxuxu/Desktop/小佩APP/app
npm run test:appium:ios
```

## 📝 测试文件

### auth.spec.js
- 登录页面显示
- 输入手机号
- 请求验证码
- 完成登录

### navigation.spec.js
- 底部导航切换
- 页面跳转验证

## 🔧 配置说明

### 应用路径
在 `wdio.conf.js` 中配置了应用路径。如果路径不同，可以：
1. 设置环境变量：`export APP_PATH=/path/to/app.app`
2. 或者直接修改 `wdio.conf.js` 中的路径

### 设备配置
```javascript
'appium:deviceName': 'iPhone 17 Pro',
'appium:platformVersion': '17.0',
```

## ⚠️ 注意事项

1. **Appium Server 必须运行**
   - 测试前需要启动 Appium Server
   - 默认端口：4723

2. **应用路径**
   - 确保应用已构建
   - 路径指向正确的 .app 文件

3. **设备配置**
   - 确保设备名称和版本正确
   - 可以使用 `xcrun simctl list devices` 查看

## 📚 更多信息

- [Appium 官方文档](http://appium.io/docs/en/about-appium/intro/)
- [WebdriverIO 文档](https://webdriver.io/)

---

**状态**: ✅ Appium 已配置完成  
**下一步**: 启动 Appium Server 并运行测试

