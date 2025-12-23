#!/usr/bin/env node
/**
 * 自动构建和测试脚本
 * 
 * 功能：
 * 1. 检查 iOS 构建状态
 * 2. 构建完成后自动运行 Detox 测试
 * 3. 支持 Android 构建和测试
 */

const { execSync, spawn } = require('child_process');
const { existsSync } = require('fs');
const { join } = require('path');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60));
}

const rootDir = join(__dirname, '..');

// 检查 iOS 构建是否完成
function checkIOSBuild() {
  const iosDir = join(rootDir, 'ios');
  const buildDir = join(iosDir, 'build');
  
  // 检查多个可能的路径
  const appPaths = [
    join(buildDir, 'Build/Products/Debug-iphonesimulator/app.app'),
    join(buildDir, 'Build/Products/Debug-iphonesimulator/小佩妙算.app'),
  ];
  
  // 也检查 DerivedData（Expo 默认使用）
  try {
    const { execSync } = require('child_process');
    const result = execSync(`find ~/Library/Developer/Xcode/DerivedData/app-* -name "app.app" -type d 2>/dev/null | head -1`, { encoding: 'utf-8' });
    if (result.trim().length > 0) {
      return true;
    }
  } catch (error) {
    // 忽略错误
  }
  
  return existsSync(iosDir) && appPaths.some(path => existsSync(path));
}

// 检查 Android 构建是否完成
function checkAndroidBuild() {
  const androidDir = join(rootDir, 'android');
  const apkPath = join(androidDir, 'app/build/outputs/apk/debug/app-debug.apk');
  
  return existsSync(androidDir) && existsSync(apkPath);
}

// 等待构建完成
function waitForBuild(platform, maxWaitTime = 1800000) { // 30 分钟
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const checkInterval = 10000; // 每 10 秒检查一次
    
    log(`等待 ${platform} 构建完成...`, 'yellow');
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      
      if (elapsed > maxWaitTime) {
        clearInterval(interval);
        reject(new Error(`构建超时（${maxWaitTime / 1000 / 60} 分钟）`));
        return;
      }
      
      const isComplete = platform === 'ios' ? checkIOSBuild() : checkAndroidBuild();
      
      if (isComplete) {
        clearInterval(interval);
        log(`${platform} 构建完成！`, 'green');
        resolve();
      } else {
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        process.stdout.write(`\r等待中... ${minutes}:${String(seconds).padStart(2, '0')}`);
      }
    }, checkInterval);
  });
}

// 运行构建
function runBuild(platform) {
  return new Promise((resolve, reject) => {
    logSection(`开始构建 ${platform.toUpperCase()} 应用`);
    
    // 设置 UTF-8 编码（修复 CocoaPods 编码问题）
    const env = {
      ...process.env,
      LANG: 'en_US.UTF-8',
      LC_ALL: 'en_US.UTF-8',
    };
    
    const command = platform === 'ios' ? 'npx expo run:ios' : 'npx expo run:android';
    const buildProcess = spawn('npx', ['expo', `run:${platform}`], {
      cwd: rootDir,
      stdio: 'inherit',
      shell: true,
      env: env,
    });
    
    buildProcess.on('close', (code) => {
      if (code === 0) {
        log(`${platform.toUpperCase()} 构建成功！`, 'green');
        resolve();
      } else {
        reject(new Error(`${platform.toUpperCase()} 构建失败，退出码: ${code}`));
      }
    });
    
    buildProcess.on('error', (error) => {
      reject(error);
    });
  });
}

// 运行 Detox 测试
function runDetoxTest(platform) {
  return new Promise((resolve, reject) => {
    logSection(`运行 ${platform.toUpperCase()} E2E 测试`);
    
    const config = platform === 'ios' ? 'ios.sim.debug' : 'android.emu.debug';
    
    // 先构建测试应用
    log(`构建 Detox 测试应用...`, 'yellow');
    try {
      execSync(`npx detox build --configuration ${config}`, {
        cwd: rootDir,
        stdio: 'inherit',
      });
      log('测试应用构建成功', 'green');
    } catch (error) {
      log('测试应用构建失败，尝试继续运行测试...', 'yellow');
    }
    
    // 运行测试
    log(`运行测试...`, 'yellow');
    const testProcess = spawn('npx', ['detox', 'test', '--configuration', config], {
      cwd: rootDir,
      stdio: 'inherit',
      shell: true,
    });
    
    testProcess.on('close', (code) => {
      if (code === 0) {
        log(`${platform.toUpperCase()} 测试通过！`, 'green');
        resolve();
      } else {
        log(`${platform.toUpperCase()} 测试失败，退出码: ${code}`, 'red');
        reject(new Error(`测试失败，退出码: ${code}`));
      }
    });
    
    testProcess.on('error', (error) => {
      reject(error);
    });
  });
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  const platform = args[0] || 'ios';
  const skipBuild = args.includes('--skip-build');
  const skipTest = args.includes('--skip-test');
  
  if (!['ios', 'android'].includes(platform)) {
    log('错误: 平台必须是 ios 或 android', 'red');
    process.exit(1);
  }
  
  try {
    logSection('自动构建和测试脚本');
    log(`平台: ${platform.toUpperCase()}`, 'blue');
    log(`跳过构建: ${skipBuild ? '是' : '否'}`, 'blue');
    log(`跳过测试: ${skipTest ? '是' : '否'}`, 'blue');
    
    // 检查构建状态
    const isBuilt = platform === 'ios' ? checkIOSBuild() : checkAndroidBuild();
    
    if (!skipBuild) {
      if (isBuilt) {
        log(`${platform.toUpperCase()} 应用已构建`, 'green');
      } else {
        log(`${platform.toUpperCase()} 应用未构建，开始构建...`, 'yellow');
        await runBuild(platform);
      }
    } else {
      if (!isBuilt) {
        log(`警告: ${platform.toUpperCase()} 应用未构建，但跳过了构建步骤`, 'yellow');
        log('等待现有构建完成...', 'yellow');
        await waitForBuild(platform);
      }
    }
    
    // 运行测试
    if (!skipTest) {
      await runDetoxTest(platform);
    } else {
      log('跳过测试', 'yellow');
    }
    
    logSection('完成');
    log('所有任务完成！', 'green');
    
  } catch (error) {
    logSection('错误');
    log(`错误: ${error.message}`, 'red');
    process.exit(1);
  }
}

// 运行
main().catch(error => {
  log(`未处理的错误: ${error.message}`, 'red');
  process.exit(1);
});

