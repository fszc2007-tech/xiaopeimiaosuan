# Metro Bundler 连接问题解决方案

## 问题诊断

**错误信息**：
```
No script URL provided. Make sure the packager is running or you have embedded a JS bundle in your application bundle.
unsanitizedScriptURLString = (null)
```

**当前状态**：
- ✅ Metro bundler 正在运行（端口 8081，状态：running）
- ✅ 入口文件 `index.ts` 存在
- ✅ 配置文件正常
- ❌ 模拟器无法连接到 Metro bundler

---

## 解决方案

### 方案 1：在模拟器中重新加载（最简单）

1. **在模拟器中按快捷键**：
   - `Cmd + R` - 重新加载
   - 或 `Cmd + D` - 打开开发者菜单，然后选择 "Reload"

2. **如果快捷键无效，摇一摇设备**：
   - 在模拟器中：`Device` → `Shake`（或 `Cmd + Ctrl + Z`）
   - 选择 "Reload"

### 方案 2：重启 Metro Bundler

```bash
cd /Users/gaoxuxu/Desktop/xiaopei-app/app

# 停止当前的 Metro bundler
# 在运行 Metro bundler 的终端按 Ctrl + C

# 清除缓存并重新启动
npx expo start --clear

# 或者
npm start -- --reset-cache
```

### 方案 3：检查并修复 Metro Bundler 配置

如果方案 1 和 2 都不行，可能是 Metro bundler 绑定地址的问题：

```bash
cd /Users/gaoxuxu/Desktop/xiaopei-app/app

# 使用 tunnel 模式（推荐用于模拟器）
npx expo start --tunnel

# 或使用 LAN 模式
npx expo start --lan

# 或明确指定 localhost
npx expo start --localhost
```

### 方案 4：完全重置（最彻底）

```bash
cd /Users/gaoxuxu/Desktop/xiaopei-app/app

# 1. 停止所有相关进程
killall node
killall -9 node

# 2. 清除所有缓存
rm -rf node_modules/.cache
rm -rf .expo
rm -rf ios/build
rm -rf android/build

# 3. 清除 Metro bundler 缓存
watchman watch-del-all 2>/dev/null || true

# 4. 重新启动
npm start -- --reset-cache
```

### 方案 5：检查 Xcode 项目配置

如果使用原生构建（`expo run:ios`），检查 Xcode 项目配置：

1. 打开 Xcode 项目：
   ```bash
   open /Users/gaoxuxu/Desktop/xiaopei-app/app/ios/app.xcworkspace
   ```

2. 检查 `AppDelegate.swift` 中的 Metro bundler URL：
   - 应该指向 `localhost:8081` 或正确的 IP 地址

3. 检查 Scheme 配置：
   - `Product` → `Scheme` → `Edit Scheme`
   - 确保 `Build Configuration` 是 `Debug`

---

## 快速修复步骤（推荐顺序）

### 步骤 1：尝试重新加载（30 秒）
1. 在模拟器中按 `Cmd + R`
2. 如果不行，按 `Cmd + D`，选择 "Reload"

### 步骤 2：重启 Metro Bundler（1 分钟）
```bash
cd /Users/gaoxuxu/Desktop/xiaopei-app/app
npx expo start --clear
```

### 步骤 3：检查 Metro Bundler 输出
启动后，Metro bundler 应该显示：
```
Metro waiting on exp://192.168.x.x:8081
```

如果显示的是 `exp://localhost:8081` 或 `exp://127.0.0.1:8081`，这是正常的（iOS 模拟器可以访问 localhost）。

### 步骤 4：在模拟器中手动输入 URL（如果以上都不行）
1. 在模拟器中按 `Cmd + D`
2. 选择 "Configure Bundler"
3. 输入：`http://localhost:8081`

---

## 常见问题排查

### Q1: Metro bundler 显示 "Metro waiting on..." 但模拟器无法连接

**可能原因**：
- 防火墙阻止了 8081 端口
- 模拟器网络配置问题

**解决方案**：
```bash
# 检查防火墙设置
# macOS: 系统设置 → 网络 → 防火墙

# 或者使用 tunnel 模式
npx expo start --tunnel
```

### Q2: 使用 `expo run:ios` 构建的应用无法连接

**可能原因**：
- 原生构建的应用需要配置正确的 Metro bundler URL

**解决方案**：
1. 检查 `ios/app/AppDelegate.swift`
2. 确保指向正确的 Metro bundler 地址
3. 开发环境应该使用 `localhost:8081`

### Q3: 清除缓存后仍然无法连接

**解决方案**：
```bash
# 完全重置
cd /Users/gaoxuxu/Desktop/xiaopei-app/app
rm -rf node_modules/.cache .expo
npm start -- --reset-cache

# 如果还不行，重新安装依赖
rm -rf node_modules
npm install
npm start
```

---

## 验证修复

修复后，应该看到：
1. ✅ Metro bundler 正常启动，显示 "Metro waiting on..."
2. ✅ 模拟器中 App 正常加载，不再显示错误
3. ✅ 控制台显示 "Running application..."

---

## 预防措施

1. **使用环境变量**：避免硬编码 IP 地址
2. **统一使用 localhost**：iOS 模拟器可以直接访问 localhost
3. **定期清除缓存**：开发过程中定期运行 `npx expo start --clear`

---

**最后更新**：2024-12-XX  
**当前 Metro Bundler 状态**：✅ 运行中（端口 8081）



