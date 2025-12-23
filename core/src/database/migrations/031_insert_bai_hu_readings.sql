-- 插入白虎的解读内容
-- 版本：v1.0
-- 创建日期：2025-12-XX
-- 用途：补充白虎在四个柱位的完整解读

-- ========== 白虎（bai_hu）==========

-- 白虎在年柱
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, gender, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'bai_hu',
  'year',
  'all',
  '白虎',
  '血光',
  'inauspicious',
  '家族波折，風險敏感',
  '白虎為四柱神煞中的凶煞，主意外傷害、血光、手術、官非、刑責、驚嚇。',
  JSON_ARRAY('原生家庭或家族層面曾經歷較多波折與驚險', '長輩有意外傷災、官非糾紛', '對「風險」和「安全感」特別敏感'),
  '年柱見白虎，多主原生家庭或家族層面曾經歷較多波折與驚險，例如長輩有意外傷災、官非糾紛、行業本身帶風險（軍警、工程、醫護、駕駛等）。命主自小耳濡目染，對「風險」和「安全感」特別敏感，有時也會帶著對災禍的隱性焦慮。若行運再逢凶星，宜特別留意家族層面的健康、車關與法律文書；若有吉星扶持，則多為在動盪環境中鍛鍊抗壓與生存能力。',
  JSON_ARRAY('白虎對我的影響是什麼？', '年柱的白虎會如何影響我？', '我該如何防範血光之災？', '白虎需要注意什麼？'),
  TRUE,
  0
);

-- 白虎在月柱
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, gender, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'bai_hu',
  'month',
  'all',
  '白虎',
  '血光',
  'inauspicious',
  '職場風險，危機處理',
  '白虎為四柱神煞中的凶煞，主意外傷害、血光、手術、官非、刑責、驚嚇。',
  JSON_ARRAY('在成長過程與職場環境中，多身處壓力與變化較大的場域', '工作性質容易牽涉風險、責任與生死攸關', '適合養成「安全意識＋合規思維」'),
  '白虎落月柱，象徵命主在成長過程與職場環境中，多身處壓力與變化較大的場域。工作性質容易牽涉風險、責任與生死攸關，如醫護、軍警、消防、工程、金融風控等；或常要面對投訴、責任追究、突發狀況。用得好，能培養臨危不亂、處理危機的專業能力；用不好，則容易因粗心、逞強或違規而惹禍。特別適合養成「安全意識＋合規思維」，把白虎變成「危機處理專家」而不是「出事的人」。',
  JSON_ARRAY('白虎對我的職場有何影響？', '月柱的白虎如何影響工作？', '我適合什麼工作？', '如何避免職場意外？'),
  TRUE,
  0
);

-- 白虎在日柱
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, gender, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'bai_hu',
  'day',
  'all',
  '白虎',
  '血光',
  'inauspicious',
  '個人安全，情緒管理',
  '白虎為四柱神煞中的凶煞，主意外傷害、血光、手術、官非、刑責、驚嚇。',
  JSON_ARRAY('在生活與感情婚姻中，需要特別重視安全、健康與情緒管理', '個性上可能偏直接、行動力強', '容易小傷小痛不在意，累積成大問題'),
  '日柱見白虎，主命主本人在生活與感情婚姻中，需要特別重視安全、健康與情緒管理。個性上可能偏直接、行動力強，有時對危險的評估略顯樂觀，容易小傷小痛不在意，累積成大問題。感情與家庭中，則宜避免衝動言行，把矛盾升級為法律或暴力層面的衝突。若命局中有官星、印星配合，反而適合在需要處理風險、執法或救援的領域發揮長處，以「替別人擋災」的方式化煞為用。',
  JSON_ARRAY('白虎對我的感情有何影響？', '日柱的白虎如何影響婚姻？', '我該如何防範意外？', '如何化煞為用？'),
  TRUE,
  0
);

-- 白虎在时柱
INSERT INTO shensha_readings (
  reading_id, shensha_code, pillar_type, gender, name, badge_text, type,
  short_title, summary, bullet_points, for_this_position, recommended_questions,
  is_active, sort_order
) VALUES (
  UUID(),
  'bai_hu',
  'hour',
  'all',
  '白虎',
  '血光',
  'inauspicious',
  '晚年安全，提早規劃',
  '白虎為四柱神煞中的凶煞，主意外傷害、血光、手術、官非、刑責、驚嚇。',
  JSON_ARRAY('後半生在健康與安全層面要格外留心', '子女或晚輩可能從事帶風險或高壓的行業', '及早為自己與家人做好保險、醫療、法律與財務規劃'),
  '白虎坐時柱，多應在中晚年運勢以及子女相關事務上。命主後半生在健康與安全層面要格外留心，如車禍、跌倒、開刀手術等，事前做好檢查與預防往往能把大事化小。子女或晚輩可能從事帶風險或高壓的行業，或性格較衝，容易捲入突發事件；命主既擔心又難以完全干涉。及早為自己與家人做好保險、醫療、法律與財務規劃，能讓白虎從「未知風險」變成「可控風險」，將凶勢降到最低。',
  JSON_ARRAY('白虎對我的晚年有何影響？', '時柱的白虎如何影響子女？', '我的晚年運勢如何？', '如何做好安全規劃？'),
  TRUE,
  0
);


