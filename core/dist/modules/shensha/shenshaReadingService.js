"use strict";
/**
 * 神煞解读服务
 *
 * 负责从数据库获取神煞解读内容
 * 支持按性别返回不同的解读（紅鸞、天喜、流霞、孤辰、寡宿）
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getShenshaReading = getShenshaReading;
const connection_1 = require("../../database/connection");
/**
 * 获取神煞解读内容
 *
 * @param shenshaCode 神煞代码（如 'tian_yi_gui_ren'）
 * @param pillarType 柱位类型（可选，如果提供则只返回该柱位的解读）
 * @param gender 性別（必填，male/female，排盤時必然有性別）
 * @returns 解读内容，如果不存在则返回 null
 */
async function getShenshaReading(shenshaCode, pillarType, gender) {
    const pool = (0, connection_1.getPool)();
    // 确保使用 utf8mb4 字符集查询（防止乱码）
    await pool.execute('SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci');
    if (pillarType) {
        // 查询特定柱位的解读
        // 先查指定性別，若找不到則查通用（all）
        const [genderRows] = await pool.execute(`SELECT * FROM shensha_readings 
       WHERE shensha_code = ? AND pillar_type = ? AND gender = ? AND is_active = TRUE
       LIMIT 1`, [shenshaCode, pillarType, gender]);
        if (genderRows.length > 0) {
            const row = genderRows[0];
            return {
                code: row.shensha_code,
                name: row.name,
                badge_text: row.badge_text || '',
                type: row.type,
                short_title: row.short_title || '',
                summary: row.summary,
                bullet_points: row.bullet_points || [],
                pillar_explanation: [{
                        pillar: row.pillar_type,
                        text: row.for_this_position,
                    }],
                recommended_questions: row.recommended_questions || [],
            };
        }
        // 若指定性別找不到，回退到通用（all）- 適用於其他26個神煞
        const [allRows] = await pool.execute(`SELECT * FROM shensha_readings 
       WHERE shensha_code = ? AND pillar_type = ? AND gender = 'all' AND is_active = TRUE
       LIMIT 1`, [shenshaCode, pillarType]);
        if (allRows.length === 0) {
            return null;
        }
        const row = allRows[0];
        return {
            code: row.shensha_code,
            name: row.name,
            badge_text: row.badge_text || '',
            type: row.type,
            short_title: row.short_title || '',
            summary: row.summary,
            bullet_points: row.bullet_points || [],
            pillar_explanation: [{
                    pillar: row.pillar_type,
                    text: row.for_this_position,
                }],
            recommended_questions: row.recommended_questions || [],
        };
    }
    else {
        // 查询所有柱位的解读
        // 先查指定性別
        const [genderRows] = await pool.execute(`SELECT * FROM shensha_readings 
       WHERE shensha_code = ? AND gender = ? AND is_active = TRUE
       ORDER BY 
         CASE pillar_type 
           WHEN 'year' THEN 1 
           WHEN 'month' THEN 2 
           WHEN 'day' THEN 3 
           WHEN 'hour' THEN 4 
         END`, [shenshaCode, gender]);
        if (genderRows.length > 0) {
            const firstRow = genderRows[0];
            return {
                code: firstRow.shensha_code,
                name: firstRow.name,
                badge_text: firstRow.badge_text || '',
                type: firstRow.type,
                short_title: firstRow.short_title || '',
                summary: firstRow.summary,
                bullet_points: firstRow.bullet_points || [],
                pillar_explanation: genderRows.map((row) => ({
                    pillar: row.pillar_type,
                    text: row.for_this_position,
                })),
                recommended_questions: firstRow.recommended_questions || [],
            };
        }
        // 若指定性別找不到，回退到通用（all）
        const [allRows] = await pool.execute(`SELECT * FROM shensha_readings 
       WHERE shensha_code = ? AND gender = 'all' AND is_active = TRUE
       ORDER BY 
         CASE pillar_type 
           WHEN 'year' THEN 1 
           WHEN 'month' THEN 2 
           WHEN 'day' THEN 3 
           WHEN 'hour' THEN 4 
         END`, [shenshaCode]);
        if (allRows.length === 0) {
            return null;
        }
        const firstRow = allRows[0];
        return {
            code: firstRow.shensha_code,
            name: firstRow.name,
            badge_text: firstRow.badge_text || '',
            type: firstRow.type,
            short_title: firstRow.short_title || '',
            summary: firstRow.summary,
            bullet_points: firstRow.bullet_points || [],
            pillar_explanation: allRows.map((row) => ({
                pillar: row.pillar_type,
                text: row.for_this_position,
            })),
            recommended_questions: firstRow.recommended_questions || [],
        };
    }
}
//# sourceMappingURL=shenshaReadingService.js.map