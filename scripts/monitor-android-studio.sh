#!/bin/bash

# Android Studio 安装进度监控脚本
# 每 10 秒检查一次安装状态

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "=========================================="
echo "Android Studio 安装进度监控"
echo "=========================================="
echo ""
echo "按 Ctrl+C 停止监控"
echo ""

CHECK_COUNT=0
INSTALLED=false

while true; do
    CHECK_COUNT=$((CHECK_COUNT + 1))
    TIMESTAMP=$(date '+%H:%M:%S')
    
    echo "[$TIMESTAMP] 检查 #$CHECK_COUNT"
    echo "----------------------------------------"
    
    # 1. 检查进程
    PROCESS_COUNT=$(ps aux | grep -E "brew.*android|curl.*android-studio" | grep -v grep | wc -l | tr -d ' ')
    if [ "$PROCESS_COUNT" -gt 0 ]; then
        echo -e "${BLUE}⏳ 安装进程运行中 ($PROCESS_COUNT 个进程)${NC}"
        
        # 显示进程详情
        ps aux | grep -E "brew.*android|curl.*android-studio" | grep -v grep | head -2 | while read line; do
            echo "  → $(echo $line | awk '{print $11, $12, $13, $14, $15, $16, $17, $18, $19, $20}')"
        done
    else
        echo -e "${YELLOW}⚠️  未检测到安装进程${NC}"
    fi
    
    # 2. 检查是否已安装到 Applications
    if [ -d "/Applications/Android Studio.app" ]; then
        if [ "$INSTALLED" = false ]; then
            echo -e "${GREEN}✅ Android Studio 已安装到 Applications 文件夹！${NC}"
            INSTALLED=true
        else
            echo -e "${GREEN}✅ Android Studio 已安装${NC}"
        fi
        
        # 显示安装信息
        INSTALL_DATE=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M:%S" "/Applications/Android Studio.app")
        echo "  安装时间: $INSTALL_DATE"
        
        # 检查版本
        if [ -f "/Applications/Android Studio.app/Contents/Info.plist" ]; then
            VERSION=$(defaults read "/Applications/Android Studio.app/Contents/Info.plist" CFBundleShortVersionString 2>/dev/null || echo "未知")
            echo "  版本: $VERSION"
        fi
    else
        echo -e "${YELLOW}⏳ 尚未安装到 Applications${NC}"
    fi
    
    # 3. 检查 Homebrew 状态
    if brew list --cask android-studio &>/dev/null; then
        echo -e "${GREEN}✅ Homebrew 显示已安装${NC}"
    else
        echo -e "${YELLOW}⏳ Homebrew 显示未安装${NC}"
    fi
    
    # 4. 检查下载缓存
    DOWNLOAD_FILE=$(find ~/Library/Caches/Homebrew/downloads -name "*android-studio*.dmg" 2>/dev/null | head -1)
    if [ -n "$DOWNLOAD_FILE" ] && [ -f "$DOWNLOAD_FILE" ]; then
        FILE_SIZE=$(ls -lh "$DOWNLOAD_FILE" | awk '{print $5}')
        echo -e "${BLUE}📥 下载文件: $FILE_SIZE${NC}"
        echo "  路径: $DOWNLOAD_FILE"
    else
        echo -e "${YELLOW}⏳ 下载文件尚未出现${NC}"
    fi
    
    # 5. 检查 SDK 目录（如果已安装）
    if [ -d "$HOME/Library/Android/sdk" ]; then
        echo -e "${GREEN}✅ Android SDK 目录存在${NC}"
    else
        echo -e "${YELLOW}⏳ Android SDK 目录不存在（安装后会自动创建）${NC}"
    fi
    
    echo ""
    
    # 如果已安装，停止监控
    if [ "$INSTALLED" = true ] && [ "$PROCESS_COUNT" -eq 0 ]; then
        echo "=========================================="
        echo -e "${GREEN}🎉 安装完成！${NC}"
        echo "=========================================="
        echo ""
        echo "下一步操作："
        echo "1. 打开 Android Studio:"
        echo "   open /Applications/Android\ Studio.app"
        echo ""
        echo "2. 完成初始设置向导"
        echo ""
        echo "3. 创建 Android Virtual Device (AVD)"
        echo ""
        echo "4. 运行安装检查脚本："
        echo "   ./scripts/install-android-studio.sh"
        echo ""
        exit 0
    fi
    
    # 等待 10 秒后再次检查
    echo "等待 10 秒后继续检查..."
    echo ""
    sleep 10
done

