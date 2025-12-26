#!/bin/bash

# 手动连接 Android 模拟器的脚本

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "=========================================="
echo "手动连接 Android 模拟器"
echo "=========================================="
echo ""

# 检查设备
DEVICE=$(adb devices | grep "device" | grep -v "List" | awk '{print $1}' | head -1)
if [ -z "$DEVICE" ]; then
    echo -e "${RED}❌ 未找到 Android 设备${NC}"
    echo "请确保模拟器已启动"
    exit 1
fi

echo -e "${GREEN}✅ 找到设备: $DEVICE${NC}"
echo ""

# 检查 Expo 服务器
if ! curl -s http://localhost:8081/status > /dev/null 2>&1; then
    echo -e "${RED}❌ Expo 开发服务器未运行${NC}"
    echo "请先启动 Expo: cd app && npx expo start"
    exit 1
fi

echo -e "${GREEN}✅ Expo 开发服务器运行中${NC}"
echo ""

# 方法 1: 使用 adb 打开 Expo Go（如果已安装）
echo "方法 1: 尝试打开 Expo Go..."
if adb shell pm list packages | grep -q "host.exp.exponent"; then
    echo -e "${BLUE}📱 检测到 Expo Go 已安装${NC}"
    echo "打开 Expo Go..."
    adb shell am start -n host.exp.exponent/.experience.HomeActivity
    echo ""
    echo "然后在 Expo Go 中："
    echo "1. 点击 'Enter URL manually'"
    echo "2. 输入: exp://localhost:8081"
    echo "3. 点击 'Connect'"
else
    echo -e "${YELLOW}⚠️  Expo Go 未安装${NC}"
    echo ""
    echo "需要先安装 Expo Go："
    echo "1. 在模拟器中打开 Google Play Store"
    echo "2. 搜索 'Expo Go'"
    echo "3. 安装 Expo Go"
    echo ""
    echo "或者使用以下命令安装 APK："
    echo "   adb install <expo-go.apk>"
fi

echo ""

# 方法 2: 直接打开 URL
echo "方法 2: 尝试直接打开开发服务器 URL..."
EXPO_URL="exp://localhost:8081"
echo "URL: $EXPO_URL"
echo ""
echo "在模拟器中："
echo "1. 打开浏览器或 Expo Go"
echo "2. 访问: $EXPO_URL"
echo ""

# 方法 3: 使用 adb 打开浏览器
echo "方法 3: 在模拟器中打开浏览器..."
adb shell am start -a android.intent.action.VIEW -d "$EXPO_URL" 2>/dev/null || echo "无法自动打开浏览器"

echo ""
echo "=========================================="
echo "推荐操作"
echo "=========================================="
echo ""
echo "最简单的方法："
echo "1. 在模拟器中打开 Google Play Store"
echo "2. 搜索并安装 'Expo Go'"
echo "3. 打开 Expo Go"
echo "4. 扫描 Expo 终端中的二维码"
echo "   或者输入: exp://localhost:8081"
echo ""
echo "或者："
echo "1. 找到运行 Expo 的终端窗口"
echo "2. 按 'a' 键（会自动安装并连接）"
echo ""
