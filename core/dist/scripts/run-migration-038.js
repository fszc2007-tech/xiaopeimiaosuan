"use strict";
/**
 * 执行迁移 038: 创建聊天消息反馈表
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
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const connection_1 = require("../src/database/connection");
// 加载环境变量
dotenv.config();
async function runMigration() {
    console.log('[Migration] 开始执行迁移 038_create_chat_message_feedback.sql...');
    try {
        // 连接数据库
        const pool = await (0, connection_1.createConnection)();
        console.log('[Migration] 数据库连接成功');
        // 读取 SQL 文件
        const sqlPath = path.join(__dirname, '../src/database/migrations/038_create_chat_message_feedback.sql');
        const sql = fs.readFileSync(sqlPath, 'utf-8');
        // 移除注释和空行，然后按分号分割
        const cleanedSql = sql
            .replace(/--.*$/gm, '') // 移除单行注释
            .replace(/\/\*[\s\S]*?\*\//g, '') // 移除多行注释
            .trim();
        // 按分号分割，但保留 CREATE TABLE 等完整语句
        const statements = cleanedSql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);
        console.log(`[Migration] 找到 ${statements.length} 条 SQL 语句`);
        // 执行每条 SQL 语句
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (statement.length === 0) {
                continue;
            }
            try {
                console.log(`[Migration] 执行语句 ${i + 1}/${statements.length}...`);
                // 使用 query 而不是 execute，因为有些语句可能包含特殊语法
                await pool.query(statement + ';');
                console.log(`[Migration] ✓ 语句 ${i + 1} 执行成功`);
            }
            catch (error) {
                // 如果是表已存在的错误，可以忽略
                if (error.message?.includes('already exists') ||
                    error.code === 'ER_TABLE_EXISTS_ERROR' ||
                    error.code === 'ER_DUP_ENTRY') {
                    console.log(`[Migration] ⚠ 语句 ${i + 1} 跳过（已存在）`);
                }
                else {
                    console.error(`[Migration] ✗ 语句 ${i + 1} 执行失败:`, error.message);
                    console.error(`[Migration] SQL:`, statement.substring(0, 200));
                    throw error;
                }
            }
        }
        // 验证表是否创建成功
        console.log('[Migration] 验证表结构...');
        const [tables] = await pool.execute(`SELECT TABLE_NAME 
       FROM information_schema.TABLES 
       WHERE TABLE_SCHEMA = ? 
       AND TABLE_NAME = 'chat_message_feedback'`, [process.env.XIAOPEI_MYSQL_DATABASE || 'xiaopei']);
        if (tables.length > 0) {
            console.log(`[Migration] ✅ 表 chat_message_feedback 创建成功！`);
        }
        else {
            console.warn(`[Migration] ⚠ 表 chat_message_feedback 未找到`);
        }
        console.log('[Migration] ✅ 迁移执行成功！');
        // 关闭连接
        await (0, connection_1.closeConnection)();
    }
    catch (error) {
        console.error('[Migration] ❌ 迁移执行失败:', error);
        process.exit(1);
    }
}
// 执行迁移
runMigration();
//# sourceMappingURL=run-migration-038.js.map