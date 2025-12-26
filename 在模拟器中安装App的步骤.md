# 📱 在 Android 模拟器中安装 App 的步骤

## 🎯 当前状态

✅ **模拟器已启动** - 可以看到主屏幕  
❌ **Expo Go 未安装** - 需要先安装  
❌ **小佩 App 未安装** - 需要连接开发服务器

---

## 🚀 解决方案（两种方法）

### 方法 1: 通过 Play Store 安装 Expo Go（推荐）

1. **在模拟器中点击 "Play Store" 图标**
   - 在主屏幕的顶部，有 Play Store 图标

2. **搜索 "Expo Go"**
   - 在 Play Store 中搜索
   - 找到 Expo Go（由 Expo 开发）

3. **安装 Expo Go**
   - 点击 "Install" 按钮
   - 等待安装完成

4. **打开 Expo Go**
   - 在主屏幕找到 Expo Go 图标
   - 点击打开

5. **连接开发服务器**
   - 在 Expo Go 中，点击 "Enter URL manually"
   - 输入: `exp://localhost:8081`
   - 点击 "Connect"
   - 或者扫描 Expo 终端中的二维码

### 方法 2: 在 Expo 终端按 'a' 键（自动安装）

1. **找到运行 Expo 的终端窗口**
   - 应该显示二维码和菜单选项
   - 如果找不到，运行：
   ```bash
   cd /Users/gaoxuxu/Desktop/xiaopei-app/app
   npx expo start --clear
   ```

2. **在 Expo 终端中按 `a` 键**
   - Expo 会自动：
     - 检测 Android 模拟器
     - 自动安装 Expo Go（如果需要）
     - 自动启动 App

---

## 📋 详细步骤（方法 1）

### 步骤 1: 打开 Play Store

在模拟器主屏幕：
- 找到顶部的 **"Play Store"** 图标（彩色三角形）
- 点击打开

### 步骤 2: 搜索 Expo Go

在 Play Store 中：
- 点击搜索框
- 输入: **"Expo Go"**
- 点击搜索

### 步骤 3: 安装 Expo Go

- 找到 **"Expo Go"**（由 Expo 开发）
- 点击 **"Install"** 按钮
- 等待安装完成（可能需要几分钟）

### 步骤 4: 打开 Expo Go

安装完成后：
- 返回主屏幕
- 找到 **Expo Go** 图标
- 点击打开

### 步骤 5: 连接开发服务器

在 Expo Go 中：
- 点击 **"Enter URL manually"** 或 **"Scan QR Code"**
- 如果选择手动输入，输入: `exp://localhost:8081`
- 点击 **"Connect"**

---

## 🎯 预期结果

连接成功后：
- ✅ Expo Go 会加载开发服务器
- ✅ 小佩 App 会自动显示
- ✅ 可以看到 App 的登录界面

---

## ⚠️ 如果遇到问题

### Play Store 无法打开

```bash
# 检查模拟器网络
adb shell ping -c 3 8.8.8.8
```

### Expo Go 无法连接

1. 确认 Expo 服务器运行: `curl http://localhost:8081/status`
2. 检查防火墙设置
3. 尝试使用 IP 地址: `exp://192.168.x.x:8081`

### 找不到 Expo 终端

```bash
# 重新启动 Expo
cd /Users/gaoxuxu/Desktop/xiaopei-app/app
npx expo start --clear
```

---

## 🚀 最快的方法

**推荐**: 在 Expo 终端按 `a` 键，让 Expo 自动处理所有步骤！

如果看不到 Expo 终端，先运行：
```bash
cd /Users/gaoxuxu/Desktop/xiaopei-app/app
npx expo start --clear
```

然后按 `a` 键。
