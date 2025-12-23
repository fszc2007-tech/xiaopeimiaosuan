#!/bin/bash

# 紧急修复：清除所有缓存并重置
# 用于修复 "expected dynamic type 'boolean', but had type 'string'" 错误

echo "🔥 开始紧急修复..."

# 1. 停止所有相关进程
echo "1️⃣ 停止所有服务..."
pkill -f "expo start" 2>/dev/null || true
pkill -f "node.*metro" 2>/dev/null || true
sleep 2

# 2. 清除所有缓存
echo "2️⃣ 清除所有缓存..."
cd "$(dirname "$0")/app"

# 清除 npm 缓存
rm -rf node_modules/.cache

# 清除 Metro 缓存
rm -rf .expo
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/react-*
rm -rf $TMPDIR/haste-*

# 清除 watchman（如果安装了）
if command -v watchman &> /dev/null; then
  echo "清除 watchman..."
  watchman watch-del-all
fi

echo ""
echo "✅ 缓存清除完成！"
echo ""
echo "📱 下一步操作："
echo "1. 在手机上完全关闭 Expo Go"
echo "2. 重新打开 Expo Go"
echo "3. 运行: cd app && npx expo start"
echo "4. 重新扫描二维码"
echo ""
echo "⚠️ 首次加载可能需要 1-2 分钟"

