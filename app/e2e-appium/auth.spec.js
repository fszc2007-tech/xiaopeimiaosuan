/**
 * 认证流程 E2E 测试 - Appium
 */

describe('认证流程测试', () => {
  it('应该显示登录页面', async () => {
    // 等待应用加载（fullReset 会重置应用）
    await driver.pause(5000);
    
    // 检查登录页面是否存在
    const authScreen = await $('~auth-screen');
    await authScreen.waitForDisplayed({ timeout: 10000 });
    await expect(authScreen).toBeDisplayed();
  });

  it('应该能够输入手机号', async () => {
    // 等待页面加载
    await driver.pause(2000);
    
    // 查找手机号输入框
    const phoneInput = await $('~phone-input');
    await phoneInput.waitForDisplayed({ timeout: 10000 });
    await phoneInput.click();
    await phoneInput.setValue('13800138000');
    
    // 验证输入
    const value = await phoneInput.getText();
    expect(value).toContain('13800138000');
  });

  it('应该能够请求验证码', async () => {
    // 点击获取验证码按钮
    const requestOtpButton = await $('~request-otp-button');
    await requestOtpButton.click();
    
    // 等待验证码输入框出现
    const otpInput = await $('~otp-input');
    await expect(otpInput).toBeDisplayed();
  });

  it('应该能够完成登录', async () => {
    // 输入验证码
    const otpInput = await $('~otp-input');
    await otpInput.click();
    await otpInput.setValue('123456');
    
    // 点击登录按钮
    const loginButton = await $('~login-button');
    await loginButton.click();
    
    // 等待跳转到主页
    await driver.pause(3000);
    
    // 验证是否跳转到主页
    const mainTabs = await $('~main-tabs');
    await expect(mainTabs).toBeDisplayed();
  });
});

