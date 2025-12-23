# API 接口统一规范

> **版本**: v1.0  
> **创建日期**: 2024年11月  
> **状态**: 开发规范

---

## 一、API 路径规范

### 1.1 路径前缀

**统一使用**: `/api/v1/...`

**示例**:
- ✅ `POST /api/v1/bazi/chart`
- ✅ `GET /api/v1/bazi/charts/:chartId`
- ❌ `POST /api/baZi/calc`
- ❌ `GET /api/mingpan/:id`

---

### 1.2 路径命名规范

**规则**:
- 路径使用 `snake_case`（如 `bazi`、`chat`）
- 路径参数使用 `camelCase`（如 `chartId`、`conversationId`）

**示例**:
- ✅ `/api/v1/bazi/charts/:chartId`
- ✅ `/api/v1/chat/conversations/:conversationId`
- ❌ `/api/v1/bazi/charts/:id`
- ❌ `/api/v1/bazi/charts/:chart_id`

---

## 二、统一响应格式

### 2.1 成功响应

```typescript
interface SuccessResponse<T> {
  success: true;
  data: T;
}
```

**示例**:
```json
{
  "success": true,
  "data": {
    "chartId": "chart_123",
    "name": "自己",
    "birth": { ... }
  }
}
```

---

### 2.2 错误响应

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;        // 错误码（如 'RATE_LIMIT_EXCEEDED'）
    message: string;     // 错误信息（用户友好）
    details?: any;       // 错误详情（可选，用于调试）
  };
}
```

**示例**:
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "今日排盘次数已达上限（5次），升级 Pro 可享受无限制排盘",
    "details": {
      "limit": 5,
      "remaining": 0,
      "reset_at": "2024-11-19T00:00:00Z"
    }
  }
}
```

---

## 三、核心 API 路径列表（共 38 个）

> **更新时间**: 2024-11-18  
> **完成度**: 100%（所有 API 已实现）

---

### 3.1 认证模块（5 个）

```typescript
POST /api/v1/auth/request-otp           // 请求验证码
POST /api/v1/auth/login_or_register     // 登录或注册
GET  /api/v1/auth/me                    // 获取当前用户
POST /api/v1/auth/logout                // 登出
POST /api/v1/auth/refresh               // 刷新 Token
```

---

### 3.2 命盘模块（6 个）

```typescript
POST   /api/v1/bazi/chart                        // 创建命盘（排盘）
GET    /api/v1/bazi/charts                       // 获取命盘列表
GET    /api/v1/bazi/charts/:chartId              // 获取命盘详情
PUT    /api/v1/bazi/charts/:chartId              // 更新命盘档案
DELETE /api/v1/bazi/charts/:chartId              // 删除命盘
POST   /api/v1/bazi/charts/:chartId/set-default  // 设置默认命盘
```

---

### 3.3 解读模块（4 个）

```typescript
POST /api/v1/reading/shensha      // 神煞解读
POST /api/v1/reading/overview     // 命盘总览解读
POST /api/v1/reading/chat         // 通用解读（聊天）
POST /api/v1/reading/follow-ups   // 生成追问建议
```

---

### 3.4 对话模块（5 个）

```typescript
GET    /api/v1/chat/conversations                            // 获取对话列表
GET    /api/v1/chat/conversations/:conversationId            // 获取对话详情（消息列表）
POST   /api/v1/chat/conversations/:conversationId/messages   // 发送消息（SSE 流式）
DELETE /api/v1/chat/conversations/:conversationId            // 删除对话
GET    /api/v1/chat/conversations/filters/masters            // 获取命主列表（用于筛选）
```

**重要说明**:
- `POST /messages` 使用 **SSE 流式响应**（Server-Sent Events）
- `conversationId` 可为 `"new"` 表示创建新对话

---

### 3.5 Pro 订阅模块（4 个）

```typescript
GET  /api/v1/pro/status          // 获取 Pro 状态
POST /api/v1/pro/subscribe       // 订阅 Pro（模拟）
GET  /api/v1/pro/subscriptions   // 获取订阅历史
GET  /api/v1/pro/features        // Pro 专属功能（示例）
```

---

### 3.6 Admin 认证模块（2 个）

```typescript
POST /api/admin/v1/auth/login    // Admin 登录
GET  /api/admin/v1/auth/me       // 获取当前 Admin 信息
```

---

### 3.7 Admin 用户管理模块（5 个）

```typescript
GET  /api/admin/v1/users                        // 获取 C 端用户列表
GET  /api/admin/v1/users/:userId                // 获取用户详情
POST /api/admin/v1/users/test                   // 创建测试用户
GET  /api/admin/v1/users/cursor/test-account   // 获取或创建 Cursor 测试账号
POST /api/admin/v1/users/cursor/reset-password // 重置 Cursor 密码（仅 Super Admin）
```

---

### 3.8 Admin LLM 配置模块（5 个）

```typescript
GET  /api/admin/v1/llm-config                    // 获取所有 LLM 配置
GET  /api/admin/v1/llm-config/:provider          // 获取单个 LLM 配置
PUT  /api/admin/v1/llm-config/:provider          // 更新 LLM 配置
POST /api/admin/v1/llm-config/:provider/set-default  // 设置默认 LLM
POST /api/admin/v1/llm-config/:provider/test     // 测试 LLM 连接
```

**支持的 Provider**: `deepseek`, `chatgpt`, `qwen`

---

### 3.9 Admin Pro 管理模块（2 个）

```typescript
GET  /api/admin/v1/pro/users           // 获取所有 Pro 用户列表
POST /api/admin/v1/pro/users/:userId   // 手动设置用户 Pro 状态
GET  /api/admin/v1/pro/users/:userId   // 获取用户 Pro 详情
```

---

### 3.10 Admin 系统配置模块（5 个）

```typescript
GET  /api/admin/v1/system/settings                    // 获取所有系统配置
GET  /api/admin/v1/system/settings/:key               // 获取单个系统配置
PUT  /api/admin/v1/system/settings/rate-limit         // 更新限流开关
PUT  /api/admin/v1/system/settings/pro-features       // 更新 Pro 功能门禁
PUT  /api/admin/v1/system/settings/rate-limit-config  // 更新限流次数配置
```

**功能说明**:
- 限流开关：动态开启/关闭排盘和对话限流
- Pro 功能门禁：控制哪些功能需要 Pro 权限
- 限流次数：可动态调整每日限流次数

---

## 四、参数命名规范

### 4.1 路径参数

**统一使用 `camelCase`**:
- ✅ `chartId`（不是 `id` 或 `mingpanId`）
- ✅ `conversationId`（不是 `id` 或 `sessionId`）
- ✅ `userId`（不是 `id` 或 `user_id`）

---

### 4.2 请求体参数

**前端**: 使用 `camelCase`
**后端**: 接收后转换为 `snake_case`（数据库字段）

**示例**:
```typescript
// 前端请求
{
  chartId: "chart_123",
  chartProfileId: "profile_456"
}

// 后端处理（转换为 snake_case）
{
  chart_id: "chart_123",
  chart_profile_id: "profile_456"
}
```

---

### 4.3 响应体参数

**后端**: 返回 `snake_case`（数据库字段）
**前端**: 接收后转换为 `camelCase`

**示例**:
```typescript
// 后端响应
{
  chart_id: "chart_123",
  chart_profile_id: "profile_456"
}

// 前端处理（转换为 camelCase）
{
  chartId: "chart_123",
  chartProfileId: "profile_456"
}
```

---

## 五、模型配置规范

### 5.1 支持的模型（仅三个）

1. **DeepSeek**
   - 支持流式响应
   - 支持思考模式（thinking）切换
   - 配置项：`enableStream`、`enableThinking`

2. **ChatGPT**
   - 支持流式响应
   - 配置项：`enableStream`

3. **Qwen**
   - 支持流式响应
   - 配置项：`enableStream`

**重要说明**:
- ✅ 当前版本仅支持以上三个模型
- ✅ 没有其他模型，如有需要再另外增加（先不开发）
- ✅ 所有模型配置通过 Admin 后台管理

---

### 5.2 模型路由策略

**默认策略**:
- 国内（CN）：DeepSeek
- 香港/海外（HK）：ChatGPT

**可配置项**（通过 Admin 后台）:
- 默认模型选择
- 备用模型列表
- 模型启用/禁用开关

---

## 六、错误码规范

### 6.1 错误码格式

**使用大写字母和下划线**:
- ✅ `RATE_LIMIT_EXCEEDED`
- ✅ `INVALID_PARAMETER`
- ✅ `UNAUTHORIZED`
- ❌ `rateLimitExceeded`
- ❌ `invalid-parameter`

---

### 6.2 常见错误码

```typescript
// 认证相关
UNAUTHORIZED              // 未授权
TOKEN_EXPIRED            // Token 过期
INVALID_TOKEN            // Token 无效

// 参数相关
INVALID_PARAMETER        // 参数无效
MISSING_REQUIRED_FIELD   // 缺少必填字段

// 业务相关
RATE_LIMIT_EXCEEDED      // 限流超限
CHART_NOT_FOUND          // 命盘不存在
PRO_REQUIRED             // 需要 Pro 权限

// 系统相关
INTERNAL_ERROR           // 服务器错误
SERVICE_UNAVAILABLE      // 服务不可用
```

---

## 七、开发注意事项

### 7.1 前端开发

1. **统一使用 `apiService`**: 所有 API 调用通过统一的 service
2. **统一错误处理**: 检查 `response.success` 判断成功/失败
3. **参数转换**: 请求时转换为 `camelCase`，响应时转换为 `camelCase`
4. **Token 管理**: 所有请求自动携带 JWT Token

---

### 7.2 后端开发

1. **统一响应格式**: 所有接口返回统一格式（包含 `success` 字段）
2. **参数转换**: 接收 `camelCase`，转换为 `snake_case` 存储
3. **错误处理**: 统一错误响应格式
4. **权限校验**: 所有业务 API 必须进行权限校验

---

## 八、示例代码

### 8.1 前端 API 调用示例

```typescript
// src/services/api/chartService.ts
import { apiClient } from './client';

export const chartService = {
  // 创建命盘
  async createChart(data: CreateChartRequest): Promise<CreateChartResponse> {
    const response = await apiClient.post<CreateChartResponse>(
      '/api/v1/bazi/chart',
      data
    );
    
    if (!response.success) {
      throw new Error(response.error.message);
    }
    
    return response.data;
  },
  
  // 获取命盘详情
  async getChartDetail(chartId: string): Promise<ChartDetail> {
    const response = await apiClient.get<ChartDetail>(
      `/api/v1/bazi/charts/${chartId}`
    );
    
    if (!response.success) {
      throw new Error(response.error.message);
    }
    
    return response.data;
  },
};
```

---

### 8.2 后端 API 实现示例

```typescript
// core/src/routes/bazi.ts
app.post('/api/v1/bazi/chart', authenticate, async (req, res) => {
  try {
    const result = await baziService.compute(req.body);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: {
        code: error.code || 'INTERNAL_ERROR',
        message: error.message,
        details: error.details,
      },
    });
  }
});
```

---

---

## 九、API 统计

### 总览
- **总计**: 43 个 API
- **C 端 API**: 24 个
- **Admin API**: 19 个
- **SSE 流式**: 1 个（对话消息）

### 按模块统计
| 模块 | API 数量 | 说明 |
|------|---------|------|
| 认证模块 | 5 | 登录、注册、验证码 |
| 命盘模块 | 6 | 排盘、查询、管理 |
| 解读模块 | 4 | 神煞、总览、聊天、追问 |
| 对话模块 | 5 | 消息、历史、筛选 |
| Pro 订阅 | 4 | 状态、订阅、历史 |
| Admin 认证 | 2 | 登录、获取信息 |
| Admin 用户 | 5 | 用户管理、测试账号 |
| Admin LLM | 5 | 配置管理、测试 |
| Admin Pro | 2 | Pro 用户管理 |
| Admin 系统 | 5 | 限流、Pro 功能配置 |

---

**文档版本**: v2.1（新增系统配置模块，共 43 个 API）  
**最后更新**: 2024年11月18日  
**维护者**: 开发团队

