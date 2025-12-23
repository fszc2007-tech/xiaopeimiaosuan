-- 创建第三方登录身份表（auth_identities）
-- 用于支持 Google / Apple 等第三方登录
-- 参考文档：Google一键登录设计方案-v1.1-可执行版.md

CREATE TABLE IF NOT EXISTS auth_identities (
  identity_id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  provider VARCHAR(32) NOT NULL,  -- 'google', 'apple', 'wechat', 'alipay'
  provider_user_id VARCHAR(255) NOT NULL,  -- 第三方平台的用户唯一标识（Google 的 sub）
  email VARCHAR(255),  -- 第三方平台的邮箱
  name VARCHAR(255),  -- 第三方平台的用户名
  avatar_url TEXT,  -- 第三方平台的头像 URL
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- 外键约束
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  
  -- 唯一约束：同一个第三方平台的用户只能绑定一次
  UNIQUE KEY unique_provider_user (provider, provider_user_id),
  
  -- 索引
  INDEX idx_user_id (user_id),
  INDEX idx_provider (provider),
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='第三方登录身份表';

