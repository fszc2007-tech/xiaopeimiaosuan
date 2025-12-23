# 短信验证码配置说明

## 环境变量配置

请在 `core/.env` 文件中添加以下配置：

```bash
# ===== 腾讯云 API 密钥 =====
XIAOPEI_TENCENT_SECRET_ID=your_secret_id_here
XIAOPEI_TENCENT_SECRET_KEY=your_secret_key_here

# ===== 腾讯云短信配置 =====
XIAOPEI_TENCENT_SMS_APP_ID=your_sms_app_id_here
XIAOPEI_TENCENT_SMS_TEMPLATE_ID=2929187
XIAOPEI_TENCENT_SMS_REGION=ap-guangzhou

# ===== 验证码安全配置 =====
# 用于哈希验证码的盐值（请修改为随机字符串）
XIAOPEI_SMS_CODE_SALT=your_random_salt_change_me_2024
```

## 配置说明

### 1. 腾讯云 API 密钥

- `XIAOPEI_TENCENT_SECRET_ID`: 腾讯云 SecretId（在腾讯云控制台 → 访问管理 → API 密钥管理 获取）
- `XIAOPEI_TENCENT_SECRET_KEY`: 腾讯云 SecretKey

### 2. 腾讯云短信配置

- `XIAOPEI_TENCENT_SMS_APP_ID`: 短信应用 ID（在腾讯云短信控制台 → 应用管理 获取）
- `XIAOPEI_TENCENT_SMS_TEMPLATE_ID`: 短信模板 ID（已申请的模板 ID：2929187）
- `XIAOPEI_TENCENT_SMS_REGION`: 腾讯云地域（默认：ap-guangzhou）

### 3. 验证码安全配置

- `XIAOPEI_SMS_CODE_SALT`: 用于哈希验证码的盐值（请修改为随机字符串，至少 32 位）

### 4. 签名配置（暂时不需要）

- 签名功能暂未启用，因为还没申请
- 如果后续申请了签名，可以添加：
  ```bash
  XIAOPEI_TENCENT_SMS_SIGN_CN=小佩命理
  XIAOPEI_TENCENT_SMS_SIGN_INTL=XiaoPei
  ```

## API 接口说明

### 1. 发送验证码

**新接口（推荐）**：

```http
POST /api/v1/auth/send_code
Content-Type: application/json

{
  "phone": "91234567",       // 手机号（纯数字，无前缀）
  "countryCode": "+852",     // 国家代码
  "region": "hk",            // 地区（可选：cn/hk/mo/tw/intl）
  "scene": "login"           // 场景（可选：login/register）
}
```

**旧接口（兼容）**：

```http
POST /api/v1/auth/request-otp
Content-Type: application/json

{
  "phone": "91234567",
  "countryCode": "+852",
  "region": "hk"
}
```

### 2. 登录/注册

```http
POST /api/v1/auth/login_or_register
Content-Type: application/json

{
  "phone": "91234567",       // 手机号（纯数字）
  "countryCode": "+852",     // 国家代码
  "code": "123456",          // 验证码（6 位数字）
  "region": "hk",            // 地区（可选）
  "scene": "login",          // 场景（可选）
  "inviteCode": "ABC123"     // 邀请码（可选）
}
```

## 核心功能特性

### 1. 手机号规范化

- 支持多种格式输入（带/不带国家代码、带空格等）
- 自动转换为 E.164 国际标准格式（如 `+85291234567`）
- 使用 `libphonenumber-js` 验证号码有效性

### 2. 三层限流保护

- **1 分钟限流**：同一号码 1 分钟内最多发送 1 条
- **1 小时限流**：同一号码 1 小时内最多发送 5 条
- **24 小时限流**：同一号码 24 小时内最多发送 10 条
- **IP 限流**：同一 IP 1 小时内最多发送 20 条

### 3. 验证码复用策略（30分钟）

- 验证码有效期：30 分钟
- 复用窗口：30 分钟（与有效期相同）
- 用户在 30 分钟内重复请求，会生成新验证码（但仍受 1 分钟限流保护）
- 每次发送成功后，刷新 TTL 为 30 分钟

### 4. 验证码安全

- 使用 SHA256 哈希存储（不存明文）
- 输错次数限制：最多 5 次
- 一次性使用：验证成功后立即删除
- 状态管理：`pending` → `sent`（只有 `sent` 状态的验证码可以校验）

### 5. 多地区支持

- **香港**（+852）：繁体中文提示
- **大陆**（+86）：简体中文提示
- **澳门**（+853）：繁体中文提示
- **台湾**（+886）：繁体中文提示
- **国际**（其他）：英文提示

### 6. Redis Hash 存储

```
Key: sms:code:{scene}:{phone}
例如: sms:code:login:+85291234567

Hash Fields:
  - codeHash: string        (sha256 哈希)
  - createdAt: number       (创建时间戳)
  - lastSentAt: number      (最后发送时间戳)
  - attempts: number        (输错次数，0-5)
  - status: string          ("pending" | "sent")

TTL: 1800 秒（30 分钟）
```

## 测试步骤

### 1. 启动服务

```bash
cd /Users/gaoxuxu/Desktop/xiaopei-app/core
npm run dev
```

### 2. 测试发送验证码

```bash
curl -X POST http://localhost:3000/api/v1/auth/send_code \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "91234567",
    "countryCode": "+852",
    "region": "hk"
  }'
```

### 3. 测试登录

```bash
curl -X POST http://localhost:3000/api/v1/auth/login_or_register \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "91234567",
    "countryCode": "+852",
    "code": "123456"
  }'
```

### 4. 测试限流

连续发送多次，观察限流错误提示。

### 5. 测试验证码输错

输入错误的验证码 5 次，观察锁定提示。

## 错误码说明

| 错误码 | HTTP 状态 | 说明 |
|--------|-----------|------|
| `INVALID_PHONE` | 400 | 手机号格式不正确 |
| `RATE_LIMITED_1M` | 429 | 1 分钟限流 |
| `RATE_LIMITED_1H` | 429 | 1 小时限流 |
| `RATE_LIMITED_24H` | 429 | 24 小时限流 |
| `RATE_LIMITED_IP` | 429 | IP 限流 |
| `CODE_EXPIRED` | 401 | 验证码已过期 |
| `CODE_NOT_SENT` | 401 | 验证码未发送 |
| `CODE_MISMATCH` | 401 | 验证码不正确 |
| `TOO_MANY_ATTEMPTS` | 423 | 输错次数过多 |
| `SMS_SEND_FAILED` | 500 | 短信发送失败 |
| `PHONE_REGION_MISMATCH` | 400 | 手机号与地区不匹配 |

## 注意事项

1. **测试环境**：建议先使用腾讯云的测试环境进行测试
2. **成本控制**：港澳台短信费用约为大陆的 2 倍，注意监控成本
3. **安全配置**：`XIAOPEI_SMS_CODE_SALT` 必须是随机字符串，不要使用默认值
4. **Redis 依赖**：确保 Redis 服务正常运行，否则限流和验证码功能无法使用
5. **签名申请**：如果需要发送短信，需要先申请腾讯云短信签名

## 文件结构

```
core/
├── src/
│   ├── config/
│   │   ├── auth.ts              # 认证配置（已更新：30分钟有效期）
│   │   └── sms.ts               # 短信配置（新增）
│   ├── modules/
│   │   └── auth/
│   │       ├── authService.ts        # 认证服务（已重构）
│   │       ├── phoneNormalizer.ts    # 手机号规范化（新增）
│   │       ├── smsService.ts         # 腾讯云短信服务（新增）
│   │       └── rateLimitService.ts   # 限流服务（新增）
│   ├── routes/
│   │   └── auth.ts              # 认证路由（已更新）
│   └── types/
│       └── dto.ts               # DTO 类型（已更新）
└── package.json                 # 已添加依赖：libphonenumber-js, tencentcloud-sdk-nodejs-sms
```

## 开发完成状态

- ✅ 安装依赖（libphonenumber-js、腾讯云 SDK）
- ✅ 创建 SMS 配置文件（sms.ts）
- ✅ 创建手机号规范化工具（phoneNormalizer.ts）
- ✅ 创建腾讯云 SMS 服务（smsService.ts）
- ✅ 创建限流服务（rateLimitService.ts）
- ✅ 修改 auth 配置（auth.ts，30分钟有效期等）
- ✅ 修改 authService.ts（验证码生成、复用、Redis Hash）
- ✅ 修改 auth 路由（支持 countryCode 参数）
- ✅ 更新 DTO 类型（RequestOtpDto 等）

## 后续待完善

1. **前端适配**：前端需要添加国家代码选择器（默认 +852）
2. **监控告警**：添加短信发送量监控和成本告警
3. **审计日志**：记录所有短信发送和验证码校验的审计日志
4. **邮件支持**：如果需要邮箱登录，可以添加邮件验证码支持

## 问题排查

如果遇到问题，请检查：

1. **环境变量**：是否正确配置了所有必需的环境变量
2. **Redis 连接**：Redis 是否正常运行（`redis-cli ping` 应返回 PONG）
3. **腾讯云配置**：SecretId、SecretKey、AppId 是否正确
4. **短信模板**：模板 ID 2929187 是否已审核通过
5. **网络连接**：服务器是否能够访问腾讯云 API

## 联系方式

如有问题，请查看日志：

```bash
# 查看后端日志
cd /Users/gaoxuxu/Desktop/xiaopei-app/core
npm run dev
```

日志中会显示详细的错误信息和调试信息。

