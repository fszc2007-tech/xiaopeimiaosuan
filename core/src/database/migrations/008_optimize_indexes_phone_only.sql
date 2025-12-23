-- ============================================
-- 小佩数据库索引优化 - 完整迁移脚本（生产环境版）
-- 版本：v2.1
-- 创建日期：2025-01-XX
-- MySQL 版本要求：5.7+ / 8.0+（推荐 8.0+）
-- 
-- 执行前必须：
-- 1. 备份数据库：mysqldump -u root -p xiaopei > backup_before_008.sql
-- 2. 检查数据质量（见下方检查脚本）
-- 3. 确认应用代码已更新（不再使用 email 登录）
-- 
-- 变更内容：
-- 1. 删除 email 字段（users、verification_codes）
-- 2. phone 字段扩展为 VARCHAR(32)，支持 E.164 格式
-- 3. phone 设为唯一索引（登录凭证）
-- 4. 优化所有表索引（组合索引替代单列索引）
-- ============================================

-- ============================================
-- 前置检查：数据质量检查（执行前必须运行）
-- ============================================
-- 
-- 1. 检查是否有 phone 为 NULL 的记录
-- SELECT COUNT(*) as null_phone_count 
-- FROM users 
-- WHERE phone IS NULL;
--
-- 2. 检查是否有重复手机号
-- SELECT phone, COUNT(*) as count 
-- FROM users 
-- WHERE phone IS NOT NULL 
-- GROUP BY phone 
-- HAVING COUNT(*) > 1;
--
-- 3. 检查 HK 用户有多少只有 email 没有 phone
-- SELECT COUNT(*) as hk_email_only_count
-- FROM users 
-- WHERE app_region = 'hk' 
--   AND phone IS NULL 
--   AND email IS NOT NULL;
--
-- 4. 检查索引是否存在（可选）
-- SELECT INDEX_NAME 
-- FROM information_schema.statistics 
-- WHERE table_schema = 'xiaopei' 
--   AND table_name = 'users' 
--   AND INDEX_NAME IN ('idx_email', 'idx_phone', 'idx_app_region', 'idx_is_pro');
--

-- ============================================
-- 阶段 1：数据质量检查与准备
-- ============================================

-- 1.1 扩展 phone 字段长度（支持 E.164 格式）
ALTER TABLE users 
MODIFY COLUMN phone VARCHAR(32) NULL COMMENT '手机号（E.164格式，如+8613812345678）';

ALTER TABLE verification_codes 
MODIFY COLUMN phone VARCHAR(32) NULL COMMENT '手机号（E.164格式）';

-- ============================================
-- 阶段 2：删除 email 字段
-- ============================================
-- ⚠️ 警告：此操作不可逆，执行前必须确认应用代码已更新

-- 2.1 users 表：删除 email 相关索引和字段
ALTER TABLE users
  DROP INDEX idx_email,
  DROP COLUMN email;

-- 2.2 verification_codes 表：删除 email 相关索引和字段
ALTER TABLE verification_codes
  DROP INDEX idx_email,
  DROP COLUMN email;

-- ============================================
-- 阶段 3：优化 users 表索引（合并操作）
-- ============================================
-- ⚠️ 执行前确保 phone 无重复（先执行检查 SQL）

ALTER TABLE users
  DROP INDEX idx_phone,
  DROP INDEX idx_app_region,
  DROP INDEX idx_is_pro,
  ADD UNIQUE KEY uniq_phone (phone),
  ADD INDEX idx_region_pro (app_region, is_pro);

-- ============================================
-- 阶段 4：优化 verification_codes 表索引（合并操作）
-- ============================================

ALTER TABLE verification_codes
  DROP INDEX idx_phone,
  ADD INDEX idx_phone_verify (phone, code, is_used, expires_at),
  ADD INDEX idx_phone_created (phone, created_at);

-- ============================================
-- 阶段 5：优化其他表索引
-- ============================================

-- 5.1 chart_profiles 表（合并操作）
ALTER TABLE chart_profiles
  DROP INDEX idx_user_id,
  DROP INDEX idx_is_default,
  ADD INDEX idx_user_default (user_id, is_default);

-- 5.2 bazi_charts 表（合并操作）
ALTER TABLE bazi_charts
  DROP INDEX idx_needs_update,
  DROP INDEX idx_engine_version,
  ADD INDEX idx_needs_update_engine (needs_update, engine_version);

-- 5.3 conversations 表（合并操作）
ALTER TABLE conversations
  DROP INDEX idx_user_id,
  DROP INDEX idx_created_at,
  ADD INDEX idx_user_created (user_id, created_at);

-- 5.4 messages 表（合并操作）
ALTER TABLE messages
  DROP INDEX idx_conversation_id,
  DROP INDEX idx_created_at,
  ADD INDEX idx_conv_created (conversation_id, created_at);
-- 可选：如果存在 follow_ups 索引且不再需要，可删除
-- ALTER TABLE messages DROP INDEX idx_follow_ups;

-- 5.5 readings 表（分两步，因为需要两个不同的组合索引）
-- 5.5.1 优化用户解读记录查询（合并操作）
ALTER TABLE readings
  DROP INDEX idx_user_id,
  DROP INDEX idx_created_at,
  ADD INDEX idx_user_created (user_id, created_at);

-- 5.5.2 优化命盘场景查询（合并操作）
ALTER TABLE readings
  DROP INDEX idx_chart_id,
  DROP INDEX idx_scene,
  ADD INDEX idx_chart_scene_created (chart_id, scene, created_at);

-- 5.6 feedbacks 表（合并操作）
ALTER TABLE feedbacks
  DROP INDEX idx_user_id,
  DROP INDEX idx_created_at,
  DROP INDEX idx_status,
  ADD INDEX idx_user_created (user_id, created_at),
  ADD INDEX idx_status_created (status, created_at);

-- 5.7 rate_limits 表
-- 5.7.1 删除冗余索引（unique_user_api_date 前缀已覆盖 user_id）
ALTER TABLE rate_limits
  DROP INDEX idx_user_id;

-- 5.8 subscriptions 表（合并操作）
ALTER TABLE subscriptions
  DROP INDEX idx_user_id,
  DROP INDEX idx_status,
  DROP INDEX idx_expires_at,
  ADD INDEX idx_user_status_expire (user_id, status, expires_at),
  ADD INDEX idx_status_expire (status, expires_at);

-- 5.9 admins 表
-- 5.9.1 删除冗余索引（UNIQUE KEY 已包含索引）
ALTER TABLE admins
  DROP INDEX idx_username;

-- 5.10 shensha_readings 表（合并操作）
-- 注意：如果业务模型是「每个 (shensha_code, pillar_type) 只有一条记录」，
--      且不需要按 is_active 批量查询，可以只保留 unique_shensha_pillar
--      这里保留 idx_shensha_active 是为了支持「查询当前生效的神煞」场景
ALTER TABLE shensha_readings
  DROP INDEX idx_shensha_code,
  DROP INDEX idx_pillar_type,
  DROP INDEX idx_is_active,
  ADD INDEX idx_shensha_active (shensha_code, pillar_type, is_active);

-- ============================================
-- 完成
-- ============================================
SELECT '数据库索引优化完成！' AS message;

-- ============================================
-- 阶段 6：验证与收尾
-- ============================================

-- 6.1 验证索引创建成功
-- SHOW INDEX FROM users;
-- SHOW INDEX FROM verification_codes;
-- SHOW INDEX FROM conversations;
-- SHOW INDEX FROM messages;

-- 6.2 验证 phone 唯一约束
-- SELECT phone, COUNT(*) as count 
-- FROM users 
-- WHERE phone IS NOT NULL 
-- GROUP BY phone 
-- HAVING COUNT(*) > 1;
-- 应该返回 0 行

-- 6.3 检查表结构
-- DESCRIBE users;
-- DESCRIBE verification_codes;

-- ============================================
-- 验证查询性能（可选，使用 EXPLAIN）
-- ============================================
-- EXPLAIN SELECT * FROM users WHERE phone = '+8613812345678';
-- EXPLAIN SELECT * FROM verification_codes 
--   WHERE phone = '+8613812345678' 
--     AND code = '123456' 
--     AND is_used = 0 
--     AND expires_at > NOW();

