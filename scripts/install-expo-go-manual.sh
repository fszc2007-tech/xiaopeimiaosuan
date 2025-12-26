#!/bin/bash

# 手动安装 Expo Go 的脚本

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "=========================================="
echo "手动安装 Expo Go"
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

# 检查是否已安装
if adb shell pm list packages | grep -q "host.exp.exponent"; then
    echo -e "${GREEN}✅ Expo Go 已安装${NC}"
    echo ""
    echo "打开 Expo Go..."
    adb shell am start -n host.exp.exponent/.experience.HomeActivity
    exit 0
fi

echo -e "${YELLOW}⚠️  Expo Go 未安装${NC}"
echo ""

# 方法 1: 通过 Play Store
echo "方法 1: 通过 Play Store 安装（推荐）"
echo "----------------------------------------"
echo "1. 在模拟器中打开 Play Store"
echo "2. 搜索 'Expo Go'"
echo "3. 点击 'Install'"
echo "4. 等待安装完成"
echo ""

# 方法 2: 下载并安装 APK
echo "方法 2: 下载 APK 并安装"
echo "----------------------------------------"
read -p "是否要下载 Expo Go APK？(y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    APK_URL="https://d1a1f0psnxq1cc.cloudfront.net/Exponent-2.28.10.apk"
    APK_PATH="/tmp/expo-go.apk"
    
    echo "下载 Expo Go APK..."
    echo "URL: $APK_URL"
    echo ""
    
    if curl -L -o "$APK_PATH" "$APK_URL" --progress-bar; then
        echo -e "${GREEN}✅ 下载完成${NC}"
        echo ""
        echo "安装 APK..."
        if adb install "$APK_PATH"; then
            echo -e "${GREEN}✅ 安装成功！${NC}"
            echo ""
            echo "打开 Expo Go..."
            adb shell am start -n host.exp.exponent/.experience.HomeActivity
        else
            echo -e "${RED}❌ 安装失败${NC}"
        fi
    else
        echo -e "${RED}❌ 下载失败${NC}"
        echo "请检查网络连接"
    fi
fi

echo ""
echo "=========================================="
