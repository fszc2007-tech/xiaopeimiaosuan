-- 為神煞解讀表添加性別字段
-- 支持紅鸞、天喜、流霞、孤辰、寡宿等神煞的男女命分開解讀

-- 1. 添加 gender 字段
ALTER TABLE shensha_readings 
ADD COLUMN gender ENUM('male', 'female', 'all') NOT NULL DEFAULT 'all' 
COMMENT '適用性別：male=男命, female=女命, all=通用'
AFTER pillar_type;

-- 2. 刪除舊的唯一索引
ALTER TABLE shensha_readings DROP INDEX unique_shensha_pillar;

-- 3. 創建新的唯一索引（包含 gender）
ALTER TABLE shensha_readings 
ADD UNIQUE KEY unique_shensha_pillar_gender (shensha_code, pillar_type, gender);

-- 4. 添加性別索引以提高查詢性能
CREATE INDEX idx_gender ON shensha_readings(gender);

