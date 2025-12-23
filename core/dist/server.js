"use strict";
/**
 * Core 后端服务入口
 *
 * 负责启动 Express 服务器，注册路由和中间件
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const connection_1 = require("./database/connection");
// 加载环境变量
dotenv_1.default.config();
const app = (0, express_1.default)();
// Cloud Run 会注入 PORT 环境变量，优先使用
const PORT = parseInt(process.env.PORT || process.env.XIAOPEI_CORE_PORT || '3000', 10);
// ===== 中间件配置 =====
// CORS 配置
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:19006', // App 前端
    'http://localhost:5173', // Admin 前端
    /^exp:\/\/.*/, // Expo Go (所有 exp:// 开头的 origin)
    /^http:\/\/192\.168\.\d+\.\d+:.*/, // 局域网 IP
    /^http:\/\/10\.\d+\.\d+\.\d+:.*/, // 10.x.x.x 网段
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // 开发环境：允许所有请求
        if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
            console.log('[CORS] Development mode - allowing origin:', origin || 'null');
            return callback(null, true);
        }
        // 生产环境：允许无 origin 的请求（移动端）
        if (!origin)
            return callback(null, true);
        // 检查是否匹配允许的 origin
        const isAllowed = allowedOrigins.some(allowed => {
            if (typeof allowed === 'string') {
                return origin === allowed;
            }
            if (allowed instanceof RegExp) {
                return allowed.test(origin);
            }
            return false;
        });
        if (isAllowed) {
            callback(null, true);
        }
        else {
            console.warn('[CORS] Blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
// 设置响应头：确保 UTF-8 编码
app.use((_req, res, next) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    next();
});
// Body 解析
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// 请求日志（简单版）
app.use((req, _res, next) => {
    console.log(`[Request] ${req.method} ${req.path}`);
    next();
});
// ===== 路由注册 =====
// 健康检查
app.get('/health', (_req, res) => {
    res.json({
        success: true,
        data: {
            status: 'ok',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
        }
    });
});
// API 路由
const auth_1 = __importDefault(require("./routes/auth"));
const account_1 = __importDefault(require("./routes/account"));
const bazi_1 = __importDefault(require("./routes/bazi"));
const reading_1 = __importDefault(require("./routes/reading"));
const conversation_1 = __importDefault(require("./routes/conversation"));
const pro_1 = __importDefault(require("./routes/pro"));
const feedback_1 = __importDefault(require("./routes/feedback"));
const admin_1 = __importDefault(require("./routes/admin"));
app.use('/api/v1/auth', auth_1.default);
app.use('/api/v1/account', account_1.default);
app.use('/api/v1/bazi', bazi_1.default);
app.use('/api/v1/reading', reading_1.default);
app.use('/api/v1/chat/conversations', conversation_1.default); // 修复：统一使用 /chat/ 前缀
app.use('/api/v1/pro', pro_1.default);
app.use('/api/v1/feedback', feedback_1.default);
app.use('/api/admin/v1', admin_1.default);
// 开发专用路由（仅非生产环境）
if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const devRoutes = require('./routes/dev').default;
    app.use('/dev', devRoutes);
    console.log('[Dev] Development routes registered at /dev/*');
}
// ===== 错误处理 =====
// 404 处理
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: '请求的资源不存在',
        },
    });
});
// 全局错误处理
app.use((err, _req, res, _next) => {
    console.error('[Error]', err);
    res.status(err.status || 500).json({
        success: false,
        error: {
            code: err.code || 'INTERNAL_SERVER_ERROR',
            message: err.message || '服务器内部错误',
            details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        },
    });
});
// ===== 启动服务器 =====
async function startServer() {
    try {
        // 连接数据库
        await (0, connection_1.createConnection)();
        console.log('[Database] Connected successfully');
        // 启动服务器（监听所有网络接口）
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`[Server] Core service is running on port ${PORT}`);
            console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`[Server] Health check: http://localhost:${PORT}/health`);
            console.log(`[Server] Local network: http://172.20.10.2:${PORT}/health`);
        });
    }
    catch (error) {
        console.error('[Server] Failed to start:', error);
        process.exit(1);
    }
}
// 启动服务器
startServer();
// 优雅关闭
process.on('SIGTERM', () => {
    console.log('[Server] SIGTERM received, shutting down gracefully...');
    process.exit(0);
});
process.on('SIGINT', () => {
    console.log('[Server] SIGINT received, shutting down gracefully...');
    process.exit(0);
});
//# sourceMappingURL=server.js.map