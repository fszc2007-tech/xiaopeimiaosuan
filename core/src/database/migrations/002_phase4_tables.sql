/**
 * Phase 4 数据库迁移脚本
 * 
 * 包含：
 * 1. admin_users 表（Admin 用户）
 * 2. subscriptions 表（订阅记录）
 * 3. users 表增加 Pro 相关字段
 * 
 * 运行：
 * mysql -u root -p xiaopei < core/src/database/migrations/002_phase4_tables.sql
 */

-- ===== 1. Admin 用户表 =====

CREATE TABLE IF NOT EXISTS admin_users (
  admin_id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL COMMENT '管理员用户名',
  password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希（bcrypt/argon2）',
  email VARCHAR(255) COMMENT '管理员邮箱',
  role ENUM('super_admin', 'admin') DEFAULT 'admin' COMMENT '角色：超级管理员/普通管理员',
  is_active BOOLEAN DEFAULT TRUE COMMENT '是否激活',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login_at DATETIME COMMENT '最后登录时间',
  INDEX idx_username (username),
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Admin 用户表';

-- ===== 2. 订阅记录表 =====

CREATE TABLE IF NOT EXISTS subscriptions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(36) NOT NULL COMMENT '用户ID（外键 users.user_id）',
  plan ENUM('yearly', 'monthly', 'lifetime') NOT NULL COMMENT '订阅方案',
  status ENUM('active', 'canceled', 'expired') NOT NULL DEFAULT 'active' COMMENT '订阅状态',
  started_at DATETIME NOT NULL COMMENT '订阅开始时间',
  expires_at DATETIME COMMENT '订阅到期时间（lifetime 为 NULL）',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  external_order_id VARCHAR(100) COMMENT '外部订单ID（支付平台）',
  payment_provider ENUM('none', 'apple', 'google', 'stripe') DEFAULT 'none' COMMENT '支付提供商',
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_plan (plan),
  INDEX idx_expires_at (expires_at),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订阅记录表';

-- ===== 3. users 表增加 Pro 相关字段 =====

-- 检查字段是否存在，避免重复添加
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS is_pro BOOLEAN DEFAULT FALSE COMMENT '是否 Pro 用户',
  ADD COLUMN IF NOT EXISTS pro_expires_at DATETIME NULL COMMENT 'Pro 到期时间',
  ADD COLUMN IF NOT EXISTS pro_plan ENUM('yearly', 'monthly', 'lifetime') NULL COMMENT 'Pro 方案类型';

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_is_pro ON users(is_pro);
CREATE INDEX IF NOT EXISTS idx_pro_expires_at ON users(pro_expires_at);

-- ===== 4. 创建默认 Admin 用户（可选）=====

-- 注意：密码需要使用 bcrypt 哈希后再插入
-- 以下仅为示例，实际部署时应由运维脚本执行

-- 示例：创建一个测试 super_admin
-- 密码：Admin@2024（实际使用时请替换为真实哈希值）
-- INSERT INTO admin_users (admin_id, username, password_hash, email, role, is_active)
-- VALUES (
--   UUID(),
--   'admin',
--   '$2b$10$...',  -- 使用 bcrypt 生成的哈希
--   'admin@xiaopei.com',
--   'super_admin',
--   TRUE
-- );

-- ===== 5. 数据一致性检查 =====

-- 确保所有 Pro 用户都有 pro_plan
UPDATE users 
SET pro_plan = 'yearly' 
WHERE is_pro = TRUE AND pro_plan IS NULL;

-- ===== 迁移完成 =====

SELECT 'Phase 4 数据库迁移完成！' AS message;

