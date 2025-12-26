#!/bin/bash

# DNS 修复脚本

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "=========================================="
echo "DNS 修复脚本"
echo "=========================================="
echo ""

# 方法 1: 通过设置禁用私有 DNS
echo "方法 1: 禁用私有 DNS..."
adb shell "settings put global private_dns_mode off" 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 已禁用私有 DNS${NC}"
else
    echo -e "${YELLOW}⚠️  无法禁用私有 DNS（可能需要 root）${NC}"
fi

# 方法 2: 重启网络服务
echo ""
echo "方法 2: 重启网络服务..."
adb shell "svc wifi disable" 2>/dev/null
sleep 2
adb shell "svc wifi enable" 2>/dev/null
echo "已重启 Wi-Fi 服务"

# 方法 3: 测试连接
echo ""
echo "方法 3: 测试 DNS 解析..."
sleep 3
if adb shell "ping -c 2 google.com" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ DNS 解析成功！${NC}"
else
    echo -e "${YELLOW}⚠️  DNS 解析仍然失败${NC}"
    echo ""
    echo "建议："
    echo "1. 重启模拟器"
    echo "2. 检查 Mac 的网络连接"
    echo "3. 尝试使用手机热点"
fi

echo ""
echo "=========================================="
