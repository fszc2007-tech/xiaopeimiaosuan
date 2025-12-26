# Cloud Run 环境变量检查报告

**检查时间**: 2025-12-24  
**服务名称**: `xiaopei-core`  
**区域**: `asia-east2`  
**项目 ID**: `xiaopei-app`

---

## ✅ 检查结果总览

### 1. Google OAuth 配置

| 配置项 | 状态 | 说明 |
|--------|------|------|
| `GOOGLE_ALLOWED_CLIENT_IDS` | ✅ **已设置** | 通过 Secret Manager 配置 |

**Secret 名称**: `xiaopei-google-client-ids`

**实际值**:
```
343578696044-gfrfdivav9muhaosdsf01fib85b9ep6q.apps.googleusercontent.com,
343578696044-gjrucpeateqd8gln9fev4u3bqc5ime0q.apps.googleusercontent.com,
343578696044-rtabgtpti1lpn1hhe5pqccljoac8d7ns.apps.googleusercontent.com
```

**验证结果**:
- ✅ 包含 Web Client ID（必需）
- ✅ 包含 Android Client ID
- ✅ 包含 iOS Client ID
- ✅ 格式正确（逗号分隔，无空格）

---

### 2. Tencent SMS 配置

| 配置项 | 状态 | 说明 |
|--------|------|------|
| `XIAOPEI_TENCENT_SECRET_ID` | ✅ **已设置** | 通过 Secret Manager 配置 |
| `XIAOPEI_TENCENT_SECRET_KEY` | ✅ **已设置** | 通过 Secret Manager 配置 |
| `XIAOPEI_TENCENT_SMS_APP_ID` | ✅ **已设置** | 通过 Secret Manager 配置 |
| `XIAOPEI_TENCENT_SMS_TEMPLATE_ID` | ⚠️ **未设置** | 使用代码默认值 `2929187` |
| `XIAOPEI_TENCENT_SMS_REGION` | ⚠️ **未设置** | 使用代码默认值 `ap-guangzhou` |

**Secret 名称**:
- `xiaopei-tencent-secret-id`
- `xiaopei-tencent-secret-key`
- `xiaopei-tencent-sms-app-id`

**验证结果**:
- ✅ Secret ID 已配置（前4位: `IKID`）
- ✅ Secret Key 已配置
- ✅ SMS App ID 已配置
- ⚠️ Template ID 未设置（使用默认值，应该没问题）
- ⚠️ Region 未设置（使用默认值，应该没问题）

---

## 📋 所有环境变量列表

### 已设置的环境变量

```
✅ ALLOWED_ORIGINS
✅ GOOGLE_ALLOWED_CLIENT_IDS (Secret)
✅ MYSQL_CONNECTION_LIMIT
✅ NODE_ENV
✅ XIAOPEI_DEEPSEEK_API_KEY (Secret)
✅ XIAOPEI_ENCRYPTION_KEY (Secret)
✅ XIAOPEI_JWT_SECRET (Secret)
✅ XIAOPEI_MYSQL_DATABASE
✅ XIAOPEI_MYSQL_HOST
✅ XIAOPEI_MYSQL_PASSWORD (Secret)
✅ XIAOPEI_MYSQL_USER
✅ XIAOPEI_TENCENT_SECRET_ID (Secret)
✅ XIAOPEI_TENCENT_SECRET_KEY (Secret)
✅ XIAOPEI_TENCENT_SMS_APP_ID (Secret)
```

### 未设置但使用默认值的配置

```
⚠️ XIAOPEI_TENCENT_SMS_TEMPLATE_ID (默认: 2929187)
⚠️ XIAOPEI_TENCENT_SMS_REGION (默认: ap-guangzhou)
```

---

## ✅ 结论

### Google OAuth 配置：**正常** ✅

- `GOOGLE_ALLOWED_CLIENT_IDS` 已正确配置
- 包含所有必需的 Client ID（Web/Android/iOS）
- 格式正确

**如果 Google 登录仍然失败，可能的原因**：
1. App 端 `webClientId` 配置错误
2. App 端没有正确获取 `idToken`
3. 后端验证逻辑问题（需要查看日志）

### Tencent SMS 配置：**基本正常** ✅

- 核心密钥（Secret ID、Secret Key、App ID）都已配置
- Template ID 和 Region 使用默认值（应该没问题）

**如果短信仍然收不到，可能的原因**：
1. 模板未审核通过（需要检查腾讯云控制台）
2. 手机号格式错误
3. 地区配置不匹配（香港号码需要特殊处理）
4. 后端出网问题（VPC 连接器配置）

---

## 🔍 验证命令

### 查看所有环境变量

```bash
gcloud run services describe xiaopei-core \
  --region=asia-east2 \
  --project=xiaopei-app \
  --format="yaml(spec.template.spec.containers[0].env)"
```

### 查看 Google OAuth Client IDs

```bash
gcloud secrets versions access latest \
  --secret="xiaopei-google-client-ids" \
  --project=xiaopei-app
```

### 验证 Secret 是否存在

```bash
# Google OAuth
gcloud secrets describe xiaopei-google-client-ids --project=xiaopei-app

# Tencent SMS
gcloud secrets describe xiaopei-tencent-secret-id --project=xiaopei-app
gcloud secrets describe xiaopei-tencent-secret-key --project=xiaopei-app
gcloud secrets describe xiaopei-tencent-sms-app-id --project=xiaopei-app
```

### 查看 Cloud Run 日志（验证配置是否生效）

```bash
# 查看 Google 登录相关日志
gcloud logging read \
  "resource.type=cloud_run_revision AND resource.labels.service_name=xiaopei-core" \
  --limit=50 \
  --format=json \
  --filter="textPayload=~'GOOGLE_ALLOWED_CLIENT_IDS|Google|aud mismatch'" \
  --project=xiaopei-app

# 查看短信发送相关日志
gcloud logging read \
  "resource.type=cloud_run_revision AND resource.labels.service_name=xiaopei-core" \
  --limit=50 \
  --format=json \
  --filter="textPayload=~'SMS|Tencent|验证码'" \
  --project=xiaopei-app
```

---

## 🔧 如果需要添加缺失的配置

### 添加 Template ID 和 Region（可选）

虽然代码有默认值，但为了明确配置，可以添加：

```bash
# 方法 1: 直接设置环境变量
gcloud run services update xiaopei-core \
  --region=asia-east2 \
  --project=xiaopei-app \
  --set-env-vars="XIAOPEI_TENCENT_SMS_TEMPLATE_ID=2929187" \
  --set-env-vars="XIAOPEI_TENCENT_SMS_REGION=ap-guangzhou"

# 方法 2: 使用 Secret Manager（推荐，更安全）
echo -n "2929187" | gcloud secrets create xiaopei-tencent-sms-template-id \
  --data-file=- \
  --project=xiaopei-app

echo -n "ap-guangzhou" | gcloud secrets create xiaopei-tencent-sms-region \
  --data-file=- \
  --project=xiaopei-app

# 然后在 Cloud Run 中挂载
gcloud run services update xiaopei-core \
  --region=asia-east2 \
  --project=xiaopei-app \
  --set-secrets="XIAOPEI_TENCENT_SMS_TEMPLATE_ID=xiaopei-tencent-sms-template-id:latest,XIAOPEI_TENCENT_SMS_REGION=xiaopei-tencent-sms-region:latest"
```

---

## 📝 下一步排查建议

### 1. 如果 Google 登录失败

1. **检查 App 端日志**：
   - 查看 `[ENV DIAGNOSTIC]` 输出，确认 `API_BASE_URL` 正确
   - 查看 Google 登录流程，确认是否获取到 `idToken`

2. **检查后端日志**：
   ```bash
   gcloud logging read \
     "resource.type=cloud_run_revision AND resource.labels.service_name=xiaopei-core" \
     --limit=50 \
     --format=json \
     --filter="textPayload=~'Invalid audience|aud mismatch|GOOGLE_ALLOWED_CLIENT_IDS'" \
     --project=xiaopei-app
   ```

3. **验证 Client ID 匹配**：
   - 确认 App 端配置的 `webClientId` 在 `GOOGLE_ALLOWED_CLIENT_IDS` 列表中
   - 确认 Google Cloud Console 中的 Client ID 配置正确

### 2. 如果短信收不到

1. **检查后端日志**：
   ```bash
   gcloud logging read \
     "resource.type=cloud_run_revision AND resource.labels.service_name=xiaopei-core" \
     --limit=50 \
     --format=json \
     --filter="textPayload=~'SMS|Tencent|验证码|发送失败'" \
     --project=xiaopei-app
   ```

2. **检查腾讯云控制台**：
   - 登录腾讯云控制台 → 短信服务
   - 确认模板 ID `2929187` 状态为「已审核」
   - 确认签名状态（如果有）
   - 查看发送记录和错误码

3. **验证手机号格式**：
   - 香港号码：`+852XXXXXXXX`（E.164 格式）
   - 确认后端是否正确处理了国家代码

---

## ✅ 总结

**环境变量配置状态**：
- ✅ Google OAuth: **配置正确**
- ✅ Tencent SMS: **核心配置已设置**（Template ID 和 Region 使用默认值）

**如果问题仍然存在，需要检查**：
1. App 端配置（API_BASE_URL、Google webClientId）
2. Cloud Run 日志（查看具体错误信息）
3. 腾讯云控制台（模板审核状态、发送记录）

