-- 插入空亡的解读内容
-- 版本：v1.0
-- 创建日期：2025-12-XX
-- 用途：补充空亡在四个柱位的完整解读（以日柱定旬，检查四柱地支）

-- ========== 空亡（kong_wang）==========

-- 空亡在年柱
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, gender, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'kong_wang',
  'year',
  'all',
  '空亡',
  '虛實',
  'neutral',
  '家族名實不一，情感連結弱',
  '空亡為四柱神煞中的虛實之星，主虛、遲、不實、落空、內在化等特質。',
  JSON_ARRAY('原生家庭、家族資源或家世背景帶有「名實不一」的特點', '家族成員之間距離較遠、各有各的生活', '對「根、家族」的感受較複雜'),
  '年柱落空，多主原生家庭、家族資源或家世背景帶有「名實不一」的特點。可能表面上家境不錯、門面體面，實際內部壓力多；也可能家族成員之間距離較遠、各有各的生活，情感連結感偏弱。命主對「根、家族」的感受較複雜，一方面在意血緣與出身，一方面又覺得很難真正依靠。這類配置，常讓人早早產生「要靠自己」的念頭，後天能否補上安全感，多看自身打拼與後來建立的家庭。',
  JSON_ARRAY('空亡對我的影響是什麼？', '年柱的空亡會如何影響我？', '我該如何化解空亡？', '空亡需要注意什麼？'),
  TRUE,
  0
);

-- 空亡在月柱
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, gender, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'kong_wang',
  'month',
  'all',
  '空亡',
  '虛實',
  'neutral',
  '職場落空，機會打折',
  '空亡為四柱神煞中的虛實之星，主虛、遲、不實、落空、內在化等特質。',
  JSON_ARRAY('成長過程、同輩圈與職場環境中，常有「看起來很好，實際落空」的情況', '起初機會很多、聲勢不錯，但真正落實到結果時，容易因種種變數而打折', '人際上也常遇到「講得熱鬧、實際幫不上忙」的關係'),
  '月柱空亡，象徵成長過程、同輩圈與職場環境中，常有「看起來很好，實際落空」的情況。例如：起初機會很多、聲勢不錯，但真正落實到結果時，容易因種種變數而打折；人際上也常遇到「講得熱鬧、實際幫不上忙」的關係。優點是命主在變化中學會看清人情冷暖，不容易被表面光鮮迷惑；缺點是難免產生「不敢太期待」的習慣，有時會錯失真正值得投入的機會。若能在行動前做好方案與風險評估，空亡反而能成為判斷虛實的敏銳雷達。',
  JSON_ARRAY('空亡對我的職場有何影響？', '月柱的空亡如何影響人際？', '我適合什麼工作？', '如何判斷虛實？'),
  TRUE,
  0
);

-- 空亡在日柱
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, gender, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'kong_wang',
  'day',
  'all',
  '空亡',
  '虛實',
  'neutral',
  '表面堅強，內心空虛',
  '空亡為四柱神煞中的虛實之星，主虛、遲、不實、落空、內在化等特質。',
  JSON_ARRAY('性格上常帶一點「表面堅強、內心空虛」的矛盾', '在關鍵時刻容易猶豫、退縮，或讓承諾「說得多、落實少」', '在感情上，一生不乏心動與機會，但真正能走到實際、長久穩定的，需經過篩選與時間考驗'),
  '日柱空亡，直接作用在命主本身與感情婚姻。性格上常帶一點「表面堅強、內心空虛」的矛盾，一方面很清楚自己要什麼，一方面又在關鍵時刻容易猶豫、退縮，或讓承諾「說得多、落實少」。在感情上，一生不乏心動與機會，但真正能走到實際、長久穩定的，需經過篩選與時間考驗。有時也主伴侶形象、條件與實際婚姻生活有落差，或婚姻本身帶「不夠踏實」的感受。這顆星不是註定孤單，而是提醒：越是重要的關係與選擇，越要用具體行動去填補，而不是只停留在想像與承諾裡。',
  JSON_ARRAY('空亡對我的感情有何影響？', '日柱的空亡如何影響婚姻？', '我的伴侶會是什麼樣的人？', '如何填補空亡？'),
  TRUE,
  0
);

-- 空亡在时柱
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, gender, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'kong_wang',
  'hour',
  'all',
  '空亡',
  '虛實',
  'neutral',
  '晚年空想，珍惜當下',
  '空亡為四柱神煞中的虛實之星，主虛、遲、不實、落空、內在化等特質。',
  JSON_ARRAY('對未來常有許多想法與計畫，理想藍圖豐富', '若缺乏持續執行，容易停留在「想了很多、實際做的不多」', '子女或晚輩方面，可能出現與自己期待不同的發展路線'),
  '時柱落空，多應在中晚年狀態與子女相關事務上。命主對未來常有許多想法與計畫，理想藍圖豐富，但若缺乏持續執行，容易停留在「想了很多、實際做的不多」。中晚年若不及早規劃健康、財務與退休安排，就會有「時間一下子就過去了」的空虛感。子女或晚輩方面，可能出現與自己期待不同的發展路線，或彼此相處時間少於心理上的牽掛，形成「心在一起，實際各忙各的」的狀態。若能提早用具體行動（陪伴、規劃、落實）去取代空想，空亡反而會讓人更懂得珍惜當下，不再把重要的事拖到未來。',
  JSON_ARRAY('空亡對我的晚年有何影響？', '時柱的空亡如何影響子女？', '我的晚年運勢如何？', '如何珍惜當下？'),
  TRUE,
  0
);


