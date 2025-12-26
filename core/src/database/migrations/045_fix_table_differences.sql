-- ============================================
-- Migration 045: 修复开发和生产环境表结构差异
-- 创建日期：2025-12-26
-- 
-- 修复内容：
-- 1. conversations 表：修复 title 和 source 字段类型
-- 2. users 表：添加缺失的字段
-- 3. day_stem_readings 表：修复 stem 字段类型
-- ============================================

-- ===== 1. conversations 表：修复字段类型 =====

-- 1.1 修复 title 字段类型（varchar(200) -> varchar(255)）
ALTER TABLE conversations 
  MODIFY COLUMN title VARCHAR(255) NULL;

-- 1.2 修复 source 字段类型（varchar(32) -> varchar(50)）
ALTER TABLE conversations 
  MODIFY COLUMN source VARCHAR(50) NULL;

-- ===== 2. users 表：添加缺失的字段 =====

-- 2.1 添加 username 字段
ALTER TABLE users 
  ADD COLUMN username VARCHAR(64) NULL UNIQUE COMMENT '用户名' AFTER updated_at;

-- 2.2 添加 password_set 字段
ALTER TABLE users 
  ADD COLUMN password_set TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否设置密码' AFTER username;

-- 2.3 添加 invite_code 字段
ALTER TABLE users 
  ADD COLUMN invite_code VARCHAR(20) NULL COMMENT '邀请码' AFTER password_set;

-- 2.4 添加 invited_by 字段
ALTER TABLE users 
  ADD COLUMN invited_by VARCHAR(36) NULL COMMENT '邀请人ID' AFTER invite_code;

-- 2.5 添加 last_login_at 字段
ALTER TABLE users 
  ADD COLUMN last_login_at DATETIME NULL COMMENT '最后登录时间' AFTER invited_by;

-- 2.6 添加 avatar_url 字段
ALTER TABLE users 
  ADD COLUMN avatar_url VARCHAR(255) NULL COMMENT '头像URL' AFTER last_login_at;

-- ===== 3. day_stem_readings 表：修复字段类型 =====

-- 3.1 修复 stem 字段类型（varchar(2) -> varchar(10)）
ALTER TABLE day_stem_readings 
  MODIFY COLUMN stem VARCHAR(10) NOT NULL;

-- ===== 4. 验证 =====

SELECT 'Migration 045 completed: Fixed table structure differences between dev and prod' AS message;

