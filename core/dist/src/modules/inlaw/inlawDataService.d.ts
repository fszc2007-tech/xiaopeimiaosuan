/**
 * 婆媳关系数据服务
 *
 * 统一管理婆媳关系相关的数据查询和上下文构建
 */
import { InLawChatContext } from '../../types/inlaw';
/**
 * 为指定命盘构建婆媳关系聊天上下文
 *
 * @param params 参数对象
 * @param params.chartProfileId 命盘ID
 * @param params.userQuestion 用户问题
 * @param params.now 当前时间（可选，用于测试）
 * @returns InLawChatContext
 */
export declare function buildInLawChatContextForChart(params: {
    chartProfileId: string;
    userQuestion: string;
    now?: Date;
}): Promise<InLawChatContext>;
//# sourceMappingURL=inlawDataService.d.ts.map