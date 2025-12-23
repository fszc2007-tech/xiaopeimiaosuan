# Google 一键登录设计方案

> **版本**: v1.0  
> **创建日期**: 2024年12月  
> **状态**: 设计方案（待实施）

---

## 📋 一、依据文档

- ✅ `app.doc/features/注册登录设计文档.md` - 海外版支持 Google 登录
- ✅ `app.doc/API接口统一规范.md` - 第三方登录接口规范
- ✅ 现有实现：`app/src/screens/Auth/AuthScreen.tsx`（手机号登录）

---

## 🎯 二、需求确认

### 2.1 已确认信息

| 项目 | 值 | 说明 |
|------|-----|------|
| **Android 客户端 ID** | `343578696044-gjrucpeateqd8gln9fev4u3bqc5ime0q.apps.googleusercontent.com` | ✅ 已创建 |
| **Package Name** | `tech.dawnai.xiaopei.app` | 需要在 Google Cloud Console 确认 |
| **Bundle ID (iOS)** | `tech.dawnai.xiaopei.app` | ⚠️ 需确认是否已创建 iOS 客户端 |
| **账号绑定策略** | 单独创建账号 | Google 登录用户不绑定手机号 |
| **用户数据存储** | 存储基本字段 | email, name, picture（无额外要求） |

### 2.2 待确认事项

- ⚠️ **iOS 客户端**：是否已在 Google Cloud Console 创建 iOS 客户端？
- ⚠️ **Package Name 一致性**：代码中配置为 `com.xiaopei.app`，但 Google Console 使用 `tech.dawnai.xiaopei.app`，需要确认以哪个为准
- ⚠️ **Android SHA-1 指纹**：是否已配置到 Google Cloud Console？

---

## 🎨 三、UI/UX 流程设计

### 3.1 页面布局调整

**当前布局**：
```
┌─────────────────────────────────┐
│         Logo + 标题              │
│   手機號登入                      │
│   [区号选择] [手机号输入]         │
│   [发送验证码]                    │
│   ☑ 我已阅读并同意...             │
└─────────────────────────────────┘
```

**调整后布局**：
```
┌─────────────────────────────────┐
│         Logo + 标题              │
├─────────────────────────────────┤
│   ☑ 我已閱讀並同意《私隱政策》    │
│      《用戶協議》及《個人資料      │
│      收集聲明》                  │
├─────────────────────────────────┤
│   選擇登入方式：                  │
│   ┌─────────────────────────┐   │
│   │  📱 電話號碼登入         │   │
│   └─────────────────────────┘   │
│   ┌─────────────────────────┐   │
│   │  🔵 Google 一鍵登入      │   │
│   └─────────────────────────┘   │
├─────────────────────────────────┤
│   [根据选择显示对应表单]          │
└─────────────────────────────────┘
```

### 3.2 交互流程

#### 流程 A：电话号码登录
1. **进入页面** → 显示协议确认 + 两个登录方式按钮
2. **用户勾选协议**（未勾选时，两个按钮禁用，视觉灰化）
3. **点击「電話號碼登入」** → 展开手机号输入表单（当前流程）
4. **输入手机号** → 发送验证码 → 输入验证码 → 登录

#### 流程 B：Google 一键登录
1. **进入页面** → 显示协议确认 + 两个登录方式按钮
2. **用户勾选协议**（未勾选时，两个按钮禁用，视觉灰化）
3. **点击「Google 一鍵登入」** → 调起 Google 登录 SDK
4. **用户选择 Google 账号** → 授权 → 自动登录（无需输入验证码）

### 3.3 协议确认时机

**关键要求**：在点击选择之前都需要同意用户政策

- **位置**：页面顶部（Logo 下方，登录方式选择之前）
- **时机**：必须在选择登录方式之前勾选
- **验证**：
  - 未勾选时：两个登录按钮禁用（视觉灰化 + `disabled={true}`）
  - 已勾选时：两个登录按钮可用（正常颜色 + `disabled={false}`）
- **错误提示**：如果用户未勾选直接点击按钮，显示错误提示并触发震动反馈

---

## 🔧 四、技术实现方案

### 4.1 前端实现

#### 4.1.1 依赖安装

```bash
# React Native Google Sign-In
npx expo install @react-native-google-signin/google-signin
```

#### 4.1.2 文件结构

```
app/src/
├── screens/Auth/
│   └── AuthScreen.tsx                    # 重构：添加登录方式选择
├── components/auth/
│   ├── LoginMethodSelector.tsx           # 新增：登录方式选择组件
│   ├── GoogleSignInButton.tsx           # 新增：Google 登录按钮
│   └── AgreementCheckbox.tsx             # 已有：协议确认组件
├── services/
│   └── api/
│       └── authService.ts                # 新增：googleLogin 方法
└── config/
    └── google.ts                          # 新增：Google OAuth 配置
```

#### 4.1.3 状态管理

```typescript
// AuthScreen 状态
type LoginMethod = 'phone' | 'google' | null;

const [loginMethod, setLoginMethod] = useState<LoginMethod>(null);
const [agreementChecked, setAgreementChecked] = useState(false);
const [agreementError, setAgreementError] = useState(false);
```

#### 4.1.4 组件设计

**LoginMethodSelector 组件**：
- 显示协议确认（AgreementCheckbox）
- 显示两个登录方式按钮（电话号码 / Google）
- 根据 `agreementChecked` 控制按钮可用性
- 点击按钮时验证协议是否已勾选

**GoogleSignInButton 组件**：
- Google 品牌按钮样式
- 点击后调起 Google Sign-In SDK
- 处理登录成功/失败回调

#### 4.1.5 Google OAuth 配置

**配置文件**：`app/src/config/google.ts`

```typescript
export const GOOGLE_CONFIG = {
  // Android 客户端 ID（已确认）
  webClientId: '343578696044-gjrucpeateqd8gln9fev4u3bqc5ime0q.apps.googleusercontent.com',
  
  // iOS 客户端 ID（待确认）
  iosClientId: '待确认', // 如果 iOS 客户端已创建，填入 iOS Client ID
  
  // 请求的权限范围
  scopes: ['profile', 'email'],
  
  // 是否请求离线访问
  offlineAccess: false,
};
```

**初始化**：在 App 启动时初始化 Google Sign-In

```typescript
// app/src/App.tsx 或 app/src/services/googleAuth.ts
import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: GOOGLE_CONFIG.webClientId,
  iosClientId: GOOGLE_CONFIG.iosClientId, // iOS 专用（如果存在）
  offlineAccess: false,
});
```

#### 4.1.6 原生配置

**iOS 配置**：
- `app/ios/app/Info.plist`：添加 URL Scheme（如果需要）
- `app/ios/Podfile`：可能需要添加 Google Sign-In 依赖

**Android 配置**：
- `app/android/app/build.gradle`：确认 Package Name 为 `tech.dawnai.xiaopei.app`
- Google Cloud Console 中已配置 SHA-1 指纹（参考：`获取Android-SHA1指纹指南.md`）

### 4.2 后端实现

#### 4.2.1 新增接口

**接口路径**：`POST /api/v1/auth/google_login`

**请求参数**：
```typescript
interface GoogleLoginRequest {
  idToken: string;        // Google ID Token（必填）
  accessToken?: string;   // Google Access Token（可选，暂不使用）
  channel: 'cn' | 'hk';   // 应用地区
}
```

**响应格式**：
```typescript
interface GoogleLoginResponse {
  token: string;          // JWT Token
  user: {
    userId: string;
    nickname?: string;
    email?: string;
    avatar?: string;
    phone?: string;       // Google 登录用户可能为空
  };
  first_login?: boolean;  // 是否首次登录
}
```

**错误响应**：
```typescript
{
  success: false,
  error: {
    code: 'INVALID_GOOGLE_TOKEN' | 'GOOGLE_AUTH_FAILED',
    message: string
  }
}
```

#### 4.2.2 后端服务

**新建文件**：`core/src/modules/auth/googleAuthService.ts`

**功能**：
1. **验证 Google ID Token**：
   - 使用 `google-auth-library` 验证 Token 有效性
   - 提取用户信息（sub, email, name, picture）

2. **用户查找/创建**：
   - 根据 `google_id`（sub）查找用户
   - 如果不存在，创建新用户
   - 存储字段：`google_id`, `email`, `nickname`, `avatar_url`
   - **不绑定手机号**（账号绑定策略：单独创建账号）

3. **生成 JWT Token**：
   - 使用现有 `generateToken` 函数
   - 返回用户信息和 Token

**依赖安装**：
```bash
cd core
npm install google-auth-library
```

#### 4.2.3 数据库字段

**用户表（users）新增字段**：
```sql
ALTER TABLE users ADD COLUMN google_id VARCHAR(255) UNIQUE COMMENT 'Google 用户 ID (sub)';
ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500) COMMENT '用户头像 URL（来自 Google）';
```

**索引**：
```sql
CREATE INDEX idx_google_id ON users(google_id);
```

**字段说明**：
- `google_id`：Google 用户的唯一标识（sub），用于查找用户
- `avatar_url`：Google 头像 URL（可选存储）
- `email`：Google 邮箱（已有字段，复用）
- `nickname`：Google 显示名称（已有字段，复用）

#### 4.2.4 路由实现

**文件**：`core/src/routes/auth.ts`

**新增路由**：
```typescript
/**
 * POST /api/v1/auth/google_login
 * Google 一键登录
 */
router.post('/google_login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idToken, channel } = req.body;
    
    // 验证输入
    if (!idToken) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ID_TOKEN_REQUIRED',
          message: 'Google ID Token 不能为空',
        },
      } as ApiResponse);
    }
    
    if (!channel || !['cn', 'hk'].includes(channel)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CHANNEL',
          message: 'channel 必须是 cn 或 hk',
        },
      } as ApiResponse);
    }
    
    const result = await googleAuthService.googleLogin({ idToken, channel });
    
    res.json({
      success: true,
      data: result,
    } as ApiResponse);
  } catch (error: any) {
    // 处理 Google 认证错误
    if (error.message?.includes('Google') || 
        error.message?.includes('Token') ||
        error.code === 'INVALID_GOOGLE_TOKEN') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'GOOGLE_AUTH_FAILED',
          message: error.message || 'Google 登录失败',
        },
      } as ApiResponse);
    }
    next(error);
  }
});
```

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

### 6.1 Google Cloud Console 配置

#### 6.1.1 Android 客户端（✅ 已创建）

| 配置项 | 值 | 状态 |
|--------|-----|------|
| **客户端 ID** | `343578696044-gjrucpeateqd8gln9fev4u3bqc5ime0q.apps.googleusercontent.com` | ✅ 已创建 |
| **Package Name** | `tech.dawnai.xiaopei.app` | ⚠️ 需确认是否已配置 |
| **SHA-1 指纹** | （待获取） | ⚠️ 需配置 |

**获取 SHA-1 指纹**：
参考：`获取Android-SHA1指纹指南.md`

#### 6.1.2 iOS 客户端（⚠️ 待确认）

| 配置项 | 值 | 状态 |
|--------|-----|------|
| **Bundle ID** | `tech.dawnai.xiaopei.app` | ⚠️ 需确认是否已创建 |
| **客户端 ID** | （待获取） | ⚠️ 需创建 |

**创建步骤**：
1. 登录 Google Cloud Console
2. 进入「API 和凭据」→「OAuth 2.0 客户端 ID」
3. 选择「iOS」应用类型
4. 输入 Bundle ID：`tech.dawnai.xiaopei.app`
5. 获取 iOS 客户端 ID

#### 6.1.3 Web 客户端（可选）

如果需要后端验证 Token，可能需要 Web 客户端 ID（与 Android 客户端 ID 可能相同）。

### 6.2 应用配置

#### 6.2.1 Package Name / Bundle ID 一致性

**当前代码配置**：
- iOS Bundle ID：`com.xiaopei.app`（`app/app.json`）
- Android Package：`com.xiaopei.app`（`app/app.json`）

**Google Cloud Console 配置**：
- Package Name / Bundle ID：`tech.dawnai.xiaopei.app`

**⚠️ 需要确认**：
- 如果使用 `tech.dawnai.xiaopei.app`，需要修改 `app/app.json`
- 如果使用 `com.xiaopei.app`，需要修改 Google Cloud Console 配置

#### 6.2.2 环境变量（后端）

```bash
# .env 或环境变量
GOOGLE_CLIENT_ID=343578696044-gjrucpeateqd8gln9fev4u3bqc5ime0q.apps.googleusercontent.com
```

---

## 🔄 七、账号绑定策略

### 7.1 策略说明

**Google 登录用户**：
- ✅ 单独创建账号（不绑定手机号）
- ✅ 使用 Google 账号信息（email, name, picture）
- ❌ 不需要绑定手机号
- ❌ 不需要验证码验证

### 7.2 用户数据存储

**存储字段**：
- `google_id`：Google 用户唯一标识（sub）
- `email`：Google 邮箱（如果有）
- `nickname`：Google 显示名称（如果有）
- `avatar_url`：Google 头像 URL（如果有）

**不存储字段**：
- 手机号（Google 登录用户不绑定手机号）
- 其他额外要求字段（按需求：无额外要求就不存储）

### 7.3 用户查找逻辑

```typescript
// 伪代码
async function findOrCreateGoogleUser(googleUserInfo) {
  // 1. 根据 google_id 查找用户
  let user = await db.findUserByGoogleId(googleUserInfo.sub);
  
  if (user) {
    // 2. 如果存在，更新用户信息（可选）
    await db.updateUser(user.userId, {
      email: googleUserInfo.email,
      nickname: googleUserInfo.name,
      avatar_url: googleUserInfo.picture,
    });
    return user;
  }
  
  // 3. 如果不存在，创建新用户
  user = await db.createUser({
    google_id: googleUserInfo.sub,
    email: googleUserInfo.email,
    nickname: googleUserInfo.name,
    avatar_url: googleUserInfo.picture,
    // phone 不设置（Google 登录用户不绑定手机号）
  });
  
  return user;
}
```

---

## 🧪 八、测试计划

### 8.1 功能测试

1. **协议确认测试**：
   - ✅ 未勾选协议时，两个按钮禁用
   - ✅ 已勾选协议时，两个按钮可用
   - ✅ 未勾选直接点击按钮，显示错误提示

2. **Google 登录测试**：
   - ✅ 点击 Google 登录按钮，调起 Google 登录
   - ✅ 选择 Google 账号，授权成功
   - ✅ 登录成功后，返回用户信息和 Token
   - ✅ 首次登录创建新账号
   - ✅ 二次登录使用已有账号

3. **错误处理测试**：
   - ✅ 用户取消授权，显示友好提示
   - ✅ 网络错误，显示错误提示
   - ✅ Token 验证失败，显示错误提示

### 8.2 兼容性测试

- ✅ iOS 真机测试
- ✅ Android 真机测试
- ✅ 不同 Google 账号测试
- ✅ 首次登录 vs 二次登录测试

---

## ⚠️ 九、风险评估

### 9.1 技术风险

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| **Google SDK 兼容性** | 中等 | 使用官方推荐的 `@react-native-google-signin/google-signin` |
| **原生配置复杂度** | 中等 | 参考官方文档，逐步配置 |
| **Token 验证失败** | 高 | 后端使用 `google-auth-library` 正确验证 |
| **Package Name 不一致** | 高 | 确认并统一 Package Name / Bundle ID |

### 9.2 用户体验风险

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| **Google 登录不可用** | 低 | 提供电话号码登录备选方案 |
| **用户取消授权** | 低 | 显示友好提示，引导使用电话号码登录 |
| **网络错误** | 中等 | 显示明确错误提示，支持重试 |

---

## 📝 十、实施步骤

### 10.1 前端实施步骤

1. ✅ 安装依赖：`@react-native-google-signin/google-signin`
2. ✅ 创建 `LoginMethodSelector` 组件
3. ✅ 创建 `GoogleSignInButton` 组件
4. ✅ 创建 `google.ts` 配置文件
5. ✅ 重构 `AuthScreen`：添加登录方式选择
6. ✅ 实现 Google 登录流程
7. ✅ 配置原生代码（iOS/Android）
8. ✅ 添加错误处理和提示

### 10.2 后端实施步骤

1. ✅ 安装依赖：`google-auth-library`
2. ✅ 创建 `googleAuthService.ts`
3. ✅ 实现 Google Token 验证
4. ✅ 实现用户查找/创建逻辑
5. ✅ 新增路由：`POST /api/v1/auth/google_login`
6. ✅ 数据库迁移：添加 `google_id` 等字段
7. ✅ 添加错误处理和日志

### 10.3 配置步骤

1. ⚠️ 确认 Package Name / Bundle ID 一致性
2. ⚠️ 获取 Android SHA-1 指纹并配置到 Google Cloud Console
3. ⚠️ 创建 iOS 客户端（如果未创建）
4. ⚠️ 配置后端环境变量
5. ✅ 测试 Google 登录流程

---

## 📚 十一、参考文档

- [React Native Google Sign-In 官方文档](https://github.com/react-native-google-signin/google-signin)
- [Google OAuth 2.0 文档](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
- [获取Android-SHA1指纹指南.md](./获取Android-SHA1指纹指南.md)
- [app.doc/features/注册登录设计文档.md](./app.doc/features/注册登录设计文档.md)
- [app.doc/API接口统一规范.md](./app.doc/API接口统一规范.md)

---

## ✅ 十二、待确认事项清单

- [ ] **iOS 客户端**：是否已在 Google Cloud Console 创建？
- [ ] **Package Name 一致性**：确认使用 `tech.dawnai.xiaopei.app` 还是 `com.xiaopei.app`？
- [ ] **Android SHA-1 指纹**：是否已配置到 Google Cloud Console？
- [ ] **iOS Bundle ID**：确认 Google Cloud Console 中配置的 Bundle ID
- [ ] **后端环境变量**：确认 `GOOGLE_CLIENT_ID` 配置

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
- 使用专用接口：`POST /api/v1/auth/google_login`
- 更明确的参数结构（`idToken` 而非 `accessToken`）

**建议**：
- 使用专用接口更清晰
- 如需支持其他第三方登录，可后续扩展

---

## 🎯 十四、总结

### 14.1 核心要点

1. **协议确认前置**：在选择登录方式之前必须勾选协议
2. **Google 登录作为主要方式**：与电话号码登录并列显示
3. **单独创建账号**：Google 登录用户不绑定手机号
4. **基本字段存储**：存储 email, name, picture（无额外要求）

### 14.2 关键配置

- ✅ Android 客户端 ID：`343578696044-gjrucpeateqd8gln9fev4u3bqc5ime0q.apps.googleusercontent.com`
- ⚠️ Package Name：`tech.dawnai.xiaopei.app`（需确认一致性）
- ⚠️ iOS 客户端：待创建
- ⚠️ SHA-1 指纹：待配置

### 14.3 下一步行动

1. **确认配置**：Package Name、iOS 客户端、SHA-1 指纹
2. **开始实施**：按照实施步骤逐步完成
3. **测试验证**：完成功能测试和兼容性测试
4. **文档更新**：实施完成后更新设计文档

---

**文档版本**: v1.0  
**最后更新**: 2024年12月  
**维护者**: 开发团队

