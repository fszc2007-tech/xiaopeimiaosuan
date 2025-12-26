"use strict";
/**
 * 开发专用路由
 *
 * 仅在非生产环境可用 (NODE_ENV !== 'production')
 * 用于测试和开发，不应在生产环境暴露
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uuid_1 = require("uuid");
const auth_1 = require("../middleware/auth");
const connection_1 = require("../database/connection");
const requirePro_1 = require("../middleware/requirePro");
const router = (0, express_1.Router)();
// 所有 dev 路由都需要认证
router.use(auth_1.requireAuth);
/**
 * POST /dev/force-pro
 *
 * 开发专用：强制将用户升级为 Pro 会员
 *
 * 用途：
 * - iOS App Mock 订阅流程
 * - 快速测试 Pro 功能
 * - 多设备同步测试
 *
 * 注意：
 * - 仅在非生产环境可用
 * - 需要用户认证
 * - 会直接修改数据库
 */
router.post('/force-pro', async (req, res) => {
    try {
        const userId = req.userId;
        const { plan = 'yearly' } = req.body;
        // 验证 plan 参数
        if (!['monthly', 'quarterly', 'yearly', 'lifetime'].includes(plan)) {
            res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_PLAN',
                    message: 'plan 必须是 monthly、quarterly、yearly 或 lifetime',
                },
            });
            return;
        }
        const pool = (0, connection_1.getPool)();
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            // 1. 计算到期时间
            const now = new Date();
            let expiresAt = null;
            if (plan === 'lifetime') {
                expiresAt = null;
            }
            else {
                const months = plan === 'monthly' ? 1 : plan === 'quarterly' ? 3 : 12;
                expiresAt = new Date(now.getTime() + months * 30 * 24 * 60 * 60 * 1000);
            }
            // 2. 更新用户 Pro 状态
            await connection.execute(`UPDATE users 
         SET is_pro = TRUE, 
             pro_plan = ?, 
             pro_expires_at = ?,
             updated_at = NOW()
         WHERE user_id = ?`, [plan, expiresAt, userId]);
            // 3. 插入订阅记录（标记为 dev-mock）
            const subscriptionId = (0, uuid_1.v4)();
            await connection.execute(`INSERT INTO subscriptions 
         (subscription_id, user_id, plan, status, started_at, expires_at, payment_provider, created_at, updated_at)
         VALUES (?, ?, ?, 'active', NOW(), ?, 'none', NOW(), NOW())`, [subscriptionId, userId, plan, expiresAt]);
            await connection.commit();
            // 4. 清除缓存
            (0, requirePro_1.clearProStatusCache)(userId);
            // 5. 查询更新后的用户信息
            // 注意：users 表已删除 email 字段（migration 008）
            const [userRows] = await connection.execute('SELECT user_id, phone, is_pro, pro_plan, pro_expires_at FROM users WHERE user_id = ?', [userId]);
            const user = userRows[0];
            res.json({
                success: true,
                data: {
                    message: '已成功升级为 Pro 会员（开发模式）',
                    user: {
                        userId: user.user_id,
                        phone: user.phone,
                        email: user.email,
                        isPro: Boolean(user.is_pro),
                        proPlan: user.pro_plan,
                        proExpiresAt: user.pro_expires_at ? user.pro_expires_at.toISOString() : null,
                    },
                    source: 'dev-mock',
                },
            });
        }
        catch (error) {
            await connection.rollback();
            throw error;
        }
        finally {
            connection.release();
        }
    }
    catch (error) {
        console.error('[Dev] Force Pro error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: error.message || '服务器内部错误',
            },
        });
    }
});
/**
 * POST /dev/reset-pro
 *
 * 开发专用：重置用户的 Pro 状态
 */
router.post('/reset-pro', async (req, res) => {
    try {
        const userId = req.userId;
        const pool = (0, connection_1.getPool)();
        await pool.execute(`UPDATE users 
       SET is_pro = FALSE, 
           pro_plan = NULL, 
           pro_expires_at = NULL,
           updated_at = NOW()
       WHERE user_id = ?`, [userId]);
        // 清除缓存
        (0, requirePro_1.clearProStatusCache)(userId);
        res.json({
            success: true,
            data: {
                message: '已重置 Pro 状态',
            },
        });
    }
    catch (error) {
        console.error('[Dev] Reset Pro error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: error.message || '服务器内部错误',
            },
        });
    }
});
exports.default = router;
//# sourceMappingURL=dev.js.map