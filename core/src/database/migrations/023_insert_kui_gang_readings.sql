-- 插入魁罡的解读内容
-- 版本：v1.0
-- 创建日期：2025-12-XX
-- 用途：补充魁罡在四个柱位的完整解读

-- ========== 魁罡（kui_gang）==========

-- 魁罡在年柱
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, gender, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'kui_gang',
  'year',
  'all',
  '魁罡',
  '剛烈',
  'auspicious',
  '家風強硬，個性早熟',
  '魁罡為四柱神煞中的貴神，主剛烈、果決與原則。',
  JSON_ARRAY('原生家庭風格較強硬', '長輩行事果決、重原則', '個性早熟、不輕易服輸'),
  '年柱見魁罡，多主原生家庭風格較強硬，家中長輩行事果決、重原則，有時說話直接不太留情面。命主自小在較嚴格或多是非的氛圍中成長，耳濡目染之下，個性早熟、不輕易服輸，遇事習慣硬扛。若能在後天學會分辨「堅持」與「固執」的界線，既能承接家族的魄力，又不至於重蹈衝突的模式。',
  JSON_ARRAY('魁罡對我的影響是什麼？', '年柱的魁罡會如何影響我？', '我該如何善用魁罡？', '魁罡需要注意什麼？'),
  TRUE,
  0
);

-- 魁罡在月柱
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, gender, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'kui_gang',
  'month',
  'all',
  '魁罡',
  '剛烈',
  'auspicious',
  '職場果決，敢於擔責',
  '魁罡為四柱神煞中的貴神，主剛烈、果決與原則。',
  JSON_ARRAY('在工作環境中扮演「說真話、敢拍板」的角色', '做事重效率與結果，不喜拖泥帶水', '適合在需要決斷與擔責的職位發展'),
  '魁罡落月柱，常見命主在工作環境或同輩關係中扮演「說真話、敢拍板」的角色。做事重效率與結果，不喜拖泥帶水，對是非黑白有強烈判斷，適合在需要決斷與擔責的職位發展，如管理、紀律單位、風控等。若情緒起伏太大，容易與上司同事硬碰硬，被標籤為難搞；學會柔性表達與換位思考，反而更能凸顯其領導價值。',
  JSON_ARRAY('魁罡對我的職場有何幫助？', '月柱的魁罡如何影響人際？', '我適合什麼工作？', '如何將魁罡的強勢轉為領導力？'),
  TRUE,
  0
);

-- 魁罡在日柱
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, gender, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'kui_gang',
  'day',
  'all',
  '魁罡',
  '剛烈',
  'auspicious',
  '性格剛烈，敢愛敢斷',
  '魁罡為四柱神煞中的貴神，主剛烈、果決與原則。',
  JSON_ARRAY('本身性格剛烈，有自己的原則線', '對伴侶要求真誠坦白，不耐虛偽敷衍', '遇到不合適的關係，轉身利落不拖泥帶水'),
  '日柱見魁罡，代表命主本身性格剛烈，有自己的原則線，不輕易妥協。感情與婚姻中，對伴侶要求真誠坦白，不耐虛偽敷衍，寧缺毋濫。遇到不合適的關係，轉身利落不拖泥帶水。優點是敢愛敢斷、能在關鍵時刻保護自己；缺點是語氣和態度容易過猛，讓對方感到壓力。若能在堅守界線的同時，多一點溫度，感情路會順暢許多。',
  JSON_ARRAY('魁罡對我的感情有何影響？', '日柱的魁罡如何影響婚姻？', '我的伴侶會是什麼樣的人？', '如何經營好感情關係？'),
  TRUE,
  0
);

-- 魁罡在时柱
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, gender, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'kui_gang',
  'hour',
  'all',
  '魁罡',
  '剛烈',
  'auspicious',
  '晚年堅定，原則分明',
  '魁罡為四柱神煞中的貴神，主剛烈、果決與原則。',
  JSON_ARRAY('隨年歲增長，個性反而更堅定', '對人生方向、價值觀有自己一套標準', '子女或晚輩多具個性與主見'),
  '魁罡坐時柱，多應在中晚年與子女互動上。命主隨年歲增長，個性反而更堅定，不願隨波逐流，對人生方向、價值觀有自己一套標準。子女或晚輩多具個性與主見，不喜被控制，容易在理念上與命主有爭鋒之象。若能在中晚年學會放手、尊重差異，一方面保持自己的氣場與原則，一方面給晚輩空間，反而能收穫彼此欣賞與支持的關係。',
  JSON_ARRAY('魁罡對我的晚年有何影響？', '時柱的魁罡如何影響子女？', '我的晚年運勢如何？', '如何改善與子女的關係？'),
  TRUE,
  0
);


