/**
 * 追问 Prompt 构建模块
 *
 * 负责：
 * - 构建追问生成的 Prompt
 * - 提供兜底追问模板
 */
import { FollowupScene } from './followupScenes';
/**
 * 追问问题类型
 */
export type FollowupType = 'curiosity' | 'warning' | 'action';
/**
 * 追问问题结构
 *
 * 注意：
 * - question 字段不应包含问号（前端会统一添加）
 * - 前端渲染按钮时会统一格式化为：`${question}？`
 */
export interface FollowupQuestion {
    type: FollowupType;
    question: string;
}
/**
 * 构建追问生成 Prompt
 *
 * @param params.scene - 追问场景（已解析好的 FollowupScene）
 * @param params.userQuestion - 用户本轮提问
 * @param params.readingText - AI 刚刚给出的完整解读文本
 * @param params.askedFollowups - 历史已问过的追问列表（用于去重，最多 10 条）
 * @returns 完整的追问生成 Prompt
 */
export declare function buildFollowupPrompt(params: {
    scene: FollowupScene;
    userQuestion: string;
    readingText: string;
    askedFollowups?: string[];
}): string;
/**
 * 获取兜底追问模板
 *
 * 当 LLM 生成失败或解析失败时使用
 *
 * @param scene - 追问场景
 * @returns 3 个兜底追问问题（curiosity / warning / action）
 */
export declare function buildFallbackFollowups(scene: FollowupScene): FollowupQuestion[];
//# sourceMappingURL=buildFollowupPrompt.d.ts.map