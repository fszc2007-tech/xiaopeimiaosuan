#!/bin/bash

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "=========================================="
echo "Android 模拟器状态检查"
echo "=========================================="
echo ""

# 检查模拟器进程
EMULATOR_PID=$(pgrep -f "emulator.*Medium_Phone_API_36.1" | head -1)
if [ -n "$EMULATOR_PID" ]; then
    echo -e "${GREEN}✅ 模拟器进程运行中 (PID: $EMULATOR_PID)${NC}"
    ETIME=$(ps -p $EMULATOR_PID -o etime= 2>/dev/null | xargs)
    echo "   运行时间: $ETIME"
else
    echo -e "${YELLOW}⏳ 模拟器进程未找到${NC}"
fi

echo ""

# 检查 ADB 连接
echo "检查 ADB 连接..."
DEVICES=$(adb devices 2>/dev/null | grep -v "List" | grep "device" | wc -l | tr -d ' ')
if [ "$DEVICES" -gt 0 ]; then
    echo -e "${GREEN}✅ 检测到 $DEVICES 个设备已连接${NC}"
    echo ""
    echo "设备列表:"
    adb devices | grep -v "List" | grep "device"
else
    echo -e "${YELLOW}⏳ 尚未检测到设备${NC}"
    echo "   模拟器可能还在启动中，请等待 1-2 分钟"
fi

echo ""
echo "=========================================="
