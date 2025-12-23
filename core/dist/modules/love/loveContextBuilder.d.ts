/**
 * 恋爱聊天上下文构建器
 *
 * 从命盘结果中提取并构建 LoveChatContext
 * 尽可能复用系统已有的计算和数据
 */
import { LoveChatContext } from '../../types/love';
/**
 * 从命盘结果中构建 LoveChatContext
 *
 * @param params 参数对象
 * @param params.chartResult 命盘分析结果（来自 engine）
 * @param params.gender 性别（从 chart_profiles 表获取）
 * @param params.userQuestion 用户问题（用于判断 partnerMentioned）
 * @param params.now 当前时间（用于计算当前年份，可选）
 * @returns LoveChatContext
 */
export declare function buildLoveChatContext(params: {
    chartResult: any;
    gender: 'male' | 'female' | 'unknown';
    userQuestion?: string;
    now?: Date;
}): Promise<LoveChatContext>;
//# sourceMappingURL=loveContextBuilder.d.ts.map