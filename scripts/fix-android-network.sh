#!/bin/bash

# Android 模拟器网络修复脚本

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "=========================================="
echo "Android 模拟器网络修复"
echo "=========================================="
echo ""

# 检查设备
DEVICE=$(adb devices | grep "device" | grep -v "List" | awk '{print $1}' | head -1)
if [ -z "$DEVICE" ]; then
    echo -e "${RED}❌ 未找到 Android 设备${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 找到设备: $DEVICE${NC}"
echo ""

# 1. 测试基本网络连接
echo "1. 测试网络连接..."
if adb shell ping -c 3 8.8.8.8 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 基本网络连接正常${NC}"
else
    echo -e "${RED}❌ 基本网络连接失败${NC}"
    echo "   可能原因: 模拟器网络配置问题"
fi

# 2. 测试 DNS
echo ""
echo "2. 测试 DNS 解析..."
if adb shell "ping -c 1 google.com" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ DNS 解析正常${NC}"
else
    echo -e "${YELLOW}⚠️  DNS 解析失败${NC}"
    echo "   尝试修复 DNS..."
    adb shell "setprop net.dns1 8.8.8.8"
    adb shell "setprop net.dns2 8.8.4.4"
    echo "   已设置 DNS 为 Google DNS (8.8.8.8, 8.8.4.4)"
fi

# 3. 检查代理设置
echo ""
echo "3. 检查代理设置..."
PROXY=$(adb shell "settings get global http_proxy" 2>/dev/null | tr -d '\r')
if [ -z "$PROXY" ] || [ "$PROXY" = "null" ]; then
    echo -e "${GREEN}✅ 未配置代理（正常）${NC}"
else
    echo -e "${YELLOW}⚠️  检测到代理设置: $PROXY${NC}"
    echo "   如果需要清除代理，运行:"
    echo "   adb shell settings put global http_proxy :0"
fi

# 4. 检查网络接口
echo ""
echo "4. 检查网络接口..."
adb shell "ip addr show" 2>/dev/null | grep -E "inet |state" | head -5

# 5. 测试 Play Store 连接
echo ""
echo "5. 测试 Play Store 连接..."
if adb shell "ping -c 1 play.google.com" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 可以访问 Play Store${NC}"
else
    echo -e "${YELLOW}⚠️  无法访问 Play Store${NC}"
fi

echo ""
echo "=========================================="
echo "修复建议"
echo "=========================================="
echo ""

# 提供修复建议
echo "如果网络仍然有问题，尝试以下方法："
echo ""
echo "方法 1: 重启模拟器"
echo "----------------------------------------"
echo "1. 关闭模拟器"
echo "2. 重新启动: emulator -avd Medium_Phone_API_36.1"
echo ""

echo "方法 2: 清除代理设置"
echo "----------------------------------------"
echo "adb shell settings put global http_proxy :0"
echo ""

echo "方法 3: 设置 DNS"
echo "----------------------------------------"
echo "adb shell 'setprop net.dns1 8.8.8.8'"
echo "adb shell 'setprop net.dns2 8.8.4.4'"
echo ""

echo "方法 4: 检查 Android Studio 代理设置"
echo "----------------------------------------"
echo "1. 打开 Android Studio"
echo "2. Preferences → Appearance & Behavior → System Settings → HTTP Proxy"
echo "3. 选择 'No proxy' 或配置正确的代理"
echo ""

echo "方法 5: 使用手机热点"
echo "----------------------------------------"
echo "如果 Wi-Fi 有问题，可以使用手机热点"
echo ""

