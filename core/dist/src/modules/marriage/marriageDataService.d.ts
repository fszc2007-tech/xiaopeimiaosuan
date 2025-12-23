/**
 * 婚姻数据服务
 *
 * 统一管理婚姻相关的数据查询和上下文构建
 */
import { MarriageChatContext } from '../../types/marriage';
/**
 * 为指定命盘构建婚姻聊天上下文
 *
 * @param params 参数对象
 * @param params.chartProfileId 命盘ID
 * @param params.userQuestion 用户问题
 * @param params.now 当前时间（可选，用于测试）
 * @returns MarriageChatContext
 */
export declare function buildMarriageChatContextForChart(params: {
    chartProfileId: string;
    userQuestion: string;
    now?: Date;
}): Promise<MarriageChatContext>;
//# sourceMappingURL=marriageDataService.d.ts.map