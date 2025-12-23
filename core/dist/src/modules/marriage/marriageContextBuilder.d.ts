/**
 * 婚姻聊天上下文构建器
 *
 * 从命盘结果中提取并构建 MarriageChatContext
 * 尽可能复用系统已有的计算和数据
 */
import { MarriageChatContext } from '../../types/marriage';
/**
 * 从命盘结果中构建 MarriageChatContext
 */
export declare function buildMarriageChatContext(params: {
    chartResult: any;
    gender: 'male' | 'female' | 'unknown';
    userQuestion?: string;
    now?: Date;
}): Promise<MarriageChatContext>;
//# sourceMappingURL=marriageContextBuilder.d.ts.map