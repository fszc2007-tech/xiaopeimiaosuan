#!/bin/bash

echo "========================================"
echo "🔍 Appium 元素检查工具"
echo "========================================"
echo ""

# 检查 Appium Server 是否运行
echo "📡 步骤 1: 检查 Appium Server..."
if ! nc -z localhost 4723; then
  echo "❌ Appium Server 未运行"
  echo ""
  echo "正在启动 Appium Server..."
  pkill -f "appium.*server" 2>/dev/null
  sleep 2
  appium server --port 4723 > /tmp/appium-inspector.log 2>&1 &
  echo "⏳ 等待 Appium Server 启动..."
  sleep 5
fi

if nc -z localhost 4723; then
  echo "✅ Appium Server 正在运行"
else
  echo "❌ Appium Server 启动失败"
  exit 1
fi

echo ""
echo "📱 步骤 2: 检查应用..."
APP_PATH="/Users/gaoxuxu/Library/Developer/Xcode/DerivedData/app-ahzzposqzpygrtfswiskdjfvqvrl/Build/Products/Debug-iphonesimulator/app.app"
if [ -d "$APP_PATH" ]; then
  echo "✅ 应用已构建"
else
  echo "⚠️  应用未找到，可能需要先构建"
fi

echo ""
echo "🚀 步骤 3: 运行元素检查脚本..."
echo "========================================"
echo ""

cd /Users/gaoxuxu/Desktop/xiaopei-app/app
node e2e-appium/inspect-app.js

EXIT_CODE=$?

echo ""
echo "========================================"
if [ $EXIT_CODE -eq 0 ]; then
  echo "✅ 元素检查完成！"
  echo ""
  echo "📄 生成的文件:"
  ls -lh /Users/gaoxuxu/Desktop/xiaopei-app/app/app-*-source.xml 2>/dev/null || echo "  (未找到 XML 文件)"
  echo ""
  echo "💡 下一步:"
  echo "  1. 查看生成的 XML 文件"
  echo "  2. 找到所需元素的实际属性"
  echo "  3. 更新测试脚本中的元素定位器"
else
  echo "❌ 元素检查失败"
  echo ""
  echo "请检查:"
  echo "  1. Appium Server 是否正常运行"
  echo "  2. 应用是否已构建"
  echo "  3. iOS 模拟器是否可用"
fi
echo "========================================"

