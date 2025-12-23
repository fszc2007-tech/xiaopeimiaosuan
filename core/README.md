# Core 后端服务

小佩命理的后端核心服务，负责八字排盘、命盘解读、会员与计费、LLM 调用等所有核心业务。

---

## 📚 推荐先阅读

在开始开发前，强烈建议先阅读以下关键设计文档：

- **会员与 AI 次数限制方案**：`../会员订阅与AI解读次数限制-优化方案.md`
- **数据库设计**：`core.doc/数据库与API设计方案.md`
- **安全规范**：`app.doc/security/后端开发安全规范.md`
- **API 规范**：`app.doc/API接口统一规范.md`

---

## 🛠 技术栈

- **Node.js**: 运行时环境（推荐 >= 20.x）
- **Express**: Web 框架
- **TypeScript**: 类型安全
- **MySQL**: 数据存储
- **JWT**: 身份认证

> **⚠️ Node 版本要求**：推荐使用 Node.js >= 20.x，请使用 nvm 或类似工具锁定版本，避免在 18/20 之间切换出现兼容性问题。

---

## 📁 目录结构

```
core/
├── src/
│   ├── modules/          # 业务模块
│   │   ├── auth/         # 鉴权模块（JWT、OTP）
│   │   ├── user/         # 用户模块
│   │   ├── bazi/         # 命盘模块（调用 engine）
│   │   ├── reading/      # 解读模块
│   │   ├── prompt/       # Prompt 模板管理
│   │   ├── pro/          # Pro 会员管理（订阅、会员状态）
│   │   ├── ai/           # AI 服务（LLM 调用、aiQuota）
│   │   ├── admin/        # Admin 后台管理
│   │   └── feedback/     # 用户反馈
│   ├── routes/           # API 路由
│   ├── middleware/       # 中间件
│   ├── database/         # 数据库相关
│   │   └── migrations/   # 数据库迁移脚本
│   ├── utils/            # 工具函数
│   ├── types/            # TypeScript 类型
│   └── server.ts         # 服务器入口
├── engine/               # 八字引擎（算法）
├── system_prompt/        # 系统 Prompt（小佩人设）
├── config/               # 配置文件
└── package.json
```

> **关键模块说明**：
> - `modules/pro/`：会员订阅管理（`is_pro`、`pro_plan`、`pro_expires_at`）
> - `modules/ai/aiQuotaService.ts`：AI 解读次数限制（每日 10/5/100 次）
> - `modules/admin/`：Admin 后台专用服务（用户管理、LLM 配置等）

---

## ✅ 核心职责

### 负责

- 所有业务逻辑处理
- 八字引擎调用（`engine/`）
- Prompt 模板管理和拼接
- LLM 服务调用（DeepSeek、ChatGPT、Qwen）
- **会员状态与 AI 解读次数限制**（见 `modules/pro/` & `modules/ai/aiQuotaService.ts`）
- 用户鉴权和权限控制
- 数据存储和管理（MySQL）
- API 接口实现
- 计费判断和限流

### 不负责

- UI 渲染（由 `app/` 负责）
- 前端状态管理（由 `app/` 负责）

---

## 📐 开发规范

### API 规范

所有 API 接口遵循统一规范：

- **路径前缀**：`/api/v1/`（除少数基础接口如 `GET /health` 外）
- **路径参数**：使用具体名称（如 `chartId`，而不是 `id`）
- **响应格式**：统一使用以下格式

**成功响应**：
```json
{
  "success": true,
  "data": {
    // 业务数据
  }
}
```

**错误响应**：
```json
{
  "success": false,
  "error": {
    "code": "AI_DAILY_LIMIT_REACHED",
    "message": "今日解读次数已用完",
    "details": {
      "limit": 5,
      "used": 5,
      "remaining": 0
    }
  }
}
```

> **常见错误码**：
> - `AI_DAILY_LIMIT_REACHED`：AI 次数用尽
> - `UNAUTHORIZED`：未授权
> - `USER_NOT_FOUND`：用户不存在
> - `INVALID_TOKEN`：Token 无效
> 
> 完整错误码列表请参考：`app.doc/API接口统一规范.md`

详细规范请参考：`app.doc/API接口统一规范.md`

---

### 安全规范

- ✅ Prompt 模板不对外暴露
- ✅ API Key 加密存储（数据库中）
- ✅ 敏感信息加密传输
- ✅ 所有业务逻辑在后端实现

详细规范请参考：`app.doc/security/后端开发安全规范.md`

---

## 🚀 开发命令

```bash
# 安装依赖
npm install

# 开发模式（热重载）
npm run dev

# 构建
npm run build

# 生产模式
npm start

# 类型检查
npm run type-check

# 代码风格检查（TODO：待配置）
# npm run lint

# 单元测试（TODO：待补充）
# npm test
```

---

## ⚙️ 环境配置

复制 `.env.example` 为 `.env`，并填写相应配置：

```bash
cp .env.example .env
```

### 关键环境变量

#### 基础配置
- `XIAOPEI_CORE_PORT`: 服务端口（默认 3000）
- `NODE_ENV`: 环境标识（`development` / `staging` / `production`）

#### 数据库配置
- `XIAOPEI_MYSQL_HOST`: MySQL 主机地址
- `XIAOPEI_MYSQL_PORT`: MySQL 端口（默认 3306）
- `XIAOPEI_MYSQL_USER`: MySQL 用户名
- `XIAOPEI_MYSQL_PASSWORD`: MySQL 密码
- `XIAOPEI_MYSQL_DATABASE`: 数据库名（默认 xiaopei）

#### 安全配置
- `XIAOPEI_JWT_SECRET`: JWT 密钥（**生产环境必须配置，至少 32 字符**）
- `XIAOPEI_ENCRYPTION_KEY`: 加密密钥（用于加密 API Key，32 字节）

#### LLM 配置
- `XIAOPEI_DEEPSEEK_API_KEY`: DeepSeek API Key
- `XIAOPEI_CHATGPT_API_KEY`: ChatGPT API Key
- `XIAOPEI_QWEN_API_KEY`: Qwen API Key

> **⚠️ LLM API Key 说明**：
> - **当前版本**：直接从环境变量读取 LLM 的 API Key
> - **未来版本**：接入 Admin 后台后，会改为从数据库读取加密存储的 Key，优先级：数据库 > 环境变量

#### CORS 配置
- `ALLOWED_ORIGINS`: 允许的跨域源（逗号分隔，如 `http://localhost:19006,http://localhost:5173`）

---

## 🗄️ 数据库初始化

参考 `core.doc/数据库与API设计方案.md` 中的数据库设计和初始化脚本。

**Migration 脚本位置**：`src/database/migrations/`

执行顺序：
1. `001_create_tables.sql` - 基础表结构
2. `002_phase4_tables.sql` - Phase 4 表结构
3. `003_system_settings.sql` - 系统设置
4. `011_add_ai_quota_fields.sql` - AI 次数限制字段
5. `012_admin_membership_audit.sql` - Admin 会员管理审计日志（如已实施）

---

## 📖 API 文档

### 健康检查

```
GET /health
```

> **注意**：`/health` 是少数**不使用** `/api/v1/` 前缀的基础接口。

响应：
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2024-11-18T14:00:00.000Z",
    "version": "1.0.0"
  }
}
```

更多 API 文档请参考：`app.doc/API接口统一规范.md`

---

## 📄 参考文档

### 架构与设计
- **架构设计**: `app.doc/security/Core架构与安全策略方案.md`
- **数据库设计**: `core.doc/数据库与API设计方案.md`
- **会员与 AI 次数限制**: `../会员订阅与AI解读次数限制-优化方案.md`

### 规范
- **安全规范**: `app.doc/security/后端开发安全规范.md`
- **API 规范**: `app.doc/API接口统一规范.md`

---

## ⚠️ 注意事项

### 开发规范
1. **所有业务逻辑都在后端实现**
2. **Prompt 模板不对外暴露**
3. **API Key 加密存储**
4. **所有 API 返回统一格式**
5. **遵循安全规范和 API 规范**

### 安全硬性要求

#### 🔴 生产环境 JWT Secret
- **生产环境必须配置 `XIAOPEI_JWT_SECRET`**
- 密钥长度至少 32 字符（推荐 64 字符）
- **缺失时服务应直接启动失败**
- 禁止使用默认值或空值

#### 🔴 测试后门保护
- 所有仅供测试使用的后门（如固定 SMS 验证码、测试账号自动登录等）
- **必须通过 `NODE_ENV !== 'production'` 严格保护**
- **禁止出现在生产环境**
- 违反此规则视为严重安全漏洞

#### 🔴 敏感信息加密
- 数据库中的 API Key 必须加密存储（使用 `XIAOPEI_ENCRYPTION_KEY`）
- 禁止在日志中记录真实 API Key
- Admin API 返回时仅显示掩码（如 `************abcd`）

---

## 🏗️ 架构原则

### 前后端职责分离
- **Core**：所有业务逻辑、算法计算、Prompt 管理、LLM 调用
- **App**：UI 渲染、用户交互、状态管理
- **Admin**：后台管理 UI、配置管理界面

### 安全第一
- 不在前端硬编码核心算法
- 不对外暴露 Prompt 模板
- 所有敏感操作在后端验证和执行

### 可扩展性
- 模块化设计，便于后续添加新功能
- 数据库设计预留扩展空间
- API 设计考虑向后兼容

---

## 🤝 协作规范

1. **修改前先看文档**：查看对应功能的设计文档
2. **遵循现有规范**：API 格式、命名规范、错误码等
3. **更新文档**：代码改动后同步更新相关文档
4. **代码审查**：所有改动需经过 Code Review
5. **测试先行**：新功能必须有对应的测试用例

---

更多信息请参考项目文档。

**最后更新**：2025-01-10
