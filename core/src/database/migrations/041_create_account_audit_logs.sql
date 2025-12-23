-- 帳號審計日誌表
-- 參考文檔：app.doc/features/註銷賬號功能設計方案.md v1.1
-- 創建日期：2025-12-16

-- ===== 1. 創建審計日誌表 =====
CREATE TABLE IF NOT EXISTS account_audit_logs (
  log_id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL COMMENT '用戶 ID（即使用戶刪除也保留）',
  action ENUM(
    'DELETION_REQUEST',     -- 發起註銷申請
    'DELETION_CANCEL',      -- 撤銷註銷
    'DELETION_EXECUTED'     -- Job 執行刪除
  ) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  request_id VARCHAR(100) COMMENT '請求追蹤 ID',
  result VARCHAR(50) COMMENT '執行結果（SUCCESS/FAILED）',
  error_code VARCHAR(50) COMMENT '錯誤代碼（若失敗）',
  error_message TEXT COMMENT '錯誤訊息（若失敗）',
  ip_hash VARCHAR(64) COMMENT 'IP 哈希（不含 PII）',
  ua_hash VARCHAR(64) COMMENT 'User-Agent 哈希',
  -- Job 執行詳情（僅 DELETION_EXECUTED）
  deleted_messages_count INT COMMENT '刪除的消息數',
  deleted_conversations_count INT COMMENT '刪除的對話數',
  deleted_charts_count INT COMMENT '刪除的命盤數',
  deleted_readings_count INT COMMENT '刪除的解讀數',
  duration_ms INT COMMENT '執行耗時（毫秒）',
  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===== 2. 確認結果 =====
SELECT '✅ 041_create_account_audit_logs.sql 執行完成' AS message;

