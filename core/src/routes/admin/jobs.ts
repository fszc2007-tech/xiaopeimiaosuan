/**
 * Admin Job 管理路由
 * 
 * 路徑：/api/admin/v1/jobs/*
 * 
 * 功能：
 * - 手動觸發帳號刪除 Job
 * - 查看 Job 執行日誌
 */

import { Router, Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../../types';
import { triggerDeletionJobManually } from '../../jobs/scheduler';
import { getPool } from '../../database/connection';

const router = Router();

/**
 * POST /api/admin/v1/jobs/deletion/trigger
 * 手動觸發帳號刪除 Job
 */
router.post('/deletion/trigger', async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('[Admin] 手動觸發帳號刪除 Job');
    
    const result = await triggerDeletionJobManually();
    
    res.json({
      success: true,
      data: result,
    } as ApiResponse);
  } catch (error: any) {
    next(error);
  }
});

/**
 * GET /api/admin/v1/jobs/deletion/logs
 * 獲取帳號刪除 Job 執行日誌
 */
router.get('/deletion/logs', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const offset = (page - 1) * pageSize;
    
    const pool = getPool();
    
    // 獲取日誌列表
    const [rows]: any = await pool.execute(
      `SELECT * FROM account_audit_logs 
       WHERE action = 'DELETION_EXECUTED'
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [pageSize, offset]
    );
    
    // 獲取總數
    const [countRows]: any = await pool.execute(
      `SELECT COUNT(*) as total FROM account_audit_logs WHERE action = 'DELETION_EXECUTED'`
    );
    
    const total = countRows[0].total;
    
    res.json({
      success: true,
      data: {
        items: rows,
        total,
        page,
        pageSize,
      },
    } as ApiResponse);
  } catch (error: any) {
    next(error);
  }
});

/**
 * GET /api/admin/v1/jobs/deletion/pending
 * 獲取待刪除用戶列表
 */
router.get('/deletion/pending', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pool = getPool();
    
    const [rows]: any = await pool.execute(
      `SELECT user_id, phone, email, nickname, 
              delete_requested_at, delete_scheduled_at,
              TIMESTAMPDIFF(SECOND, UTC_TIMESTAMP(), delete_scheduled_at) as seconds_remaining
       FROM users 
       WHERE status = 'PENDING_DELETE'
       ORDER BY delete_scheduled_at ASC
       LIMIT 100`
    );
    
    // 標記已過期的
    const items = rows.map((row: any) => ({
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
    } as ApiResponse);
  } catch (error: any) {
    next(error);
  }
});

/**
 * GET /api/admin/v1/jobs/deletion/stats
 * 獲取刪除統計
 */
router.get('/deletion/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const pool = getPool();
    
    // 各狀態用戶數
    const [statusRows]: any = await pool.execute(
      `SELECT status, COUNT(*) as count FROM users GROUP BY status`
    );
    
    // 今日刪除數
    const [todayRows]: any = await pool.execute(
      `SELECT COUNT(*) as count FROM account_audit_logs 
       WHERE action = 'DELETION_EXECUTED' 
         AND result = 'SUCCESS'
         AND created_at >= DATE(UTC_TIMESTAMP())`
    );
    
    // 總刪除數
    const [totalRows]: any = await pool.execute(
      `SELECT COUNT(*) as count FROM account_audit_logs 
       WHERE action = 'DELETION_EXECUTED' 
         AND result = 'SUCCESS'`
    );
    
    // 失敗數
    const [failedRows]: any = await pool.execute(
      `SELECT COUNT(*) as count FROM account_audit_logs 
       WHERE action = 'DELETION_EXECUTED' 
         AND result = 'FAILED'`
    );
    
    res.json({
      success: true,
      data: {
        usersByStatus: statusRows.reduce((acc: any, row: any) => {
          acc[row.status] = row.count;
          return acc;
        }, {}),
        deletedToday: todayRows[0].count,
        deletedTotal: totalRows[0].count,
        failedTotal: failedRows[0].count,
      },
    } as ApiResponse);
  } catch (error: any) {
    next(error);
  }
});

export default router;

