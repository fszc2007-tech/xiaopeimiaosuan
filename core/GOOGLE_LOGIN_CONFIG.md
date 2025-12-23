# Google 登录配置说明

## 环境变量配置

在 `.env` 文件中添加以下配置：

```bash
# Google OAuth Client IDs（逗号分隔，支持多个）
# ⚠️ P0 必须：Web Client ID 必须包含在内，否则前端无法获取 idToken
GOOGLE_ALLOWED_CLIENT_IDS=343578696044-gfrfdivav9muhaosdsf01fib85b9ep6q.apps.googleusercontent.com,343578696044-gjrucpeateqd8gln9fev4u3bqc5ime0q.apps.googleusercontent.com,343578696044-rtabgtpti1lpn1hhe5pqccljoac8d7ns.apps.googleusercontent.com
#                         ↑ Web Client ID (必须)                                ↑ Android Client ID (已配置)                            ↑ iOS Client ID (已配置)
```

## 配置说明

### Client ID 列表

| 类型 | Client ID | 状态 | 用途 |
|------|-----------|------|------|
| **Web** | `343578696044-gfrfdivav9muhaosdsf01fib85b9ep6q.apps.googleusercontent.com` | ✅ 已创建 | **必须配置**：前端获取 idToken + 后端验证 |
| **Android** | `343578696044-gjrucpeateqd8gln9fev4u3bqc5ime0q.apps.googleusercontent.com` | ✅ 已创建 | Android 应用标识 |
| **iOS** | `343578696044-rtabgtpti1lpn1hhe5pqccljoac8d7ns.apps.googleusercontent.com` | ✅ 已创建 | iOS 应用标识 |

### 配置格式

- **多个 Client ID 用逗号分隔**，例如：`ID1,ID2,ID3`
- **不要有空格**（或者确保代码中会 trim）
- **至少包含 Web Client ID**（必需，否则前端无法获取 idToken）

### ⚠️ P0 关键说明

**为什么必须配置 Web Client ID？**

即使只开发 App（不开发 Web 版本），Web Client ID 仍然是必须的：

1. **`webClientId` 的真实作用**：告诉 Google SDK，idToken 应该发给哪个后端服务器（不是"给 Web 版本用的"）
2. **Token 流转链路**：
   ```
   App (iOS/Android) 
     ↓ 用户授权
   Google SDK (使用 iOS/Android Client ID 标识 App)
     ↓ 需要 webClientId 才会生成 idToken
   返回 idToken
     ↓ 传给后端
   后端 (验证 idToken 的 audience 是否匹配 Web Client ID)
     ↓ 验证通过
   登录成功
   ```
3. **官方文档明确说明**：`webClientId` is required for iOS and Android to get the user's `idToken`

## 数据库迁移

运行数据库迁移以创建 `auth_identities` 表：

```bash
cd core
npm run migrate
```

或者手动执行迁移文件：

```bash
mysql -u root -p xiaopei_db < src/database/migrations/042_create_auth_identities.sql
```

## 验证配置

### 1. 检查环境变量

```bash
cd core
node -e "console.log('GOOGLE_ALLOWED_CLIENT_IDS:', process.env.GOOGLE_ALLOWED_CLIENT_IDS)"
```

### 2. 检查数据库表

```sql
SHOW TABLES LIKE 'auth_identities';
DESCRIBE auth_identities;
```

### 3. 测试 Google 登录

使用 Postman 或 curl 测试：

```bash
curl -X POST http://localhost:3000/api/v1/auth/third_party_login \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "google",
    "idToken": "YOUR_GOOGLE_ID_TOKEN",
    "app_region": "HK"
  }'
```

## 参考文档

- [Google 一键登录设计方案 v1.1-final（可执行版）](../Google一键登录设计方案-v1.1-可执行版.md)
- [React Native Google Sign-In 官方文档](https://react-native-google-signin.github.io/)
- [Google OAuth 2.0 文档](https://developers.google.com/identity/protocols/oauth2)
- [Google 后端验证指南](https://developers.google.com/identity/gsi/web/guides/verify-google-id-token)

## 故障排查

### 问题 1：前端无法获取 idToken

**原因**：未配置 Web Client ID

**解决**：
1. 在 Google Cloud Console 创建 Web 类型的 Client ID
2. 添加到 `GOOGLE_ALLOWED_CLIENT_IDS` 环境变量
3. 重启后端服务

### 问题 2：后端验证 Token 失败（Invalid audience）

**原因**：环境变量配置错误或缺少某个 Client ID

**解决**：
1. 检查 `GOOGLE_ALLOWED_CLIENT_IDS` 是否包含所有 Client ID（Web/Android/iOS）
2. 确认没有多余的空格或特殊字符
3. 重启后端服务

### 问题 3：Android Google 登录失败

**原因**：SHA-1 指纹未配置或配置错误

**解决**：
1. 参考 `获取Android-SHA1指纹指南.md` 获取正确的 SHA-1 指纹
2. 在 Google Cloud Console 中配置所有 SHA-1 指纹（开发/EAS/Play 三套）
3. 等待 5-10 分钟让配置生效

### 问题 4：地区限制错误（Region not supported）

**原因**：Google 登录仅支持 HK 地区

**解决**：
1. 确认客户端传递的 `app_region` 为 `'HK'`
2. CN 地区用户应使用手机号登录

## 开发环境快速配置

### 1. 复制环境变量

```bash
cd core
cp .env.example .env
```

### 2. 编辑 `.env` 文件，添加：

```bash
# Google OAuth Client IDs
GOOGLE_ALLOWED_CLIENT_IDS=343578696044-gfrfdivav9muhaosdsf01fib85b9ep6q.apps.googleusercontent.com,343578696044-gjrucpeateqd8gln9fev4u3bqc5ime0q.apps.googleusercontent.com,343578696044-rtabgtpti1lpn1hhe5pqccljoac8d7ns.apps.googleusercontent.com
```

### 3. 运行数据库迁移

```bash
npm run migrate
```

### 4. 重启服务

```bash
npm run dev
```

完成！Google 登录功能已配置完成。

