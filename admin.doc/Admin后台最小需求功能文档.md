# Admin 后台最小需求功能文档

> **版本**: v1.0  
> **创建日期**: 2024年11月  
> **状态**: 需求设计阶段

---

## 一、概述

### 1.1 目标

Admin 后台是用于管理小佩 App 系统的管理平台，主要用于：
- 用户管理（C 端用户）
- 系统配置管理
- 开发测试支持

**本文档基于以下 v1.0 最小需求**：

- 管理 C 端用户（查看列表与详情）
- 通过 Admin 创建测试用户
- 提供一个固定的 Cursor 自动测试账号
- 在后台配置 DeepSeek / ChatGPT / Qwen 的 API Key（非明文存储），并支持 DeepSeek 的思考/非思考模式切换

> **重要**: 以上功能为 v1.0 最小需求，不可砍掉。

### 1.2 核心功能

1. **用户管理**
   - 查看 C 端用户列表
   - 查看用户详情
   - 通过 Admin 注册新用户（开发测试用）
   - 创建测试账号（Cursor 自动执行测试用）

2. **大模型 API 配置**
   - DeepSeek API 配置（支持流式、思考模式选择）
   - ChatGPT API 配置
   - Qwen API 配置
   - 密钥加密存储（非明文）

---

## 二、用户管理功能

### 2.1 用户列表

**功能描述**: 查看所有 C 端用户列表

**页面元素**:
- 用户列表表格
  - 用户ID
  - 手机号/邮箱
  - 昵称
  - 注册时间
  - 最后登录时间
  - 是否 Pro 用户
  - 操作按钮（查看详情）

**功能**:
- 搜索（按手机号/邮箱/昵称）
- 筛选（Pro 用户/普通用户）
- 分页
- 排序（按注册时间/最后登录时间）

---

### 2.2 用户详情

**功能描述**: 查看单个用户的详细信息

**显示内容**:
- 基本信息
  - 用户ID
  - 手机号/邮箱
  - 昵称
  - 头像
  - 注册时间
  - 最后登录时间
  - 应用区域（CN/HK）
- 订阅信息
  - 是否 Pro 用户
  - Pro 到期时间
  - 订阅历史
- 命盘档案
  - 命盘数量
  - 命盘列表（可查看）
  - **注**: 本模块仅在相关业务表已上线后展示；若尚未接入，可返回空列表/零值，不影响 Admin 其他功能。
- 使用统计
  - 排盘次数
  - 对话次数
  - 最后活跃时间
  - **注**: 本模块依赖已有业务表，未接入时可为空，不影响 Admin 其他功能。

---

### 2.3 通过 Admin 注册用户

**功能描述**: 在开发测试阶段，管理员可以通过 Admin 后台直接注册新用户

**使用场景**:
- 开发阶段快速创建测试用户
- 不需要手机号验证码流程
- 方便测试不同用户状态

**页面元素**:
- 注册表单
  - 手机号/邮箱（必填）
  - 密码（必填，用于后续登录）
  - 昵称（可选）
  - 应用区域（CN/HK，默认 CN）
  - 是否直接设置为 Pro 用户（可选，用于测试 Pro 功能）

**功能**:
- 表单验证
- 检查手机号/邮箱是否已存在
- 注册成功后显示用户ID和初始密码
- 支持复制用户信息

**注意事项**:
- 此功能仅在开发/测试环境使用
- 生产环境可以禁用或限制权限
- 注册的用户可以正常使用 App 所有功能

---

### 2.4 创建 Cursor 测试账号

**功能描述**: 创建一个专门用于 Cursor 自动执行测试的账号

**使用场景**:
- Cursor 自动化测试
- 不需要每次都用代码创建用户
- 固定测试账号，便于测试脚本复用

**页面元素**:
- 创建测试账号按钮
- 测试账号信息显示
  - 账号标识：`cursor_test_user`
  - 用户ID
  - 手机号/邮箱（固定格式，如 `cursor_test@xiaopei.com`）
  - 密码（自动生成，可复制）
  - 是否已创建状态

**功能**:
- 一键创建测试账号
- 如果账号已存在，显示现有账号信息
- 如果账号不存在，创建新账号
- 自动设置为 Pro 用户（便于测试所有功能）
- 支持重置密码

**账号规范**:
- 账号标识：`cursor_test_user`（固定）
- 手机号/邮箱：`cursor_test@xiaopei.com`（固定）
- 密码：自动生成，可重置
- 昵称：`Cursor测试账号`
- 应用区域：CN
- 默认 Pro：是

**API 接口**:
```typescript
// 获取或创建 Cursor 测试账号
GET /api/admin/users/cursor-test-account

// 响应
{
  success: true,
  data: {
    userId: string,
    phone: string,  // 或 email
    password: string,  // 仅首次创建或重置时返回
    isPro: boolean,
    createdAt: string,
  }
}

// 重置密码
POST /api/admin/users/cursor-test-account/reset-password

// 响应
{
  success: true,
  data: {
    password: string,  // 新密码
  }
}
```

---

## 三、大模型 API 配置功能

### 3.1 功能概述

**功能描述**: 配置和管理多个大模型 API，用于小佩的 AI 对话功能

**支持的模型**（仅三个，没有其他模型）:
1. **DeepSeek**
   - 支持流式响应
   - 支持思考模式（thinking）和非思考模式
   - 可选择是否启用思考模式

2. **ChatGPT**
   - OpenAI API
   - 支持流式响应

3. **Qwen**
   - 通义千问 API
   - 支持流式响应

**重要说明**:
- ✅ 当前版本仅支持以上三个模型
- ✅ 没有其他模型，如有需要再另外增加（先不开发）
- ✅ 所有模型配置通过 Admin 后台管理

---

### 3.2 配置页面设计

**页面布局**:
- 三个配置卡片，分别对应三个模型
- 每个卡片包含：
  - 模型名称和 Logo
  - 启用/禁用开关
  - 配置表单
  - 测试连接按钮
  - 当前状态显示

---

### 3.3 DeepSeek 配置

**配置项**:
- **API Key**（必填）
  - 输入框类型：密码输入（显示为 `******`）
  - 保存时加密存储
  - 支持查看/隐藏切换（需要管理员密码确认）

- **Base URL**（可选）
  - 默认值：`https://api.deepseek.com`
  - 支持自定义（用于代理或私有部署）

- **模型名称**（可选）
  - 默认值：`deepseek-chat`
  - 支持自定义

- **启用流式响应**（开关）
  - 默认：启用
  - 是否使用流式 API

- **启用思考模式**（开关）
  - 默认：禁用
  - 是否启用 DeepSeek 的思考模式（thinking）
  - 仅在流式响应启用时可用

- **温度（Temperature）**（可选）
  - 默认值：0.7
  - 范围：0-2
  - 控制输出的随机性

- **最大 Token 数**（可选）
  - 默认值：4096
  - 限制响应长度

**功能**:
- 保存配置（加密存储 API Key）
- 测试连接（使用配置的 API Key 发送测试请求）
- 启用/禁用（控制是否使用该模型）

**状态显示**:
- ✅ 已配置且可用
- ⚠️ 已配置但未测试
- ❌ 配置错误或连接失败
- 🔒 未配置

---

### 3.4 ChatGPT 配置

**配置项**:
- **API Key**（必填）
  - 输入框类型：密码输入
  - 保存时加密存储

- **Base URL**（可选）
  - 默认值：`https://api.openai.com/v1`
  - 支持自定义（用于代理）

- **模型名称**（可选）
  - 默认值：`gpt-4` 或 `gpt-3.5-turbo`
  - 支持选择：`gpt-4`, `gpt-4-turbo`, `gpt-3.5-turbo`

- **启用流式响应**（开关）
  - 默认：启用

- **温度（Temperature）**（可选）
  - 默认值：0.7

- **最大 Token 数**（可选）
  - 默认值：4096

**功能**:
- 保存配置
- 测试连接
- 启用/禁用

---

### 3.5 Qwen 配置

**配置项**:
- **API Key**（必填）
  - 输入框类型：密码输入
  - 保存时加密存储

- **Base URL**（可选）
  - 默认值：`https://dashscope.aliyuncs.com/api/v1`
  - 支持自定义

- **模型名称**（可选）
  - 默认值：`qwen-turbo` 或 `qwen-plus`
  - 支持选择：`qwen-turbo`, `qwen-plus`, `qwen-max`

- **启用流式响应**（开关）
  - 默认：启用

- **温度（Temperature）**（可选）
  - 默认值：0.7

- **最大 Token 数**（可选）
  - 默认值：4096

**功能**:
- 保存配置
- 测试连接
- 启用/禁用

---

### 3.6 模型选择策略

**功能描述**: 配置默认使用的模型和备用模型

**配置项**:
- **默认模型**（下拉选择）
  - 从已启用且可用的模型中选择
  - 选项：DeepSeek / ChatGPT / Qwen

- **备用模型**（多选）
  - 当默认模型不可用时，按顺序尝试备用模型
  - 支持拖拽排序

**使用逻辑**:
1. 优先使用默认模型
2. 如果默认模型失败，按顺序尝试备用模型
3. 如果所有模型都失败，返回错误

---

## 四、数据安全

### 4.1 API Key 加密存储

**要求**:
- API Key 必须加密存储，不能明文保存
- 使用环境变量或密钥管理服务
- 数据库中的 API Key 字段使用加密存储
- **绝不**在 API 响应中返回真实的 API Key
- 仅在需要查看时，通过单独的接口并经过二次验证后返回

**实现方式**:
```typescript
// 使用加密库加密存储
import crypto from 'crypto';

const algorithm = 'aes-256-gcm';
const secretKey = process.env.ENCRYPTION_KEY; // 从环境变量获取

function encryptApiKey(apiKey: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  // ... 加密逻辑
  return encrypted;
}

function decryptApiKey(encrypted: string): string {
  // ... 解密逻辑
  return decrypted;
}

// 生成掩码显示（显示后 4 位）
function maskApiKey(apiKey: string): string {
  if (!apiKey || apiKey.length <= 4) {
    return '****';
  }
  const last4 = apiKey.slice(-4);
  return '*'.repeat(Math.max(apiKey.length - 4, 12)) + last4;
}
```

**数据库表设计**:
```sql
CREATE TABLE llm_api_configs (
  id VARCHAR(36) PRIMARY KEY,
  provider ENUM('deepseek', 'chatgpt', 'qwen') NOT NULL,
  api_key_encrypted TEXT NOT NULL,  -- 加密后的 API Key
  base_url VARCHAR(500),
  model_name VARCHAR(100),
  enable_stream BOOLEAN DEFAULT TRUE,
  enable_thinking BOOLEAN DEFAULT FALSE,  -- DeepSeek 专用
  temperature DECIMAL(3,2) DEFAULT 0.7,
  max_tokens INT DEFAULT 4096,
  is_enabled BOOLEAN DEFAULT FALSE,
  is_default BOOLEAN DEFAULT FALSE,
  test_status ENUM('success', 'failed', 'not_tested') DEFAULT 'not_tested',
  test_message TEXT,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  UNIQUE KEY uk_provider (provider)
);
```

---

### 4.2 权限控制

**要求**:
- 只有超级管理员可以配置大模型 API
- 查看 API Key 需要二次验证（管理员密码）
- 操作日志记录（谁在什么时候修改了配置）

---

## 五、API 接口设计

### 5.1 用户管理 API

#### 5.1.1 获取用户列表

```http
GET /api/admin/users
```

**查询参数**:
- `page`: 页码（默认 1）
- `pageSize`: 每页数量（默认 20）
- `search`: 搜索关键词（手机号/邮箱/昵称）
- `filter`: 筛选条件（`pro` / `normal`）
- `sort`: 排序字段（`created_at` / `last_login_at`）
- `order`: 排序方向（`asc` / `desc`）

**响应**:
```typescript
{
  success: true,
  data: {
    items: User[],
    total: number,
    page: number,
    pageSize: number,
  }
}
```

---

#### 5.1.2 获取用户详情

```http
GET /api/admin/users/:userId
```

**响应**:
```typescript
{
  success: true,
  data: {
    user: UserDetail,
    charts: Chart[],
    stats: {
      chartCount: number,
      conversationCount: number,
      lastActiveAt: string,
    }
  }
}
```

---

#### 5.1.3 通过 Admin 注册用户

```http
POST /api/admin/users/register
```

**请求**:
```typescript
{
  phone?: string,      // 手机号（CN 区域）
  email?: string,      // 邮箱（HK 区域）
  password: string,    // 密码
  nickname?: string,   // 昵称
  app_region: 'CN' | 'HK',  // 应用区域
  is_pro?: boolean,    // 是否直接设置为 Pro（测试用）
}
```

**响应**:
```typescript
{
  success: true,
  data: {
    userId: string,
    phone?: string,
    email?: string,
    password: string,  // 返回初始密码（仅此次）
    nickname: string,
    isPro: boolean,
  }
}
```

---

#### 5.1.4 获取或创建 Cursor 测试账号

```http
GET /api/admin/users/cursor-test-account
```

**响应**:
```typescript
{
  success: true,
  data: {
    userId: string,
    phone: string,     // 或 email
    password?: string, // 仅首次创建或重置时返回
    nickname: string,
    isPro: boolean,
    createdAt: string,
    exists: boolean,   // 是否已存在
  }
}
```

---

#### 5.1.5 重置 Cursor 测试账号密码

```http
POST /api/admin/users/cursor-test-account/reset-password
```

**响应**:
```typescript
{
  success: true,
  data: {
    password: string,  // 新密码
  }
}
```

---

### 5.2 大模型 API 配置

#### 5.2.1 获取所有模型配置

```http
GET /api/admin/llm-configs
```

**响应**:
```typescript
{
  success: true,
  data: {
    configs: LLMConfig[],
    defaultProvider: string,
    fallbackProviders: string[],
  }
}
```

**LLMConfig 类型**:
```typescript
interface LLMConfig {
  provider: 'deepseek' | 'chatgpt' | 'qwen';
  hasApiKey: boolean;        // 是否已配置过 Key
  apiKeyMasked?: string;     // 例如 '************abcd'，仅用于 UI 显示（显示后 4 位）
  baseUrl: string;
  modelName: string;
  enableStream: boolean;
  enableThinking?: boolean;  // DeepSeek 专用
  temperature: number;
  maxTokens: number;
  isEnabled: boolean;
  isDefault: boolean;
  testStatus: 'success' | 'failed' | 'not_tested';
  testMessage?: string;
}
```

**说明**:
- `hasApiKey`: 表示是否已配置过 API Key（布尔值，更安全）
- `apiKeyMasked`: 仅用于 UI 显示，显示后 4 位字符（如 `************abcd`），不返回真实 API Key
- 后端**绝不**在 API 响应中返回真实的 API Key
- 如需查看真实 API Key，必须通过单独的接口并经过二次验证（见 5.2.5）

---

#### 5.2.2 更新模型配置

```http
PUT /api/admin/llm-configs/:provider
```

**请求**:
```typescript
{
  apiKey?: string,        // 如果提供，会加密存储（仅在更新时传入）
  baseUrl?: string,
  modelName?: string,
  enableStream?: boolean,
  enableThinking?: boolean,  // DeepSeek 专用
  temperature?: number,
  maxTokens?: number,
  isEnabled?: boolean,
}
```

**注意**: 
- `apiKey` 字段仅在需要更新 API Key 时传入
- 如果不传入 `apiKey`，则保持原有的加密存储值不变
- 传入的 `apiKey` 会被加密后存储，响应中不会返回真实值

**响应**:
```typescript
{
  success: true,
  data: {
    config: LLMConfig,
  }
}
```

---

#### 5.2.3 测试模型连接

```http
POST /api/admin/llm-configs/:provider/test
```

**响应**:
```typescript
{
  success: boolean,
  data: {
    status: 'success' | 'failed',
    message: string,
    responseTime?: number,  // 响应时间（毫秒）
  }
}
```

---

#### 5.2.4 设置默认模型和备用模型

```http
PUT /api/admin/llm-configs/strategy
```

**请求**:
```typescript
{
  defaultProvider: 'deepseek' | 'chatgpt' | 'qwen',
  fallbackProviders: string[],  // 备用模型列表（按顺序）
}
```

**响应**:
```typescript
{
  success: true,
  data: {
    defaultProvider: string,
    fallbackProviders: string[],
  }
}
```

---

#### 5.2.5 查看 API Key（需要二次验证）

```http
POST /api/admin/llm-configs/:provider/show-api-key
```

**请求**:
```typescript
{
  adminPassword: string,  // 管理员密码（二次验证）
}
```

**响应**:
```typescript
{
  success: true,
  data: {
    apiKey: string,  // 返回真实 API Key（仅此次，需要二次验证）
  }
}
```

**安全说明**:
- 此接口需要管理员密码二次验证
- 返回的 API Key 仅用于此次查看，不会在日志中记录
- 建议前端在显示后立即清除内存中的值

---

## 六、数据库设计

### 6.1 LLM API 配置表

```sql
CREATE TABLE llm_api_configs (
  id VARCHAR(36) PRIMARY KEY,
  provider ENUM('deepseek', 'chatgpt', 'qwen') NOT NULL UNIQUE,
  api_key_encrypted TEXT,  -- 加密后的 API Key（可为 NULL，表示未配置）
  base_url VARCHAR(500),
  model_name VARCHAR(100),
  enable_stream BOOLEAN DEFAULT TRUE,
  enable_thinking BOOLEAN DEFAULT FALSE,  -- DeepSeek 专用
  temperature DECIMAL(3,2) DEFAULT 0.7,
  max_tokens INT DEFAULT 4096,
  is_enabled BOOLEAN DEFAULT FALSE,
  is_default BOOLEAN DEFAULT FALSE,
  test_status ENUM('success', 'failed', 'not_tested') DEFAULT 'not_tested',
  test_message TEXT,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  INDEX idx_provider (provider),
  INDEX idx_is_enabled (is_enabled)
);
```

**说明**:
- `api_key_encrypted` 可为 NULL，表示未配置 API Key
- `hasApiKey` 字段通过判断 `api_key_encrypted IS NOT NULL` 得出
- `apiKeyMasked` 字段通过 `maskApiKey(decryptApiKey(api_key_encrypted))` 生成（仅用于显示）

### 6.2 模型选择策略表

```sql
CREATE TABLE llm_strategy (
  id VARCHAR(36) PRIMARY KEY,
  default_provider ENUM('deepseek', 'chatgpt', 'qwen') NOT NULL,
  fallback_providers JSON,  -- 备用模型列表，如 ["chatgpt", "qwen"]
  updated_at DATETIME NOT NULL
);
```

---

## 七、开发优先级

### P0（必须实现）
1. ✅ 用户列表查看
2. ✅ 用户详情查看
3. ✅ 通过 Admin 注册用户
4. ✅ 创建 Cursor 测试账号
5. ✅ 大模型 API 配置（三个模型）
6. ✅ API Key 加密存储

### P1（第一期实现）
1. 模型连接测试
2. 默认模型和备用模型配置
3. 查看 API Key（二次验证）

### P2（后续迭代）
1. 用户操作日志
2. 模型使用统计
3. API 调用监控

---

## 八、安全注意事项

1. **API Key 安全**
   - 必须加密存储（数据库中使用 `api_key_encrypted` 字段）
   - 不在日志中记录真实 API Key
   - 不在 API 响应中返回真实 API Key（使用 `hasApiKey` 和 `apiKeyMasked`）
   - 查看需要二次验证（通过单独的接口）
   - 前端显示时使用 `apiKeyMasked`（仅显示后 4 位）

2. **权限控制**
   - 只有超级管理员可以访问
   - 操作需要记录日志

3. **测试账号**
   - Cursor 测试账号仅在开发/测试环境使用
   - 生产环境可以禁用或限制

---

**文档版本**: v1.0  
**最后更新**: 2024年11月  
**维护者**: 开发团队

