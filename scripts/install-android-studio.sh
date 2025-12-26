#!/bin/bash

# Android Studio 安装和配置脚本
# 此脚本会：
# 1. 检查 Android Studio 是否已安装
# 2. 自动配置环境变量
# 3. 验证 Android SDK 和工具
# 4. 提供安装指导（如果需要）

set -e

echo "=========================================="
echo "Android Studio 安装和配置脚本"
echo "=========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查函数
check_command() {
    if command -v "$1" &> /dev/null; then
        echo -e "${GREEN}✅ $1 已安装${NC}"
        return 0
    else
        echo -e "${RED}❌ $1 未安装${NC}"
        return 1
    fi
}

# 步骤 1: 检查 Android Studio 是否已安装
echo "步骤 1: 检查 Android Studio 安装状态..."
echo "----------------------------------------"

ANDROID_STUDIO_PATH="/Applications/Android Studio.app"
if [ -d "$ANDROID_STUDIO_PATH" ]; then
    echo -e "${GREEN}✅ Android Studio 已安装在: $ANDROID_STUDIO_PATH${NC}"
    ANDROID_STUDIO_INSTALLED=true
else
    echo -e "${YELLOW}⚠️  Android Studio 未找到${NC}"
    ANDROID_STUDIO_INSTALLED=false
fi

# 步骤 2: 检查 Android SDK
echo ""
echo "步骤 2: 检查 Android SDK..."
echo "----------------------------------------"

# 默认 SDK 路径
DEFAULT_SDK_PATH="$HOME/Library/Android/sdk"
SDK_PATH=""

# 检查环境变量
if [ -n "$ANDROID_HOME" ]; then
    SDK_PATH="$ANDROID_HOME"
    echo -e "${GREEN}✅ 找到 ANDROID_HOME: $SDK_PATH${NC}"
elif [ -d "$DEFAULT_SDK_PATH" ]; then
    SDK_PATH="$DEFAULT_SDK_PATH"
    echo -e "${GREEN}✅ 找到默认 SDK 路径: $SDK_PATH${NC}"
else
    echo -e "${YELLOW}⚠️  未找到 Android SDK${NC}"
    SDK_PATH="$DEFAULT_SDK_PATH"
fi

# 步骤 3: 配置环境变量
echo ""
echo "步骤 3: 配置环境变量..."
echo "----------------------------------------"

ZSHRC_FILE="$HOME/.zshrc"
BASH_PROFILE_FILE="$HOME/.bash_profile"

# 检查并添加环境变量
configure_env() {
    local config_file=$1
    
    if [ ! -f "$config_file" ]; then
        touch "$config_file"
        echo "创建配置文件: $config_file"
    fi
    
    # 检查是否已存在 Android 配置
    if grep -q "ANDROID_HOME" "$config_file" 2>/dev/null; then
        echo -e "${YELLOW}⚠️  环境变量已存在于 $config_file，跳过添加${NC}"
        echo "如果路径不正确，请手动编辑: $config_file"
        return 0
    fi
    
    # 添加 Android 环境变量
    echo "" >> "$config_file"
    echo "# Android SDK Configuration" >> "$config_file"
    echo "# Added by Android Studio installation script" >> "$config_file"
    echo "export ANDROID_HOME=\"$SDK_PATH\"" >> "$config_file"
    echo "export PATH=\"\$PATH:\$ANDROID_HOME/emulator\"" >> "$config_file"
    echo "export PATH=\"\$PATH:\$ANDROID_HOME/platform-tools\"" >> "$config_file"
    echo "export PATH=\"\$PATH:\$ANDROID_HOME/tools\"" >> "$config_file"
    echo "export PATH=\"\$PATH:\$ANDROID_HOME/tools/bin\"" >> "$config_file"
    
    echo -e "${GREEN}✅ 已添加环境变量到 $config_file${NC}"
    return 0
}

# 配置 zsh
if [ -f "$ZSHRC_FILE" ] || [ -n "$ZSH_VERSION" ]; then
    configure_env "$ZSHRC_FILE"
fi

# 配置 bash
if [ -f "$BASH_PROFILE_FILE" ] || [ -n "$BASH_VERSION" ]; then
    configure_env "$BASH_PROFILE_FILE"
fi

# 临时导出环境变量（当前会话）
export ANDROID_HOME="$SDK_PATH"
export PATH="$PATH:$ANDROID_HOME/emulator"
export PATH="$PATH:$ANDROID_HOME/platform-tools"
export PATH="$PATH:$ANDROID_HOME/tools"
export PATH="$PATH:$ANDROID_HOME/tools/bin"

echo -e "${GREEN}✅ 环境变量已配置${NC}"

# 步骤 4: 验证工具
echo ""
echo "步骤 4: 验证 Android 工具..."
echo "----------------------------------------"

# 检查 adb
if check_command "adb"; then
    echo "  ADB 版本: $(adb version | head -n 1)"
else
    echo -e "${YELLOW}⚠️  ADB 未找到，可能需要安装 Android SDK Platform Tools${NC}"
fi

# 检查 emulator
if check_command "emulator"; then
    echo -e "${GREEN}✅ 模拟器工具已安装${NC}"
    # 列出 AVD
    if [ -d "$SDK_PATH/emulator" ]; then
        echo ""
        echo "已创建的 AVD:"
        emulator -list-avds 2>/dev/null || echo "  (暂无 AVD)"
    fi
else
    echo -e "${YELLOW}⚠️  模拟器工具未找到${NC}"
fi

# 检查 sdkmanager
if [ -f "$SDK_PATH/cmdline-tools/latest/bin/sdkmanager" ] || [ -f "$SDK_PATH/tools/bin/sdkmanager" ]; then
    echo -e "${GREEN}✅ SDK Manager 已安装${NC}"
else
    echo -e "${YELLOW}⚠️  SDK Manager 未找到${NC}"
fi

# 步骤 5: 检查 Java (Android Studio 需要)
echo ""
echo "步骤 5: 检查 Java 环境..."
echo "----------------------------------------"

if check_command "java"; then
    JAVA_VERSION=$(java -version 2>&1 | head -n 1)
    echo "  $JAVA_VERSION"
else
    echo -e "${YELLOW}⚠️  Java 未安装，Android Studio 需要 Java${NC}"
    echo "  建议安装: brew install openjdk@17"
fi

# 步骤 6: 总结和建议
echo ""
echo "=========================================="
echo "安装状态总结"
echo "=========================================="
echo ""

if [ "$ANDROID_STUDIO_INSTALLED" = true ]; then
    echo -e "${GREEN}✅ Android Studio: 已安装${NC}"
else
    echo -e "${RED}❌ Android Studio: 未安装${NC}"
    echo ""
    echo "请执行以下步骤手动安装 Android Studio:"
    echo "1. 访问: https://developer.android.com/studio"
    echo "2. 下载 macOS 版本 (.dmg 文件)"
    echo "3. 打开 .dmg 文件，将 Android Studio 拖到 Applications 文件夹"
    echo "4. 打开 Android Studio，按照向导完成初始设置"
    echo "5. 在 Android Studio 中创建 Android Virtual Device (AVD)"
    echo ""
fi

if [ -d "$SDK_PATH" ] && [ -d "$SDK_PATH/platform-tools" ]; then
    echo -e "${GREEN}✅ Android SDK: 已安装${NC}"
    echo "  SDK 路径: $SDK_PATH"
else
    echo -e "${YELLOW}⚠️  Android SDK: 未完全安装${NC}"
    echo "  如果已安装 Android Studio，请打开它并完成 SDK 下载"
fi

echo ""
echo "=========================================="
echo "下一步操作"
echo "=========================================="
echo ""

echo "1. 重新加载 shell 配置:"
echo "   source ~/.zshrc"
echo ""

echo "2. 验证环境变量:"
echo "   echo \$ANDROID_HOME"
echo ""

echo "3. 如果 Android Studio 已安装，创建 AVD:"
echo "   - 打开 Android Studio"
echo "   - 点击 'More Actions' → 'Virtual Device Manager'"
echo "   - 点击 'Create Device'"
echo "   - 选择设备型号和系统镜像"
echo ""

echo "4. 启动模拟器（创建 AVD 后）:"
echo "   emulator -avd <你的AVD名称>"
echo ""

echo "5. 在 Expo 项目中使用:"
echo "   cd app"
echo "   npx expo start"
echo "   然后按 'a' 键启动 Android 模拟器"
echo ""

echo "=========================================="
echo "脚本执行完成！"
echo "=========================================="

