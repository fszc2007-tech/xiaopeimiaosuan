#!/bin/bash

# Xcode 构建错误快速修复脚本

set -e

echo "🔧 开始修复 Xcode 构建错误..."

cd "$(dirname "$0")"

# 1. 清理 DerivedData
echo "📦 清理 DerivedData..."
rm -rf ~/Library/Developer/Xcode/DerivedData/XiaoPeiApp-* 2>/dev/null || true
rm -rf ~/Library/Developer/Xcode/DerivedData/app-* 2>/dev/null || true
echo "✅ DerivedData 已清理"

# 2. 清理本地构建缓存
echo "📦 清理本地构建缓存..."
rm -rf ios/build 2>/dev/null || true
echo "✅ 构建缓存已清理"

# 3. 确保 Pods 已安装
echo "📦 检查 Pods..."
if [ ! -d "ios/Pods" ]; then
    echo "⚠️  Pods 未安装，正在安装..."
    cd ios
    export LANG=en_US.UTF-8
    export LC_ALL=en_US.UTF-8
    pod install
    cd ..
else
    echo "✅ Pods 已安装"
fi

echo ""
echo "✅ 修复完成！"
echo ""
echo "📱 现在请在 Xcode 中："
echo "   1. 关闭 Xcode（如果已打开）"
echo "   2. 重新打开: ios/app.xcworkspace"
echo "   3. 选择你的 iPhone 设备"
echo "   4. 在项目设置中："
echo "      - 选择 Target 'app'"
echo "      - 进入 'Signing & Capabilities'"
echo "      - 勾选 'Automatically manage signing'"
echo "      - 选择你的 Team（如果没有，选择 'None' 用于开发测试）"
echo "   5. 按 Shift+Cmd+K 清理构建文件夹"
echo "   6. 按 Cmd+B 重新构建"
echo ""
echo "⚠️  注意：Module map 错误会在第一次构建时自动解决"
echo "   Xcode 会自动重新生成这些文件"





