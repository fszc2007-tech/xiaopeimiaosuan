# Google 一键登录设计方案 v1.1-final（可执行版）

> **版本**: v1.1-final  
> **创建日期**: 2024年12月  
> **最后更新**: 2024年12月（整合所有优化补丁）  
> **状态**: 可执行设计方案（可直接落地）  
> **优先级**: P0（上线前必须完成）

---

## 📋 一、依据文档

- ✅ `app.doc/features/注册登录设计文档.md` - 海外版支持 Google 登录
- ✅ `app.doc/API接口统一规范.md` - 第三方登录接口规范（`POST /api/v1/auth/third_party_login`）
- ✅ 现有实现：`app/src/screens/Auth/AuthScreen.tsx`（手机号登录）
- ✅ 数据库结构：`core/src/database/migrations/001_create_tables.sql`

---

## 🎯 二、需求确认与关键决策

### 2.1 已确认信息

| 项目 | 值 | 说明 |
|------|-----|------|
| **Android 客户端 ID** | `343578696044-gjrucpeateqd8gln9fev4u3bqc5ime0q.apps.googleusercontent.com` | ✅ 已创建 |
| **iOS 客户端 ID** | `343578696044-rtabgtpti1lpn1hhe5pqccljoac8d7ns.apps.googleusercontent.com` | ✅ 已创建 |
| **Web 客户端 ID** | （待创建） | ⚠️ **P0 必须创建**（否则拿不到 idToken） |
| **Package Name** | `tech.dawnai.xiaopei.app` | ✅ 已确认 |
| **Bundle ID (iOS)** | `tech.dawnai.xiaopei.app` | ✅ 已确认 |
| **Android SHA-1 指纹** | 已配置（开发/EAS/Play 三套） | ✅ 已配置 |
| **账号绑定策略** | 单独创建账号 | Google 登录用户不绑定手机号 |
| **用户数据存储** | 存储基本字段 | email, name, picture（无额外要求） |
| **开发环境** | 是 | 未来还要做 Apple ID 一键登录 |
| **地区策略** | HK 才显示 Google | CN 只显示微信/支付宝 |

### 2.2 关键决策（P0 必须定案）

#### 决策 1：iOS 审核合规策略 ⚠️ P0 风险

**问题**：Apple 审核要求：如果使用第三方登录（Google/微信等）作为主账号登录，需要提供"等效登录选项"，并满足：
- 仅收集姓名和邮箱
- 允许用户隐藏邮箱
- 不做广告目的追踪（未经同意）

**当前状态**：
- ✅ 开发环境，暂不涉及审核
- ⚠️ **未来需要做 Apple ID 一键登录**（已确认）

**决策**：
- **当前阶段**：仅实现 Google 登录（开发环境）
- **上线前**：必须同步实现 Apple 登录（Sign in with Apple）
- **风险标注**：在方案中明确标注此 P0 风险，上线前必须完成

**实施建议**：
- 数据模型设计时预留 Apple 登录支持（`auth_identities` 表）
- 接口设计时支持 `provider: 'google' | 'apple'`
- UI 设计时预留 Apple 登录按钮位置

#### 决策 2：OAuth Client ID 策略 ⚠️ P0 配置

**问题**：当前方案将 Android 客户端 ID 直接作为 `webClientId`，可能导致后端验证失败。

**决策**：
- ✅ 在 Google Cloud Console 创建 **Web / Android / iOS** 三类 Client ID
- ✅ 后端使用 **audience 白名单**验证（支持多个 client ID）
- ✅ 前端配置：Android 用 Android Client ID，iOS 用 iOS Client ID，Web 用 Web Client ID

**配置清单**：
```
GOOGLE_CLIENT_IDS = [
  '343578696044-xxx.apps.googleusercontent.com',  // Web Client ID（⚠️ P0 必须创建）
  '343578696044-gjrucpeateqd8gln9fev4u3bqc5ime0q.apps.googleusercontent.com',  // Android Client ID ✅
  '343578696044-rtabgtpti1lpn1hhe5pqccljoac8d7ns.apps.googleusercontent.com',  // iOS Client ID ✅
]
```

**⚠️ P0 关键说明**：
- **Web Client ID 必须创建**：`@react-native-google-signin/google-signin` 的 `GoogleSignin.configure()` 中，**只有配置了有效的 `webClientId`（必须是 Web 类型的 Client ID）时，`idToken` 才会非空**
- 没有 `webClientId`，整个登录链路无法工作（客户端拿不到 `idToken`，无法传给后端验证）
- 后端验证时，`verifyIdToken({ audience: WEB_CLIENT_ID })` 也推荐使用 Web Client ID（支持多 client 列表）

#### 决策 3：接口与数据模型 ⚠️ P0 架构

**问题**：原方案使用专用接口 `/google_login`，但 API 规范已有 `third_party_login`。

**决策**：
- ✅ **复用统一接口**：`POST /api/v1/auth/third_party_login`
- ✅ **使用 `auth_identities` 表**：而非直接在 users 表加字段
- ✅ **内部服务层**：保留 `googleAuthService`，但路由层统一

**理由**：
- 未来支持 Apple/微信/支付宝时，无需重复造轮子
- 统一鉴权、风控、日志、DTO
- 扩展成本最低

#### 决策 4：Package Name / Bundle ID 一致性 ⚠️ P0 发布决策

**问题**：代码中为 `com.xiaopei.app`，Google Console 为 `tech.dawnai.xiaopei.app`。

**决策**：
- ✅ **已确认**：统一使用 `tech.dawnai.xiaopei.app`
- ⚠️ **发布前必须锁死**：一旦上架后不可逆
- ⚠️ **统一配置**：Google Console / Apple / EAS / 代码配置统一
- ⚠️ **环境区分**：dev/staging/prod 可用不同 `applicationIdSuffix`

**建议**：
- 在 v1 上架前确定最终 ID
- 所有配置以最终 ID 为准
- 记录在配置清单中

#### 决策 5：地区策略 ⚠️ P0 强约束

**策略**：`app_region='HK'` 才展示 Google 登录；`app_region='CN'` 只展示微信/支付宝，不出现 Google。

**决策**：
- ✅ **前端校验**：`AuthScreen` 根据 `app_region` 决定是否渲染 Google 按钮
- ✅ **后端校验**：`third_party_login` 也要校验 region：`app_region != 'HK'` 时拒绝 `provider='google'`（避免被抓包绕过）
- ✅ **双保险**：前后端都要校验，确保安全

**实施要求**：
- 前端：`app_region === 'HK'` 时才显示 Google 登录按钮
- 后端：`app_region !== 'HK'` 时返回错误 `REGION_NOT_SUPPORTED`

---

## 🎨 三、UI/UX 流程设计

### 3.1 页面布局调整

**调整后布局（HK 地区）**：
```
┌─────────────────────────────────┐
│         Logo + 标题              │
├─────────────────────────────────┤
│   ☑ 我已閱讀並同意《私隱政策》    │
│      《用戶協議》及《個人資料      │
│      收集聲明》                  │
│   [查看协议链接]                 │
├─────────────────────────────────┤
│   選擇登入方式：                  │
│   ┌─────────────────────────┐   │
│   │  📱 電話號碼登入         │   │
│   └─────────────────────────┘   │
│   ┌─────────────────────────┐   │
│   │  🔵 Google 一鍵登入      │   │
│   └─────────────────────────┘   │
│   [预留：🍎 Apple 登入]          │
├─────────────────────────────────┤
│   [根据选择显示对应表单]          │
└─────────────────────────────────┘
```

**调整后布局（CN 地区）**：
```
┌─────────────────────────────────┐
│         Logo + 标题              │
├─────────────────────────────────┤
│   ☑ 我已阅读并同意《隐私政策》    │
│      《用户协议》及《个人资料      │
│      收集声明》                  │
│   [查看协议链接]                 │
├─────────────────────────────────┤
│   选择登录方式：                  │
│   ┌─────────────────────────┐   │
│   │  📱 电话号码登录         │   │
│   └─────────────────────────┘   │
│   [不显示 Google 登录]           │
│   [预留：微信/支付宝登录]        │
├─────────────────────────────────┤
│   [根据选择显示对应表单]          │
└─────────────────────────────────┘
```

**⚠️ P0 地区策略约束**：
- **HK 地区**：显示电话号码登录 + Google 登录
- **CN 地区**：只显示电话号码登录（不显示 Google 登录）
- **前端校验**：根据 `app_region` 动态渲染登录方式按钮
- **后端校验**：`app_region !== 'HK'` 时拒绝 `provider='google'` 请求

### 3.2 交互流程

#### 流程 A：电话号码登录
1. **进入页面** → 显示协议确认 + 登录方式按钮
2. **用户勾选协议**（未勾选时，按钮可点击但会拦截提示）
3. **点击「電話號碼登入」** → 验证协议 → 展开手机号输入表单
4. **输入手机号** → 发送验证码 → 输入验证码 → 登录

#### 流程 B：Google 一键登录
1. **进入页面** → 显示协议确认 + 登录方式按钮
2. **用户勾选协议**（未勾选时，按钮可点击但会拦截提示）
3. **点击「Google 一鍵登入」** → 验证协议 → 调起 Google 登录 SDK
4. **用户选择 Google 账号** → 授权 → 自动登录（无需输入验证码）

### 3.3 协议确认交互优化（P2 体验优化）

**方案选择**：**方案 A（推荐）** - 不禁用按钮，允许点击但拦截并提示

**交互逻辑**：
- ✅ 未勾选时：按钮可用（不禁用），点击时拦截并提示「請先同意服務條款」+ 震动反馈
- ✅ 已勾选时：按钮可用，正常执行登录流程
- ✅ 协议链接：明确的「查看协议」点击区域（可打开 WebView）

**理由**：
- 避免「禁用 + 点击报错」双重叠加
- 提供更明确的错误提示
- 平台体验一致

---

## 🔧 四、技术实现方案

### 4.1 前端实现

#### 4.1.1 Expo 技术路线 ⚠️ P0 必须明确

**关键限制**：`@react-native-google-signin/google-signin` 需要自定义原生代码，**不能用 Expo Go**

**⚠️ 明确模块**：我们使用的是 **`GoogleSignin` 模块**（不是 One Tap / Universal 模块）

**开发与测试路径**：
- ✅ 使用 **Development Build**（而不是 Expo Go）
- ✅ 构建：EAS Build 产物签名会影响 Android SHA-1

**实施步骤**：
1. 安装依赖：`npx expo install @react-native-google-signin/google-signin`
2. **配置 Expo Config Plugin（必须）**：在 `app.json` 中添加 plugin 配置
3. 创建 Development Build：`npx expo run:ios` 或 `npx expo run:android`
4. **重要**：改完插件配置必须重新 build（dev build / EAS build）

**⚠️ P0 必配项：Expo Config Plugin 配置**

**配置文件**：`app/app.json`

```json
{
  "expo": {
    "plugins": [
      [
        "@react-native-google-signin/google-signin",
        {
          "iosUrlScheme": "com.googleusercontent.apps.343578696044-rtabgtpti1lpn1hhe5pqccljoac8d7ns"
        }
      ]
    ]
  }
}
```

**配置说明**：
- **非 Firebase 场景**：使用 `iosUrlScheme`（从 iOS Client ID 提取）
- **Firebase 场景**：使用 `googleServicesFile`（指向 `GoogleService-Info.plist`）
- **URL Scheme 格式**：`com.googleusercontent.apps.{CLIENT_ID}`（去掉 `.apps.googleusercontent.com` 后缀）

**⚠️ 重要**：
- 这不是"可选项"，而是**必须配置**（否则 iOS URL scheme 等关键配置缺失，登录会失败）
- 配置后必须重新 build，不能直接使用 Expo Go

**参考文档**：
- [Expo Google Authentication Guide](https://docs.expo.dev/guides/google-authentication/)
- [Expo Development Builds](https://docs.expo.dev/development/introduction/)
- [React Native Google Sign-In Expo Setup](https://react-native-google-signin.github.io/docs/setting-up/expo)

#### 4.1.2 依赖安装

```bash
# React Native Google Sign-In
npx expo install @react-native-google-signin/google-signin
```

#### 4.1.3 文件结构

```
app/src/
├── screens/Auth/
│   └── AuthScreen.tsx                    # 重构：添加登录方式选择
├── components/auth/
│   ├── LoginMethodSelector.tsx           # 新增：登录方式选择组件
│   ├── GoogleSignInButton.tsx            # 新增：Google 登录按钮
│   └── AgreementCheckbox.tsx             # 已有：协议确认组件
├── services/
│   └── api/
│       └── authService.ts                # 新增：thirdPartyLogin 方法
└── config/
    └── google.ts                          # 新增：Google OAuth 配置
```

#### 4.1.4 Google OAuth 配置（P0 配置纠偏）

**配置文件**：`app/src/config/google.ts`

```typescript
// 按环境注入配置（dev/staging/prod）
const getGoogleConfig = () => {
  const env = process.env.EXPO_PUBLIC_ENV || 'development';
  
  return {
    // ⚠️ P0 必须：Web Client ID（必须是 Web 类型的 Client ID）
    // 只有配置了有效的 webClientId，idToken 才会非空
    webClientId: env === 'production' 
      ? '343578696044-xxx-prod.apps.googleusercontent.com'  // 生产环境 Web Client ID（待创建）
      : '343578696044-xxx-dev.apps.googleusercontent.com',  // 开发环境 Web Client ID（待创建）
    
    // iOS Client ID（已确认）
    iosClientId: '343578696044-rtabgtpti1lpn1hhe5pqccljoac8d7ns.apps.googleusercontent.com',
    
    // Android Client ID（已确认）
    androidClientId: '343578696044-gjrucpeateqd8gln9fev4u3bqc5ime0q.apps.googleusercontent.com',
    
    // 请求的权限范围
    scopes: ['profile', 'email'],
    
    // 是否请求离线访问
    offlineAccess: false,
  };
};

export const GOOGLE_CONFIG = getGoogleConfig();
```

**初始化**：在 App 启动时初始化 Google Sign-In

```typescript
// app/src/App.tsx 或 app/src/services/googleAuth.ts
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { Platform } from 'react-native';
import { GOOGLE_CONFIG } from '@/config/google';

GoogleSignin.configure({
  // ⚠️ P0 必须：webClientId 必须是 Web 类型的 Client ID
  // 只有配置了有效的 webClientId，idToken 才会非空
  webClientId: GOOGLE_CONFIG.webClientId,
  
  // iOS 专用（可选，如果 config plugin 已配置，可以省略）
  iosClientId: Platform.OS === 'ios' ? GOOGLE_CONFIG.iosClientId : undefined,
  
  offlineAccess: false,
});
```

**⚠️ P0 配置要点**：
- **`webClientId` 是必须配置**：必须是 Web 类型的 Client ID，否则 `idToken` 为空，整个登录链路无法工作
- **配置源**：从硬编码改为按环境注入（dev/staging/prod）
- **模块说明**：我们使用的是 `GoogleSignin` 模块（不是 One Tap / Universal 模块），必须配置 Web Client ID
- **iOS Client ID**：在 Expo + config plugin 场景可以自动检测（不一定要手填）

#### 4.1.5 原生配置

**iOS 配置**：
- `app/ios/app/Info.plist`：添加 URL Scheme（如果需要）
- `app/ios/Podfile`：可能需要添加 Google Sign-In 依赖

**Android 配置**：
- `app/android/app/build.gradle`：确认 Package Name 为 `tech.dawnai.xiaopei.app`
- Google Cloud Console 中已配置 SHA-1 指纹（参考：`获取Android-SHA1指纹指南.md`）

**Android SHA-1 管理策略**（P1 扩展性）：

**开发构建 SHA-1**：
```bash
# 获取开发构建的 SHA-1
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

**EAS Build / Play Signing SHA-1**：
- EAS Build 使用不同的签名证书
- Google Play App Signing 会生成新的 SHA-1
- **需要将所有 SHA-1 都配置到 Google Cloud Console**

**配置清单**：
```
开发构建 SHA-1: [待获取]
EAS Build SHA-1: [待获取]
Play App Signing SHA-1: [待获取]
```

### 4.2 后端实现

#### 4.2.1 统一接口（P1 架构优化）

**接口路径**：`POST /api/v1/auth/third_party_login`（复用现有规范）

**请求参数**：
```typescript
interface ThirdPartyLoginRequest {
  provider: 'google' | 'apple';  // 未来扩展：'wechat' | 'alipay'
  idToken: string;                // Google ID Token 或 Apple Identity Token
  accessToken?: string;           // 可选（暂不使用）
  app_region: 'CN' | 'HK';       // 主字段：应用地区（能力开关/产品逻辑）
  channel?: 'cn' | 'hk';          // 辅助字段：仅用于埋点或老接口兼容（可选）
}
```

**⚠️ P1 字段收敛**：
- **主字段**：`app_region: 'HK'|'CN'` 做"能力开关/产品逻辑"
- **辅助字段**：`channel: 'hk'|'cn'` 只用于埋点或老接口兼容（可选）
- **服务端**：以 `app_region` 为准，不要让客户端随意传 `channel` 来改变能力

**响应格式**：
```typescript
interface ThirdPartyLoginResponse {
  token: string;          // JWT Token
  user: {
    userId: string;
    nickname?: string;
    email?: string;
    avatar?: string;
    phone?: string;       // Google 登录用户可能为空
  };
  first_login?: boolean;  // 是否首次登录
  request_id?: string;    // P1 建议：请求 ID（用于日志串联）
}
```

**错误响应**：
```typescript
{
  success: false,
  error: {
    code: 'INVALID_TOKEN' | 'AUTH_FAILED' | 'USER_CANCELED' | 'NETWORK_ERROR' | 'INTERNAL_ERROR' | 'REGION_NOT_SUPPORTED',
    message: string
  }
}
```

**⚠️ P2 错误码区分**：
- **客户端错误**：`USER_CANCELED`（用户取消授权，客户端负责映射，不打到后端）
- **服务端错误**：`INVALID_TOKEN` / `AUTH_FAILED` / `INTERNAL_ERROR` / `REGION_NOT_SUPPORTED`（服务端负责产生）
- **网络错误**：`NETWORK_ERROR`（可能发生在客户端或服务端）

#### 4.2.2 后端服务（P0 Token 验证）

**新建文件**：`core/src/modules/auth/thirdPartyAuthService.ts`

**功能**：
1. **验证 ID Token**（P0 生产环境要求）：
   - ✅ **生产环境**：使用 `google-auth-library` 的 JWT 验证（推荐）
   - ❌ **禁止使用**：`tokeninfo` 端点（仅用于调试，生产可能受限）
   - ✅ **Audience 白名单**：支持多个 Client ID（Web/Android/iOS）
   - ✅ **显式断言**：验证 `aud`、`iss`、`exp`（详见 Token 验证实现）

2. **用户查找/创建**（P1 事务化与幂等化）：
   - 使用 DB 事务：`BEGIN` → 插入 user → 插入 identity → `COMMIT`
   - 根据 `provider` + `provider_user_id`（sub）查找 `auth_identities`（幂等锚点）
   - 如果不存在，创建新用户 + `auth_identity` 记录
   - 处理并发冲突：唯一键冲突时重新查询并返回已有用户
   - **不按 email 自动合并账号**（P0 安全策略）

3. **生成 JWT Token**：
   - 使用现有 `generateToken` 函数
   - 返回用户信息和 Token

4. **日志与隐私**（P2 合规）：
   - ⚠️ **硬规则**：日志中不得记录 `idToken` 全量
   - ✅ **最多记录**：`provider`、`aud`（若可解析）、`sub` 的 hash、requestId
   - ✅ **目的**：合规与排障更安全

5. **防滥用**（P1 建议）：
   - ⚠️ **限流**：`third_party_login` 做简单限流（IP、device_id 或匿名 session）
   - ✅ **requestId**：返回 `requestId`，并在日志里串起来（用于追踪完整请求链路）

**依赖安装**：
```bash
cd core
npm install google-auth-library
```

**Token 验证实现**（P1 显式断言）：
```typescript
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client();

// 允许的 Client ID 列表（从环境变量读取）
const ALLOWED_CLIENT_IDS = process.env.GOOGLE_ALLOWED_CLIENT_IDS?.split(',') || [];

// Google 合法 Issuer
const GOOGLE_ISSUERS = [
  'https://accounts.google.com',
  'accounts.google.com',
];

async function verifyGoogleToken(idToken: string) {
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: ALLOWED_CLIENT_IDS, // 支持多个 Client ID
    });
    
    const payload = ticket.getPayload();
    
    // ⚠️ P1 显式断言（便于 code review 与安全审计）
    if (!payload) {
      throw new Error('Token payload is empty');
    }
    
    // 1. 验证 aud（受众）是否在允许列表中
    if (!payload.aud || !ALLOWED_CLIENT_IDS.includes(payload.aud)) {
      throw new Error(`Invalid audience: ${payload.aud}`);
    }
    
    // 2. 验证 iss（发行者）是否合法
    if (!payload.iss || !GOOGLE_ISSUERS.includes(payload.iss)) {
      throw new Error(`Invalid issuer: ${payload.iss}`);
    }
    
    // 3. 验证 exp（过期时间）未过期（google-auth-library 会自动校验）
    // 如果 exp 已过期，verifyIdToken 会直接抛出错误
    
    // 4. 可选：如果强依赖邮箱能力，要求 email_verified=true
    // if (payload.email && !payload.email_verified) {
    //   throw new Error('Email not verified');
    // }
    
    return {
      sub: payload.sub,           // Google 用户唯一标识（必填）
      email: payload.email,       // 可选，可能为空
      name: payload.name,         // 可选
      picture: payload.picture,  // 可选
      email_verified: payload.email_verified, // 可选
    };
  } catch (error) {
    throw new Error(`Invalid Google token: ${error.message}`);
  }
}
```

**⚠️ P1 Token 校验断言清单**：
- ✅ `aud` ∈ `GOOGLE_ALLOWED_CLIENT_IDS`（已实现）
- ✅ `iss` 合法（Google 的 issuer）
- ✅ `exp` 未过期（google-auth-library 自动校验）
- ⚠️ 可选：如强依赖邮箱能力，要求 `email_verified=true`

#### 4.2.3 数据模型（P1 扩展性优化）

**方案选择**：使用 `auth_identities` 表（而非直接在 users 表加字段）

**新建表**：`auth_identities`

```sql
CREATE TABLE IF NOT EXISTS auth_identities (
  identity_id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL COMMENT '用户ID（外键 users.user_id）',
  provider VARCHAR(32) NOT NULL COMMENT '登录提供商（google/apple/wechat/alipay）',
  provider_user_id VARCHAR(255) NOT NULL COMMENT '提供商用户ID（如 Google sub）',
  email VARCHAR(100) COMMENT '提供商邮箱',
  name VARCHAR(100) COMMENT '提供商显示名称',
  avatar_url VARCHAR(500) COMMENT '提供商头像URL',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_provider_user (provider, provider_user_id),
  INDEX idx_user_id (user_id),
  INDEX idx_provider (provider),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='第三方登录身份表';
```

**⚠️ P1 数据模型优化**：
- ✅ **`provider` 使用 `VARCHAR(32)`**：而非 `ENUM`（避免未来加 provider 时要 ALTER ENUM，线上迁移和回滚更麻烦）
- ✅ **代码层白名单校验**：路由层已有 provider 校验（`['google', 'apple']`）
- ✅ **数据库层唯一约束**：`UNIQUE(provider, provider_user_id)` 确保幂等性

**用户查找逻辑**（P0 账号冲突策略 + P1 事务化与幂等化）：

```typescript
// 伪代码
async function findOrCreateThirdPartyUser(provider: string, providerUserInfo: any) {
  const connection = await db.getConnection();
  
  try {
    // 开始事务
    await connection.beginTransaction();
    
    // 1. 根据 provider + provider_user_id 查找 auth_identity（幂等锚点）
    let identity = await connection.query(
      'SELECT * FROM auth_identities WHERE provider = ? AND provider_user_id = ?',
      [provider, providerUserInfo.sub]
    );
    
    if (identity && identity.length > 0) {
      // 2. 如果存在，更新身份信息（可选，但不要把已有字段更新成 null）
      // ⚠️ P1 更新策略：如果 Google 本次没返回 picture，就不要覆盖掉历史头像
      const updateFields = [];
      const updateValues = [];
      
      if (providerUserInfo.email) {
        updateFields.push('email = ?');
        updateValues.push(providerUserInfo.email);
      }
      if (providerUserInfo.name) {
        updateFields.push('name = ?');
        updateValues.push(providerUserInfo.name);
      }
      if (providerUserInfo.picture) {
        updateFields.push('avatar_url = ?');
        updateValues.push(providerUserInfo.picture);
      }
      
      if (updateFields.length > 0) {
        updateFields.push('updated_at = NOW()');
        updateValues.push(identity[0].identity_id);
        await connection.query(
          `UPDATE auth_identities SET ${updateFields.join(', ')} WHERE identity_id = ?`,
          updateValues
        );
      }
      
      // 3. 返回关联的用户
      const user = await connection.query('SELECT * FROM users WHERE user_id = ?', [identity[0].user_id]);
      
      await connection.commit();
      return { user: user[0], first_login: false };
    }
    
    // 4. 如果不存在，创建新用户 + auth_identity
    const userId = uuidv4();
    const identityId = uuidv4();
    
    // 4.1 创建用户（不绑定手机号）
    await connection.query(
      'INSERT INTO users (user_id, email, nickname, avatar, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
      [userId, providerUserInfo.email || null, providerUserInfo.name || null, providerUserInfo.picture || null]
    );
    
    // 4.2 创建 auth_identity（唯一键约束确保幂等性）
    try {
      await connection.query(
        'INSERT INTO auth_identities (identity_id, user_id, provider, provider_user_id, email, name, avatar_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
        [identityId, userId, provider, providerUserInfo.sub, providerUserInfo.email || null, providerUserInfo.name || null, providerUserInfo.picture || null]
      );
    } catch (insertError) {
      // ⚠️ P0 修正：处理并发冲突时，必须 rollback 整个事务，避免产生孤儿用户
      if (insertError.code === 'ER_DUP_ENTRY') {
        // Rollback 整个事务（包括已插入的 user）
        await connection.rollback();
        
        // 在事务外重新查询 identity→user
        const existingIdentity = await db.query(
          'SELECT * FROM auth_identities WHERE provider = ? AND provider_user_id = ?',
          [provider, providerUserInfo.sub]
        );
        
        if (existingIdentity && existingIdentity.length > 0) {
          const user = await db.query('SELECT * FROM users WHERE user_id = ?', [existingIdentity[0].user_id]);
          return { user: user[0], first_login: false };
        }
        
        // 如果查询不到（理论上不应该发生），抛出错误
        throw new Error('Concurrent insert conflict: identity not found after rollback');
      }
      throw insertError;
    }
    
    await connection.commit();
    
    const user = await connection.query('SELECT * FROM users WHERE user_id = ?', [userId]);
    return { user: user[0], first_login: true };
    
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
```

**⚠️ P0 事务化与幂等化要点**：
- ✅ **DB 事务**：`BEGIN` → 插入 user → 插入 identity → `COMMIT`（处理并发双击/重试）
- ✅ **幂等锚点**：以 `UNIQUE(provider, provider_user_id)` 为幂等锚点，冲突时 `SELECT` 回来返回已有 user
- ✅ **`first_login` 判断**：基于"identity 是否首次创建"，不要基于 user 是否存在（更准确）
- ✅ **并发处理（P0 修正）**：如果唯一键冲突，**必须 rollback 整个事务**，然后在事务外重新查询并返回已有用户（避免产生孤儿用户）
- ✅ **更新策略**：更新 identity 信息时，不要把已有字段更新成 `null`（例如 Google 本次没返回 picture，就不要覆盖掉历史头像）

**关键策略**：
- ✅ **使用 `sub` 作为唯一标识**：Google 官方推荐，email 可能变化
- ✅ **不按 email 自动合并**：避免误合并/账号被接管的争议
- ✅ **未来合并流程**：登录后在账号设置里绑定/解绑（需要二次校验）

#### 4.2.4 路由实现

**文件**：`core/src/routes/auth.ts`

**新增/修改路由**：
```typescript
/**
 * POST /api/v1/auth/third_party_login
 * 第三方登录（统一接口）
 */
router.post('/third_party_login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { provider, idToken, app_region, channel } = req.body;
    
    // 验证输入
    if (!provider || !['google', 'apple'].includes(provider)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PROVIDER',
          message: 'provider 必须是 google 或 apple',
        },
      } as ApiResponse);
    }
    
    if (!idToken) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ID_TOKEN_REQUIRED',
          message: 'ID Token 不能为空',
        },
      } as ApiResponse);
    }
    
    // ⚠️ P0 地区策略校验：以 app_region 为准
    if (!app_region || !['CN', 'HK'].includes(app_region)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REGION',
          message: 'app_region 必须是 CN 或 HK',
        },
      } as ApiResponse);
    }
    
    // ⚠️ P0 地区策略校验：HK 才允许 Google 登录
    if (provider === 'google' && app_region !== 'HK') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'REGION_NOT_SUPPORTED',
          message: 'Google 登录仅在 HK 地区可用',
        },
      } as ApiResponse);
    }
    
    // 辅助字段：channel 仅用于埋点或老接口兼容（可选）
    const finalChannel = channel || (app_region === 'HK' ? 'hk' : 'cn');
    
    const result = await thirdPartyAuthService.login({
      provider,
      idToken,
      app_region,
      channel: finalChannel,
    });
    
    res.json({
      success: true,
      data: result,
    } as ApiResponse);
  } catch (error: any) {
    // 错误分类（P2 可观测性）
    let errorCode = 'AUTH_FAILED';
    let statusCode = 401;
    
    if (error.message?.includes('Invalid token') || error.code === 'INVALID_TOKEN') {
      errorCode = 'INVALID_TOKEN';
    } else if (error.message?.includes('Network') || error.code === 'NETWORK_ERROR') {
      errorCode = 'NETWORK_ERROR';
      statusCode = 503;
    } else if (error.message?.includes('Internal') || error.code === 'INTERNAL_ERROR') {
      errorCode = 'INTERNAL_ERROR';
      statusCode = 500;
    }
    
    return res.status(statusCode).json({
      success: false,
      error: {
        code: errorCode,
        message: error.message || '第三方登录失败',
      },
    } as ApiResponse);
  }
});
```

**⚠️ P0 地区策略后端校验**：
- ✅ **以 `app_region` 为准**：不要让客户端随意传 `channel` 来改变能力
- ✅ **HK 才允许 Google**：`provider === 'google' && app_region !== 'HK'` 时返回 `REGION_NOT_SUPPORTED`
- ✅ **双保险**：前后端都要校验，避免被抓包绕过

---

## 📦 五、依赖清单

### 5.1 前端依赖

```json
{
  "dependencies": {
    "@react-native-google-signin/google-signin": "^12.0.0"
  }
}
```

### 5.2 后端依赖

```json
{
  "dependencies": {
    "google-auth-library": "^9.0.0"
  }
}
```

---

## ⚙️ 六、配置清单

### 6.1 Google Cloud Console 配置（P0 必须完成）

#### 6.1.1 Web 客户端（后端验证用）⚠️ P0 必须创建

| 配置项 | 值 | 状态 |
|--------|-----|------|
| **应用类型** | Web 应用 | ⚠️ **P0 必须创建** |
| **客户端 ID** | （待创建） | ⚠️ **P0 必须创建** |
| **用途** | 前端获取 idToken + 后端验证 ID Token | **必需** |

**⚠️ P0 关键说明**：
- **必须创建 Web Client ID**：`@react-native-google-signin/google-signin` 的 `GoogleSignin.configure()` 中，**只有配置了有效的 `webClientId`（必须是 Web 类型的 Client ID）时，`idToken` 才会非空**
- 没有 `webClientId`，整个登录链路无法工作（客户端拿不到 `idToken`，无法传给后端验证）
- 后端验证时，`verifyIdToken({ audience: WEB_CLIENT_ID })` 也推荐使用 Web Client ID（支持多 client 列表）

**创建步骤**：
1. 登录 Google Cloud Console
2. 进入「API 和凭据」→「OAuth 2.0 客户端 ID」
3. 选择「Web 应用」类型
4. 获取 Web 客户端 ID
5. 添加到 `GOOGLE_ALLOWED_CLIENT_IDS` 环境变量中

#### 6.1.2 Android 客户端 ✅ 已创建

| 配置项 | 值 | 状态 |
|--------|-----|------|
| **客户端 ID** | `343578696044-gjrucpeateqd8gln9fev4u3bqc5ime0q.apps.googleusercontent.com` | ✅ 已创建 |
| **Package Name** | `tech.dawnai.xiaopei.app` | ⚠️ 需确认是否已配置 |
| **SHA-1 指纹** | （待获取） | ⚠️ 需配置 |

**SHA-1 指纹获取**：
参考：`获取Android-SHA1指纹指南.md`

**SHA-1 管理策略**（P1 扩展性）：
- 开发构建 SHA-1：`keytool -list -v -keystore ~/.android/debug.keystore`
- EAS Build SHA-1：从 EAS Build 配置获取
- Play App Signing SHA-1：从 Google Play Console 获取
- **需要将所有 SHA-1 都配置到 Google Cloud Console**

#### 6.1.3 iOS 客户端 ✅ 已创建

| 配置项 | 值 | 状态 |
|--------|-----|------|
| **Bundle ID** | `tech.dawnai.xiaopei.app` | ✅ 已确认 |
| **客户端 ID** | `343578696044-rtabgtpti1lpn1hhe5pqccljoac8d7ns.apps.googleusercontent.com` | ✅ 已创建 |

### 6.2 应用配置

#### 6.2.1 Package Name / Bundle ID 一致性（P0 发布决策）

**✅ 已确认**：统一使用 `tech.dawnai.xiaopei.app`

**迁移动作清单**（需要执行）：

1. **代码配置**（`app/app.json`）：
   ```json
   {
     "expo": {
       "ios": {
         "bundleIdentifier": "tech.dawnai.xiaopei.app"
       },
       "android": {
         "package": "tech.dawnai.xiaopei.app"
       }
     }
   }
   ```

2. **Google Cloud Console**：
   - ✅ Android 客户端：已配置 `tech.dawnai.xiaopei.app`
   - ✅ iOS 客户端：已配置 `tech.dawnai.xiaopei.app`

3. **Apple Developer**：
   - ⚠️ 需要确认：Bundle ID `tech.dawnai.xiaopei.app` 是否已在 Apple Developer 中创建

4. **EAS Build**：
   - ⚠️ 需要确认：EAS profile（dev/staging/prod）对应的 app id 策略
   - 建议：使用 `applicationIdSuffix` 区分环境（如 `tech.dawnai.xiaopei.app.dev`）

**⚠️ P0 注意事项**：
- **发布前必须锁死**：一旦上架后不可逆
- **统一配置**：所有配置必须以 `tech.dawnai.xiaopei.app` 为准

#### 6.2.2 环境变量（后端）

```bash
# .env 或环境变量
# Google OAuth Client IDs（逗号分隔，支持多个）
# ⚠️ P0 必须：创建 Web Client ID 后，添加到列表中
GOOGLE_ALLOWED_CLIENT_IDS=343578696044-xxx.apps.googleusercontent.com,343578696044-gjrucpeateqd8gln9fev4u3bqc5ime0q.apps.googleusercontent.com,343578696044-rtabgtpti1lpn1hhe5pqccljoac8d7ns.apps.googleusercontent.com
#                                 ↑ Web Client ID（待创建）    ↑ Android Client ID ✅    ↑ iOS Client ID ✅
```

**当前状态**：
- ✅ Android Client ID：已配置
- ✅ iOS Client ID：已配置
- ⚠️ Web Client ID：**P0 必须创建**（否则前端拿不到 idToken）

---

## 🔄 七、账号绑定策略

### 7.1 策略说明（P0 安全策略）

**Google 登录用户**：
- ✅ 单独创建账号（不绑定手机号）
- ✅ 使用 Google 账号信息（email, name, picture）
- ❌ 不需要绑定手机号
- ❌ 不需要验证码验证
- ✅ **不按 email 自动合并账号**（避免误合并/账号被接管的争议）

### 7.2 用户数据存储

**存储字段**（`auth_identities` 表）：
- `provider`：'google'
- `provider_user_id`：Google 用户唯一标识（sub）
- `email`：Google 邮箱（如果有）
- `name`：Google 显示名称（如果有）
- `avatar_url`：Google 头像 URL（如果有）

**不存储字段**：
- 手机号（Google 登录用户不绑定手机号）
- 其他额外要求字段（按需求：无额外要求就不存储）

### 7.3 账号冲突处理（P0 安全策略）

**关键原则**：
- ✅ **使用 `sub` 作为唯一标识**：Google 官方推荐，email 可能变化
- ✅ **不按 email 自动合并**：避免误合并/账号被接管的争议
- ✅ **未来合并流程**：登录后在账号设置里绑定/解绑（需要二次校验）

**查找逻辑**：
```typescript
// 1. 根据 provider + provider_user_id (sub) 查找 auth_identity
// 2. 如果存在，返回关联的用户
// 3. 如果不存在，创建新用户 + auth_identity
// 4. 不检查 email 是否已存在（避免自动合并）
```

---

## 🧪 八、测试计划

### 8.1 功能测试

1. **协议确认测试**：
   - ✅ 未勾选协议时，点击按钮拦截并提示
   - ✅ 已勾选协议时，按钮正常执行登录
   - ✅ 协议链接可正常打开

2. **Google 登录测试**：
   - ✅ 点击 Google 登录按钮，调起 Google 登录
   - ✅ 选择 Google 账号，授权成功
   - ✅ 登录成功后，返回用户信息和 Token
   - ✅ 首次登录创建新账号 + auth_identity
   - ✅ 二次登录使用已有账号

3. **错误处理测试**（P2 可观测性）：
   - ✅ 用户取消授权：`USER_CANCELED` 错误码
   - ✅ 网络错误：`NETWORK_ERROR` 错误码
   - ✅ Token 验证失败：`INVALID_TOKEN` 错误码
   - ✅ 服务器内部错误：`INTERNAL_ERROR` 错误码

### 8.2 兼容性测试

- ✅ iOS 真机测试（Development Build）
- ✅ Android 真机测试（Development Build）
- ✅ 不同 Google 账号测试
- ✅ 首次登录 vs 二次登录测试
- ✅ 不同 SHA-1 指纹测试（开发/EAS/Play）

### 8.3 埋点测试（P2 可观测性）

**埋点字段**：
- `login_method`: 'google' | 'phone'
- `region`: 'cn' | 'hk'
- `platform`: 'ios' | 'android'
- `first_login`: boolean
- `error_code`: string（如果失败）
- `request_id`: string（后端返回，用于日志串联）

### 8.4 P1/P2 可加分测试（降低线上排障成本）

**Android Play Services 检查**：
- ✅ 客户端按钮点击时，先检查 `hasPlayServices`
- ✅ 失败则提示并引导用手机号登录（HK 也要有 fallback）
- ✅ 测试场景：无 GMS/Play Services 不可用的设备

**后端防滥用测试**：
- ✅ `third_party_login` 限流测试（IP、device_id 或匿名 session）
- ✅ `requestId` 返回测试（用于日志串联）
- ✅ 日志串联测试（通过 `requestId` 追踪完整请求链路）

---

## ⚠️ 九、风险评估

### 9.1 P0 风险（必须解决）

| 风险 | 影响 | 缓解措施 | 状态 |
|------|------|----------|------|
| **iOS 审核合规** | 高 | 上线前必须实现 Apple 登录 | ⚠️ 已标注风险 |
| **Expo 技术路线** | 高 | 使用 Development Build（不能用 Expo Go） | ✅ 已明确 |
| **OAuth Client ID 配置** | 高 | 创建 Web/Android/iOS 三套，后端 audience 白名单 | ⚠️ Web 待创建（Android/iOS 已完成） |
| **Package Name 不一致** | 高 | 发布前必须锁死并统一 | ⚠️ 待决策 |
| **账号冲突** | 高 | 不按 email 自动合并，使用 sub 作为唯一标识 | ✅ 已明确策略 |

### 9.2 P1 风险（强烈建议解决）

| 风险 | 影响 | 缓解措施 | 状态 |
|------|------|----------|------|
| **接口分叉** | 中 | 复用 `third_party_login` 统一接口 | ✅ 已优化 |
| **数据模型扩展性** | 中 | 使用 `auth_identities` 表 | ✅ 已优化 |
| **SHA-1 管理** | 中 | 明确开发/EAS/Play 三套 SHA-1 管理策略 | ✅ 已明确 |

### 9.3 P2 风险（体验优化）

| 风险 | 影响 | 缓解措施 | 状态 |
|------|------|----------|------|
| **协议交互体验** | 低 | 不禁用按钮，点击拦截并提示 | ✅ 已优化 |
| **错误码不清晰** | 低 | 错误分类：USER_CANCELED / NETWORK_ERROR / INVALID_TOKEN / INTERNAL_ERROR | ✅ 已优化 |
| **可观测性不足** | 低 | 埋点字段：login_method, region, platform, first_login, error_code | ✅ 已优化 |

---

## 📝 十、实施步骤

### 10.1 前端实施步骤

1. ✅ 安装依赖：`@react-native-google-signin/google-signin`
2. ✅ 创建 Development Build（不能用 Expo Go）
3. ✅ 创建 `LoginMethodSelector` 组件（协议确认 + 登录方式选择）
4. ✅ 创建 `GoogleSignInButton` 组件
   - **P1 建议**：Android 侧增加 Play Services 前置检查（`hasPlayServices`），失败则提示并引导用手机号登录
5. ✅ 创建 `google.ts` 配置文件（Web/Android/iOS 三套 Client ID）
6. ✅ 重构 `AuthScreen`：添加登录方式选择（根据 `app_region` 动态渲染）
7. ✅ 实现 Google 登录流程：调起 SDK → 获取 Token → 调用 `third_party_login`
8. ✅ 配置原生代码（iOS/Android）
9. ✅ 添加错误处理和提示（错误分类）
10. ✅ 添加埋点（login_method, region, platform, first_login, error_code, request_id）

### 10.2 后端实施步骤

1. ✅ 安装依赖：`google-auth-library`
2. ✅ 创建 `auth_identities` 表（数据库迁移）
3. ✅ 创建 `thirdPartyAuthService.ts`（统一服务）
4. ✅ 实现 Google Token 验证（使用 JWT 验证，支持 audience 白名单）
5. ✅ 实现用户查找/创建逻辑（使用 sub 作为唯一标识，不按 email 合并）
6. ✅ 修改路由：`POST /api/v1/auth/third_party_login`（统一接口）
7. ✅ 添加错误处理和日志（错误分类）
8. ✅ 配置环境变量：`GOOGLE_ALLOWED_CLIENT_IDS`
9. ✅ **P1 建议**：添加防滥用限流（IP、device_id 或匿名 session）
10. ✅ **P1 建议**：返回 `requestId` 并在日志里串起来（用于追踪完整请求链路）

### 10.3 配置步骤（P0 必须完成）

**剩余未完成步骤**：

1. ⚠️ **P0 必须：创建 Web 客户端**：Google Cloud Console → OAuth 2.0 → Web 应用
   - 获取 Web Client ID
   - 配置到前端 `webClientId`
   - 添加到后端 `GOOGLE_ALLOWED_CLIENT_IDS` 环境变量

2. ⚠️ **迁移代码配置**：修改 `app/app.json` 中的 `ios.bundleIdentifier` 和 `android.package` 为 `tech.dawnai.xiaopei.app`

3. ⚠️ **确认 Apple Developer**：Bundle ID `tech.dawnai.xiaopei.app` 是否已在 Apple Developer 中创建

4. ⚠️ **配置 EAS Build**：确认 EAS profile（dev/staging/prod）对应的 app id 策略

5. ✅ **已完成**：iOS 客户端已创建
6. ✅ **已完成**：Android SHA-1 指纹已配置（开发/EAS/Play 三套）
7. ✅ **已完成**：Package Name 已确认为 `tech.dawnai.xiaopei.app`

8. ⚠️ **配置后端环境变量**：`GOOGLE_ALLOWED_CLIENT_IDS`（包含 Web Client ID，逗号分隔）

9. ✅ 测试 Google 登录流程

---

## 📚 十一、参考文档

- [React Native Google Sign-In 官方文档](https://github.com/react-native-google-signin/google-signin)
- [Google OAuth 2.0 文档](https://developers.google.com/identity/protocols/oauth2)
- [Google 后端验证指南](https://developers.google.cn/identity/sign-in/web/backend-auth?hl=zh-cn)
- [Expo Google Authentication Guide](https://docs.expo.dev/guides/google-authentication/)
- [Expo Development Builds](https://docs.expo.dev/development/introduction/)
- [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [获取Android-SHA1指纹指南.md](./获取Android-SHA1指纹指南.md)
- [app.doc/features/注册登录设计文档.md](./app.doc/features/注册登录设计文档.md)
- [app.doc/API接口统一规范.md](./app.doc/API接口统一规范.md)

---

## ✅ 十二、待确认事项清单（P0 必须完成）

### 配置相关
- [ ] **Web 客户端 ID**：⚠️ **P0 必须创建**（否则前端拿不到 idToken，整个登录链路无法工作）
- [x] **iOS 客户端 ID**：✅ 已创建，ID：`343578696044-rtabgtpti1lpn1hhe5pqccljoac8d7ns.apps.googleusercontent.com`
- [x] **Android SHA-1 指纹**：✅ 已配置（开发/EAS/Play 三套）
- [x] **Package Name 一致性**：✅ 已确认使用 `tech.dawnai.xiaopei.app`
- [ ] **代码配置迁移**：需要修改 `app/app.json` 中的 Bundle ID / Package Name

### 开发相关
- [ ] **Development Build**：是否已创建并测试？
- [ ] **后端环境变量**：是否已配置 `GOOGLE_ALLOWED_CLIENT_IDS`？

### 上线前必须完成
- [ ] **Apple 登录**：是否已实现（iOS 审核合规要求）？
- [ ] **Apple 登录 Expo 配置**：`app.json` 需设置 `ios.usesAppleSignIn=true` 或插件配置
- [ ] **Apple 登录合规依据**：引用 Apple 4.8 Login Services 的"等效登录服务"条款
- [ ] **Apple 登录安全占位**：添加 Apple 登录服务端校验占位小节（nonce/重放防护）

### P1/P2 可加分建议（建议写入，降低线上排障成本）
- [ ] **Android Play Services 检查**：客户端按钮点击时，先检查 `hasPlayServices`，失败则提示并引导用手机号登录
- [ ] **后端防滥用**：`third_party_login` 做简单限流（IP、device_id 或匿名 session），返回 `requestId` 并在日志里串起来

---

## 📌 十三、与现有文档的差异

### 13.1 设计文档差异

**原设计文档**（`注册登录设计文档.md`）：
- 第三方登录在「其他登录方式」区域（页面底部）
- Google 登录作为次要登录方式

**当前需求**：
- Google 登录作为主要登录方式之一
- 与电话号码登录并列显示
- 协议确认前置（在选择登录方式之前）

**建议**：
- 按当前需求实施
- 实施完成后更新设计文档

### 13.2 API 规范差异

**原 API 规范**（`API接口统一规范.md`）：
- 定义了 `POST /api/v1/auth/third_party_login` 接口
- 使用 `provider: 'google'` 参数

**当前方案**：
- ✅ **复用统一接口**：`POST /api/v1/auth/third_party_login`
- ✅ **使用 `auth_identities` 表**：而非直接在 users 表加字段
- ✅ **支持多 Client ID**：后端 audience 白名单

**建议**：
- 与 API 规范保持一致
- 未来扩展 Apple/微信/支付宝时，无需重复造轮子

---

## 🎯 十四、总结

### 14.1 核心要点

1. **协议确认前置**：在选择登录方式之前必须勾选协议
2. **Google 登录作为主要方式**：与电话号码登录并列显示
3. **单独创建账号**：Google 登录用户不绑定手机号
4. **基本字段存储**：存储 email, name, picture（无额外要求）
5. **不按 email 自动合并**：使用 sub 作为唯一标识

### 14.2 关键配置（P0 必须完成）

- ✅ Android 客户端 ID：`343578696044-gjrucpeateqd8gln9fev4u3bqc5ime0q.apps.googleusercontent.com`
- ✅ iOS 客户端 ID：`343578696044-rtabgtpti1lpn1hhe5pqccljoac8d7ns.apps.googleusercontent.com`
- ⚠️ **Web 客户端 ID**：**P0 必须创建**（否则前端拿不到 idToken，整个登录链路无法工作）
- ✅ Package Name：`tech.dawnai.xiaopei.app`（已确认）
- ✅ SHA-1 指纹：已配置（开发/EAS/Play 三套）

### 14.3 架构优化（P1）

- ✅ 复用统一接口：`POST /api/v1/auth/third_party_login`
- ✅ 使用 `auth_identities` 表：扩展性更好
- ✅ 后端 audience 白名单：支持多 Client ID

### 14.4 P0 风险标注

- ⚠️ **iOS 审核合规**：上线前必须实现 Apple 登录
- ⚠️ **Expo 技术路线**：必须使用 Development Build（不能用 Expo Go）
- ⚠️ **OAuth Client ID 配置**：必须创建 Web/Android/iOS 三套
- ⚠️ **Package Name 一致性**：发布前必须锁死并统一

### 14.5 下一步行动

1. **P0 必须：创建 Web Client ID**（否则前端拿不到 idToken，整个登录链路无法工作）
2. **迁移代码配置**：修改 `app/app.json` 中的 Bundle ID / Package Name
3. **创建 Development Build**：不能用 Expo Go
4. **开始实施**：按照实施步骤逐步完成
5. **测试验证**：完成功能测试和兼容性测试
6. **上线前**：实现 Apple 登录（iOS 审核合规）
7. **文档更新**：实施完成后更新设计文档

---

**文档版本**: v1.1-final（可执行版）  
**最后更新**: 2024年12月（整合所有优化补丁）  
**维护者**: 开发团队  
**优先级**: P0（上线前必须完成）

---

## 📌 十五、优化补丁清单（v1.1-final）

### P0 补丁（避免联调失败/功能线上不可用）

1. ✅ **地区策略强约束**：HK 才显示/才允许 Google（前后端双校验）
2. ✅ **Expo Config Plugin 必配项**：`app.json plugins` 配置示例 + rebuild 要求
3. ✅ **GoogleSignin.configure 参数对齐**：`webClientId` 必填，按环境注入配置
4. ✅ **Web Client ID 必须创建**：明确只有配置了有效的 `webClientId`，`idToken` 才会非空
5. ✅ **事务化与幂等化修正**：`ER_DUP_ENTRY` 时必须 rollback，避免产生孤儿用户
6. ✅ **模块明确**：明确使用的是 `GoogleSignin` 模块（不是 One Tap / Universal 模块）

### P1 补丁（提升扩展性/减少后续返工）

7. ✅ **provider 字段优化**：使用 `VARCHAR(32)` 而非 `ENUM`
8. ✅ **Token 校验显式断言**：验证 `aud`、`iss`、`exp`（便于 code review）
9. ✅ **字段收敛**：`app_region` 为主字段，`channel` 为辅助字段
10. ✅ **更新策略**：更新 identity 信息时，不要把已有字段更新成 `null`

### P2 补丁（体验与运维）

11. ✅ **错误码区分**：客户端错误 vs 服务端错误（明确谁负责产生）
12. ✅ **日志隐私规则**：不记录 `idToken` 原文，最多记录 hash
13. ✅ **Apple 登录预留**：Expo 配置位写进"上线前必须完成"清单

### P1/P2 可加分建议（建议写入，降低线上排障成本）

14. ⚠️ **Android Play Services 检查**：客户端按钮点击时，先检查 `hasPlayServices`，失败则提示并引导用手机号登录
15. ⚠️ **后端防滥用**：`third_party_login` 做简单限流（IP、device_id 或匿名 session），返回 `requestId` 并在日志里串起来
16. ⚠️ **Apple 登录安全占位**：添加 Apple 登录服务端校验占位小节（nonce/重放防护）

---

## 📋 十六、Apple 登录预留（上线前必须完成）

### 16.1 Apple 登录服务端校验占位

**安全关键点**：
- **nonce 校验**：防止重放攻击
- **Identity Token 验证**：使用 Apple 公钥验证 JWT
- **用户标识**：使用 `sub` 作为唯一标识（类似 Google）

**实施建议**：
- 复用 `auth_identities` 表（`provider='apple'`）
- 复用 `third_party_login` 接口（`provider='apple'`）
- 实现 Apple Identity Token 验证逻辑（类似 Google Token 验证）

**Expo 配置**：
- `app.json` 需设置 `ios.usesAppleSignIn=true` 或插件配置
- 引用 Apple 4.8 Login Services 的"等效登录服务"条款作为合规依据

