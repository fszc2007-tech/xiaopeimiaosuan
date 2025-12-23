/**
 * 追问场景类型定义与映射
 *
 * 映射规则：
 * - topic 参数 → 场景卡片模式（6 个）
 * - sectionKey 参数 → 命盘卡片模式（6 个）
 * - 都不带 → 通用聊天模式
 *
 * 注意：
 * - topic 值来自前端，必须是固定枚举值（'love' | 'exam' | 'marriage' | 'job' | 'inlaw' | 'invest'），不支持组合值
 * - sectionKey 值来自前端，如果新增卡片类型，需要在此文件中显式添加映射，否则会走 'card-overview' 兜底
 */
/**
 * 追问场景类型
 */
export type FollowupScene = 'love' | 'exam' | 'marriage' | 'jobChange' | 'inlaw' | 'invest' | 'card-minggeSummary' | 'card-yongshenPattern' | 'card-guancaiPattern' | 'card-energyFlow' | 'card-palaceSixKin' | 'card-luckRhythm' | 'card-shensha' | 'card-overview' | 'chat-general';
/**
 * 场景提示词映射表
 *
 * 用于在追问 Prompt 中提供场景上下文，让 LLM 生成更贴合场景的追问
 */
export declare const FOLLOWUP_SCENE_HINT: Record<FollowupScene, string>;
/**
 * 解析追问场景
 *
 * @param params.topic - 场景卡片标识（来自前端，必须是固定枚举值，不支持组合）
 * @param params.sectionKey - 命盘卡片标识（来自前端，新增卡片类型需在此显式添加映射）
 * @param params.shenShaCode - 神煞代码（来自前端，可选）
 * @returns FollowupScene
 *
 * 注意：
 * - 如果 sectionKey 不在白名单中，会返回 'card-overview' 作为兜底场景
 * - 如果 topic 存在但不匹配任何已知场景，会返回 'chat-general' 作为兜底
 */
export declare function resolveFollowupScene(params: {
    topic?: string;
    sectionKey?: string;
    shenShaCode?: string;
}): FollowupScene;
//# sourceMappingURL=followupScenes.d.ts.map