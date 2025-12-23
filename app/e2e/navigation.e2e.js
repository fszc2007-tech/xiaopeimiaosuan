/**
 * 导航流程 E2E 测试
 * 
 * 测试应用内的页面导航和底部标签切换
 */

describe('导航流程测试', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('底部导航', () => {
    it('应该能够切换到"档案"标签', async () => {
      // 点击底部导航的"档案"标签
      await element(by.id('tab-cases')).tap();
      
      // 验证是否跳转到档案页面
      await waitFor(element(by.id('cases-screen')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('应该能够切换到"小佩"标签', async () => {
      // 点击底部导航的"小佩"标签
      await element(by.id('tab-xiaopei-home')).tap();
      
      // 验证是否跳转到小佩主页
      await waitFor(element(by.id('xiaopei-home-screen')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('应该能够切换到"我的"标签', async () => {
      // 点击底部导航的"我的"标签
      await element(by.id('tab-me')).tap();
      
      // 验证是否跳转到我的页面
      await waitFor(element(by.id('me-screen')))
        .toBeVisible()
        .withTimeout(3000);
    });
  });

  describe('页面跳转', () => {
    it('应该能够从主页跳转到聊天页面', async () => {
      // 在主页点击某个话题按钮或输入框
      await element(by.id('chat-input')).tap();
      
      // 验证是否跳转到聊天页面
      await waitFor(element(by.id('chat-screen')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('应该能够从档案页跳转到命盘详情页', async () => {
      // 先切换到档案页
      await element(by.id('tab-cases')).tap();
      
      // 点击某个命盘卡片
      await element(by.id('chart-card-0')).tap();
      
      // 验证是否跳转到命盘详情页
      await waitFor(element(by.id('chart-detail-screen')))
        .toBeVisible()
        .withTimeout(3000);
    });
  });
});

