-- 通过 Cloud SQL Proxy 查询生产环境表结构的 SQL 脚本
-- 使用方法: mysql -h 127.0.0.1 -P 3307 -u xiaopei_prod -p xiaopei < check-prod-tables-direct.sql

-- 1. 获取所有表
SHOW TABLES;

-- 2. 检查关键表结构
DESCRIBE llm_api_configs;
DESCRIBE conversations;
DESCRIBE users;
DESCRIBE messages;
DESCRIBE verification_codes;

-- 3. 检查 llm_api_configs 数据
SELECT 
  model,
  api_url,
  is_enabled,
  api_key_encrypted IS NOT NULL as has_api_key,
  LENGTH(api_key_encrypted) as key_length,
  model_name,
  enable_stream,
  thinking_mode
FROM llm_api_configs
ORDER BY model;

-- 4. 检查 conversations 表列
SHOW COLUMNS FROM conversations;

-- 5. 检查 users 表列
SHOW COLUMNS FROM users;

