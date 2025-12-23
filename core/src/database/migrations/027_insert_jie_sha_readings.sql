-- 插入劫煞的解读内容
-- 版本：v1.0
-- 创建日期：2025-12-XX
-- 用途：补充劫煞在四个柱位的完整解读

-- ========== 劫煞（jie_sha）==========

-- 劫煞在年柱
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, gender, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'jie_sha',
  'year',
  'all',
  '劫煞',
  '風險',
  'neutral',
  '家運波折，適應力強',
  '劫煞為四柱神煞中的風險之星，主變動、驟變、意外、損友、破耗，同時有「敢衝、敢拼、適合在變動中求機會」的性質。',
  JSON_ARRAY('原生家庭、家族氣場較多波折與是非', '可能經歷搬遷、財務起落或親族關係不穩', '對風險與變化的感受較敏銳，早早學會自我保護與隨機應變'),
  '年柱見劫煞，多主原生家庭、家族氣場較多波折與是非，可能經歷搬遷、財務起落或親族關係不穩。命主自小在不太安穩的環境中成長，對風險與變化的感受較敏銳，早早學會自我保護與隨機應變。優點是適應力強、不怕換環境；缺點是安全感不足，易不自覺用「先拒絕、先懷疑」的方式面對人事物，需要學會區分真正的危險與內心的焦慮。',
  JSON_ARRAY('劫煞對我的影響是什麼？', '年柱的劫煞會如何影響我？', '我該如何善用劫煞？', '劫煞需要注意什麼？'),
  TRUE,
  0
);

-- 劫煞在月柱
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, gender, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'jie_sha',
  'month',
  'all',
  '劫煞',
  '風險',
  'neutral',
  '職場競爭，變動頻仍',
  '劫煞為四柱神煞中的風險之星，主變動、驟變、意外、損友、破耗，同時有「敢衝、敢拼、適合在變動中求機會」的性質。',
  JSON_ARRAY('在同輩、人際與職場領域中，常處於競爭激烈或變動頻仍的環境', '容易遇到看似義氣、實則帶來破耗的朋友', '適合在需要衝勁與變化的行業'),
  '月柱帶劫煞，象徵命主在同輩、人際與職場領域中，常處於競爭激烈或變動頻仍的環境。容易遇到看似義氣、實則帶來破耗的朋友，或工作上常被捲入他人的是非與爭奪。適合在需要衝勁與變化的行業，如業務、交易、創業、專案型工作等；若一味衝動，則易因人情、衝動投資或職場衝突帶來損失。懂得選邊站與設界線，是化煞為用的關鍵。',
  JSON_ARRAY('劫煞對我的職場有何影響？', '月柱的劫煞如何影響人際？', '我適合什麼工作？', '如何將劫煞的風險轉為機會？'),
  TRUE,
  0
);

-- 劫煞在日柱
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, gender, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'jie_sha',
  'day',
  'all',
  '劫煞',
  '風險',
  'neutral',
  '個性冒險，感情搖擺',
  '劫煞為四柱神煞中的風險之星，主變動、驟變、意外、損友、破耗，同時有「敢衝、敢拼、適合在變動中求機會」的性質。',
  JSON_ARRAY('個性中帶有冒險與不服輸的一面', '感情與婚姻上，既渴望親密，又害怕被束縛', '配偶或親密關係對象可能個性強烈、帶來生活節奏的劇烈變化'),
  '日柱見劫煞，主個性中帶有冒險與不服輸的一面，遇到壓力時寧願硬扛也不願示弱。感情與婚姻上，既渴望親密，又害怕被束縛，容易在衝動與退縮間搖擺。配偶或親密關係對象可能個性強烈、帶來生活節奏的劇烈變化，一起創業、一起折騰的機率較高。用得好，是能共患難、共打天下的格局；用得不好，則是財務與情緒上的拉扯，需要學會在愛與風險之間畫清界線。',
  JSON_ARRAY('劫煞對我的感情有何影響？', '日柱的劫煞如何影響婚姻？', '我的伴侶會是什麼樣的人？', '如何經營好感情關係？'),
  TRUE,
  0
);

-- 劫煞在时柱
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, gender, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'jie_sha',
  'hour',
  'all',
  '劫煞',
  '風險',
  'neutral',
  '晚年變動，不服老',
  '劫煞為四柱神煞中的風險之星，主變動、驟變、意外、損友、破耗，同時有「敢衝、敢拼、適合在變動中求機會」的性質。',
  JSON_ARRAY('後半生較不甘於按部就班，常有轉行、移居、再創業等念頭', '子女或晚輩多具行動力與個性，喜自由、不喜被規劃', '若能在中晚年提早做好風險管理與健康、財務規劃，劫煞會成為推動改變的力量'),
  '時柱帶劫煞，多與中晚年運勢及子女緣分有關。命主後半生較不甘於按部就班，常有轉行、移居、再創業等念頭，有的人反而在這種變動中迎來第二次高峰。子女或晚輩多具行動力與個性，喜自由、不喜被規劃，人生路上可能走得比較刺激，有時讓命主既驕傲又擔心。若能在中晚年提早做好風險管理與健康、財務規劃，劫煞會成為推動改變的力量，而非意外的來源。',
  JSON_ARRAY('劫煞對我的晚年有何影響？', '時柱的劫煞如何影響子女？', '我的晚年運勢如何？', '如何做好風險管理？'),
  TRUE,
  0
);


