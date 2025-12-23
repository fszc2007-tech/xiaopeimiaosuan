#!/bin/bash

# 完全重置并启动小佩 App
# 用于修复："expected dynamic type 'boolean', but had type 'string'"

echo "🔥 ========== 完全重置小佩 App =========="
echo ""

# 1. 停止所有进程
echo "1️⃣ 停止所有进程..."
pkill -9 -f "expo" 2>/dev/null || true
pkill -9 -f "metro" 2>/dev/null || true
pkill -9 -f "node.*8081" 2>/dev/null || true
sleep 2

# 2. 清除所有缓存
echo "2️⃣ 清除所有缓存..."
cd "$(dirname "$0")/app"

# 清除 Metro bundler 缓存
rm -rf .expo
rm -rf $TMPDIR/metro-* 2>/dev/null || true
rm -rf $TMPDIR/react-* 2>/dev/null || true
rm -rf $TMPDIR/haste-* 2>/dev/null || true

# 清除 watchman
if command -v watchman &> /dev/null; then
  echo "   清除 watchman..."
  watchman watch-del-all 2>/dev/null || true
fi

echo ""
echo "✅ 所有缓存已清除"
echo ""
echo "📱 ========== 重要！请在手机上操作 =========="
echo ""
echo "   1. 完全关闭 Expo Go（从多任务中划掉）"
echo "   2. 打开 iPhone 设置 > Expo Go > 清除历史记录和网站数据"
echo "   3. 或者：删除 Expo Go 后重新安装"
echo ""
echo "🚀 正在启动开发服务器..."
echo ""

# 3. 启动
npx expo start --clear



