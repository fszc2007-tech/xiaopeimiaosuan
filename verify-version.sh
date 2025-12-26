#!/bin/bash

echo "=== 检查设备连接 ==="
adb devices

echo ""
echo "=== 检查包名 ==="
adb shell pm list packages | grep xiaopei

echo ""
echo "=== 检查版本信息 ==="
adb shell dumpsys package tech.dawnai.xiaopei.app | grep -E "versionCode|versionName"

echo ""
echo "=== 开始监控诊断日志（按 Ctrl+C 停止）==="
echo "提示：打开 App 后应该看到诊断日志"
adb logcat -c
adb logcat -v time | grep -E "ENV DIAGNOSTIC|API CLIENT DIAGNOSTIC|SMS REQUEST DIAGNOSTIC|GOOGLE CONFIG DIAGNOSTIC"
