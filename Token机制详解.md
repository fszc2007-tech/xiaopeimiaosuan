# Token 机制详解

## 一、Token 的作用

**Token 是用户身份认证凭证**（JWT - JSON Web Token），用于：

1. ✅ **证明用户已登录**
2. ✅ **保护 API 接口**（防止未授权访问）
3. ✅ **跨请求保持登录状态**（无需每次都输入密码）

---

## 二、Token 的生命周期

```
用户登录
  ↓
后端验证手机号+验证码
  ↓
后端生成 JWT Token（包含 userId、过期时间等）
  ↓
前端收到 Token
  ↓
保存到内存（authStore）+ AsyncStorage（持久化）
  ↓
每次 API 请求自动携带 Token（在 Authorization header 中）
  ↓
后端验证 Token 是否有效
  ↓
验证通过 → 执行业务逻辑
验证失败 → 返回 401 错误，前端跳转到登录页
```

---

## 三、关键代码位置

### 1️⃣ **前端：获取 Token**（登录时）

**文件**: `app/src/screens/Auth/AuthScreen.tsx`

```typescript
// 步骤 1：发送验证码
const response = await authService.requestOtp(phone, 'SMS');

// 步骤 2：验证验证码并登录
const response = await authService.loginOrRegister({
  phone,
  code: otp,
  channel: appRegion,
});

// 步骤 3：保存 Token 到 authStore
login(response.user, response.token);  // ← 这里保存 token
```

---

### 2️⃣ **前端：存储 Token**（authStore）

**文件**: `app/src/store/authStore.ts`

```typescript
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      login: (user, token) => {
        set({
          user,
          token: token,              // ← 保存到内存
          isAuthenticated: true,
        });
      },
    }),
    {
      name: 'xiaopei-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),  // ← 持久化到 AsyncStorage
    }
  )
);
```

---

### 3️⃣ **前端：每次请求自动携带 Token**（apiClient）

**文件**: `app/src/services/api/apiClient.ts`

```typescript
// 请求拦截器：自动添加 Authorization header
apiClient.interceptors.request.use(
  (config) => {
    // 从 authStore 获取 token
    const token = useAuthStore.getState().token;
    
    if (token) {
      // ✅ 关键代码：添加到 Authorization header
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  }
);
```

**所有 API 请求都会自动添加这个 header**：
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### 4️⃣ **后端：验证 Token**（authMiddleware）

**文件**: `core/src/middleware/auth.ts`

```typescript
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    // 从请求头中提取 token
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      // ❌ 没有 token → 返回 401
      return res.status(401).json({
        success: false,
        error: { code: 'TOKEN_REQUIRED', message: '未提供认证 Token' },
      });
    }
    
    // ✅ 验证 token 并解析出 userId
    const { userId } = verifyToken(token);
    req.userId = userId;  // 将 userId 挂载到 req 对象上
    
    next();  // 继续执行业务逻辑
  } catch (error) {
    // ❌ token 无效或过期 → 返回 401
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Token 无效或已过期' },
    });
  }
}
```

---

### 5️⃣ **后端：生成和验证 Token**（authService）

**文件**: `core/src/modules/auth/authService.ts`

```typescript
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'xiaopei-secret-key';
const JWT_EXPIRES_IN = '30d';  // Token 有效期 30 天

// 生成 Token
export function generateToken(userId: string): string {
  return jwt.sign(
    { userId },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// 验证 Token
export function verifyToken(token: string): { userId: string } {
  const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
  return { userId: decoded.userId };
}
```

---

## 四、哪些 API 需要 Token？

在 Core 后端，所有使用 `authMiddleware` 的路由都需要 token：

**文件**: `core/src/routes/*.ts`

```typescript
// ✅ 需要 token 的路由（受保护）
router.get('/me', authMiddleware, async (req, res) => {
  const userId = req.userId;  // ← 从 authMiddleware 解析出来
  // ...
});

router.post('/bazi/chart', authMiddleware, async (req, res) => {
  const userId = req.userId;
  // ...
});

router.get('/bazi/charts/:chartId', authMiddleware, async (req, res) => {
  const userId = req.userId;
  // ...
});

// ❌ 不需要 token 的路由（公开）
router.post('/auth/login', async (req, res) => {
  // 登录本身不需要 token
});

router.post('/auth/otp', async (req, res) => {
  // 发送验证码也不需要 token
});
```

---

## 五、Token 丢失的影响

如果 Token 丢失（重启后没有恢复）：

1. ❌ **所有受保护的 API 都会返回 401**
   ```json
   {
     "success": false,
     "error": {
       "code": "TOKEN_REQUIRED",
       "message": "未提供认证 Token"
     }
   }
   ```

2. ❌ **用户需要重新登录**

3. ❌ **"我的"页面显示"未登录"**

---

## 六、当前问题

### 问题：Token 保存成功，但重启后丢失

**已验证**：
- ✅ Token 已保存到 AsyncStorage（517 字节）
- ✅ 登录成功时 token 存在
- ❌ 重启后 token 为空

**可能原因**：
1. Zustand persist 的 `migrate` 或 `onRehydrateStorage` 函数有问题
2. AsyncStorage 读取时机不对
3. React Native 版本兼容性问题

**解决方案**：
- 已增强日志追踪
- 下一步：查看重启后的 `migrate` 和 `onRehydrateStorage` 日志
- 如果还不行：改用手动 AsyncStorage 管理

---

## 七、总结

| 步骤 | 位置 | 关键代码 |
|------|------|----------|
| 1. 生成 Token | `core/src/modules/auth/authService.ts` | `generateToken(userId)` |
| 2. 保存 Token | `app/src/store/authStore.ts` | `set({ token })` + `persist()` |
| 3. 携带 Token | `app/src/services/api/apiClient.ts` | `config.headers.Authorization = \`Bearer \${token}\`` |
| 4. 验证 Token | `core/src/middleware/auth.ts` | `verifyToken(token)` |

**Token 是整个认证体系的核心**，没有 token 就无法访问任何受保护的 API。

