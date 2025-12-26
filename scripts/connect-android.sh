#!/bin/bash

# Android 模拟器连接脚本

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "=========================================="
echo "Android 模拟器连接检查"
echo "=========================================="
echo ""

# 1. 检查模拟器是否运行
echo "1. 检查模拟器进程..."
EMULATOR_PID=$(pgrep -f "emulator.*Medium_Phone_API_36.1" | head -1)
if [ -n "$EMULATOR_PID" ]; then
    echo -e "${GREEN}✅ 模拟器进程运行中 (PID: $EMULATOR_PID)${NC}"
else
    echo -e "${RED}❌ 模拟器未运行${NC}"
    echo "启动模拟器..."
    emulator -avd Medium_Phone_API_36.1 > /tmp/emulator.log 2>&1 &
    echo "等待模拟器启动..."
    sleep 10
fi

echo ""

# 2. 检查 ADB 连接
echo "2. 检查 ADB 连接..."
DEVICES=$(adb devices | grep -v "List" | grep "device" | wc -l | tr -d ' ')
if [ "$DEVICES" -gt 0 ]; then
    echo -e "${GREEN}✅ 检测到 $DEVICES 个设备${NC}"
    adb devices
else
    echo -e "${YELLOW}⚠️  未检测到设备${NC}"
    echo "重启 ADB..."
    adb kill-server
    adb start-server
    sleep 2
    adb devices
fi

echo ""

# 3. 检查 Expo
echo "3. 检查 Expo 开发服务器..."
if curl -s http://localhost:8081/status > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Expo 开发服务器运行中${NC}"
else
    echo -e "${YELLOW}⚠️  Expo 未运行${NC}"
    echo "启动 Expo..."
    cd /Users/gaoxuxu/Desktop/xiaopei-app/app
    npx expo start --clear > /tmp/expo.log 2>&1 &
    echo "等待 Expo 启动..."
    sleep 5
fi

echo ""

# 4. 尝试连接
echo "4. 尝试连接到模拟器..."
DEVICE_ID=$(adb devices | grep "device" | grep -v "List" | awk '{print $1}' | head -1)
if [ -n "$DEVICE_ID" ]; then
    echo -e "${GREEN}✅ 找到设备: $DEVICE_ID${NC}"
    echo ""
    echo "手动连接步骤："
    echo "1. 确保 Expo 终端窗口可见"
    echo "2. 在 Expo 终端中按 'a' 键"
    echo ""
    echo "或者运行以下命令手动安装："
    echo "   adb install -r <apk路径>"
else
    echo -e "${RED}❌ 未找到设备${NC}"
    echo "请检查模拟器是否完全启动"
fi

echo ""
echo "=========================================="
