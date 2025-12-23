/**
 * 导航流程 E2E 测试 - Appium
 */

describe('导航流程测试', () => {
  beforeEach(async () => {
    // 每个测试前重新启动应用
    await driver.execute('mobile: launchApp', { bundleId: 'com.xiaopei.app' });
    await driver.pause(2000);
  });

  it('应该能够切换到"档案"标签', async () => {
    // 点击底部导航的"档案"标签
    const casesTab = await $('~tab-cases');
    await casesTab.click();
    
    // 等待页面加载
    await driver.pause(1000);
    
    // 验证是否跳转到档案页面
    const casesScreen = await $('~cases-screen');
    await expect(casesScreen).toBeDisplayed();
  });

  it('应该能够切换到"小佩"标签', async () => {
    // 点击底部导航的"小佩"标签
    const xiaopeiTab = await $('~tab-xiaopei-home');
    await xiaopeiTab.click();
    
    // 等待页面加载
    await driver.pause(1000);
    
    // 验证是否跳转到小佩主页
    const xiaopeiScreen = await $('~xiaopei-home-screen');
    await expect(xiaopeiScreen).toBeDisplayed();
  });

  it('应该能够切换到"我的"标签', async () => {
    // 点击底部导航的"我的"标签
    const meTab = await $('~tab-me');
    await meTab.click();
    
    // 等待页面加载
    await driver.pause(1000);
    
    // 验证是否跳转到我的页面
    const meScreen = await $('~me-screen');
    await expect(meScreen).toBeDisplayed();
  });
});

