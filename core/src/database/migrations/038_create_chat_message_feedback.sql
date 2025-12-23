-- 聊天消息反馈表
-- 版本：v1.0
-- 创建日期：2024-12-XX
-- 说明：用于存储用户对助手消息的点赞/点踩反馈

CREATE TABLE IF NOT EXISTS chat_message_feedback (
  feedback_id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  conversation_id VARCHAR(36) NOT NULL,
  message_id VARCHAR(36) NOT NULL,
  rating ENUM('up', 'down') NOT NULL,
  reasons JSON NOT NULL DEFAULT (JSON_ARRAY()) COMMENT '点踩原因列表，默认为空数组',
  comment VARCHAR(500) NULL COMMENT '用户自由文字备注',
  model VARCHAR(64) NULL COMMENT '当前使用的大模型标识',
  app_version VARCHAR(32) NULL COMMENT 'App版本号',
  device_info VARCHAR(128) NULL COMMENT '设备信息',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- 唯一约束：一个用户对一条消息最多一条反馈（防止重复提交）
  UNIQUE KEY uk_user_message (user_id, message_id),
  
  -- 索引
  INDEX idx_user_created_at (user_id, created_at),
  INDEX idx_rating_created_at (rating, created_at),
  INDEX idx_message_id (message_id),
  INDEX idx_conversation_id (conversation_id)
  
  -- 注意：不建外键约束，避免高并发时锁太重
  -- 只建索引，保证查询性能
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


