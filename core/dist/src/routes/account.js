"use strict";
/**
 * 帳號管理路由
 *
 * 路徑：/api/v1/account/*
 *
 * 參考文檔：app.doc/features/註銷賬號功能設計方案.md v1.1
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const accountService = __importStar(require("../modules/account/accountService"));
const authService_1 = require("../modules/auth/authService");
const apiDocs_1 = require("../utils/apiDocs");
const router = (0, express_1.Router)();
// ===== API 文檔註冊 =====
(0, apiDocs_1.registerApi)({
    method: 'POST',
    path: '/api/v1/account/deletion-request',
    description: '發起註銷申請（進入 7 天寬限期）',
    auth: true,
    request: {
        body: {},
    },
    response: {
        success: { status: 'PENDING_DELETE', deleteScheduledAt: 'ISO 8601' },
        error: ['USER_NOT_FOUND', 'ACCOUNT_ALREADY_DELETED'],
    },
});
(0, apiDocs_1.registerApi)({
    method: 'GET',
    path: '/api/v1/account/deletion-status',
    description: '查詢刪除狀態',
    auth: true,
    response: {
        success: {
            status: 'ACTIVE | PENDING_DELETE | DELETED',
            deleteScheduledAt: 'ISO 8601 | null',
            serverNow: 'ISO 8601',
        },
        error: ['USER_NOT_FOUND'],
    },
});
(0, apiDocs_1.registerApi)({
    method: 'POST',
    path: '/api/v1/account/deletion-cancel',
    description: '撤銷註銷申請',
    auth: true,
    request: {
        body: {},
    },
    response: {
        success: { status: 'ACTIVE' },
        error: ['USER_NOT_FOUND', 'CANNOT_CANCEL_DELETION_EXPIRED', 'CANNOT_CANCEL_DELETION_INVALID_STATE'],
    },
});
// ===== 認證中間件 =====
/**
 * 驗證 JWT Token 中間件
 */
async function authMiddleware(req, res, next) {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'TOKEN_REQUIRED',
                    message: '未提供認證 Token',
                },
            });
        }
        const decoded = (0, authService_1.verifyToken)(token);
        req.userId = decoded.userId;
        next();
    }
    catch (error) {
        return res.status(401).json({
            success: false,
            error: {
                code: 'INVALID_TOKEN',
                message: 'Token 無效或已過期',
            },
        });
    }
}
// ===== 路由定義 =====
/**
 * POST /api/v1/account/deletion-request
 * 發起註銷申請（進入 7 天寬限期）
 */
router.post('/deletion-request', authMiddleware, async (req, res, next) => {
    try {
        const userId = req.userId;
        const result = await accountService.requestDeletion(userId);
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
 * GET /api/v1/account/deletion-status
 * 查詢刪除狀態
 */
router.get('/deletion-status', authMiddleware, async (req, res, next) => {
    try {
        const userId = req.userId;
        const result = await accountService.getDeletionStatus(userId);
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
 * POST /api/v1/account/deletion-cancel
 * 撤銷註銷申請
 */
router.post('/deletion-cancel', authMiddleware, async (req, res, next) => {
    try {
        const userId = req.userId;
        const result = await accountService.cancelDeletion(userId);
        res.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=account.js.map