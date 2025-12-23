-- 更新十神标签，只保留前2个字
-- 版本：v1.2
-- 创建日期：2025-12-04
-- 用途：将标签从4个字（如"自我・同輩"）改为2个字（如"自我"）

-- 设置字符集
SET NAMES utf8mb4;

-- 更新比肩：自我・同輩 -> 自我
UPDATE shishen_readings SET badge_text = '自我' WHERE shishen_code = 'bi_jian';

-- 更新劫財：競爭・突破 -> 競爭
UPDATE shishen_readings SET badge_text = '競爭' WHERE shishen_code = 'jie_cai';

-- 更新食神：才藝・享受 -> 才藝
UPDATE shishen_readings SET badge_text = '才藝' WHERE shishen_code = 'shi_shen';

-- 更新傷官：表達・突破 -> 表達
UPDATE shishen_readings SET badge_text = '表達' WHERE shishen_code = 'shang_guan';

-- 更新正財：財富・務實 -> 財富
UPDATE shishen_readings SET badge_text = '財富' WHERE shishen_code = 'zheng_cai';

-- 更新偏財：機遇・生意 -> 機遇
UPDATE shishen_readings SET badge_text = '機遇' WHERE shishen_code = 'pian_cai';

-- 更新正官：責任・秩序 -> 責任
UPDATE shishen_readings SET badge_text = '責任' WHERE shishen_code = 'zheng_guan';

-- 更新七殺：魄力・壓力 -> 魄力
UPDATE shishen_readings SET badge_text = '魄力' WHERE shishen_code = 'qi_sha';

-- 更新正印：庇蔭・學習 -> 庇蔭
UPDATE shishen_readings SET badge_text = '庇蔭' WHERE shishen_code = 'zheng_yin';

-- 更新偏印：靈感・變化 -> 靈感
UPDATE shishen_readings SET badge_text = '靈感' WHERE shishen_code = 'pian_yin';

-- 验证更新结果
SELECT shishen_code, badge_text, COUNT(*) as count 
FROM shishen_readings 
GROUP BY shishen_code, badge_text 
ORDER BY shishen_code;


