# Admin LLM 计费统计实施方案

**日期**: 2025-01-XX  
**目标**: 在 Admin 后台新增「LLM 计费统计」功能，统计 Token 消耗量、趋势和费用预估

---

## 一、整体目标

在 Admin 后台新增「**LLM 计费统计**」页面，实现：

1. **看得见**：每日/每月 Token 消耗量（输入/输出/总计）、费用统计
2. **看趋势**：折线图展示 Token 消耗趋势、费用趋势，支持时间范围和模型筛选
3. **能预估**：基于本月已有数据预估整月费用（无历史数据时从有数据那天开始滚动估算）

---

## 二、数据采集与计价逻辑

### 1. 类型定义与枚举

**统一枚举定义**（`core/src/modules/billing/types.ts`）：
```typescript
export enum LLMProvider {
  DeepSeek = 'deepseek',
  OpenAI = 'openai',   // 比 'chatgpt' 更通用，将来可能不止 ChatGPT
  Qwen = 'qwen',
}

export enum LLMSource {
  App = 'app',
  Admin = 'admin',
  Script = 'script',
}
```

**为什么要用枚举**：
- 避免字符串 typo（如 `'deepseek'` vs `'deepseek'`）
- 未来扩展时更清晰（如 OpenAI 可能支持 `gpt-4.1-mini`、`o3` 等）
- TypeScript 类型检查更严格

### 2. 数据采集点

**关键发现**：
- 现有系统使用 `chatStreamWithQuota()` 和 `chat()` 调用 LLM
- DeepSeek 流式响应中，usage 信息在最后一个 chunk（`[DONE]` 之前）
- 需要在 `aiService.ts` 层统一记录 usage 日志

**采集时机**：
- 在 `aiService.chatStream()` 和 `aiService.chat()` 中，当获取到 usage 信息后立即记录
- 流式响应：在最后一个包含 `usage` 的 chunk 中记录
- 非流式响应：在 `LLMResponse.usage` 中记录

**需要记录的数据**：
- `provider`: `LLMProvider` 枚举值（从 `model` 映射：`deepseek` → `LLMProvider.DeepSeek`）
- `model`: 实际模型名称（如 `deepseek-chat`, `deepseek-reasoner`）
- `is_thinking_mode`: 布尔（DeepSeek 专用，从 `config.thinkingMode` 获取）
- `cache_hit`: 布尔（DeepSeek 支持，从 `usage.prompt_tokens_details.cached_tokens > 0` 判断）
- `user_id`: `VARCHAR(36)`（调用时传入，可能为空如 admin 后台测试）
- `source`: `LLMSource` 枚举值（从请求上下文推断）
- `input_tokens`: `INT`（从 `usage.prompt_tokens` 获取）
- `output_tokens`: `INT`（从 `usage.completion_tokens` 获取）
- `total_tokens`: `INT`（从 `usage.total_tokens` 获取）
- `cost_cents`: `INT`（单位：分，通过 `billingService.calculateCost()` 计算）
- `has_usage`: `TINYINT(1)`（是否拿到官方 usage 信息，容错标记）
- `currency`: `CNY`（固定）
- `created_at`: `DATETIME`（调用时间，用于价格规则选择）

**user_id 和 source 一致性规范**：
- **App 端**：`source = LLMSource.App`，`user_id` 必须是登录用户 id（不允许 NULL）
- **Admin 测试**：`source = LLMSource.Admin`，`user_id` 允许为 NULL
- **定时脚本/回填**：`source = LLMSource.Script`，`user_id` 通常 NULL

**容错处理**：
- 如果流式响应中拿不到 usage（异常中断等）：
  - 仍然正常返回给前端（不能影响用户体验）
  - `llm_usage_logs` 中写入记录：`input_tokens = 0, output_tokens = 0, total_tokens = 0, cost_cents = 0, has_usage = 0`
  - 记录警告日志，便于后续排查

### 3. 计价规则设计

**价格配置表**：`llm_pricing_rules`

DeepSeek 官方定价按 Token 计费，区分输入/输出、缓存命中与否。价格可能变动，**不在代码中写死**，使用配置表管理。

**表结构**：
```sql
CREATE TABLE IF NOT EXISTS llm_pricing_rules (
  rule_id VARCHAR(36) PRIMARY KEY,
  provider VARCHAR(32) NOT NULL COMMENT '提供商：deepseek/openai/qwen',
  model VARCHAR(64) NOT NULL COMMENT '模型名称：deepseek-chat/deepseek-reasoner/gpt-4等',
  direction ENUM('input', 'output') NOT NULL COMMENT '方向：输入/输出',
  tier ENUM('normal', 'cache_hit') DEFAULT 'normal' COMMENT '层级：普通/缓存命中（cache_miss等价于normal）',
  price_per_million DECIMAL(10, 4) NOT NULL COMMENT '价格：元/百万tokens',
  currency VARCHAR(8) DEFAULT 'CNY' COMMENT '货币',
  effective_from DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '生效时间',
  effective_to DATETIME NULL COMMENT '失效时间（NULL表示当前有效）',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_provider_model (provider, model),
  INDEX idx_effective (effective_from, effective_to)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**tier 设计说明**：
- `normal`：普通价格（包括 `cache_miss` 和普通调用）
- `cache_hit`：缓存命中价格（DeepSeek 支持，价格更低）
- **不设置 `cache_miss`**：避免与 `normal` 混淆，简化价格管理

**价格查询逻辑**（关键）：
查询价格规则时，必须用**调用发生时间**（`usage_time`）去匹配，而不是当前时间：

```sql
SELECT *
FROM llm_pricing_rules
WHERE provider = :provider
  AND model = :model
  AND direction = :direction
  AND tier = :tier
  AND effective_from <= :usage_time
  AND (effective_to IS NULL OR effective_to > :usage_time)
ORDER BY effective_from DESC
LIMIT 1;
```

**为什么要用 `usage_time`**：
- 避免历史记录回查时被按新价格重算
- 保证历史数据的费用准确性（按当时价格计算）

**计费公式**：
```text
单条调用费用（元） = 
  (input_tokens / 1,000,000) * 单价(输入, 对应tier)
+ (output_tokens / 1,000,000) * 单价(输出, 对应tier)

cost_cents = Math.round(费用（元） * 100)  // 使用 Math.round，不是 parseInt 或 Math.floor
```

**四舍五入规则**：
- 必须使用 `Math.round(元 * 100)`，而不是 `parseInt` 或 `Math.floor`
- 避免小数精度问题，确保费用计算的准确性

**计费服务设计**：
- 统一在 `billingService.calculateCost()` 中处理
- `aiService` 只负责调用，把 `provider/model/cache_hit/usage/usage_time` 传给 `billingService`
- 好处：将来要改价格逻辑（如包月折扣、内部账号0元）全部在 billingService 里，测试用例也更清晰

**价格未配置时的行为**（关键）：
- 如果找不到匹配的 `llm_pricing_rules` 记录：
  - **方案 A（推荐）**：写 `cost_cents = 0`，`has_pricing = 0`（在 log 表加 `has_pricing` 字段），并打 error log
  - 不中断调用流程，避免线上一旦漏配价格就全挂
  - 在 Admin 后台可以统计「有多少调用未配置价格」

**DeepSeek 初始价格数据**：
```sql
-- DeepSeek Chat 输入（普通）
INSERT INTO llm_pricing_rules (rule_id, provider, model, direction, tier, price_per_million, effective_from) VALUES
  (UUID(), 'deepseek', 'deepseek-chat', 'input', 'normal', 0.14, NOW());

-- DeepSeek Chat 输出（普通）
INSERT INTO llm_pricing_rules (rule_id, provider, model, direction, tier, price_per_million, effective_from) VALUES
  (UUID(), 'deepseek', 'deepseek-chat', 'output', 'normal', 0.28, NOW());

-- DeepSeek Chat 输入（缓存命中）
INSERT INTO llm_pricing_rules (rule_id, provider, model, direction, tier, price_per_million, effective_from) VALUES
  (UUID(), 'deepseek', 'deepseek-chat', 'input', 'cache_hit', 0.0014, NOW());

-- DeepSeek Reasoner 输入（普通）
INSERT INTO llm_pricing_rules (rule_id, provider, model, direction, tier, price_per_million, effective_from) VALUES
  (UUID(), 'deepseek', 'deepseek-reasoner', 'input', 'normal', 0.55, NOW());

-- DeepSeek Reasoner 输出（普通）
INSERT INTO llm_pricing_rules (rule_id, provider, model, direction, tier, price_per_million, effective_from) VALUES
  (UUID(), 'deepseek', 'deepseek-reasoner', 'output', 'normal', 2.19, NOW());
```

> **注意**：以上价格为示例，需根据 DeepSeek 官网最新价格更新。Provider 统一使用 `deepseek`（不是 `chatgpt`），未来 OpenAI 用 `openai`。

**rule_id 类型说明**：
- `llm_pricing_rules.rule_id` 使用 `VARCHAR(36)` UUID（配置表主键，不会经常 join/聚合，对性能影响可忽略）
- `llm_usage_logs` 和 `llm_usage_daily` 使用 `BIGINT AUTO_INCREMENT`（日志表主键，性能优化）

---

## 三、数据库设计

### 1. 详细日志表：`llm_usage_logs`

**表结构**（遵循现有系统字段命名规范，优化主键设计）：
```sql
CREATE TABLE IF NOT EXISTS llm_usage_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '自增主键（性能优化）',
  provider VARCHAR(32) NOT NULL COMMENT '提供商：deepseek/openai/qwen',
  model VARCHAR(64) NOT NULL COMMENT '模型名称',
  is_thinking_mode TINYINT(1) DEFAULT 0 COMMENT '是否思考模式（DeepSeek专用）',
  cache_hit TINYINT(1) DEFAULT 0 COMMENT '是否缓存命中',
  user_id VARCHAR(36) NULL COMMENT '用户ID（外键users.user_id，可为空如admin测试）',
  source VARCHAR(32) NULL COMMENT '来源：app/admin/script（后续如有新增来源，需先在LLMSource枚举中登记）',
  trace_id VARCHAR(64) NULL COMMENT '调用链路ID（用于日志系统关联排查）',
  input_tokens INT NOT NULL COMMENT '输入tokens',
  output_tokens INT NOT NULL COMMENT '输出tokens',
  total_tokens INT NOT NULL COMMENT '总tokens',
  cost_cents INT NOT NULL COMMENT '费用（分）',
  has_usage TINYINT(1) DEFAULT 1 COMMENT '是否拿到官方usage信息（容错标记）',
  has_pricing TINYINT(1) DEFAULT 1 COMMENT '是否配置了价格规则（容错标记）',
  status TINYINT(1) DEFAULT 0 COMMENT '状态：0=正常，1=调用失败，2=无usage（P2可选实现）',
  currency VARCHAR(8) DEFAULT 'CNY' COMMENT '货币',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间（用于价格规则选择）',
  INDEX idx_created_at (created_at),
  INDEX idx_provider_model_date (provider, model, created_at),
  INDEX idx_user_date (user_id, created_at),
  INDEX idx_provider_date (provider, created_at),
  INDEX idx_has_usage (has_usage),
  INDEX idx_has_pricing (has_pricing),
  INDEX idx_trace_id (trace_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**字段说明**：
- `id`: 主键，`BIGINT AUTO_INCREMENT`（性能优化，避免 VARCHAR(36) UUID 主键带来的索引负担）
- `user_id`: `VARCHAR(36)`（与 `users.user_id` 一致，可为 NULL）
- `source`: 来源枚举值，后续如有新增来源，需先在 `LLMSource` 枚举中登记
- `trace_id`: 调用链路ID（可选但很有用），用于与日志系统关联排查问题
- `cost_cents`: 用**分**存储，避免 float 精度问题
- `has_usage`: 容错标记，如果拿不到官方 usage 信息，设为 0，tokens 和 cost 都写 0
- `has_pricing`: 容错标记，如果找不到价格规则，设为 0，cost_cents 写 0
- `status`: 状态标记（P2 可选实现），0=正常，1=调用失败，2=无usage，用于失败率统计
- `created_at`: 用于价格规则选择（必须用调用发生时间，不是当前时间）
- 索引：按查询场景优化（时间范围、用户、提供商、容错标记、trace_id）

### 2. 日统计表（可选但推荐）：`llm_usage_daily`

为了 Admin 图表查询更快，用定时任务（每天 0 点 + 每小时补一次）把日志聚合成日报。

**表结构**（优化主键设计）：
```sql
CREATE TABLE IF NOT EXISTS llm_usage_daily (
  id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '自增主键',
  date DATE NOT NULL COMMENT '日期',
  provider VARCHAR(32) NOT NULL COMMENT '提供商',
  model VARCHAR(64) NOT NULL COMMENT '模型名称',
  total_requests INT NOT NULL DEFAULT 0 COMMENT '总请求数',
  total_input_tokens BIGINT NOT NULL DEFAULT 0 COMMENT '总输入tokens',
  total_output_tokens BIGINT NOT NULL DEFAULT 0 COMMENT '总输出tokens',
  total_tokens BIGINT NOT NULL DEFAULT 0 COMMENT '总tokens',
  total_cost_cents BIGINT NOT NULL DEFAULT 0 COMMENT '总费用（分）',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_date_provider_model (date, provider, model),
  INDEX idx_date (date),
  INDEX idx_provider_date (provider, date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**聚合逻辑**（优化：避免函数导致索引失效）：
```sql
-- 聚合昨天数据（每天 0:05 执行）
INSERT INTO llm_usage_daily (date, provider, model, total_requests, total_input_tokens, total_output_tokens, total_tokens, total_cost_cents)
SELECT
  DATE(created_at) AS date,
  provider,
  model,
  COUNT(*) AS total_requests,
  SUM(input_tokens) AS total_input_tokens,
  SUM(output_tokens) AS total_output_tokens,
  SUM(total_tokens) AS total_tokens,
  SUM(cost_cents) AS total_cost_cents
FROM llm_usage_logs
WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 1 DAY)  -- 昨天 00:00:00
  AND created_at < CURDATE()  -- 今天 00:00:00（不包含）
GROUP BY DATE(created_at), provider, model
ON DUPLICATE KEY UPDATE
  total_requests = VALUES(total_requests),
  total_input_tokens = VALUES(total_input_tokens),
  total_output_tokens = VALUES(total_output_tokens),
  total_tokens = VALUES(total_tokens),
  total_cost_cents = VALUES(total_cost_cents),
  updated_at = CURRENT_TIMESTAMP;

-- 补聚合今天数据（每小时执行）
INSERT INTO llm_usage_daily (date, provider, model, total_requests, total_input_tokens, total_output_tokens, total_tokens, total_cost_cents)
SELECT
  DATE(created_at) AS date,
  provider,
  model,
  COUNT(*) AS total_requests,
  SUM(input_tokens) AS total_input_tokens,
  SUM(output_tokens) AS total_output_tokens,
  SUM(total_tokens) AS total_tokens,
  SUM(cost_cents) AS total_cost_cents
FROM llm_usage_logs
WHERE created_at >= CURDATE()  -- 今天 00:00:00
  AND created_at < DATE_ADD(CURDATE(), INTERVAL 1 DAY)  -- 明天 00:00:00（不包含）
GROUP BY DATE(created_at), provider, model
ON DUPLICATE KEY UPDATE
  total_requests = VALUES(total_requests),
  total_input_tokens = VALUES(total_input_tokens),
  total_output_tokens = VALUES(total_output_tokens),
  total_tokens = VALUES(total_tokens),
  total_cost_cents = VALUES(total_cost_cents),
  updated_at = CURRENT_TIMESTAMP;
```

**关键优化点**：
- 使用 `created_at >= start AND created_at < end` 而不是 `DATE(created_at) = date`，避免函数导致索引失效
- `llm_usage_daily` 的 `total_*` 始终是该天已经写入日志的完整汇总
- 小时级补算用 `ON DUPLICATE KEY UPDATE` 覆盖所有字段

---

## 四、后端接口设计

在 Admin 路由模块新增：`core/src/routes/admin/billing.ts`

### 1. 概览统计接口

**路径**: `GET /api/admin/v1/billing/summary`

**请求参数**：
- `start_date`: `YYYY-MM-DD`（可选，默认：**本自然月1号**）
- `end_date`: `YYYY-MM-DD`（可选，默认：今天）
- `provider`: `deepseek` / `openai` / `qwen`（可选）
- `model`: 模型名称（可选）

**默认时间范围说明**：
- 明确是「**本自然月**」（如 1月1日 ~ 1月31日），而不是「最近30天」
- 这样预估算法里的 `days_in_month` 可以直接用当月天数
- Admin 页面可以直接展示「本月」label

**跨月查询时的行为**：
- 当 `start_date/end_date` 被自定义为**非本月**时：
  - 只返回这段区间的实际消耗，**不做预估**（`forecast_*` 字段为 null 或 0）
  - `forecast_note = "仅显示实际消耗，不提供预估"`

**返回示例**：
```json
{
  "success": true,
  "data": {
    "total_tokens": 1234567,
    "total_input_tokens": 800000,
    "total_output_tokens": 434567,
    "total_cost_cents": 3567,
    "total_cost_yuan": 35.67,
    "currency": "CNY",
    "forecast_month_tokens": 3210000,
    "forecast_month_cost_cents": 9200,
    "forecast_month_cost_yuan": 92.00,
    "forecast_basis_days": 12,
    "forecast_used_ratio": 0.39,
    "forecast_note": "基于本月前12天数据推算"
  }
}
```

**新增字段说明**：
- `forecast_used_ratio`: 本月已用费用 / 预估整月费用（0.39 = 39%），方便前端画进度条

### 2. 趋势数据接口

**路径**: `GET /api/admin/v1/billing/trend`

**请求参数**：
- `start_date`: `YYYY-MM-DD`（必填）
- `end_date`: `YYYY-MM-DD`（必填）
- `provider`: 可选
- `model`: 可选
- `granularity`: `day`（默认，**P0 阶段只支持 day**，week/month 延后到 P2）

**granularity 粒度约定**（P0 只实现 `day`）：
- `day`：返回 `date: YYYY-MM-DD`（如 `"2025-01-15"`）
- `week`：返回 `period: YYYY-Wxx` 或 `start_date/end_date`（P2 实现）
- `month`：返回 `period: YYYY-MM`（P2 实现）

**数据来源优先级**（关键）：
- **时间跨度 ≤ 3 天**：直接查 `llm_usage_logs`（更精细，将来支持按小时也 OK）
- **时间跨度 > 3 天**：查 `llm_usage_daily` 表（性能优化）
- 避免以后不同人实现成两套逻辑

**返回示例**（`granularity=day`）：
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "date": "2025-01-01",
        "total_tokens": 120000,
        "total_cost_cents": 330,
        "total_cost_yuan": 3.30,
        "input_tokens": 80000,
        "output_tokens": 40000,
        "request_count": 45
      },
      {
        "date": "2025-01-02",
        "total_tokens": 150000,
        "total_cost_cents": 420,
        "total_cost_yuan": 4.20,
        "input_tokens": 100000,
        "output_tokens": 50000,
        "request_count": 52
      }
    ]
  }
}
```

### 3. 模型对比接口

**路径**: `GET /api/admin/v1/billing/by-model`

**请求参数**：
- `start_date`: `YYYY-MM-DD`（可选）
- `end_date`: `YYYY-MM-DD`（可选）
- `provider`: 可选

**数据来源策略**：
- 有 `llm_usage_daily` 数据的时间段，优先从 daily 表聚合
- 不在 daily 范围内（比如今天尚未完全聚合），再补上 logs 表
- 这样长期性能会更稳

**返回示例**：
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "provider": "deepseek",
        "model": "deepseek-chat",
        "total_tokens": 800000,
        "total_cost_cents": 2100,
        "total_cost_yuan": 21.00,
        "request_count": 320
      },
      {
        "provider": "deepseek",
        "model": "deepseek-reasoner",
        "total_tokens": 300000,
        "total_cost_cents": 1900,
        "total_cost_yuan": 19.00,
        "request_count": 85
      }
    ]
  }
}
```

### 4. 明细列表接口（P2 延后）

**路径**: `GET /api/admin/v1/billing/details`

**优先级说明**：
- **P0 阶段先不做**，概览 + 趋势 + 按模型聚合已满足「看整体成本」
- 明细表、按用户追踪放到 P2
- 如果确实需要，可以先用 SQL 直接查 `llm_usage_logs` 表

**请求参数**（P2 实现）：
- `start_date`: `YYYY-MM-DD`（可选）
- `end_date`: `YYYY-MM-DD`（可选）
- `provider`: 可选
- `model`: 可选
- `user_id`: 可选
- `page`: 页码（默认：1）
- `page_size`: 每页数量（默认：50，最大：200）

**返回示例**（P2 实现）：
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 12345,
        "provider": "deepseek",
        "model": "deepseek-chat",
        "user_id": "xxx",
        "user_nickname": "用户A",
        "input_tokens": 1200,
        "output_tokens": 800,
        "total_tokens": 2000,
        "cost_cents": 56,
        "cost_yuan": 0.56,
        "cache_hit": false,
        "source": "app",
        "has_usage": true,
        "created_at": "2025-01-15 14:30:00"
      }
    ],
    "pagination": {
      "page": 1,
      "page_size": 50,
      "total": 1234,
      "total_pages": 25
    }
  }
}
```

---

## 五、费用预估算法设计

### 1. 预估逻辑（本自然月）

**步骤**：
1. 确定本月范围：`month_start` = 本月1号 00:00:00，`today` = 今天 23:59:59
2. 查询 `llm_usage_daily`（或聚合 `llm_usage_logs`）：
   - `sum_tokens`、`sum_cost_cents`
   - `days_used` = **从月初到今天的自然天数**（推荐，适合整体把控）
3. 计算平均：
   ```text
   avg_tokens_per_day = sum_tokens / days_used
   avg_cost_per_day = sum_cost_cents / days_used
   ```
4. 预估全月：
   ```text
   days_in_month = 当前月份总天数（如1月=31天）
   forecast_month_tokens = avg_tokens_per_day * days_in_month
   forecast_month_cost_cents = avg_cost_per_day * days_in_month
   forecast_used_ratio = forecast_month_cost_cents > 0 
     ? total_cost_cents / forecast_month_cost_cents 
     : 0  // 避免除零错误
   ```

### 2. 特殊情况处理

- **`days_used == 0`**：
  - 返回：`forecast_month_tokens = 0`，`forecast_month_cost_cents = 0`，`forecast_used_ratio = 0`
  - `forecast_note = "本月尚无调用数据，无法预估"`

- **`forecast_month_cost_cents = 0`**：
  - `forecast_used_ratio = 0`（避免除零错误）

- **只有1-2天数据**：
  - 仍按平均计算，但 `forecast_note` 提示："数据较少，预估仅供参考"

- **跨月查询时的预估逻辑**：
  - 当 `start_date/end_date` 被自定义为**非本月**时：
    - 只返回这段区间的实际消耗，**不做预估**（`forecast_*` 字段为 null 或 0）
    - 或者直接禁用预估，只对本月默认区间做预估
  - 当 `provider/model` 过滤时：
    - 预估仍然基于「整个本月该 provider/model 的费用」

- **模式选择**：
  - **自然日平均**：从月初到今天的天数（**P0 实现此模式**）
  - **仅使用日平均**：只算有调用的天（P2 可选实现）

---

## 六、Admin 前端页面设计

### 1. 路由与菜单

- **路由路径**: `/billing` 或 `/llm-billing`
- **菜单位置**: 在「LLM 配置」旁边新增「计费统计」菜单项
- **权限**: 需要 Admin 认证（与现有 Admin 页面一致）

### 2. 页面布局

#### 2.1 顶部筛选区

**布局要求**：
- 筛选区与页面标题之间留统一间距：`padding: 16px 24px`
- 筛选器一行排好：`日期范围 + Provider + Model + 搜索按钮`，不要乱漂
- 使用 Ant Design `Space` 组件统一间距

**筛选器内容**：
- **时间范围选择器**：
  - 快捷选项：`今天` / `昨天` / `近7天` / `本月` / `上月` / `自定义`
  - 自定义：日期范围选择器（DatePicker.RangePicker）
- **Provider 下拉**：`全部` / `DeepSeek` / `OpenAI` / `Qwen`
- **Model 下拉**：根据 Provider 动态加载（如选择 DeepSeek 后显示 `deepseek-chat` / `deepseek-reasoner`）

#### 2.2 关键指标卡片（4个，横向排列）

使用 Ant Design `Card` 组件，**严格对齐规范**：

**布局要求**：
- 使用 Ant Design 栅格：`<Row gutter={16}><Col span={6}>...</Col>...</Row>`
- 保证在 1440 / 1920 分辨率下，卡片间距固定且对齐
- 卡片宽度统一，高度自适应内容

**数字格式化要求**：
- 所有 Token/费用数字都用 `Intl.NumberFormat` 格式化
- Tokens：千分位，无小数（如 `1,234,567`）
- 费用：千分位 + 固定2位小数（如 `¥ 12.34`）

**卡片内容**：

1. **本期累计总 Tokens**
   - 主数值：`total_tokens`（格式化：`1,234,567`）
   - 子标题：`输入：800,000 / 输出：434,567`
   - 图标：📊

2. **本期累计费用**
   - 主数值：`¥ ${total_cost_yuan.toFixed(2)}`（如 `¥ 35.67`）
   - 子标题：`约 ${total_cost_cents} 分`
   - 图标：💰

3. **预估本月 Tokens**
   - 主数值：`forecast_month_tokens`（格式化：`3,210,000`）
   - 子说明：`基于 ${forecast_basis_days} 天数据推算`
   - 图标：📈

4. **预估本月费用**
   - 主数值：`¥ ${forecast_month_cost_yuan.toFixed(2)}`（如 `¥ 92.00`）
   - 子说明：`本月预算控制参考` + 进度条（基于 `forecast_used_ratio`）
   - 图标：💡

#### 2.3 趋势图区域

使用 Ant Design Charts 或 ECharts（根据 Admin 现有图表库选择）：

**布局要求**：
- 两个图表高度统一：都设为 `320px`，避免一高一矮
- 图表之间留统一间距：`margin-bottom: 24px`

**图表1：Token 消耗趋势**
- 类型：折线图（Line Chart）
- X 轴：日期（格式化：`YYYY-MM-DD`）
- Y 轴：总 Tokens（格式化：千分位，如 `1,234,567`）
- 可选：显示输入/输出多条线（不同颜色）

**图表2：费用趋势**
- 类型：折线图（Line Chart）
- X 轴：日期（格式化：`YYYY-MM-DD`）
- Y 轴：费用（¥，格式化：保留2位小数，如 `¥ 12.34`）

**空数据态处理**：
- 当 summary 接口返回全 0 + "本月尚无调用数据，无法预估" 时：
  - 折线图使用空状态（比如「暂无数据」占位），而不是画一条全 0 的线
  - 指标卡片显示 0 值，但预估卡片显示「暂无数据」提示

**时间快捷选项与 summary 的联动**：
- **点击「本月」时**：
  - 请求 summary（默认区间，本月）+ trend（本月）+ by-model（本月）
  - 显示预估字段
- **点击「自定义」时**：
  - trend 和 by-model 按区间返回
  - summary 只显示实际总量，**不展示/不更新预估字段**（或者将预估区域置灰）
  - 这样设计逻辑会非常清晰，产品和开发都不会歪掉

#### 2.4 明细表格（P2 延后）

**优先级说明**：
- **P0 阶段先不做**，概览 + 趋势 + 按模型聚合已满足「看整体成本」
- 明细表放到 P2

**表格规范**（P2 实现时遵循）：
- 使用 Ant Design `Table` 组件
- **列对齐方式**：
  - 数字列右对齐：费用、Tokens、请求次数
  - 文本列左对齐：Model、Provider、用户
  - 日期列左对齐或居中，保持风格一致
- **表头**：
| 日期 | Provider | Model | 请求次数 | 输入 Tokens | 输出 Tokens | 总 Tokens | 费用（¥） | 用户 | 来源 |
| -- | -------- | ----- | ---- | --------- | --------- | -------- | ----- | ---- | ---- |
- **数据来源**：`GET /api/admin/v1/billing/details`
- **功能**：支持分页、排序（按日期降序）

---

## 七、实现步骤与优先级

### P0 / P1 / P2 边界划分

| 优先级 | 功能模块 | 具体内容 |
|--------|---------|---------|
| **P0 必须完成** | 数据采集 | 数据采集 + cost 计算 + 日志记录 |
| **P0 必须完成** | 定时任务 | daily 聚合 job（至少先做"昨天"那一版） |
| **P0 必须完成** | 后端接口 | summary + trend + by-model 三个接口 |
| **P0 必须完成** | Admin 前端 | 筛选 + 4 卡片 + 2 折线图（不做明细、不做导出） |
| **P1 以后再说** | 明细列表 | 明细列表接口 + 前端表格 |
| **P1 以后再说** | 粒度扩展 | granularity 的 week/month |
| **P2 延后** | 价格管理 | 价格管理页面 |
| **P2 延后** | 其他功能 | 告警、用户维度统计、导出 |

### Phase 1: 数据采集层（P0）

1. **修改 `aiService.ts`**：
   - 在 `chatStream()` 中：流式响应最后一个 chunk 提取 usage，记录日志
   - 在 `chat()` 中：从 `LLMResponse.usage` 记录日志
   - 新增函数：`logLLMUsage(params)` 统一记录

2. **创建计费服务**：
   - `core/src/modules/billing/billingService.ts`
   - 函数：`calculateCost(provider, model, inputTokens, outputTokens, cacheHit, usageTime)` → 返回 `cost_cents`
     - 根据 `usageTime`（调用发生时间）查询价格规则，不是当前时间
     - 统一处理所有价格逻辑（未来扩展包月折扣、内部账号0元等）
   - 函数：`logUsage(params)` → 写入 `llm_usage_logs`
     - 校验 `user_id` 和 `source` 一致性（App 端必须有 user_id）
     - 容错处理：拿不到 usage 时写 0 值，`has_usage = 0`
     - 容错处理：找不到价格规则时写 0 值，`has_pricing = 0`，打 error log
     - 记录 `trace_id`（如果调用链路中有）

3. **创建数据库迁移**：
   - `core/src/database/migrations/XXX_create_llm_billing_tables.sql`
   - 创建：`llm_usage_logs`、`llm_usage_daily`、`llm_pricing_rules`
   - 插入初始 DeepSeek 价格数据

### Phase 2: 后端接口（P0）

1. **创建路由**：
   - `core/src/routes/admin/billing.ts`
   - 挂载到 `core/src/routes/admin/index.ts`

2. **创建服务层**：
   - `core/src/modules/admin/billingAdminService.ts`
   - 实现：`getBillingSummary()`, `getBillingTrend()`, `getBillingByModel()`, `getBillingDetails()`

3. **实现预估算法**：
   - 在 `getBillingSummary()` 中实现费用预估逻辑

### Phase 3: 定时任务（P0）

1. **创建聚合任务**：
   - `core/src/jobs/aggregateDailyUsage.ts`
   - 每天 0:05 执行：聚合昨天的数据到 `llm_usage_daily`（**P0 至少完成这个**）
   - 每小时执行：补聚合当天数据（避免延迟，P1 可选）

2. **集成到系统**：
   - 使用 `node-cron` 或类似库
   - 在 `core/src/app.ts` 启动时注册

### Phase 4: Admin 前端（P0）

1. **创建页面组件**：
   - `admin/src/pages/Billing/BillingPage.tsx`

2. **创建服务**：
   - `admin/src/services/billingService.ts`

3. **集成到路由**：
   - 在 `admin/src/App.tsx` 或路由配置中添加 `/billing` 路由

4. **实现 UI**（严格对齐规范）：
   - 筛选区：统一间距、一行排列
   - 指标卡片：4个卡片，栅格布局，数字格式化统一
   - 趋势图：2个图表，高度统一 320px，空数据态处理
   - 时间快捷选项与 summary 联动逻辑
   - **明细表格：P2 延后**

---

## 八、扩展到 ChatGPT / Qwen 的预留点

未来扩展时，只需：

1. **在 `llm_pricing_rules` 中新增价格**：
   - 插入 ChatGPT / Qwen 的 Provider / Model 价格数据

2. **确保统一调用层记录 usage**：
   - `aiService.ts` 中的 `logLLMUsage()` 已支持所有 Provider
   - 前端/后端统计逻辑**完全不用改**，只需在筛选器里多几个选项

---

## 九、关键注意事项

### 1. 与系统参数保持一致

- ✅ `user_id` 使用 `VARCHAR(36)`（UUID），不是 `BIGINT`
- ✅ 主键优化：`llm_usage_logs` 和 `llm_usage_daily` 使用 `BIGINT AUTO_INCREMENT`（性能优化，避免 VARCHAR(36) UUID 主键带来的索引负担）
- ✅ 时间字段使用 `DATETIME`，默认 `CURRENT_TIMESTAMP`
- ✅ 费用用**分**存储（`cost_cents INT`），避免 float 精度问题
- ✅ Provider 使用枚举：`LLMProvider.DeepSeek` / `LLMProvider.OpenAI` / `LLMProvider.Qwen`（避免字符串 typo）

### 2. DeepSeek 流式响应 usage 提取

- DeepSeek 流式响应中，usage 在最后一个 chunk（`[DONE]` 之前）
- 需要在 `DeepSeekProvider.chatStream()` 中捕获最后一个 chunk 的 `usage` 字段
- 如果流式响应中没有 usage，需要记录警告日志（但不阻塞调用）

### 3. 价格更新机制

- 价格可能变动，**P0 阶段先不做 Admin 管理页**，直接用 SQL 脚本手动更新 `llm_pricing_rules` 表
- 价格管理页面放到 P2（等你真的要频繁调价时再做）
- 更新价格时，设置旧规则的 `effective_to`，插入新规则的 `effective_from`，保证历史数据按当时价格计算

### 4. 性能考虑

- `llm_usage_logs` 表会快速增长，建议：
  - 定期归档（如保留最近3个月，更早的归档到历史表）
  - 使用 `llm_usage_daily` 聚合表加速查询

---

## 十、测试验证点

1. **数据采集**：
   - ✅ 调用 LLM 后，`llm_usage_logs` 表有记录
   - ✅ `cost_cents` 计算正确（与 DeepSeek 官网价格一致）

2. **统计接口**：
   - ✅ `GET /api/admin/v1/billing/summary` 返回正确汇总
   - ✅ 费用预估算法正确（有数据/无数据场景）

3. **前端页面**：
   - ✅ 指标卡片显示正确
   - ✅ 趋势图数据正确
   - ✅ 明细表格分页正常

---

## 十一、P2 后续优化（可选）

1. **明细列表接口和表格**：`GET /api/admin/v1/billing/details` + 前端明细表格
2. **趋势图粒度扩展**：支持 `granularity = week/month`
3. **价格管理页面**：在 Admin 后台管理 `llm_pricing_rules`
4. **成本告警**：当月费用超过阈值时发送通知
5. **用户维度统计**：按用户查看 Token 消耗（需权限控制）
6. **导出功能**：导出 Excel 报表

---

## 十二、文档依据

- ✅ 遵循现有 Admin 路由结构（`/api/admin/v1/*`）
- ✅ 遵循现有数据库字段命名规范（`user_id VARCHAR(36)`, `created_at DATETIME`）
- ✅ 遵循现有 Admin 前端技术栈（React + TypeScript + Ant Design）
- ✅ 不新增系统参数，复用现有 `llm_api_configs` 表的 `model` 字段

---

**下一步**：确认方案后，按 Phase 1 → Phase 2 → Phase 3 → Phase 4 顺序实施。

