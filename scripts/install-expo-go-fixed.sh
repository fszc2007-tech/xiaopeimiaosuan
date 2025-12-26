#!/bin/bash

# 修复版的 Expo Go 安装脚本（多个下载源）

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "=========================================="
echo "Expo Go 安装脚本（多源下载）"
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

# 多个下载源
APK_SOURCES=(
    "https://github.com/expo/expo/releases/download/v2.28.10/Exponent-2.28.10.apk"
    "https://d1a1f0psnxq1cc.cloudfront.net/Exponent-2.28.10.apk"
    "https://exp.host/--/api/v2/versions/download/android/2.28.10"
)

APK_PATH="/tmp/expo-go.apk"

echo "尝试下载 Expo Go APK..."
echo ""

# 尝试每个下载源
for i in "${!APK_SOURCES[@]}"; do
    URL="${APK_SOURCES[$i]}"
    SOURCE_NUM=$((i + 1))
    
    echo "尝试源 $SOURCE_NUM/${#APK_SOURCES[@]}: $URL"
    
    if curl -L -o "$APK_PATH" "$URL" --progress-bar --connect-timeout 10 --max-time 300 2>&1 | grep -q "100"; then
        if [ -f "$APK_PATH" ] && [ -s "$APK_PATH" ]; then
            FILE_SIZE=$(stat -f%z "$APK_PATH" 2>/dev/null || stat -c%s "$APK_PATH" 2>/dev/null || echo "0")
            if [ "$FILE_SIZE" -gt 1000000 ]; then
                echo -e "${GREEN}✅ 下载成功！文件大小: $(echo "scale=2; $FILE_SIZE / 1024 / 1024" | bc) MB${NC}"
                echo ""
                
                echo "安装 APK..."
                if adb install -r "$APK_PATH" 2>&1 | grep -q "Success"; then
                    echo -e "${GREEN}✅ 安装成功！${NC}"
                    echo ""
                    echo "打开 Expo Go..."
                    sleep 2
                    adb shell am start -n host.exp.exponent/.experience.HomeActivity
                    exit 0
                else
                    echo -e "${RED}❌ 安装失败${NC}"
                    echo "尝试手动安装: adb install $APK_PATH"
                fi
                break
            fi
        fi
    fi
    
    echo -e "${YELLOW}⚠️  源 $SOURCE_NUM 下载失败，尝试下一个...${NC}"
    echo ""
done

# 如果所有源都失败
if [ ! -f "$APK_PATH" ] || [ ! -s "$APK_PATH" ]; then
    echo -e "${RED}❌ 所有下载源都失败${NC}"
    echo ""
    echo "=========================================="
    echo "替代方案"
    echo "=========================================="
    echo ""
    echo "方法 1: 通过 Play Store 安装（推荐）"
    echo "----------------------------------------"
    echo "1. 在模拟器中打开 Play Store"
    echo "2. 搜索 'Expo Go'"
    echo "3. 点击 'Install'"
    echo "4. 等待安装完成"
    echo ""
    echo "方法 2: 手动下载 APK"
    echo "----------------------------------------"
    echo "1. 在浏览器中访问: https://expo.dev/tools"
    echo "2. 下载 Expo Go APK"
    echo "3. 运行: adb install <下载的apk路径>"
    echo ""
    echo "方法 3: 使用 Expo CLI 自动安装"
    echo "----------------------------------------"
    echo "在 Expo 终端中按 'a' 键，让 Expo 自动处理"
    echo ""
    exit 1
fi
