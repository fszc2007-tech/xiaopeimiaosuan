#!/bin/bash

# 前端构建 APK 脚本

set -e

echo "=========================================="
echo "构建前端 APK"
echo "=========================================="
echo ""

cd "$(dirname "$0")/app"

echo "开始构建 Android APK..."
echo "这可能需要 20-30 分钟..."
echo ""

eas build --platform android --profile production --clear-cache --non-interactive

echo ""
echo "✅ 前端构建完成！"
echo ""

