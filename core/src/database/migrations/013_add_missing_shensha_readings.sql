-- 补充缺失的神煞解读
-- 版本：v1.1
-- 创建日期：2025-12-03
-- 用途：补充月德合、天德合、德秀贵人、龙德贵人的解读内容

-- ========== 月德合（yue_de_he）==========

-- 月德合在年柱
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'yue_de_he',
  'year',
  '月德合',
  '吉神',
  'auspicious',
  '祖上餘蔭，長輩照拂',
  '月德貴人的配合之星，能化解婚姻、人際中的矛盾衝突，帶來和諧與貴人相助。',
  JSON_ARRAY('得祖上餘蔭與長輩照拂', '幼年易遇貴人長輩相助', '家族多熱心之人，較少樹敵'),
  '命帶月德合臨年柱，多得祖上餘蔭與長輩照拂，出身環境較有人情味，不至過分顛沛。幼年易遇和善師長、貴人長輩，在關鍵節點總有人伸手相助。此星亦帶來良好名聲與人緣基礎，家族中多熱心之人，對外較少樹敵。若行運配合，適合善用家族、人脈資源，做橋樑與協調角色，更易被上層看見與提拔。',
  JSON_ARRAY('月德合對我的影響是什麼？', '年柱的月德合會如何影響我？', '我該如何善用月德合？', '月德合需要注意什麼？'),
  TRUE,
  0
);

-- 月德合在月柱
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'yue_de_he',
  'month',
  '月德合',
  '吉神',
  'auspicious',
  '圓融手腕，化解衝突',
  '月德貴人的配合之星，能化解婚姻、人際中的矛盾衝突，帶來和諧與貴人相助。',
  JSON_ARRAY('利於工作環境與人際關係', '善於化解衝突獲得信任', '逢兇化吉常有貴人相助'),
  '月德合落月柱，格外利於工作環境、人際關係與成長歷程。此人多具圓融手腕，懂得在團隊中緩和氣氛、化解衝突，深得同事與上司信任。職場或創業路上，每逢壓力與轉折，常會出現願意拉一把的貴人，使危機化為轉機。成長過程雖不必然一帆風順，但多能「逢兇化吉」，適合從事服務、協調、公關、顧問等需溝通與人情練達的行業。',
  JSON_ARRAY('月德合對我的職場有何幫助？', '月柱的月德合如何影響人際？', '我適合什麼工作？', '月德合的貴人何時出現？'),
  TRUE,
  0
);

-- 月德合在日柱
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'yue_de_he',
  'day',
  '月德合',
  '吉神',
  'auspicious',
  '性情溫厚，婚姻和諧',
  '月德貴人的配合之星，能化解婚姻、人際中的矛盾衝突，帶來和諧與貴人相助。',
  JSON_ARRAY('性情溫厚重情重義', '感情波折易化干戈為玉帛', '婚姻互相扶持不孤軍作戰'),
  '日柱主自我與婚姻，月德合臨此，多主性情溫厚、重情重義，對伴侶與親近之人常抱包容之心。感情路上即使有波折，也較易化干戈為玉帛，不至走到最壞局面。此星亦使本人在朋友圈中扮演「和事佬」，樂於調停他人是非。婚姻中若能保持坦誠與尊重，往往能吸引懂體諒、肯互相扶持的對象，共同經營生活，遇事有人商量、不孤軍作戰。',
  JSON_ARRAY('月德合對我的感情有何影響？', '日柱的月德合如何影響婚姻？', '我的伴侶會是什麼樣的人？', '如何經營好婚姻關係？'),
  TRUE,
  0
);

-- 月德合在时柱
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'yue_de_he',
  'hour',
  '月德合',
  '吉神',
  'auspicious',
  '庇蔭晚景，子女孝順',
  '月德貴人的配合之星，能化解婚姻、人際中的矛盾衝突，帶來和諧與貴人相助。',
  JSON_ARRAY('庇蔭晚景與子女緣分', '晚年有後輩照顧不孤寂', '子女性情善良能分憂'),
  '月德合坐時柱，多庇蔭晚景與子女緣分。人生後半段較有「越活越通透」之感，易得後輩、部屬或晚輩照顧扶持，不致孤寂。子女多性情善良，或在關鍵時刻能為自己分憂解勞。此星亦利於個人理想與副業發展，常在中晚年遇到欣賞自己的人，給予機會與資源。只要不自我封閉，願意維繫親情人脈，晚年運多呈穩中帶暖，有貴人、有依靠。',
  JSON_ARRAY('月德合對我的晚年有何影響？', '時柱的月德合如何影響子女？', '我的晚年運勢如何？', '如何維繫晚年人脈？'),
  TRUE,
  0
);

-- ========== 天德合（tian_de_he）==========

-- 天德合在年柱
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'tian_de_he',
  'year',
  '天德合',
  '吉神',
  'auspicious',
  '祖上積德，家風正直',
  '天德貴人的配合之星，主正直端方、逢兇化吉，能在關鍵時刻化解災厄。',
  JSON_ARRAY('得祖上積德之福', '幼年有長輩相助不致絕境', '家族重名聲講道義'),
  '天德合臨年柱，多得祖上積德之福，出身雖未必大富貴，但多有人情味、講道義的家庭環境。幼年與少年階段，遇事常有長輩伸手相助，不致走到絕境。此配置也主家族中多正直之人，重名聲、有羞恥心，不喜鋌而走險。若命局與行運配合，常因家族口碑良好而得外界信任，容易在長輩圈、人脈資源中受提攜，逢危多能化解。',
  JSON_ARRAY('天德合對我的影響是什麼？', '年柱的天德合會如何影響我？', '我該如何善用天德合？', '天德合需要注意什麼？'),
  TRUE,
  0
);

-- 天德合在月柱
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'tian_de_he',
  'month',
  '天德合',
  '吉神',
  'auspicious',
  '辦事有原則，正氣凜然',
  '天德貴人的配合之星，主正直端方、逢兇化吉，能在關鍵時刻化解災厄。',
  JSON_ARRAY('利於工作環境與人際', '多遇正派上司同事', '適合重公信力的行業'),
  '天德合落月柱，格外利於工作環境與日常人際，主在單位、團隊中多遇正派上司與同事，遇到制度、是非問題時，通常能站在較正直的一方，最後也較易得理。此人辦事有原則，心地不壞，雖偶有牴觸與壓力，但多有貴人暗中幫忙，讓困局出現轉機。適合在制度較重、公信力較重要的行業發展，如專業服務、公職、教育等，更能發揮其正氣與公信。',
  JSON_ARRAY('天德合對我的職場有何幫助？', '月柱的天德合如何影響事業？', '我適合什麼職業？', '天德合的貴人何時出現？'),
  TRUE,
  0
);

-- 天德合在日柱
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'tian_de_he',
  'day',
  '天德合',
  '吉神',
  'auspicious',
  '性格端正，婚姻穩健',
  '天德貴人的配合之星，主正直端方、逢兇化吉，能在關鍵時刻化解災厄。',
  JSON_ARRAY('性格端正有原則', '感情能避開歧途', '婚姻穩健踏實重承諾'),
  '日柱關乎本人與婚姻，天德合臨此，多主性格端正，有底線、有是非觀，對伴侶與家人願意負責。感情路上即使遇到波折，大多能靠自身正氣與貴人相助，避開最壞的選擇，不至誤入歧途。婚姻中較能吸引品行端正、講道德的對象，共同建立相對健康的家庭氛圍。此人處理情感問題時，雖不見得浪漫，但重承諾、重長遠，適合走穩健踏實的婚姻模式。',
  JSON_ARRAY('天德合對我的感情有何影響？', '日柱的天德合如何影響婚姻？', '我的伴侶會是什麼樣的人？', '如何經營好婚姻關係？'),
  TRUE,
  0
);

-- 天德合在时柱
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'tian_de_he',
  'hour',
  '天德合',
  '吉神',
  'auspicious',
  '晚年有德，子女正直',
  '天德貴人的配合之星，主正直端方、逢兇化吉，能在關鍵時刻化解災厄。',
  JSON_ARRAY('庇蔭晚年與子女', '子女性格正直願意支持', '晚年堅守原則逢兇化吉'),
  '天德合坐時柱，多庇蔭晚年與子女運勢，主晚景有德有福，不易孤苦。子女或部屬多性格正直，願意在關鍵時刻給予支持，不致讓自己獨自扛下所有壓力。人生中後段，作決策時若能堅守原則，不貪捷徑，多能逢凶化吉，躲過一些是非官非或投機風險。亦象徵晚年更重修心行善，樂於助人、分享經驗，反而因此聚攏人氣，精神世界較為充實安穩。',
  JSON_ARRAY('天德合對我的晚年有何影響？', '時柱的天德合如何影響子女？', '我的晚年運勢如何？', '如何修心行善聚攏人氣？'),
  TRUE,
  0
);

-- ========== 德秀贵人（de_xiu_gui_ren）==========

-- 德秀贵人在年柱
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'de_xiu_gui_ren',
  'year',
  '德秀貴人',
  '才華',
  'auspicious',
  '出身有文化，氣質斯文',
  '主才華、品味與氣質，代表文化修養與審美能力，利於文化藝術領域發展。',
  JSON_ARRAY('出身有文化底蘊', '幼年接觸人文藝術', '重名聲與氣質不喜粗俗'),
  '年柱見德秀貴人，多主出身環境較有文化底蘊，家中長輩重視教育與品行，言談舉止不失禮數。幼年便易接觸書畫、音樂或人文氣息濃厚的場域，耳濡目染之下，性格帶幾分斯文與清高。此配置往往讓命主較重名聲與氣質，不喜粗俗之事，人生早期便懂自我要求。若行運相扶，易因家世口碑與自身氣質，而在求學或職場初期獲得優待與機會。',
  JSON_ARRAY('德秀貴人對我的影響是什麼？', '年柱的德秀貴人會如何影響我？', '我該如何發揮文化才華？', '德秀貴人需要注意什麼？'),
  TRUE,
  0
);

-- 德秀贵人在月柱
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'de_xiu_gui_ren',
  'month',
  '德秀貴人',
  '才華',
  'auspicious',
  '思路細膩，以才華取勝',
  '主才華、品味與氣質，代表文化修養與審美能力，利於文化藝術領域發展。',
  JSON_ARRAY('利於學業工作人際', '思路細膩審美良好', '適合文化藝術相關行業'),
  '德秀貴人落月柱，格外利於學業、工作與人際氛圍，常遇懂欣賞自己才華的師長或上司。此人多思路細膩、審美良好，做事講究品質與品味，在團隊中容易成為「氣質代表」或形象窗口。職場上若從事設計、文字、教育、文化藝術相關行業，更能發揮優勢。雖未必大富大貴，但往往能在自己擅長的領域中建立口碑，以專業與風格取勝。',
  JSON_ARRAY('德秀貴人對我的事業有何幫助？', '月柱的德秀貴人如何影響工作？', '我適合什麼行業？', '如何建立專業口碑？'),
  TRUE,
  0
);

-- 德秀贵人在日柱
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'de_xiu_gui_ren',
  'day',
  '德秀貴人',
  '才華',
  'auspicious',
  '內心細膩，婚姻重格調',
  '主才華、品味與氣質，代表文化修養與審美能力，利於文化藝術領域發展。',
  JSON_ARRAY('內心細膩有品味', '重精神契合與生活質感', '婚姻看重交流與格調'),
  '日柱主自身與婚姻，德秀貴人臨此，多主命主內心細膩、有自我審美標準，重生活質感，也重精神層面的契合。待人處事偏溫和理性，表面不張揚，骨子裡卻有自己的堅持與品味。感情上較難委屈自己迎合粗鄙之人，容易被有修養、有才華的對象吸引，婚姻關係也較看重交流與格調。只要不過度挑剔，往往能收穫既講感情又講品味的伴侶。',
  JSON_ARRAY('德秀貴人對我的感情有何影響？', '日柱的德秀貴人如何影響婚姻？', '我會吸引什麼樣的伴侶？', '如何平衡品味與感情？'),
  TRUE,
  0
);

-- 德秀贵人在时柱
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'de_xiu_gui_ren',
  'hour',
  '德秀貴人',
  '才華',
  'auspicious',
  '晚年重修養，生活有層次',
  '主才華、品味與氣質，代表文化修養與審美能力，利於文化藝術領域發展。',
  JSON_ARRAY('庇蔭晚年與子女', '晚年重精神興趣不甘平庸', '子女具才華眼光有共同話題'),
  '德秀貴人坐時柱，多庇蔭晚年與子女緣，往往晚景重精神與興趣，不甘只為柴米奔波。中晚年有機會重新拾起學習、藝術、寫作或興趣副業，讓生活更有層次。子女或部屬多具才華或審美眼光，與自己有共同話題，願意在精神上互相支持。此配置也象徵，人越到後期越講究內在修養與生活品味，晚運雖未必極富，但多有氣質、有樂子，不致枯燥。',
  JSON_ARRAY('德秀貴人對我的晚年有何影響？', '時柱的德秀貴人如何影響子女？', '我的晚年生活如何？', '如何培養興趣副業？'),
  TRUE,
  0
);

-- ========== 龙德贵人（long_de_gui_ren）==========

-- 龙德贵人在年柱
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'long_de_gui_ren',
  'year',
  '龍德貴人',
  '貴人',
  'auspicious',
  '祖上有權望，自幼有氣度',
  '主權威、氣度與格局，代表貴氣與領導力，容易獲得上層賞識與提拔。',
  JSON_ARRAY('祖上有權望聲名', '早年有長輩指路', '自幼具向上之勢與體面感'),
  '年柱見龍德貴人，多主祖上有權望或聲名，家中長輩做事有擔當、有氣度。命主自幼較有「體面感」，在同輩中不願落於人後，內心帶著一股向上之勢。早年常逢長輩、師長提攜，在關鍵抉擇時有人指路，較少走極端之路。若行運配合，易因出身背景與自身氣場，被視為「可栽培的人」，在學業或事業起步階段較順。',
  JSON_ARRAY('龍德貴人對我的影響是什麼？', '年柱的龍德貴人會如何影響我？', '我該如何善用這份貴氣？', '龍德貴人需要注意什麼？'),
  TRUE,
  0
);

-- 龙德贵人在月柱
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'long_de_gui_ren',
  'month',
  '龍德貴人',
  '貴人',
  'auspicious',
  '職場有格局，易獲賞識',
  '主權威、氣度與格局，代表貴氣與領導力，容易獲得上層賞識與提拔。',
  JSON_ARRAY('利於職場格局與人際', '具領導意識能撐場面', '易遇高層貴人賞識'),
  '龍德貴人落月柱，格外利於職場環境與人際格局，主在單位、團隊中較能站上台面，負責對外溝通或主事角色。此人多有領導意識與格局眼光，談吐有分寸，能在關鍵場合替團隊撐場面。工作上常遇位階較高、願意賞識自己的貴人，給予機會與舞台。若能收斂鋒芒、不逞一時之氣，走的是「穩中帶貴」路線，職涯上升通道相對較清晰。',
  JSON_ARRAY('龍德貴人對我的事業有何幫助？', '月柱的龍德貴人如何影響職場？', '我適合擔任什麼角色？', '如何獲得高層賞識？'),
  TRUE,
  0
);

-- 龙德贵人在日柱
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'long_de_gui_ren',
  'day',
  '龍德貴人',
  '貴人',
  'auspicious',
  '自帶氣場，婚姻互相成就',
  '主權威、氣度與格局，代表貴氣與領導力，容易獲得上層賞識與提拔。',
  JSON_ARRAY('自帶氣場有尊嚴', '婚姻重互相成就與前途', '處事有格局不意氣用事'),
  '日柱為自身與婚姻，龍德貴人臨此，多主命主自帶氣場與尊嚴感，不喜低聲下氣，待人有原則。感情中較重身分感與互相成就，期望伴侶有一定能力或前途，兩人一起往上走。婚姻關係若經經營，多有「表面體面、內裡講道理」的風格，遇到矛盾時，宜用理性與格局處理，而非意氣之爭。只要不過度自尊作祟，往往能成為彼此成就的一對。',
  JSON_ARRAY('龍德貴人對我的感情有何影響？', '日柱的龍德貴人如何影響婚姻？', '我會吸引什麼樣的伴侶？', '如何與伴侶互相成就？'),
  TRUE,
  0
);

-- 龙德贵人在时柱
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'long_de_gui_ren',
  'hour',
  '龍德貴人',
  '貴人',
  'auspicious',
  '晚年仍有機會，子女爭氣',
  '主權威、氣度與格局，代表貴氣與領導力，容易獲得上層賞識與提拔。',
  JSON_ARRAY('庇蔭中晚年與子女', '子女上進有氣勢能增光', '晚年仍有上升翻身機會'),
  '龍德貴人坐時柱，多庇蔭中晚年與子女發展，主晚景仍有上升或翻身的機會，不至於早早躺平。子女多帶氣勢或上進心，容易在學業、事業上爭一口氣，替家庭增光。中晚年常逢事業第二春或角色轉換，如創業、管理、帶團隊等，仍有展現領導力的舞台。若能持續修身立德，不貪僥倖之財與捷徑，是越到後期越有分量、越有話語權的格局。',
  JSON_ARRAY('龍德貴人對我的晚年有何影響？', '時柱的龍德貴人如何影響子女？', '我的晚年事業如何發展？', '如何把握第二春機會？'),
  TRUE,
  0
);

