# 🚀 Expo 启动说明

## 当前状态

✅ **Android 模拟器**: 已启动并连接 (emulator-5554)  
⏳ **Expo**: 正在启动中...

---

## 📱 连接步骤

### 方法 1: 在 Expo 终端中操作

如果 Expo 已经在终端中运行：

1. **查看 Expo 终端窗口**
   - 应该显示二维码和菜单选项

2. **按 `a` 键**
   - 会自动连接到 Android 模拟器
   - App 会自动安装并启动

### 方法 2: 手动启动 Expo

如果 Expo 没有自动启动，运行：

```bash
cd /Users/gaoxuxu/Desktop/xiaopei-app
./start-expo.sh
```

然后在终端中：
- 等待二维码出现
- 按 **`a`** 键连接 Android 模拟器

---

## 🎯 完整流程

1. ✅ Android 模拟器已启动
2. ⏳ Expo 开发服务器启动中
3. ⏳ 等待 Expo 显示二维码和菜单
4. ⏳ 按 `a` 键连接模拟器
5. ⏳ App 自动安装并启动

---

## 🔍 检查状态

### 检查模拟器连接
```bash
adb devices
```

### 检查 Expo 端口
```bash
lsof -i :8081
```

### 检查进程
```bash
ps aux | grep expo
```

---

## ⚠️ 如果遇到问题

### Expo 无法连接模拟器

1. 确认模拟器已完全启动（看到主屏幕）
2. 运行 `adb devices` 确认设备连接
3. 重启 Expo: `npx expo start --clear`

### 端口被占用

```bash
# 查找占用 8081 端口的进程
lsof -i :8081

# 杀死进程（替换 PID）
kill -9 <PID>
```

---

**当前模拟器**: Medium_Phone_API_36.1 (emulator-5554)  
**Expo 端口**: 8081

---

**等待 Expo 启动完成后，按 `a` 键即可连接！** 🚀
