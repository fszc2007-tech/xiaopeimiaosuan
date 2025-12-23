#!/bin/bash

echo "🔄 重启 App 并清除缓存..."

# 1. 停止 Expo
echo "1. 停止 Expo..."
pkill -f "expo start" 2>/dev/null
pkill -f "expo" 2>/dev/null

# 2. 清除缓存
echo "2. 清除缓存..."
cd /Users/gaoxuxu/Desktop/小佩APP/app
rm -rf .expo
rm -rf node_modules/.cache

# 3. 重新启动
echo "3. 重新启动 Expo..."
npx expo start --clear &

echo ""
echo "✅ 完成！"
echo ""
echo "📱 请在 iOS 模拟器中："
echo "   1. 按 Cmd + R 重新加载"
echo "   2. 或者摇一摇设备 → 选择 'Reload'"
echo ""
echo "🔗 API 地址已更新为: http://172.20.10.2:3000"
echo "🔑 固定验证码: 123456"
echo ""

