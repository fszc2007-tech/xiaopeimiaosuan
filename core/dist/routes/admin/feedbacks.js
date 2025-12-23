"use strict";
/**
 * Admin - 反馈管理路由
 *
 * 路径：/api/v1/admin/feedbacks/*
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
const feedbackService = __importStar(require("../../modules/feedback/feedbackService"));
const router = (0, express_1.Router)();
/**
 * GET /api/v1/admin/feedbacks
 * 获取所有反馈列表（支持筛选和分页）
 */
router.get('/', async (req, res, next) => {
    try {
        const { type, status, userId, page, pageSize } = req.query;
        const result = await feedbackService.getFeedbackList({
            type: type,
            status: status,
            userId: userId,
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
 * GET /api/v1/admin/feedbacks/:id
 * 获取单个反馈详情
 */
router.get('/:id', async (req, res, next) => {
    try {
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
 * PUT /api/v1/admin/feedbacks/:id
 * 更新反馈（状态/回复）
 */
router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, adminReply } = req.body;
        const feedback = await feedbackService.updateFeedback(id, {
            status,
            adminReply,
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
 * DELETE /api/v1/admin/feedbacks/:id
 * 删除反馈
 */
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        await feedbackService.deleteFeedback(id);
        res.json({
            success: true,
            data: { message: '删除成功' },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=feedbacks.js.map