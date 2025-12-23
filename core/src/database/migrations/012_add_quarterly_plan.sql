/**
 * Migration 012: 添加 quarterly 订阅方案支持
 * 
 * 修改内容：
 * 1. subscriptions 表的 plan 字段增加 'quarterly' 选项
 * 2. users 表的 pro_plan 字段增加 'quarterly' 选项
 * 
 * 运行方式：
 * mysql -u root -p xiaopei < core/src/database/migrations/012_add_quarterly_plan.sql
 */

-- 1. 修改 subscriptions 表的 plan 字段
ALTER TABLE subscriptions 
  MODIFY COLUMN plan ENUM('yearly', 'monthly', 'quarterly', 'lifetime') NOT NULL COMMENT '订阅方案';

-- 2. 修改 users 表的 pro_plan 字段
ALTER TABLE users 
  MODIFY COLUMN pro_plan ENUM('yearly', 'monthly', 'quarterly', 'lifetime') NULL COMMENT 'Pro 方案类型';

-- 验证修改
SELECT 'Migration 012 completed: quarterly plan added to subscriptions and users tables' AS message;


