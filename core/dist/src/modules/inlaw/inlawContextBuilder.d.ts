/**
 * 婆媳关系聊天上下文构建器
 *
 * 从命盘结果中提取并构建 InLawChatContext
 * 尽可能复用系统已有的计算和数据
 */
import { InLawChatContext } from '../../types/inlaw';
/**
 * 构建婆媳关系聊天上下文
 */
export declare function buildInLawChatContext(params: {
    chartResult: any;
    gender: 'male' | 'female' | 'unknown';
    userQuestion?: string;
    now?: Date;
}): Promise<InLawChatContext>;
//# sourceMappingURL=inlawContextBuilder.d.ts.map