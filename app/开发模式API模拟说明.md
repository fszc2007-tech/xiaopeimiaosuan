# 开发模式 API 模拟说明

## ✅ 已实现的模拟 API

### 1. 登录/注册 API
**文件**: `app/src/screens/Auth/AuthScreen.tsx`

#### 模拟行为
- ✅ 不调用真实的 `/api/v1/auth/login_or_register`
- ✅ 不需要真实的验证码
- ✅ 任意手机号 + 任意6位数字即可登录
- ✅ 自动生成模拟用户数据和 Token

#### 模拟数据
```typescript
{
  user: {
    id: 'mock-user-1700473200000',
    phone: '13800138000',  // 用户输入的手机号
    nickname: '测试用户',
    avatar: null,
    appRegion: 'CN',
    createdAt: '2025-11-19T15:00:00Z',
    updatedAt: '2025-11-19T15:00:00Z',
  },
  token: 'mock-token-1700473200000',
}
```

### 2. 获取用户信息 API
**文件**: `app/src/services/api/authApi.ts`

#### 接口
- `GET /api/v1/auth/me`

#### 模拟行为
- ✅ 不调用真实 API
- ✅ 返回模拟用户数据
- ✅ 模拟 500ms 网络延迟

#### 模拟数据
```typescript
{
  userId: 'mock-user-1700473200000',
  phone: '13800138000',
  email: undefined,
  isPro: false,           // 非 Pro 用户
  proExpiresAt: undefined,
  proType: undefined,
  currentProfile: undefined,
}
```

### 3. 获取命盘列表 API
**文件**: `app/src/services/api/baziApi.ts`

#### 接口
- `GET /api/v1/bazi/charts`

#### 模拟行为
- ✅ 不调用真实 API
- ✅ 返回空的命盘列表（新用户状态）
- ✅ 模拟 500ms 网络延迟

#### 模拟数据
```typescript
{
  profiles: [],           // 空列表（新用户）
  total: 0,
  currentProfileId: null,
}
```

## 🎯 涵盖的页面

### ✅ 登录页面 (AuthScreen)
- 发送验证码
- 登录/注册

### ✅ 档案页面 (CasesScreen)
- 获取命盘列表
- 显示空状态（新用户）

### ✅ 我的页面 (MeScreen)
- 获取用户信息
- 显示基本资料

## 📱 用户体验

### 登录流程
```
1. 输入手机号：13800138000
2. 点击"發送驗證碼"（立即跳过）
3. 输入验证码：123456
4. 点击"登入"
5. ⏱️  等待 800ms
6. ✅ 登录成功，进入应用
```

### 档案页面
```
进入档案页面
    ↓
⏱️  加载 500ms
    ↓
显示"建立第一个命盘"的空状态
    ↓
点击"新增命盘"按钮
    ↓
跳转到手动排盘页面
```

### 我的页面
```
进入我的页面
    ↓
⏱️  加载 500ms
    ↓
显示用户信息：
- 手机号：13800138000
- 非 Pro 用户
- 命盘数量：0
```

## 🔍 控制台日志

### 成功的开发模式日志
```
🔧 开发模式：跳过验证码发送，任意6位数字可作为验证码
🔧 开发模式：模拟登录成功，跳过后端验证
✅ 模拟登录成功
🔧 开发模式：返回模拟命盘列表
🔧 开发模式：返回模拟用户信息
```

## 🚀 生产环境行为

### 自动切换
所有模拟逻辑使用 `__DEV__` 标志：
```typescript
if (__DEV__) {
  // 开发模式：模拟数据
  return mockData;
}

// 生产模式：真实 API
return await apiClient.get(...);
```

### 生产构建
```bash
# iOS Release
npx expo run:ios --configuration Release

# Android Release
npx expo run:android --variant release

# 结果：
__DEV__ === false
所有模拟代码自动禁用
使用真实 API 调用
```

## ✨ 可测试的功能

### 当前可以测试 ✅
1. **登录流程**
   - UI 交互
   - 表单验证
   - 按钮状态
   - 加载动画
   - 错误提示

2. **导航流程**
   - Tab 切换
   - 页面跳转
   - 返回导航

3. **档案页面**
   - 空状态显示
   - 搜索框
   - 筛选按钮
   - 新增按钮

4. **我的页面**
   - 用户信息显示
   - 菜单列表
   - 各个功能入口

### 暂时无法测试 ⏳
1. **实际数据**
   - 真实命盘数据
   - Pro 订阅状态
   - 历史对话记录

2. **后端交互**
   - 数据持久化
   - 真实 Token 验证
   - 业务逻辑验证

3. **创建命盘**
   - 需要后端 API
   - 需要真实的八字计算

## 🔧 需要添加模拟的其他 API

### 未来可能需要模拟的接口

#### 1. 对话历史
```typescript
// app/src/services/api/chatApi.ts
export const getConversations = async () => {
  if (__DEV__) {
    return { conversations: [], total: 0 };
  }
  return apiClient.get('/api/v1/chat/conversations');
};
```

#### 2. 解读历史
```typescript
// app/src/services/api/readingApi.ts
export const getReadings = async () => {
  if (__DEV__) {
    return { readings: [], total: 0 };
  }
  return apiClient.get('/api/v1/readings');
};
```

#### 3. Pro 状态
```typescript
// app/src/services/api/proApi.ts
export const getProStatus = async () => {
  if (__DEV__) {
    return { isPro: false, plan: null };
  }
  return apiClient.get('/api/v1/pro/status');
};
```

## 📊 模拟数据策略

### 当前策略：空状态
```
优点：
✅ 简单
✅ 符合新用户体验
✅ 可以测试空状态 UI
✅ 可以测试"新增"功能入口

缺点：
❌ 无法测试列表渲染
❌ 无法测试数据交互
❌ 无法测试详情页面
```

### 可选策略：预置数据
```typescript
// 可以返回一些示例数据
if (__DEV__) {
  return {
    profiles: [
      {
        profileId: 'mock-1',
        name: '张三',
        relationType: 'self',
        isCurrent: true,
        // ... 更多字段
      },
      {
        profileId: 'mock-2',
        name: '李四',
        relationType: 'friend',
        isCurrent: false,
        // ... 更多字段
      },
    ],
    total: 2,
    currentProfileId: 'mock-1',
  };
}
```

## 🎯 测试建议

### 前端 UI 测试
1. ✅ 启动应用
2. ✅ 完成登录流程
3. ✅ 浏览所有 Tab
4. ✅ 测试导航
5. ✅ 测试空状态显示
6. ✅ 测试按钮交互
7. ✅ 测试表单输入

### 集成测试（需要后端）
1. ⏳ 真实登录
2. ⏳ 创建命盘
3. ⏳ 查看命盘详情
4. ⏳ 开始对话
5. ⏳ 获取解读
6. ⏳ 订阅 Pro

## 📝 修改记录

### v1.0 - 2025-11-19
- ✅ 添加登录/注册模拟（AuthScreen）
- ✅ 添加获取用户信息模拟（authApi.getMe）
- ✅ 添加获取命盘列表模拟（baziApi.getCharts）

### 受影响的文件
1. `app/src/screens/Auth/AuthScreen.tsx`
2. `app/src/services/api/authApi.ts`
3. `app/src/services/api/baziApi.ts`

## 🔒 安全说明

### 开发模式
- ✅ 仅在 `__DEV__ === true` 时启用
- ✅ 控制台有明确的日志标识（🔧 emoji）
- ✅ 不会影响生产环境

### 生产模式
- ⚠️ Release 构建自动禁用所有模拟
- ⚠️ 使用真实的 API 调用
- ⚠️ 完整的安全验证

### 环境检测
```typescript
__DEV__: boolean  // React Native 内置

开发模式：
- npm start / expo start
- __DEV__ === true
- 所有模拟启用

生产模式：
- expo build / eas build
- __DEV__ === false
- 所有模拟禁用
```

---

**版本**: v1.0  
**更新日期**: 2025-11-19  
**状态**: ✅ 核心 API 已模拟，可以正常使用应用进行前端测试  
**下一步**: 根据需要添加更多模拟 API 或测试真实后端集成

