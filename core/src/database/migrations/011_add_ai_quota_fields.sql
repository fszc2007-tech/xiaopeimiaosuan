-- Migration: 新增 AI 解讀次數限制欄位
-- 日期：2024-12-XX
-- 用途：支援會員訂閱與 AI 解讀次數限制功能

-- 1. 新增 AI 次數相關欄位
ALTER TABLE users
  ADD COLUMN ai_calls_today INT NOT NULL DEFAULT 0 COMMENT '今日已使用 AI 解讀次數',
  ADD COLUMN ai_calls_date VARCHAR(10) NOT NULL DEFAULT '' COMMENT '計數日期 (YYYY-MM-DD)';

-- 2. 修改 pro_plan 支援季度方案
ALTER TABLE users
  MODIFY COLUMN pro_plan ENUM('yearly', 'monthly', 'quarterly', 'lifetime') NULL COMMENT 'Pro 方案類型';

-- 3. 如果 subscriptions 表存在，也需要修改
ALTER TABLE subscriptions
  MODIFY COLUMN plan ENUM('yearly', 'monthly', 'quarterly', 'lifetime') NOT NULL COMMENT '訂閱方案';

-- 4. 添加索引（可選，用於查詢優化）
-- 注意：如果索引已存在會報錯，可以忽略
CREATE INDEX idx_ai_calls_date ON users(ai_calls_date);

-- 完成
SELECT '✅ Migration 011: AI 解讀次數限制欄位已新增' AS message;

