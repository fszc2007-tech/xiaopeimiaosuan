-- 用户反馈表
-- 版本：v1.0
-- 创建日期：2024-12-02
-- 用途：存储用户的意见反馈（使用建议/遇到问题）

CREATE TABLE IF NOT EXISTS feedbacks (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()) COMMENT '反馈ID',
  user_id VARCHAR(36) NOT NULL COMMENT '用户ID',
  type VARCHAR(20) NOT NULL COMMENT '反馈类型：suggest=使用建议, problem=遇到问题',
  content TEXT NOT NULL COMMENT '反馈内容',
  contact VARCHAR(255) NOT NULL COMMENT '联系方式（微信号/邮箱/手机号）',
  allow_contact BOOLEAN DEFAULT TRUE COMMENT '是否允许联系',
  allow_log_upload BOOLEAN DEFAULT FALSE COMMENT '是否允许上传日志（仅问题类型）',
  status VARCHAR(20) DEFAULT 'pending' COMMENT '处理状态：pending=待处理, processing=处理中, resolved=已解决',
  admin_reply TEXT COMMENT '管理员回复',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_user_id (user_id),
  INDEX idx_type (type),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户反馈表';


