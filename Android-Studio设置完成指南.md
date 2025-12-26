# Android Studio 设置完成指南

**更新时间**: 2024-12-25  
**状态**: Android Studio 已安装 ✅，等待初始设置

---

## 📋 当前状态

- ✅ **Android Studio 已安装** (版本 2025.2)
- ✅ **环境变量已配置**
- ⏳ **等待初始设置完成**
- ⏳ **等待创建 AVD**

---

## 🚀 第一步：完成 Android Studio 初始设置

Android Studio 应该已经打开了。如果没有，运行：

```bash
open /Applications/Android\ Studio.app
```

### 设置步骤：

1. **Welcome 界面**
   - 如果看到欢迎界面，点击 "Next"
   - 如果已经打开过，跳过此步

2. **Install Type**
   - 选择 **"Standard"**（推荐）
   - 点击 "Next"

3. **Verify Settings**
   - 确认 SDK 安装路径：`~/Library/Android/sdk`
   - 点击 "Next"

4. **License Agreement**
   - 接受所有许可协议
   - 点击 "Finish"
   - ⏳ **等待 SDK 下载完成**（10-30 分钟）

5. **完成设置**
   - 等待下载完成后，Android Studio 会自动完成设置

---

## 📱 第二步：创建 Android 虚拟设备（AVD）

### 方法 1: 通过 Android Studio GUI（推荐）

1. **打开 Virtual Device Manager**
   - 点击右上角 **"More Actions"** → **"Virtual Device Manager"**
   - 或者：菜单栏 **"Tools"** → **"Device Manager"**

2. **创建新设备**
   - 点击 **"Create Device"** 按钮

3. **选择设备型号**
   - 推荐选择：**Pixel 5**（性能好，兼容性强）
   - 其他选项：Pixel 6, Pixel 7
   - 点击 "Next"

4. **选择系统镜像**
   - 推荐选择：
     - **Android 13 (Tiramisu) - API 33**（稳定）
     - **Android 14 (UpsideDownCake) - API 34**（最新）
   - 如果没有，点击 **"Download"** 下载（需要几分钟）
   - 点击 "Next"

5. **完成创建**
   - 可以修改 AVD 名称（默认即可）
   - 点击 **"Finish"**
   - ✅ AVD 创建完成

### 方法 2: 使用命令行（高级）

如果 SDK 已完全安装，可以使用命令行创建：

```bash
# 列出可用的系统镜像
sdkmanager --list | grep "system-images"

# 安装系统镜像（例如 Android 13）
sdkmanager "system-images;android-33;google_apis;arm64-v8a"

# 创建 AVD（需要 avdmanager）
avdmanager create avd -n Pixel5_API33 -k "system-images;android-33;google_apis;arm64-v8a" -d "pixel_5"
```

---

## ✅ 第三步：验证安装

运行验证脚本：

```bash
cd /Users/gaoxuxu/Desktop/xiaopei-app
./scripts/setup-android-avd.sh
```

应该看到：
- ✅ Android SDK 已安装
- ✅ Platform Tools 已安装
- ✅ Emulator 已安装
- ✅ 找到 AVD 列表

---

## 🎯 第四步：启动模拟器并测试

### 启动模拟器

```bash
# 列出所有 AVD
emulator -list-avds

# 启动指定的 AVD（替换 <AVD名称> 为实际名称）
emulator -avd <AVD名称>
```

### 在 Expo 项目中使用

```bash
# 1. 启动模拟器（在后台）
emulator -avd <AVD名称> &

# 2. 启动 Expo
cd /Users/gaoxuxu/Desktop/xiaopei-app
./start-expo.sh

# 3. 在 Expo 终端中按 'a' 键连接 Android 模拟器
```

---

## 🔧 常见问题

### Q: SDK 下载很慢怎么办？

**A**: 
- 保持网络畅通
- 如果在中国大陆，可能需要配置代理
- 耐心等待，首次下载需要 10-30 分钟

### Q: 创建 AVD 时提示 "No system images installed"

**A**: 
1. 在创建 AVD 时，点击系统镜像旁边的 "Download"
2. 或者手动安装：
   ```bash
   sdkmanager "system-images;android-33;google_apis;arm64-v8a"
   ```

### Q: 模拟器启动很慢

**A**: 
- 首次启动需要 1-2 分钟（正常）
- 确保有足够的内存（建议 8GB+）
- 关闭其他占用内存的应用

### Q: Expo 无法连接到模拟器

**A**: 
1. 确保模拟器已完全启动（看到主屏幕）
2. 检查 ADB 连接：
   ```bash
   adb devices
   # 应该显示设备列表
   ```
3. 如果显示 "unauthorized"，在模拟器上点击 "Allow"

---

## 📝 快速检查清单

完成设置后，运行以下命令验证：

```bash
# 1. 检查 SDK
ls ~/Library/Android/sdk

# 2. 检查环境变量
echo $ANDROID_HOME

# 3. 检查 ADB
adb version

# 4. 检查 AVD
emulator -list-avds

# 5. 运行完整检查
./scripts/setup-android-avd.sh
```

---

## 🎉 完成后的下一步

1. ✅ 完成 Android Studio 初始设置
2. ✅ 创建至少一个 AVD
3. ✅ 验证所有工具正常工作
4. ✅ 在 Expo 项目中测试连接

---

**相关脚本**:
- `scripts/install-android-studio.sh` - 安装检查
- `scripts/setup-android-avd.sh` - AVD 设置检查
- `start-expo.sh` - Expo 快速启动

---

**祝设置顺利！** 🚀
