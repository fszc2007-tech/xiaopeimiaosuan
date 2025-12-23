"use strict";
/**
 * 命主档案服务
 *
 * 功能：
 * - 管理命主档案（创建、查询、更新、删除）
 * - 处理当前命主切换
 * - 档案列表查询与筛选
 *
 * 数据模型：
 * - chart_profiles 表：档案管理信息
 * - bazi_charts 表：命盘计算结果
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createChartProfile = createChartProfile;
exports.getChartProfiles = getChartProfiles;
exports.getChartProfileById = getChartProfileById;
exports.updateChartProfile = updateChartProfile;
exports.deleteChartProfile = deleteChartProfile;
exports.updateLastViewedAt = updateLastViewedAt;
exports.getChartProfileWithChart = getChartProfileWithChart;
const connection_1 = require("../database/connection");
const uuid_1 = require("uuid");
// ===== Field Mapper Helper =====
function mapChartProfile(row) {
    // 解析 gregorian_birth (date) 和 birth_time (time)
    let birthYear = 0;
    let birthMonth = 0;
    let birthDay = 0;
    let birthHour = 0;
    let birthMinute = 0;
    if (row.gregorian_birth) {
        const birthDate = new Date(row.gregorian_birth);
        if (!isNaN(birthDate.getTime())) {
            birthYear = birthDate.getFullYear();
            birthMonth = birthDate.getMonth() + 1; // 月份从 0 开始，需要 +1
            birthDay = birthDate.getDate();
        }
    }
    if (row.birth_time) {
        // birth_time 格式: "HH:MM:SS" 或 "HH:MM"
        const timeParts = String(row.birth_time).split(':');
        if (timeParts.length >= 2) {
            birthHour = parseInt(timeParts[0], 10) || 0;
            birthMinute = parseInt(timeParts[1], 10) || 0;
        }
    }
    return {
        profileId: row.profile_id,
        userId: row.user_id,
        chartId: row.chart_id || undefined, // 可能为 null (LEFT JOIN)
        name: row.name,
        relationType: row.relation_type,
        relationLabel: undefined, // 旧表没有此字段
        isSelf: row.relation_type === 'self' || row.relation_type === '本人', // 根据 relation_type 判断
        notes: undefined, // 旧表没有此字段
        avatarUrl: undefined, // 旧表没有此字段
        birthYear,
        birthMonth,
        birthDay,
        birthHour,
        birthMinute,
        gender: row.gender,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        lastViewedAt: undefined, // 旧表没有此字段
    };
}
// ===== 核心服务函数 =====
/**
 * 创建命主档案
 */
async function createChartProfile(input) {
    const pool = (0, connection_1.getPool)();
    const profileId = (0, uuid_1.v4)();
    // 插入新档案
    // 注意：数据库表中没有 relation_label 字段，已移除
    await pool.query(`INSERT INTO chart_profiles (
      profile_id, user_id, chart_id, name, relation_type,
      is_self, notes, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`, [
        profileId,
        input.userId,
        input.chartId,
        input.name,
        input.relationType,
        input.isSelf || false,
        input.notes || null,
    ]);
    // 4. 查询并返回新建的档案
    const profile = await getChartProfileById(profileId);
    if (!profile) {
        throw new Error('PROFILE_CREATE_FAILED');
    }
    return profile;
}
/**
 * 获取命主档案列表
 */
async function getChartProfiles(userId, options = {}) {
    const pool = (0, connection_1.getPool)();
    const { search, relationType, sortBy = 'recent', limit = 50, offset = 0, } = options;
    // 构建查询条件
    let whereClause = 'WHERE cp.user_id = ?';
    const params = [userId];
    // 搜索条件
    if (search) {
        whereClause += ' AND (cp.name LIKE ? OR cp.relation_type LIKE ?)';
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern);
    }
    // 关系筛选
    if (relationType && relationType.length > 0) {
        const placeholders = relationType.map(() => '?').join(',');
        whereClause += ` AND cp.relation_type IN (${placeholders})`;
        params.push(...relationType);
    }
    // 排序（注意：last_viewed_at 字段不存在，使用 created_at 和 updated_at）
    let orderBy = 'ORDER BY ';
    switch (sortBy) {
        case 'recent':
            // 使用 updated_at 代替 last_viewed_at
            orderBy += 'cp.updated_at DESC, cp.created_at DESC';
            break;
        case 'created':
            orderBy += 'cp.created_at DESC';
            break;
        case 'relation':
            orderBy += `
        CASE cp.relation_type
          WHEN '本人' THEN 1
          WHEN 'self' THEN 1
          WHEN '配偶' THEN 2
          WHEN 'partner' THEN 2
          WHEN '父母' THEN 3
          WHEN 'parent' THEN 3
          WHEN '子女' THEN 4
          WHEN 'child' THEN 4
          WHEN '朋友' THEN 5
          WHEN 'friend' THEN 5
          ELSE 6
        END,
        cp.created_at DESC
      `;
            break;
        default:
            orderBy += 'cp.created_at DESC';
    }
    // 查询总数
    const [countRows] = await pool.execute(`SELECT COUNT(*) as total FROM chart_profiles cp ${whereClause}`, params);
    const total = countRows[0].total;
    // 查询档案列表 (JOIN bazi_charts 获取 chart_id)
    // ✅ 修复 MySQL 8 + mysql2 兼容性问题：直接拼接 LIMIT/OFFSET（已校验数字安全）
    const safeLimit = Math.max(1, Math.min(Number(limit) || 50, 100));
    const safeOffset = Math.max(0, Number(offset) || 0);
    // 注意：LIMIT/OFFSET 直接拼接到 SQL 中，不使用占位符（避免 MySQL 8 兼容性问题）
    // 已通过 Math.max/Math.min 确保 safeLimit 和 safeOffset 是安全的数字
    const listSql = `SELECT 
      cp.chart_profile_id as profile_id, 
      cp.user_id, 
      bc.chart_id,
      cp.name,
      cp.relation_type,
      cp.gender,
      cp.gregorian_birth,
      cp.birth_time,
      cp.birth_place,
      cp.timezone,
      cp.created_at, 
      cp.updated_at
    FROM chart_profiles cp
    LEFT JOIN bazi_charts bc ON cp.chart_profile_id = bc.chart_profile_id
    ${whereClause}
    ${orderBy}
    LIMIT ${safeLimit} OFFSET ${safeOffset}`;
    console.log('[getChartProfiles] LIST SQL:', listSql);
    console.log('[getChartProfiles] LIST Params:', params);
    const [rows] = await pool.execute(listSql, params);
    const profiles = rows.map((row) => mapChartProfile(row));
    return { profiles, total };
}
/**
 * 根据 ID 获取命主档案
 */
async function getChartProfileById(profileId) {
    const pool = (0, connection_1.getPool)();
    const [rows] = await pool.query(`SELECT 
      cp.chart_profile_id as profile_id, 
      cp.user_id, 
      bc.chart_id,
      cp.name, 
      cp.relation_type,
      cp.gender,
      cp.gregorian_birth,
      cp.birth_time,
      cp.created_at, 
      cp.updated_at
    FROM chart_profiles cp
    LEFT JOIN bazi_charts bc ON cp.chart_profile_id = bc.chart_profile_id
    WHERE cp.chart_profile_id = ?`, [profileId]);
    if (rows.length === 0) {
        return null;
    }
    return mapChartProfile(rows[0]);
}
/**
 * 更新命主档案
 */
async function updateChartProfile(profileId, userId, input) {
    const pool = (0, connection_1.getPool)();
    // 1. 验证档案归属
    const [rows] = await pool.query('SELECT profile_id FROM chart_profiles WHERE profile_id = ? AND user_id = ?', [profileId, userId]);
    if (rows.length === 0) {
        throw new Error('PROFILE_NOT_FOUND');
    }
    // 2. 构建更新字段
    const updates = [];
    const params = [];
    if (input.name !== undefined) {
        updates.push('name = ?');
        params.push(input.name);
    }
    if (input.relationType !== undefined) {
        updates.push('relation_type = ?');
        params.push(input.relationType);
    }
    // 注意：数据库表中没有 relation_label 字段，已移除相关更新逻辑
    if (input.notes !== undefined) {
        updates.push('notes = ?');
        params.push(input.notes);
    }
    if (updates.length === 0) {
        // 没有需要更新的字段，直接返回
        const profile = await getChartProfileById(profileId);
        return profile;
    }
    updates.push('updated_at = NOW()');
    params.push(profileId);
    // 3. 执行更新
    await pool.query(`UPDATE chart_profiles SET ${updates.join(', ')} WHERE chart_profile_id = ?`, params);
    // 4. 返回更新后的档案
    const profile = await getChartProfileById(profileId);
    if (!profile) {
        throw new Error('PROFILE_UPDATE_FAILED');
    }
    return profile;
}
/**
 * 删除命主档案
 */
async function deleteChartProfile(profileId, userId) {
    const pool = (0, connection_1.getPool)();
    // 1. 查询档案信息
    const [rows] = await pool.query('SELECT chart_profile_id FROM chart_profiles WHERE chart_profile_id = ? AND user_id = ?', [profileId, userId]);
    if (rows.length === 0) {
        throw new Error('PROFILE_NOT_FOUND');
    }
    // 2. 删除档案
    await pool.query('DELETE FROM chart_profiles WHERE chart_profile_id = ?', [profileId]);
}
/**
 * 更新最后查看时间
 */
async function updateLastViewedAt(profileId) {
    const pool = (0, connection_1.getPool)();
    await pool.query('UPDATE chart_profiles SET last_viewed_at = NOW() WHERE chart_profile_id = ?', [profileId]);
}
/**
 * 获取命主档案（含命盘数据）
 */
async function getChartProfileWithChart(profileId) {
    const pool = (0, connection_1.getPool)();
    const [rows] = await pool.query(`SELECT 
      cp.chart_profile_id as profile_id, 
      cp.user_id, 
      bc.chart_id,
      cp.name,
      cp.relation_type,
      cp.gender,
      cp.gregorian_birth,
      cp.birth_time,
      cp.birth_place,
      cp.timezone,
      cp.created_at, 
      cp.updated_at
    FROM chart_profiles cp
    INNER JOIN bazi_charts bc ON cp.chart_profile_id = bc.chart_profile_id
    WHERE cp.chart_profile_id = ?`, [profileId]);
    if (rows.length === 0) {
        return null;
    }
    const row = rows[0];
    const profile = mapChartProfile(row);
    const chart = {
        chartId: row.chart_id,
        birthYear: row.birth_year,
        birthMonth: row.birth_month,
        birthDay: row.birth_day,
        birthHour: row.birth_hour,
        birthMinute: row.birth_minute,
        gender: row.gender,
        timezone: row.timezone,
        location: row.location,
    };
    return { profile, chart };
}
//# sourceMappingURL=chartProfileService.js.map