#!/bin/bash
# 修复 Metro bundler 网络连接问题（手机热点环境）

set -e

cd "$(dirname "$0")/app"

echo "🔍 检测网络配置..."

# 获取当前电脑的 IP 地址（排除 localhost）
COMPUTER_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n 1)

if [ -z "$COMPUTER_IP" ]; then
  echo "❌ 无法检测到本机 IP 地址"
  echo "ℹ️  请手动检查网络连接"
  exit 1
fi

echo "✅ 检测到本机 IP: $COMPUTER_IP"
echo ""
echo "🛠️  正在配置 Metro bundler..."
echo "   将使用 LAN 模式启动，允许模拟器访问 bundler"
echo ""

# 清理之前的缓存
echo "🧹 清理缓存..."
rm -rf .expo .expo-shared node_modules/.cache

# 导出环境变量
export REACT_NATIVE_PACKAGER_HOSTNAME=$COMPUTER_IP
export EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0

echo ""
echo "📱 启动 Metro bundler (LAN 模式)..."
echo "   主机地址: $COMPUTER_IP"
echo "   模拟器将从此地址加载 JS bundle"
echo ""
echo "⚠️  如果仍然出现错误，请尝试："
echo "   1. 在 Xcode 中 Clean Build Folder（Shift+Cmd+K）"
echo "   2. 重新构建 iOS app"
echo ""

# 使用 LAN 模式启动
npx expo start --host lan --clear

