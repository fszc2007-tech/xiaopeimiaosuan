"use strict";
/**
 * 数据库连接管理
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createConnection = createConnection;
exports.getPool = getPool;
exports.closeConnection = closeConnection;
const promise_1 = __importDefault(require("mysql2/promise"));
let pool = null;
async function createConnection() {
    if (pool) {
        return pool;
    }
    // 判断是否使用 Unix Socket（Cloud Run 生产环境）
    const mysqlHost = process.env.XIAOPEI_MYSQL_HOST || 'localhost';
    const isUnixSocket = mysqlHost.startsWith('/');
    // 连接池限制：生产环境默认 3，开发环境默认 10
    const connectionLimit = parseInt(process.env.MYSQL_CONNECTION_LIMIT ||
        (process.env.NODE_ENV === 'production' ? '3' : '10'));
    pool = promise_1.default.createPool({
        // Cloud Run 使用 Unix Socket，本地开发使用 TCP/IP
        ...(isUnixSocket
            ? { socketPath: mysqlHost }
            : {
                host: mysqlHost,
                port: parseInt(process.env.XIAOPEI_MYSQL_PORT || '3306'),
            }),
        user: process.env.XIAOPEI_MYSQL_USER || 'root',
        password: process.env.XIAOPEI_MYSQL_PASSWORD || '',
        database: process.env.XIAOPEI_MYSQL_DATABASE || 'xiaopei',
        charset: 'utf8mb4',
        waitForConnections: true,
        connectionLimit,
        queueLimit: 0,
    });
    console.log(`[Database] Connection config: ${isUnixSocket ? 'Unix Socket' : 'TCP/IP'}, connectionLimit: ${connectionLimit}`);
    // 测试连接并验证编码
    try {
        const connection = await pool.getConnection();
        // 确保连接使用 UTF-8 编码（双重保险）
        await connection.execute('SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci');
        await connection.execute('SET CHARACTER SET utf8mb4');
        console.log('[Database] MySQL connection pool created with utf8mb4 encoding');
        connection.release();
    }
    catch (error) {
        console.error('[Database] Failed to create connection pool:', error);
        throw error;
    }
    return pool;
}
function getPool() {
    if (!pool) {
        throw new Error('[Database] Connection pool not initialized. Call createConnection() first.');
    }
    return pool;
}
async function closeConnection() {
    if (pool) {
        await pool.end();
        pool = null;
        console.log('[Database] Connection pool closed');
    }
}
//# sourceMappingURL=connection.js.map