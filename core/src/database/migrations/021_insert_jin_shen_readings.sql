-- 插入金神的解读内容
-- 版本：v1.0
-- 创建日期：2025-12-XX
-- 用途：补充金神在四个柱位的完整解读

-- ========== 金神（jin_shen）==========

-- 金神在年柱
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, gender, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'jin_shen',
  'year',
  'all',
  '金神',
  '權勢',
  'auspicious',
  '家風嚴格，性格剛毅',
  '金神為四柱神煞中的貴神，主剛毅、果斷與權勢。',
  JSON_ARRAY('成長環境較嚴格、家風重紀律', '長輩多性格強勢，不善溫柔示愛', '自小學會硬撐、不服輸'),
  '年柱見金神，象徵成長環境較嚴格、家風重紀律。長輩多性格強勢，不善溫柔示愛，更多以要求、規範、責任來塑造命主，使其自小學會硬撐、不服輸。內心其實敏感，但習慣用強硬表層保護自己。若能在後天調整情緒表達方式，柔中帶剛，往往更能獲得他人信任與尊重。',
  JSON_ARRAY('金神對我的影響是什麼？', '年柱的金神會如何影響我？', '我該如何善用金神？', '金神需要注意什麼？'),
  TRUE,
  0
);

-- 金神在月柱
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, gender, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'jin_shen',
  'month',
  'all',
  '金神',
  '權勢',
  'auspicious',
  '職場果斷，競爭激烈',
  '金神為四柱神煞中的貴神，主剛毅、果斷與權勢。',
  JSON_ARRAY('成長與職場環境競爭激烈', '做事重結果不喜拖泥帶水', '容易成為團隊中負責衝鋒和拍板的人'),
  '金神落月柱，多主成長與職場環境競爭激烈，需要效率、膽識與果斷。命主在人際中偏理性與直接，做事重結果不喜拖泥帶水，容易成為團隊中負責衝鋒和拍板的人。若火旺能鍛金，其強勢可轉為威信；若水重則易與上司同事硬碰硬。練習收放分寸，會讓職場道路更加順遂。',
  JSON_ARRAY('金神對我的職場有何幫助？', '月柱的金神如何影響人際？', '我適合什麼工作？', '金神的強勢如何轉為威信？'),
  TRUE,
  0
);

-- 金神在日柱
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, gender, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'jin_shen',
  'day',
  'all',
  '金神',
  '權勢',
  'auspicious',
  '本質剛毅，外冷內熱',
  '金神為四柱神煞中的貴神，主剛毅、果斷與權勢。',
  JSON_ARRAY('本質剛毅，不願委屈自己', '感情中多呈現外冷內熱', '對承諾極為重視'),
  '日柱見金神，代表命主本質剛毅，不願委屈自己，對是非界線分明。感情中多呈現外冷內熱，不善甜言蜜語，但對承諾極為重視。性格帶鋒芒，選擇伴侶時容易希望對方能理解自己的原則感與責任感。若能在關係中適度展現柔軟，將讓伴侶更容易走進其內心，減少衝突與誤會。',
  JSON_ARRAY('金神對我的感情有何影響？', '日柱的金神如何影響婚姻？', '我的伴侶會是什麼樣的人？', '如何經營好感情關係？'),
  TRUE,
  0
);

-- 金神在时柱
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, gender, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'jin_shen',
  'hour',
  'all',
  '金神',
  '權勢',
  'auspicious',
  '晚年堅定，越老越強',
  '金神為四柱神煞中的貴神，主剛毅、果斷與權勢。',
  JSON_ARRAY('中晚年思維愈發堅定，行事果斷', '子女多有自己的主見，獨立自主', '表面冷、實則在意，只是不擅表達'),
  '金神坐時柱，多應於晚年運勢與子女互動。命主中晚年思維愈發堅定，行事果斷，有「越老越強」的氣場。子女多有自己的主見，獨立自主但少撒嬌。表面冷、實則在意，只是不擅表達。若能主動開放溝通方式，晚年反而能收獲穩定信任與家人依靠，減少剛硬帶來的距離感。',
  JSON_ARRAY('金神對我的晚年有何影響？', '時柱的金神如何影響子女？', '我的晚年運勢如何？', '如何改善與子女的溝通？'),
  TRUE,
  0
);


