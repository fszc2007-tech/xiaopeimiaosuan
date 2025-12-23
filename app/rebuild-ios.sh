#!/bin/bash

# iOS 应用重新构建脚本
# 用于清理缓存并重新构建应用，确保使用最新的 IP 配置

set -e

echo "🧹 开始清理 iOS 构建缓存..."

cd "$(dirname "$0")"

# 1. 清理 Xcode 构建缓存
echo "📦 清理 Xcode DerivedData..."
rm -rf ~/Library/Developer/Xcode/DerivedData/*

# 2. 清理 iOS 项目构建文件
echo "📦 清理 iOS build 目录..."
rm -rf ios/build
rm -rf ios/Pods/build

# 3. 清理 Metro bundler 缓存
echo "📦 清理 Metro bundler 缓存..."
rm -rf node_modules/.cache
rm -rf .expo

# 4. 清理 watchman 缓存（如果安装了）
if command -v watchman &> /dev/null; then
    echo "📦 清理 watchman 缓存..."
    watchman watch-del-all 2>/dev/null || true
fi

# 5. 重新安装 Pods（如果需要）
echo "📦 重新安装 CocoaPods..."
cd ios
pod deintegrate 2>/dev/null || true
pod install
cd ..

echo ""
echo "✅ 清理完成！"
echo ""
echo "📱 现在请执行以下步骤："
echo "   1. 在 Xcode 中打开: ios/app.xcworkspace"
echo "   2. 选择你的 iPhone 设备"
echo "   3. 点击 Product > Clean Build Folder (Shift+Cmd+K)"
echo "   4. 点击 Product > Build (Cmd+B)"
echo "   5. 点击 Product > Run (Cmd+R)"
echo ""
echo "或者使用命令行构建："
echo "   cd ios && xcodebuild -workspace app.xcworkspace -scheme app -configuration Debug -destination 'platform=iOS,id=YOUR_DEVICE_ID' clean build"
echo ""





