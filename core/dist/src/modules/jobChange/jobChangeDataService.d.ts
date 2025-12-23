/**
 * 工作跳槽数据服务
 *
 * 统一管理工作跳槽相关的数据查询和上下文构建
 */
import { JobChangeChatContext } from '../../types/jobChange';
/**
 * 为指定命盘构建工作跳槽聊天上下文
 *
 * @param params 参数对象
 * @param params.chartProfileId 命盘ID
 * @param params.userQuestion 用户问题
 * @param params.now 当前时间（可选，用于测试）
 * @returns JobChangeChatContext
 */
export declare function buildJobChangeChatContextForChart(params: {
    chartProfileId: string;
    userQuestion: string;
    now?: Date;
}): Promise<JobChangeChatContext>;
//# sourceMappingURL=jobChangeDataService.d.ts.map