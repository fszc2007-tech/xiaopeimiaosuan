#!/bin/bash

# ADB 安装脚本
# 如果 Homebrew 安装失败，可以使用此脚本手动安装

set -e

echo "开始安装 ADB..."

# 方法1: 尝试使用 Homebrew（推荐）
if command -v brew &> /dev/null; then
    echo "尝试使用 Homebrew 安装..."
    if brew install android-platform-tools; then
        echo "✅ ADB 安装成功！"
        adb version
        exit 0
    else
        echo "⚠️  Homebrew 安装失败，尝试手动安装..."
    fi
fi

# 方法2: 手动下载安装
INSTALL_DIR="$HOME/.local/bin"
PLATFORM_TOOLS_DIR="$HOME/.local/platform-tools"
TEMP_DIR="/tmp/platform-tools-install"

echo "创建安装目录..."
mkdir -p "$INSTALL_DIR"
mkdir -p "$PLATFORM_TOOLS_DIR"
mkdir -p "$TEMP_DIR"

cd "$TEMP_DIR"

# 尝试多个下载源
echo "尝试下载 Android Platform Tools..."

# 源1: 官方源（可能需要代理）
if curl -L -o platform-tools.zip "https://dl.google.com/android/repository/platform-tools-latest-darwin.zip" --progress-bar 2>/dev/null; then
    echo "✅ 从官方源下载成功"
elif curl -L -o platform-tools.zip "https://developer.android.com/studio/releases/platform-tools" --progress-bar 2>/dev/null; then
    echo "✅ 从备用源下载成功"
else
    echo "❌ 自动下载失败"
    echo ""
    echo "请手动执行以下步骤："
    echo "1. 访问: https://developer.android.com/studio/releases/platform-tools"
    echo "2. 下载 macOS 版本的 platform-tools"
    echo "3. 解压到: $PLATFORM_TOOLS_DIR"
    echo "4. 运行: ln -s $PLATFORM_TOOLS_DIR/platform-tools/adb $INSTALL_DIR/adb"
    echo "5. 运行: echo 'export PATH=\"\$HOME/.local/bin:\$PATH\"' >> ~/.zshrc"
    echo "6. 运行: source ~/.zshrc"
    exit 1
fi

# 解压
echo "解压文件..."
unzip -q platform-tools.zip -d "$PLATFORM_TOOLS_DIR"

# 创建符号链接
echo "创建符号链接..."
ln -sf "$PLATFORM_TOOLS_DIR/platform-tools/adb" "$INSTALL_DIR/adb"
ln -sf "$PLATFORM_TOOLS_DIR/platform-tools/fastboot" "$INSTALL_DIR/fastboot"

# 添加到 PATH
if ! grep -q "$INSTALL_DIR" ~/.zshrc 2>/dev/null; then
    echo "" >> ~/.zshrc
    echo "# Android Platform Tools" >> ~/.zshrc
    echo "export PATH=\"\$HOME/.local/bin:\$PATH\"" >> ~/.zshrc
    echo "✅ 已添加到 ~/.zshrc"
fi

# 清理临时文件
rm -rf "$TEMP_DIR"

echo ""
echo "✅ ADB 安装完成！"
echo ""
echo "请运行以下命令使 PATH 生效："
echo "  source ~/.zshrc"
echo ""
echo "然后运行以下命令验证安装："
echo "  adb version"

