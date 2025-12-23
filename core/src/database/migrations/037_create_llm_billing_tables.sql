-- ============================================
-- LLM 计费统计表创建脚本
-- 版本：v1.0
-- 创建日期：2025-01-XX
-- 用途：统计 LLM Token 消耗量和费用
-- ============================================

-- ===== 1. LLM 使用日志表 =====
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

-- ===== 2. LLM 日统计表 =====
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

-- ===== 3. LLM 价格规则表 =====
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

-- ===== 4. 插入初始 DeepSeek 价格数据 =====
-- 注意：以下价格为示例，需根据 DeepSeek 官网最新价格更新

-- DeepSeek Chat 输入（普通）
INSERT INTO llm_pricing_rules (rule_id, provider, model, direction, tier, price_per_million, effective_from) VALUES
  (UUID(), 'deepseek', 'deepseek-chat', 'input', 'normal', 0.14, NOW())
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- DeepSeek Chat 输出（普通）
INSERT INTO llm_pricing_rules (rule_id, provider, model, direction, tier, price_per_million, effective_from) VALUES
  (UUID(), 'deepseek', 'deepseek-chat', 'output', 'normal', 0.28, NOW())
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- DeepSeek Chat 输入（缓存命中）
INSERT INTO llm_pricing_rules (rule_id, provider, model, direction, tier, price_per_million, effective_from) VALUES
  (UUID(), 'deepseek', 'deepseek-chat', 'input', 'cache_hit', 0.0014, NOW())
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- DeepSeek Reasoner 输入（普通）
INSERT INTO llm_pricing_rules (rule_id, provider, model, direction, tier, price_per_million, effective_from) VALUES
  (UUID(), 'deepseek', 'deepseek-reasoner', 'input', 'normal', 0.55, NOW())
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- DeepSeek Reasoner 输出（普通）
INSERT INTO llm_pricing_rules (rule_id, provider, model, direction, tier, price_per_million, effective_from) VALUES
  (UUID(), 'deepseek', 'deepseek-reasoner', 'output', 'normal', 2.19, NOW())
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;


