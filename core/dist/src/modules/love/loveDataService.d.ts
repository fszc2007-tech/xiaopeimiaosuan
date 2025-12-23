/**
 * 恋爱数据服务
 *
 * 统一管理恋爱相关的数据查询和上下文构建
 */
import { LoveChatContext } from '../../types/love';
/**
 * 为指定命盘构建恋爱聊天上下文
 *
 * @param params 参数对象
 * @param params.chartProfileId 命盘ID
 * @param params.userQuestion 用户问题
 * @param params.now 当前时间（可选，用于测试）
 * @returns LoveChatContext
 */
export declare function buildLoveChatContextForChart(params: {
    chartProfileId: string;
    userQuestion: string;
    now?: Date;
}): Promise<LoveChatContext>;
//# sourceMappingURL=loveDataService.d.ts.map