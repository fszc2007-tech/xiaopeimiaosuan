-- 插入金輿貴人的解读内容
-- 版本：v1.0
-- 创建日期：2025-12-XX
-- 用途：补充金輿貴人在四个柱位的完整解读

-- ========== 金輿貴人（jin_yu_gui_ren）==========

-- 金輿貴人在年柱
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, gender, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'jin_yu_gui_ren',
  'year',
  'all',
  '金輿貴人',
  '福祿',
  'auspicious',
  '出身優渥，生活有質感',
  '金輿貴人為四柱神煞中的吉神，主福祿、生活品質與體面。',
  JSON_ARRAY('出身環境條件不算太差', '家中重視生活品質與體面', '長輩多疼惜命主，願意在吃穿用度上給予支持'),
  '年柱見金輿，多主出身環境條件不算太差，家中重視生活品質與體面，長輩多疼惜命主，願意在吃穿用度上給予支持。成長過程雖未必大富大貴，但多有貴人照看、不至匱乏。命主自小對「過得好、活得精緻」有基本要求，後天若肯自立打拼，更易在原有基礎上提升階層與生活享受。',
  JSON_ARRAY('金輿貴人對我的影響是什麼？', '年柱的金輿貴人會如何影響我？', '我該如何善用金輿貴人？', '金輿貴人需要注意什麼？'),
  TRUE,
  0
);

-- 金輿貴人在月柱
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, gender, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'jin_yu_gui_ren',
  'month',
  'all',
  '金輿貴人',
  '福祿',
  'auspicious',
  '職場優渥，品味出眾',
  '金輿貴人為四柱神煞中的吉神，主福祿、生活品質與體面。',
  JSON_ARRAY('工作、人際圈中容易遇到條件不錯的人', '職場環境相對不那麼辛苦', '適合在品牌、美學、服務、高端客群相關領域發展'),
  '金輿落月柱，常見命主在工作、人際圈中容易遇到條件不錯、願意提攜自己的人，職場環境相對不那麼辛苦，待遇、福利或資源相對優渥。做事有自己的一套講究，重視氛圍與禮儀，適合在品牌、美學、服務、高端客群相關領域發展。若能兼顧實幹，不只享福，也能憑實力坐上較好的位置。',
  JSON_ARRAY('金輿貴人對我的職場有何幫助？', '月柱的金輿貴人如何影響人際？', '我適合什麼工作？', '如何提升職場品味與格調？'),
  TRUE,
  0
);

-- 金輿貴人在日柱
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, gender, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'jin_yu_gui_ren',
  'day',
  'all',
  '金輿貴人',
  '福祿',
  'auspicious',
  '婚姻美滿，生活精緻',
  '金輿貴人為四柱神煞中的吉神，主福祿、生活品質與體面。',
  JSON_ARRAY('對感情與婚姻特別加分', '自己或伴侶一方條件不錯', '重視儀式感與生活品質'),
  '日柱見金輿，對感情與婚姻特別加分，多主自己或伴侶一方條件不錯，重視儀式感與生活品質，婚後居家、物質環境較為舒適。命主在親密關係中偏向溫和享受型，喜歡兩人一起吃好、住好、打扮得體。只要不過度沉迷享樂、逃避現實，這顆星往往能帶來「感情穩定＋生活有質感」的福分。',
  JSON_ARRAY('金輿貴人對我的感情有何影響？', '日柱的金輿貴人如何影響婚姻？', '我的伴侶會是什麼樣的人？', '如何經營有質感的感情生活？'),
  TRUE,
  0
);

-- 金輿貴人在时柱
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, gender, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'jin_yu_gui_ren',
  'hour',
  'all',
  '金輿貴人',
  '福祿',
  'auspicious',
  '晚年安穩，格調優雅',
  '金輿貴人為四柱神煞中的吉神，主福祿、生活品質與體面。',
  JSON_ARRAY('中晚年有機會逐漸轉向享受人生', '物質條件或居住環境比早年改善許多', '子女或晚輩多有品味、重視體面'),
  '金輿坐時柱，多應在中晚年與子女緣分上。中晚年有機會逐漸轉向享受人生，物質條件或居住環境比早年改善許多，不必再為生計過度奔波。子女或晚輩多有品味、重視體面，未來發展有機會在較好的平台或城市生活。若命主願意提早規劃財務與退休安排，晚景往往能過得安穩而不失格調。',
  JSON_ARRAY('金輿貴人對我的晚年有何影響？', '時柱的金輿貴人如何影響子女？', '我的晚年運勢如何？', '如何規劃有質感的退休生活？'),
  TRUE,
  0
);


