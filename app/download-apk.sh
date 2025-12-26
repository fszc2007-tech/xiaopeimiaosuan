#!/bin/bash
# 下载 APK 并重命名为"小佩妙算+版本号.apk"

# 获取最新构建的下载链接
BUILD_INFO=$(cd "$(dirname "$0")" && eas build:list --platform android --limit 1 --non-interactive --json 2>/dev/null)

if [ -z "$BUILD_INFO" ]; then
    echo "无法获取构建信息"
    exit 1
fi

# 提取下载链接和版本号
DOWNLOAD_URL=$(echo "$BUILD_INFO" | python3 -c "import sys, json; data = json.load(sys.stdin); builds = data.get('data', []); build = builds[0] if builds else {}; print(build.get('artifacts', {}).get('applicationArchiveUrl', '') or '')" 2>/dev/null)
VERSION=$(echo "$BUILD_INFO" | python3 -c "import sys, json; data = json.load(sys.stdin); builds = data.get('data', []); build = builds[0] if builds else {}; print(build.get('appVersion', '') or '')" 2>/dev/null)

if [ -z "$DOWNLOAD_URL" ]; then
    echo "构建未完成或无法获取下载链接"
    exit 1
fi

# 生成文件名
FILENAME="小佩妙算${VERSION}.apk"

echo "下载链接: $DOWNLOAD_URL"
echo "保存为: $FILENAME"

# 下载文件
curl -L -o "$FILENAME" "$DOWNLOAD_URL"

if [ $? -eq 0 ]; then
    echo "✅ 下载完成: $FILENAME"
else
    echo "❌ 下载失败"
    exit 1
fi

