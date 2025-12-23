-- 系统配置表迁移脚本
-- 版本：v1.0
-- 创建日期：2024-11-18
-- 用途：支持 Admin 动态配置限流、Pro 功能等系统开关

-- ===== 系统设置表 =====
CREATE TABLE IF NOT EXISTS system_settings (
  setting_key VARCHAR(100) PRIMARY KEY,
  setting_value JSON NOT NULL COMMENT '配置值（JSON 格式）',
  description VARCHAR(500) COMMENT '配置说明',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by VARCHAR(36) COMMENT '最后修改者（Admin ID）',
  INDEX idx_updated_at (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== 初始化默认配置 =====

-- 1. 限流总开关
INSERT INTO system_settings (setting_key, setting_value, description, updated_at) VALUES
  ('rate_limit_enabled', 
   JSON_OBJECT(
     'bazi_compute', true,
     'chat', true
   ),
   '限流总开关：排盘和对话限流是否启用',
   NOW()
  )
ON DUPLICATE KEY UPDATE 
  setting_value = VALUES(setting_value),
  updated_at = VALUES(updated_at);

-- 2. Pro 功能门禁
INSERT INTO system_settings (setting_key, setting_value, description, updated_at) VALUES
  ('pro_feature_gate',
   JSON_OBJECT(
     'shensha', true,
     'overview', true,
     'advanced_chat', true
   ),
   'Pro 功能门禁：各项功能是否需要 Pro 权限',
   NOW()
  )
ON DUPLICATE KEY UPDATE 
  setting_value = VALUES(setting_value),
  updated_at = VALUES(updated_at);

-- 3. 限流配置（可动态调整）
INSERT INTO system_settings (setting_key, setting_value, description, updated_at) VALUES
  ('rate_limit_config',
   JSON_OBJECT(
     'bazi_compute_daily_limit', 5,
     'bazi_compute_daily_limit_pro', 9999,
     'chat_daily_limit', 50,
     'chat_daily_limit_pro', 9999
   ),
   '限流次数配置：各 API 的每日限制次数',
   NOW()
  )
ON DUPLICATE KEY UPDATE 
  setting_value = VALUES(setting_value),
  updated_at = VALUES(updated_at);

-- ===== 完成 =====
SELECT '系统配置表创建完成！' AS message;

