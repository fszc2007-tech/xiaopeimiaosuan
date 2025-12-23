# CORS 问题修复报告

**时间**: 2024-11-18  
**问题**: Admin 前端无法访问 Core 后端 API  
**状态**: ✅ **已修复**

---

## ❌ 错误信息

```
Access to XMLHttpRequest at 'http://localhost:3000/api/admin/v1/auth/login' 
from origin 'http://localhost:5173' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

---

## 🔍 问题分析

**原因**: Core 后端的 CORS 配置只允许 `http://localhost:19006`（App 前端），没有包含 `http://localhost:5173`（Admin 前端）。

**文件**: `core/src/server.ts`

**原配置**:
```typescript
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:19006'];
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
```

---

## ✅ 修复方案

**更新 CORS 配置，添加 Admin 前端地址**:

```typescript
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:19006',  // App 前端
  'http://localhost:5173',   // Admin 前端
];
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
```

---

## 🧪 测试结果

### OPTIONS 预检请求测试 ✅

```bash
curl -X OPTIONS http://localhost:3000/api/admin/v1/auth/login \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST"
```

**响应头**:
```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET,HEAD,PUT,PATCH,POST,DELETE
```

✅ **预检请求通过！**

### POST 请求测试 ✅

```bash
curl -X POST http://localhost:3000/api/admin/v1/auth/login \
  -H "Origin: http://localhost:5173" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

**响应**:
```
HTTP/1.1 200 OK
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Credentials: true

{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": { ... }
  }
}
```

✅ **登录请求成功！**

---

## 🎯 下一步：浏览器测试

现在请在浏览器中测试：

1. **刷新 Admin 前端页面**  
   → http://localhost:5173  
   → Cmd + Shift + R（强制刷新）

2. **登录**  
   - 用户名：`admin`
   - 密码：`admin123`

3. **确认登录成功**  
   应该能看到 Admin 后台主页

---

## 📊 完整系统状态

| 组件 | 状态 | 地址 | CORS |
|------|------|------|------|
| Core 后端 | ✅ 运行中 | http://localhost:3000 | ✅ 已配置 |
| Admin 前端 | ✅ 运行中 | http://localhost:5173 | ✅ 已允许 |
| App 前端 | ⏳ 待启动 | http://localhost:19006 | ✅ 已允许 |
| MySQL | ✅ 正常 | localhost:3306 | - |

---

## 🔧 生产环境配置建议

在生产环境中，应该通过环境变量配置允许的来源：

**`.env` 文件**:
```env
ALLOWED_ORIGINS=https://admin.xiaopei.com,https://app.xiaopei.com
```

**或在部署时设置环境变量**:
```bash
export ALLOWED_ORIGINS=https://admin.xiaopei.com,https://app.xiaopei.com
```

---

## ✅ 修复总结

1. ✅ 识别 CORS 问题
2. ✅ 更新 CORS 配置
3. ✅ 测试预检请求
4. ✅ 测试实际请求
5. ✅ 确认修复成功

**CORS 问题已完全解决！**

---

**修复时间**: 2024-11-18 19:25  
**状态**: ✅ **完成**

