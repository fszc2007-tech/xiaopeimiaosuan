-- 將所有神煞名稱統一為繁體中文
-- 確保前端顯示一致性

-- 貴人系列
UPDATE shensha_readings SET name = '天乙貴人' WHERE name = '天乙贵人';
UPDATE shensha_readings SET name = '文昌貴人' WHERE name = '文昌贵人';
UPDATE shensha_readings SET name = '太極貴人' WHERE name = '太极贵人';
UPDATE shensha_readings SET name = '月德貴人' WHERE name = '月德贵人';
UPDATE shensha_readings SET name = '天德貴人' WHERE name = '天德贵人';
UPDATE shensha_readings SET name = '國印貴人' WHERE name = '国印贵人';
UPDATE shensha_readings SET name = '天廚貴人' WHERE name = '天厨贵人';

-- 桃花/姻緣系列
UPDATE shensha_readings SET name = '紅鸞' WHERE name = '红鸾';
UPDATE shensha_readings SET name = '桃花（鹹池）' WHERE name = '桃花（咸池）';

-- 祿位系列
UPDATE shensha_readings SET name = '建祿' WHERE name = '建禄';
UPDATE shensha_readings SET name = '專祿（歸祿）' WHERE name = '专禄（归禄）';

-- 才華系列
UPDATE shensha_readings SET name = '華蓋' WHERE name = '华盖';
UPDATE shensha_readings SET name = '詞館' WHERE name = '词馆';

-- 孤寡/離別系列
UPDATE shensha_readings SET name = '喪門' WHERE name = '丧门';

-- 其他
UPDATE shensha_readings SET name = '驛馬' WHERE name = '驿马';
UPDATE shensha_readings SET name = '將星' WHERE name = '将星';
UPDATE shensha_readings SET name = '八專' WHERE name = '八专';

-- 驗證更新結果
SELECT DISTINCT name FROM shensha_readings ORDER BY name;

