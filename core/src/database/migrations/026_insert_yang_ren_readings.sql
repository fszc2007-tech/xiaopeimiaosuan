-- 插入陽刃的解读内容
-- 版本：v1.0
-- 创建日期：2025-12-XX
-- 用途：补充陽刃在四个柱位的完整解读

-- ========== 陽刃（yang_ren）==========

-- 陽刃在年柱
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, gender, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'yang_ren',
  'year',
  'all',
  '陽刃',
  '剛猛',
  'neutral',
  '家風強硬，個性早熟',
  '陽刃為四柱神煞中的剛猛之星，主衝勁、魄力與風險。',
  JSON_ARRAY('原生家庭或長輩氣場較強', '家風重功績與競爭，講求「要爭口氣」', '自小在壓力與較勁氛圍中長大'),
  '年柱見陽刃，多主原生家庭或長輩氣場較強，家風重功績與競爭，講求「要爭口氣」。家中可能有人個性剛烈、說話直接，不太懂溫柔安撫，命主自小在壓力與較勁氛圍中長大，早學會逞強、不願示弱。這種配置若用得好，能承接家族的魄力與衝勁；若失衡，則易重蹈上一代的衝突模式，需要學會在堅持與和解之間找到界線。',
  JSON_ARRAY('陽刃對我的影響是什麼？', '年柱的陽刃會如何影響我？', '我該如何善用陽刃？', '陽刃需要注意什麼？'),
  TRUE,
  0
);

-- 陽刃在月柱
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, gender, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'yang_ren',
  'month',
  'all',
  '陽刃',
  '剛猛',
  'neutral',
  '職場衝鋒，敢於擔責',
  '陽刃為四柱神煞中的剛猛之星，主衝勁、魄力與風險。',
  JSON_ARRAY('在成長環境、職場與同輩相處中，常扮演「衝在前面」的角色', '做事有行動力、敢扛責任', '適合在需要決斷、敢於承擔風險的領域'),
  '陽刃落月柱，象徵命主在成長環境、職場與同輩相處中，常扮演「衝在前面」的角色。做事有行動力、敢扛責任，不怕得罪人，但說話與作風易過於直白，稍不留意就與同事、上司硬碰硬。適合在需要決斷、敢於承擔風險的領域，例如業務、前線管理、競爭激烈的行業。若能配合良好的情緒管理與溝通技巧，陽刃會成為領導力；反之則變成是非與壓力的來源。',
  JSON_ARRAY('陽刃對我的職場有何幫助？', '月柱的陽刃如何影響人際？', '我適合什麼工作？', '如何將陽刃的衝勁轉為領導力？'),
  TRUE,
  0
);

-- 陽刃在日柱
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, gender, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'yang_ren',
  'day',
  'all',
  '陽刃',
  '剛猛',
  'neutral',
  '本性剛烈，愛恨分明',
  '陽刃為四柱神煞中的剛猛之星，主衝勁、魄力與風險。',
  JSON_ARRAY('本性剛烈要強，心中有自己的原則與底線', '感情與婚姻上，表現為愛恨分明、不願委屈自己', '遇事敢站出來保護自己與家人'),
  '日柱見陽刃，主命主本性剛烈要強，心中有自己的原則與底線，不輕易妥協。感情與婚姻上，表現為愛恨分明、不願委屈自己，對伴侶要求真誠直接，討厭敷衍。優點是遇事敢站出來保護自己與家人；缺點是情緒上來時語氣過猛，容易把關心說成指責，讓對方壓力大。若能在堅持立場的同時學會軟化說話方式，既保留下陽刃的氣魄，又不至於讓感情關係受傷。',
  JSON_ARRAY('陽刃對我的感情有何影響？', '日柱的陽刃如何影響婚姻？', '我的伴侶會是什麼樣的人？', '如何經營好感情關係？'),
  TRUE,
  0
);

-- 陽刃在时柱
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, gender, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'yang_ren',
  'hour',
  'all',
  '陽刃',
  '剛猛',
  'neutral',
  '晚年堅定，不服老',
  '陽刃為四柱神煞中的剛猛之星，主衝勁、魄力與風險。',
  JSON_ARRAY('愈到後半生，個性愈加不願被束縛', '對生活方式與價值觀有強烈主張', '子女或晚輩多具個性，有自己想走的路'),
  '陽刃坐時柱，多應在中晚年以及子女緣分上。命主愈到後半生，個性愈加不願被束縛，對生活方式與價值觀有強烈主張，適合自行創業、自由業或擁有較大自主權的工作。子女或晚輩多具個性，有自己想走的路，不喜被強壓安排，與命主之間容易在「誰說了算」上有拉扯。若能提早學會尊重差異、把控情緒，陽刃反而能讓晚年保持行動力與不服老的生命力，而不是成為代溝與衝突的源頭。',
  JSON_ARRAY('陽刃對我的晚年有何影響？', '時柱的陽刃如何影響子女？', '我的晚年運勢如何？', '如何改善與子女的關係？'),
  TRUE,
  0
);


