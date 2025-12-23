-- 神煞解读内容表
-- 版本：v1.0
-- 创建日期：2024-11-23
-- 用途：存储每个神煞在不同柱位的解读内容

CREATE TABLE IF NOT EXISTS shensha_readings (
  reading_id VARCHAR(36) PRIMARY KEY,
  shensha_code VARCHAR(50) NOT NULL COMMENT '神煞代码（对应 metadata.ts 中的 id）',
  pillar_type ENUM('year', 'month', 'day', 'hour') NOT NULL COMMENT '柱位类型',
  
  -- 基础信息
  name VARCHAR(50) NOT NULL COMMENT '神煞名称（中文）',
  badge_text VARCHAR(20) COMMENT '徽标文本（如 吉神、帶挑戰、桃花）',
  type ENUM('auspicious', 'inauspicious', 'neutral') NOT NULL COMMENT '神煞类型',
  
  -- 解读内容（匹配弹窗设计文档）
  short_title VARCHAR(200) COMMENT '短标题（一句话概括特征）',
  summary TEXT NOT NULL COMMENT '一句话总结（使用核心含义）',
  bullet_points JSON COMMENT '要点列表（3-4条，JSON数组）',
  for_this_position TEXT NOT NULL COMMENT '针对所在柱位的具体说明',
  recommended_questions JSON COMMENT '推荐提问池（3-4个问题，JSON数组）',
  
  -- 元数据
  is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
  sort_order INT DEFAULT 0 COMMENT '排序（同神煞不同柱位）',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- 索引
  UNIQUE KEY unique_shensha_pillar (shensha_code, pillar_type),
  INDEX idx_shensha_code (shensha_code),
  INDEX idx_pillar_type (pillar_type),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;





