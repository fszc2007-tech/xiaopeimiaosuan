-- ==========================================
-- H5 版本用戶名登錄支持
-- 
-- 新增字段，向下兼容現有 App 用戶
-- ==========================================

-- 1. 新增字段
ALTER TABLE users
  ADD COLUMN username VARCHAR(64) NULL COMMENT '用戶名',
  ADD COLUMN password_hash VARCHAR(255) NULL COMMENT '密碼哈希（bcrypt）',
  ADD COLUMN password_set BOOLEAN NOT NULL DEFAULT FALSE COMMENT '是否已設置密碼';

-- 2. 唯一索引（用戶名必須唯一）
CREATE UNIQUE INDEX idx_users_username_unique 
  ON users (username) 
  WHERE username IS NOT NULL;

-- 3. 查詢索引（優化登錄查詢）
CREATE INDEX idx_users_username_lookup 
  ON users (username);

-- ==========================================
-- 兼容性說明：
-- 1. 現有 App 用戶：phone/email 有值，username/password_hash 為 NULL
-- 2. H5 用戶名登錄：username/password_hash 有值，phone/email 可為 NULL
-- 3. 未來完整版：phone/email/username/password_hash 都有值（綁定手機號）
-- ==========================================

-- ==========================================
-- 回滾腳本（如需回滾）：
-- DROP INDEX idx_users_username_unique ON users;
-- DROP INDEX idx_users_username_lookup ON users;
-- ALTER TABLE users
--   DROP COLUMN username,
--   DROP COLUMN password_hash,
--   DROP COLUMN password_set;
-- ==========================================


