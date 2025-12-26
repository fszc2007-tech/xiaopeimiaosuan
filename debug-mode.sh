#!/bin/bash

# 调试模式脚本
# 同时监控前端 App 日志和后端服务日志

export PATH="$HOME/.local/bin:$PATH"

echo "=========================================="
echo "小佩妙算 App 调试模式"
echo "=========================================="
echo ""
echo "监控内容："
echo "  1. 前端 App 日志（React Native）"
echo "  2. 短信验证相关日志"
echo "  3. 用户协议/PDF 加载日志"
echo "  4. API 请求和错误日志"
echo ""
echo "提示："
echo "  - 请在手机上操作 App"
echo "  - 日志会实时显示"
echo "  - 按 Ctrl+C 停止监控"
echo ""
echo "=========================================="
echo ""

# 检查设备连接
if ! adb devices | grep -q "device$"; then
    echo "❌ 未检测到设备，请连接手机并开启 USB 调试"
    exit 1
fi

echo "✅ 设备已连接"
echo ""

# 清空日志
adb logcat -c
echo "✅ 日志已清空"
echo ""

# 启动详细日志监控
echo "开始监控日志..."
echo ""

adb logcat -v time \
  ReactNativeJS:V \
  smsService:V \
  Auth:V \
  WebView:V \
  chromium:V \
  *:E | grep -E "SMS|sms|短信|验证码|Policy|PDF|协议|WebView|Error|ERROR|Exception|EXCEPTION|Failed|FAILED|DIAGNOSTIC|ENV|API|Google|Login" --color=always

