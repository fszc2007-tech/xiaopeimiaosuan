#!/bin/bash

# 微信库移除后的清理脚本
# 用途：清理 iOS 编译缓存和依赖，解决链接错误

set -e  # 遇到错误立即退出

# 设置 UTF-8 编码（CocoaPods 需要）
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

echo "================================================"
echo "🧹 开始清理微信库相关缓存..."
echo "================================================"

# 1. 删除 node_modules
echo ""
echo "📦 [1/6] 删除 node_modules..."
rm -rf node_modules
echo "✅ node_modules 已删除"

# 2. 删除 package-lock.json
echo ""
echo "📦 [2/6] 删除 package-lock.json..."
rm -f package-lock.json
echo "✅ package-lock.json 已删除"

# 3. 重新安装依赖
echo ""
echo "📦 [3/6] 重新安装 npm 依赖..."
npm install
echo "✅ npm 依赖已安装"

# 4. 清理 iOS Pods
echo ""
echo "🍎 [4/6] 清理 iOS Pods..."
cd ios
rm -rf Pods Podfile.lock build
echo "✅ iOS Pods 已清理"

# 5. 重新安装 Pods
echo ""
echo "🍎 [5/6] 重新安装 Pods..."
pod install
cd ..
echo "✅ Pods 已重新安装"

echo ""
echo "================================================"
echo "✅ 清理完成！"
echo "================================================"
echo ""
echo "📝 接下来的步骤："
echo "   1. 启动 Metro Bundler: npm start -- --clear"
echo "   2. 在另一个终端运行: npm run ios"
echo "   3. 或在 Xcode 中重新构建项目"
echo ""
echo "⚠️  注意："
echo "   - 微信分享功能已临时移除"
echo "   - 现在使用系统原生分享功能"
echo "   - 正式发布前需要重新配置微信 SDK"
echo ""

