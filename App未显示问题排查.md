# App 未显示问题排查指南

## 🔍 当前状态检查

✅ **模拟器**: 已连接 (emulator-5554)  
✅ **Expo 服务器**: 运行中 (localhost:8081)  
❓ **App**: 未显示

---

## 🎯 解决方案

### 方案 1: 在 Expo 终端按 'a' 键（最简单）

1. **找到运行 Expo 的终端窗口**
   - 应该显示二维码和菜单选项
   - 如果找不到，运行: `cd app && npx expo start --clear`

2. **按 `a` 键**
   - Expo 会自动：
     - 检测 Android 模拟器
     - 安装 Expo Go（如果需要）
     - 启动 App

### 方案 2: 手动安装 Expo Go

如果方案 1 不工作：

1. **在模拟器中打开 Google Play Store**
   - 点击模拟器窗口
   - 找到 Play Store 图标

2. **搜索并安装 Expo Go**
   - 搜索: "Expo Go"
   - 点击安装

3. **打开 Expo Go**
   - 点击 Expo Go 图标

4. **连接开发服务器**
   - 扫描 Expo 终端中的二维码
   - 或者点击 "Enter URL manually"
   - 输入: `exp://localhost:8081`
   - 点击 "Connect"

### 方案 3: 检查 Expo 终端

如果看不到 Expo 终端：

```bash
# 1. 进入 app 目录
cd /Users/gaoxuxu/Desktop/xiaopei-app/app

# 2. 启动 Expo（会显示二维码）
npx expo start --clear
```

然后：
- 等待二维码出现
- 按 `a` 键连接 Android 模拟器

### 方案 4: 使用 adb 手动触发

```bash
# 检查设备
adb devices

# 打开 Expo Go（如果已安装）
adb shell am start -n host.exp.exponent/.experience.HomeActivity

# 或者打开浏览器访问
adb shell am start -a android.intent.action.VIEW -d "exp://localhost:8081"
```

---

## 🔧 详细排查步骤

### 步骤 1: 确认模拟器完全启动

```bash
# 检查设备连接
adb devices

# 应该显示:
# emulator-5554    device
```

### 步骤 2: 确认 Expo 运行

```bash
# 检查 Expo 状态
curl http://localhost:8081/status

# 应该显示: packager-status:running
```

### 步骤 3: 检查 Expo Go 是否安装

```bash
# 检查已安装的包
adb shell pm list packages | grep expo

# 如果为空，需要安装 Expo Go
```

### 步骤 4: 查看 Expo 日志

```bash
# 查看 Expo 输出
# 在运行 Expo 的终端中查看错误信息
```

---

## ⚠️ 常见问题

### Q: 按 'a' 键没有反应

**A**: 
1. 确保焦点在 Expo 终端窗口
2. 确保 Expo 完全启动（看到二维码）
3. 尝试重新启动 Expo: `npx expo start --clear`

### Q: 提示 "No devices found"

**A**: 
1. 确认模拟器完全启动（看到主屏幕）
2. 运行 `adb devices` 确认连接
3. 重启 ADB: `adb kill-server && adb start-server`

### Q: Expo Go 无法连接

**A**: 
1. 确认 Expo 服务器运行: `curl http://localhost:8081/status`
2. 检查防火墙设置
3. 尝试使用 IP 地址而不是 localhost

---

## 🚀 快速修复命令

```bash
# 1. 重启 ADB
adb kill-server
adb start-server
adb devices

# 2. 重启 Expo
cd /Users/gaoxuxu/Desktop/xiaopei-app/app
npx expo start --clear

# 3. 在 Expo 终端按 'a' 键
```

---

**最可能的原因**: 需要在 Expo 终端中按 'a' 键来触发连接。

**如果还是不行**: 手动安装 Expo Go 并手动连接。
