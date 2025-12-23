-- 插入陰差陽錯的解读内容
-- 版本：v1.0
-- 创建日期：2025-12-XX
-- 用途：补充陰差陽錯在日柱的解读（区分男女，陰差陽錯只论日柱）

-- ========== 陰差陽錯（yin_cha_yang_cuo）==========

-- 注意：陰差陽錯只论日柱，需要区分男女命

-- 陰差陽錯在日柱（男命）
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, gender, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'yin_cha_yang_cuo',
  'day',
  'male',
  '陰差陽錯',
  '情錯',
  'inauspicious',
  '感情錯位，溝通困難',
  '陰差陽錯為四柱神煞中的凶煞，主緣分不對位、溝通錯頻、時間不對。',
  JSON_ARRAY('容易在感情上同時承受「責任」與「欲望」兩邊拉扯', '與伴侶及長輩溝通時，若習慣沉默不說清楚，反而加深誤會', '學會把自己的盤算與顧慮講明白，是化解此煞的關鍵'),
  '日柱見陰差陽錯，主緣分不對位、溝通錯頻、時間不對、對的人在錯的時間。容易在感情上同時承受「責任」與「欲望」兩邊拉扯，一方面想顧全家人與現實，一方面又容易被一時心動牽引。與伴侶及長輩溝通時，若習慣沉默不說清楚，反而加深誤會。學會把自己的盤算與顧慮講明白，是化解此煞的關鍵。',
  JSON_ARRAY('陰差陽錯對我的感情有何影響？', '日柱的陰差陽錯如何影響婚姻？', '我該如何化解陰差陽錯？', '如何改善感情溝通？'),
  TRUE,
  0
);

-- 陰差陽錯在日柱（女命）
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, gender, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'yin_cha_yang_cuo',
  'day',
  'female',
  '陰差陽錯',
  '情錯',
  'inauspicious',
  '感情錯位，溝通困難',
  '陰差陽錯為四柱神煞中的凶煞，主緣分不對位、溝通錯頻、時間不對。',
  JSON_ARRAY('易在感情中投入真心卻遇到不夠成熟或不夠穩定的對象', '彼此家族、價值觀差異較大，導致婚前婚後有落差感', '學會清楚說出自己需要與底線，能大幅減少「錯愛、錯付」的機率'),
  '日柱見陰差陽錯，主緣分不對位、溝通錯頻、時間不對、對的人在錯的時間。易在感情中投入真心卻遇到不夠成熟或不夠穩定的對象，或是彼此家族、價值觀差異較大，導致婚前婚後有落差感。情緒起伏時若選擇用冷淡或試探的方式表達不滿，往往讓對方更摸不著頭緒。學會清楚說出自己需要與底線，能大幅減少「錯愛、錯付」的機率。',
  JSON_ARRAY('陰差陽錯對我的感情有何影響？', '日柱的陰差陽錯如何影響婚姻？', '我該如何化解陰差陽錯？', '如何改善感情溝通？'),
  TRUE,
  0
);


