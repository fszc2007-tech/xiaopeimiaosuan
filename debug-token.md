# Token 调试步骤

## 现状
- 调试信息显示：hasToken: true
- 但 API 请求报错：TOKEN_REQUIRED

## 已添加详细日志

现在重新加载 App，登录后查看 Expo 控制台输出：

### 应该看到：
```
[API Request] 拦截器调试: {
  url: '/api/v1/auth/me',
  hasToken: true/false,
  tokenLength: xxx,
  tokenPreview: 'eyJhbG...'
}
```

### 如果看到 hasToken: false
说明：authStore 中的 token 没有被正确读取

### 如果看到 hasToken: true
但还是报错，说明：后端验证 token 失败

## 请执行：

1. 按 Cmd+R 重新加载 App
2. 登录
3. 查看 Expo 控制台，找到 [API Request] 日志
4. 截图发给我

这样我们就能看到 token 到底有没有被发送到 API

