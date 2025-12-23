"use strict";
/**
 * 十神解读服务
 *
 * 负责从数据库获取十神解读内容
 * 支持判断十神是否为喜神/忌神
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getShishenReading = getShishenReading;
const connection_1 = require("../../database/connection");
/**
 * 十神对应的五行映射
 */
const SHISHEN_TO_ELEMENT = {
    '比肩': 'same', // 同我（日主五行）
    '劫财': 'same', // 同我（日主五行）
    '食神': 'generates', // 我生
    '伤官': 'generates', // 我生
    '正财': 'controls', // 我克
    '偏财': 'controls', // 我克
    '正印': 'mother', // 生我
    '偏印': 'mother', // 生我
    '正官': 'controller', // 克我
    '七杀': 'controller', // 克我
};
/**
 * 判断十神是否为喜神/忌神
 *
 * @param shishenName 十神名称（如 '比肩', '劫财'）
 * @param baziData 命盘数据（包含 analysis.yongshenPattern）
 * @returns 'favorable' | 'unfavorable' | 'neutral'
 */
function determineFavorStatus(shishenName, baziData) {
    try {
        if (!baziData || !baziData.analysis) {
            return 'neutral';
        }
        const yongshenPattern = baziData.analysis.yongshenPattern;
        if (!yongshenPattern) {
            return 'neutral';
        }
        // 方法1：检查是否在主用神十神列表中（最直接）
        const mainYongshenTenGods = yongshenPattern.mainYongshen?.tenGods || [];
        if (mainYongshenTenGods.includes(shishenName)) {
            return 'favorable';
        }
        // 方法2：根据十神对应的五行判断
        // 获取日主五行
        const dayMaster = baziData.dayMaster;
        if (!dayMaster) {
            return 'neutral';
        }
        // 天干五行映射
        const STEM_ELEMENT = {
            '甲': '木', '乙': '木',
            '丙': '火', '丁': '火',
            '戊': '土', '己': '土',
            '庚': '金', '辛': '金',
            '壬': '水', '癸': '水',
        };
        // 五行生克关系
        const GENERATES = {
            '木': '火', '火': '土', '土': '金', '金': '水', '水': '木'
        };
        const CONTROLS = {
            '木': '土', '火': '金', '土': '水', '金': '木', '水': '火'
        };
        const MOTHER_OF = {
            '木': '水', '火': '木', '土': '火', '金': '土', '水': '金'
        };
        const CONTROLLER_OF = {
            '木': '金', '火': '水', '土': '木', '金': '火', '水': '土'
        };
        const dayMasterElement = STEM_ELEMENT[dayMaster];
        if (!dayMasterElement) {
            return 'neutral';
        }
        // 获取十神对应的五行
        let shishenElement = null;
        const relation = SHISHEN_TO_ELEMENT[shishenName];
        if (relation === 'same') {
            shishenElement = dayMasterElement;
        }
        else if (relation === 'generates') {
            shishenElement = GENERATES[dayMasterElement];
        }
        else if (relation === 'controls') {
            shishenElement = CONTROLS[dayMasterElement];
        }
        else if (relation === 'mother') {
            shishenElement = MOTHER_OF[dayMasterElement];
        }
        else if (relation === 'controller') {
            shishenElement = CONTROLLER_OF[dayMasterElement];
        }
        if (!shishenElement) {
            return 'neutral';
        }
        // 检查是否在忌神五行列表中
        const tabooElements = yongshenPattern.tabooElements || [];
        if (tabooElements.includes(shishenElement)) {
            return 'unfavorable';
        }
        // 检查是否在主用神五行列表中
        const mainYongshenElements = yongshenPattern.mainYongshen?.elements || [];
        if (mainYongshenElements.includes(shishenElement)) {
            return 'favorable';
        }
        // 检查是否在辅喜五行列表中
        const assistElements = yongshenPattern.assistElements || [];
        if (assistElements.includes(shishenElement)) {
            return 'favorable';
        }
        return 'neutral';
    }
    catch (error) {
        console.error('[shishenReadingService] 判断喜忌失败:', error);
        return 'neutral';
    }
}
/**
 * 获取十神解读内容
 *
 * @param shishenCode 十神代码（如 'bi_jian', 'jie_cai'）
 * @param pillarType 柱位类型（可选，如果提供则只返回该柱位的解读）
 * @param gender 性别（必填，male/female，排盤時必然有性別）
 * @param baziData 命盘数据（可选，用于判断喜神/忌神）
 * @returns 解读内容，如果不存在则返回 null
 */
async function getShishenReading(shishenCode, pillarType, gender, baziData) {
    const pool = (0, connection_1.getPool)();
    if (pillarType) {
        // 查询特定柱位的解读
        // 先查指定性別，若找不到則查通用（all）
        const [genderRows] = await pool.execute(`SELECT * FROM shishen_readings 
       WHERE shishen_code = ? AND pillar_type = ? AND gender = ? AND is_active = TRUE
       LIMIT 1`, [shishenCode, pillarType, gender]);
        if (genderRows.length > 0) {
            const row = genderRows[0];
            const favorStatus = baziData
                ? determineFavorStatus(row.name, baziData)
                : undefined;
            return {
                code: row.shishen_code,
                name: row.name,
                badge_text: row.badge_text || '',
                type: row.type,
                short_title: row.short_title || '',
                pillar_explanation: [{
                        pillar: row.pillar_type,
                        text: row.for_this_position,
                    }],
                recommended_questions: row.recommended_questions || [],
                favor_status: favorStatus,
            };
        }
        // 若指定性別找不到，回退到通用（all）
        const [allRows] = await pool.execute(`SELECT * FROM shishen_readings 
       WHERE shishen_code = ? AND pillar_type = ? AND gender = 'all' AND is_active = TRUE
       LIMIT 1`, [shishenCode, pillarType]);
        if (allRows.length === 0) {
            return null;
        }
        const row = allRows[0];
        const favorStatus = baziData
            ? determineFavorStatus(row.name, baziData)
            : undefined;
        return {
            code: row.shishen_code,
            name: row.name,
            badge_text: row.badge_text || '',
            type: row.type,
            short_title: row.short_title || '',
            pillar_explanation: [{
                    pillar: row.pillar_type,
                    text: row.for_this_position,
                }],
            recommended_questions: row.recommended_questions || [],
            favor_status: favorStatus,
        };
    }
    else {
        // 查询所有柱位的解读
        // 先查指定性別
        const [genderRows] = await pool.execute(`SELECT * FROM shishen_readings 
       WHERE shishen_code = ? AND gender = ? AND is_active = TRUE
       ORDER BY 
         CASE pillar_type 
           WHEN 'year' THEN 1 
           WHEN 'month' THEN 2 
           WHEN 'day' THEN 3 
           WHEN 'hour' THEN 4 
         END`, [shishenCode, gender]);
        if (genderRows.length > 0) {
            const firstRow = genderRows[0];
            const favorStatus = baziData
                ? determineFavorStatus(firstRow.name, baziData)
                : undefined;
            return {
                code: firstRow.shishen_code,
                name: firstRow.name,
                badge_text: firstRow.badge_text || '',
                type: firstRow.type,
                short_title: firstRow.short_title || '',
                pillar_explanation: genderRows.map((row) => ({
                    pillar: row.pillar_type,
                    text: row.for_this_position,
                })),
                recommended_questions: firstRow.recommended_questions || [],
                favor_status: favorStatus,
            };
        }
        // 若指定性別找不到，回退到通用（all）
        const [allRows] = await pool.execute(`SELECT * FROM shishen_readings 
       WHERE shishen_code = ? AND gender = 'all' AND is_active = TRUE
       ORDER BY 
         CASE pillar_type 
           WHEN 'year' THEN 1 
           WHEN 'month' THEN 2 
           WHEN 'day' THEN 3 
           WHEN 'hour' THEN 4 
         END`, [shishenCode]);
        if (allRows.length === 0) {
            return null;
        }
        const firstRow = allRows[0];
        const favorStatus = baziData
            ? determineFavorStatus(firstRow.name, baziData)
            : undefined;
        return {
            code: firstRow.shishen_code,
            name: firstRow.name,
            badge_text: firstRow.badge_text || '',
            type: firstRow.type,
            short_title: firstRow.short_title || '',
            pillar_explanation: allRows.map((row) => ({
                pillar: row.pillar_type,
                text: row.for_this_position,
            })),
            recommended_questions: firstRow.recommended_questions || [],
            favor_status: favorStatus,
        };
    }
}
//# sourceMappingURL=shishenReadingService.js.map