#!/bin/bash

# Expo 快速启动脚本
# 自动进入项目目录并启动 Expo

set -e

echo "=========================================="
echo "启动 Expo 开发服务器"
echo "=========================================="
echo ""

# 获取脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$SCRIPT_DIR"
APP_DIR="$PROJECT_ROOT/app"

# 检查 app 目录是否存在
if [ ! -d "$APP_DIR" ]; then
    echo "❌ 错误: 找不到 app 目录"
    echo "   当前路径: $PROJECT_ROOT"
    exit 1
fi

echo "📁 项目目录: $PROJECT_ROOT"
echo "📱 App 目录: $APP_DIR"
echo ""

# 进入 app 目录
cd "$APP_DIR"

# 检查 node_modules
if [ ! -d "node_modules" ]; then
    echo "⚠️  检测到 node_modules 不存在，正在安装依赖..."
    npm install
    echo ""
fi

# 检查 .env 文件
if [ ! -f ".env" ]; then
    echo "⚠️  检测到 .env 文件不存在，正在创建..."
    cat > .env << EOF
XIAOPEI_CORE_API_URL=http://localhost:3000
EOF
    echo "✅ 已创建 .env 文件"
    echo ""
fi

echo "🚀 启动 Expo 开发服务器..."
echo ""
echo "提示:"
echo "  - 按 'a' 键启动 Android 模拟器"
echo "  - 按 'i' 键启动 iOS 模拟器"
echo "  - 按 'w' 键在浏览器中打开"
echo "  - 扫描二维码在真机上测试"
echo ""

# 启动 Expo
npx expo start --clear

