# 数据库与 API 设计方案

> **版本**: v1.0  
> **创建日期**: 2024年11月  
> **状态**: 方案讨论阶段

---

## 一、数据库设计

### 1.1 核心数据表

#### 1.1.1 用户表（users）

**用途**: 存储用户基本信息

**字段设计**:
```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,              -- UUID
  phone VARCHAR(20) UNIQUE,                -- 手机号（国内版）
  email VARCHAR(255) UNIQUE,               -- 邮箱（海外版）
  password_hash VARCHAR(255),              -- 密码哈希（可选）
  app_region ENUM('CN', 'HK') NOT NULL,   -- 应用区域（决定语言和登录方式）
  nickname VARCHAR(50),                    -- 昵称
  avatar_url VARCHAR(500),                 -- 头像URL（预留）
  is_pro BOOLEAN DEFAULT FALSE,            -- 是否 Pro 用户
  pro_expires_at DATETIME,                 -- Pro 到期时间
  invite_code VARCHAR(20) UNIQUE,          -- 邀请码
  invited_by VARCHAR(36),                  -- 邀请人ID（外键 users.id）
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  last_login_at DATETIME,
  INDEX idx_phone (phone),
  INDEX idx_email (email),
  INDEX idx_invite_code (invite_code)
);
```

**关键点**:
- 手机号和邮箱互斥（根据 app_region 决定）
- 支持第三方登录（预留字段，后续扩展）
- 邀请码系统（用于邀请好友功能）

---

#### 1.1.2 验证码表（verification_codes）

**用途**: 存储验证码记录（登录/注册/密码重置）

**字段设计**:
```sql
CREATE TABLE verification_codes (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36),                     -- 用户ID（注册时可能为空）
  phone VARCHAR(20),                       -- 手机号
  email VARCHAR(255),                      -- 邮箱
  code VARCHAR(6) NOT NULL,                -- 验证码（6位）
  type ENUM('login', 'register', 'reset_password') NOT NULL,
  expires_at DATETIME NOT NULL,            -- 过期时间（10分钟）
  used BOOLEAN DEFAULT FALSE,              -- 是否已使用
  created_at DATETIME NOT NULL,
  INDEX idx_phone_code (phone, code),
  INDEX idx_email_code (email, code),
  INDEX idx_expires_at (expires_at)
);
```

**关键点**:
- 验证码有效期 10 分钟
- 需要限制发送频率（60秒/次，10次/天）→ 业务逻辑层控制
- 使用后标记，防止重复使用

---

#### 1.1.3 命盘档案表（chart_profiles）

**用途**: 存储命主档案信息（用户创建的命盘）

**字段设计**:
```sql
CREATE TABLE chart_profiles (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,            -- 用户ID（外键 users.id）
  name VARCHAR(50) NOT NULL,               -- 命主姓名/昵称
  relation_type ENUM('self', 'partner', 'parent', 'child', 'friend', 'other') NOT NULL,
  birthday DATE NOT NULL,                  -- 出生日期（公历）
  birth_time TIME,                         -- 出生时间（HH:mm:ss）
  time_accuracy ENUM('exact', 'approx', 'unknown'),  -- 时间精度
  location VARCHAR(100),                   -- 出生地城市
  timezone VARCHAR(50),                    -- 时区（如 'Asia/Shanghai'）
  use_true_solar_time BOOLEAN DEFAULT FALSE,  -- 是否使用真太阳时
  gender ENUM('male', 'female') NOT NULL,  -- 性别
  calendar_type ENUM('solar', 'lunar') DEFAULT 'solar',  -- 输入日历类型
  lunar_month INT,                         -- 农历月（如果 calendar_type = 'lunar'）
  lunar_day INT,                           -- 农历日
  is_leap_month BOOLEAN,                   -- 是否闰月
  bazi_chart_id VARCHAR(36),               -- 八字排盘结果ID（外键 bazi_charts.id）
  one_line_summary VARCHAR(200),           -- 一句话体质标签（可选）
  is_current BOOLEAN DEFAULT FALSE,        -- 是否为当前命主
  is_self BOOLEAN DEFAULT FALSE,           -- 是否为本人命盘
  notes TEXT,                              -- 备注（可选）
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  last_viewed_at DATETIME,                 -- 最后查看时间
  INDEX idx_user_id (user_id),
  INDEX idx_user_current (user_id, is_current),
  INDEX idx_created_at (created_at)
);
```

**关键点**:
- 一个用户可以有多个命盘档案
- `is_current` 标记当前命主（每个用户只有一个）
- `bazi_chart_id` 关联到排盘结果表（延迟计算，排盘时填充）

---

#### 1.1.4 八字排盘结果表（bazi_charts）

**用途**: 存储八字引擎计算的结果（JSON格式，包含 400+ 字段）

**字段设计**:
```sql
CREATE TABLE bazi_charts (
  id VARCHAR(36) PRIMARY KEY,
  chart_profile_id VARCHAR(36) UNIQUE NOT NULL,  -- 命盘档案ID（外键 chart_profiles.id，必填）
  birth_json JSON NOT NULL,                      -- 原始出生信息（JSON）
  result_json LONGTEXT NOT NULL,                 -- 排盘结果（JSON，包含所有 engine 计算的 400+ 字段）
  engine_version VARCHAR(10) NOT NULL,           -- 引擎版本（如 '6.0'）
  computed_at DATETIME NOT NULL,                 -- 计算时间
  needs_update BOOLEAN DEFAULT FALSE,            -- 是否需要更新（引擎升级时标记）
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  INDEX idx_chart_profile_id (chart_profile_id),
  INDEX idx_engine_version (engine_version),
  INDEX idx_needs_update (needs_update),
  INDEX idx_computed_at (computed_at)
);
```

**关键点**:
- `result_json` 使用 `LONGTEXT` 类型存储（MySQL 5.7.8+ 支持 JSON，但 LONGTEXT 更灵活）
- 包含 400+ 字段，涵盖所有 engine 计算的字段（参考 `八字引擎字段汇总文档.md`）
- `engine_version` 用于追踪计算时使用的引擎版本
- `needs_update` 标记引擎升级后需要重新计算的记录
- `chart_profile_id` 必填，与 `chart_profiles` 一对一关系（所有排盘都关联命盘档案）

**result_json 结构**（包含 400+ 字段）:
```json
{
  "pillars": {
    "year": { "stem": "甲", "branch": "子", "nayin": "...", "canggan": [...], ... },
    "month": { ... },
    "day": { ... },
    "hour": { ... }
  },
  "mingli": {
    "tenGods": { ... },
    "hiddenStems": { ... },
    "nayin": { ... },
    "stage12": { ... },
    "branchRelationships": { ... },
    "stemRelationships": { ... },
    "palaces": { ... }
  },
  "shensha": {
    "basic": { ... },
    "extended": { ... },
    "grouped": { ... },
    "kongwang": { ... },
    "liunian": { ... }
  },
  "analysis": {
    "dayMasterStrength": { ... },
    "wuXingDistribution": { ... },
    "favoredGods": { ... },
    "avoidGods": { ... },
    "structureJudgment": { ... },
    "purityLevel": { ... },
    "tiYongAnalysis": { ... },
    "doGongAnalysis": { ... },
    "palacesAnalysis": { ... },
    "timelineAnalysis": { ... },
    "poGeFactors": { ... }
  },
  "fortune": {
    "qiYun": { ... },
    "yunDirection": { ... },
    "luckCycle": { ... },
    "flowYears": { ... },
    "flowMonths": { ... }
  },
  "astronomy": { ... },
  "ganZhi": { ... },
  "lunar": { ... }
}
```

**存储策略**:
- ✅ **所有排盘结果都存储到数据库，并关联命盘档案**
- 所有排盘都会创建命盘档案（`chart_profiles`），排盘结果与命盘档案一一对应
- 排盘结果永久存储，不设置过期时间
- 使用 JSON 格式存储，便于查询和更新

---

#### 1.1.5 对话表（conversations）

**用途**: 存储对话会话（每次与小佩的对话）

**字段设计**:
```sql
CREATE TABLE conversations (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,            -- 用户ID（外键 users.id）
  chart_profile_id VARCHAR(36),            -- 命盘档案ID（外键 chart_profiles.id）
  topic ENUM('peach', 'marriage', 'career', 'wealth', 'family', 'rhythm', 'general'),  -- 话题
  source ENUM('xiaopei_topic_button', 'xiaopei_common_question', 'xiaopei_free_input', 'overview_card', 'shen_sha_popup', 'history'),  -- 入口来源
  first_question TEXT,                     -- 首轮问题
  title VARCHAR(200),                      -- 对话标题（自动生成或用户自定义）
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  last_message_at DATETIME,                -- 最后一条消息时间
  INDEX idx_user_id (user_id),
  INDEX idx_chart_profile_id (chart_profile_id),
  INDEX idx_user_updated (user_id, updated_at DESC),
  INDEX idx_last_message_at (last_message_at DESC)
);
```

**关键点**:
- 一个对话包含多条消息（messages 表）
- `last_message_at` 用于排序和筛选
- `title` 可以自动生成（基于首轮问题）或用户自定义

---

#### 1.1.6 消息表（messages）

**用途**: 存储对话中的每条消息

**字段设计**:
```sql
CREATE TABLE messages (
  id VARCHAR(36) PRIMARY KEY,
  conversation_id VARCHAR(36) NOT NULL,    -- 对话ID（外键 conversations.id）
  role ENUM('user', 'assistant') NOT NULL, -- 角色
  content TEXT NOT NULL,                   -- 消息内容
  follow_ups JSON,                         -- 追问建议（JSON数组，仅 assistant 消息）
  created_at DATETIME NOT NULL,
  INDEX idx_conversation_id (conversation_id),
  INDEX idx_conversation_created (conversation_id, created_at)
);
```

**关键点**:
- 支持追问建议存储（JSON格式）
- 按 `conversation_id` 和 `created_at` 排序获取对话历史

---

#### 1.1.7 解读归档表（readings）

**用途**: 存储用户保存的解读（从对话中提取）

**字段设计**:
```sql
CREATE TABLE readings (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,            -- 用户ID（外键 users.id）
  chart_profile_id VARCHAR(36),            -- 命盘档案ID（外键 chart_profiles.id）
  conversation_id VARCHAR(36),             -- 来源对话ID（外键 conversations.id）
  topic ENUM('peach', 'marriage', 'career', 'wealth', 'family', 'rhythm', 'general'),
  title VARCHAR(200) NOT NULL,             -- 解读标题
  content TEXT NOT NULL,                   -- 解读内容
  tags JSON,                               -- 标签（JSON数组）
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_chart_profile_id (chart_profile_id),
  INDEX idx_topic (topic),
  INDEX idx_user_created (user_id, created_at DESC)
);
```

**关键点**:
- 用户可以从对话中提取并保存解读
- 支持按话题筛选

---

#### 1.1.8 用户设置表（user_settings）

**用途**: 存储用户个性化设置

**字段设计**:
```sql
CREATE TABLE user_settings (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) UNIQUE NOT NULL,     -- 用户ID（外键 users.id）
  notification_enabled BOOLEAN DEFAULT TRUE,  -- 通知开关
  notification_sound BOOLEAN DEFAULT TRUE,    -- 通知声音
  language VARCHAR(10) DEFAULT 'zh-CN',       -- 语言（根据 app_region 自动设置）
  theme VARCHAR(10) DEFAULT 'light',          -- 主题（预留）
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);
```

---

#### 1.1.9 意见反馈表（feedbacks）

**用途**: 存储用户意见反馈

**字段设计**:
```sql
CREATE TABLE feedbacks (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36),                     -- 用户ID（可选，匿名反馈）
  type ENUM('bug', 'suggestion', 'other') NOT NULL,
  content TEXT NOT NULL,                   -- 反馈内容
  contact VARCHAR(100),                    -- 联系方式（可选）
  status ENUM('pending', 'processing', 'resolved') DEFAULT 'pending',
  created_at DATETIME NOT NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at DESC)
);
```

---

#### 1.1.10 限流记录表（rate_limits）

**用途**: 记录用户 API 调用次数（用于限流）

**字段设计**:
```sql
CREATE TABLE rate_limits (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,            -- 用户ID（外键 users.id）
  api_type VARCHAR(50) NOT NULL,           -- API 类型（如 'bazi_compute'）
  date DATE NOT NULL,                      -- 日期（YYYY-MM-DD）
  count INT DEFAULT 0,                     -- 调用次数
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  UNIQUE KEY uk_user_api_date (user_id, api_type, date),
  INDEX idx_date (date),
  INDEX idx_user_date (user_id, date)
);
```

**关键点**:
- 用于记录用户每日 API 调用次数
- 支持多种 API 类型的限流（`api_type`）
- 每日自动重置（通过日期字段区分）

---

### 1.2 数据关系图

```
users (用户)
  ├── chart_profiles (命盘档案) [1:N]
  │     └── bazi_charts (排盘结果) [1:1]  ← 所有排盘都关联命盘档案
  ├── conversations (对话) [1:N]
  │     └── messages (消息) [1:N]
  ├── readings (解读归档) [1:N]
  ├── user_settings (用户设置) [1:1]
  ├── feedbacks (意见反馈) [1:N]
  └── rate_limits (限流记录) [1:N]

verification_codes (验证码) [独立表]
```

**关系说明**:
- `chart_profiles` 与 `bazi_charts` 一对一关系（所有排盘都关联命盘档案）
- 不存在独立的临时排盘，所有排盘结果都永久存储

---

### 1.3 索引策略

**高频查询场景**:
1. 用户登录（phone/email）
2. 获取用户命盘列表（user_id）
3. 获取当前命主（user_id + is_current）
4. 获取对话列表（user_id + updated_at）
5. 获取对话消息（conversation_id + created_at）

**索引设计**:
- 所有外键字段建立索引
- 时间字段建立索引（用于排序和筛选）
- 唯一字段建立唯一索引

---

## 二、Engine API 封装

### 2.1 API 设计原则

1. **RESTful 风格**: 使用标准 HTTP 方法
2. **统一响应格式**: 所有 API 返回统一结构
3. **错误处理**: 明确的错误码和错误信息
4. **版本控制**: API 版本化（v1, v2...）
5. **性能优化**: 支持结果缓存

---

### 2.2 核心 API 接口

#### 2.2.1 排盘计算 API

**接口**: `POST /api/v1/bazi/compute`

**请求**:
```typescript
interface ComputeBaziRequest {
  // 出生信息（与 engine 输入格式一致）
  sex: 'male' | 'female';
  calendar_type: 'solar' | 'lunar';
  year: number;
  month: number;
  day: number;
  hour?: number;
  minute?: number;
  tz?: string;                    // 时区（如 'Asia/Shanghai'）
  use_tst?: boolean;              // 是否使用真太阳时
  hour_ref?: 'midnight' | 'noon'; // 时辰参考点
  place?: string;                 // 地点（用于真太阳时计算）
  isLeap?: boolean;               // 是否闰月（农历）
  
  // 命盘档案信息（如果未提供 chart_profile_id，系统会创建新档案）
  chart_profile_id?: string;      // 如果已存在命盘档案，传入ID
  name?: string;                  // 命主姓名/昵称（创建新档案时必填）
  relation_type?: 'self' | 'partner' | 'parent' | 'child' | 'friend' | 'other';  // 关系类型（创建新档案时必填）
  
  // 可选参数
  force_recompute?: boolean;      // 强制重新计算（忽略缓存）
}
```

**说明**:
- 如果提供了 `chart_profile_id`，使用已有的命盘档案
- 如果未提供 `chart_profile_id`，系统会先创建命盘档案（需要提供 `name` 和 `relation_type`），再使用新创建的档案ID进行排盘
- 所有排盘结果都会关联到命盘档案，不存在临时排盘

**响应**:
```typescript
interface ComputeBaziResponse {
  success: boolean;
  data: {
    chart_id: string;             // 排盘结果ID
    chart_profile_id: string;     // 命盘档案ID（新创建或已有的）
    result: BaziResult;           // 完整的排盘结果（JSON，包含 400+ 字段）
    engine_version: string;       // 引擎版本
    computed_at: string;          // 计算时间（ISO 8601）
    cached: boolean;              // 是否来自缓存
  };
  error?: {
    code: string;
    message: string;
  };
}
```

**BaziResult 结构**: 参考 `八字引擎字段汇总文档.md`，包含：
- `pillars`: 四柱信息
- `mingli`: 命理基础
- `shensha`: 神煞
- `analysis`: 分析结果
- `fortune`: 大运流年

**业务逻辑**:
1. **限流检查**: 检查用户是否超过每日限制（非付费用户 5 次/天）
2. **接收出生信息**: 验证输入参数
3. **创建或获取命盘档案**: 
   - 如果提供了 `chart_profile_id`，使用已有的命盘档案
   - 如果未提供，先创建命盘档案（`chart_profiles`），再使用新创建的 `chart_profile_id`
4. **检查缓存**: 如果 `force_recompute = false`，检查该命盘档案是否已有排盘结果
5. **调用 engine 计算**: 调用八字引擎计算（包含 400+ 字段）
6. **保存结果到数据库**: 
   - 保存排盘结果到 `bazi_charts` 表
   - 关联到命盘档案（`chart_profile_id` 必填）
   - 永久存储，不设置过期时间
7. **返回结果**: 返回完整的排盘结果

**限流逻辑**:
```typescript
// 伪代码
async function computeBazi(request: ComputeBaziRequest, userId: string): Promise<ComputeBaziResponse> {
  // 1. 检查限流
  const user = await getUser(userId);
  if (!user.is_pro) {
    const canProceed = await checkRateLimit(userId, 'bazi_compute');
    if (!canProceed) {
      return {
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: '今日排盘次数已达上限（5次），升级 Pro 可享受无限制排盘',
          limit: 5,
          remaining: 0,
          reset_at: getNextDayMidnight()
        }
      };
    }
  }
  
  // 2. 继续排盘逻辑...
}
```

---

#### 2.2.2 获取排盘结果 API

**接口**: `GET /api/v1/bazi/charts/:chart_id`

**响应**:
```typescript
interface GetBaziResponse {
  success: boolean;
  data: {
    chart_id: string;
    chart_profile_id: string;
    result: BaziResult;
    engine_version: string;
    computed_at: string;
  };
}
```

**用途**: 获取已保存的排盘结果（避免重复计算）

---

#### 2.2.3 神煞解读 API

**接口**: `GET /api/v1/bazi/shensha/:code`

**请求参数**:
- `code`: 神煞代码（如 `'tianyi'`, `'wenchang'`）
- `chart_id`: 命盘ID（可选，用于上下文）

**响应**:
```typescript
interface ShenShaResponse {
  success: boolean;
  data: {
    code: string;
    name: string;
    short_title: string;
    summary: string;
    bullet_points: string[];
    pillar_explanation: {
      pillar: string;  // 'year' | 'month' | 'day' | 'hour'
      text: string;
    }[];
    recommended_questions: string[];
  };
}
```

**用途**: 获取神煞的解读内容（用于神煞弹窗）

---

### 2.3 Engine 封装层设计

**目录结构**:
```
core/
├── engine/                    # 八字引擎（已有）
│   ├── index.js
│   └── ...
├── api/                       # API 封装层（新建）
│   ├── bazi/
│   │   ├── compute.js        # 排盘计算逻辑
│   │   ├── cache.js          # 缓存管理
│   │   └── validator.js      # 输入验证
│   └── shensha/
│       └── interpret.js      # 神煞解读
└── server/                    # 后端服务（新建）
    ├── routes/
    │   ├── bazi.js           # 排盘路由
    │   └── shensha.js        # 神煞路由
    ├── middleware/
    │   ├── auth.js           # 认证中间件
    │   └── error.js          # 错误处理
    └── app.js                # Express 应用
```

**封装层职责**:
1. **输入验证**: 验证出生信息的完整性和合法性
2. **缓存管理**: 相同输入复用计算结果
3. **错误处理**: 统一错误格式
4. **结果格式化**: 将 engine 结果转换为 API 响应格式

---

## 三、其他需要考虑的事项

### 3.1 数据缓存策略

**排盘结果缓存**:
- **缓存键**: 基于命盘档案ID（`chart_profile_id`）
- **缓存位置**: 
  - 数据库（bazi_charts 表）- 主要存储
  - 内存缓存（Redis，可选）- 热点数据缓存
- **缓存策略**:
  - 每个命盘档案对应一个排盘结果（一对一关系）
  - 如果命盘档案已有排盘结果，直接返回（除非 `force_recompute = true`）
  - 所有排盘结果永久存储
- **缓存失效**: 
  - 引擎版本升级时标记 `needs_update = TRUE`，后台任务重新计算
  - 用户手动强制重新计算（`force_recompute = true`）

**对话历史缓存**:
- 最近 10 条对话在内存中缓存
- 减少数据库查询

---

### 3.2 性能优化

**数据库优化**:
- 合理使用索引
- 分页查询（对话列表、消息列表）
- 读写分离（后续扩展）

**API 优化**:
- 排盘结果异步计算（如果计算时间长）
- 支持批量查询
- 压缩响应数据（gzip）

---

### 3.3 安全性

**数据安全**:
- 密码使用 bcrypt 哈希
- 敏感信息加密存储
- SQL 注入防护（使用参数化查询）

**API 安全**:
- JWT Token 认证
- 请求频率限制（防止暴力破解）
- CORS 配置
- HTTPS（生产环境）

---

### 3.4 数据迁移与备份

**数据迁移**:
- 使用数据库迁移工具（如 Knex.js, Sequelize Migrations）
- 版本化迁移脚本
- 回滚支持

**备份策略**:
- 定期自动备份（每日）
- 备份保留策略（30天）
- 备份验证

**引擎版本升级时的数据迁移**:
- 自动标记需要更新的记录（`needs_update = TRUE`）
- 后台任务批量重新计算（避免影响用户使用）
- 支持增量更新（按优先级：最近查看 > 创建时间）
- 更新完成后清除标记

---

### 3.5 监控与日志

**监控指标**:
- API 响应时间
- 数据库查询性能
- 错误率
- 用户活跃度

**日志记录**:
- API 请求日志
- 错误日志
- 排盘计算日志（用于调试）

---

### 3.6 扩展性考虑

**水平扩展**:
- 无状态 API 服务（支持多实例）
- 数据库读写分离
- 缓存层（Redis）独立部署

**功能扩展**:
- 预留字段（如第三方登录）
- 插件化架构（引擎模块化）
- 版本兼容性（API 版本化）

### 3.7 定期清理任务

**验证码清理**:
- 定期清理过期的验证码记录（`expires_at < NOW()`）
- 清理已使用的验证码（`used = TRUE`，保留 7 天用于审计）

**限流记录清理**:
- 定期清理过期的限流记录（`date < DATE_SUB(NOW(), INTERVAL 7 DAY)`）
- 保留最近 7 天的记录用于统计

**注意**: 排盘结果不设置过期时间，所有排盘结果永久存储（因为都关联命盘档案）

---

## 四、开发优先级

### P0（必须实现）
1. ✅ 用户表（users）
2. ✅ 验证码表（verification_codes）
3. ✅ 命盘档案表（chart_profiles）
4. ✅ 八字排盘结果表（bazi_charts）- 支持 400+ 字段存储
5. ✅ 对话表（conversations）
6. ✅ 消息表（messages）
7. ✅ 限流记录表（rate_limits）
8. ✅ 排盘计算 API（含限流逻辑）
9. ✅ 获取排盘结果 API

### P1（第一期实现）
1. ✅ 解读归档表（readings）
2. ✅ 用户设置表（user_settings）
3. ✅ 神煞解读 API
4. ✅ 对话历史查询 API
5. ✅ 引擎版本升级机制（自动标记和更新）

### P2（后续迭代）
1. 意见反馈表（feedbacks）
2. 缓存层（Redis）
3. 性能监控
4. 数据备份自动化
5. 引擎升级后台任务（批量重新计算）

---

## 五、已确认策略

### 5.1 排盘结果存储策略 ✅

**策略**: 所有排盘结果都存储到数据库，并关联命盘档案

**实现**:
- 所有排盘都会创建命盘档案（`chart_profiles`）
- 排盘结果与命盘档案一一对应（`chart_profile_id` 必填）
- 所有排盘结果永久存储，不设置过期时间

**表结构说明**:
- `bazi_charts.chart_profile_id` 必填（NOT NULL），确保所有排盘都关联命盘档案
- 不存在临时排盘，所有排盘结果都永久存储

---

### 5.2 引擎版本升级策略 ✅

**策略**: 引擎升级时，历史排盘自动更新

**实现机制**:
1. **版本追踪**: `bazi_charts.engine_version` 记录计算时使用的引擎版本
2. **标记需要更新**: 引擎升级时，将所有 `engine_version < 新版本` 的记录标记为 `needs_update = TRUE`
3. **后台任务**: 定时任务或手动触发，批量重新计算标记的记录
4. **增量更新**: 支持按优先级更新（如先更新最近查看的命盘）

**升级流程**:
```sql
-- 1. 标记需要更新的记录
UPDATE bazi_charts 
SET needs_update = TRUE 
WHERE engine_version < '新版本号';

-- 2. 后台任务批量重新计算
-- 3. 更新后清除标记
UPDATE bazi_charts 
SET needs_update = FALSE, 
    engine_version = '新版本号',
    updated_at = NOW()
WHERE id = '...';
```

**注意事项**:
- 引擎升级时，已有字段基本不会变（向后兼容）
- 新字段会在重新计算时自动填充
- 更新过程不影响用户正常使用（异步更新）

---

### 5.3 对话历史保留策略 ✅

**策略**: 对话历史永久保留

**实现**:
- `conversations` 和 `messages` 表的数据永久保留
- 不设置自动删除机制
- 用户可手动删除对话（软删除或硬删除，根据需求决定）

---

### 5.4 用户删除账号策略 ✅

**策略**: 提示用户删除就都没了，不支持导出

**实现**:
1. **删除前提示**: 
   - 明确告知用户删除账号将永久删除所有数据
   - 包括：命盘档案、排盘结果、对话历史、解读归档等
   - 不支持数据导出功能

2. **删除操作**:
   - 硬删除：直接删除用户及其所有关联数据
   - 或软删除：标记 `deleted_at`，定期物理删除（根据需求决定）

3. **删除范围**:
   ```sql
   -- 删除用户时，级联删除或手动删除：
   - users (用户)
   - chart_profiles (命盘档案)
   - bazi_charts (排盘结果)
   - conversations (对话)
   - messages (消息)
   - readings (解读归档)
   - user_settings (用户设置)
   - feedbacks (意见反馈，可选保留匿名数据)
   ```

---

### 5.5 API 限流策略 ✅

**策略**: 非付费用户一天 5 次排盘计算

**实现**:
1. **限流规则**:
   - 非付费用户（`users.is_pro = FALSE`）: 每天 5 次
   - Pro 用户（`users.is_pro = TRUE`）: 无限制或更高限制（如每天 100 次）

2. **限流实现**:
   - 使用 Redis 或数据库记录用户每日调用次数
   - 限流键: `rate_limit:bazi_compute:{user_id}:{date}`
   - 每次调用时检查并递增计数

3. **限流表设计**:
   ```sql
   CREATE TABLE rate_limits (
     id VARCHAR(36) PRIMARY KEY,
     user_id VARCHAR(36) NOT NULL,
     api_type VARCHAR(50) NOT NULL,        -- 'bazi_compute'
     date DATE NOT NULL,                   -- 日期（YYYY-MM-DD）
     count INT DEFAULT 0,                  -- 调用次数
     created_at DATETIME NOT NULL,
     updated_at DATETIME NOT NULL,
     UNIQUE KEY uk_user_api_date (user_id, api_type, date),
     INDEX idx_date (date)
   );
   ```

4. **限流逻辑**:
   ```typescript
   // 伪代码
   async function checkRateLimit(userId: string, isPro: boolean): Promise<boolean> {
     if (isPro) {
       return true; // Pro 用户无限制
     }
     
     const today = new Date().toISOString().split('T')[0];
     const limit = await getRateLimit(userId, 'bazi_compute', today);
     
     if (limit.count >= 5) {
       return false; // 超过限制
     }
     
     await incrementRateLimit(userId, 'bazi_compute', today);
     return true;
   }
   ```

5. **错误响应**:
   ```typescript
   {
     success: false,
     error: {
       code: 'RATE_LIMIT_EXCEEDED',
       message: '今日排盘次数已达上限（5次），升级 Pro 可享受无限制排盘',
       limit: 5,
       remaining: 0,
       reset_at: '2024-11-19T00:00:00Z'  // 重置时间（次日 0 点）
     }
   }
   ```

6. **其他 API 限流**:
   - 验证码发送: 60秒/次，10次/天（已在业务逻辑中实现）
   - 聊天 API: 可设置每分钟请求数限制（防止滥用）
   - 神煞解读 API: 可设置每分钟请求数限制

---

## 六、下一步行动

1. ✅ **确认数据库表结构**: 已确认所有表设计
2. **设计 API 详细规范**: 完善请求/响应格式
3. **实现数据库迁移脚本**: 创建初始表结构（包含所有 10 张表）
4. **实现 Engine 封装层**: 封装排盘计算 API（支持 400+ 字段）
5. **实现限流逻辑**: 非付费用户每天 5 次限制
6. **实现引擎版本升级机制**: 自动标记和批量更新
7. **实现定期清理任务**: 临时排盘、验证码、限流记录清理
8. **编写 API 文档**: 使用 Swagger/OpenAPI

---

## 七、已确认策略总结

| 策略项 | 确认方案 |
|--------|---------|
| **排盘结果存储** | ✅ 所有排盘结果都存储到数据库，并关联命盘档案（永久存储） |
| **引擎版本升级** | ✅ 历史排盘自动更新（标记 + 后台任务批量重新计算） |
| **对话历史保留** | ✅ 永久保留 |
| **用户删除账号** | ✅ 提示用户删除就都没了，不支持导出 |
| **API 限流** | ✅ 非付费用户每天 5 次排盘计算 |

---

**文档版本**: v1.3  
**最后更新**: 2024年11月  
**更新内容**:
- v1.0: 初始版本
- v1.1: 根据反馈更新
  - 更新排盘结果表结构（支持 400+ 字段，LONGTEXT 存储）
  - 确认排盘结果存储策略（所有结果存储，临时排盘 7 天过期）
  - 确认引擎版本升级策略（历史排盘自动更新）
  - 确认对话历史保留策略（永久保留）
  - 确认用户删除账号策略（不支持导出）
  - 添加限流策略（非付费用户每天 5 次）
  - 添加限流记录表
  - 添加定期清理任务说明
- v1.2: 简化存储策略
  - 确认所有排盘都会保存为命盘档案
  - 移除临时排盘相关设计（`expires_at` 字段、临时排盘清理任务）
  - `chart_profile_id` 改为必填（NOT NULL）
  - 简化排盘计算 API 业务逻辑（先创建命盘档案，再排盘）
  - 更新缓存策略（基于命盘档案ID）
- v1.3: 统一 API 响应格式和模型配置
  - 统一所有 API 响应格式（包含 `success` 字段）
  - 明确模型支持：仅支持三个模型（DeepSeek、ChatGPT、Qwen）
  - 统一 API 路径使用 `/api/v1/...` 前缀
  - 统一参数命名使用 `chartId`（不是 `id` 或 `mingpanId`）
**维护者**: 开发团队

