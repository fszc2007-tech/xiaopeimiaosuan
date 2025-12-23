/**
 * 工作跳槽聊天上下文构建器
 *
 * 从命盘结果中提取并构建 JobChangeChatContext
 * 尽可能复用系统已有的计算和数据
 */
import { JobChangeChatContext } from '../../types/jobChange';
/**
 * 从命盘结果中构建 JobChangeChatContext
 *
 * @param params 参数对象
 * @param params.chartResult 命盘分析结果（来自 engine）
 * @param params.gender 性别（从 chart_profiles 表获取）
 * @param params.userQuestion 用户问题（用于提取计划）
 * @param params.now 当前时间（用于计算当前年份，可选）
 * @returns JobChangeChatContext
 */
export declare function buildJobChangeChatContext(params: {
    chartResult: any;
    gender: 'male' | 'female' | 'unknown';
    userQuestion?: string;
    now?: Date;
}): Promise<JobChangeChatContext>;
//# sourceMappingURL=jobChangeContextBuilder.d.ts.map