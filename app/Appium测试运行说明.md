# Appium iOS 测试运行说明

## ✅ 配置完成

### 已安装
- ✅ Appium Server (全局)
- ✅ XCUITest 驱动
- ✅ WebdriverIO
- ✅ Mocha 测试框架

### 已创建
- ✅ `wdio.conf.js` - WebdriverIO 配置
- ✅ `e2e-appium/auth.spec.js` - 认证测试
- ✅ `e2e-appium/navigation.spec.js` - 导航测试

## 🚀 运行测试

### 方法 1: 使用两个终端（推荐）

#### 终端 1: 启动 Appium Server
```bash
cd /Users/gaoxuxu/Desktop/小佩APP/app
npm run appium:server
```

#### 终端 2: 运行测试
```bash
cd /Users/gaoxuxu/Desktop/小佩APP/app
npm run test:appium:ios
```

### 方法 2: 后台运行 Appium Server

```bash
# 启动 Appium Server（后台）
appium server --port 4723 &

# 运行测试
npm run test:appium:ios
```

## 📝 测试文件

### auth.spec.js
- 登录页面显示
- 输入手机号 (`phone-input`)
- 请求验证码 (`request-otp-button`)
- 完成登录 (`login-button`)

### navigation.spec.js
- 底部导航切换 (`tab-cases`, `tab-xiaopei-home`, `tab-me`)
- 页面跳转验证

## 🔧 配置说明

### 应用路径
当前配置的应用路径：
```
/Users/gaoxuxu/Library/Developer/Xcode/DerivedData/app-ahzzposqzpygrtfswiskdjfvqvrl/Build/Products/Debug-iphonesimulator/app.app
```

如果需要更改，可以：
1. 设置环境变量：`export APP_PATH=/path/to/app.app`
2. 或修改 `wdio.conf.js` 中的路径

### 设备配置
- **设备名称**: iPhone 17 Pro
- **平台版本**: 17.0
- **自动化**: XCUITest

## ⚠️ 注意事项

1. **Appium Server 必须运行**
   - 测试前确保 Appium Server 在运行
   - 默认端口：4723
   - 检查：`curl http://localhost:4723/status`

2. **应用必须已构建**
   - 确保应用已构建完成
   - 路径指向正确的 .app 文件

3. **模拟器必须运行**
   - 确保 iOS 模拟器已启动
   - 或 Appium 会自动启动模拟器

## 📊 测试结果

测试完成后会显示：
- ✅ 通过的测试
- ❌ 失败的测试
- ⏱️ 测试耗时

## 🔍 调试

### 查看 Appium 日志
Appium Server 会输出详细的日志，包括：
- 设备连接状态
- 命令执行情况
- 错误信息

### 查看测试日志
测试日志保存在：`/tmp/appium-test.log`

---

**状态**: ✅ Appium 已配置并启动  
**下一步**: 运行测试验证

