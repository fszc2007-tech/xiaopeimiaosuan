# Android Studio 代理设置检查步骤

## 🎯 目标

检查并修复 Android Studio 的代理设置，解决模拟器网络连接问题。

---

## 📋 操作步骤

### 步骤 1: 打开 Android Studio

Android Studio 应该已经打开了。

### 步骤 2: 打开代理设置

1. 点击菜单栏：**Android Studio** → **Preferences**
   - 或者按快捷键：`⌘ + ,` (Command + 逗号)

2. 在左侧菜单中，展开：**Appearance & Behavior**

3. 点击：**System Settings**

4. 点击：**HTTP Proxy**

### 步骤 3: 检查代理设置

在 HTTP Proxy 窗口中，你会看到三个选项：

1. **No proxy** - 不使用代理（推荐）
2. **Auto-detect proxy settings** - 自动检测代理
3. **Manual proxy configuration** - 手动配置代理

### 步骤 4: 选择 "No proxy"

1. **选择 "No proxy"**（如果还没有选择）
2. 点击 **"OK"** 或 **"Apply"**
3. 如果提示重启，点击 **"Restart"**

---

## ✅ 验证设置

设置完成后：

1. **重启模拟器**（如果正在运行）
   ```bash
   # 关闭模拟器
   adb emu kill
   
   # 重新启动
   emulator -avd Medium_Phone_API_36.1
   ```

2. **测试网络连接**
   ```bash
   adb shell ping -c 3 google.com
   ```

---

## 🎯 如果仍然有问题

### 方法 1: 清除 Android Studio 缓存

1. **关闭 Android Studio**
2. 删除缓存：
   ```bash
   rm -rf ~/Library/Caches/Google/AndroidStudio*
   ```
3. 重新打开 Android Studio

### 方法 2: 检查系统代理设置

Mac 系统代理设置可能影响 Android Studio：

1. 打开 **系统设置** → **网络**
2. 选择当前网络
3. 点击 **高级** → **代理**
4. 检查代理设置

### 方法 3: 使用手机热点

如果 Wi-Fi 有问题：
1. 打开手机热点
2. Mac 连接到热点
3. 重启模拟器

---

## 📝 快速检查清单

- [ ] Android Studio 已打开
- [ ] 已打开 Preferences (⌘ + ,)
- [ ] 已导航到 HTTP Proxy 设置
- [ ] 已选择 "No proxy"
- [ ] 已点击 "OK" 保存
- [ ] 已重启模拟器（如果需要）

---

## 🚀 下一步

设置完成后：

1. **重启模拟器**
2. **测试网络连接**
3. **尝试在 Play Store 安装 Expo Go**

---

**现在按照步骤检查代理设置吧！** 🚀
