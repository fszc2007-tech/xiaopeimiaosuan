# App 测试启动指南（Expo Go 版）

**更新时间**: 2025-11-18  
**适用场景**: 使用 Expo Go App 在真机上测试

---

## ✅ 前置检查

### 1. 确认后端已启动

```bash
# 检查后端是否运行
curl http://localhost:3000/health

# 应该返回: {"status":"ok"}
```

✅ **后端已在运行**（已确认）

### 2. 确认 Expo Go 已安装

- ✅ iOS: App Store 搜索 "Expo Go"
- ✅ Android: Google Play 搜索 "Expo Go"

---

## 🚀 启动步骤

### Step 1: 进入 App 目录

```bash
cd /Users/gaoxuxu/Desktop/小佩APP/app
```

### Step 2: 安装依赖（如果还没安装）

```bash
npm install
```

### Step 3: 启动 Expo 开发服务器

```bash
npx expo start --clear
```

**启动成功后会显示**：
```
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web

› Press r │ reload app
› Press m │ toggle menu
› Press ? │ show all commands
```

---

## 📱 在手机上连接

### 方式 1: iOS（iPhone）

1. **打开相机 App**
2. **扫描终端中的二维码**
3. **点击通知横幅** → 自动打开 Expo Go
4. **等待加载完成**（首次加载可能需要 1-2 分钟）

### 方式 2: Android

1. **打开 Expo Go App**
2. **点击 "Scan QR code"**
3. **扫描终端中的二维码**
4. **等待加载完成**

---

## ⚠️ 常见问题

### 问题 1: 无法连接到开发服务器

**错误信息**：
```
Unable to connect to Metro bundler
```

**解决方案**：

#### 方案 A: 确保手机和电脑在同一 Wi-Fi

```bash
# 1. 查看电脑的 IP 地址
ifconfig | grep "inet " | grep -v 127.0.0.1

# 2. 在手机上连接同一个 Wi-Fi 网络
```

#### 方案 B: 使用 Tunnel 模式（推荐）

```bash
# 停止当前服务器（Ctrl + C）
# 重新启动，使用 tunnel 模式
npx expo start --tunnel

# 这会生成一个可公网访问的 URL
# 即使不在同一 Wi-Fi 也能连接
```

#### 方案 C: 手动指定 IP

```bash
# 1. 查看电脑 IP（例如：192.168.1.100）
ifconfig | grep "inet " | grep -v 127.0.0.1

# 2. 设置环境变量
export EXPO_PUBLIC_API_BASE_URL=http://192.168.1.100:3000

# 3. 启动 Expo
npx expo start --host tunnel
```

---

### 问题 2: API 请求失败（Network Error）

**原因**：手机无法访问 `localhost:3000`

**解决方案**：

#### 修改环境变量使用电脑的 IP 地址

```bash
# 1. 查看电脑 IP
ifconfig | grep "inet " | grep -v 127.0.0.1
# 例如：192.168.1.100

# 2. 修改 .env 文件
cd /Users/gaoxuxu/Desktop/小佩APP/app
cat > .env << EOF
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.100:3000
EOF

# 3. 重启 Expo 服务器
npx expo start --clear
```

**注意**：确保后端允许来自手机 IP 的请求（CORS 配置）

---

### 问题 3: 二维码不显示

**解决方案**：

```bash
# 使用 LAN 模式（显示 IP 地址）
npx expo start --lan

# 或者手动输入 URL
# 在 Expo Go 中点击 "Enter URL manually"
# 输入: exp://192.168.x.x:8081
```

---

### 问题 4: 后端 CORS 错误

**错误信息**：
```
Access to XMLHttpRequest at 'http://192.168.1.100:3000/...' from origin 'exp://192.168.1.100:8081' has been blocked by CORS policy
```

**解决方案**：

检查 `core/src/server.ts` 的 CORS 配置：

```typescript
const allowedOrigins = [
  'http://localhost:3001',
  'http://localhost:5173',
  'exp://192.168.1.100:8081',  // 添加 Expo 的 origin
  /^exp:\/\/.*/,  // 或者允许所有 exp:// 开头的 origin
];
```

---

## 🧪 测试流程

### 1. 登录/注册测试

1. **打开 App** → 应该显示登录/注册页面
2. **选择地区**：CN 或 HK
3. **输入手机号**（测试阶段可不验证）
4. **输入密码**：至少 6 位
5. **点击登录/注册**

**预期结果**：
- ✅ 成功登录
- ✅ 跳转到主页

---

### 2. 手动排盘测试

1. **点击底部导航"排盤"**
2. **填写出生信息**：
   - 出生日期：选择日期
   - 出生时间：选择时间
   - 出生地点：输入城市
   - 性别：选择
3. **点击"生成命盘"**

**预期结果**：
- ✅ 显示加载状态
- ✅ 跳转到命盘详情页
- ✅ 显示基本信息、命盘总览、大运流年

---

### 3. AI 聊天测试

1. **点击底部导航"小佩"**
2. **在输入框输入问题**：例如"我的命盘怎么样？"
3. **点击发送**

**预期结果**：
- ✅ 显示 AI 回复（流式输出）
- ✅ 显示追问建议

---

### 4. 命盘详情测试

1. **从"檔案"进入命盘列表**
2. **点击一个命盘**
3. **切换标签页**：基本信息、命盘总览、大运流年

**预期结果**：
- ✅ 数据正确显示
- ✅ 图表正常渲染
- ✅ 点击"一键解读"能触发 AI 解读

---

## 📋 快速启动命令

### 一键启动脚本

```bash
#!/bin/bash
# 保存为 start-app.sh

cd /Users/gaoxuxu/Desktop/小佩APP/app

# 检查后端
if ! curl -s http://localhost:3000/health > /dev/null; then
  echo "❌ 后端未启动，请先启动后端！"
  exit 1
fi

# 启动 Expo
echo "🚀 启动 Expo 开发服务器..."
npx expo start --clear
```

**使用方法**：
```bash
chmod +x start-app.sh
./start-app.sh
```

---

## 🔧 开发模式快捷键

在 Expo 开发服务器运行时：

| 按键 | 功能 |
|------|------|
| `r` | 重新加载 App |
| `m` | 打开开发菜单 |
| `i` | 打开 iOS 模拟器 |
| `a` | 打开 Android 模拟器 |
| `w` | 打开 Web 浏览器 |
| `?` | 显示所有命令 |

---

## 📱 真机调试技巧

### 1. 查看日志

在 Expo Go 中：
1. **摇一摇手机**（或三指下滑）
2. **选择 "Debug Remote JS"**
3. **打开 Chrome DevTools**（会自动打开）
4. **查看 Console 日志**

### 2. 热重载

修改代码后：
- **自动重载**：保存文件后，App 会自动刷新
- **手动重载**：摇一摇手机 → "Reload"

### 3. 清除缓存

```bash
# 停止服务器（Ctrl + C）
# 清除缓存并重启
npx expo start --clear
```

---

## 🎯 测试检查清单

### 基础功能
- [ ] App 能正常启动
- [ ] 登录/注册功能正常
- [ ] 底部导航正常切换
- [ ] 页面跳转正常

### 核心功能
- [ ] 手动排盘能生成命盘
- [ ] 命盘详情页数据正确
- [ ] AI 聊天能正常对话
- [ ] 流式输出正常显示

### UI/UX
- [ ] 界面显示正常（无空白）
- [ ] 文字显示正确（繁体中文）
- [ ] 按钮点击有反馈
- [ ] 加载状态正常显示

### 数据同步
- [ ] 命盘列表能正确显示
- [ ] 创建新命盘后列表更新
- [ ] 用户信息正确显示

---

## 🆘 遇到问题？

### 1. 查看后端日志

```bash
# 查看后端日志
tail -f /tmp/core-final2.log
```

### 2. 查看 Expo 日志

在终端中查看 Expo 开发服务器的输出

### 3. 查看手机日志

在 Expo Go 中：
- 摇一摇手机
- 选择 "Show Element Inspector"
- 查看组件树和样式

---

## 📞 下一步

测试完成后，如果发现问题：
1. **记录问题**：截图 + 描述
2. **查看日志**：后端日志 + Expo 日志
3. **复现步骤**：详细的操作步骤
4. **反馈问题**：提供以上信息

---

**祝测试顺利！** 🚀

