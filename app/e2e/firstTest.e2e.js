/**
 * Detox E2E 测试示例
 * 
 * 这是第一个端到端测试文件，用于验证 Detox 配置是否正确
 */

describe('小佩 App E2E 测试', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('应该显示应用启动界面', async () => {
    // 等待应用加载完成
    await waitFor(element(by.id('app-root')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('应该能够导航到登录页面（如果未登录）', async () => {
    // 检查是否有登录相关的元素
    // 根据实际应用调整选择器
    await expect(element(by.text('登录'))).toBeVisible();
  });

  // 更多测试用例...
});

