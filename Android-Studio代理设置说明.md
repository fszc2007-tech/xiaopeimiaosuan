# Android Studio 代理设置说明

## 🔧 当前情况

Android Studio 弹出了 "HTTP Proxy" 配置对话框，这通常是因为：
1. 下载过程中检测到网络问题
2. 系统配置了代理，Android Studio 想要使用
3. 自动检测代理设置失败

---

## ✅ 解决方案

### 方案 1: 不使用代理（推荐，如果网络正常）

如果你的网络可以直接访问 Google 服务器：

1. **选择 "No proxy"**（不使用代理）
2. 点击 **"OK"** 按钮
3. 下载会继续

### 方案 2: 使用自动检测（如果已配置代理）

如果你的 Mac 已经配置了系统代理：

1. 保持 **"Auto-detect proxy settings"** 选中
2. 点击 **"Check Connection"** 测试连接
3. 如果测试成功，点击 **"OK"**

### 方案 3: 手动配置代理（如果需要）

如果你需要使用代理：

1. 选择 **"Manual proxy configuration"**
2. 选择 **"HTTP"** 或 **"SOCKS"**
3. 填写代理服务器信息：
   - Host name: 代理服务器地址
   - Port number: 代理端口
4. 如果需要认证，勾选 "Proxy authentication" 并填写账号密码
5. 点击 **"Check Connection"** 测试
6. 点击 **"OK"**

---

## 🎯 推荐操作

**大多数情况下，选择 "No proxy" 然后点击 "OK" 即可。**

如果下载仍然失败，可能需要：
- 检查网络连接
- 配置代理（如果在中国大陆）
- 使用 VPN

---

## ⚠️ 注意事项

- 不要点击 **"Cancel"**，这可能会中断设置
- 如果网络正常，选择 "No proxy" 是最简单的
- 配置完成后，下载会继续

---

**操作建议**：选择 "No proxy" → 点击 "OK" → 等待下载继续
