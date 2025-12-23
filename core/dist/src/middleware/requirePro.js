"use strict";
/**
 * Pro 权限中间件
 *
 * 功能：
 * 1. 检查用户是否为 Pro 用户
 * 2. 验证 Pro 是否在有效期内
 * 3. 使用缓存机制减少数据库查询
 *
 * 遵循文档：
 * - app.doc/features/小佩Pro-功能与服务说明文档.md
 * - Phase 4 需求确认（最终版）
 *
 * Pro 状态判断逻辑：
 * - pro_plan = 'lifetime' → 永久 Pro（但需 is_pro = TRUE）
 * - 否则：当前时间 < pro_expires_at 且 is_pro = TRUE
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePro = requirePro;
exports.checkProStatus = checkProStatus;
exports.clearProStatusCache = clearProStatusCache;
const connection_1 = require("../database/connection");
const proStatusCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5分钟
/**
 * Pro 权限中间件
 *
 * 必须在用户认证中间件之后使用（即 req.userId 已存在）
 */
async function requirePro(req, res, next) {
    try {
        // 1. 确保用户已认证（从 authMiddleware 设置的 req.userId 获取）
        const userId = req.userId;
        if (!userId) {
            res.status(401).json({
                success: false,
                error: {
                    code: 'AUTH_REQUIRED',
                    message: '请先登录',
                },
            });
            return;
        }
        // 2. 检查缓存
        const cached = proStatusCache.get(userId);
        const now = Date.now();
        let isPro;
        if (cached && cached.expiresAt > now) {
            // 使用缓存
            isPro = cached.isPro;
        }
        else {
            // 查询数据库
            const pool = (0, connection_1.getPool)();
            const [rows] = await pool.execute('SELECT is_pro, pro_expires_at, pro_plan FROM users WHERE user_id = ?', [userId]);
            if (rows.length === 0) {
                res.status(404).json({
                    success: false,
                    error: {
                        code: 'USER_NOT_FOUND',
                        message: '用户不存在',
                    },
                });
                return;
            }
            const user = rows[0];
            // 3. 判断 Pro 状态
            isPro = checkProStatus(user.is_pro, user.pro_expires_at, user.pro_plan);
            // 更新缓存
            proStatusCache.set(userId, {
                isPro,
                expiresAt: now + CACHE_TTL_MS,
            });
        }
        if (!isPro) {
            res.status(403).json({
                success: false,
                error: {
                    code: 'PRO_REQUIRED',
                    message: '此功能仅限 Pro 用户使用',
                    details: {
                        upgradeUrl: '/pro/subscribe', // 前端可以引导用户跳转
                    },
                },
            });
            return;
        }
        // 4. Pro 验证通过，继续
        next();
    }
    catch (error) {
        console.error('[requirePro] Error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: '服务器内部错误',
            },
        });
    }
}
/**
 * Pro 状态判断（可复用的工具函数）
 *
 * @param isPro 用户的 is_pro 字段
 * @param proExpiresAt 用户的 pro_expires_at 字段
 * @param proPlan 用户的 pro_plan 字段
 * @returns 是否为有效 Pro 用户
 *
 * 判断逻辑：
 * 1. lifetime 用户：必须 is_pro = TRUE 且 pro_plan = 'lifetime'
 * 2. 非 lifetime 用户：必须 is_pro = TRUE 且当前时间 < pro_expires_at
 */
function checkProStatus(isPro, proExpiresAt, proPlan) {
    // 必须 is_pro = TRUE
    if (!isPro) {
        return false;
    }
    // 1. lifetime 用户 → 永久 Pro（但仍需 is_pro = TRUE）
    if (proPlan === 'lifetime') {
        return true;
    }
    // 2. 非 lifetime 用户 → 检查到期时间
    if (!proExpiresAt) {
        return false;
    }
    // 使用 UTC 时间比较，避免时区问题
    const now = new Date();
    const expiresAt = new Date(proExpiresAt);
    // 允许 1 分钟的缓冲时间（避免边界情况）
    return now.getTime() < expiresAt.getTime() + 60 * 1000;
}
/**
 * 清除用户的 Pro 状态缓存（在订阅/取消订阅时调用）
 *
 * @param userId 用户 ID
 */
function clearProStatusCache(userId) {
    proStatusCache.delete(userId);
}
//# sourceMappingURL=requirePro.js.map