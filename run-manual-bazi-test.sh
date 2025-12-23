#!/bin/bash

echo "========================================"
echo "🔮 小佩 App - 手动排盘 E2E 测试"
echo "========================================"
echo ""
echo "测试用例: 2025年6月20日 早上8点 女 公历"
echo "预期八字: 乙巳年 壬午月 庚申日 庚辰时"
echo ""
echo "========================================"
echo ""

# 检查 Appium Server 是否运行
echo "📡 检查 Appium Server..."
if ! lsof -i :4723 > /dev/null 2>&1; then
    echo "❌ Appium Server 未运行"
    echo ""
    echo "请先启动 Appium Server:"
    echo "  appium server --port 4723"
    echo ""
    exit 1
fi
echo "✅ Appium Server 正在运行"
echo ""

# 检查 Core 服务是否运行
echo "🔧 检查 Core 服务..."
if ! curl -s http://10.89.148.75:3000/health > /dev/null 2>&1; then
    echo "❌ Core 服务未运行"
    echo ""
    echo "请先启动 Core 服务:"
    echo "  cd /Users/gaoxuxu/Desktop/xiaopei-app/core"
    echo "  npm run dev"
    echo ""
    exit 1
fi
echo "✅ Core 服务正在运行"
echo ""

# 检查应用是否已构建
APP_PATH="/Users/gaoxuxu/Library/Developer/Xcode/DerivedData/app-ahzzposqzpygrtfswiskdjfvqvrl/Build/Products/Debug-iphonesimulator/app.app"
if [ ! -d "$APP_PATH" ]; then
    echo "❌ 应用未构建"
    echo ""
    echo "请先构建应用:"
    echo "  cd /Users/gaoxuxu/Desktop/xiaopei-app/app"
    echo "  npx expo run:ios"
    echo ""
    exit 1
fi
echo "✅ 应用已构建"
echo ""

# 进入 app 目录
cd "$(dirname "$0")/app"

# 运行测试
echo "🚀 开始运行测试..."
echo ""
npx wdio run wdio.conf.js --spec ./e2e-appium/manual-bazi.spec.js

# 检查测试结果
if [ $? -eq 0 ]; then
    echo ""
    echo "========================================"
    echo "🎉 测试完成！"
    echo "========================================"
else
    echo ""
    echo "========================================"
    echo "❌ 测试失败"
    echo "========================================"
    echo ""
    echo "常见问题:"
    echo "1. 应用可能需要先登录"
    echo "2. testID 可能需要更新"
    echo "3. 元素定位可能需要调整"
    echo ""
    exit 1
fi

