"use strict";
/**
 * Job 調度器
 *
 * 管理所有定時任務的調度
 *
 * 參考文檔：app.doc/features/註銷賬號功能設計方案.md v1.1 第 7.4 節
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initScheduler = initScheduler;
exports.stopScheduler = stopScheduler;
exports.triggerDeletionJobManually = triggerDeletionJobManually;
const node_cron_1 = __importDefault(require("node-cron"));
const accountDeletionJob_1 = require("./accountDeletionJob");
const aggregateDailyUsage_1 = require("./aggregateDailyUsage");
// ===== 配置 =====
/** 是否啟用調度器（可通過環境變量控制） */
const SCHEDULER_ENABLED = process.env.XIAOPEI_SCHEDULER_ENABLED !== '0';
/** 帳號刪除 Job 執行頻率（Cron 表達式） */
const DELETION_JOB_CRON = process.env.XIAOPEI_DELETION_JOB_CRON || '0 * * * *'; // 默認每小時執行
// ===== 調度任務 =====
/** 已註冊的任務列表 */
const scheduledTasks = [];
/**
 * 初始化調度器
 *
 * 在服務器啟動時調用
 */
function initScheduler() {
    if (!SCHEDULER_ENABLED) {
        console.log('[Scheduler] 調度器已禁用（XIAOPEI_SCHEDULER_ENABLED=0）');
        return;
    }
    console.log('[Scheduler] ========== 初始化調度器 ==========');
    // ===== 1. 帳號刪除 Job（每小時執行） =====
    const deletionTask = node_cron_1.default.schedule(DELETION_JOB_CRON, async () => {
        console.log(`[Scheduler] 觸發帳號刪除 Job: ${new Date().toISOString()}`);
        try {
            const result = await (0, accountDeletionJob_1.executeAccountDeletionJob)();
            console.log(`[Scheduler] 帳號刪除 Job 完成: 成功=${result.successCount}, 失敗=${result.failureCount}`);
        }
        catch (error) {
            console.error('[Scheduler] 帳號刪除 Job 執行失敗:', error.message);
        }
    }, {
        timezone: 'UTC', // 使用 UTC 時區
    });
    scheduledTasks.push(deletionTask);
    console.log(`[Scheduler] ✅ 帳號刪除 Job 已註冊（Cron: ${DELETION_JOB_CRON}）`);
    // ===== 2. LLM 使用統計聚合（每天 0:05 執行） =====
    const dailyAggregateTask = node_cron_1.default.schedule('5 0 * * *', async () => {
        console.log(`[Scheduler] 觸發每日聚合 Job: ${new Date().toISOString()}`);
        try {
            await (0, aggregateDailyUsage_1.aggregateYesterday)();
            console.log('[Scheduler] 每日聚合 Job 完成');
        }
        catch (error) {
            console.error('[Scheduler] 每日聚合 Job 執行失敗:', error.message);
        }
    }, {
        timezone: 'UTC',
    });
    scheduledTasks.push(dailyAggregateTask);
    console.log('[Scheduler] ✅ 每日聚合 Job 已註冊（Cron: 5 0 * * *）');
    // ===== 3. LLM 使用統計補聚合（每小時執行） =====
    const hourlyAggregateTask = node_cron_1.default.schedule('30 * * * *', async () => {
        console.log(`[Scheduler] 觸發每小時聚合 Job: ${new Date().toISOString()}`);
        try {
            await (0, aggregateDailyUsage_1.aggregateToday)();
            console.log('[Scheduler] 每小時聚合 Job 完成');
        }
        catch (error) {
            console.error('[Scheduler] 每小時聚合 Job 執行失敗:', error.message);
        }
    }, {
        timezone: 'UTC',
    });
    scheduledTasks.push(hourlyAggregateTask);
    console.log('[Scheduler] ✅ 每小時聚合 Job 已註冊（Cron: 30 * * * *）');
    console.log('[Scheduler] ========== 調度器初始化完成 ==========');
}
/**
 * 停止所有調度任務
 *
 * 在服務器關閉時調用
 */
function stopScheduler() {
    console.log('[Scheduler] 停止所有調度任務...');
    for (const task of scheduledTasks) {
        task.stop();
    }
    scheduledTasks.length = 0;
    console.log('[Scheduler] 所有調度任務已停止');
}
/**
 * 手動觸發帳號刪除 Job（用於測試或管理後台）
 */
async function triggerDeletionJobManually() {
    console.log('[Scheduler] 手動觸發帳號刪除 Job');
    try {
        const result = await (0, accountDeletionJob_1.executeAccountDeletionJob)();
        return {
            success: true,
            result,
        };
    }
    catch (error) {
        return {
            success: false,
            error: error.message,
        };
    }
}
// ===== 導出 =====
exports.default = {
    initScheduler,
    stopScheduler,
    triggerDeletionJobManually,
};
//# sourceMappingURL=scheduler.js.map