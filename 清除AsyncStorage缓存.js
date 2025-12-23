/**
 * 清除 AsyncStorage 中的问题数据
 * 
 * 用途：修复 "expected dynamic type 'boolean', but had type 'string'" 错误
 * 
 * 使用方法：
 * 1. 确保 iOS 模拟器或真机正在运行 Expo Go
 * 2. 运行此脚本：node 清除AsyncStorage缓存.js
 */

const { execSync } = require('child_process');

console.log('🔥 开始清除 AsyncStorage 缓存...\n');

try {
  // 方法1: 使用 Expo CLI 清除
  console.log('方法1: 清除 Expo 缓存');
  execSync('cd app && npx expo start --clear', { stdio: 'inherit' });
  
} catch (error) {
  console.error('❌ 清除失败:', error.message);
  console.log('\n📱 请在手机/模拟器上手动清除：');
  console.log('1. 打开 Expo Go');
  console.log('2. 摇动设备');
  console.log('3. 选择 "Clear bundler cache"');
  console.log('4. 完全关闭并重启 Expo Go');
  console.log('5. 重新扫描二维码');
}

