/**
 * Appium 元素检查脚本
 * 用于查看应用的实际元素树和可用的定位方式
 */

const { remote } = require('webdriverio');
const fs = require('fs');
const path = require('path');

// Appium 连接配置
const capabilities = {
  platformName: 'iOS',
  'appium:platformVersion': '26.1',
  'appium:deviceName': 'iPhone 17 Pro',
  'appium:app': process.env.APP_PATH || '/Users/gaoxuxu/Library/Developer/Xcode/DerivedData/app-ahzzposqzpygrtfswiskdjfvqvrl/Build/Products/Debug-iphonesimulator/app.app',
  'appium:automationName': 'XCUITest',
  'appium:bundleId': 'com.xiaopei.app',
  'appium:noReset': false,
  'appium:fullReset': false,
};

const wdOpts = {
  hostname: '127.0.0.1',
  port: 4723,
  path: '/',
  logLevel: 'info',
  capabilities,
};

async function inspectApp() {
  console.log('========================================');
  console.log('🔍 Appium 元素检查工具');
  console.log('========================================\n');

  let driver;
  
  try {
    console.log('📱 步骤 1: 连接到应用...');
    driver = await remote(wdOpts);
    console.log('✅ 连接成功\n');

    // 等待应用完全加载
    console.log('⏳ 等待应用加载...');
    await driver.pause(5000);
    console.log('✅ 应用已加载\n');

    // 获取页面源代码（完整的 XML 树）
    console.log('📄 步骤 2: 获取页面元素树...');
    const pageSource = await driver.getPageSource();
    
    // 保存到文件
    const outputFile = path.join(__dirname, '../app-page-source.xml');
    fs.writeFileSync(outputFile, pageSource, 'utf-8');
    console.log(`✅ 页面源代码已保存到: ${outputFile}\n`);

    // 查找所有可点击元素
    console.log('🔍 步骤 3: 查找所有按钮和可点击元素...');
    const buttons = await driver.$$('//XCUIElementTypeButton');
    console.log(`找到 ${buttons.length} 个按钮\n`);

    for (let i = 0; i < Math.min(buttons.length, 20); i++) {
      try {
        const button = buttons[i];
        const label = await button.getAttribute('name');
        const value = await button.getAttribute('value');
        const enabled = await button.getAttribute('enabled');
        console.log(`按钮 ${i + 1}:`);
        console.log(`  - Name: ${label || '(无)'}`);
        console.log(`  - Value: ${value || '(无)'}`);
        console.log(`  - Enabled: ${enabled}`);
        console.log('');
      } catch (e) {
        console.log(`按钮 ${i + 1}: 无法获取属性`);
      }
    }

    // 查找所有输入框
    console.log('\n🔍 步骤 4: 查找所有输入框...');
    const textFields = await driver.$$('//XCUIElementTypeTextField');
    console.log(`找到 ${textFields.length} 个输入框\n`);

    for (let i = 0; i < textFields.length; i++) {
      try {
        const field = textFields[i];
        const label = await field.getAttribute('name');
        const placeholder = await field.getAttribute('placeholderValue');
        console.log(`输入框 ${i + 1}:`);
        console.log(`  - Name: ${label || '(无)'}`);
        console.log(`  - Placeholder: ${placeholder || '(无)'}`);
        console.log('');
      } catch (e) {
        console.log(`输入框 ${i + 1}: 无法获取属性`);
      }
    }

    // 查找所有文本标签
    console.log('\n🔍 步骤 5: 查找所有文本标签...');
    const staticTexts = await driver.$$('//XCUIElementTypeStaticText');
    console.log(`找到 ${staticTexts.length} 个文本标签\n`);

    console.log('显示前 30 个文本标签:');
    for (let i = 0; i < Math.min(staticTexts.length, 30); i++) {
      try {
        const text = staticTexts[i];
        const value = await text.getAttribute('value');
        const name = await text.getAttribute('name');
        if (value || name) {
          console.log(`  ${i + 1}. "${value || name}"`);
        }
      } catch (e) {
        // 忽略错误
      }
    }

    // 查找 Tab Bar
    console.log('\n\n🔍 步骤 6: 查找底部 Tab Bar...');
    const tabBars = await driver.$$('//XCUIElementTypeTabBar');
    if (tabBars.length > 0) {
      console.log(`✅ 找到 ${tabBars.length} 个 Tab Bar`);
      
      const tabs = await driver.$$('//XCUIElementTypeTabBar//XCUIElementTypeButton');
      console.log(`找到 ${tabs.length} 个 Tab 按钮\n`);
      
      for (let i = 0; i < tabs.length; i++) {
        try {
          const tab = tabs[i];
          const label = await tab.getAttribute('name');
          console.log(`Tab ${i + 1}: ${label || '(无标签)'}`);
        } catch (e) {
          console.log(`Tab ${i + 1}: 无法获取标签`);
        }
      }
    } else {
      console.log('❌ 未找到 Tab Bar');
    }

    // 尝试导航到"命盘" Tab
    console.log('\n\n🎯 步骤 7: 尝试导航到"命盘" Tab...');
    try {
      // 尝试多种定位方式
      let casesTab = null;
      
      // 方法 1: 通过文本定位
      try {
        casesTab = await driver.$('//XCUIElementTypeButton[@name="命盤"]');
        if (await casesTab.isDisplayed()) {
          console.log('✅ 找到"命盤" Tab (方法: 文本定位)');
        }
      } catch (e) {
        console.log('❌ 方法 1 (文本定位) 失败');
      }

      // 方法 2: 通过 accessibilityId
      if (!casesTab) {
        try {
          casesTab = await driver.$('~cases-tab');
          if (await casesTab.isDisplayed()) {
            console.log('✅ 找到"命盤" Tab (方法: accessibilityId)');
          }
        } catch (e) {
          console.log('❌ 方法 2 (accessibilityId) 失败');
        }
      }

      // 方法 3: 通过索引（假设是第二个 Tab）
      if (!casesTab) {
        try {
          const tabs = await driver.$$('//XCUIElementTypeTabBar//XCUIElementTypeButton');
          if (tabs.length >= 2) {
            casesTab = tabs[1]; // 第二个 Tab
            console.log('✅ 找到"命盤" Tab (方法: 索引定位)');
          }
        } catch (e) {
          console.log('❌ 方法 3 (索引定位) 失败');
        }
      }

      if (casesTab) {
        console.log('🖱️  点击"命盤" Tab...');
        await casesTab.click();
        await driver.pause(3000);
        console.log('✅ 已切换到"命盤" Tab\n');

        // 获取切换后的页面源代码
        console.log('📄 获取"命盤"页面元素树...');
        const casesPageSource = await driver.getPageSource();
        const casesOutputFile = path.join(__dirname, '../app-cases-page-source.xml');
        fs.writeFileSync(casesOutputFile, casesPageSource, 'utf-8');
        console.log(`✅ "命盤"页面源代码已保存到: ${casesOutputFile}\n`);

        // 查找"手动排盤"按钮
        console.log('🔍 查找"手动排盤"按钮...');
        const manualButtons = await driver.$$('//XCUIElementTypeButton');
        console.log(`找到 ${manualButtons.length} 个按钮:\n`);
        
        for (let i = 0; i < manualButtons.length; i++) {
          try {
            const btn = manualButtons[i];
            const label = await btn.getAttribute('name');
            if (label) {
              console.log(`  ${i + 1}. "${label}"`);
              
              // 如果找到包含"手动"或"排盤"的按钮
              if (label.includes('手动') || label.includes('排盤') || label.includes('手動') || label.includes('排盘')) {
                console.log(`      ⭐ 可能是手动排盤按钮！`);
              }
            }
          } catch (e) {
            // 忽略
          }
        }
      }
    } catch (e) {
      console.log(`❌ 导航失败: ${e.message}`);
    }

    console.log('\n\n========================================');
    console.log('🎉 元素检查完成！');
    console.log('========================================');
    console.log('\n📝 生成的文件:');
    console.log('  1. app-page-source.xml - 首页元素树');
    console.log('  2. app-cases-page-source.xml - 命盤页面元素树（如果成功导航）');
    console.log('\n💡 建议:');
    console.log('  - 打开 XML 文件查看完整的元素树');
    console.log('  - 查找元素的 name, label, value 属性');
    console.log('  - 使用这些属性更新测试脚本的元素定位器');
    console.log('========================================\n');

  } catch (error) {
    console.error('\n❌ 错误:', error.message);
    console.error('\n完整错误信息:');
    console.error(error);
  } finally {
    if (driver) {
      console.log('\n🔌 关闭连接...');
      await driver.deleteSession();
      console.log('✅ 连接已关闭');
    }
  }
}

// 运行检查
inspectApp();

