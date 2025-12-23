-- 插入官符的解读内容
-- 版本：v1.0
-- 创建日期：2025-12-XX
-- 用途：补充官符在四个柱位的完整解读

-- ========== 官符（guan_fu）==========

-- 官符在年柱
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, gender, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'guan_fu',
  'year',
  'all',
  '官符',
  '官非',
  'inauspicious',
  '家族層面，制度規範',
  '官符為四柱神煞中的官非之星，主官司是非、法律麻煩、被罰被查、文書錯誤惹禍。',
  JSON_ARRAY('原生家庭或家族層面容易與政府機關、制度規範打交道', '可能有從事公職、軍警司法、稅務審計等', '對「規定、流程、紅線」較敏感'),
  '年柱見官符，多主原生家庭或家族層面容易與政府機關、制度規範打交道，可能有從事公職、軍警司法、稅務審計等，也可能因房產、土地、營業登記等事務與公部門往來頻繁。命主自小對「規定、流程、紅線」較敏感，一方面懂得敬畏制度；另一方面也易因前輩處理不善的文書、借貸或糾紛，間接受到牽連。若行運再觸是非星，宜特別重視家族層面的合約與法律問題。',
  JSON_ARRAY('官符對我的影響是什麼？', '年柱的官符會如何影響我？', '我該如何防範官非？', '官符需要注意什麼？'),
  TRUE,
  0
);

-- 官符在月柱
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, gender, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'guan_fu',
  'month',
  'all',
  '官符',
  '官非',
  'inauspicious',
  '職場審核，文書錯誤',
  '官符為四柱神煞中的官非之星，主官司是非、法律麻煩、被罰被查、文書錯誤惹禍。',
  JSON_ARRAY('在工作職場、同輩圈中，易遇到審核、查帳、稽核、投訴、申訴等情況', '文書錯誤、流程疏忽特別容易引發麻煩', '所處行業可能本身就與制度、合約、法規密切相關'),
  '月柱帶官符，象徵命主在工作職場、同輩圈中，易遇到審核、查帳、稽核、投訴、申訴等情況，文書錯誤、流程疏忽特別容易引發麻煩。所處行業可能本身就與制度、合約、法規密切相關，如金融、保險、地產、醫療、教育、公職等。優點是若能熟悉規章，反而能在這些領域中建立專業威信；缺點是怕麻煩但又逃不掉，所以更需要養成「留紀錄、守流程、慎簽字」的習慣。',
  JSON_ARRAY('官符對我的職場有何影響？', '月柱的官符如何影響工作？', '我適合什麼工作？', '如何避免文書錯誤？'),
  TRUE,
  0
);

-- 官符在日柱
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, gender, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'guan_fu',
  'day',
  'all',
  '官符',
  '官非',
  'inauspicious',
  '個人選擇，法律波折',
  '官符為四柱神煞中的官非之星，主官司是非、法律麻煩、被罰被查、文書錯誤惹禍。',
  JSON_ARRAY('在個人選擇與感情婚姻上，容易因證件、程序、法律條款而波折', '伴侶本身也可能從事與法律、公職、行政審核相關的工作', '常因責任、規則、契約感產生拉扯'),
  '日柱見官符，多主命主在個人選擇與感情婚姻上，容易因證件、程序、法律條款而波折，例如婚姻登記、財產分配、合約條款、居留身份、工作簽證等問題。伴侶本身也可能從事與法律、公職、行政審核相關的工作，或是兩人在相處過程中，常因責任、規則、契約感產生拉扯。用得好，是懂得在關係中講清權責、保護彼此；用不好，則因互不信任而過度法律化，讓感情少了溫度。',
  JSON_ARRAY('官符對我的感情有何影響？', '日柱的官符如何影響婚姻？', '我的伴侶會是什麼樣的人？', '如何平衡法律與感情？'),
  TRUE,
  0
);

-- 官符在时柱
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, gender, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'guan_fu',
  'hour',
  'all',
  '官符',
  '官非',
  'inauspicious',
  '晚年制度，提早規劃',
  '官符為四柱神煞中的官非之星，主官司是非、法律麻煩、被罰被查、文書錯誤惹禍。',
  JSON_ARRAY('後半生易面臨退休制度、保險、遺產、稅務、養老安排等官方制度問題', '子女或晚輩可能與公職、法律、稅務、行政審核等領域有緣', '建議提早規劃文件、財務與法律安排'),
  '時柱帶官符，多應在中晚年以及子女相關事務上。命主後半生易面臨退休制度、保險、遺產、稅務、養老安排等官方制度問題，處理得當則能穩固晚年生活；忽略不管則可能因小疏忽付出高代價。子女或晚輩可能與公職、法律、稅務、行政審核等領域有緣，或在學業與職涯選擇上面對較多制度性的關卡。建議提早規劃文件、財務與法律安排，能將官符的壓力轉成對自己與家人的保護。',
  JSON_ARRAY('官符對我的晚年有何影響？', '時柱的官符如何影響子女？', '我的晚年運勢如何？', '如何做好法律規劃？'),
  TRUE,
  0
);


