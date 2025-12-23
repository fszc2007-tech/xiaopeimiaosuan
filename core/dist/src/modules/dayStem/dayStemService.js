"use strict";
/**
 * 日主天干解读服务
 *
 * 负责从数据库获取日主天干解读内容
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDayStemReading = getDayStemReading;
exports.getAllDayStemReadings = getAllDayStemReadings;
const connection_1 = require("../../database/connection");
/**
 * 获取日主天干解读
 * @param stem 日主天干（甲/乙/丙/丁/戊/己/庚/辛/壬/癸）
 * @returns 解读内容，如果不存在则返回 null
 */
async function getDayStemReading(stem) {
    const pool = (0, connection_1.getPool)();
    console.log('[DayStemService] 查询日主:', stem, '编码:', Buffer.from(stem).toString('hex'));
    const [rows] = await pool.execute('SELECT * FROM day_stem_readings WHERE stem = ?', [stem]);
    console.log('[DayStemService] 查询结果行数:', rows.length);
    if (rows.length > 0) {
        console.log('[DayStemService] 第一行数据:', rows[0]);
    }
    if (rows.length === 0) {
        return null;
    }
    const row = rows[0];
    // 转换为 DTO（camelCase）
    return {
        stem: row.stem,
        element: row.element,
        yinYang: row.yin_yang,
        title: row.title,
        description: row.description,
    };
}
/**
 * 获取所有日主天干解读（用于预加载或缓存）
 */
async function getAllDayStemReadings() {
    const pool = (0, connection_1.getPool)();
    const [rows] = await pool.execute(`SELECT * FROM day_stem_readings 
     ORDER BY FIELD(stem, '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸')`);
    return rows.map((row) => ({
        stem: row.stem,
        element: row.element,
        yinYang: row.yin_yang,
        title: row.title,
        description: row.description,
    }));
}
//# sourceMappingURL=dayStemService.js.map