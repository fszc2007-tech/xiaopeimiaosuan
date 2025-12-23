-- 新增十惡大敗神煞解讀
-- 版本：v2.0
-- 創建日期：2025-12-03
-- 更新日期：2025-12-03
-- 用途：添加十惡大敗（只論日柱）的解讀內容
-- 注意：十惡大敗只論日柱，但為保持與太極貴人一致的數據庫結構，添加4個柱位的解讀

-- ========== 十惡大敗（shi_e_da_bai）==========
-- 說明：十惡大敗只論日柱，其他三柱不論
-- 標籤：財敗

-- 先刪除舊數據（如果存在）
DELETE FROM shensha_readings WHERE shensha_code = 'shi_e_da_bai';

-- 十惡大敗在年柱（不適用，但保留數據結構一致性）
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, gender, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'shi_e_da_bai',
  'year',
  'all',
  '十惡大敗',
  '財敗',
  'inauspicious',
  '祿神逢空亡，本錢難固守',
  '十惡大敗只論日柱，年柱不適用此神煞。',
  JSON_ARRAY('十惡大敗只論日柱', '年柱不適用此神煞', '請查看日柱解讀'),
  '十惡大敗只論日柱，年柱不適用此神煞。此神煞專指日柱逢祿神逢空亡之日，其他三柱不論。',
  JSON_ARRAY('十惡大敗對我的財運影響是什麼？', '我該如何理財才能避免財來財去？', '十惡大敗的人適合什麼類型的投資？', '如何把十惡大敗轉化為風險意識？'),
  TRUE,
  0
);

-- 十惡大敗在月柱（不適用，但保留數據結構一致性）
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, gender, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'shi_e_da_bai',
  'month',
  'all',
  '十惡大敗',
  '財敗',
  'inauspicious',
  '祿神逢空亡，本錢難固守',
  '十惡大敗只論日柱，月柱不適用此神煞。',
  JSON_ARRAY('十惡大敗只論日柱', '月柱不適用此神煞', '請查看日柱解讀'),
  '十惡大敗只論日柱，月柱不適用此神煞。此神煞專指日柱逢祿神逢空亡之日，其他三柱不論。',
  JSON_ARRAY('十惡大敗對我的財運影響是什麼？', '我該如何理財才能避免財來財去？', '十惡大敗的人適合什麼類型的投資？', '如何把十惡大敗轉化為風險意識？'),
  TRUE,
  0
);

-- 十惡大敗在日柱（唯一有效柱位）
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, gender, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'shi_e_da_bai',
  'day',
  'all',
  '十惡大敗',
  '財敗',
  'inauspicious',
  '祿神逢空亡，本錢難固守',
  '日柱逢十惡大敗，多主金錢、資源與安全感的課題需用心經營，容易財來財去，但非一定窮困。',
  JSON_ARRAY('祿神逢空亡，賺得到但留不住', '計畫多變，臨門反覆拖延', '提早培養理財觀念可化險為夷'),
  '日柱逢十惡大敗，多主祿神逢空亡，本錢難固守，一生對金錢、資源與安全感的課題，比一般人更需要用心經營。古書言其「家道中落、財來財去」，並非一定窮困，而是容易出現：賺得到、留不住，或是計畫多變、臨門幾步反覆拖延。年少時若不懂節制，易有衝動消費、投機失利、靠感覺做決定之象。若能提早培養理財觀念、保守看待高風險投資，重大選擇多做評估、少憑一時之氣，反而能把這顆煞星當成「風險提示」，在別人鬆懈處保持清醒，久而久之走出屬於自己的穩定路。',
  JSON_ARRAY('十惡大敗對我的財運影響是什麼？', '我該如何理財才能避免財來財去？', '十惡大敗的人適合什麼類型的投資？', '如何把十惡大敗轉化為風險意識？'),
  TRUE,
  0
);

-- 十惡大敗在時柱（不適用，但保留數據結構一致性）
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, gender, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'shi_e_da_bai',
  'hour',
  'all',
  '十惡大敗',
  '財敗',
  'inauspicious',
  '祿神逢空亡，本錢難固守',
  '十惡大敗只論日柱，時柱不適用此神煞。',
  JSON_ARRAY('十惡大敗只論日柱', '時柱不適用此神煞', '請查看日柱解讀'),
  '十惡大敗只論日柱，時柱不適用此神煞。此神煞專指日柱逢祿神逢空亡之日，其他三柱不論。',
  JSON_ARRAY('十惡大敗對我的財運影響是什麼？', '我該如何理財才能避免財來財去？', '十惡大敗的人適合什麼類型的投資？', '如何把十惡大敗轉化為風險意識？'),
  TRUE,
  0
);


