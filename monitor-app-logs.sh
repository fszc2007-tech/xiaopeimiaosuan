#!/bin/bash

# 小佩妙算 App 日志监控脚本
# 用于监控短信验证和用户协议相关问题

export PATH="$HOME/.local/bin:$PATH"

echo "=========================================="
echo "小佩妙算 App 日志监控"
echo "=========================================="
echo ""
echo "监控内容："
echo "  1. 短信验证相关日志 (SMS)"
echo "  2. 用户协议/PDF 加载日志 (Policy/PDF)"
echo "  3. API 请求日志 (API)"
echo "  4. 错误日志 (Error)"
echo ""
echo "提示：请在手机上操作 App，日志会实时显示"
echo "按 Ctrl+C 停止监控"
echo ""
echo "=========================================="
echo ""

# 清空日志缓存
adb logcat -c

# 启动日志监控
# 过滤规则：
# - ReactNativeJS: 所有 React Native 日志
# - smsService: 短信服务日志
# - Auth: 认证相关日志
# - WebView: WebView 相关日志（PDF 加载）
# - *:E: 所有错误级别日志
adb logcat -v time \
  ReactNativeJS:V \
  smsService:V \
  Auth:V \
  WebView:V \
  *:E | grep -E "SMS|sms|短信|验证码|Policy|PDF|协议|WebView|Error|ERROR|Exception|EXCEPTION|Failed|FAILED" --color=always
