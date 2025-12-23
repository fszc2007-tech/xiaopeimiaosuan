"use strict";
/**
 * Admin Job 管理路由
 *
 * 路徑：/api/admin/v1/jobs/*
 *
 * 功能：
 * - 手動觸發帳號刪除 Job
 * - 查看 Job 執行日誌
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const scheduler_1 = require("../../jobs/scheduler");
const connection_1 = require("../../database/connection");
const router = (0, express_1.Router)();
/**
 * POST /api/admin/v1/jobs/deletion/trigger
 * 手動觸發帳號刪除 Job
 */
router.post('/deletion/trigger', async (req, res, next) => {
    try {
        console.log('[Admin] 手動觸發帳號刪除 Job');
        const result = await (0, scheduler_1.triggerDeletionJobManually)();
        res.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/admin/v1/jobs/deletion/logs
 * 獲取帳號刪除 Job 執行日誌
 */
router.get('/deletion/logs', async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 20;
        const offset = (page - 1) * pageSize;
        const pool = (0, connection_1.getPool)();
        // 獲取日誌列表
        const [rows] = await pool.execute(`SELECT * FROM account_audit_logs 
       WHERE action = 'DELETION_EXECUTED'
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`, [pageSize, offset]);
        // 獲取總數
        const [countRows] = await pool.execute(`SELECT COUNT(*) as total FROM account_audit_logs WHERE action = 'DELETION_EXECUTED'`);
        const total = countRows[0].total;
        res.json({
            success: true,
            data: {
                items: rows,
                total,
                page,
                pageSize,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/admin/v1/jobs/deletion/pending
 * 獲取待刪除用戶列表
 */
router.get('/deletion/pending', async (req, res, next) => {
    try {
        const pool = (0, connection_1.getPool)();
        const [rows] = await pool.execute(`SELECT user_id, phone, email, nickname, 
              delete_requested_at, delete_scheduled_at,
              TIMESTAMPDIFF(SECOND, UTC_TIMESTAMP(), delete_scheduled_at) as seconds_remaining
       FROM users 
       WHERE status = 'PENDING_DELETE'
       ORDER BY delete_scheduled_at ASC
       LIMIT 100`);
        // 標記已過期的
        const items = rows.map((row) => ({
            ...row,
            isExpired: row.seconds_remaining <= 0,
            // 隱藏敏感信息
            phone: row.phone ? `${row.phone.substring(0, 4)}****${row.phone.slice(-2)}` : null,
            email: row.email ? `${row.email.substring(0, 2)}****@${row.email.split('@')[1]}` : null,
        }));
        res.json({
            success: true,
            data: {
                items,
                total: rows.length,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/admin/v1/jobs/deletion/stats
 * 獲取刪除統計
 */
router.get('/deletion/stats', async (req, res, next) => {
    try {
        const pool = (0, connection_1.getPool)();
        // 各狀態用戶數
        const [statusRows] = await pool.execute(`SELECT status, COUNT(*) as count FROM users GROUP BY status`);
        // 今日刪除數
        const [todayRows] = await pool.execute(`SELECT COUNT(*) as count FROM account_audit_logs 
       WHERE action = 'DELETION_EXECUTED' 
         AND result = 'SUCCESS'
         AND created_at >= DATE(UTC_TIMESTAMP())`);
        // 總刪除數
        const [totalRows] = await pool.execute(`SELECT COUNT(*) as count FROM account_audit_logs 
       WHERE action = 'DELETION_EXECUTED' 
         AND result = 'SUCCESS'`);
        // 失敗數
        const [failedRows] = await pool.execute(`SELECT COUNT(*) as count FROM account_audit_logs 
       WHERE action = 'DELETION_EXECUTED' 
         AND result = 'FAILED'`);
        res.json({
            success: true,
            data: {
                usersByStatus: statusRows.reduce((acc, row) => {
                    acc[row.status] = row.count;
                    return acc;
                }, {}),
                deletedToday: todayRows[0].count,
                deletedTotal: totalRows[0].count,
                failedTotal: failedRows[0].count,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=jobs.js.map