-- 命主档案表迁移脚本
-- 版本：v1.0
-- 创建日期：2024-11-18
-- 用途：存储命主档案管理信息（关系、备注、当前命主等）

-- ===== 命主档案表 =====
CREATE TABLE IF NOT EXISTS chart_profiles (
  profile_id VARCHAR(36) PRIMARY KEY COMMENT '档案 ID',
  user_id VARCHAR(36) NOT NULL COMMENT '用户 ID',
  chart_id VARCHAR(36) NOT NULL COMMENT '命盘 ID（指向 bazi_charts）',
  
  -- 档案基本信息
  name VARCHAR(100) NOT NULL COMMENT '命主姓名/昵称',
  relation_type ENUM('self', 'partner', 'parent', 'child', 'friend', 'other') NOT NULL COMMENT '关系类型',
  relation_label VARCHAR(50) COMMENT '关系标签（如：妈妈、老公）',
  
  -- 状态标识
  is_current BOOLEAN DEFAULT FALSE COMMENT '是否为当前命主',
  is_self BOOLEAN DEFAULT FALSE COMMENT '是否为本人',
  
  -- 档案元数据
  notes TEXT COMMENT '备注信息',
  avatar_url VARCHAR(500) COMMENT '头像 URL（预留）',
  
  -- 时间戳
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  last_viewed_at DATETIME COMMENT '最后查看时间',
  
  -- 外键约束
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (chart_id) REFERENCES bazi_charts(chart_id) ON DELETE CASCADE,
  
  -- 索引
  INDEX idx_user_id (user_id),
  INDEX idx_chart_id (chart_id),
  INDEX idx_current (user_id, is_current),
  INDEX idx_last_viewed (user_id, last_viewed_at),
  
  -- 唯一约束：一个用户只能有一个当前命主
  UNIQUE KEY uk_user_current (user_id, is_current)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='命主档案表';

-- ===== 初始化说明 =====
-- 1. 每次排盘后，需要同时在 bazi_charts 和 chart_profiles 表插入数据
-- 2. 一个 bazi_chart 对应一个 chart_profile（一对一关系）
-- 3. 用户可以有多个命盘档案，但只能有一个当前命主（is_current = TRUE）
-- 4. 当设置新的当前命主时，需要先将该用户的其他档案的 is_current 设为 FALSE

-- ===== 完成 =====
SELECT '命主档案表创建完成！' AS message;

