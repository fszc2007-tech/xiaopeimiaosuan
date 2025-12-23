-- 插入孤鸞煞的解读内容
-- 版本：v1.0
-- 创建日期：2025-12-XX
-- 用途：补充孤鸞煞在日柱的解读（区分男女，孤鸞煞只论日柱）

-- ========== 孤鸞煞（gu_luan_sha）==========

-- 注意：孤鸞煞只论日柱，需要区分男女命

-- 孤鸞煞在日柱（男命）
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, gender, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'gu_luan_sha',
  'day',
  'male',
  '孤鸞煞',
  '孤緣',
  'neutral',
  '情感自由，責任與自我拉扯',
  '孤鸞煞為四柱神煞中的孤緣之星，主情感上的孤獨與緣分不順。',
  JSON_ARRAY('在情感上對自由與空間要求較高，不喜被束縛', '容易吸引帶故事、有個性的對象', '容易在事業、理想與家庭之間拉扯'),
  '日柱見孤鸞煞，多主在情感上對自由與空間要求較高，不喜被束縛，易在事業、理想與家庭之間拉扯。容易吸引帶故事、有個性的對象，感情不走傳統路線。若缺乏承擔與溝通，會讓伴侶產生不安全感，進而導致分離。學會在責任與自我之間找到平衡，是化解孤鸞的關鍵。',
  JSON_ARRAY('孤鸞煞對我的感情有何影響？', '日柱的孤鸞煞如何影響婚姻？', '我該如何化解孤鸞煞？', '如何平衡責任與自我？'),
  TRUE,
  0
);

-- 孤鸞煞在日柱（女命）
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, gender, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'gu_luan_sha',
  'day',
  'female',
  '孤鸞煞',
  '孤緣',
  'neutral',
  '寧缺毋濫，追求理解與尊重',
  '孤鸞煞為四柱神煞中的孤緣之星，主情感上的孤獨與緣分不順。',
  JSON_ARRAY('一生在婚戀上較追求「寧缺毋濫」', '內心渴望被理解與尊重，但外在往往展現獨立倔強的一面', '早年感情多有一兩段印象深刻卻難以善終的經歷'),
  '日柱見孤鸞煞，一生在婚戀上較追求「寧缺毋濫」，內心渴望被理解與尊重，但外在往往展現獨立倔強的一面，容易讓人誤以為不需要依靠。早年感情多有一兩段印象深刻卻難以善終的經歷，需要時間學會放下。當能看清自我價值，不再用感情證明自己時，反而更容易迎來珍惜自己的人。',
  JSON_ARRAY('孤鸞煞對我的感情有何影響？', '日柱的孤鸞煞如何影響婚姻？', '我該如何化解孤鸞煞？', '如何找到真正珍惜我的人？'),
  TRUE,
  0
);


