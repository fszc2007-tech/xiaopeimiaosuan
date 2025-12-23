/**
 * LLM Usage 日统计聚合任务
 *
 * 功能：
 * 1. 每天 0:05 执行：聚合昨天的数据到 llm_usage_daily
 * 2. 每小时执行：补聚合当天数据（避免延迟）
 *
 * 遵循文档：
 * - Admin-LLM计费统计实施方案.md
 */
/**
 * 聚合指定日期的数据
 */
export declare function aggregateDailyUsage(targetDate: Date): Promise<void>;
/**
 * 聚合昨天的数据（每天 0:05 执行）
 */
export declare function aggregateYesterday(): Promise<void>;
/**
 * 聚合今天的数据（每小时执行）
 */
export declare function aggregateToday(): Promise<void>;
//# sourceMappingURL=aggregateDailyUsage.d.ts.map