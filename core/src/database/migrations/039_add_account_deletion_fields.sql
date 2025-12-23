-- 註銷賬號功能：新增 users 表欄位
-- 參考文檔：app.doc/features/註銷賬號功能設計方案.md v1.1
-- 創建日期：2025-12-16

-- ===== 1. 添加帳號狀態相關欄位 =====
ALTER TABLE users
  ADD COLUMN status ENUM('ACTIVE', 'PENDING_DELETE', 'DELETED') 
    NOT NULL DEFAULT 'ACTIVE' AFTER app_region,
  ADD COLUMN delete_requested_at TIMESTAMP NULL AFTER status,
  ADD COLUMN delete_scheduled_at TIMESTAMP NULL AFTER delete_requested_at,
  ADD COLUMN deleted_at TIMESTAMP NULL AFTER delete_scheduled_at,
  ADD COLUMN token_version INT NOT NULL DEFAULT 0 AFTER deleted_at;

-- ===== 2. 創建索引 =====
-- 用於 Job 掃描待刪除帳號
CREATE INDEX idx_users_delete_due ON users(status, delete_scheduled_at);

-- 用於查詢特定狀態的用戶
CREATE INDEX idx_users_status ON users(status);

-- ===== 3. 確認結果 =====
SELECT '✅ 039_add_account_deletion_fields.sql 執行完成' AS message;

