"use strict";
/**
 * Pro 功能门禁中间件
 *
 * 功能：
 * - 检查特定功能是否需要 Pro 权限
 * - 支持通过 Admin 动态配置
 * - 友好的错误提示和升级引导
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireProFeature = requireProFeature;
exports.getUserAvailableFeatures = getUserAvailableFeatures;
const connection_1 = require("../database/connection");
const requirePro_1 = require("./requirePro");
const systemConfigService_1 = require("../services/systemConfigService");
/**
 * 创建 Pro 功能检查中间件
 */
function requireProFeature(featureKey) {
    return async (req, res, next) => {
        try {
            const userId = req.userId;
            // 1. 确保用户已认证
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
            // 2. 检查系统配置：该功能是否需要 Pro
            const requiresPro = await (0, systemConfigService_1.isProFeatureGated)(featureKey);
            if (!requiresPro) {
                // 该功能无需 Pro，直接通过
                return next();
            }
            // 3. 查询用户 Pro 状态
            const pool = (0, connection_1.getPool)();
            const [userRows] = await pool.query('SELECT is_pro, pro_expires_at, pro_plan FROM users WHERE user_id = ?', [userId]);
            if (userRows.length === 0) {
                res.status(404).json({
                    success: false,
                    error: {
                        code: 'USER_NOT_FOUND',
                        message: '用户不存在',
                    },
                });
                return;
            }
            const user = userRows[0];
            // 4. 检查 Pro 状态
            const isPro = (0, requirePro_1.checkProStatus)(user.is_pro, user.pro_expires_at, user.pro_plan);
            if (!isPro) {
                // 用户不是 Pro，拒绝访问
                const featureNames = {
                    shensha: '神煞解读',
                    overview: '命盘总览解读',
                    advanced_chat: '高级对话功能',
                };
                res.status(403).json({
                    success: false,
                    error: {
                        code: 'PRO_REQUIRED',
                        message: `${featureNames[featureKey]}需要 Pro 权限`,
                        details: {
                            feature: featureKey,
                            featureName: featureNames[featureKey],
                            upgradeUrl: '/pro/subscribe',
                            benefits: [
                                '无限制排盘',
                                '无限制对话',
                                '神煞深度解读',
                                '命盘总览分析',
                                '流年流月详解',
                            ],
                        },
                    },
                });
                return;
            }
            // 5. Pro 验证通过
            next();
        }
        catch (error) {
            console.error('[RequireProFeature] Error:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: '服务器内部错误',
                },
            });
        }
    };
}
/**
 * 获取用户可用功能列表（工具函数）
 */
async function getUserAvailableFeatures(userId) {
    const pool = (0, connection_1.getPool)();
    // 1. 查询用户 Pro 状态
    const [userRows] = await pool.query('SELECT is_pro, pro_expires_at, pro_plan FROM users WHERE user_id = ?', [userId]);
    if (userRows.length === 0) {
        throw new Error('USER_NOT_FOUND');
    }
    const user = userRows[0];
    const isPro = (0, requirePro_1.checkProStatus)(user.is_pro, user.pro_expires_at, user.pro_plan);
    // 2. 如果是 Pro 用户，所有功能都可用
    if (isPro) {
        return {
            isPro: true,
            availableFeatures: ['shensha', 'overview', 'advanced_chat', 'unlimited_charts', 'unlimited_chat'],
            lockedFeatures: [],
        };
    }
    // 3. 非 Pro 用户，查询哪些功能被锁定
    const allFeatures = ['shensha', 'overview', 'advanced_chat'];
    const lockedFeatures = [];
    const availableFeatures = [];
    for (const feature of allFeatures) {
        const isLocked = await (0, systemConfigService_1.isProFeatureGated)(feature);
        if (isLocked) {
            lockedFeatures.push(feature);
        }
        else {
            availableFeatures.push(feature);
        }
    }
    return {
        isPro: false,
        availableFeatures,
        lockedFeatures,
    };
}
//# sourceMappingURL=requireProFeature.js.map