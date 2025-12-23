#!/bin/bash

# iOS 构建问题修复脚本
# 解决自动生成文件缺失、Pods 头文件找不到等问题

set -e  # 遇到错误立即退出

echo "🧹 开始修复 iOS 构建问题..."
echo ""

# 1. 进入 app 目录
cd "$(dirname "$0")/app"
echo "📂 当前目录: $(pwd)"
echo ""

# 2. 清理 node_modules 和重装依赖（可选，如果问题严重）
read -p "是否需要重装 node 依赖？这会花费较长时间 (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "🗑️  删除 node_modules..."
    rm -rf node_modules
    echo "📦 重新安装依赖..."
    npm install
    echo ""
fi

# 3. 清理 iOS 构建缓存
echo "🗑️  清理 iOS 构建缓存..."
cd ios

# 删除 build 目录
if [ -d "build" ]; then
    echo "  - 删除 build 目录"
    rm -rf build
fi

# 删除 Pods 目录
if [ -d "Pods" ]; then
    echo "  - 删除 Pods 目录"
    rm -rf Pods
fi

# 删除 Podfile.lock
if [ -f "Podfile.lock" ]; then
    echo "  - 删除 Podfile.lock"
    rm -f Podfile.lock
fi

# 删除 .xcworkspace 用户数据
if [ -d "app.xcworkspace/xcuserdata" ]; then
    echo "  - 清理 workspace 用户数据"
    rm -rf app.xcworkspace/xcuserdata
fi

echo ""

# 4. 清理 Xcode DerivedData（全局）
echo "🗑️  清理 Xcode DerivedData..."
rm -rf ~/Library/Developer/Xcode/DerivedData/*
echo ""

# 5. 清理 CocoaPods 缓存
echo "🗑️  清理 CocoaPods 缓存..."
pod cache clean --all 2>/dev/null || echo "  ℹ️  CocoaPods 缓存已清理"
echo ""

# 6. 重新安装 Pods
echo "📦 重新安装 Pods (这可能需要几分钟)..."
pod deintegrate 2>/dev/null || echo "  ℹ️  跳过 deintegrate"
pod install --repo-update
echo ""

# 7. 返回 app 目录
cd ..

# 8. 清理 Metro bundler 缓存
echo "🗑️  清理 Metro bundler 缓存..."
npx react-native start --reset-cache &
METRO_PID=$!
sleep 3
kill $METRO_PID 2>/dev/null || true
echo ""

echo "✅ iOS 构建环境已重置完成！"
echo ""
echo "📱 下一步操作："
echo "   1. 在 Xcode 中打开项目: app/ios/app.xcworkspace"
echo "   2. 选择 Product > Clean Build Folder (⇧⌘K)"
echo "   3. 重新构建项目 (⌘B)"
echo ""
echo "   或者直接运行:"
echo "   cd app && npx expo run:ios"
echo ""


