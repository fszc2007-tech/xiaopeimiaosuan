# 环境变量配置说明

## 开发环境 API Base URL 配置

### iOS 模拟器
- **默认配置**：使用 `localhost:3000`（无需额外配置）
- iOS 模拟器可以直接访问宿主机的 `localhost`

### iOS 真机测试
- **问题**：真机无法访问 `localhost`，需要使用电脑的局域网 IP
- **解决方案**：创建 `.env.local` 文件并设置 `EXPO_PUBLIC_API_BASE_URL`

### 配置步骤

1. **获取电脑的局域网 IP 地址**：
   ```bash
   # macOS/Linux
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # Windows
   ipconfig | findstr "IPv4"
   ```

2. **创建 `.env.local` 文件**（在 `app/` 目录下）：
   ```bash
   cd app
   echo "EXPO_PUBLIC_API_BASE_URL=http://192.168.1.86:3000" > .env.local
   ```
   
   **注意**：将 `192.168.1.86` 替换为你的实际 IP 地址

3. **重启 Expo 服务**：
   ```bash
   # 停止当前服务（Ctrl+C）
   # 重新启动
   npm start
   # 或
   expo start
   ```

### 当前电脑 IP（示例）
根据检测，你的电脑 IP 是：`192.168.1.86`

如果需要在真机测试，创建 `.env.local` 文件：
```bash
cd app
echo "EXPO_PUBLIC_API_BASE_URL=http://192.168.1.86:3000" > .env.local
```

### 验证配置
启动 App 后，在控制台应该看到：
```
[ENV Config] 🔗 API Base URL: http://192.168.1.86:3000
```

### 常见问题

**Q: IP 地址会变化吗？**
A: 是的，每次连接不同的 WiFi 或热点，IP 可能会变化。需要重新获取并更新 `.env.local` 文件。

**Q: 如何同时支持模拟器和真机？**
A: 模拟器使用默认配置（localhost），真机使用 `.env.local` 配置。需要切换时，删除或重命名 `.env.local` 文件即可。

**Q: 为什么超时时间增加到 60 秒？**
A: Google Token 验证需要访问 Google 服务器，可能需要更长时间。如果仍然超时，请检查网络连接和后端服务状态。

