#!/bin/bash

# 网络测试脚本

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "=========================================="
echo "模拟器网络连接测试"
echo "=========================================="
echo ""

# 检查设备
DEVICE=$(adb devices | grep "device" | grep -v "List" | awk '{print $1}' | head -1)
if [ -z "$DEVICE" ]; then
    echo -e "${RED}❌ 未找到 Android 设备${NC}"
    echo "请等待模拟器完全启动..."
    exit 1
fi

echo -e "${GREEN}✅ 找到设备: $DEVICE${NC}"
echo ""

# 测试 1: 基本网络连接（IP）
echo "测试 1: 基本网络连接（ping IP）..."
if adb shell ping -c 3 8.8.8.8 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 基本网络连接正常${NC}"
    RESULT=$(adb shell ping -c 3 8.8.8.8 2>&1 | grep "packet loss" | awk '{print $6}')
    echo "   丢包率: $RESULT"
else
    echo -e "${RED}❌ 基本网络连接失败${NC}"
fi

echo ""

# 测试 2: DNS 解析
echo "测试 2: DNS 解析（ping 域名）..."
if adb shell ping -c 3 google.com > /dev/null 2>&1; then
    echo -e "${GREEN}✅ DNS 解析正常${NC}"
    RESULT=$(adb shell ping -c 3 google.com 2>&1 | grep "packet loss" | awk '{print $6}')
    echo "   丢包率: $RESULT"
else
    echo -e "${RED}❌ DNS 解析失败${NC}"
    echo "   可能原因: DNS 配置问题"
fi

echo ""

# 测试 3: Play Store 连接
echo "测试 3: Play Store 连接..."
if adb shell ping -c 2 play.google.com > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 可以访问 Play Store${NC}"
else
    echo -e "${YELLOW}⚠️  无法访问 Play Store${NC}"
fi

echo ""

# 测试 4: HTTP 连接
echo "测试 4: HTTP 连接..."
if adb shell "curl -s --connect-timeout 5 http://www.google.com" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ HTTP 连接正常${NC}"
else
    echo -e "${YELLOW}⚠️  HTTP 连接失败${NC}"
fi

echo ""

# 总结
echo "=========================================="
echo "测试总结"
echo "=========================================="
echo ""

BASIC=$(adb shell ping -c 1 8.8.8.8 > /dev/null 2>&1 && echo "OK" || echo "FAIL")
DNS=$(adb shell ping -c 1 google.com > /dev/null 2>&1 && echo "OK" || echo "FAIL")
PLAY=$(adb shell ping -c 1 play.google.com > /dev/null 2>&1 && echo "OK" || echo "FAIL")

if [ "$BASIC" = "OK" ] && [ "$DNS" = "OK" ] && [ "$PLAY" = "OK" ]; then
    echo -e "${GREEN}🎉 所有网络测试通过！${NC}"
    echo ""
    echo "现在可以："
    echo "1. 在 Play Store 中安装 Expo Go"
    echo "2. 或者使用 Expo 终端按 'a' 键自动安装"
else
    echo -e "${YELLOW}⚠️  部分测试失败${NC}"
    echo ""
    if [ "$BASIC" != "OK" ]; then
        echo "❌ 基本网络连接失败 - 检查 Mac 网络"
    fi
    if [ "$DNS" != "OK" ]; then
        echo "❌ DNS 解析失败 - 可能需要重启模拟器"
    fi
    if [ "$PLAY" != "OK" ]; then
        echo "⚠️  Play Store 连接失败 - 但可能仍可使用"
    fi
fi

echo ""
