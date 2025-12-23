#!/usr/bin/env node
/**
 * 监控构建并自动运行测试
 * 
 * 功能：
 * 1. 监控 iOS 构建进度
 * 2. 构建完成后自动运行 Detox 测试
 * 3. 显示实时进度
 */

const { execSync } = require('child_process');
const { existsSync } = require('fs');
const { join, resolve } = require('path');

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

const rootDir = resolve(__dirname, '..');

// 检查构建是否完成
function isBuildComplete() {
  // 检查多个可能的路径
  const paths = [
    join(rootDir, 'ios/build/Build/Products/Debug-iphonesimulator/app.app'),
    join(rootDir, 'ios/build/Build/Products/Debug-iphonesimulator/小佩妙算.app'),
    // 也检查 DerivedData（Expo 默认使用）
    join(process.env.HOME, 'Library/Developer/Xcode/DerivedData/app-*/Build/Products/Debug-iphonesimulator/app.app'),
  ];
  
  // 检查第一个路径（最可能）
  if (existsSync(paths[0])) {
    return true;
  }
  
  // 检查 DerivedData（使用 glob 模式）
  try {
    const { execSync } = require('child_process');
    const result = execSync(`find ~/Library/Developer/Xcode/DerivedData/app-* -name "app.app" -type d 2>/dev/null | head -1`, { encoding: 'utf-8' });
    return result.trim().length > 0;
  } catch (error) {
    return false;
  }
}

// 检查构建进程是否在运行
function isBuildRunning() {
  try {
    const result = execSync('ps aux | grep xcodebuild | grep -v grep', { encoding: 'utf-8' });
    return result.trim().length > 0;
  } catch (error) {
    return false;
  }
}

// 获取构建目录大小
function getBuildSize() {
  try {
    const result = execSync(`du -sh ${join(rootDir, 'ios/build')} 2>/dev/null`, { encoding: 'utf-8' });
    return result.trim().split('\t')[0];
  } catch (error) {
    return '0';
  }
}

// 运行测试
async function runTests() {
  logSection('构建完成，开始运行测试');
  
  try {
    // 构建 Detox 测试应用
    log('构建 Detox 测试应用...', 'yellow');
    execSync('npx detox build --configuration ios.sim.debug', {
      cwd: rootDir,
      stdio: 'inherit',
    });
    
    // 运行测试
    log('运行 E2E 测试...', 'yellow');
    execSync('npx detox test --configuration ios.sim.debug', {
      cwd: rootDir,
      stdio: 'inherit',
    });
    
    log('测试完成！', 'green');
  } catch (error) {
    log(`测试失败: ${error.message}`, 'red');
    process.exit(1);
  }
}

// 主监控循环
async function monitor() {
  logSection('iOS 构建监控');
  
  // 首先检查构建是否已完成
  if (isBuildComplete()) {
    log('✅ 构建已完成！', 'green');
    await runTests();
    return;
  }
  
  log('正在监控构建进度...', 'blue');
  log('按 Ctrl+C 可以随时停止', 'yellow');
  
  const startTime = Date.now();
  const checkInterval = 10000; // 每 10 秒检查一次
  let lastBuildSize = '0';
  let noProgressCount = 0;
  let wasRunning = false;
  
  const interval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    
    const isRunning = isBuildRunning();
    const isComplete = isBuildComplete();
    const buildSize = getBuildSize();
    
    // 如果构建已完成，直接运行测试
    if (isComplete) {
      process.stdout.write('\n');
      log('✅ 构建完成！', 'green');
      clearInterval(interval);
      runTests();
      return;
    }
    
    // 检查是否有进度
    if (buildSize === lastBuildSize && !isRunning) {
      noProgressCount++;
    } else {
      noProgressCount = 0;
      lastBuildSize = buildSize;
    }
    
    // 如果之前在运行，现在停止了，可能是构建完成
    if (wasRunning && !isRunning && !isComplete) {
      // 等待几秒再检查，因为构建可能刚完成
      setTimeout(() => {
        if (isBuildComplete()) {
          process.stdout.write('\n');
          log('✅ 构建完成！', 'green');
          clearInterval(interval);
          runTests();
        }
      }, 5000);
    }
    
    wasRunning = isRunning;
    
    // 显示状态
    process.stdout.write(`\r[${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}] `);
    if (isRunning) {
      process.stdout.write(`⏳ 构建中... (${buildSize})`);
      noProgressCount = 0; // 重置无进度计数
    } else {
      process.stdout.write('⏸️  构建进程未运行');
      if (noProgressCount > 3 && elapsed > 60) { // 30 秒无进度且已运行超过1分钟
        process.stdout.write('\n');
        log('⚠️  构建进程已停止，检查构建是否完成...', 'yellow');
        if (isBuildComplete()) {
          log('✅ 构建已完成！', 'green');
          clearInterval(interval);
          runTests();
          return;
        } else {
          log('❌ 构建未完成，可能需要重新启动构建', 'red');
          log('运行: npx expo run:ios', 'cyan');
          clearInterval(interval);
          process.exit(1);
        }
      }
    }
    
    // 超时检查（60 分钟）
    if (elapsed > 3600) {
      clearInterval(interval);
      log('\n构建超时（60 分钟）', 'red');
      process.exit(1);
    }
  }, checkInterval);
  
  // 初始检查
  if (!isBuildRunning() && !isBuildComplete()) {
    log('⚠️  未检测到构建进程', 'yellow');
    log('检查构建是否已完成...', 'blue');
    
    // 等待几秒再检查一次
    setTimeout(() => {
      if (isBuildComplete()) {
        log('✅ 构建已完成！', 'green');
        clearInterval(interval);
        runTests();
      } else {
        log('❌ 构建未完成，请先启动构建', 'red');
        log('运行: npx expo run:ios', 'cyan');
        clearInterval(interval);
        process.exit(1);
      }
    }, 3000);
  }
}

// 运行
monitor().catch(error => {
  log(`错误: ${error.message}`, 'red');
  process.exit(1);
});

