#!/bin/bash

# 检查 Android Studio 代理设置的脚本

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "=========================================="
echo "Android Studio 代理设置检查"
echo "=========================================="
echo ""

# 检查 Android Studio 是否运行
if ps aux | grep -i "Android Studio" | grep -v grep > /dev/null; then
    echo -e "${GREEN}✅ Android Studio 正在运行${NC}"
else
    echo -e "${YELLOW}⚠️  Android Studio 未运行${NC}"
    echo "正在启动 Android Studio..."
    open /Applications/Android\ Studio.app
    sleep 3
fi

echo ""
echo "=========================================="
echo "代理设置检查步骤"
echo "=========================================="
echo ""
echo "请按照以下步骤检查代理设置："
echo ""
echo "1. 在 Android Studio 中："
echo "   - 点击菜单: Android Studio → Preferences"
echo "   - 或按快捷键: ⌘ + ,"
echo ""
echo "2. 导航到："
echo "   Appearance & Behavior → System Settings → HTTP Proxy"
echo ""
echo "3. 检查设置："
echo "   - 应该选择 'No proxy'（如果不使用代理）"
echo "   - 或者配置正确的代理（如果需要）"
echo ""
echo "4. 点击 'OK' 保存"
echo ""
echo "=========================================="
echo "当前模拟器网络状态"
echo "=========================================="
echo ""

# 检查模拟器
DEVICE=$(adb devices | grep "device" | grep -v "List" | awk '{print $1}' | head -1)
if [ -n "$DEVICE" ]; then
    echo -e "${GREEN}✅ 模拟器已连接: $DEVICE${NC}"
    echo ""
    echo "测试网络连接..."
    if adb shell ping -c 2 google.com > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 网络连接正常${NC}"
    else
        echo -e "${YELLOW}⚠️  网络连接有问题${NC}"
        echo "建议："
        echo "1. 检查 Android Studio 代理设置"
        echo "2. 重启模拟器"
    fi
else
    echo -e "${YELLOW}⚠️  未检测到模拟器${NC}"
    echo "启动模拟器: emulator -avd Medium_Phone_API_36.1"
fi

echo ""
echo "=========================================="
