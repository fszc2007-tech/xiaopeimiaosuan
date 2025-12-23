-- 插入十神解读内容
-- 版本：v1.0
-- 创建日期：2025-01-XX
-- 用途：插入10个十神在4个柱位的解读内容（共40条记录）

-- ========== 比肩（bi_jian）==========
-- 标签：自我・同輩
-- 类型：neutral（根据命盘判断喜忌）

-- 比肩在年柱
INSERT INTO shishen_readings (
  reading_id, shishen_code, pillar_type, gender, name, badge_text, type,
  short_title, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'bi_jian',
  'year',
  'all',
  '比肩',
  '自我・同輩',
  'neutral',
  '年柱見比肩，早年環境中同輩影響力較大',
  '年柱見比肩，多主原生家庭或早年環境中，同輩、兄弟姐妹或同齡夥伴影響力較大。成長過程帶著一種「一起拼、一起比」的氛圍，命主性格偏要強、自尊心強，不喜被明顯壓制。早年就學會靠自己爭取位置，也容易在團體中形成自己的小圈子與立場。',
  JSON_ARRAY('比肩在年柱對我的性格有什麼影響？', '我該如何處理與同輩的競爭關係？', '比肩在年柱的人適合什麼樣的職業？', '如何發揮比肩的正面作用？'),
  TRUE,
  0
);

-- 比肩在月柱
INSERT INTO shishen_readings (
  reading_id, shishen_code, pillar_type, gender, name, badge_text, type,
  short_title, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'bi_jian',
  'month',
  'all',
  '比肩',
  '自我・同輩',
  'neutral',
  '月柱比肩，職場中同層級競合並存',
  '月柱比肩，多應在工作與社交環境中，同層級的同事競合並存。命主做事有主見，喜歡與實力相當的人共事，不太願意完全聽命於他人。職場中容易遇到「夥伴也是競爭者」的局面，若能學會合作分工，而非一味逞強，反而能形成穩固的同盟關係。',
  JSON_ARRAY('比肩在月柱對我的職場發展有什麼影響？', '我該如何處理職場中的競爭關係？', '比肩在月柱的人適合什麼樣的工作環境？', '如何將競爭轉化為合作？'),
  TRUE,
  1
);

-- 比肩在日柱
INSERT INTO shishen_readings (
  reading_id, shishen_code, pillar_type, gender, name, badge_text, type,
  short_title, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'bi_jian',
  'day',
  'all',
  '比肩',
  '自我・同輩',
  'neutral',
  '日柱見比肩，內在自我意識強烈',
  '日柱見比肩，命主內在自我意識強烈，對「我想怎麼活、我想怎麼愛」有明確底線。婚姻與親密關係中，易出現兩人都不服輸、各有主張的狀態，需要學會在堅持自我與求同存異之間尋找平衡。若能將這份堅定用在共同目標上，感情反而能成為並肩作戰的關係。',
  JSON_ARRAY('比肩在日柱對我的感情有什麼影響？', '我該如何在感情中保持自我又不傷害對方？', '比肩在日柱的人適合什麼樣的伴侶？', '如何將比肩的堅持轉化為感情中的優勢？'),
  TRUE,
  2
);

-- 比肩在時柱
INSERT INTO shishen_readings (
  reading_id, shishen_code, pillar_type, gender, name, badge_text, type,
  short_title, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'bi_jian',
  'hour',
  'all',
  '比肩',
  '自我・同輩',
  'neutral',
  '時柱比肩，中晚年依然保持獨立性',
  '時柱比肩，多主中晚年依然保持獨立性，不喜完全依賴他人。對子女或晚輩，傾向培養其自立能力，希望他們「自己走出一條路」。晚年若能與同道好友互相支持，一起學習或創作，會感到更有力量，不致落入孤軍奮戰的感覺。',
  JSON_ARRAY('比肩在時柱對我的晚年有什麼影響？', '我該如何培養子女的獨立性？', '比肩在時柱的人適合什麼樣的晚年生活？', '如何將比肩的獨立性轉化為晚年優勢？'),
  TRUE,
  3
);

-- ========== 劫財（jie_cai）==========
-- 标签：競爭・突破
-- 类型：neutral（根据命盘判断喜忌）

-- 劫財在年柱
INSERT INTO shishen_readings (
  reading_id, shishen_code, pillar_type, gender, name, badge_text, type,
  short_title, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'jie_cai',
  'year',
  'all',
  '劫財',
  '競爭・突破',
  'neutral',
  '年柱見劫財，早年接觸競爭與資源爭奪',
  '年柱見劫財，多主早年身邊同輩較強勢，或家族中個性鮮明、說了就做的人不少。命主自小就接觸到競爭與資源爭奪的氛圍，容易養成敏銳的危機感與「不被搶走」的心理。若能從中學會分享與協作，反而能在團隊中展現領頭與整合資源的能力。',
  JSON_ARRAY('劫財在年柱對我的性格有什麼影響？', '我該如何處理競爭與資源爭奪？', '劫財在年柱的人適合什麼樣的發展方向？', '如何將競爭轉化為優勢？'),
  TRUE,
  0
);

-- 劫財在月柱
INSERT INTO shishen_readings (
  reading_id, shishen_code, pillar_type, gender, name, badge_text, type,
  short_title, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'jie_cai',
  'month',
  'all',
  '劫財',
  '競爭・突破',
  'neutral',
  '月柱劫財，職場競爭味明顯',
  '月柱劫財，職場與人際圈中競爭味明顯，容易遇到搶客戶、搶資源的情況。命主做事風格敢衝敢搶，適合在需要主動出擊、快速決策的領域發展。若能懂得風險控制與長遠布局，不僅不怕競爭，還能從激烈環境中脫穎而出。',
  JSON_ARRAY('劫財在月柱對我的職場有什麼影響？', '我該如何在競爭激烈的環境中脫穎而出？', '劫財在月柱的人適合什麼樣的職業？', '如何平衡競爭與風險控制？'),
  TRUE,
  1
);

-- 劫財在日柱
INSERT INTO shishen_readings (
  reading_id, shishen_code, pillar_type, gender, name, badge_text, type,
  short_title, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'jie_cai',
  'day',
  'all',
  '劫財',
  '競爭・突破',
  'neutral',
  '日柱劫財，感情與家庭中有強烈自主感',
  '日柱劫財，多主命主在感情與家庭中有強烈自主感，不喜被管束。婚姻中容易出現雙方都想掌控資源、誰也不願太吃虧的狀態，需格外留意金錢與權力議題。若能把「爭」轉化為「一起創造、一起打天下」，這顆星反而能帶來共同拓展、勇於變革的力量。',
  JSON_ARRAY('劫財在日柱對我的感情有什麼影響？', '我該如何處理感情中的權力議題？', '劫財在日柱的人適合什麼樣的伴侶？', '如何將競爭轉化為共同創造？'),
  TRUE,
  2
);

-- 劫財在時柱
INSERT INTO shishen_readings (
  reading_id, shishen_code, pillar_type, gender, name, badge_text, type,
  short_title, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'jie_cai',
  'hour',
  'all',
  '劫財',
  '競爭・突破',
  'neutral',
  '時柱劫財，中晚年仍有創業衝動',
  '時柱劫財，多主中晚年仍有創業、投資或轉型的衝動，不安於完全安穩的生活。對子女或晚輩，可能會期望他們勇於爭取、不怕輸，甚至帶著一點「要贏在起跑點」的心態。若能把這股勁頭用於開創新局，而不是與身邊人內耗，晚景反而更有精彩變化。',
  JSON_ARRAY('劫財在時柱對我的晚年有什麼影響？', '我該如何處理晚年的創業衝動？', '劫財在時柱的人適合什麼樣的晚年規劃？', '如何將競爭轉化為創新動力？'),
  TRUE,
  3
);

-- ========== 食神（shi_shen）==========
-- 标签：才藝・享受
-- 类型：neutral（根据命盘判断喜忌）

-- 食神在年柱
INSERT INTO shishen_readings (
  reading_id, shishen_code, pillar_type, gender, name, badge_text, type,
  short_title, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'shi_shen',
  'year',
  'all',
  '食神',
  '才藝・享受',
  'neutral',
  '年柱見食神，成長環境較重享受與才藝',
  '年柱見食神，多主成長環境較重飲食、享受與人情往來，家庭氛圍不至於太刻板。命主自小就帶著幾分隨和與樂觀，懂得在生活中找到小確幸。也容易在早年就展露某些才藝、興趣，如唱作、表演、手作等，只要得到適度培養，日後可成為獨特優勢。',
  JSON_ARRAY('食神在年柱對我的性格有什麼影響？', '我該如何培養自己的才藝？', '食神在年柱的人適合什麼樣的發展方向？', '如何將才藝轉化為優勢？'),
  TRUE,
  0
);

-- 食神在月柱
INSERT INTO shishen_readings (
  reading_id, shishen_code, pillar_type, gender, name, badge_text, type,
  short_title, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'shi_shen',
  'month',
  'all',
  '食神',
  '才藝・享受',
  'neutral',
  '月柱食神，利於展現溫和與創意特質',
  '月柱食神，利於在學業與職場中展現溫和、愛分享的特質。命主思維較偏感性與創意，善於用親切方式與他人溝通，適合走服務、教育、餐飲、娛樂、內容創作等需與人互動的領域。若能兼顧紀律與實際執行，才華不只停留在興趣，而能落地成為穩定資源。',
  JSON_ARRAY('食神在月柱對我的職場有什麼影響？', '我該如何將才藝轉化為職業優勢？', '食神在月柱的人適合什麼樣的職業？', '如何平衡創意與執行力？'),
  TRUE,
  1
);

-- 食神在日柱
INSERT INTO shishen_readings (
  reading_id, shishen_code, pillar_type, gender, name, badge_text, type,
  short_title, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'shi_shen',
  'day',
  'all',
  '食神',
  '才藝・享受',
  'neutral',
  '日柱有食神，性情隨和重生活品質',
  '日柱有食神，命主性情多半隨和、重生活品質，對居家、飲食、氛圍有自己的品味。感情中重視舒適與愉悅感，喜歡與伴侶一起吃喝、旅遊、享受日常小幸福。若能與伴侶共同經營生活儀式感與創作活動，感情品質會比一般人更注重「好好一起過日子」。',
  JSON_ARRAY('食神在日柱對我的感情有什麼影響？', '我該如何在感情中營造舒適感？', '食神在日柱的人適合什麼樣的伴侶？', '如何將生活品味轉化為感情優勢？'),
  TRUE,
  2
);

-- 食神在時柱
INSERT INTO shishen_readings (
  reading_id, shishen_code, pillar_type, gender, name, badge_text, type,
  short_title, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'shi_shen',
  'hour',
  'all',
  '食神',
  '才藝・享受',
  'neutral',
  '時柱食神，多庇蔭中晚年與子女緣',
  '時柱食神，多庇蔭中晚年與子女緣。命主晚年仍有品味與興趣，願意花時間在美食、旅遊、手作、創作等領域享受人生。子女或晚輩多半性格溫和、有才華，與命主相處像朋友。若能把經驗與才藝傳承出去，不僅自己活得愜意，也能成為身邊人的溫暖來源。',
  JSON_ARRAY('食神在時柱對我的晚年有什麼影響？', '我該如何傳承自己的才藝？', '食神在時柱的人適合什麼樣的晚年生活？', '如何將才藝轉化為溫暖他人的力量？'),
  TRUE,
  3
);

-- ========== 傷官（shang_guan）==========
-- 标签：表達・突破
-- 类型：neutral（根据命盘判断喜忌）

-- 傷官在年柱
INSERT INTO shishen_readings (
  reading_id, shishen_code, pillar_type, gender, name, badge_text, type,
  short_title, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'shang_guan',
  'year',
  'all',
  '傷官',
  '表達・突破',
  'neutral',
  '年柱傷官，早年環境中個性直接',
  '年柱傷官，多主早年環境中，有敢說敢批評、個性直接之人，命主自小耳濡目染，對權威不那麼盲從。性格中帶著叛逆與質疑精神，常會思考「為什麼一定要這樣」。若能在合適的舞台上表達自己，如辯論、創作、設計、創業，這種氣質反而成為突破既有框架的力量。',
  JSON_ARRAY('傷官在年柱對我的性格有什麼影響？', '我該如何發揮表達與突破的能力？', '傷官在年柱的人適合什麼樣的發展方向？', '如何將質疑精神轉化為創新動力？'),
  TRUE,
  0
);

-- 傷官在月柱
INSERT INTO shishen_readings (
  reading_id, shishen_code, pillar_type, gender, name, badge_text, type,
  short_title, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'shang_guan',
  'month',
  'all',
  '傷官',
  '表達・突破',
  'neutral',
  '月柱傷官，思維敏捷創意多',
  '月柱傷官，在學業與職場中思維敏捷、創意多，但不喜按部就班。命主擅長從不同角度看問題，能提出新點子，也較敢挑戰體制。適合在需要創新、解決問題、策劃與表達的領域發揮。需留意的是，言語過直或過度批判時，易與上級或制度產生摩擦，需要學會拿捏分寸。',
  JSON_ARRAY('傷官在月柱對我的職場有什麼影響？', '我該如何平衡創意與制度要求？', '傷官在月柱的人適合什麼樣的職業？', '如何將表達能力轉化為職場優勢？'),
  TRUE,
  1
);

-- 傷官在日柱
INSERT INTO shishen_readings (
  reading_id, shishen_code, pillar_type, gender, name, badge_text, type,
  short_title, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'shang_guan',
  'day',
  'all',
  '傷官',
  '表達・突破',
  'neutral',
  '日柱傷官，親密關係中重視真實溝通',
  '日柱傷官，命主在親密關係中重視真實溝通，不喜壓抑。說話直白、情緒表達也較明顯，有時容易在衝動之下口不擇言。若能培養傾聽與同理心，把聰明才智用在為關係創造新體驗、新價值，而不是只用來挑毛病，婚姻與感情反而能活潑、有火花。',
  JSON_ARRAY('傷官在日柱對我的感情有什麼影響？', '我該如何在感情中表達真實想法？', '傷官在日柱的人適合什麼樣的伴侶？', '如何將直白轉化為感情中的優勢？'),
  TRUE,
  2
);

-- 傷官在時柱
INSERT INTO shishen_readings (
  reading_id, shishen_code, pillar_type, gender, name, badge_text, type,
  short_title, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'shang_guan',
  'hour',
  'all',
  '傷官',
  '表達・突破',
  'neutral',
  '時柱傷官，中晚年仍保持獨立思考',
  '時柱傷官，多主中晚年仍保持獨立思考與批判力，不輕易隨波逐流。對子女或晚輩，可能要求思辨能力，不希望他們只會聽話。子女多半個性鮮明、有主見，與命主之間有時會有衝撞，但也因此激發更多成長。若能以開放心態互動，晚年生活會充滿交流與思想碰撞。',
  JSON_ARRAY('傷官在時柱對我的晚年有什麼影響？', '我該如何與子女進行思想交流？', '傷官在時柱的人適合什麼樣的晚年生活？', '如何將獨立思考轉化為教育優勢？'),
  TRUE,
  3
);

-- ========== 正財（zheng_cai）==========
-- 标签：財富・務實
-- 类型：neutral（根据命盘判断喜忌）

-- 正財在年柱
INSERT INTO shishen_readings (
  reading_id, shishen_code, pillar_type, gender, name, badge_text, type,
  short_title, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'zheng_cai',
  'year',
  'all',
  '正財',
  '財富・務實',
  'neutral',
  '年柱見正財，家族重視穩定收入',
  '年柱見正財，多主家族重視穩定收入與務實生活，成長環境對金錢、節制與責任感有基本要求。命主自小就明白「錢得踏實賺」，對投機心態較保留。早年若能養成理財習慣，往後在人生規劃與物質基礎上會更穩健。',
  JSON_ARRAY('正財在年柱對我的理財觀念有什麼影響？', '我該如何培養理財習慣？', '正財在年柱的人適合什麼樣的理財方式？', '如何將務實轉化為財富優勢？'),
  TRUE,
  0
);

-- 正財在月柱
INSERT INTO shishen_readings (
  reading_id, shishen_code, pillar_type, gender, name, badge_text, type,
  short_title, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'zheng_cai',
  'month',
  'all',
  '正財',
  '財富・務實',
  'neutral',
  '月柱正財，利於追求穩定與長期發展',
  '月柱正財，利於在職場中追求穩定與長期發展。命主做事踏實，願意為制度內的穩定報酬付出時間與努力，適合在企業、行政、金融、管理等需要耐心與規律的領域。只要不被短期誘惑干擾，能慢慢累積出穩固的物質基礎與信用。',
  JSON_ARRAY('正財在月柱對我的職場有什麼影響？', '我該如何在職場中累積財富？', '正財在月柱的人適合什麼樣的職業？', '如何將務實轉化為職場優勢？'),
  TRUE,
  1
);

-- 正財在日柱
INSERT INTO shishen_readings (
  reading_id, shishen_code, pillar_type, gender, name, badge_text, type,
  short_title, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'zheng_cai',
  'day',
  'all',
  '正財',
  '財富・務實',
  'neutral',
  '日柱正財，感情與家庭中務實重責任',
  '日柱正財，命主在感情與家庭中務實、重責任，對家用、收支與生活安排有明確觀念。傾向追求踏實可靠的伴侶關係，不太喜歡過於虛浮的浪漫。若能與另一半共同制定理財與生活目標，婚姻會帶來安全感，也容易透過共同努力慢慢致穩致富。',
  JSON_ARRAY('正財在日柱對我的感情有什麼影響？', '我該如何在感情中處理財務問題？', '正財在日柱的人適合什麼樣的伴侶？', '如何將務實轉化為感情優勢？'),
  TRUE,
  2
);

-- 正財在時柱
INSERT INTO shishen_readings (
  reading_id, shishen_code, pillar_type, gender, name, badge_text, type,
  short_title, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'zheng_cai',
  'hour',
  'all',
  '正財',
  '財富・務實',
  'neutral',
  '時柱正財，中晚年仍有穩定財源',
  '時柱正財，多主中晚年仍有穩定財源，偏向安穩、規律的生活節奏。對子女與晚輩，會希望他們懂得腳踏實地、不亂花錢。若能及早安排退休金、保險與長期投資，晚景常有「不一定大富，但有穩穩的舒適與安心」的感受。',
  JSON_ARRAY('正財在時柱對我的晚年有什麼影響？', '我該如何規劃晚年財務？', '正財在時柱的人適合什麼樣的理財方式？', '如何將務實轉化為晚年優勢？'),
  TRUE,
  3
);

-- ========== 偏財（pian_cai）==========
-- 标签：機遇・生意
-- 类型：neutral（根据命盘判断喜忌）

-- 偏財在年柱
INSERT INTO shishen_readings (
  reading_id, shishen_code, pillar_type, gender, name, badge_text, type,
  short_title, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'pian_cai',
  'year',
  'all',
  '偏財',
  '機遇・生意',
  'neutral',
  '年柱偏財，家族中有人擅長生意投資',
  '年柱偏財，多主家族中有人擅長生意、投資或人脈運作，命主自小見識到「機會與資源流動」的重要性。性格帶著靈活與圓融，與人打交道多半懂得變通。若能從早年就學會風險管理，不盲目跟風，日後在投資與機會掌握上會有不錯表現。',
  JSON_ARRAY('偏財在年柱對我的理財觀念有什麼影響？', '我該如何培養投資眼光？', '偏財在年柱的人適合什麼樣的理財方式？', '如何將機遇轉化為財富優勢？'),
  TRUE,
  0
);

-- 偏財在月柱
INSERT INTO shishen_readings (
  reading_id, shishen_code, pillar_type, gender, name, badge_text, type,
  short_title, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'pian_cai',
  'month',
  'all',
  '偏財',
  '機遇・生意',
  'neutral',
  '月柱偏財，職場中充滿機會與資源流動',
  '月柱偏財，職場與社交圈中充滿機會與資源流動，適合從事業務、銷售、投資、貿易、專案合作等工作。命主擅長抓時機、談條件、運用人脈，若能兼顧誠信與長遠規劃，不僅能創造財富，也能建立良好口碑。需要留意的是，過度分散或貪多，易導致身心與財務壓力。',
  JSON_ARRAY('偏財在月柱對我的職場有什麼影響？', '我該如何在職場中抓住機會？', '偏財在月柱的人適合什麼樣的職業？', '如何平衡機遇與風險？'),
  TRUE,
  1
);

-- 偏財在日柱
INSERT INTO shishen_readings (
  reading_id, shishen_code, pillar_type, gender, name, badge_text, type,
  short_title, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'pian_cai',
  'day',
  'all',
  '偏財',
  '機遇・生意',
  'neutral',
  '日柱偏財，感情與生活中重視新鮮與彈性',
  '日柱偏財，命主在感情與生活中重視新鮮與彈性，不喜太過刻板。對伴侶可能較大方，願意在物質與體驗上給予驚喜。需留意的是，若過於貪求外在刺激或多重選項，容易在感情或金錢上出現不穩定。學會在享受與負責之間拿捏，才是這顆星的成熟表現。',
  JSON_ARRAY('偏財在日柱對我的感情有什麼影響？', '我該如何在感情中保持新鮮感？', '偏財在日柱的人適合什麼樣的伴侶？', '如何將彈性轉化為感情優勢？'),
  TRUE,
  2
);

-- 偏財在時柱
INSERT INTO shishen_readings (
  reading_id, shishen_code, pillar_type, gender, name, badge_text, type,
  short_title, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'pian_cai',
  'hour',
  'all',
  '偏財',
  '機遇・生意',
  'neutral',
  '時柱偏財，中晚年仍有創造財富的機會',
  '時柱偏財，多主中晚年仍有創造財富的機會，或憑藉過往人脈與眼光找到新的合作模式。子女或晚輩中，可能有人具商業頭腦與機會敏銳度。若能提前規劃風險、分散投資，晚年生活有機會在享受與自由度上高於一般人。',
  JSON_ARRAY('偏財在時柱對我的晚年有什麼影響？', '我該如何規劃晚年的投資？', '偏財在時柱的人適合什麼樣的理財方式？', '如何將機遇轉化為晚年優勢？'),
  TRUE,
  3
);

-- ========== 正官（zheng_guan）==========
-- 标签：責任・秩序
-- 类型：neutral（根据命盘判断喜忌）

-- 正官在年柱
INSERT INTO shishen_readings (
  reading_id, shishen_code, pillar_type, gender, name, badge_text, type,
  short_title, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'zheng_guan',
  'year',
  'all',
  '正官',
  '責任・秩序',
  'neutral',
  '年柱正官，家庭重視規矩與名聲',
  '年柱正官，多主家庭或長輩重視規矩、名聲與形象，命主自小在「該做什麼、不該做什麼」的框架中成長。性格較懂禮數，內心對是非有自己的尺。若能遇到正向的榜樣，會把責任感內化成自律，而非只是壓力。',
  JSON_ARRAY('正官在年柱對我的性格有什麼影響？', '我該如何培養責任感？', '正官在年柱的人適合什麼樣的發展方向？', '如何將責任感轉化為優勢？'),
  TRUE,
  0
);

-- 正官在月柱
INSERT INTO shishen_readings (
  reading_id, shishen_code, pillar_type, gender, name, badge_text, type,
  short_title, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'zheng_guan',
  'month',
  'all',
  '正官',
  '責任・秩序',
  'neutral',
  '月柱正官，利於在職場體系中發展',
  '月柱正官，利於在職場體系中發展，命主行事謹慎，願意承擔責任，適合公職、管理、金融、醫療、教育等需要穩重形象的領域。上司對其信任度通常較高，只要不過度壓抑自我，在制度中也能走出自己的路。注意避免過於害怕犯錯，而錯失必要的嘗試。',
  JSON_ARRAY('正官在月柱對我的職場有什麼影響？', '我該如何在職場中承擔責任？', '正官在月柱的人適合什麼樣的職業？', '如何將責任感轉化為職場優勢？'),
  TRUE,
  1
);

-- 正官在日柱
INSERT INTO shishen_readings (
  reading_id, shishen_code, pillar_type, gender, name, badge_text, type,
  short_title, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'zheng_guan',
  'day',
  'all',
  '正官',
  '責任・秩序',
  'neutral',
  '日柱正官，感情與家庭中看重承諾',
  '日柱正官，命主在感情與家庭中看重承諾與道德感，對伴侶與自己都有行為標準。婚姻關係中重視責任分工與相互尊重，不喜混亂與失控。若能在保持原則的同時，也給自己與對方一些彈性與溫度，關係會更加穩固而不呆板。',
  JSON_ARRAY('正官在日柱對我的感情有什麼影響？', '我該如何在感情中保持原則？', '正官在日柱的人適合什麼樣的伴侶？', '如何將責任感轉化為感情優勢？'),
  TRUE,
  2
);

-- 正官在時柱
INSERT INTO shishen_readings (
  reading_id, shishen_code, pillar_type, gender, name, badge_text, type,
  short_title, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'zheng_guan',
  'hour',
  'all',
  '正官',
  '責任・秩序',
  'neutral',
  '時柱正官，中晚年仍維持規律與自我要求',
  '時柱正官，多主中晚年仍維持一定的規律與自我要求，不輕易放任自己鬆散。对子女或晚輩較重視品行與責任，期望他們成為可靠之人。晚景若能在「守成」與「適度放鬆」之間取得平衡，既不失尊嚴，也能享受人生。',
  JSON_ARRAY('正官在時柱對我的晚年有什麼影響？', '我該如何培養子女的責任感？', '正官在時柱的人適合什麼樣的晚年生活？', '如何將責任感轉化為教育優勢？'),
  TRUE,
  3
);

-- ========== 七殺（qi_sha）==========
-- 标签：魄力・壓力
-- 类型：neutral（根据命盘判断喜忌）

-- 七殺在年柱
INSERT INTO shishen_readings (
  reading_id, shishen_code, pillar_type, gender, name, badge_text, type,
  short_title, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'qi_sha',
  'year',
  'all',
  '七殺',
  '魄力・壓力',
  'neutral',
  '年柱七殺，早年環境中帶有壓力',
  '年柱七殺，多主早年環境中帶有壓力與不確定性，可能是家中有人性格強勢、嚴格，或環境變化較大。命主自小就學會適應變動、面對壓力，內心帶著一股不服輸的勁頭。若能將這股硬氣用於自我鍛鍊，而非只感受威壓，反而能培養出堅韌與膽識。',
  JSON_ARRAY('七殺在年柱對我的性格有什麼影響？', '我該如何處理壓力與挑戰？', '七殺在年柱的人適合什麼樣的發展方向？', '如何將壓力轉化為動力？'),
  TRUE,
  0
);

-- 七殺在月柱
INSERT INTO shishen_readings (
  reading_id, shishen_code, pillar_type, gender, name, badge_text, type,
  short_title, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'qi_sha',
  'month',
  'all',
  '七殺',
  '魄力・壓力',
  'neutral',
  '月柱七殺，職場中挑戰較多',
  '月柱七殺，職場與社會環境中挑戰較多，命主常被推到需要承擔風險與做艱難決策的位置。適合走需要膽量與判斷力的行業，如創業、軍警、外勤、談判、危機處理等。要特別留意情緒管理與壓力宣洩，避免長期處於高壓而忽略身心狀態。',
  JSON_ARRAY('七殺在月柱對我的職場有什麼影響？', '我該如何在壓力環境中保持狀態？', '七殺在月柱的人適合什麼樣的職業？', '如何將魄力轉化為職場優勢？'),
  TRUE,
  1
);

-- 七殺在日柱
INSERT INTO shishen_readings (
  reading_id, shishen_code, pillar_type, gender, name, badge_text, type,
  short_title, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'qi_sha',
  'day',
  'all',
  '七殺',
  '魄力・壓力',
  'neutral',
  '日柱七殺，感情與家庭中有強烈自我保護意識',
  '日柱七殺，命主在感情與家庭中有強烈自我保護意識，不輕易完全示弱。親密關係中容易出現「又想靠近又怕受傷」的拉扯。若能學會信任、放下部分控制，並與伴侶共同面對外界壓力，七殺反而能成為保護家庭、為關係衝鋒的力量，而不是只帶來衝突。',
  JSON_ARRAY('七殺在日柱對我的感情有什麼影響？', '我該如何在感情中建立信任？', '七殺在日柱的人適合什麼樣的伴侶？', '如何將魄力轉化為保護家庭的力量？'),
  TRUE,
  2
);

-- 七殺在時柱
INSERT INTO shishen_readings (
  reading_id, shishen_code, pillar_type, gender, name, badge_text, type,
  short_title, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'qi_sha',
  'hour',
  'all',
  '七殺',
  '魄力・壓力',
  'neutral',
  '時柱七殺，中晚年仍會面對責任或變動',
  '時柱七殺，多主中晚年仍會面對某些責任或變動，不至於完全安逸退休。子女或晚輩中，可能有人性格剛強，走較辛苦但能出成就的道路。若能提早規劃風險管理，並培養身心調適能力，晚年反而會因「闖過不少難關」而更有底氣。',
  JSON_ARRAY('七殺在時柱對我的晚年有什麼影響？', '我該如何處理晚年的責任與變動？', '七殺在時柱的人適合什麼樣的晚年規劃？', '如何將魄力轉化為晚年優勢？'),
  TRUE,
  3
);

-- ========== 正印（zheng_yin）==========
-- 标签：庇蔭・學習
-- 类型：neutral（根据命盘判断喜忌）

-- 正印在年柱
INSERT INTO shishen_readings (
  reading_id, shishen_code, pillar_type, gender, name, badge_text, type,
  short_title, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'zheng_yin',
  'year',
  'all',
  '正印',
  '庇蔭・學習',
  'neutral',
  '年柱正印，原生家庭中有長輩願意照顧',
  '年柱正印，多主原生家庭中有長輩願意照顧與教導，環境相對重視學習與品行。命主自小較容易得到關照與資源，內心也較重情義與感恩。若能在成長過程中培養獨立性，不過度依賴庇蔭，這顆星能帶來穩定的支持感與良好名聲。',
  JSON_ARRAY('正印在年柱對我的性格有什麼影響？', '我該如何培養獨立性？', '正印在年柱的人適合什麼樣的發展方向？', '如何將庇蔭轉化為優勢？'),
  TRUE,
  0
);

-- 正印在月柱
INSERT INTO shishen_readings (
  reading_id, shishen_code, pillar_type, gender, name, badge_text, type,
  short_title, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'zheng_yin',
  'month',
  'all',
  '正印',
  '庇蔭・學習',
  'neutral',
  '月柱正印，利於接觸良師益友或貴人',
  '月柱正印，利於在學業與職場中接觸到良師益友或貴人。命主學習力強，對知識、資格、專業有天然親近感，適合從事教育、顧問、醫療、心理、文化等需要穩重與信任度的領域。需留意不要因為過於求安穩而不敢嘗試新方向。',
  JSON_ARRAY('正印在月柱對我的職場有什麼影響？', '我該如何在職場中發揮學習能力？', '正印在月柱的人適合什麼樣的職業？', '如何將學習轉化為職場優勢？'),
  TRUE,
  1
);

-- 正印在日柱
INSERT INTO shishen_readings (
  reading_id, shishen_code, pillar_type, gender, name, badge_text, type,
  short_title, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'zheng_yin',
  'day',
  'all',
  '正印',
  '庇蔭・學習',
  'neutral',
  '日柱正印，感情與家庭中包容度高',
  '日柱正印，命主在感情與家庭中包容度高、願意照顧他人，對伴侶與家人有保護傾向。重視情感安全感，比起轟轟烈烈的激情，更在意日常的互相支撐。若能在付出與自我照顧之間取得平衡，不把自己耗盡，這顆星能讓家庭氛圍溫暖而有依靠。',
  JSON_ARRAY('正印在日柱對我的感情有什麼影響？', '我該如何在感情中保持平衡？', '正印在日柱的人適合什麼樣的伴侶？', '如何將包容轉化為感情優勢？'),
  TRUE,
  2
);

-- 正印在時柱
INSERT INTO shishen_readings (
  reading_id, shishen_code, pillar_type, gender, name, badge_text, type,
  short_title, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'zheng_yin',
  'hour',
  'all',
  '正印',
  '庇蔭・學習',
  'neutral',
  '時柱正印，中晚年仍有精神寄託與學習對象',
  '時柱正印，多主中晚年仍有精神寄託與學習對象，可能熱衷讀書、修身、宗教或公益。子女或晚輩中，常有人品行端正、願意承擔責任。晚景若能持續在心靈與知識層面成長，即使物質不極端富裕，也能活出安然與被尊重的感受。',
  JSON_ARRAY('正印在時柱對我的晚年有什麼影響？', '我該如何規劃晚年的精神生活？', '正印在時柱的人適合什麼樣的晚年生活？', '如何將學習轉化為晚年優勢？'),
  TRUE,
  3
);

-- ========== 偏印（pian_yin）==========
-- 标签：靈感・變化
-- 类型：neutral（根据命盘判断喜忌）

-- 偏印在年柱
INSERT INTO shishen_readings (
  reading_id, shishen_code, pillar_type, gender, name, badge_text, type,
  short_title, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'pian_yin',
  'year',
  'all',
  '偏印',
  '靈感・變化',
  'neutral',
  '年柱偏印，早年環境變動較多',
  '年柱偏印，多主早年環境變動較多，或家族中有人思維獨特、行事不按常規。命主自小就習慣在變化中尋找依靠，內心敏感、直覺強。若能把這份敏銳用於理解人性與環境，而不是只感到不安，反而能培養出與眾不同的觀察力。',
  JSON_ARRAY('偏印在年柱對我的性格有什麼影響？', '我該如何發揮直覺與觀察力？', '偏印在年柱的人適合什麼樣的發展方向？', '如何將敏感轉化為優勢？'),
  TRUE,
  0
);

-- 偏印在月柱
INSERT INTO shishen_readings (
  reading_id, shishen_code, pillar_type, gender, name, badge_text, type,
  short_title, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'pian_yin',
  'month',
  'all',
  '偏印',
  '靈感・變化',
  'neutral',
  '月柱偏印，學業與職場路線較少走標準模板',
  '月柱偏印，學業與職場路線較少走標準模板，常有轉換跑道、跨界或非典型經歷。命主適合從事需要靈感與變通力的領域，如藝術、創意、研究、顧問、心靈相關工作等。需要注意的是，易有三分鐘熱度或方向頻繁變動，需刻意培養持續力與落地執行。',
  JSON_ARRAY('偏印在月柱對我的職場有什麼影響？', '我該如何平衡靈感與執行力？', '偏印在月柱的人適合什麼樣的職業？', '如何將變化轉化為職場優勢？'),
  TRUE,
  1
);

-- 偏印在日柱
INSERT INTO shishen_readings (
  reading_id, shishen_code, pillar_type, gender, name, badge_text, type,
  short_title, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'pian_yin',
  'day',
  'all',
  '偏印',
  '靈感・變化',
  'neutral',
  '日柱偏印，感情與內在世界中有強烈的獨處需求',
  '日柱偏印，命主在感情與內在世界中有強烈的獨處需求與精神追求，有時情緒起伏較細膩。親密關係中需要被理解與尊重精神空間，不喜完全被貼上固定角色。若能找到懂得欣賞其獨特思維與創造力的伴侶，關係將會是彼此成長與靈感交流的場域。',
  JSON_ARRAY('偏印在日柱對我的感情有什麼影響？', '我該如何在感情中保持精神空間？', '偏印在日柱的人適合什麼樣的伴侶？', '如何將靈感轉化為感情優勢？'),
  TRUE,
  2
);

-- 偏印在時柱
INSERT INTO shishen_readings (
  reading_id, shishen_code, pillar_type, gender, name, badge_text, type,
  short_title, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'pian_yin',
  'hour',
  'all',
  '偏印',
  '靈感・變化',
  'neutral',
  '時柱偏印，中晚年仍保有探索與轉化的心',
  '時柱偏印，多主中晚年仍保有探索與轉化的心，不太甘於一成不變。子女或晚輩中，可能有人走非傳統路線或具藝術、研究、心靈方面的天分。若能將自身經驗化為指引，而不是用焦慮方式干預，晚年反而能享受與下一代共同探索世界的樂趣。',
  JSON_ARRAY('偏印在時柱對我的晚年有什麼影響？', '我該如何與子女進行探索交流？', '偏印在時柱的人適合什麼樣的晚年生活？', '如何將靈感轉化為教育優勢？'),
  TRUE,
  3
);


