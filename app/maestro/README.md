# Maestro E2E 测试

## 📋 简介

Maestro 是一个现代化的移动端 E2E 测试框架，与 Expo 完美兼容。

## 🚀 快速开始

### 1. 安装 Maestro

```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
```

### 2. 验证安装

```bash
maestro --version
```

### 3. 运行测试

```bash
# 运行所有测试
maestro test maestro/

# 运行特定测试
maestro test maestro/auth.yaml

# 在 iOS 模拟器上运行
maestro test maestro/ --device "iPhone 17 Pro"
```

## 📝 测试文件结构

```
maestro/
├── README.md
├── auth.yaml          # 认证流程测试
├── navigation.yaml    # 导航测试
└── chat.yaml          # 聊天功能测试
```

## 📚 测试示例

### 基础测试

```yaml
appId: com.xiaopei.app
---
- launchApp
- assertVisible: "登录"
- tapOn: "登录"
```

### 输入文本

```yaml
- inputText: "13800138000", into: "手机号"
- tapOn: "发送验证码"
```

### 断言

```yaml
- assertVisible: "首页"
- assertNotVisible: "登录"
```

## 🔧 配置

### 应用 ID

在测试文件顶部指定应用 ID：
```yaml
appId: com.xiaopei.app
```

### 设备配置

```bash
maestro test maestro/ --device "iPhone 17 Pro"
```

## 📖 更多信息

- [Maestro 官方文档](https://maestro.mobile.dev/)
- [Maestro GitHub](https://github.com/mobile-dev-inc/maestro)

