# 最新 APK 下载信息

## 📱 构建信息

- **构建 ID**: `77ce0f7d-8867-4155-a5b6-cd05c5c7cefc`
- **版本号**: `1.0.6`
- **Version Code**: `6`
- **构建时间**: 2025-12-25 15:57:05
- **状态**: ✅ FINISHED
- **Profile**: `production`
- **Platform**: Android

---

## 🔗 直接下载链接

**APK 下载地址**:
```
https://expo.dev/artifacts/eas/fN46njU7hVn8KQKDwcA9yu.apk
```

**构建详情页面**:
```
https://expo.dev/accounts/larry001/projects/xiaopei-app/builds/77ce0f7d-8867-4155-a5b6-cd05c5c7cefc
```

---

## 📲 二维码下载

### 方法 1: 使用在线工具生成二维码

访问以下任一网站，输入上面的下载链接即可生成二维码：
- https://www.qrcode-monkey.com/
- https://www.the-qrcode-generator.com/
- https://qr.io/

### 方法 2: 使用命令行生成（如果已安装 qrcode）

```bash
pip3 install qrcode[pil]
python3 -c "import qrcode; qr = qrcode.QRCode(); qr.add_data('https://expo.dev/artifacts/eas/fN46njU7hVn8KQKDwcA9yu.apk'); img = qr.make_image(); img.save('apk-qrcode.png')"
```

---

## ✅ 安装前检查清单

### 1. 卸载旧版本（重要！）

```bash
adb uninstall tech.dawnai.xiaopei.app
```

或者手动卸载：
- 设置 → 应用 → 小佩妙算 → 卸载

### 2. 验证版本号

安装后检查：
```bash
adb shell dumpsys package tech.dawnai.xiaopei.app | grep versionCode
```

应该显示：`versionCode=6`

### 3. 抓取诊断日志

安装后运行：
```bash
adb logcat -v time | grep -E "ENV DIAGNOSTIC|API CLIENT DIAGNOSTIC|SMS REQUEST DIAGNOSTIC|GOOGLE CONFIG DIAGNOSTIC"
```

然后：
- 打开 App（应该看到 ENV DIAGNOSTIC 和 API CLIENT DIAGNOSTIC）
- 点击 Google 登录（应该看到 GOOGLE CONFIG DIAGNOSTIC）
- 发送短信（应该看到 SMS REQUEST DIAGNOSTIC）

---

## 🔍 本次构建包含的修复

1. ✅ 环境变量诊断日志（env.ts）
2. ✅ API 客户端诊断日志（apiClient.ts）
3. ✅ 短信请求诊断日志（authService.ts）
4. ✅ Google 配置诊断日志（google.ts）
5. ✅ PDF 直接加载修复（PolicyViewerScreen.tsx）
6. ✅ 华为 Mate 40 适配（GoogleLoginSheet.tsx）

---

## ⚠️ 注意事项

1. **必须卸载旧版本**：如果之前安装过，必须先卸载再安装新版本
2. **检查 versionCode**：确保安装的是 versionCode=6 的版本
3. **抓取日志验证**：安装后立即抓取日志，确认诊断代码是否执行

---

## 📜 历史版本

### 1.0.3 (Version Code: 3)
- **构建 ID**: `d234c9e5-a0f0-47d2-aef8-966600be51f6`
- **下载链接**: `https://expo.dev/artifacts/eas/rXvT6CsutxYoSaUc26ymgh.apk`
- **构建时间**: 2025-12-24 20:15:40

