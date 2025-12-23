/**
 * 数据库连接管理
 */
import mysql from 'mysql2/promise';
export declare function createConnection(): Promise<mysql.Pool>;
export declare function getPool(): mysql.Pool;
export declare function closeConnection(): Promise<void>;
//# sourceMappingURL=connection.d.ts.map