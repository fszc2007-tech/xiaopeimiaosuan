-- 插入紅艷煞的解读内容
-- 版本：v1.0
-- 创建日期：2025-12-XX
-- 用途：补充紅艷煞在四个柱位的完整解读

-- ========== 紅艷煞（hong_yan_sha）==========

-- 紅艷煞在年柱
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, gender, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'hong_yan_sha',
  'year',
  'all',
  '紅艷煞',
  '艷情',
  'neutral',
  '注重外表，人緣佳',
  '紅艷煞為四柱神煞中的桃花類神煞，主美貌、情欲與情感糾結，比一般咸池更偏「美貌＋情欲＋情感糾結」。',
  JSON_ARRAY('原生家庭或成長環境中，對「外表、氣質、面子」較為在意', '自小就比較懂得如何展現自己', '在同輩中容易顯眼、受關注'),
  '年柱帶紅艷，多主原生家庭或成長環境中，對「外表、氣質、面子」較為在意，家人對打扮、體面、社交場合有一定講究。命主自小就比較懂得如何展現自己，在同輩中容易顯眼、受關注。這種配置有利人緣與社交，但也容易因為太在意外界評價，而在感情選擇上被外在條件牽著走，需要學會分辨「賞心悅目」與「真正適合」的差別。',
  JSON_ARRAY('紅艷煞對我的影響是什麼？', '年柱的紅艷煞會如何影響我？', '我該如何善用紅艷煞？', '紅艷煞需要注意什麼？'),
  TRUE,
  0
);

-- 紅艷煞在月柱
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, gender, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'hong_yan_sha',
  'month',
  'all',
  '紅艷煞',
  '艷情',
  'neutral',
  '職場異性緣，焦點人物',
  '紅艷煞為四柱神煞中的桃花類神煞，主美貌、情欲與情感糾結，比一般咸池更偏「美貌＋情欲＋情感糾結」。',
  JSON_ARRAY('在工作圈、同事群與朋友圈中，異性緣特別明顯', '容易成為大家眼中的焦點人物', '適合在品牌、公關、娛樂、美容、美術設計等與形象、美感有關的行業'),
  '紅艷落月柱，象徵命主在工作圈、同事群與朋友圈中，異性緣特別明顯，容易成為大家眼中的焦點人物。職場或同輩之間不乏曖昧、欣賞與流言，做品牌、公關、娛樂、美容、美術設計等與形象、美感有關的行業會較有優勢。但若分寸拿捏不好，過多混雜私人感情與工作關係，容易招來辦公室戀情、爭風吃醋與是非流言，影響事業穩定。',
  JSON_ARRAY('紅艷煞對我的職場有何影響？', '月柱的紅艷煞如何影響人際？', '我適合什麼工作？', '如何避免職場感情是非？'),
  TRUE,
  0
);

-- 紅艷煞在日柱
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, gender, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'hong_yan_sha',
  'day',
  'all',
  '紅艷煞',
  '艷情',
  'neutral',
  '感情豐富，不平凡',
  '紅艷煞為四柱神煞中的桃花類神煞，主美貌、情欲與情感糾結，比一般咸池更偏「美貌＋情欲＋情感糾結」。',
  JSON_ARRAY('典型「感情路不平凡」的配置之一', '一生感情經歷較豐富，容易被有魅力的人吸引', '戀愛時投入度高、情緒起伏大'),
  '日柱見紅艷，是典型「感情路不平凡」的配置之一。一生感情經歷較豐富，容易被有魅力的人吸引，也容易成為別人心中的難忘對象。戀愛時投入度高、情緒起伏大，愛得真也愛得累；若命局再逢桃花、咸池等，婚前多段情史、婚後需特別留意界線與誘惑。用得好，是懂得經營浪漫與氛圍的高手；用得不好，則是為情所困、身心耗損，需要靠自律與價值觀來駕馭這份吸引力。',
  JSON_ARRAY('紅艷煞對我的感情有何影響？', '日柱的紅艷煞如何影響婚姻？', '我的伴侶會是什麼樣的人？', '如何經營好感情關係？'),
  TRUE,
  0
);

-- 紅艷煞在时柱
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, gender, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'hong_yan_sha',
  'hour',
  'all',
  '紅艷煞',
  '艷情',
  'neutral',
  '晚年重品味，心態年輕',
  '紅艷煞為四柱神煞中的桃花類神煞，主美貌、情欲與情感糾結，比一般咸池更偏「美貌＋情欲＋情感糾結」。',
  JSON_ARRAY('愈到後半生，愈重視生活品味與情感交流', '中晚年仍有被人追求或心態年輕的一面', '子女或晚輩多有才藝、形象佳或走向與美感、表演、有觀眾緣的行業'),
  '紅艷坐時柱，多應在中晚年狀態與子女緣上。命主愈到後半生，愈重視生活品味與情感交流，不願只過枯燥的日子，中晚年仍有被人追求或心態年輕的一面。子女或晚輩多有才藝、形象佳或走向與美感、表演、有觀眾緣的行業。若命局紅艷較重，又行到感情波動大運，需留心中晚年因感情或子女情事牽動心神，影響健康與財務，宜提早建立良好界線與溝通模式。',
  JSON_ARRAY('紅艷煞對我的晚年有何影響？', '時柱的紅艷煞如何影響子女？', '我的晚年運勢如何？', '如何建立良好的界線與溝通？'),
  TRUE,
  0
);


