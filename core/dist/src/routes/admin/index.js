"use strict";
/**
 * Admin 路由总入口
 *
 * 路径：/api/admin/v1
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("./auth"));
const users_1 = __importDefault(require("./users"));
const llm_1 = __importDefault(require("./llm"));
const systemSettings_1 = __importDefault(require("./systemSettings"));
const feedbacks_1 = __importDefault(require("./feedbacks"));
const membership_1 = __importDefault(require("./membership"));
const router = (0, express_1.Router)();
// 挂载子路由
router.use('/auth', auth_1.default);
router.use('/users', users_1.default);
router.use('/llm-config', llm_1.default);
router.use('/system', systemSettings_1.default);
router.use('/feedbacks', feedbacks_1.default);
router.use('/membership', membership_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map