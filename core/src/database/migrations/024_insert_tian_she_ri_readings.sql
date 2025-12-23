-- 插入天赦日的解读内容
-- 版本：v1.0
-- 创建日期：2025-12-XX
-- 用途：补充天赦日在日柱的解读（天赦日只论日柱，其他柱位不设专门文案）

-- ========== 天赦日（tian_she_ri）==========

-- 注意：天赦日只论日柱，年柱、月柱、时柱不设专门文案
-- 只插入日柱的解读内容

-- 天赦日在日柱
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, gender, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'tian_she_ri',
  'day',
  'all',
  '天赦日',
  '赦罪',
  'auspicious',
  '天恩護佑，逢凶化吉',
  '天赦日為四柱神煞中的吉日，主天恩護佑、逢凶化吉、解厄赦罪。',
  JSON_ARRAY('一生多受天恩護佑', '遇事雖有波折，往往關鍵時刻能逢凶化吉', '內心多具慈悲與反省力'),
  '日柱逢天赦日，主一生多受天恩護佑，遇事雖有波折，往往關鍵時刻能逢凶化吉、轉危為安。命主內心多具慈悲與反省力，對是非善惡有自覺，遇錯能改，故易得貴人寬待與機會重來。此星不代表「不會出事」，而是即使跌落低谷，也有較強的復原與翻身能力；若命局煞氣較重，天赦常扮演「緩衝與解厄」的角色，能減輕災難程度。',
  JSON_ARRAY('天赦日對我的影響是什麼？', '日柱的天赦日會如何保護我？', '我該如何善用天赦日？', '天赦日需要注意什麼？'),
  TRUE,
  0
);


