# Android 模拟器网络问题修复指南

## 🔍 问题诊断

如果 Android 模拟器无法连接网络，可能的原因：

1. **DNS 配置问题**
2. **代理设置问题**
3. **网络接口问题**
4. **防火墙阻止**
5. **Android Studio 代理配置**

---

## 🚀 快速修复方法

### 方法 1: 设置 DNS（最常见）

```bash
# 设置 Google DNS
adb shell "setprop net.dns1 8.8.8.8"
adb shell "setprop net.dns2 8.8.4.4"

# 验证
adb shell ping -c 3 google.com
```

### 方法 2: 清除代理设置

```bash
# 清除代理
adb shell settings put global http_proxy :0

# 验证
adb shell settings get global http_proxy
```

### 方法 3: 重启模拟器

```bash
# 关闭模拟器
# 然后重新启动
emulator -avd Medium_Phone_API_36.1
```

### 方法 4: 检查 Android Studio 代理设置

1. **打开 Android Studio**
2. **Preferences** → **Appearance & Behavior** → **System Settings** → **HTTP Proxy**
3. **选择 "No proxy"**（如果不需要代理）
4. **或者配置正确的代理**（如果需要）

---

## 🔧 详细修复步骤

### 步骤 1: 运行网络诊断脚本

```bash
cd /Users/gaoxuxu/Desktop/xiaopei-app
./scripts/fix-android-network.sh
```

脚本会：
- 测试网络连接
- 检查 DNS 设置
- 检查代理配置
- 提供修复建议

### 步骤 2: 手动修复 DNS

如果 DNS 有问题：

```bash
# 设置 DNS
adb shell "setprop net.dns1 8.8.8.8"
adb shell "setprop net.dns2 8.8.4.4"

# 或者使用 Cloudflare DNS
adb shell "setprop net.dns1 1.1.1.1"
adb shell "setprop net.dns2 1.0.0.1"
```

### 步骤 3: 清除代理

如果代理设置有问题：

```bash
# 清除 HTTP 代理
adb shell settings put global http_proxy :0

# 清除 HTTPS 代理
adb shell settings put global https_proxy :0

# 清除所有代理
adb shell settings delete global http_proxy
adb shell settings delete global https_proxy
```

### 步骤 4: 重启网络服务

```bash
# 重启网络接口
adb shell "svc wifi disable && svc wifi enable"
```

---

## 🎯 针对 Play Store 无法连接

如果 Play Store 无法打开或下载很慢：

### 方法 1: 清除 Play Store 缓存

```bash
adb shell pm clear com.android.vending
```

### 方法 2: 重置网络设置

```bash
# 重置网络设置（需要 root 权限）
adb root
adb shell "settings put global airplane_mode_on 1"
adb shell "settings put global airplane_mode_on 0"
```

### 方法 3: 使用手机热点

如果 Wi-Fi 有问题：
1. 打开手机热点
2. 在 Mac 上连接到热点
3. 模拟器会自动使用 Mac 的网络

---

## ⚠️ 常见问题

### Q: 模拟器可以 ping 通 IP，但无法访问域名

**A**: DNS 问题，设置 DNS：
```bash
adb shell "setprop net.dns1 8.8.8.8"
```

### Q: Play Store 一直加载

**A**: 
1. 清除 Play Store 缓存
2. 检查代理设置
3. 重启模拟器

### Q: 网络时好时坏

**A**: 
1. 检查 Mac 的网络连接
2. 重启模拟器
3. 检查防火墙设置

---

## 📋 完整修复流程

```bash
# 1. 运行诊断脚本
./scripts/fix-android-network.sh

# 2. 设置 DNS
adb shell "setprop net.dns1 8.8.8.8"
adb shell "setprop net.dns2 8.8.4.4"

# 3. 清除代理
adb shell settings put global http_proxy :0

# 4. 测试连接
adb shell ping -c 3 google.com

# 5. 如果还不行，重启模拟器
```

---

## 🎯 推荐操作

**最快的方法**:

1. **运行修复脚本**:
   ```bash
   ./scripts/fix-android-network.sh
   ```

2. **设置 DNS**:
   ```bash
   adb shell "setprop net.dns1 8.8.8.8"
   adb shell "setprop net.dns2 8.8.4.4"
   ```

3. **测试连接**:
   ```bash
   adb shell ping -c 3 google.com
   ```

4. **如果还不行，重启模拟器**

---

**现在运行修复脚本试试！** 🚀
