-- ============================================
-- Migration 044: 修复神煞解读表编码问题
-- 创建日期：2025-12-26
-- 
-- 修复内容：
-- 1. 确保 shensha_readings 表使用 utf8mb4 字符集
-- 2. 确保所有文本列使用 utf8mb4 字符集
-- 3. 重新设置连接字符集
-- ============================================

-- ===== 1. 检查并修复表字符集 =====

-- 修改表字符集（如果当前不是 utf8mb4）
ALTER TABLE shensha_readings 
  CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ===== 2. 检查并修复列字符集 =====

-- 修改文本列的字符集（如果当前不是 utf8mb4）
ALTER TABLE shensha_readings 
  MODIFY COLUMN name VARCHAR(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '神煞名称（中文）',
  MODIFY COLUMN badge_text VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '徽标文本（如 吉神、帶挑戰、桃花）',
  MODIFY COLUMN short_title VARCHAR(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '短标题（一句话概括特征）',
  MODIFY COLUMN summary TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '一句话总结（使用核心含义）',
  MODIFY COLUMN for_this_position TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '针对所在柱位的具体说明';

-- ===== 3. 验证 =====

SELECT 'Migration 044 completed: Fixed shensha_readings table encoding to utf8mb4' AS message;

