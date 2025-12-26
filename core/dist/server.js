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
const redis_1 = require("./database/redis");
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
// 设置响应头：确保 UTF-8 编码（仅对 JSON 响应）
// 注意：不要全局设置 Content-Type，否则会覆盖静态文件（如 PDF）的正确 MIME 类型
app.use((_req, res, next) => {
    // 只对 JSON API 响应设置 Content-Type，静态文件由 express.static 自动处理
    const originalJson = res.json;
    res.json = function (body) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        return originalJson.call(this, body);
    };
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
// ===== 静态文件服务 =====
const path_1 = __importDefault(require("path"));
// 提供 public 目录下的静态文件（如 PDF 文档）
app.use('/public', express_1.default.static(path_1.default.join(__dirname, '../public')));
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
    // #region agent log
    const fs = require('fs');
    const logPath = '/Users/gaoxuxu/Desktop/xiaopei-app/.cursor/debug.log';
    const log = (data) => {
        try {
            fs.appendFileSync(logPath, JSON.stringify({ ...data, timestamp: Date.now() }) + '\n');
        }
        catch (e) { }
    };
    log({ location: 'server.ts:globalErrorHandler', message: 'Global error handler triggered', data: { errorMessage: err?.message, errorCode: err?.code, errorName: err?.name, errorStatus: err?.status, headersSent: res.headersSent, url: _req.url, method: _req.method }, sessionId: 'debug-session', runId: 'run1', hypothesisId: 'D' });
    // #endregion
    console.error('[Error]', err);
    // 如果响应头已经发送，不能再次发送
    if (res.headersSent) {
        // #region agent log
        log({ location: 'server.ts:globalErrorHandler:headersSent', message: 'Response headers already sent in global error handler', data: { errorMessage: err?.message }, sessionId: 'debug-session', runId: 'run1', hypothesisId: 'C,D' });
        // #endregion
        return;
    }
    // #region agent log
    log({ location: 'server.ts:globalErrorHandler:sendingResponse', message: 'Sending error response from global handler', data: { status: err.status || 500, headersSent: res.headersSent }, sessionId: 'debug-session', runId: 'run1', hypothesisId: 'D' });
    // #endregion
    res.status(err.status || 500).json({
        success: false,
        error: {
            code: err.code || 'INTERNAL_SERVER_ERROR',
            message: err.message || '服务器内部错误',
            details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        },
    });
    // #region agent log
    log({ location: 'server.ts:globalErrorHandler:responseSent', message: 'Error response sent from global handler', data: { headersSent: res.headersSent }, sessionId: 'debug-session', runId: 'run1', hypothesisId: 'D' });
    // #endregion
});
// ===== 启动服务器 =====
async function startServer() {
    try {
        // 连接数据库
        await (0, connection_1.createConnection)();
        console.log('[Database] Connected successfully');
        // 尝试初始化 Redis（如果配置了 XIAOPEI_REDIS_URL）
        if (process.env.XIAOPEI_REDIS_URL) {
            try {
                await (0, redis_1.createRedisConnection)();
                console.log('[Redis] Connected successfully');
            }
            catch (error) {
                console.warn('[Redis] Failed to connect, rate limiting will be disabled:', error instanceof Error ? error.message : error);
                // Redis 连接失败不影响服务器启动，限流服务会降级处理
            }
        }
        else {
            console.log('[Redis] XIAOPEI_REDIS_URL not configured, rate limiting will be disabled');
        }
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