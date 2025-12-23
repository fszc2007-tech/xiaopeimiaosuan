-- 更新所有神煞解读内容
-- 版本：v2.0
-- 创建日期：2025-12-03
-- 用途：补充完整的柱位解读内容

-- ========== 天乙貴人（tian_yi_gui_ren）==========
-- 標籤：貴人

UPDATE shensha_readings SET 
  badge_text = '貴人',
  for_this_position = '年柱見天乙貴人，多得祖上積德與長輩護持，家族中常有講義氣、肯提攜後輩之人。命主自幼較少走極端路，遇到關卡多有師長、親友伸手相助，不致陷入絕境。此象亦主家族名聲尚可，在同輩圈中較易受信任，只要自己不自毀前程，人生關鍵節點往往有人幫忙指路。'
WHERE shensha_code = 'tian_yi_gui_ren' AND pillar_type = 'year';

UPDATE shensha_readings SET 
  badge_text = '貴人',
  for_this_position = '天乙貴人落月柱，格外利於職場與日常人際，象徵在單位、團隊中常有願意罩你的上司、同事或前輩。遇到制度、轉職、升遷等問題時，容易得到內部人士提醒與支持，讓事情朝較有利方向發展。工作中若能保持專業與誠信，貴人會一次比一次更有份量，幫你打開新的階段。'
WHERE shensha_code = 'tian_yi_gui_ren' AND pillar_type = 'month';

UPDATE shensha_readings SET 
  badge_text = '貴人',
  for_this_position = '日柱見天乙貴人，多主命主個人氣場溫和而帶福氣，即使偶有衝動錯誤，也較易遇到願意拉一把、給機會的人。感情上，較能吸引品行不錯、肯照顧你的對象，彼此遇到難關時，多有外界伸出援手。只要懂得珍惜與回饋，不濫用他人好意，往往能在跌倒後更穩地站起來。'
WHERE shensha_code = 'tian_yi_gui_ren' AND pillar_type = 'day';

UPDATE shensha_readings SET 
  badge_text = '貴人',
  for_this_position = '天乙貴人坐時柱，多庇蔭中晚年與子女運。人生後半段遇到轉職、創業、退休安排等課題時，身邊常出現專業人士或有經驗的前輩指點。子女、晚輩或部屬中，亦常有人願意分擔、扶持，使你不致孤軍奮戰。只要保持開放心態，樂於與人結善緣，晚景多呈現「有人幫、有人敬」的狀態。'
WHERE shensha_code = 'tian_yi_gui_ren' AND pillar_type = 'hour';

-- ========== 文昌貴人（wen_chang_gui_ren）==========
-- 標籤：才華

UPDATE shensha_readings SET 
  badge_text = '才華',
  for_this_position = '年柱見文昌，多主出身環境重視教育與禮儀，家中長輩愛看書、講道理，對命主學習要求不低。童年較易接觸文字、書畫或考試競賽，早早建立起讀書與思考的習慣。此象亦主少年時期在成績、語言表達上有可取之處，只要不懶惰，常能比同齡人更具文采。'
WHERE shensha_code = 'wen_chang_gui_ren' AND pillar_type = 'year';

UPDATE shensha_readings SET 
  badge_text = '才華',
  for_this_position = '文昌落月柱，格外利學業與工作中的專業能力。此人頭腦清晰，記憶力佳，容易在考試、升學或專業證照上有佳績。職場中擅長文字、數據、方案撰寫與溝通記錄，適合從事教育、文案、設計、策劃、法律、顧問等行業。只要持續精進，專業知名度與口碑會慢慢累積起來。'
WHERE shensha_code = 'wen_chang_gui_ren' AND pillar_type = 'month';

UPDATE shensha_readings SET 
  badge_text = '才華',
  for_this_position = '日柱見文昌，多主本人心思細膩、好學好問，說話較有條理，願意用思考解決問題。感情中偏理性交流型，重視溝通品質與精神層面的互動，容易被有內涵、有話題深度的伴侶吸引。也象徵在婚姻生活中，喜歡學習、分享新知，一起成長比單純物質更重要。'
WHERE shensha_code = 'wen_chang_gui_ren' AND pillar_type = 'day';

UPDATE shensha_readings SET 
  badge_text = '才華',
  for_this_position = '文昌坐時柱，多利中晚年進修與子女學業。人生後半段仍保有求知慾，不排斥重新學習新技能或開展副業。子女多聰明伶俐、學習能力不差，只要教育方式得當，常能在學業或才藝方面有亮點。晚年生活偏向精神與興趣充實型，而非只圍繞柴米油鹽。'
WHERE shensha_code = 'wen_chang_gui_ren' AND pillar_type = 'hour';

-- ========== 太極貴人（tai_ji_gui_ren）==========
-- 標籤：智慧

UPDATE shensha_readings SET 
  badge_text = '智慧',
  for_this_position = '年柱見太極，多主出身家庭重精神層面與道德觀，或家中長輩對宗教、哲學、傳統文化有興趣。命主從小對人生意義、是非對錯較敏感，容易思考「為何如此」，不只停留在表面。此象亦主與宗教、命理、醫療、心理等領域容易結緣，早年就有機會接觸相關觀念。'
WHERE shensha_code = 'tai_ji_gui_ren' AND pillar_type = 'year';

UPDATE shensha_readings SET 
  badge_text = '智慧',
  for_this_position = '太極落月柱，象徵命主在職場與日常人際中，常扮演調和、理解與諮詢的角色。對他人情緒、痛點有直覺，適合從事心理諮商、醫護、命理、宗教服務、療癒、顧問等相關工作。做事不喜粗暴，較重內在原則與長遠因果，在團隊中常被視為「有深度」的人。'
WHERE shensha_code = 'tai_ji_gui_ren' AND pillar_type = 'month';

UPDATE shensha_readings SET 
  badge_text = '智慧',
  for_this_position = '日柱見太極，多主本人帶點神秘與靈性氣質，內心世界豐富，思考層次容易超出同齡。對感情與婚姻不只求形式，更看重心靈契合與價值觀一致。也較容易接觸命理、宗教、心理成長類領域，從中找到安定感。若能善用這份敏感與洞察力，對自己與伴侶的成長都很有幫助。'
WHERE shensha_code = 'tai_ji_gui_ren' AND pillar_type = 'day';

UPDATE shensha_readings SET 
  badge_text = '智慧',
  for_this_position = '太極坐時柱，多庇蔭晚年精神世界與子女緣。中晚年對修身養性、哲學、命理、宗教、養生等議題特別有感，願意調整生活步調，追求心靈安穩。子女或晚輩中，也容易有人走向專業助人、研究或靈性相關領域。晚景多偏「越活越看得開」的類型，重心更在內在平靜。'
WHERE shensha_code = 'tai_ji_gui_ren' AND pillar_type = 'hour';

-- ========== 月德貴人（yue_de_gui_ren）==========
-- 標籤：吉神

UPDATE shensha_readings SET 
  badge_text = '吉神',
  for_this_position = '年柱有月德，多主祖上積德，家族中多心地不壞之人。出身不一定顯赫，但遇事常有人情味與互相幫襯。命主幼年即便遭逢波折，仍較容易遇上肯伸手的師長與親戚，使事情往較好的方向收束。此星亦有化煞之意，許多凶象在實際發生時，常會打折或化為小事。'
WHERE shensha_code = 'yue_de_gui_ren' AND pillar_type = 'year';

UPDATE shensha_readings SET 
  badge_text = '吉神',
  for_this_position = '月德落月柱，象徵工作與人際場域中常有溫和型貴人，遇到衝突與誤會時，有人願意在中間調和。命主本身也較易心存善念，即便不完美，仍願意在力所能及時幫助他人。在職場轉換、團隊變動、壓力較大的年份，月德常發揮「逢凶化吉」的效果，讓結果沒有想像那麼糟。'
WHERE shensha_code = 'yue_de_gui_ren' AND pillar_type = 'month';

UPDATE shensha_readings SET 
  badge_text = '吉神',
  for_this_position = '日柱見月德，多主個性厚道，對家人與伴侶雖偶有情緒，但終究不捨得真心傷害對方。感情路上縱有挫折，也常因自身善念與外界幫忙，避開最極端的結局。婚姻中較重包容與照顧，只要雙方願意溝通，很多矛盾可以慢慢化解。此星也使命主較有「吃虧是福」的福報感。'
WHERE shensha_code = 'yue_de_gui_ren' AND pillar_type = 'day';

UPDATE shensha_readings SET 
  badge_text = '吉神',
  for_this_position = '月德坐時柱，多庇蔭晚年運與子女緣。中晚年遇到健康、財務或家庭事件時，常會出現願意幫忙的親友、醫護或專業人士。子女與晚輩中，也多有心腸柔軟、懂感恩的一批人，在你需要時伸出援手。整體晚景氣氛偏溫和，不至孤立無援，只要自己仍願意維繫情份。'
WHERE shensha_code = 'yue_de_gui_ren' AND pillar_type = 'hour';

-- ========== 天德貴人（tian_de_gui_ren）==========
-- 標籤：吉神

UPDATE shensha_readings SET 
  badge_text = '吉神',
  for_this_position = '年柱見天德，多主祖上積善，家族氣場較正直，不喜歪門邪道。命主早年若遇意外變動或不公情況，常有長輩出面主持公道或暗中幫忙，讓事情往正向結果發展。此星有化煞之力，很多原本可能發展成大麻煩的事，最後雖辛苦，仍能「有驚無險」。'
WHERE shensha_code = 'tian_de_gui_ren' AND pillar_type = 'year';

UPDATE shensha_readings SET 
  badge_text = '吉神',
  for_this_position = '天德落月柱，特別利職場與社交場域中的「正氣人脈」。命主身邊較容易聚集態度正派、願意講原則的同事與上司，在面對制度、規範、是非問題時，不必單打獨鬥。若自身也能堅守底線，不為小利所動，許多職場小人或暗箭，最終會因形勢與貴人出手而化解。'
WHERE shensha_code = 'tian_de_gui_ren' AND pillar_type = 'month';

UPDATE shensha_readings SET 
  badge_text = '吉神',
  for_this_position = '日柱見天德，多主本人重道德感與責任感，寧可自己辛苦，也不願做傷天害理之事。感情與婚姻中，即便遇到誘惑與考驗，也較有能力踩住界線。當關係陷入僵局時，常有長輩或懂事之人出面調停，使局面不至於撕裂到底。此星也讓命主在關鍵選擇上，多半能回到「對得起自己」的一邊。'
WHERE shensha_code = 'tian_de_gui_ren' AND pillar_type = 'day';

UPDATE shensha_readings SET 
  badge_text = '吉神',
  for_this_position = '天德坐時柱，多庇蔭中晚年與子女、部屬運。人生後段遇到重大選擇與風險事件時，只要不貪心，往往能被「看不見的手」推向較安全的道路。子女或晚輩中，亦有人品端正、願意為家人挺身而出。此象也讓晚年更重視行善積德與內在修為，從而累積口碑與福報。'
WHERE shensha_code = 'tian_de_gui_ren' AND pillar_type = 'hour';

-- ========== 紅鸞（hong_luan）==========
-- 標籤：桃花

UPDATE shensha_readings SET 
  badge_text = '桃花',
  for_this_position = '年柱見紅鸞，多主出身環境較懂人情世故，家族中辦喜事、聚會場合不少，命主自小接觸婚嫁、人情往來議題。感情觀偏向浪漫中帶實際，對愛情有憧憬。成年後較容易在家族、同學圈中被撮合或介紹對象，婚緣多透過熟人牽線而來。'
WHERE shensha_code = 'hong_luan' AND pillar_type = 'year';

UPDATE shensha_readings SET 
  badge_text = '桃花',
  for_this_position = '紅鸞落月柱，象徵在工作、學校或日常社交場域中容易有心動與戀愛機會。命主人際互動帶幾分親和與溫度，異性緣不錯。也主在團隊聚餐、活動、學習場合中較容易遇到重要感情對象。若能保持清醒與自重，這顆星多帶來甜蜜與喜事，而非單純的情緒起伏。'
WHERE shensha_code = 'hong_luan' AND pillar_type = 'month';

UPDATE shensha_readings SET 
  badge_text = '桃花',
  for_this_position = '日柱見紅鸞，多主本人重感情、有浪漫細胞，對婚姻與伴侶有自己的幻想與期待。容易在相處中營造氛圍，令關係有儀式感。此象也主婚緣不算太遲，只要不一味沉溺於感覺，能理性選擇對的人，往往能遇到讓自己心動且願意共度生活的伴侶。'
WHERE shensha_code = 'hong_luan' AND pillar_type = 'day';

UPDATE shensha_readings SET 
  badge_text = '桃花',
  for_this_position = '紅鸞坐時柱，多與中晚年感情生活、子女情感有所關聯。晚年仍保有對生活的熱情與柔軟，並不排斥在後半生經營感情與家庭氛圍。子女或晚輩在感情上也較早有對象，或婚嫁喜訊較多，使家中不乏喜慶氣氛。整體來說，紅鸞於此使晚景不至於情感枯燥。'
WHERE shensha_code = 'hong_luan' AND pillar_type = 'hour';

-- ========== 天喜（tian_xi）==========
-- 標籤：喜事

UPDATE shensha_readings SET 
  badge_text = '喜事',
  for_this_position = '年柱見天喜，多主家族中喜事不絕於耳，命主自小對婚嫁、生子、宴席這類場合不陌生。性格中帶幾分樂觀與隨和，對感情與家庭抱有溫暖期待。成年後家族長輩樂於替你張羅婚姻或重要喜事，容易在親友安排下迎來關鍵轉折。'
WHERE shensha_code = 'tian_xi' AND pillar_type = 'year';

UPDATE shensha_readings SET 
  badge_text = '喜事',
  for_this_position = '天喜落月柱，象徵在工作、朋友圈與校園環境中易有喜事臨門，如升遷、合作成功、戀愛、訂婚等。命主在團隊氛圍中常扮演帶歡樂、帶溫度的角色，人緣佳。感情容易從合作、同事、同學關係中萌芽，只要彼此誠實相待，有機會走向長期關係。'
WHERE shensha_code = 'tian_xi' AND pillar_type = 'month';

UPDATE shensha_readings SET 
  badge_text = '喜事',
  for_this_position = '日柱見天喜，多主在感情與婚姻上具備「逢合多喜」的特質。雖不代表毫無波折，但多能在適當時間走入婚姻或穩定關係。命主個性溫暖，容易營造家庭中的節慶與儀式感，願意為伴侶與家人準備驚喜與歡樂。只要不沉迷於表面的熱鬧，這顆星多帶來實際幸福感。'
WHERE shensha_code = 'tian_xi' AND pillar_type = 'day';

UPDATE shensha_readings SET 
  badge_text = '喜事',
  for_this_position = '天喜坐時柱，多庇蔭中晚年與子女喜訊。晚年生活不乏婚宴、滿月酒、升職、得獎等喜事輪番而來，讓人生尾聲不顯沉悶。子女與晚輩中亦常有人在婚姻、事業上傳來好消息，使你分享榮耀與歡樂。此星於此，晚景多帶笑聲與聚會。'
WHERE shensha_code = 'tian_xi' AND pillar_type = 'hour';

-- ========== 桃花/咸池（tao_hua）==========
-- 標籤：桃花

UPDATE shensha_readings SET 
  badge_text = '桃花',
  for_this_position = '年柱見桃花，多主原生家庭對人情味與社交較不陌生，命主從小就觀察到男女情感互動，對「喜歡、吸引」有早熟理解。長大後在家族、同學圈中易成為被注意的對象，顏值、氣質或說話方式較能吸睛。需留意青春期情感過早投入，以免影響學業與心情穩定。'
WHERE shensha_code = 'tao_hua' AND pillar_type = 'year';

UPDATE shensha_readings SET 
  badge_text = '桃花',
  for_this_position = '桃花落月柱，象徵在職場與朋友圈中異性緣明顯，人際互動熱絡。命主常因外型、氣場或談吐，吸引他人靠近，邀約與曖昧機會較多。適合作與美感、表達、服務業相關的工作，但需留意公私界線，避免辦公室戀情與情感糾結影響專業判斷。'
WHERE shensha_code = 'tao_hua' AND pillar_type = 'month';

UPDATE shensha_readings SET 
  badge_text = '桃花',
  for_this_position = '日柱見桃花，多主本人情感豐富、重感覺，戀愛時投入度高。對伴侶要求既看外在吸引，也在意相處氛圍，容易陷入一見鍾情或短期強烈心動。若能在選擇時多看三觀與長期配合，而非只看荷爾蒙，則這顆星會帶來浪漫與魅力，而非麻煩與後悔。'
WHERE shensha_code = 'tao_hua' AND pillar_type = 'day';

UPDATE shensha_readings SET 
  badge_text = '桃花',
  for_this_position = '桃花坐時柱，多與中晚年感情生活及子女情事相關。晚年仍保有對美與愛的敏感度，不喜生活枯燥，可能在興趣圈、旅遊或社團活動中認識異性朋友。子女在感情表現上也較活躍，追求自由戀愛。需要提醒的是，家庭與情感界線要拿捏分寸，以免無心之舉被誤解。'
WHERE shensha_code = 'tao_hua' AND pillar_type = 'hour';

-- ========== 驛馬（yi_ma）==========
-- 標籤：奔波

UPDATE shensha_readings SET 
  badge_text = '奔波',
  for_this_position = '年柱見驛馬，多主祖上或原生家庭有遷移、奔波、外地打拼的背景。命主自幼就對外面的世界充滿好奇，較難安於一隅。成年後容易離開家鄉求學或工作，人生主題與「走動、搬遷、轉換環境」脫不了關係。只要心態積極，奔波常帶來視野與機會。'
WHERE shensha_code = 'yi_ma' AND pillar_type = 'year';

UPDATE shensha_readings SET 
  badge_text = '奔波',
  for_this_position = '驛馬落月柱，象徵在工作與生活中奔波感強，常因職務、專案、學習而需要出差、移動或切換場域。命主耐不住長期停滯，適合從事需要流動性的行業，如業務、外勤、顧問、旅遊、物流等。需注意的是，長期奔波要照顧好體力與作息，避免因疲累帶來小意外。'
WHERE shensha_code = 'yi_ma' AND pillar_type = 'month';

UPDATE shensha_readings SET 
  badge_text = '奔波',
  for_this_position = '日柱見驛馬，多主本人心性不喜被綁死，對生活、感情與工作的變化持開放態度。婚姻中可能因工作調動、移民、換城市居住等，經歷幾次環境重大轉換。若伴侶能接受這種機動性，兩人反而能一起見識不同世界；若彼此期望一成不變，則需多溝通取得平衡。'
WHERE shensha_code = 'yi_ma' AND pillar_type = 'day';

UPDATE shensha_readings SET 
  badge_text = '奔波',
  for_this_position = '驛馬坐時柱，多庇蔭中晚年仍有行動力與行程安排。退休後仍不甘只待在家裡，喜歡旅遊、探訪親友、參與活動。子女或晚輩也可能在異地發展，使你有更多遠行探望的機會。此象使晚年生活較不單調，但也要留意交通安全與體力分配。'
WHERE shensha_code = 'yi_ma' AND pillar_type = 'hour';

-- ========== 將星（jiang_xing）==========
-- 標籤：權勢

UPDATE shensha_readings SET 
  badge_text = '權勢',
  for_this_position = '年柱見將星，多主出身家庭中有人做決策者或習慣扛責任，命主自幼耳濡目染「要扛事」的觀念。從小在同輩中易被推為小領袖，性格中帶幾分好勝與不服輸。成年後在家族或同學圈中，常被期待站出來主持大局或出頭處理問題。'
WHERE shensha_code = 'jiang_xing' AND pillar_type = 'year';

UPDATE shensha_readings SET 
  badge_text = '權勢',
  for_this_position = '將星落月柱，象徵職場與團隊中具備帶頭特質，容易被安排在關鍵崗位、專案負責人或對外窗口。命主做事直接，喜歡掌握節奏，但需學習傾聽與協調，以免壓力全攬在自己身上。若能兼具領導與溝通，將星是很好的事業助力，讓你有機會在行業中打出名聲。'
WHERE shensha_code = 'jiang_xing' AND pillar_type = 'month';

UPDATE shensha_readings SET 
  badge_text = '權勢',
  for_this_position = '日柱見將星，多主個人自尊心強，重視在伴侶與家庭中的話語權。婚姻關係中容易扛起重大決定，但也可能不自覺比較強勢。若能跟伴侶協調好分工，讓對方也有發揮空間，這顆星會讓家庭運行得有效率，遇到困難時有人站出來擋第一波風雨。'
WHERE shensha_code = 'jiang_xing' AND pillar_type = 'day';

UPDATE shensha_readings SET 
  badge_text = '權勢',
  for_this_position = '將星坐時柱，多庇蔭中晚年與子女、部屬運。晚年仍有掌舵與影響力，在家族、社團或公司中保有一定話語權。子女或晚輩中，也多有人擔任管理職、帶團隊或在專業領域有一定成就。此象使晚景不是悄然淡出，而是以另一種方式持續發揮影響力。'
WHERE shensha_code = 'jiang_xing' AND pillar_type = 'hour';

-- ========== 華蓋（hua_gai）==========
-- 標籤：藝術

UPDATE shensha_readings SET 
  badge_text = '藝術',
  for_this_position = '年柱見華蓋，多主原生家庭氣質稍顯內斂、不那麼熱鬧，命主自小較愛安靜與自處。思考偏向抽象或哲學面，容易對藝術、宗教、命理、設計等領域產生興趣。與同齡人相比，可能顯得早熟或有距離感，但也因此培養出獨特觀點。'
WHERE shensha_code = 'hua_gai' AND pillar_type = 'year';

UPDATE shensha_readings SET 
  badge_text = '藝術',
  for_this_position = '華蓋落月柱，象徵在職場與朋友圈中，命主比較不擅長熱鬧寒暄，更適合深度創作或獨立作業。適合從事設計、寫作、研究、手工、藝術創作、專業顧問等工作，在專注與沉思中發光。需注意避免過度自我封閉，適度與人交流能讓靈感與機會更順利流動。'
WHERE shensha_code = 'hua_gai' AND pillar_type = 'month';

UPDATE shensha_readings SET 
  badge_text = '藝術',
  for_this_position = '日柱見華蓋，多主個人帶點孤傲與潔癖，對感情與婚姻有一套自己的審美與標準。戀愛時重視靈魂共鳴與價值觀一致，不願將就，因此感情進展節奏可能較慢。若能放下部分完美主義，在堅持自我與接納他人之間找到平衡，反而能成就別具風格的關係模式。'
WHERE shensha_code = 'hua_gai' AND pillar_type = 'day';

UPDATE shensha_readings SET 
  badge_text = '藝術',
  for_this_position = '華蓋坐時柱，多庇蔭中晚年精神世界與創作力。晚年不喜太吵雜，偏愛有自己空間，沉浸在閱讀、創作、修行或專業鑽研中。子女或晚輩中，亦有人走藝術、設計、研究或形而上路線。整體晚景較重內心充實感，而非單純外在熱鬧。'
WHERE shensha_code = 'hua_gai' AND pillar_type = 'hour';

-- ========== 亡神（wang_shen_natal）==========
-- 標籤：心緒

UPDATE shensha_readings SET 
  badge_text = '心緒',
  for_this_position = '年柱見亡神，多主童年與原生家庭氛圍中，偶有混亂、反覆或讓人摸不著頭緒的情節。命主自幼就有點敏感多想，對「失去、安全」特別在意。長大後容易擔心東擔心西，對突發狀況不安，但也因此學會提早準備與備案，內心比表面看起來更謹慎。'
WHERE shensha_code = 'wang_shen_natal' AND pillar_type = 'year';

UPDATE shensha_readings SET 
  badge_text = '心緒',
  for_this_position = '亡神落月柱，象徵在職場與日常生活細節上，容易因心不在焉而遺漏小事，如檔案、物品、時間搞錯。並非一定「倒霉」，更多是注意力分散所致。若能刻意養成記錄、清單、備份與再次確認的習慣，反而能藉此讓工作流程更有條理，把凶象轉為提醒。'
WHERE shensha_code = 'wang_shen_natal' AND pillar_type = 'month';

UPDATE shensha_readings SET 
  badge_text = '心緒',
  for_this_position = '日柱見亡神，多主在感情與自我情緒上容易有迷惘感，常在關係中想太多、反覆確認，怕被忽略或誤解。這顆星也讓命主對離別議題較敏感，遇到感情變化時會深受觸動。學會表達真實感受、尋求支持與調整自我價值感，是化解這顆星壓力的重要關鍵。'
WHERE shensha_code = 'wang_shen_natal' AND pillar_type = 'day';

UPDATE shensha_readings SET 
  badge_text = '心緒',
  for_this_position = '亡神坐時柱，與中晚年心境與子女議題相關。晚年可能特別在意家人安全與未來安排，容易胡思亂想。子女或晚輩偶有讓你操心之處，但多半比實際情況想得更嚴重。建立清楚的財務與生活規劃、適度分工與信任他人，可減少不必要的焦慮。'
WHERE shensha_code = 'wang_shen_natal' AND pillar_type = 'hour';

-- ========== 孤辰（gu_chen）==========
-- 標籤：獨立

UPDATE shensha_readings SET 
  badge_text = '獨立',
  for_this_position = '年柱見孤辰，多主童年感到有些「與環境格格不入」，不一定真被孤立，但內在容易覺得沒人真正懂自己。原生家庭可能忙於生計或溝通方式較生硬，使命主習慣自我消化情緒。也因此培養出獨立與觀察力，只是需要學會開口求助與表達需求。'
WHERE shensha_code = 'gu_chen' AND pillar_type = 'year';

UPDATE shensha_readings SET 
  badge_text = '獨立',
  for_this_position = '孤辰落月柱，象徵在職場與社交場合中，命主雖能配合群體，但內心更偏向一個人行動。對一般寒暄興趣不大，更喜歡少數深度連結。適合從事需要專注與獨立思考的工作，但要注意避免長期與外界斷聯。適度參與小圈子交流，有助於資源與情緒流動。'
WHERE shensha_code = 'gu_chen' AND pillar_type = 'month';

UPDATE shensha_readings SET 
  badge_text = '獨立',
  for_this_position = '日柱見孤辰，多主在感情與婚姻上有強烈個人空間需求，對伴侶有感情，但不喜過度黏膩。容易在深愛與保持距離之間拉扯。若能事先與對方說清楚自己的節奏，找到彼此都舒適的相處模式，這顆星反而能帶來成熟、彼此尊重的關係，而非真的孤單。'
WHERE shensha_code = 'gu_chen' AND pillar_type = 'day';

UPDATE shensha_readings SET 
  badge_text = '獨立',
  for_this_position = '孤辰坐時柱，多與中晚年與子女互動方式相關。晚年可能選擇較簡樸、安靜的生活，不喜太多應酬。子女或晚輩也可能偏內向或走自己獨特路線。只要彼此尊重、不互相壓迫，這顆星代表的是獨立與內在豐富，而非絕對的孤苦。'
WHERE shensha_code = 'gu_chen' AND pillar_type = 'hour';

-- ========== 寡宿（gua_su）==========
-- 標籤：情感

UPDATE shensha_readings SET 
  badge_text = '情感',
  for_this_position = '年柱見寡宿，多主成長環境在情感表達上較含蓄，家人不太善於說愛，更多用責任與行動表達。命主從小習慣壓抑情緒，不易在他人面前示弱。也因此早早學會自立自強，但內心深處對被理解與陪伴有渴望，需要後天學習如何打開心扉。'
WHERE shensha_code = 'gua_su' AND pillar_type = 'year';

UPDATE shensha_readings SET 
  badge_text = '情感',
  for_this_position = '寡宿落月柱，象徵在工作與人際中偏理性、克制，不喜情緒化應對。遇到別人抱怨或過度依賴時，容易感到壓力。適合在專業性強、需要冷靜判斷的領域發展。若能練習在適當場合表達關心與柔軟面，會讓人際關係舒服許多，不再被誤認為冷漠。'
WHERE shensha_code = 'gua_su' AND pillar_type = 'month';

UPDATE shensha_readings SET 
  badge_text = '情感',
  for_this_position = '日柱見寡宿，多主在感情與婚姻中容易呈現「外冷內熱」，關心對方卻不太會說甜言蜜語。對承諾態度嚴肅，寧可單身也不願隨便。若沒有遇到真正欣賞自己的人，寧願保持距離。學會用對方聽得懂的方式表達感情，是這顆星化解孤寂感的關鍵。'
WHERE shensha_code = 'gua_su' AND pillar_type = 'day';

UPDATE shensha_readings SET 
  badge_text = '情感',
  for_this_position = '寡宿坐時柱，多與中晚年情感狀態與子女互動有關。晚年可能更重精神與自我修為，不再過度依附關係。子女或晚輩也可能較獨立，各有生活軌道。表面看似有距離，但只要願意主動關心聯繫，其實仍有穩定情分，只是表達方式較含蓄。'
WHERE shensha_code = 'gua_su' AND pillar_type = 'hour';

-- ========== 喪門（sang_men）==========
-- 標籤：離別

UPDATE shensha_readings SET 
  badge_text = '離別',
  for_this_position = '年柱見喪門，多主童年較早接觸「無常」議題，如家族有人生病、離散或生活變動較多。命主因此對離別、生死、失去特別敏感。這並非必然帶來災禍，而是讓你更早思考生命意義。若能將這種體悟轉化為珍惜當下與善待身邊人，反而成為心性的深度來源。'
WHERE shensha_code = 'sang_men' AND pillar_type = 'year';

UPDATE shensha_readings SET 
  badge_text = '離別',
  for_this_position = '喪門落月柱，象徵在職場與人際關係中，容易經歷一些團隊成員出入、部門調整或合作中止。對命主來說，告別不代表失敗，而是必然過程，只是心裡較容易感傷。學會面對結束、好好說再見，可以讓這顆星的能量變得成熟而有韌性。'
WHERE shensha_code = 'sang_men' AND pillar_type = 'month';

UPDATE shensha_readings SET 
  badge_text = '離別',
  for_this_position = '日柱見喪門，多主在感情與家庭議題上，特別害怕失去與分離。可能因為早年經歷，對承諾格外謹慎。這顆星提醒你要用健康的方式處理不安感，而非過度黏人或過度退縮。當你能接受關係有其生命週期，就不會在每次變化時都被情緒淹沒。'
WHERE shensha_code = 'sang_men' AND pillar_type = 'day';

UPDATE shensha_readings SET 
  badge_text = '離別',
  for_this_position = '喪門坐時柱，與中晚年面對生老病死、送別親友議題有關。並不代表一定喪事連連，而是人生後半段難免接觸這類場景。若能提早做好保險、財務與醫療規劃，並珍惜與家人相處的時間，這顆星反而會讓你在面對無常時，比別人更從容與坦然。'
WHERE shensha_code = 'sang_men' AND pillar_type = 'hour';

-- ========== 吊客（diao_ke）==========
-- 標籤：關懷

UPDATE shensha_readings SET 
  badge_text = '關懷',
  for_this_position = '年柱見吊客，多主成長過程中見證過他人辛苦或家庭波折，命主因此更懂得體諒別人的不易。雖然難免有沉重記憶，但也讓你比同齡人更有同理心。若能把這份感受力運用在助人工作、陪伴或服務領域，反而成為一種溫柔的力量。'
WHERE shensha_code = 'diao_ke' AND pillar_type = 'year';

UPDATE shensha_readings SET 
  badge_text = '關懷',
  for_this_position = '吊客落月柱，象徵在職場與人際場域中，命主常成為傾訴對象，別人願意向你吐露煩惱與痛苦。自己也較容易被他人故事觸動。適合從事服務業、醫護、心理、社工、命理、諮商等需要陪伴他人的工作。要注意照顧自己情緒，避免長期替別人承擔過多。'
WHERE shensha_code = 'diao_ke' AND pillar_type = 'month';

UPDATE shensha_readings SET 
  badge_text = '關懷',
  for_this_position = '日柱見吊客，多主在感情與家庭關係中，會特別在意對方的傷痕與過往。容易吸引曾受傷、需要被理解的對象，也願意為伴侶分憂。這顆星提醒你在陪伴他人的同時，也要懂得保護自己界線，別讓「拯救」變成壓力與束縛。'
WHERE shensha_code = 'diao_ke' AND pillar_type = 'day';

UPDATE shensha_readings SET 
  badge_text = '關懷',
  for_this_position = '吊客坐時柱，多與中晚年參與探病、送別、陪伴親友度過難關有關。你或許會成為家族、朋友圈中那個穩定、願意在困境時出現的人。這是一種功德，但也需要安排好自己的生活平衡，學會在給予與照顧中找到出口與修復管道。'
WHERE shensha_code = 'diao_ke' AND pillar_type = 'hour';

-- ========== 披麻（pi_ma）==========
-- 標籤：責任

UPDATE shensha_readings SET 
  badge_text = '責任',
  for_this_position = '年柱見披麻，多主原生家庭對傳統禮俗、長幼秩序較為重視，命主從小接觸各種儀式與人情規範。雖不一定感到輕鬆，但早早理解「家族責任」的意義。這顆星也提醒你，對家中長輩的健康與照顧議題，會比一般人更有參與感與責任感。'
WHERE shensha_code = 'pi_ma' AND pillar_type = 'year';

UPDATE shensha_readings SET 
  badge_text = '責任',
  for_this_position = '披麻落月柱，象徵在工作與人際中，常需處理「程序、規矩、傳統」類型的事務，例如行政、法務、人資、禮儀或宗教相關。命主對儀式感與規範有天生敏感度，適合在這些領域發揮。需注意的是，別讓自己一味扛下所有責任，適時分工很重要。'
WHERE shensha_code = 'pi_ma' AND pillar_type = 'month';

UPDATE shensha_readings SET 
  badge_text = '責任',
  for_this_position = '日柱見披麻，多主在婚姻與家庭中，對長輩與雙方家族責任看得較重。婚後可能需要在照顧父母、處理家務與傳統儀式上付出心力。這顆星並非純粹不吉，而是提醒你提前溝通好角色分工，讓伴侶理解你肩上的壓力，才能共同承擔，而非一人獨撐。'
WHERE shensha_code = 'pi_ma' AND pillar_type = 'day';

UPDATE shensha_readings SET 
  badge_text = '責任',
  for_this_position = '披麻坐時柱，多與中晚年處理家族儀式、送別與照顧長輩有關。你可能成為家族中主導流程的人，負責安排祭祀、探視、醫療與後事等事宜。若能用平和心看待，這是一種成全與功德，同時也要懂得照顧好自己的身心，必要時尋求專業與親友支援。'
WHERE shensha_code = 'pi_ma' AND pillar_type = 'hour';

-- ========== 國印貴人（guo_yin_gui_ren）==========
-- 標籤：權威

UPDATE shensha_readings SET 
  badge_text = '權威',
  for_this_position = '年柱見國印，多主出身家族中有人擔任公職、管理職或具專業地位，命主對「權威、資格、證書」概念不陌生。也象徵家人期待你成為有頭有臉的人物。若能善用這種背景，走向正規專業訓練與職涯規劃，較易在體制內建立身份認可。'
WHERE shensha_code = 'guo_yin_gui_ren' AND pillar_type = 'year';

UPDATE shensha_readings SET 
  badge_text = '權威',
  for_this_position = '國印落月柱，象徵在工作領域中，有機會取得重要職銜、證照或主管角色。命主重視專業與信用，不喜隨便。適合在公職、國企、大公司、專業事務所、教育、法律等需要資格背書的行業發展。只要持續精進，國印會讓你在圈子裡越來越有份量。'
WHERE shensha_code = 'guo_yin_gui_ren' AND pillar_type = 'month';

UPDATE shensha_readings SET 
  badge_text = '權威',
  for_this_position = '日柱見國印，多主個人自尊心與責任感強，對自己角色認同感重。婚姻中可能期望建立一個有秩序、有規劃的家庭，對伴侶的職涯或專業也有一定期待。若能避免過度控制，以共同成長的心態相處，這顆星會讓兩人成為彼此堅實的後盾。'
WHERE shensha_code = 'guo_yin_gui_ren' AND pillar_type = 'day';

UPDATE shensha_readings SET 
  badge_text = '權威',
  for_this_position = '國印坐時柱，多庇蔭中晚年與子女、事業收官。晚年在行業與社群中仍保有權威地位，可能擔任顧問、榮譽職務或長輩代表。子女或晚輩中，也容易有人取得高學歷、重要職銜或專業成就。此星使晚景帶有尊嚴與被敬重感。'
WHERE shensha_code = 'guo_yin_gui_ren' AND pillar_type = 'hour';

-- ========== 天廚貴人（tian_chu_gui_ren）==========
-- 標籤：口福

UPDATE shensha_readings SET 
  badge_text = '口福',
  for_this_position = '年柱見天廚，多主出生在不至匱乏的環境，家中重視飲食與生活品質。命主自小嘴巴挑，對味道與環境敏感。長大後特別有口福，容易吃到好東西，也較懂得享受生活。只要懂得節制，這顆星帶來的是幸福感，而非單純的貪嘴。'
WHERE shensha_code = 'tian_chu_gui_ren' AND pillar_type = 'year';

UPDATE shensha_readings SET 
  badge_text = '口福',
  for_this_position = '天廚落月柱，象徵在職場與人際中，常因聚餐、美食、款待而建立良好關係。適合從事餐飲、餐旅、烘焙、宴會、活動企劃等與「吃與享受」相關的行業。命主對服務與氛圍營造有天份，只要兼顧健康與成本，能透過美食與溫度累積口碑。'
WHERE shensha_code = 'tian_chu_gui_ren' AND pillar_type = 'month';

UPDATE shensha_readings SET 
  badge_text = '口福',
  for_this_position = '日柱見天廚，多主在感情與家庭生活中，喜歡用料理、招待與營造氛圍表達愛。婚後家中多香氣四溢，願意為家人準備好吃的，也重視環境舒適。需留意飲食過度放縱，適度安排運動與健康飲食，才能讓這顆星成為幸福的佐料，而非身體負擔。'
WHERE shensha_code = 'tian_chu_gui_ren' AND pillar_type = 'day';

UPDATE shensha_readings SET 
  badge_text = '口福',
  for_this_position = '天廚坐時柱，多庇蔭中晚年的生活品質與子女享樂風格。晚年不願活得太苦，喜歡旅遊、美食、品茶、烹飪或與三五好友聚會。子女也可能對料理、餐飲或生活品味有興趣。此星使晚景偏向「懂得享受、也懂得分享」，精神與物質皆可兼顧。'
WHERE shensha_code = 'tian_chu_gui_ren' AND pillar_type = 'hour';

-- ========== 建祿（jian_lu）==========
-- 標籤：自立
-- 注意：建祿只有一條通用解讀（落在日柱或月柱），更新所有柱位为相同内容

UPDATE shensha_readings SET 
  badge_text = '自立',
  for_this_position = '命帶建祿，多主性格實在、有肩膀，重視靠自己站穩腳跟。對工作與生活態度積極，不怕辛苦，願意腳踏實地累積成績。在職場中常是那個最能扛事、最可靠的人。感情與家庭中也有很強的責任感，希望自己能成為支柱。需注意的是，別凡事硬撐，學會適度求助與分工，反而能走得更長遠。'
WHERE shensha_code = 'jian_lu';

-- ========== 專祿/歸祿（zhuan_lu）==========
-- 標籤：專精
-- 注意：專祿只有一條通用解讀（落在日柱或月柱），更新所有柱位为相同内容

UPDATE shensha_readings SET 
  badge_text = '專精',
  for_this_position = '命帶專祿，多主個性專注、穩定，一旦選定方向便願意長期深耕，不喜三心二意。適合在需要專精與耐力的領域發展，如技術、工藝、研究、專業服務等。對感情與承諾也較專一，不輕易改變立場。若能在堅持中保留一點彈性，願意適度調整策略，往往能在自己擅長的路上走出深度與高度。'
WHERE shensha_code = 'zhuan_lu';

-- ========== 詞館（ci_guan）==========
-- 標籤：口才

UPDATE shensha_readings SET 
  badge_text = '口才',
  for_this_position = '年柱見詞館，多主自小家中有人善言談、喜辯論或常談時事，命主耳濡目染，對語言有興趣。童年可能就展現出話多、反應快、愛問問題的一面。若能好好引導，將口才用在演說、主持、教學或談判，是很好的資源。'
WHERE shensha_code = 'ci_guan' AND pillar_type = 'year';

UPDATE shensha_readings SET 
  badge_text = '口才',
  for_this_position = '詞館落月柱，象徵在職場與人際中，命主溝通能力突出，擅長談判、簡報、主持會議或寫作。適合從事公關、媒體、法律、銷售、顧問、教育、談判相關工作。要注意言語的分寸與誠信，避免因一時犀利或誇張而傷害信任。'
WHERE shensha_code = 'ci_guan' AND pillar_type = 'month';

UPDATE shensha_readings SET 
  badge_text = '口才',
  for_this_position = '日柱見詞館，多主在感情與家庭中善於用言語影響氣氛，有時一張嘴能把冷場救活，也能用幽默化解衝突。但若情緒激動，言詞也容易變成利刃。學會在親密關係中用溫柔表達，而非只講道理，可以讓這顆星變成甜蜜加分項。'
WHERE shensha_code = 'ci_guan' AND pillar_type = 'day';

UPDATE shensha_readings SET 
  badge_text = '口才',
  for_this_position = '詞館坐時柱，多庇蔭中晚年在分享、演講、寫作與傳承經驗上發光。晚年可能開啟教學、寫書、開講座或與晚輩聊天說故事的模式。子女或晚輩中，也有人口才好、善表達。此星讓晚景不僅有生活，還有故事與影響力。'
WHERE shensha_code = 'ci_guan' AND pillar_type = 'hour';

-- ========== 八專（ba_zhuan）==========
-- 標籤：執著

UPDATE shensha_readings SET 
  badge_text = '執著',
  for_this_position = '年柱見八專，多主原生家庭某些觀念或生活方式相對極端或強烈，命主自小就感受到「非黑即白」的氣息。長大後一旦認定某個信念或目標，往往難以輕易動搖。若能把這股執著用在正向方向，可成為專家型人物。'
WHERE shensha_code = 'ba_zhuan' AND pillar_type = 'year';

UPDATE shensha_readings SET 
  badge_text = '執著',
  for_this_position = '八專落月柱，象徵在職場與日常生活中，命主做事風格偏一條路走到底，不喜三心二意。對專業要求極高，易成為完美主義者。適合從事需要高度專精與堅持的行業，但要留心對自己與他人要求過頭，造成壓力與人際緊張。'
WHERE shensha_code = 'ba_zhuan' AND pillar_type = 'month';

UPDATE shensha_readings SET 
  badge_text = '執著',
  for_this_position = '日柱見八專，多主在感情與人生選擇上，一旦認定就難以回頭。對伴侶極度專一，但若遇人不淑，容易在關係中投入過多而難以抽身。學會在愛與自愛之間找到平衡，不把所有人生押在一段感情上，是這顆星的重要功課。'
WHERE shensha_code = 'ba_zhuan' AND pillar_type = 'day';

UPDATE shensha_readings SET 
  badge_text = '執著',
  for_this_position = '八專坐時柱，多與中晚年人生方向與子女發展相關。晚年可能仍深陷某一領域或興趣中，很難完全放下工作模式。子女或晚輩中，也有人在興趣或職涯上非常極致。若能在執著之外多一點彈性，晚景會更自在舒坦。'
WHERE shensha_code = 'ba_zhuan' AND pillar_type = 'hour';

-- ========== 年空亡（nian_kong_wang）==========
-- 標籤：變數
-- 注意：年空亡本身就帶柱資訊，只需一條解讀

UPDATE shensha_readings SET 
  badge_text = '變數',
  for_this_position = '年空亡多主原生家庭中，有部分表面期待與實際結果存在落差，命主成長過程對「安全感」議題較敏感。家族資源不一定能完全依靠，反而促使你早早意識到要靠自己。年柱空亡並非絕對不利，而是代表祖上與自己連結較鬆，適合走出家門闖出一片天，在外地或自力更生中找到定位。'
WHERE shensha_code = 'nian_kong_wang';

-- ========== 月空亡（yue_kong_wang）==========
-- 標籤：起伏
-- 注意：月空亡本身就帶柱資訊，只需一條解讀

UPDATE shensha_readings SET 
  badge_text = '起伏',
  for_this_position = '月空亡多主在工作與人際環境中，容易遇到計畫與實際落差較大的情況。原定安排可能臨時變動，團隊成員進出頻繁。命主須學會彈性與備案，才能在變動中保持穩定。若能接受「沒有永遠不變的工作」，反而能藉此累積應變能力與臨場反應，走出屬於自己的路線。'
WHERE shensha_code = 'yue_kong_wang';

-- ========== 日空亡（ri_kong_wang）==========
-- 標籤：自我
-- 注意：日空亡本身就帶柱資訊，只需一條解讀

UPDATE shensha_readings SET 
  badge_text = '自我',
  for_this_position = '日空亡多主自我認同與感情議題上有較多內在矛盾與起伏。命主容易感到「別人看見的我」與「真正的我」不完全重疊，感情路也可能走一些彎路。這顆星提醒你要花時間了解自己真正想要的是什麼，而不是隨波逐流。當自我穩定後，空亡反而帶來彈性與重新選擇的自由，讓你更有勇氣活成自己喜歡的模樣。'
WHERE shensha_code = 'ri_kong_wang';

