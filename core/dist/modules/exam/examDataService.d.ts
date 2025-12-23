/**
 * 考试数据服务
 *
 * 统一管理考试相关的数据查询和上下文构建
 */
import { ExamChatContext } from '../../types/exam';
/**
 * 为指定命盘构建考试聊天上下文
 *
 * @param params 参数对象
 * @param params.chartProfileId 命盘ID
 * @param params.userQuestion 用户问题
 * @param params.now 当前时间（可选，用于测试）
 * @returns ExamChatContext
 */
export declare function buildExamChatContextForChart(params: {
    chartProfileId: string;
    userQuestion: string;
    now?: Date;
}): Promise<ExamChatContext>;
//# sourceMappingURL=examDataService.d.ts.map