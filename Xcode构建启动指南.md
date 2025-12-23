# Xcode 构建启动指南

## 🔍 问题说明

使用 Xcode 直接构建安装到 iPhone 后，应用需要连接到 **Metro bundler（开发服务器）** 才能加载 JavaScript 代码。

错误 "No script URL provided" 表示应用找不到开发服务器。

## ✅ 解决方案

### 步骤 1：启动 Metro Bundler（开发服务器）

在终端运行：

```bash
cd /Users/gaoxuxu/Desktop/xiaopei-app/app
npx expo start --clear --lan
```

**参数说明**：
- `--clear`：清除缓存
- `--lan`：使用局域网模式，这样 iPhone 可以通过电脑的 IP 访问

### 步骤 2：确保 iPhone 和电脑在同一网络

1. **检查电脑 IP**：
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```
   当前 IP: `10.89.148.75`

2. **确保 iPhone 连接同一个 Wi-Fi**

### 步骤 3：在 iPhone 上重新打开应用

1. **完全关闭应用**（从多任务中划掉）
2. **重新打开应用**
3. 应用会自动连接到开发服务器（`http://10.89.148.75:8081`）

### 步骤 4：如果还是无法连接

#### 方法 A：摇动 iPhone 打开开发菜单

1. **摇动 iPhone**
2. 选择 **"Settings"**
3. 在 **"Debug server host & port for device"** 中输入：
   ```
   10.89.148.75:8081
   ```
4. 返回并选择 **"Reload"**

#### 方法 B：在 Xcode 中设置

1. 打开 Xcode
2. 选择你的 Scheme
3. 编辑 Scheme → Run → Arguments
4. 添加环境变量：
   ```
   RCT_METRO_PORT=8081
   ```

#### 方法 C：使用 Tunnel 模式（如果不在同一网络）

```bash
# 停止当前服务器（Ctrl + C）
npx expo start --tunnel
```

这会生成一个可公网访问的 URL。

## 🔍 验证连接

启动 Metro bundler 后，你应该看到：

```
› Metro waiting on exp://10.89.148.75:8081
```

在 iPhone 上打开应用后，应该能看到应用正常加载。

## ⚠️ 常见问题

### 问题 1：应用还是显示 "No script URL provided"

**解决方案**：
1. 确认 Metro bundler 正在运行（检查终端）
2. 确认 iPhone 和电脑在同一网络
3. 在 iPhone 上摇动设备 → Settings → 手动输入服务器地址

### 问题 2：防火墙阻止连接

**解决方案**：
```bash
# macOS 防火墙设置
系统设置 → 网络 → 防火墙 → 选项
确保允许 Node.js 或 Terminal 的连接
```

### 问题 3：端口 8081 被占用

**解决方案**：
```bash
# 查找占用端口的进程
lsof -i :8081

# 停止进程
kill -9 <PID>

# 重新启动
npx expo start --clear --lan
```

## 📊 当前配置

- **电脑 IP**: `10.89.148.75`
- **Metro 端口**: `8081`
- **API 服务器**: `http://10.89.148.75:3000`

## ✅ 快速启动命令

```bash
# 一键启动（在 app 目录下）
cd /Users/gaoxuxu/Desktop/xiaopei-app/app
npx expo start --clear --lan
```

然后在 iPhone 上重新打开应用即可。

---

**更新时间**: 2025-11-28  
**状态**: ✅ Metro bundler 已配置，等待启动





