# Maestro 迁移指南

## 🎯 为什么选择 Maestro？

### 与 Expo 完美兼容
- ✅ 不需要修改原生代码
- ✅ 不需要添加 testID（可选）
- ✅ 支持 Expo Go 和开发构建
- ✅ 配置简单，易于维护

### 功能强大
- ✅ 支持复杂的测试场景
- ✅ 支持截图和视频录制
- ✅ 支持并行测试
- ✅ 支持条件逻辑和循环

## 🚀 迁移步骤

### 步骤 1: 安装 Maestro

```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
```

### 步骤 2: 验证安装

```bash
maestro --version
```

### 步骤 3: 创建测试目录

测试文件已创建在 `maestro/` 目录：
- `auth.yaml` - 认证流程测试
- `navigation.yaml` - 导航测试

### 步骤 4: 运行测试

```bash
# 运行所有测试
npm run test:maestro

# 在 iOS 上运行
npm run test:maestro:ios

# 在 Android 上运行
npm run test:maestro:android
```

## 📝 测试文件示例

### 认证测试 (maestro/auth.yaml)

```yaml
appId: com.xiaopei.app
---
- launchApp
- assertVisible: "登录"
- tapOn: "登录"
- inputText: "13800138000", into: "手机号"
- tapOn: "发送验证码"
- inputText: "123456", into: "验证码"
- tapOn: "登录"
- assertVisible: "首页"
```

### 导航测试 (maestro/navigation.yaml)

```yaml
appId: com.xiaopei.app
---
- launchApp
- tapOn: "檔案"
- assertVisible: "檔案"
- tapOn: "小佩"
- assertVisible: "小佩"
- tapOn: "我的"
- assertVisible: "我的"
```

## 🔄 从 Detox 迁移

### Detox vs Maestro

| 特性 | Detox | Maestro |
|------|-------|---------|
| 配置文件 | JavaScript | YAML |
| 需要 testID | ✅ 必需 | ❌ 可选 |
| 原生代码修改 | ✅ 需要 | ❌ 不需要 |
| Expo 支持 | ⚠️ 复杂 | ✅ 完美 |

### 迁移要点

1. **不需要 testID**
   - Maestro 可以通过文本、ID、坐标等方式定位元素
   - 现有的 testID 仍然可以使用

2. **YAML 格式**
   - 更简洁易读
   - 易于维护

3. **无需原生代码**
   - 不需要修改 Podfile
   - 不需要修改 AppDelegate

## 📚 学习资源

- [Maestro 官方文档](https://maestro.mobile.dev/)
- [Maestro GitHub](https://github.com/mobile-dev-inc/maestro)
- [Maestro 示例](https://maestro.mobile.dev/examples)

## ✅ 优势总结

1. **简单易用** - YAML 格式，易于编写
2. **完美兼容** - 与 Expo 完美兼容
3. **功能强大** - 支持复杂测试场景
4. **无需修改代码** - 不需要修改应用代码
5. **活跃维护** - 由 mobile.dev 团队维护

---

**建议**: 使用 Maestro 替代 Detox  
**预计迁移时间**: 30-60 分钟  
**难度**: ⭐⭐☆☆☆ (简单)

