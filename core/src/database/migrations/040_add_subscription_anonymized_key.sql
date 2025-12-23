-- 訂閱匿名化：新增 anonymized_user_key 欄位
-- 參考文檔：app.doc/features/註銷賬號功能設計方案.md v1.1 第 8 節
-- 創建日期：2025-12-16

-- ===== 1. 添加匿名化欄位 =====
ALTER TABLE subscriptions
  ADD COLUMN anonymized_user_key VARCHAR(64) NULL AFTER user_id;

-- ===== 2. 創建索引 =====
-- 用於跨系統對賬
CREATE INDEX idx_subscriptions_anonymized_key ON subscriptions(anonymized_user_key);

-- ===== 3. 確認結果 =====
SELECT '✅ 040_add_subscription_anonymized_key.sql 執行完成' AS message;

