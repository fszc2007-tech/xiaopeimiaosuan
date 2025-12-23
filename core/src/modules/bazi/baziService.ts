/**
 * 命盘服务
 * 
 * 负责命盘计算、存储、查询等功能
 */

import { v4 as uuidv4 } from 'uuid';
import { getPool } from '../../database/connection';
import { BirthInfo, ChartProfile, BaziChart } from '../../types';
import { computeBaziChart } from './engine';

const CURRENT_ENGINE_VERSION = '6.0';

/**
 * 计算命盘
 */
export async function computeChart(params: {
  userId: string;
  name: string;
  gender: 'male' | 'female';
  birth: any; // 前端传来的 birth 对象（可能不完整）
  chartProfileId?: string;
  forceRecompute?: boolean;
  relationType?: string;
}): Promise<{
  chartId: string;
  chartProfileId: string;
  result: any;
}> {
  const { userId, name, gender, birth, chartProfileId, forceRecompute, relationType = '本人' } = params;
  
  const pool = getPool();
  
  // 1. 如果没有提供 chartProfileId，创建新的 chart_profile
  let profileId = chartProfileId;
  
  if (!profileId) {
    profileId = uuidv4();
    
    await pool.execute(
      `INSERT INTO chart_profiles 
       (chart_profile_id, user_id, name, relation_type, gender, gregorian_birth, birth_time)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        profileId,
        userId,
        name,
        relationType,
        gender,
        `${birth.year}-${String(birth.month).padStart(2, '0')}-${String(birth.day).padStart(2, '0')}`,
        `${String(birth.hour).padStart(2, '0')}:${String(birth.minute).padStart(2, '0')}:00`,
      ]
    );
    
  }
  
  // 2. 检查是否已有计算结果（且版本匹配）
  if (!forceRecompute) {
    const [chartRows]: any = await pool.execute(
      `SELECT * FROM bazi_charts 
       WHERE chart_profile_id = ? AND engine_version = ? AND needs_update = FALSE
       ORDER BY created_at DESC LIMIT 1`,
      [profileId, CURRENT_ENGINE_VERSION]
    );
    
    if (chartRows.length > 0) {
      return {
        chartId: chartRows[0].chart_id,
        chartProfileId: profileId,
        result: JSON.parse(chartRows[0].result_json),
      };
    }
  }
  
  // 3. 构建引擎所需的 BirthInfo（转换格式）
  const engineBirthInfo: BirthInfo = {
    sex: gender, // 引擎使用 sex，不是 gender
    calendar_type: '公历', // 引擎期望简体中文，目前前端只支持公历
    year: birth.year,
    month: birth.month,
    day: birth.day,
    hour: birth.hour,
    minute: birth.minute,
    tz: birth.tz || '+08:00', // 使用 +HH:MM 格式，默认东八区
  };
  
  console.log('[BaziService] 调用引擎，输入参数:', engineBirthInfo);
  
  // 4. 调用八字引擎计算
  const result = await computeBaziChart(engineBirthInfo);
  
  // 5. 保存计算结果
  const chartId = uuidv4();
  
  await pool.execute(
    `INSERT INTO bazi_charts (chart_id, chart_profile_id, result_json, engine_version)
     VALUES (?, ?, ?, ?)`,
    [chartId, profileId, JSON.stringify(result), CURRENT_ENGINE_VERSION]
  );
  
  return {
    chartId,
    chartProfileId: profileId,
    result,
  };
}

/**
 * 获取命盘列表
 */
export async function getCharts(params: {
  userId: string;
  page: number;
  pageSize: number;
  search: string;
}): Promise<{
  items: ChartProfile[];
  total: number;
}> {
  const { userId, page, pageSize, search } = params;
  
  const pool = getPool();
  // ✅ 修复 MySQL 8 + mysql2 兼容性问题：将 LIMIT/OFFSET 参数转为字符串
  const safePageSize = Math.max(1, Math.min(Number(pageSize) || 20, 100));
  const offset = Math.max(0, (page - 1) * safePageSize);
  
  // 查询总数
  const [countRows]: any = await pool.execute(
    `SELECT COUNT(*) as total FROM chart_profiles 
     WHERE user_id = ? AND name LIKE ?`,
    [userId, `%${search}%`]
  );
  
  // 查询列表
  // ✅ 修复 MySQL 8 + mysql2 兼容性问题：直接拼接 LIMIT/OFFSET（已校验数字安全）
  // 注意：LIMIT/OFFSET 直接拼接到 SQL 中，不使用占位符（避免 MySQL 8 兼容性问题）
  const [rows]: any = await pool.execute(
    `SELECT * FROM chart_profiles 
     WHERE user_id = ? AND name LIKE ?
     ORDER BY created_at DESC
     LIMIT ${safePageSize} OFFSET ${offset}`,
    [userId, `%${search}%`]
  );
  
  return {
    items: rows,
    total: countRows[0].total,
  };
}

/**
 * 获取命盘详情
 */
export async function getChartDetail(params: {
  userId: string;
  chartId: string;
}): Promise<any> {
  const { userId, chartId } = params;
  
  const pool = getPool();
  
  // 查询命盘结果
  const [chartRows]: any = await pool.execute(
    `SELECT bc.*, cp.* 
     FROM bazi_charts bc
     JOIN chart_profiles cp ON bc.chart_profile_id = cp.chart_profile_id
     WHERE bc.chart_id = ? AND cp.user_id = ?`,
    [chartId, userId]
  );
  
  if (chartRows.length === 0) {
    throw new Error('Chart not found');
  }
  
  const row = chartRows[0];
  const resultJson = JSON.parse(row.result_json);
  
  // 🔥 DTO 转换层：将数据库字段映射为前端期望的格式
  
  // 1. 转换 profile（命盘档案信息）
  // 格式化日期时间
  
  // MySQL DATE 类型会被转换为 JavaScript Date 对象，需要格式化
  // 使用本地时间格式化，避免时区问题导致日期偏移
  let gregorianDate: string;
  if (row.gregorian_birth instanceof Date) {
    const year = row.gregorian_birth.getFullYear();
    const month = String(row.gregorian_birth.getMonth() + 1).padStart(2, '0');
    const day = String(row.gregorian_birth.getDate()).padStart(2, '0');
    gregorianDate = `${year}-${month}-${day}`;
  } else {
    gregorianDate = row.gregorian_birth;
  }
  
  // MySQL TIME 类型可能是字符串，需要处理
  const birthTimeFormatted = row.birth_time 
    ? (typeof row.birth_time === 'string' ? row.birth_time.substring(0, 5) : row.birth_time) 
    : '00:00';
  
  const birthdayGregorian = `${gregorianDate} ${birthTimeFormatted}`; // YYYY-MM-DD HH:mm
  
  const profile = {
    chartProfileId: row.chart_profile_id,
    userId: row.user_id,
    name: row.name,
    gender: row.gender,
    relationType: row.relation_type,
    
    // 字段名映射（snake_case → camelCase）
    birthdayGregorian, // 合并日期和时间（格式：YYYY-MM-DD HH:mm）
    birthplace: row.birth_place,
    timezone: row.timezone,
    calendarType: 'solar' as const, // 目前只支持公历
    
    // 从八字计算结果中提取（如果存在）
    birthdayLunar: resultJson.meta?.calendar_from?.match(/农历.*?(\d+年.*?\d+日)/)?.[1] || null,
    location: row.birth_place,
    
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
  
  // 2. 计算当前年龄
  // 从 resultJson.birthInfo 或 row 中获取出生信息
  let birthInfo: any = resultJson.birthInfo;
  if (!birthInfo && row.gregorian_birth) {
    const birthDate = row.gregorian_birth instanceof Date 
      ? row.gregorian_birth 
      : new Date(row.gregorian_birth);
    birthInfo = {
      year: birthDate.getFullYear(),
      month: birthDate.getMonth() + 1,
      day: birthDate.getDate(),
    };
  }
  const currentAge = birthInfo ? calculateCurrentAge(birthInfo) : 0;
  
  // 3. 从引擎原始数据构建 luckCycle（如果存在）
  let luckCycle: any[] = [];
  if (resultJson.derived?.luck_cycle) {
    const { buildLuckCycleForApp } = await import('../../utils/luckCycleAdapter');
    luckCycle = buildLuckCycleForApp(
      resultJson.derived.luck_cycle,
      currentAge
    );
  }
  
  // 4. 从 derived 中剥掉 luck_cycle，只保留对外结构
  const { luck_cycle, ...derivedRest } = resultJson.derived || {};
  
  // 2. 转换 result（八字计算结果）
  let analysis = resultJson.analysis || {};
  
  // 3. 兜底逻辑：如果 annualBrief 不存在，动态生成（兼容旧数据）
  if (analysis.luckRhythm && !analysis.luckRhythm.annualBrief) {
    try {
      // 动态导入 ES 模块
      const annualLuckModule = await import('../../../engine/analysis/annualLuck.js');
      const { buildAnnualBrief } = annualLuckModule;
      const currentYearNum = new Date().getFullYear();
      const dayStem = resultJson.pillars?.day?.stem || '';
      
      // 获取当前大运索引
      let currentLuckIndex = 0;
      if (analysis.luckRhythm.currentLuck?.index !== undefined) {
        currentLuckIndex = analysis.luckRhythm.currentLuck.index;
      } else if (resultJson.derived?.luck_cycle) {
        // 从 luck_cycle 中查找当前大运
        for (let i = 0; i < resultJson.derived.luck_cycle.length; i++) {
          const luck = resultJson.derived.luck_cycle[i];
          if (currentAge >= luck.startAge && currentAge < luck.endAge) {
            currentLuckIndex = i;
            break;
          }
        }
      }
      
      // 从 analysis 中提取用神信息
      // 尝试从 tiyong 或 favoredAvoid 中获取
      let usefulGods: string[] = [];
      let avoidGods: string[] = [];
      
      if (resultJson.analysis?.tiyong?.favoredAvoid) {
        usefulGods = resultJson.analysis.tiyong.favoredAvoid.favored || [];
        avoidGods = resultJson.analysis.tiyong.favoredAvoid.avoid || [];
      } else if (resultJson.analysis?.favoredAvoid) {
        usefulGods = resultJson.analysis.favoredAvoid.favored || [];
        avoidGods = resultJson.analysis.favoredAvoid.avoid || [];
      }
      
      const annualBrief = buildAnnualBrief({
        derived: resultJson.derived,
        analysis: {
          usefulGods,
          avoidGods,
          luckRhythm: analysis.luckRhythm,
        },
        currentYear: currentYearNum,
        currentLuckIndex,
        currentAge,
        dayStem,
      });
      
      // 补充到 analysis.luckRhythm
      analysis = {
        ...analysis,
        luckRhythm: {
          ...analysis.luckRhythm,
          annualBrief,
        },
      };
      
      console.log('[BaziService] ✅ 动态生成 annualBrief，共', annualBrief.length, '年');
    } catch (error) {
      console.error('[BaziService] ❌ 生成 annualBrief 失败:', error);
      // 失败时不影响其他数据，继续返回
    }
  }
  
  const result = {
    chartId: row.chart_id,
    engineVersion: row.engine_version,
    pillars: resultJson.pillars,
    analysis, // 使用处理后的 analysis（可能包含动态生成的 annualBrief）
    derived: {
      ...derivedRest,
      luckCycle,  // ✅ 唯一对外暴露的时间轴数据
    },
    shensha: resultJson.shensha || { hits_by_pillar: {} }, // 神煞数据
    meta: resultJson.meta || {}, // 元数据
    needsUpdate: row.needs_update,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
  
  return {
    profile,
    result,
  };
}

/**
 * 计算当前年龄（虚岁 or 实岁，按你系统既有约定）
 */
function calculateCurrentAge(birthInfo: any): number {
  const { year, month, day } = birthInfo;
  const birthDate = new Date(year, month - 1, day);
  const now = new Date();
  const ageMs = now.getTime() - birthDate.getTime();
  const ageYears = ageMs / (365.25 * 24 * 60 * 60 * 1000);
  return Math.floor(ageYears);
}

/**
 * 删除命盘
 * 
 * 支持两种方式：
 * 1. 通过 chartId 删除（优先）
 * 2. 通过 profileId（chart_profile_id）删除（如果 chartId 不存在）
 */
export async function deleteChart(params: {
  userId: string;
  chartId: string;
}): Promise<void> {
  const { userId, chartId } = params;
  
  const pool = getPool();
  
  // 先尝试通过 chartId 查找 chart_profile_id
  let profileId = null;
  
  const [chartRows]: any = await pool.execute(
    `SELECT bc.chart_profile_id 
     FROM bazi_charts bc
     JOIN chart_profiles cp ON bc.chart_profile_id = cp.chart_profile_id
     WHERE bc.chart_id = ? AND cp.user_id = ?`,
    [chartId, userId]
  );
  
  if (chartRows.length > 0) {
    profileId = chartRows[0].chart_profile_id;
  } else {
    // 如果通过 chartId 找不到，尝试将 chartId 当作 profileId（chart_profile_id）处理
    // 这是因为前端可能传递的是 profileId（当 chartId 不存在时）
    const [profileRows]: any = await pool.execute(
      `SELECT chart_profile_id 
       FROM chart_profiles 
       WHERE chart_profile_id = ? AND user_id = ?`,
      [chartId, userId]
    );
    
    if (profileRows.length > 0) {
      profileId = profileRows[0].chart_profile_id;
    }
  }
  
  if (!profileId) {
    throw new Error('Chart not found');
  }
  
  // 检查是否是当前命主
  // 删除 chart_profile（会级联删除 bazi_charts）
  await pool.execute(
    `DELETE FROM chart_profiles WHERE chart_profile_id = ?`,
    [profileId]
  );
}


