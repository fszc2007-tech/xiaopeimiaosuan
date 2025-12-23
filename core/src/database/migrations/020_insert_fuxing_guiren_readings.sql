-- 插入福星贵人的解读内容
-- 版本：v1.0
-- 创建日期：2025-12-XX
-- 用途：补充福星贵人在四个柱位的完整解读

-- ========== 福星贵人（fu_xing_gui_ren）==========

-- 福星贵人在年柱
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, gender, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'fu_xing_gui_ren',
  'year',
  'all',
  '福星贵人',
  '福氣',
  'auspicious',
  '祖蔭庇護，長輩照拂',
  '福星貴人為四柱神煞中的吉神，主福氣、貴人相助與順遂。',
  JSON_ARRAY('多得長輩庇蔭，早年有福', '家人願意付出資源與時間', '容易遇到賞識自己的師長或前輩'),
  '年柱見福星貴人，多主出身環境尚有福澤，長輩願意承擔與照顧，關鍵時刻不致全然無助。家人雖未必大富大貴，但多肯為命主付出資源與時間。命主早年較容易遇到賞識自己的師長或前輩，讀書、求學、出社會時常有人指路牽線。若能保持謙遜與感恩，這份祖蔭與長輩緣會在後運持續發酵。',
  JSON_ARRAY('福星貴人對我的影響是什麼？', '年柱的福星貴人會如何影響我？', '我該如何善用福星貴人？', '福星貴人需要注意什麼？'),
  TRUE,
  0
);

-- 福星贵人在月柱
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, gender, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'fu_xing_gui_ren',
  'month',
  'all',
  '福星贵人',
  '福氣',
  'auspicious',
  '職場順遂，貴人扶持',
  '福星貴人為四柱神煞中的吉神，主福氣、貴人相助與順遂。',
  JSON_ARRAY('生活比較順遂自在', '人際、工作環境多有照應', '容易遇到願意扶持的同儕、上司或前輩'),
  '福星落月柱，象徵在成長環境與工作職場中，容易遇到願意扶持的同儕、上司或前輩。命主在團隊裡多半不會被刻意排擠，遇到制度變動或部門調整時，也較有機會被留在相對穩當的位置。做事態度若能穩重可靠，貴人更願意為其說話、推薦資源。學會適度表達感謝與配合，他人會更樂於成為命主的助力而非過客。',
  JSON_ARRAY('福星貴人對我的職場有何幫助？', '月柱的福星貴人如何影響人際？', '我適合什麼工作？', '福星貴人的貴人何時出現？'),
  TRUE,
  0
);

-- 福星贵人在日柱
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, gender, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'fu_xing_gui_ren',
  'day',
  'all',
  '福星贵人',
  '福氣',
  'auspicious',
  '本人福氣，婚姻和諧',
  '福星貴人為四柱神煞中的吉神，主福氣、貴人相助與順遂。',
  JSON_ARRAY('本人帶福氣，遇事常有轉機', '性格溫厚親和，容易讓人願意幫忙', '較易遇到能扶持自己的伴侶'),
  '日柱見福星貴人，多主本人帶福氣，遇事常有轉機，不容易陷入絕境。性格多半不算尖刻，與人相處帶幾分溫厚或親和，容易讓人願意幫忙。於感情與婚姻而言，較易遇到在物質或精神上能扶持自己的伴侶，關鍵時刻願意站在自己這一邊。若能主動培養信任與溝通，不僅能減少情感中的孤立感，也能讓這顆吉星的庇佑更加穩固。',
  JSON_ARRAY('福星貴人對我的感情有何影響？', '日柱的福星貴人如何影響婚姻？', '我的伴侶會是什麼樣的人？', '如何經營好婚姻關係？'),
  TRUE,
  0
);

-- 福星贵人在时柱
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, gender, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'fu_xing_gui_ren',
  'hour',
  'all',
  '福星贵人',
  '福氣',
  'auspicious',
  '晚年福厚，子女孝順',
  '福星貴人為四柱神煞中的吉神，主福氣、貴人相助與順遂。',
  JSON_ARRAY('中晚年運勢與子女、後輩緣分相關', '子女或晚輩多有善心或能力', '中晚年仍有機會遇到新的貴人或發展機會'),
  '福星坐時柱，多與中晚年運勢與子女、後輩緣分相關。命主在人生下半場仍有機會遇到新的貴人或發展機會，不至於「少年得志、晚景清冷」。子女或晚輩多有善心或能力，雖各有生活節奏，但在命主需要時常願意伸出援手。若能在平日主動維繫親情與人脈，中晚年不僅物質生活較安穩，精神上也較能感受到陪伴與支持。',
  JSON_ARRAY('福星貴人對我的晚年有何影響？', '時柱的福星貴人如何影響子女？', '我的晚年運勢如何？', '如何維繫晚年人脈？'),
  TRUE,
  0
);


