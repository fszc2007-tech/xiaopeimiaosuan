# 修复说明：Dev 路由已成功注册

## ✅ 问题已解决

### 问题原因
Dev 路由使用了异步 `import()`，导致路由注册延迟，在服务器启动时还未完成注册。

### 修复方案
将异步 `import()` 改为同步 `require()`，确保路由在服务器启动前完成注册。

### 验证结果

1. **Dev 路由已注册**
   ```
   [Dev] Development routes registered at /dev/*
   ```

2. **路由可以访问**
   ```bash
   curl http://localhost:3000/dev/force-pro
   # 返回 401（需要认证），而不是 404
   ```

3. **Core 服务正常运行**
   ```bash
   curl http://localhost:3000/health
   # 返回 {"success":true,"data":{"status":"ok",...}}
   ```

---

## 🚀 下一步操作

### 1. 确保 App 重新加载环境变量

由于环境变量是在编译时注入的，需要：

**方法 1：重启 Expo 服务（推荐）**
```bash
cd app
# 停止当前服务（Ctrl+C）
npx expo start -c
```

**方法 2：清除缓存并重新加载**
- 在 App 中：摇一摇设备 → "Reload"
- 或者在 Expo Dev Tools 中点击 "Reload"

### 2. 验证 Mock 模式

App 启动时应该看到：
```
[ENV Config] 🎭 Mock iOS 订阅: ✅ 开启
```

### 3. 测试订阅

1. 确保已登录（有有效的 token）
2. 进入「小佩 Pro」页面
3. 选择「季度订阅」（HK$ 99）
4. 点击「立即订阅」
5. 应该看到「订阅成功」提示

---

## 🔍 如果仍然报错

### 错误 1：404 Not Found

**原因**：App 还没有重新加载，或者环境变量未生效

**解决**：
1. 完全重启 Expo 服务：`npx expo start -c`
2. 在 App 中重新加载：摇一摇 → Reload
3. 检查启动日志是否有 `🎭 Mock iOS 订阅: ✅ 开启`

### 错误 2：401 Unauthorized

**原因**：用户未登录或 token 过期

**解决**：
1. 在 App 中重新登录
2. 检查 `useAuthStore` 中是否有有效的 token

### 错误 3：500 Internal Server Error

**原因**：数据库迁移未执行或数据库连接问题

**解决**：
```bash
# 检查数据库迁移
mysql -u root -p xiaopei -e "SHOW COLUMNS FROM subscriptions WHERE Field='plan';"
# 应该看到 quarterly 在 enum 中

# 如果未执行迁移
mysql -u root -p xiaopei < core/src/database/migrations/012_add_quarterly_plan.sql
```

---

## 📝 技术细节

### 修改的文件
- `core/src/server.ts`：将异步 `import()` 改为同步 `require()`

### 修改前
```typescript
if (process.env.NODE_ENV !== 'production') {
  import('./routes/dev').then(devRoutes => {
    app.use('/dev', devRoutes.default);
  });
}
```

### 修改后
```typescript
if (process.env.NODE_ENV !== 'production') {
  const devRoutes = require('./routes/dev').default;
  app.use('/dev', devRoutes);
  console.log('[Dev] Development routes registered at /dev/*');
}
```

---

**修复完成时间**：2025-12-03  
**状态**：✅ Dev 路由已成功注册，等待 App 重新加载


