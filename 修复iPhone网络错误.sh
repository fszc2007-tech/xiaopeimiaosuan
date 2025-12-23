#!/bin/bash

echo "🔧 ========== 修复 iPhone 网络错误 =========="
echo ""

# 1. 获取当前 IP
echo "1️⃣ 检测当前电脑 IP 地址..."
CURRENT_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')
echo "   当前 IP: $CURRENT_IP"
echo ""

# 2. 检查 Core 服务
echo "2️⃣ 检查 Core 服务状态..."
if lsof -i :3000 | grep -q LISTEN; then
    echo "   ✅ Core 服务正在运行 (端口 3000)"
    
    # 测试连接
    if curl -s -m 3 "http://$CURRENT_IP:3000/health" > /dev/null 2>&1; then
        echo "   ✅ Core 服务可以访问"
    else
        echo "   ⚠️  Core 服务无法通过 $CURRENT_IP 访问"
        echo "   请检查防火墙设置"
    fi
else
    echo "   ❌ Core 服务未运行"
    echo "   请先启动 Core 服务: cd core && npm run dev"
    exit 1
fi
echo ""

# 3. 检查 Expo 服务
echo "3️⃣ 检查 Expo 服务状态..."
if ps aux | grep -i "expo start" | grep -v grep > /dev/null; then
    echo "   ✅ Expo 服务正在运行"
else
    echo "   ⚠️  Expo 服务未运行"
    echo "   正在启动 Expo..."
    cd app
    npx expo start --clear &
    sleep 3
    echo "   ✅ Expo 服务已启动"
fi
echo ""

# 4. 显示配置信息
echo "4️⃣ 当前配置信息："
echo "   API Base URL: http://$CURRENT_IP:3000"
echo "   环境变量: EXPO_PUBLIC_API_BASE_URL=${EXPO_PUBLIC_API_BASE_URL:-未设置}"
echo ""

# 5. 提示用户操作
echo "📱 ========== 请在 iPhone 上执行以下操作 =========="
echo ""
echo "   方法 1：完全重新加载（推荐）"
echo "   1. 摇动 iPhone 或按 Cmd + D（如果使用模拟器）"
echo "   2. 选择 'Reload' 或按 Cmd + R"
echo ""
echo "   方法 2：完全重启应用"
echo "   1. 完全关闭 Expo Go（从多任务中划掉）"
echo "   2. 重新打开 Expo Go"
echo "   3. 扫描终端中的二维码或输入 URL"
echo ""
echo "   方法 3：清除缓存后重新加载"
echo "   1. 摇动 iPhone → 选择 'Settings'"
echo "   2. 选择 'Clear cache'"
echo "   3. 返回并选择 'Reload'"
echo ""
echo "🔍 ========== 调试信息 =========="
echo ""
echo "   在 iPhone 的控制台（Expo Dev Tools）中，你应该看到："
echo "   [API Client] 🔗 当前 API Base URL: http://$CURRENT_IP:3000"
echo ""
echo "   如果看到的是其他 IP（如 172.20.10.2），说明："
echo "   1. 应用需要完全重新加载"
echo "   2. 或者需要重启 Expo 服务"
echo ""
echo "✅ 修复完成！请按照上述步骤在 iPhone 上重新加载应用。"
echo ""





