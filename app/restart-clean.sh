#!/bin/bash

# 完全清理并重启 App
# 用于解决 Metro Bundler 缓存问题

set -e

echo "================================================"
echo "🧹 完全清理并重启 App"
echo "================================================"

cd "$(dirname "$0")"

# 1. 清理 Metro Bundler 缓存
echo ""
echo "📦 [1/3] 清理 Metro Bundler 缓存..."
rm -rf $TMPDIR/metro-* $TMPDIR/haste-* $TMPDIR/react-* 2>/dev/null || true
rm -rf .expo 2>/dev/null || true
rm -rf node_modules/.cache 2>/dev/null || true
echo "✅ Metro 缓存已清理"

# 2. 清理 iOS 构建缓存
echo ""
echo "🍎 [2/3] 清理 iOS 构建缓存..."
cd ios
rm -rf build DerivedData 2>/dev/null || true
cd ..
echo "✅ iOS 构建缓存已清理"

# 3. 启动 Metro Bundler（清除缓存模式）
echo ""
echo "🚀 [3/3] 启动 Metro Bundler..."
echo ""
echo "================================================"
echo "✅ 清理完成！Metro Bundler 启动中..."
echo "================================================"
echo ""
echo "📝 接下来："
echo "   - Metro 会自动启动（带 --clear 标志）"
echo "   - 在 Xcode 或另一个终端运行: npm run ios"
echo "   - 或按 'i' 在 iOS 模拟器中打开"
echo ""

npx expo start --clear


