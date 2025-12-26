/**
 * 神煞解读服务
 * 
 * 负责从数据库获取神煞解读内容
 * 支持按性别返回不同的解读（紅鸞、天喜、流霞、孤辰、寡宿）
 */

import { getPool } from '../../database/connection';
import { ShenshaReadingRow } from '../../types/database';

export type PillarType = 'year' | 'month' | 'day' | 'hour';
export type GenderType = 'male' | 'female';

export interface ShenshaReadingDto {
  code: string;
  name: string;
  badge_text: string;
  type: 'auspicious' | 'inauspicious' | 'neutral';
  short_title: string;
  summary: string;
  bullet_points: string[];
  pillar_explanation: Array<{
    pillar: PillarType;
    text: string;
  }>;
  recommended_questions: string[];
}

/**
 * 获取神煞解读内容
 * 
 * @param shenshaCode 神煞代码（如 'tian_yi_gui_ren'）
 * @param pillarType 柱位类型（可选，如果提供则只返回该柱位的解读）
 * @param gender 性別（必填，male/female，排盤時必然有性別）
 * @returns 解读内容，如果不存在则返回 null
 */
/**
 * 修复可能的双重编码问题
 * 如果数据是 UTF-8 字节被错误解释为 Latin-1，需要修复
 */
function fixEncoding(str: string | null | undefined): string {
  if (!str) return '';
  // 如果字符串长度异常（正常中文应该 <= 10），可能是双重编码
  // 或者包含乱码字符，尝试修复
  if (str.length > 10 || /[^\u0000-\u00FF]/.test(str)) {
    try {
      // 尝试修复：将 Latin-1 字节重新解释为 UTF-8
      const fixed = Buffer.from(str, 'latin1').toString('utf8');
      // 如果修复后包含中文，说明修复成功
      if (/[\u4e00-\u9fa5]/.test(fixed)) {
        return fixed;
      }
    } catch (e) {
      // 修复失败，返回原值
    }
  }
  return str;
}

export async function getShenshaReading(
  shenshaCode: string,
  pillarType: PillarType | undefined,
  gender: GenderType
): Promise<ShenshaReadingDto | null> {
  const pool = getPool();
  
  // 注意：连接池已在创建时设置了 charset: 'utf8mb4'，不需要再次执行 SET NAMES
  // 十神服务没有执行 SET NAMES 但显示正常，说明连接池的 charset 配置已足够
  
  if (pillarType) {
    // 查询特定柱位的解读
    // 先查指定性別，若找不到則查通用（all）
    const [genderRows]: any = await pool.execute(
      `SELECT * FROM shensha_readings 
       WHERE shensha_code = ? AND pillar_type = ? AND gender = ? AND is_active = TRUE
       LIMIT 1`,
      [shenshaCode, pillarType, gender]
    );
    
    if (genderRows.length > 0) {
      const row: ShenshaReadingRow = genderRows[0];
      
      // 修复可能的双重编码问题
      // 如果数据是 UTF-8 字节被错误解释为 Latin-1，需要修复
      const fixEncoding = (str: string | null | undefined): string => {
        if (!str) return '';
        // 检查是否包含乱码字符（UTF-8 字节被解释为 Latin-1）
        if (/[^\u0000-\u00FF]/.test(str) || str.length > 10) {
          // 尝试修复：将 Latin-1 字节重新解释为 UTF-8
          try {
            const fixed = Buffer.from(str, 'latin1').toString('utf8');
            if (/[\u4e00-\u9fa5]/.test(fixed)) {
              return fixed;
            }
          } catch (e) {
            // 修复失败，返回原值
          }
        }
        return str;
      };
      
      return {
        code: row.shensha_code,
        name: fixEncoding(row.name),
        badge_text: fixEncoding(row.badge_text) || '',
        type: row.type,
        short_title: fixEncoding(row.short_title) || '',
        summary: fixEncoding(row.summary),
        bullet_points: row.bullet_points || [],
        pillar_explanation: [{
          pillar: row.pillar_type,
          text: fixEncoding(row.for_this_position),
        }],
        recommended_questions: row.recommended_questions || [],
      };
    }
    
    // 若指定性別找不到，回退到通用（all）- 適用於其他26個神煞
    const [allRows]: any = await pool.execute(
      `SELECT * FROM shensha_readings 
       WHERE shensha_code = ? AND pillar_type = ? AND gender = 'all' AND is_active = TRUE
       LIMIT 1`,
      [shenshaCode, pillarType]
    );
    
    if (allRows.length === 0) {
      return null;
    }
    
    const row: ShenshaReadingRow = allRows[0];
    return {
      code: row.shensha_code,
      name: fixEncoding(row.name),
      badge_text: fixEncoding(row.badge_text) || '',
      type: row.type,
      short_title: fixEncoding(row.short_title) || '',
      summary: fixEncoding(row.summary),
      bullet_points: row.bullet_points || [],
      pillar_explanation: [{
        pillar: row.pillar_type,
        text: fixEncoding(row.for_this_position),
      }],
      recommended_questions: row.recommended_questions || [],
    };
  } else {
    // 查询所有柱位的解读
    // 先查指定性別
    const [genderRows]: any = await pool.execute(
      `SELECT * FROM shensha_readings 
       WHERE shensha_code = ? AND gender = ? AND is_active = TRUE
       ORDER BY 
         CASE pillar_type 
           WHEN 'year' THEN 1 
           WHEN 'month' THEN 2 
           WHEN 'day' THEN 3 
           WHEN 'hour' THEN 4 
         END`,
      [shenshaCode, gender]
    );
    
    if (genderRows.length > 0) {
      const firstRow: ShenshaReadingRow = genderRows[0];
      return {
        code: firstRow.shensha_code,
        name: fixEncoding(firstRow.name),
        badge_text: fixEncoding(firstRow.badge_text) || '',
        type: firstRow.type,
        short_title: fixEncoding(firstRow.short_title) || '',
        summary: fixEncoding(firstRow.summary),
        bullet_points: firstRow.bullet_points || [],
        pillar_explanation: genderRows.map((row: ShenshaReadingRow) => ({
          pillar: row.pillar_type,
          text: fixEncoding(row.for_this_position),
        })),
        recommended_questions: firstRow.recommended_questions || [],
      };
    }
    
    // 若指定性別找不到，回退到通用（all）
    const [allRows]: any = await pool.execute(
      `SELECT * FROM shensha_readings 
       WHERE shensha_code = ? AND gender = 'all' AND is_active = TRUE
       ORDER BY 
         CASE pillar_type 
           WHEN 'year' THEN 1 
           WHEN 'month' THEN 2 
           WHEN 'day' THEN 3 
           WHEN 'hour' THEN 4 
         END`,
      [shenshaCode]
    );
    
    if (allRows.length === 0) {
      return null;
    }
    
    const firstRow: ShenshaReadingRow = allRows[0];
    return {
      code: firstRow.shensha_code,
      name: fixEncoding(firstRow.name),
      badge_text: fixEncoding(firstRow.badge_text) || '',
      type: firstRow.type,
      short_title: fixEncoding(firstRow.short_title) || '',
      summary: fixEncoding(firstRow.summary),
      bullet_points: firstRow.bullet_points || [],
      pillar_explanation: allRows.map((row: ShenshaReadingRow) => ({
        pillar: row.pillar_type,
        text: fixEncoding(row.for_this_position),
      })),
      recommended_questions: firstRow.recommended_questions || [],
    };
  }
}

