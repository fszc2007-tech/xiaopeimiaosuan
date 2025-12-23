/**
 * Job 調度器
 *
 * 管理所有定時任務的調度
 *
 * 參考文檔：app.doc/features/註銷賬號功能設計方案.md v1.1 第 7.4 節
 */
/**
 * 初始化調度器
 *
 * 在服務器啟動時調用
 */
export declare function initScheduler(): void;
/**
 * 停止所有調度任務
 *
 * 在服務器關閉時調用
 */
export declare function stopScheduler(): void;
/**
 * 手動觸發帳號刪除 Job（用於測試或管理後台）
 */
export declare function triggerDeletionJobManually(): Promise<{
    success: boolean;
    result?: any;
    error?: string;
}>;
declare const _default: {
    initScheduler: typeof initScheduler;
    stopScheduler: typeof stopScheduler;
    triggerDeletionJobManually: typeof triggerDeletionJobManually;
};
export default _default;
//# sourceMappingURL=scheduler.d.ts.map