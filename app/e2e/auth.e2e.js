/**
 * 认证流程 E2E 测试
 * 
 * 测试登录、注册等认证相关功能
 */

describe('认证流程测试', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('登录页面', () => {
    it('应该显示登录表单', async () => {
      // 等待登录页面加载
      await waitFor(element(by.id('auth-screen')))
        .toBeVisible()
        .withTimeout(5000);

      // 检查输入框是否存在
      await expect(element(by.id('phone-input'))).toBeVisible();
      await expect(element(by.id('otp-input'))).toBeVisible();
    });

    it('应该能够输入手机号', async () => {
      const phoneInput = element(by.id('phone-input'));
      await phoneInput.tap();
      await phoneInput.typeText('13800138000');
      await expect(phoneInput).toHaveText('13800138000');
    });

    it('应该能够请求验证码', async () => {
      // 输入手机号
      await element(by.id('phone-input')).typeText('13800138000');
      
      // 点击获取验证码按钮
      await element(by.id('request-otp-button')).tap();
      
      // 等待验证码输入框可用
      await waitFor(element(by.id('otp-input')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('应该能够完成登录', async () => {
      // 输入手机号和验证码
      await element(by.id('phone-input')).typeText('13800138000');
      await element(by.id('request-otp-button')).tap();
      await element(by.id('otp-input')).typeText('123456');
      
      // 点击登录按钮
      await element(by.id('login-button')).tap();
      
      // 等待跳转到主页
      await waitFor(element(by.id('main-tabs')))
        .toBeVisible()
        .withTimeout(10000);
    });
  });
});

