-- 小佩命理数据库初始化脚本
-- 版本：v1.1（新增 subscriptions 表）
-- 创建日期：2024-11-18
-- 最后更新：2024-11-18

-- ===== 1. 用户表 =====
CREATE TABLE IF NOT EXISTS users (
  user_id VARCHAR(36) PRIMARY KEY,
  nickname VARCHAR(50),
  phone VARCHAR(20),
  email VARCHAR(100),
  password_hash VARCHAR(255),
  avatar VARCHAR(255),
  app_region ENUM('cn', 'hk') NOT NULL DEFAULT 'cn',
  is_pro BOOLEAN DEFAULT FALSE,
  pro_expire_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_phone (phone),
  INDEX idx_email (email),
  INDEX idx_app_region (app_region),
  INDEX idx_is_pro (is_pro)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== 2. 验证码表 =====
CREATE TABLE IF NOT EXISTS verification_codes (
  code_id VARCHAR(36) PRIMARY KEY,
  phone VARCHAR(20),
  email VARCHAR(100),
  code VARCHAR(10) NOT NULL,
  code_type ENUM('login', 'register', 'reset_password') NOT NULL,
  expires_at DATETIME NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_phone (phone),
  INDEX idx_email (email),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== 3. 命盘档案表 =====
CREATE TABLE IF NOT EXISTS chart_profiles (
  chart_profile_id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  name VARCHAR(50) NOT NULL,
  relation_type VARCHAR(20) NOT NULL,
  gender ENUM('male', 'female') NOT NULL,
  gregorian_birth DATE NOT NULL,
  birth_time TIME NOT NULL,
  birth_place VARCHAR(100),
  timezone VARCHAR(50),
  is_default BOOLEAN DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_is_default (is_default)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== 4. 八字结果表 =====
CREATE TABLE IF NOT EXISTS bazi_charts (
  chart_id VARCHAR(36) PRIMARY KEY,
  chart_profile_id VARCHAR(36) NOT NULL,
  result_json LONGTEXT NOT NULL COMMENT '完整八字结果（400+字段）',
  engine_version VARCHAR(10) NOT NULL,
  needs_update BOOLEAN DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (chart_profile_id) REFERENCES chart_profiles(chart_profile_id) ON DELETE CASCADE,
  INDEX idx_chart_profile_id (chart_profile_id),
  INDEX idx_engine_version (engine_version),
  INDEX idx_needs_update (needs_update)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== 5. 对话表 =====
CREATE TABLE IF NOT EXISTS conversations (
  conversation_id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  chart_profile_id VARCHAR(36),
  topic VARCHAR(50),
  first_question TEXT,
  last_message_preview TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (chart_profile_id) REFERENCES chart_profiles(chart_profile_id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_chart_profile_id (chart_profile_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== 6. 消息表 =====
CREATE TABLE IF NOT EXISTS messages (
  message_id VARCHAR(36) PRIMARY KEY,
  conversation_id VARCHAR(36) NOT NULL,
  role ENUM('user', 'assistant') NOT NULL,
  content TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(conversation_id) ON DELETE CASCADE,
  INDEX idx_conversation_id (conversation_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== 7. 解读记录表 =====
CREATE TABLE IF NOT EXISTS readings (
  reading_id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  chart_id VARCHAR(36),
  scene VARCHAR(50) NOT NULL,
  question TEXT,
  result_text TEXT,
  result_json JSON,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (chart_id) REFERENCES bazi_charts(chart_id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_chart_id (chart_id),
  INDEX idx_scene (scene),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== 8. 用户设置表 =====
CREATE TABLE IF NOT EXISTS user_settings (
  setting_id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL UNIQUE,
  language VARCHAR(10) DEFAULT 'zh-CN',
  notification_enabled BOOLEAN DEFAULT TRUE,
  settings_json JSON COMMENT '其他设置（JSON格式）',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== 9. 反馈表 =====
CREATE TABLE IF NOT EXISTS feedbacks (
  feedback_id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36),
  type VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  contact_info VARCHAR(100),
  images_json JSON,
  status ENUM('pending', 'processing', 'resolved') DEFAULT 'pending',
  admin_reply TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== 10. 限流表 =====
CREATE TABLE IF NOT EXISTS rate_limits (
  limit_id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  api_type VARCHAR(50) NOT NULL COMMENT 'API类型（如 bazi_compute）',
  date DATE NOT NULL,
  count INT DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_api_date (user_id, api_type, date),
  INDEX idx_user_id (user_id),
  INDEX idx_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== 11. LLM API 配置表 =====
CREATE TABLE IF NOT EXISTS llm_api_configs (
  config_id VARCHAR(36) PRIMARY KEY,
  model VARCHAR(50) NOT NULL UNIQUE COMMENT '模型名称（deepseek/chatgpt/qwen）',
  api_key_encrypted TEXT COMMENT 'API Key（加密存储）',
  api_url VARCHAR(255) NOT NULL,
  is_enabled BOOLEAN DEFAULT TRUE,
  thinking_mode BOOLEAN DEFAULT FALSE COMMENT 'DeepSeek专用：是否启用思考模式',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== 12. 管理员表 =====
CREATE TABLE IF NOT EXISTS admins (
  admin_id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(100),
  role VARCHAR(20) DEFAULT 'admin',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== 13. Pro 订阅表 =====
CREATE TABLE IF NOT EXISTS subscriptions (
  subscription_id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  plan ENUM('yearly', 'monthly', 'lifetime') NOT NULL,
  status ENUM('active', 'canceled', 'expired') NOT NULL DEFAULT 'active',
  started_at DATETIME NOT NULL,
  expires_at DATETIME COMMENT '永久会员为NULL',
  external_order_id VARCHAR(100) COMMENT '外部订单号',
  payment_provider ENUM('none', 'apple', 'google', 'stripe') DEFAULT 'none',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== 初始化默认数据 =====

-- 插入默认 LLM 配置（API Key 需要后续通过 Admin 后台配置）
INSERT INTO llm_api_configs (config_id, model, api_url, is_enabled) VALUES
  (UUID(), 'deepseek', 'https://api.deepseek.com', TRUE),
  (UUID(), 'chatgpt', 'https://api.openai.com/v1', TRUE),
  (UUID(), 'qwen', 'https://dashscope.aliyuncs.com', TRUE)
ON DUPLICATE KEY UPDATE 
  api_url = VALUES(api_url),
  is_enabled = VALUES(is_enabled);

-- 插入默认管理员账号（密码：admin123，需要修改）
-- 密码 hash 是 bcrypt('admin123')
INSERT INTO admins (admin_id, username, password_hash, email, role) VALUES
  (UUID(), 'admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin@xiaopei.com', 'super_admin')
ON DUPLICATE KEY UPDATE 
  username = VALUES(username);

-- ===== 完成 =====
SELECT '数据库初始化完成！共 13 张表' AS message;

