/**
 * WebdriverIO 配置文件
 * 用于 Appium E2E 测试
 */

exports.config = {
  runner: 'local',
  port: 4723,
  path: '/',
  
  specs: [
    './e2e-appium/**/*.spec.js'
  ],
  
  exclude: [],
  
  maxInstances: 1,
  
  capabilities: [{
    platformName: 'iOS',
    'appium:platformVersion': '26.1',
    'appium:deviceName': 'iPhone 17 Pro',
    'appium:app': process.env.APP_PATH || '/Users/gaoxuxu/Library/Developer/Xcode/DerivedData/app-ahzzposqzpygrtfswiskdjfvqvrl/Build/Products/Debug-iphonesimulator/app.app',
    'appium:automationName': 'XCUITest',
    'appium:bundleId': 'com.xiaopei.app',
    'appium:noReset': false,
    'appium:fullReset': false, // 禁用 fullReset 以加快测试速度，首次运行后应用已安装
  }],
  
  logLevel: 'info',
  bail: 0,
  baseUrl: 'http://localhost',
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  
  // Appium service - 需要手动启动 Appium Server
  // 运行: appium server --port 4723
  services: [],
  
  framework: 'mocha',
  reporters: ['spec'],
  
  mochaOpts: {
    ui: 'bdd',
    timeout: 120000,
  },
  
  before: function (capabilities, specs) {
    // 测试前的设置
  },
  
  after: function (result, capabilities, specs) {
    // 测试后的清理
  },
};

