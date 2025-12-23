"use strict";
/**
 * 反馈路由
 *
 * 路径：/api/v1/feedback/*
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
const auth_1 = require("../middleware/auth");
const feedbackService = __importStar(require("../modules/feedback/feedbackService"));
const router = (0, express_1.Router)();
// 所有反馈路由都需要认证
router.use(auth_1.authMiddleware);
/**
 * POST /api/v1/feedback
 * 提交反馈
 */
router.post('/', async (req, res, next) => {
    try {
        const userId = req.userId;
        const { type, content, contact, imagesJson } = req.body;
        // 参数验证
        if (!type || !content) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_INPUT',
                    message: '缺少必要参数：type, content',
                },
            });
        }
        if (type !== 'suggest' && type !== 'problem') {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_INPUT',
                    message: 'type 必须是 suggest 或 problem',
                },
            });
        }
        const feedback = await feedbackService.createFeedback({
            userId,
            type,
            content,
            contact,
            imagesJson,
        });
        res.json({
            success: true,
            data: feedback,
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/v1/feedback
 * 获取当前用户的反馈列表
 */
router.get('/', async (req, res, next) => {
    try {
        const userId = req.userId;
        const { type, status, page, pageSize } = req.query;
        const result = await feedbackService.getFeedbackList({
            userId,
            type: type,
            status: status,
            page: page ? parseInt(page) : undefined,
            pageSize: pageSize ? parseInt(pageSize) : undefined,
        });
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
 * GET /api/v1/feedback/:id
 * 获取单个反馈详情
 */
router.get('/:id', async (req, res, next) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        const feedback = await feedbackService.getFeedbackById(id);
        if (!feedback) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'NOT_FOUND',
                    message: '反馈不存在',
                },
            });
        }
        // 只能查看自己的反馈
        if (feedback.userId !== userId) {
            return res.status(403).json({
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: '无权访问此反馈',
                },
            });
        }
        res.json({
            success: true,
            data: feedback,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=feedback.js.map