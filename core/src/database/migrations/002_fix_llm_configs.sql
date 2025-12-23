-- Migration: 修复 LLM 配置表结构
-- Date: 2025-11-20
-- Purpose: 添加缺失的列，使其与 DTO 定义一致

USE xiaopei;

-- 1. 添加缺失的列（如果不存在）
ALTER TABLE llm_api_configs 
  ADD COLUMN model_name VARCHAR(100) DEFAULT NULL COMMENT '完整模型名称',
  ADD COLUMN enable_stream BOOLEAN DEFAULT TRUE COMMENT '是否启用流式输出',
  ADD COLUMN temperature DECIMAL(3,2) DEFAULT 0.7 COMMENT '温度参数',
  ADD COLUMN max_tokens INT DEFAULT 4000 COMMENT '最大 token 数',
  ADD COLUMN is_default BOOLEAN DEFAULT FALSE COMMENT '是否为默认模型',
  ADD COLUMN test_status ENUM('success', 'failed', 'not_tested') DEFAULT 'not_tested' COMMENT '测试状态',
  ADD COLUMN test_message TEXT DEFAULT NULL COMMENT '测试消息';

-- 2. 迁移现有数据：设置默认值
UPDATE llm_api_configs 
SET 
  model_name = CASE 
    WHEN model = 'deepseek' THEN 'deepseek-chat'
    WHEN model = 'chatgpt' THEN 'gpt-4o'
    WHEN model = 'qwen' THEN 'qwen-max'
  END,
  enable_stream = TRUE,
  temperature = 0.7,
  max_tokens = 4000,
  is_default = (model = 'deepseek'),
  test_status = 'not_tested'
WHERE model_name IS NULL;

-- 3. 创建索引（提升查询性能）
-- 注意：如果索引已存在，会报错但不影响功能
-- CREATE INDEX idx_model_enabled ON llm_api_configs(model, is_enabled);
-- CREATE INDEX idx_is_default ON llm_api_configs(is_default);

-- 4. 显示当前表结构
DESCRIBE llm_api_configs;

-- 5. 显示迁移后的数据
SELECT 
  config_id,
  model,
  model_name,
  is_enabled,
  is_default,
  thinking_mode,
  temperature,
  max_tokens,
  test_status,
  api_key_encrypted IS NOT NULL as has_api_key
FROM llm_api_configs;

