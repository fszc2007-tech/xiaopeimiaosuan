"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FOLLOWUP_SCENE_HINT = void 0;
exports.resolveFollowupScene = resolveFollowupScene;
/**
 * 场景提示词映射表
 *
 * 用于在追问 Prompt 中提供场景上下文，让 LLM 生成更贴合场景的追问
 */
exports.FOLLOWUP_SCENE_HINT = {
    // 场景卡片
    love: '优先围绕：心动对象、暧昧关系、桃花质量、烂桃花、是否适合发展、感情中的关键时间窗口。',
    exam: '优先围绕：适不适合考研考公、择校择岗、备考节奏、关键年份的上岸机会、压力管理与坚持策略。',
    marriage: '优先围绕：婚期窗口、早婚晚婚、婚姻稳定性、婚前沟通重点（彩礼、房子、观念差异）、婚后相处模式。',
    jobChange: '优先围绕：职业定位、跳槽窗口、涨薪机会、职场压力与人际风险点、适合的行业方向。',
    inlaw: '语气可生活化一点，优先围绕：是否适合同住、带娃观念、钱和家务分配、如何避免小事升级矛盾、边界感建立。',
    invest: '强调风险提示，仅作参考，优先围绕：财运节奏、理财风格、哪些年份不宜激进、大额投资与买房时机、风险控制。',
    // 命盘卡片
    'card-minggeSummary': '优先围绕：命局亮点、短板、整体人生节奏的关键问题、性格特质与人生方向。',
    'card-yongshenPattern': '优先围绕：用神方向、忌神风险、如何在生活中落地调整、五行补益的具体方法。',
    'card-guancaiPattern': '优先围绕：事业方向、赚钱模式、升迁与跳槽时机、职场人际关系处理。',
    'card-energyFlow': '优先围绕：五行流通卡点、状态好坏的触发条件与调整方式、能量转化的关键环节。',
    'card-palaceSixKin': '优先围绕：亲密关系、家人关系、特别是感情和家庭中的关键矛盾点、六亲助力与阻力。',
    'card-luckRhythm': '优先围绕：当前大运特征、近期几年是加速还是调整、关键转折点、行运节奏与人生阶段。',
    'card-shensha': '优先围绕：该神煞的具体影响、在命盘中的表现、如何发挥优势或规避不利。',
    'card-overview': '优先围绕：命盘整体特征、关键问题、需要重点关注的方向。',
    // 通用模式
    'chat-general': '从刚才解读中，提炼一个亮点、一个风险点、一个行动方向继续追问，保持与命盘相关但不过于专业术语化。',
};
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
function resolveFollowupScene(params) {
    // 优先判断神煞（因为神煞有专门的解读逻辑）
    if (params.shenShaCode) {
        return 'card-shensha';
    }
    // 判断场景卡片（topic 参数）
    // 注意：topic 必须是固定枚举值，不支持组合值（如 'love_exam'）
    if (params.topic) {
        const topicLower = params.topic.toLowerCase();
        switch (topicLower) {
            case 'love':
                return 'love';
            case 'exam':
                return 'exam';
            case 'marriage':
                return 'marriage';
            case 'job':
            case 'jobchange':
                return 'jobChange';
            case 'family':
            case 'inlaw':
                return 'inlaw';
            case 'invest':
            case 'wealth':
                return 'invest';
            // topic 存在但不匹配，走通用聊天兜底
            default:
                return 'chat-general';
        }
    }
    // 判断命盘卡片（sectionKey 参数）
    if (params.sectionKey) {
        switch (params.sectionKey) {
            case 'minggeSummary':
                return 'card-minggeSummary';
            case 'yongshenPattern':
                return 'card-yongshenPattern';
            case 'guancaiPattern':
                return 'card-guancaiPattern';
            case 'energyFlow':
                return 'card-energyFlow';
            case 'palaceSixKin':
                return 'card-palaceSixKin';
            case 'luckRhythm':
                return 'card-luckRhythm';
            // ⚠️ 新增 sectionKey 时，请在此处显式添加映射
            // 否则会走 'card-overview' 兜底，追问风格可能不够精准
            default:
                return 'card-overview';
        }
    }
    // 默认：通用聊天模式
    return 'chat-general';
}
//# sourceMappingURL=followupScenes.js.map