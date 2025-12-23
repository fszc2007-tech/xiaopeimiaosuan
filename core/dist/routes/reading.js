"use strict";
/**
 * 解读路由
 *
 * 路径：/api/v1/reading/*
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
const requireProFeature_1 = require("../middleware/requireProFeature");
const readingService = __importStar(require("../modules/reading/readingService"));
const router = (0, express_1.Router)();
// 所有解读路由都需要认证
router.use(auth_1.authMiddleware);
/**
 * POST /api/v1/reading/shensha
 * 神煞解读（需要 Pro 权限，可通过 Admin 配置）
 */
router.post('/shensha', (0, requireProFeature_1.requireProFeature)('shensha'), async (req, res, next) => {
    try {
        const userId = req.userId;
        const { chartId, shenshaCode, shenshaName, userQuestion, model } = req.body;
        if (!chartId || !shenshaCode || !shenshaName) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_INPUT',
                    message: '缺少必要参数：chartId, shenshaCode, shenshaName',
                },
            });
        }
        const result = await readingService.readShensha({
            userId,
            chartId,
            shenshaCode,
            shenshaName,
            userQuestion,
            model,
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
 * POST /api/v1/reading/overview
 * 命盘总览解读（需要 Pro 权限，可通过 Admin 配置）
 */
router.post('/overview', (0, requireProFeature_1.requireProFeature)('overview'), async (req, res, next) => {
    try {
        const userId = req.userId;
        const { chartId, sectionKey, userQuestion, model } = req.body;
        if (!chartId || !sectionKey) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_INPUT',
                    message: '缺少必要参数：chartId, sectionKey',
                },
            });
        }
        const result = await readingService.readOverview({
            userId,
            chartId,
            sectionKey,
            userQuestion,
            model,
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
 * POST /api/v1/reading/chat
 * 通用解读（聊天）
 */
router.post('/chat', async (req, res, next) => {
    try {
        const userId = req.userId;
        const { chartId, userQuestion, conversationId, model } = req.body;
        if (!chartId || !userQuestion) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_INPUT',
                    message: '缺少必要参数：chartId, userQuestion',
                },
            });
        }
        const result = await readingService.readGeneral({
            userId,
            chartId,
            userQuestion,
            conversationId,
            model,
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
 * POST /api/v1/reading/follow-ups
 * 生成追问建议
 */
router.post('/follow-ups', async (req, res, next) => {
    try {
        const { lastUserQuestion, lastAssistantResponse, model } = req.body;
        if (!lastUserQuestion || !lastAssistantResponse) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_INPUT',
                    message: '缺少必要参数：lastUserQuestion, lastAssistantResponse',
                },
            });
        }
        const suggestions = await readingService.generateFollowUps({
            lastUserQuestion,
            lastAssistantResponse,
            model,
        });
        res.json({
            success: true,
            data: { suggestions },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=reading.js.map