/**
 * 投资理财数据服务
 *
 * 统一管理投资理财相关的数据查询和上下文构建
 */
import { InvestChatContext } from '../../types/invest';
/**
 * 为指定命盘构建投资理财聊天上下文
 *
 * @param params 参数对象
 * @param params.chartProfileId 命盘ID
 * @param params.userQuestion 用户问题
 * @param params.now 当前时间（可选，用于测试）
 * @returns InvestChatContext
 */
export declare function buildInvestChatContextForChart(params: {
    chartProfileId: string;
    userQuestion: string;
    now?: Date;
}): Promise<InvestChatContext>;
//# sourceMappingURL=investDataService.d.ts.map