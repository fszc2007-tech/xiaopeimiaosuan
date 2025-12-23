# Detox E2E 测试

小佩 App 的端到端测试使用 Detox 框架。

## 前置要求

### iOS
- Xcode 14+
- iOS Simulator
- CocoaPods（如果使用原生模块）

### Android
- Android Studio
- Android SDK
- Android Emulator 或真机

## 安装和配置

### 1. 安装依赖

```bash
npm install
```

### 2. 构建原生应用

Detox 需要原生构建的应用，所以需要先构建：

#### iOS
```bash
# 使用 Expo 构建 iOS 应用
npx expo run:ios

# 或者使用 Detox 构建
npm run test:e2e:ios:build
```

#### Android
```bash
# 使用 Expo 构建 Android 应用
npx expo run:android

# 或者使用 Detox 构建
npm run test:e2e:android:build
```

## 运行测试

### iOS
```bash
# 构建并运行测试
npm run test:e2e:ios:build
npm run test:e2e:ios

# 或者直接运行（如果已构建）
npm run test:e2e:ios
```

### Android
```bash
# 构建并运行测试
npm run test:e2e:android:build
npm run test:e2e:android

# 或者直接运行（如果已构建）
npm run test:e2e:android
```

## 测试文件结构

```
e2e/
├── jest.config.js          # Jest 配置
├── firstTest.e2e.js        # 基础测试示例
├── auth.e2e.js             # 认证流程测试
├── navigation.e2e.js       # 导航流程测试
└── README.md               # 本文档
```

## 编写测试

### 基本结构

```javascript
describe('功能测试', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('应该执行某个操作', async () => {
    // 测试代码
  });
});
```

### 常用操作

#### 查找元素
```javascript
// 通过 testID
element(by.id('my-button'))

// 通过文本
element(by.text('登录'))

// 通过类型
element(by.type('RCTTextInput'))
```

#### 交互操作
```javascript
// 点击
await element(by.id('button')).tap();

// 输入文本
await element(by.id('input')).typeText('Hello');

// 清除文本
await element(by.id('input')).clearText();

// 滚动
await element(by.id('scroll-view')).scroll(100, 'down');
```

#### 断言
```javascript
// 可见性
await expect(element(by.id('button'))).toBeVisible();

// 文本内容
await expect(element(by.id('text'))).toHaveText('Hello');

// 不存在
await expect(element(by.id('button'))).not.toBeVisible();
```

#### 等待
```javascript
// 等待元素出现
await waitFor(element(by.id('button')))
  .toBeVisible()
  .withTimeout(5000);
```

## 添加 testID

为了使用 Detox 测试，需要在组件中添加 `testID` 属性：

```tsx
// React Native 组件
<Button
  testID="login-button"
  onPress={handleLogin}
>
  登录
</Button>

// 或者使用 accessibilityLabel（不推荐，优先使用 testID）
<Text accessibilityLabel="welcome-text">欢迎</Text>
```

## 调试

### 查看元素
```bash
# iOS
detox test --configuration ios.sim.debug --loglevel trace

# Android
detox test --configuration android.emu.debug --loglevel trace
```

### 截图
```javascript
await device.takeScreenshot('screenshot-name');
```

### 日志
```javascript
console.log('Debug message');
```

## 常见问题

### 1. 找不到元素
- 确保组件有 `testID` 属性
- 检查元素是否在屏幕上可见
- 使用 `waitFor` 等待元素出现

### 2. 构建失败
- 确保已安装所有依赖
- 检查 Xcode/Android Studio 配置
- 清理构建缓存：`npm run test:e2e:ios:clean`

### 3. 测试超时
- 增加 `withTimeout` 时间
- 检查应用是否正常启动
- 查看设备日志

## 参考文档

- [Detox 官方文档](https://wix.github.io/Detox/)
- [Detox API 参考](https://wix.github.io/Detox/docs/api/actions)
- [Jest 文档](https://jestjs.io/docs/getting-started)

