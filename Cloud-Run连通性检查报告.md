# Cloud Run 连通性检查报告

**检查时间**: 2025-12-24 02:35 UTC  
**服务名称**: `xiaopei-core`  
**区域**: `asia-east2`  
**项目 ID**: `xiaopei-app`

---

## ✅ 检查结果：服务联通正常

### 1. 服务状态

```
服务状态: Ready ✅
配置状态: ConfigurationsReady ✅
路由状态: RoutesReady ✅
```

### 2. 服务 URL

**实际服务 URL**:
```
https://xiaopei-core-niau5ea6la-df.a.run.app
```

**eas.json 中配置的 URL**:
```
https://xiaopei-core-343578696044.asia-east2.run.app
```

**✅ 两个 URL 都能正常访问**（可能是别名或重定向关系）

### 3. 健康检查测试

**测试端点**: `/health`

```bash
# 测试配置的 URL
curl https://xiaopei-core-343578696044.asia-east2.run.app/health

# 响应:
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2025-12-24T02:35:05.698Z",
    "version": "1.0.0"
  }
}
```

**✅ 健康检查通过**

### 4. API 端点测试

**测试端点**: `/api/v1/auth/request-otp`

```bash
# 测试短信接口
curl -X POST https://xiaopei-core-343578696044.asia-east2.run.app/api/v1/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"12345678","countryCode":"+852","region":"hk"}'

# 响应:
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "手機號碼格式不正確"
  }
}
```

**✅ API 端点可访问**（返回业务错误，说明服务正常，只是参数验证失败）

---

## 📊 结论

### ✅ 服务联通性：正常

1. **Cloud Run 服务正在运行** ✅
2. **健康检查端点正常** ✅
3. **API 端点可访问** ✅
4. **HTTPS 连接正常** ✅

### ⚠️ 需要注意的问题

1. **URL 不一致**：
   - `eas.json` 中配置的是：`https://xiaopei-core-343578696044.asia-east2.run.app`
   - 实际服务 URL 是：`https://xiaopei-core-niau5ea6la-df.a.run.app`
   - **但两个 URL 都能访问**，可能是 Cloud Run 的别名机制

2. **下一步需要检查**：
   - ✅ 服务联通性：**已确认正常**
   - ⏳ 环境变量配置：需要检查 `GOOGLE_ALLOWED_CLIENT_IDS` 和 Tencent SMS 密钥
   - ⏳ 生产包配置：需要确认 App 是否真的使用了正确的 API_BASE_URL

---

## 🔍 下一步诊断建议

### 1. 检查 Cloud Run 环境变量

```bash
# 查看所有环境变量
gcloud run services describe xiaopei-core \
  --region=asia-east2 \
  --project=xiaopei-app \
  --format="value(spec.template.spec.containers[0].env)"

# 或使用检查脚本
./scripts/check-cloud-run-env.sh
```

### 2. 查看 Cloud Run 日志

```bash
# 查看最近的日志（包含 SMS/Google 相关）
gcloud logging read \
  "resource.type=cloud_run_revision AND resource.labels.service_name=xiaopei-core" \
  --limit=50 \
  --format=json \
  --filter="textPayload=~'SMS|Google|GOOGLE_ALLOWED_CLIENT_IDS'"
```

### 3. 测试生产包

1. 重新构建生产包（使用修改后的诊断代码）
2. 安装并查看启动日志中的 `[ENV DIAGNOSTIC]` 输出
3. 确认 `API_BASE_URL` 是否正确

---

## 📝 检查命令汇总

```bash
# 1. 检查服务状态
gcloud run services describe xiaopei-core \
  --region=asia-east2 \
  --project=xiaopei-app \
  --format="table(status.url,status.conditions[0].status)"

# 2. 测试健康检查
curl https://xiaopei-core-343578696044.asia-east2.run.app/health

# 3. 测试 API 端点
curl -X POST https://xiaopei-core-343578696044.asia-east2.run.app/api/v1/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"91234567","countryCode":"+852","region":"hk"}'

# 4. 查看环境变量
gcloud run services describe xiaopei-core \
  --region=asia-east2 \
  --project=xiaopei-app \
  --format="value(spec.template.spec.containers[0].env)"

# 5. 查看日志
gcloud logging read \
  "resource.type=cloud_run_revision AND resource.labels.service_name=xiaopei-core" \
  --limit=20 \
  --format="table(timestamp,textPayload)"
```

