-- ============================================
-- Migration 043: 添加缺失的数据库字段
-- 创建日期：2025-12-26
-- 
-- 修复内容：
-- 1. conversations 表：添加 source, title, last_message_at 字段
-- 2. users 表：确保 pro_expires_at, pro_plan 字段存在（如果 Migration 002 未执行）
-- ============================================

-- ===== 1. conversations 表：添加缺失字段 =====

-- 1.1 添加 source 字段（来源：app/admin/script）
-- 注意：MySQL 不支持 IF NOT EXISTS，需要在脚本中检查
ALTER TABLE conversations 
  ADD COLUMN source VARCHAR(32) NULL COMMENT '来源：app/admin/script' AFTER topic;

-- 1.2 添加 title 字段（对话标题）
ALTER TABLE conversations 
  ADD COLUMN title VARCHAR(200) NULL COMMENT '对话标题' AFTER first_question;

-- 1.3 添加 last_message_at 字段（最后消息时间）
ALTER TABLE conversations 
  ADD COLUMN last_message_at DATETIME NULL COMMENT '最后消息时间' AFTER updated_at;

-- ===== 2. users 表：确保 Pro 相关字段存在 =====

-- 2.1 添加 pro_expires_at 字段（如果不存在）
ALTER TABLE users 
  ADD COLUMN pro_expires_at DATETIME NULL COMMENT 'Pro 到期时间' AFTER is_pro;

-- 2.2 添加 pro_plan 字段（如果不存在）
ALTER TABLE users 
  ADD COLUMN pro_plan ENUM('yearly', 'monthly', 'quarterly', 'lifetime') NULL COMMENT 'Pro 方案类型' AFTER pro_expires_at;

-- 2.3 添加索引（如果不存在）
CREATE INDEX idx_pro_expires_at ON users(pro_expires_at);

-- ===== 3. 验证 =====

SELECT 'Migration 043 completed: Added missing fields to conversations and users tables' AS message;