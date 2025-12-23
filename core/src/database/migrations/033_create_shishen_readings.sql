-- 十神解读内容表
-- 版本：v1.0
-- 创建日期：2025-01-XX
-- 用途：存储每个十神在不同柱位的解读内容

CREATE TABLE IF NOT EXISTS shishen_readings (
  reading_id VARCHAR(36) PRIMARY KEY,
  shishen_code VARCHAR(50) NOT NULL COMMENT '十神代码（如 bi_jian, jie_cai）',
  pillar_type ENUM('year', 'month', 'day', 'hour') NOT NULL COMMENT '柱位类型',
  
  -- 基础信息
  name VARCHAR(50) NOT NULL COMMENT '十神名称（中文，如 比肩、劫财）',
  badge_text VARCHAR(20) COMMENT '徽标文本（如 自我・同輩、競爭・突破）',
  type ENUM('auspicious', 'inauspicious', 'neutral') NOT NULL COMMENT '十神类型',
  
  -- 解读内容
  short_title VARCHAR(200) COMMENT '短标题（一句话概括特征）',
  for_this_position TEXT NOT NULL COMMENT '针对所在柱位的具体说明（用户提供的完整解读）',
  recommended_questions JSON COMMENT '推荐提问池（3-4个问题，JSON数组）',
  
  -- 元数据
  gender ENUM('male', 'female', 'all') NOT NULL DEFAULT 'all' COMMENT '適用性別：male=男命, female=女命, all=通用',
  is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
  sort_order INT DEFAULT 0 COMMENT '排序（同十神不同柱位）',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- 索引
  UNIQUE KEY unique_shishen_pillar_gender (shishen_code, pillar_type, gender),
  INDEX idx_shishen_code (shishen_code),
  INDEX idx_pillar_type (pillar_type),
  INDEX idx_gender (gender),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


