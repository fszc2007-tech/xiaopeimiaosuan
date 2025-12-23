# 获取 Android SHA-1 指纹指南

## 用途
在 Google Cloud Console 创建 **Android OAuth Client** 时需要填写 SHA-1 指纹。

---

## ⚠️ 前置要求

**需要 Java 环境**：`keytool` 是 Java JDK 的一部分。如果系统提示找不到 Java，请先安装：

- **macOS**：`brew install openjdk@17` 或从 [Oracle](https://www.oracle.com/java/technologies/downloads/) 下载
- 或者使用 **Android Studio** 自带的 keytool（路径通常在 `~/Library/Android/sdk/jbr/Contents/Home/bin/keytool`）

---

## 方法一：开发环境（Debug Keystore）⭐ 推荐

### 步骤 1：确保 Debug Keystore 存在

**最简单的方法**：运行一次 Android 构建，会自动生成 debug keystore：

```bash
cd app
npx expo run:android
```

构建完成后，debug keystore 会自动生成在 `~/.android/debug.keystore`。

### 步骤 2：获取 SHA-1 指纹

```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android | grep SHA1
```

**如果 keytool 不在 PATH 中**，使用 Android Studio 的 keytool：

```bash
~/Library/Android/sdk/jbr/Contents/Home/bin/keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android | grep SHA1
```

**输出示例**：
```
SHA1: AA:BB:CC:DD:EE:FF:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE
```

**复制这个 SHA-1 值**（去掉空格或保留冒号都可以，Google Cloud Console 会自动处理）。

**输出示例**：
```
SHA1: AA:BB:CC:DD:EE:FF:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE
```

**复制这个 SHA-1 值**（去掉空格或保留冒号都可以，Google Cloud Console 会自动处理）。

---

## 方法二：使用 Android Studio（最简单）⭐ 最推荐

如果你安装了 Android Studio：

1. 打开 Android Studio
2. 打开你的项目（`app` 目录）
3. 在右侧边栏找到 **「Gradle」** 面板
4. 展开：`app` → `Tasks` → `android` → 双击 **`signingReport`**
5. 在底部 **「Run」** 窗口查看输出，找到类似：

```
Variant: debug
Config: debug
Store: ~/.android/debug.keystore
Alias: AndroidDebugKey
SHA1: AA:BB:CC:DD:EE:FF:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE
```

直接复制 SHA1 那一行的值即可。

---

## 方法三：使用 Expo / EAS（如果已配置 EAS）

如果你使用 EAS Build：

```bash
cd app
eas credentials
```

然后选择 Android，会显示 SHA-1 指纹。

**注意**：本地 Expo CLI 的 `fetch:android:hashes` 命令已不支持，需要使用 EAS。

---

## 方法三：生产环境（Release Keystore）

如果你已经有生产环境的 keystore 文件：

```bash
keytool -list -v -keystore /path/to/your/release.keystore -alias your-key-alias
```

然后输入 keystore 密码，在输出中找到 SHA-1。

**注意**：生产环境和开发环境的 SHA-1 **是不同的**，Google Cloud Console 需要分别配置。

---

## 方法四：从已安装的 APK 获取（如果 App 已发布）

如果你已经有签名后的 APK：

```bash
# 先安装 apksigner（Android SDK 工具）
# 然后运行：
apksigner verify --print-certs /path/to/your-app.apk | grep SHA-1
```

---

## 在 Google Cloud Console 中使用

1. 进入 Google Cloud Console → 你的项目（`xiaopei app`）
2. 导航到「API 和服务」→「凭据」
3. 创建「OAuth 2.0 客户端 ID」
4. 选择「Android」应用类型
5. 填写：
   - **软件包名称**：`tech.dawnai.xiaopei.app`（或你当前用的 `com.xiaopei.app`）
   - **SHA-1 证书指纹**：粘贴上面获取的 SHA-1 值
6. 点击「创建」

---

## 注意事项

1. **开发和生产环境需要分别配置**：
   - 开发环境用 Debug Keystore 的 SHA-1
   - 生产环境用 Release Keystore 的 SHA-1
   - 在 Google Cloud Console 可以添加多个 SHA-1（一个 Android Client ID 支持多个指纹）

2. **如果使用 EAS Build**：
   - EAS 会管理生产环境的 keystore
   - 可以通过 `eas credentials` 命令查看或下载 keystore
   - 然后用方法三获取 SHA-1

3. **当前项目状态**：
   - 你的 `app.json` 中 Android package 是 `com.xiaopei.app`
   - 但之前我们确认要用 `tech.dawnai.xiaopei.app`
   - **建议**：在创建 Google OAuth Client 时，先用当前配置的 package name，或者先更新 `app.json` 中的 package 再获取指纹

---

## 快速命令（一键获取）

如果你确定 debug keystore 在默认位置且已安装 Java，可以直接运行：

```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android 2>/dev/null | grep -A 1 "SHA1:" | tail -1 | sed 's/.*SHA1: //' | tr -d ' '
```

这会直接输出纯 SHA-1 值（无空格、无冒号）。

---

## 🎯 快速选择指南

**根据你的情况选择方法**：

| 你的情况 | 推荐方法 |
|---------|---------|
| ✅ 已安装 Android Studio | **方法二：Android Studio Gradle signingReport**（最简单） |
| ✅ 已安装 Java，且运行过 `expo run:android` | **方法一：keytool 命令** |
| ✅ 使用 EAS Build | **方法三：eas credentials** |
| ❌ 还没运行过 Android 构建 | 先运行 `cd app && npx expo run:android`，然后使用方法一 |

---

## 💡 提示

**如果当前只需要 iOS Google 登录**：
- 你可以**暂时跳过 Android SHA-1 的配置**
- 等以后需要 Android 版本时再配置
- Google Cloud Console 允许一个项目有多个 OAuth Client（iOS 和 Android 是分开的）

