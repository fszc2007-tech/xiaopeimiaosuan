/**
 * 帳號刪除 Job
 *
 * 功能：
 * 1. 掃描 PENDING_DELETE 且已到期的用戶
 * 2. 按順序刪除用戶數據
 * 3. 匿名化 subscriptions
 * 4. 設置 tombstone 狀態
 *
 * 參考文檔：app.doc/features/註銷賬號功能設計方案.md v1.1 第 7 節
 */
import mysql from 'mysql2/promise';
type PoolConnection = mysql.PoolConnection;
/** 每批處理的用戶數量 */
declare const BATCH_SIZE = 200;
/** Job 執行日誌 */
interface JobLog {
    jobId: string;
    startTime: Date;
    endTime?: Date;
    totalUsers: number;
    successCount: number;
    failureCount: number;
    errors: Array<{
        userId: string;
        errorCode: string;
        errorMessage: string;
    }>;
}
/**
 * 執行帳號刪除 Job
 *
 * 掃描所有 PENDING_DELETE 且 delete_scheduled_at <= NOW() 的用戶
 */
export declare function executeAccountDeletionJob(): Promise<JobLog>;
/**
 * 刪除單個用戶的所有數據
 *
 * 使用事務確保原子性，按順序刪除：
 * 1. 聊天消息 (messages)
 * 2. 對話 (conversations)
 * 3. 解讀記錄 (readings)
 * 4. 八字結果 (bazi_charts) - 通過 chart_profiles 級聯刪除
 * 5. 命盤檔案 (chart_profiles)
 * 6. 用戶設置 (user_settings)
 * 7. 限流記錄 (rate_limits)
 * 8. 匿名化訂閱 (subscriptions)
 * 9. 設置 tombstone (users)
 */
declare function deleteUserData(userId: string): Promise<void>;
/**
 * 匿名化用戶的訂閱記錄
 *
 * 使用 HMAC-SHA256 生成不可逆的匿名化鍵
 */
declare function anonymizeSubscriptions(connection: PoolConnection, userId: string): Promise<void>;
/**
 * 設置用戶為 tombstone 狀態
 *
 * - 狀態改為 DELETED
 * - 清除所有 PII
 * - 保留 user_id 和 deleted_at
 */
declare function setUserTombstone(connection: PoolConnection, userId: string, originalPhone?: string): Promise<void>;
export { deleteUserData, anonymizeSubscriptions, setUserTombstone, BATCH_SIZE, };
//# sourceMappingURL=accountDeletionJob.d.ts.map