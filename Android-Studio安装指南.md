# Android Studio 安装指南（Mac）

**更新时间**: 2024-12-XX  
**状态**: 环境变量已自动配置 ✅

---

## 📋 当前状态

根据自动检查结果：
- ✅ **环境变量已配置**（已添加到 `~/.zshrc` 和 `~/.bash_profile`）
- ❌ **Android Studio 未安装**
- ❌ **Android SDK 未安装**
- ⚠️ **Java 环境需要检查**

---

## 🚀 安装方法（两种方式）

### 方法 1: 使用 Homebrew 自动安装（推荐）

如果你已经安装了 Homebrew，这是最简单的方式：

```bash
# 安装 Homebrew（如果还没有）
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 使用 Homebrew 安装 Android Studio
brew install --cask android-studio
```

安装完成后：
1. 打开 Android Studio（在 Applications 文件夹中）
2. 按照初始设置向导完成配置
3. 等待 SDK 下载完成（可能需要 10-30 分钟）

### 方法 2: 手动下载安装

#### 步骤 1: 下载 Android Studio

1. 访问官网：https://developer.android.com/studio
2. 点击 "Download Android Studio"
3. 选择 macOS 版本（.dmg 文件，约 1GB）

#### 步骤 2: 安装

1. 打开下载的 `.dmg` 文件
2. 将 Android Studio 图标拖到 Applications 文件夹
3. 打开 Applications，双击 Android Studio

#### 步骤 3: 初始设置向导

1. **Welcome 界面**
   - 点击 "Next"

2. **Install Type**
   - 选择 "Standard"（推荐）
   - 点击 "Next"

3. **Verify Settings**
   - 确认 SDK 安装路径：`~/Library/Android/sdk`
   - 点击 "Next"

4. **License Agreement**
   - 接受所有许可协议
   - 点击 "Finish"
   - ⏳ 等待下载和安装完成（10-30 分钟）

---

## 📱 创建 Android 虚拟设备（AVD）

安装完成后，需要创建一个 Android 模拟器：

### 步骤 1: 打开 Virtual Device Manager

1. 打开 Android Studio
2. 点击右上角 "More Actions" → "Virtual Device Manager"
   - 或者：菜单栏 "Tools" → "Device Manager"

### 步骤 2: 创建新设备

1. 点击 "Create Device" 按钮
2. **选择设备型号**（推荐）：
   - Pixel 5（推荐，性能好）
   - Pixel 6
   - Pixel 7
3. 点击 "Next"

### 步骤 3: 选择系统镜像

1. **推荐选择**：
   - Android 13 (Tiramisu) - API 33
   - Android 14 (UpsideDownCake) - API 34
2. 如果没有，点击 "Download" 下载（需要几分钟）
3. 点击 "Next"

### 步骤 4: 完成创建

1. 可以修改 AVD 名称（默认即可）
2. 点击 "Finish"
3. ✅ AVD 创建完成

---

## ✅ 验证安装

### 1. 重新加载环境变量

```bash
source ~/.zshrc
```

### 2. 检查环境变量

```bash
echo $ANDROID_HOME
# 应该显示: /Users/gaoxuxu/Library/Android/sdk
```

### 3. 检查 ADB

```bash
adb version
# 应该显示版本信息，例如: Android Debug Bridge version 1.0.41
```

### 4. 检查模拟器

```bash
emulator -list-avds
# 应该列出你创建的 AVD 名称
```

### 5. 启动模拟器测试

```bash
# 列出所有 AVD
emulator -list-avds

# 启动指定的 AVD（替换 <AVD名称> 为实际名称）
emulator -avd <AVD名称>
```

---

## 🎯 与 Expo 项目配合使用

### 启动流程

1. **启动 Android 模拟器**（两种方式）：
   ```bash
   # 方式 1: 命令行启动
   emulator -avd <你的AVD名称>
   
   # 方式 2: 在 Android Studio 中点击播放按钮
   ```

2. **启动 Expo 开发服务器**：
   ```bash
   cd /Users/gaoxuxu/Desktop/xiaopei-app/app
   npx expo start
   ```

3. **连接模拟器**：
   - 在 Expo 终端中按 `a` 键
   - Expo 会自动检测并连接到 Android 模拟器
   - App 会自动安装并启动

---

## 🔧 常见问题

### Q1: 安装很慢怎么办？

**A**: Android Studio 首次安装需要下载大量文件（SDK、系统镜像等），请：
- 保持网络畅通
- 耐心等待 30-60 分钟
- 如果下载失败，可以重试

### Q2: 提示 "SDK location not found"

**A**: 
```bash
# 检查环境变量
echo $ANDROID_HOME

# 如果为空，手动设置
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/emulator

# 永久保存到 ~/.zshrc
echo 'export ANDROID_HOME=$HOME/Library/Android/sdk' >> ~/.zshrc
echo 'export PATH=$PATH:$ANDROID_HOME/platform-tools' >> ~/.zshrc
echo 'export PATH=$PATH:$ANDROID_HOME/emulator' >> ~/.zshrc
source ~/.zshrc
```

### Q3: 模拟器启动很慢

**A**: 
- 首次启动需要 1-2 分钟（正常）
- 后续启动会快一些
- 如果太慢，可以尝试：
  - 关闭其他应用释放内存
  - 使用性能更好的设备型号（如 Pixel 5）

### Q4: 需要安装哪些 Android 版本？

**A**: 建议至少安装：
- **Android 13 (API 33)** - 稳定，兼容性好
- **Android 14 (API 34)** - 最新版本

### Q5: Java 环境问题

**A**: Android Studio 自带 JDK，但如果遇到问题：
```bash
# 检查 Java
java -version

# 如果需要，安装 Java 17（推荐）
brew install openjdk@17

# 设置 JAVA_HOME
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
```

### Q6: Expo 无法连接到模拟器

**A**: 
1. 确保模拟器已启动
2. 检查 ADB 连接：
   ```bash
   adb devices
   # 应该显示设备列表
   ```
3. 如果显示 "unauthorized"，在模拟器上点击 "Allow"
4. 重启 Expo：`npx expo start --clear`

---

## 📝 快速检查清单

安装完成后，运行以下命令验证：

```bash
# 1. 检查 Android Studio
ls /Applications/Android\ Studio.app

# 2. 检查 SDK
ls ~/Library/Android/sdk

# 3. 检查环境变量
echo $ANDROID_HOME

# 4. 检查 ADB
adb version

# 5. 检查模拟器
emulator -list-avds

# 6. 检查 Java
java -version
```

---

## 🎉 安装完成后的下一步

1. ✅ 运行验证命令，确保所有工具正常
2. ✅ 创建一个 Android 虚拟设备（AVD）
3. ✅ 测试启动模拟器
4. ✅ 在 Expo 项目中测试连接

---

## 📚 相关资源

- **Android Studio 官网**: https://developer.android.com/studio
- **Android 开发者文档**: https://developer.android.com/docs
- **Expo Android 指南**: https://docs.expo.dev/workflow/android-studio-emulator/

---

**安装脚本位置**: `scripts/install-android-studio.sh`  
**运行脚本**: `./scripts/install-android-studio.sh`

---

**祝安装顺利！** 🚀

