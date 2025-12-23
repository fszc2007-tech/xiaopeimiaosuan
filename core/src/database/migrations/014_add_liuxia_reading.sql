-- 补充流霞神煞解读
-- 版本：v1.2
-- 创建日期：2025-12-03
-- 用途：补充流霞的解读内容（不区分柱位，4个柱位内容相同）

-- ========== 流霞（liu_xia）==========
-- 说明：流霞不区分柱位，所有柱位解读内容相同

-- 流霞在年柱
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'liu_xia',
  'year',
  '流霞',
  '情動',
  'neutral',
  '感性豐富，情緒起伏大',
  '主感性與情緒，易因情生喜憂，對感情特別投入，需學會節制欲望與保持分寸。',
  JSON_ARRAY('感性豐富情緒起伏大，對感情特別投入', '做事偏衝動愛憑感覺，需留意酒色與分寸', '學會節制後能成為懂人心有魅力之人'),
  '命帶流霞，多主感性豐富、情緒起伏較大，對感情特別投入，易因情生喜，亦易因情生憂。做事有時偏衝動，愛憑感覺走，不太願意被約束，在戀愛、人際、聚會、出行應酬上，要留意酒色、分心或逞一時之快，而招致小傷小痛、破財或口舌是非。若能學會節制欲望、保持清醒與分寸，把這股敏感與熱情用在創作、表達與真誠交流上，反而能成為擅懂人心、兼具魅力與同理心的一類人。',
  JSON_ARRAY('流霞對我的影響是什麼？', '我該如何控制情緒起伏？', '如何發揮流霞的正面特質？', '流霞需要注意什麼？'),
  TRUE,
  0
);

-- 流霞在月柱
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'liu_xia',
  'month',
  '流霞',
  '情動',
  'neutral',
  '感性豐富，情緒起伏大',
  '主感性與情緒，易因情生喜憂，對感情特別投入，需學會節制欲望與保持分寸。',
  JSON_ARRAY('感性豐富情緒起伏大，對感情特別投入', '做事偏衝動愛憑感覺，需留意酒色與分寸', '學會節制後能成為懂人心有魅力之人'),
  '命帶流霞，多主感性豐富、情緒起伏較大，對感情特別投入，易因情生喜，亦易因情生憂。做事有時偏衝動，愛憑感覺走，不太願意被約束，在戀愛、人際、聚會、出行應酬上，要留意酒色、分心或逞一時之快，而招致小傷小痛、破財或口舌是非。若能學會節制欲望、保持清醒與分寸，把這股敏感與熱情用在創作、表達與真誠交流上，反而能成為擅懂人心、兼具魅力與同理心的一類人。',
  JSON_ARRAY('流霞對我的影響是什麼？', '我該如何控制情緒起伏？', '如何發揮流霞的正面特質？', '流霞需要注意什麼？'),
  TRUE,
  0
);

-- 流霞在日柱
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'liu_xia',
  'day',
  '流霞',
  '情動',
  'neutral',
  '感性豐富，情緒起伏大',
  '主感性與情緒，易因情生喜憂，對感情特別投入，需學會節制欲望與保持分寸。',
  JSON_ARRAY('感性豐富情緒起伏大，對感情特別投入', '做事偏衝動愛憑感覺，需留意酒色與分寸', '學會節制後能成為懂人心有魅力之人'),
  '命帶流霞，多主感性豐富、情緒起伏較大，對感情特別投入，易因情生喜，亦易因情生憂。做事有時偏衝動，愛憑感覺走，不太願意被約束，在戀愛、人際、聚會、出行應酬上，要留意酒色、分心或逞一時之快，而招致小傷小痛、破財或口舌是非。若能學會節制欲望、保持清醒與分寸，把這股敏感與熱情用在創作、表達與真誠交流上，反而能成為擅懂人心、兼具魅力與同理心的一類人。',
  JSON_ARRAY('流霞對我的影響是什麼？', '我該如何控制情緒起伏？', '如何發揮流霞的正面特質？', '流霞需要注意什麼？'),
  TRUE,
  0
);

-- 流霞在时柱
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'liu_xia',
  'hour',
  '流霞',
  '情動',
  'neutral',
  '感性豐富，情緒起伏大',
  '主感性與情緒，易因情生喜憂，對感情特別投入，需學會節制欲望與保持分寸。',
  JSON_ARRAY('感性豐富情緒起伏大，對感情特別投入', '做事偏衝動愛憑感覺，需留意酒色與分寸', '學會節制後能成為懂人心有魅力之人'),
  '命帶流霞，多主感性豐富、情緒起伏較大，對感情特別投入，易因情生喜，亦易因情生憂。做事有時偏衝動，愛憑感覺走，不太願意被約束，在戀愛、人際、聚會、出行應酬上，要留意酒色、分心或逞一時之快，而招致小傷小痛、破財或口舌是非。若能學會節制欲望、保持清醒與分寸，把這股敏感與熱情用在創作、表達與真誠交流上，反而能成為擅懂人心、兼具魅力與同理心的一類人。',
  JSON_ARRAY('流霞對我的影響是什麼？', '我該如何控制情緒起伏？', '如何發揮流霞的正面特質？', '流霞需要注意什麼？'),
  TRUE,
  0
);

