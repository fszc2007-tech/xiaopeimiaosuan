#!/bin/bash

# Android Studio AVD 自动设置脚本
# 此脚本会在 Android Studio 完成初始设置后，帮助创建 AVD

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "=========================================="
echo "Android Studio AVD 设置助手"
echo "=========================================="
echo ""

# 检查 Android Studio 是否已安装
if [ ! -d "/Applications/Android Studio.app" ]; then
    echo -e "${RED}❌ Android Studio 未安装${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Android Studio 已安装${NC}"
echo ""

# 检查 SDK
SDK_PATH="$HOME/Library/Android/sdk"
if [ -d "$SDK_PATH" ]; then
    echo -e "${GREEN}✅ Android SDK 已安装${NC}"
    echo "   SDK 路径: $SDK_PATH"
    
    # 检查 SDK 组件
    if [ -d "$SDK_PATH/platform-tools" ]; then
        echo -e "${GREEN}✅ Platform Tools 已安装${NC}"
    else
        echo -e "${YELLOW}⚠️  Platform Tools 未安装${NC}"
    fi
    
    if [ -d "$SDK_PATH/emulator" ]; then
        echo -e "${GREEN}✅ Emulator 已安装${NC}"
    else
        echo -e "${YELLOW}⚠️  Emulator 未安装${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Android SDK 尚未安装${NC}"
    echo ""
    echo "请先完成 Android Studio 的初始设置："
    echo "1. 打开 Android Studio"
    echo "2. 选择 'Standard' 安装类型"
    echo "3. 接受许可协议"
    echo "4. 等待 SDK 下载完成"
    echo ""
    exit 1
fi

echo ""

# 检查 AVD
echo "检查现有的 AVD..."
AVD_LIST=$(emulator -list-avds 2>/dev/null || echo "")
if [ -n "$AVD_LIST" ]; then
    echo -e "${GREEN}✅ 找到以下 AVD:${NC}"
    echo "$AVD_LIST" | while read avd; do
        echo "   - $avd"
    done
    echo ""
    echo "可以使用以下命令启动："
    echo "$AVD_LIST" | while read avd; do
        echo "   emulator -avd $avd"
    done
else
    echo -e "${YELLOW}⚠️  尚未创建 AVD${NC}"
    echo ""
    echo "=========================================="
    echo "创建 AVD 指南"
    echo "=========================================="
    echo ""
    echo "由于 AVD 创建需要图形界面操作，请按以下步骤："
    echo ""
    echo "1. 打开 Android Studio"
    echo "2. 点击右上角 'More Actions' → 'Virtual Device Manager'"
    echo "   或者：菜单栏 'Tools' → 'Device Manager'"
    echo ""
    echo "3. 点击 'Create Device' 按钮"
    echo ""
    echo "4. 选择设备型号（推荐）："
    echo "   - Pixel 5（推荐，性能好）"
    echo "   - Pixel 6"
    echo "   - Pixel 7"
    echo ""
    echo "5. 选择系统镜像（推荐）："
    echo "   - Android 13 (Tiramisu) - API 33"
    echo "   - Android 14 (UpsideDownCake) - API 34"
    echo "   如果没有，点击 'Download' 下载"
    echo ""
    echo "6. 点击 'Next' → 'Finish'"
    echo ""
    echo "创建完成后，运行此脚本验证："
    echo "   ./scripts/setup-android-avd.sh"
    echo ""
fi

echo ""
echo "=========================================="
echo "环境变量检查"
echo "=========================================="
echo ""

if [ -n "$ANDROID_HOME" ]; then
    echo -e "${GREEN}✅ ANDROID_HOME: $ANDROID_HOME${NC}"
else
    echo -e "${YELLOW}⚠️  ANDROID_HOME 未设置${NC}"
    echo "运行以下命令设置："
    echo "   source ~/.zshrc"
fi

if command -v adb &> /dev/null; then
    echo -e "${GREEN}✅ ADB 可用${NC}"
    echo "   版本: $(adb version | head -n 1)"
else
    echo -e "${YELLOW}⚠️  ADB 不可用${NC}"
fi

if command -v emulator &> /dev/null; then
    echo -e "${GREEN}✅ Emulator 命令可用${NC}"
else
    echo -e "${YELLOW}⚠️  Emulator 命令不可用${NC}"
    echo "   请确保已安装 Android SDK Emulator"
fi

echo ""
echo "=========================================="
