"use strict";
/**
 * 对话管理服务
 *
 * 负责对话的查询、删除、筛选等功能
 *
 * 参考文档：
 * - app.doc/features/我的-二级-内容查看页面设计文档.md
 * - app.doc/features/聊天页设计文档（公共组件版）.md
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConversations = getConversations;
exports.getConversationDetail = getConversationDetail;
exports.deleteConversation = deleteConversation;
exports.getMastersForFilter = getMastersForFilter;
const connection_1 = require("../../database/connection");
/**
 * 获取对话列表
 */
async function getConversations(params) {
    const { userId, masterIds = [], dateFilter = 'all', page = 1, pageSize = 20 } = params;
    const pool = (0, connection_1.getPool)();
    // 构建查询条件
    let whereClause = 'c.user_id = ?';
    const queryParams = [userId];
    // 按命主筛选
    if (masterIds.length > 0) {
        whereClause += ` AND c.chart_profile_id IN (${masterIds.map(() => '?').join(',')})`;
        queryParams.push(...masterIds);
    }
    // 按日期筛选
    if (dateFilter !== 'all') {
        const now = new Date();
        let dateStart = null;
        switch (dateFilter) {
            case 'today':
                dateStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case 'week':
                dateStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                dateStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            default:
                // 未知的 dateFilter，忽略日期筛选
                break;
        }
        if (dateStart) {
            whereClause += ' AND c.created_at >= ?';
            // 确保日期格式正确（MySQL 需要 YYYY-MM-DD HH:MM:SS 格式）
            queryParams.push(dateStart.toISOString().slice(0, 19).replace('T', ' '));
        }
    }
    // 查询总数（使用独立的参数数组，避免被后续查询修改）
    const countParams = [...queryParams];
    const countSql = `SELECT COUNT(*) as total 
     FROM conversations c 
     WHERE ${whereClause}`;
    console.log('[getConversations] COUNT SQL:', countSql);
    console.log('[getConversations] COUNT Params:', countParams);
    const [countRows] = await pool.execute(countSql, countParams);
    const total = countRows[0].total;
    // 查询列表（添加分页参数）
    // ✅ 修复 MySQL 8 + mysql2 兼容性问题：直接拼接 LIMIT/OFFSET（已校验数字安全）
    const safePageSize = Math.max(1, Math.min(Number(pageSize) || 20, 100)); // 1~100 之间
    const offset = Math.max(0, (page - 1) * safePageSize);
    // 注意：LIMIT/OFFSET 直接拼接到 SQL 中，不使用占位符（避免 MySQL 8 兼容性问题）
    // 已通过 Math.max/Math.min 确保 safePageSize 和 offset 是安全的数字
    const listSql = `SELECT 
       c.conversation_id,
       c.chart_profile_id as master_id,
       cp.name as master_name,
       c.topic,
       c.first_question,
       c.last_message_preview,
       c.created_at,
       c.updated_at
     FROM conversations c
     LEFT JOIN chart_profiles cp ON c.chart_profile_id = cp.chart_profile_id
     WHERE ${whereClause}
     ORDER BY c.updated_at DESC
     LIMIT ${safePageSize} OFFSET ${offset}`;
    console.log('[getConversations] LIST SQL:', listSql);
    console.log('[getConversations] LIST Params:', queryParams);
    const [rows] = await pool.execute(listSql, queryParams);
    // 格式化日期标签
    const items = rows.map((row) => {
        // 确保日期是 Date 对象
        const createdAt = row.created_at instanceof Date
            ? row.created_at
            : new Date(row.created_at);
        const updatedAt = row.updated_at instanceof Date
            ? row.updated_at
            : new Date(row.updated_at);
        return {
            conversationId: row.conversation_id,
            masterId: row.master_id,
            masterName: row.master_name || '未知命主',
            topic: row.topic,
            firstQuestion: row.first_question,
            lastMessagePreview: row.last_message_preview,
            createdAt,
            updatedAt,
            dateLabel: formatDateLabel(createdAt),
        };
    });
    return { items, total };
}
/**
 * 获取对话详情（消息列表）
 */
async function getConversationDetail(params) {
    const { userId, conversationId, page = 1, pageSize = 50 } = params;
    const pool = (0, connection_1.getPool)();
    // 1. 查询对话信息（验证权限）
    const [convRows] = await pool.execute(`SELECT 
       c.conversation_id,
       c.chart_profile_id as master_id,
       cp.name as master_name,
       c.topic,
       c.created_at
     FROM conversations c
     LEFT JOIN chart_profiles cp ON c.chart_profile_id = cp.chart_profile_id
     WHERE c.conversation_id = ? AND c.user_id = ?`, [conversationId, userId]);
    if (convRows.length === 0) {
        throw new Error('对话不存在或无权访问');
    }
    const conversation = convRows[0];
    // 2. 查询消息总数
    const [countRows] = await pool.execute(`SELECT COUNT(*) as total FROM messages WHERE conversation_id = ?`, [conversationId]);
    const total = countRows[0].total;
    // 3. 查询消息列表
    // ✅ 修复 MySQL 8 + mysql2 兼容性问题：将 LIMIT/OFFSET 参数转为字符串
    const safePageSize = Math.max(1, Math.min(Number(pageSize) || 50, 100));
    const offset = Math.max(0, (page - 1) * safePageSize);
    // ✅ 修复 MySQL 8 + mysql2 兼容性问题：直接拼接 LIMIT/OFFSET（已校验数字安全）
    const [msgRows] = await pool.execute(`SELECT 
       message_id,
       role,
       content,
       created_at as timestamp
     FROM messages
     WHERE conversation_id = ?
     ORDER BY created_at ASC
     LIMIT ${safePageSize} OFFSET ${offset}`, [conversationId]);
    return {
        conversation: {
            conversationId: conversation.conversation_id,
            masterId: conversation.master_id,
            masterName: conversation.master_name || '未知命主',
            topic: conversation.topic,
            createdAt: conversation.created_at,
        },
        messages: msgRows.map((row) => ({
            messageId: row.message_id,
            role: row.role,
            content: row.content,
            timestamp: row.timestamp,
        })),
        total,
    };
}
/**
 * 删除对话
 */
async function deleteConversation(params) {
    const { userId, conversationId } = params;
    const pool = (0, connection_1.getPool)();
    // 验证权限
    const [convRows] = await pool.execute(`SELECT conversation_id FROM conversations WHERE conversation_id = ? AND user_id = ?`, [conversationId, userId]);
    if (convRows.length === 0) {
        throw new Error('对话不存在或无权删除');
    }
    // 删除对话（会级联删除消息）
    await pool.execute(`DELETE FROM conversations WHERE conversation_id = ?`, [conversationId]);
}
/**
 * 获取命主列表（用于筛选）
 */
async function getMastersForFilter(params) {
    const { userId } = params;
    const pool = (0, connection_1.getPool)();
    const [rows] = await pool.execute(`SELECT 
       cp.chart_profile_id as master_id,
       cp.name as master_name,
       COUNT(c.conversation_id) as conversation_count
     FROM chart_profiles cp
     LEFT JOIN conversations c ON cp.chart_profile_id = c.chart_profile_id
     WHERE cp.user_id = ?
     GROUP BY cp.chart_profile_id
     HAVING conversation_count > 0
     ORDER BY conversation_count DESC`, [userId]);
    return rows.map((row) => ({
        masterId: row.master_id,
        masterName: row.master_name,
        conversationCount: row.conversation_count,
    }));
}
/**
 * 格式化日期标签
 * 规则：今天、昨天、其他日期显示 "MM月DD日"
 */
function formatDateLabel(date) {
    const now = new Date();
    const inputDate = date instanceof Date ? date : new Date(date);
    // 检查日期是否有效
    if (isNaN(inputDate.getTime())) {
        return '未知日期';
    }
    // 重置时间为 00:00:00 以便比较日期
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const inputDay = new Date(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate());
    if (inputDay.getTime() === today.getTime()) {
        return '今天';
    }
    else if (inputDay.getTime() === yesterday.getTime()) {
        return '昨天';
    }
    else {
        const month = inputDate.getMonth() + 1;
        const day = inputDate.getDate();
        return `${month}月${day}日`;
    }
}
//# sourceMappingURL=conversationService.js.map