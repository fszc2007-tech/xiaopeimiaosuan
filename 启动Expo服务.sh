#!/bin/bash

echo "🚀 ========== 启动 Expo 开发服务器 =========="
echo ""

# 1. 停止旧进程
echo "1️⃣ 停止旧的 Expo/Metro 进程..."
pkill -9 -f "expo\|metro" 2>/dev/null || true
sleep 2
echo "   ✅ 已停止"
echo ""

# 2. 清除缓存
echo "2️⃣ 清除缓存..."
cd "$(dirname "$0")/app"
rm -rf .expo node_modules/.cache 2>/dev/null || true
echo "   ✅ 缓存已清除"
echo ""

# 3. 获取当前 IP
CURRENT_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')
echo "3️⃣ 当前电脑 IP: $CURRENT_IP"
echo ""

# 4. 启动 Expo
echo "4️⃣ 启动 Expo 开发服务器..."
echo "   📱 请等待服务启动完成（约 10-20 秒）"
echo "   📱 启动后，请在 iPhone 上扫描二维码或输入 URL"
echo ""

# 启动 Expo（使用 LAN 模式，这样手机可以通过 IP 访问）
npx expo start --clear --lan





