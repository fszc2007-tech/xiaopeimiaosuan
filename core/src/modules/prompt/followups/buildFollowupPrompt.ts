/**
 * 追问 Prompt 构建模块
 * 
 * 负责：
 * - 构建追问生成的 Prompt
 * - 提供兜底追问模板
 */

import { FollowupScene, FOLLOWUP_SCENE_HINT } from './followupScenes';

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
  question: string;  // 10-18 字，口语化，不含问号
}

/**
 * 兜底追问模板（常量配置）
 * 
 * 当 LLM 生成失败或解析失败时使用
 * 按场景提供 3 个标准追问（curiosity / warning / action）
 */
const FALLBACK_FOLLOWUPS: Record<FollowupScene, FollowupQuestion[]> = {
  love: [
    { type: 'curiosity', question: '这个优势在感情中能持续多久' },
    { type: 'warning', question: '需要注意哪些感情风险信号' },
    { type: 'action', question: '什么时候适合主动推进关系' },
  ],
  exam: [
    { type: 'curiosity', question: '还有哪些备考优势没提到' },
    { type: 'warning', question: '备考时需要注意哪些压力点' },
    { type: 'action', question: '什么时候开始正式冲刺最合适' },
  ],
  marriage: [
    { type: 'curiosity', question: '婚姻中还有哪些潜在优势' },
    { type: 'warning', question: '婚前需要重点沟通哪些问题' },
    { type: 'action', question: '什么时候适合谈婚论嫁' },
  ],
  jobChange: [
    { type: 'curiosity', question: '还有哪些职业方向适合我' },
    { type: 'warning', question: '跳槽时需要注意哪些风险' },
    { type: 'action', question: '什么时候跳槽最有利' },
  ],
  inlaw: [
    { type: 'curiosity', question: '婆媳关系中还有哪些和谐点' },
    { type: 'warning', question: '哪些小事容易升级成矛盾' },
    { type: 'action', question: '如何建立更好的边界感' },
  ],
  invest: [
    { type: 'curiosity', question: '还有哪些理财机会没提到' },
    { type: 'warning', question: '哪些年份需要控制投资风险' },
    { type: 'action', question: '什么时候适合大额投资' },
  ],
  'card-minggeSummary': [
    { type: 'curiosity', question: '命局中还有哪些亮点没展开' },
    { type: 'warning', question: '需要特别注意哪些短板' },
    { type: 'action', question: '如何发挥命局优势' },
  ],
  'card-yongshenPattern': [
    { type: 'curiosity', question: '用神在哪些方面能带来助力' },
    { type: 'warning', question: '忌神过多时需要注意什么' },
    { type: 'action', question: '如何在生活中补益用神' },
  ],
  'card-guancaiPattern': [
    { type: 'curiosity', question: '事业中还有哪些机会点' },
    { type: 'warning', question: '赚钱时需要注意哪些风险' },
    { type: 'action', question: '什么时候适合主动争取机会' },
  ],
  'card-energyFlow': [
    { type: 'curiosity', question: '能量流通顺畅时会有哪些表现' },
    { type: 'warning', question: '哪些情况容易导致能量卡住' },
    { type: 'action', question: '如何调整让能量更顺畅' },
  ],
  'card-palaceSixKin': [
    { type: 'curiosity', question: '六亲关系中还有哪些助力' },
    { type: 'warning', question: '哪些关系容易产生矛盾' },
    { type: 'action', question: '如何改善关键关系' },
  ],
  'card-luckRhythm': [
    { type: 'curiosity', question: '当前大运还有哪些机会没提到' },
    { type: 'warning', question: '近期需要注意哪些转折点' },
    { type: 'action', question: '这个阶段最适合做什么' },
  ],
  'card-shensha': [
    { type: 'curiosity', question: '这个神煞还能带来哪些影响' },
    { type: 'warning', question: '需要注意哪些不利表现' },
    { type: 'action', question: '如何发挥这个神煞的优势' },
  ],
  'card-overview': [
    { type: 'curiosity', question: '命盘中还有哪些关键点没展开' },
    { type: 'warning', question: '需要特别注意哪些问题' },
    { type: 'action', question: '如何更好地把握人生方向' },
  ],
  'chat-general': [
    { type: 'curiosity', question: '刚才提到的优势还能延伸哪些' },
    { type: 'warning', question: '需要注意哪些潜在风险' },
    { type: 'action', question: '具体应该怎么操作' },
  ],
};

/**
 * 构建追问生成 Prompt
 * 
 * @param params.scene - 追问场景（已解析好的 FollowupScene）
 * @param params.userQuestion - 用户本轮提问
 * @param params.readingText - AI 刚刚给出的完整解读文本
 * @param params.askedFollowups - 历史已问过的追问列表（用于去重，最多 10 条）
 * @returns 完整的追问生成 Prompt
 */
export function buildFollowupPrompt(params: {
  scene: FollowupScene;
  userQuestion: string;
  readingText: string;
  askedFollowups?: string[];
}): string {
  const { scene, userQuestion, readingText, askedFollowups = [] } = params;
  
  const sceneHint = FOLLOWUP_SCENE_HINT[scene] || FOLLOWUP_SCENE_HINT['chat-general'];
  
  // 历史追问只取最近 10 条，避免 Prompt 过长占用 token
  const recentAskedFollowups = askedFollowups.slice(0, 10);
  
  return `你是「小佩」，一位做八字命理解读的 AI 助手。

【当前追问场景】
${scene}

场景说明：${sceneHint}

【用户本轮提问】
${userQuestion}

【你刚刚给出的完整解读】
${readingText}

【历史已经给过或用户点过的追问问题】（仅显示最近 10 条，用于避免重复）
${recentAskedFollowups.length > 0 ? JSON.stringify(recentAskedFollowups, null, 2) : '无（这是第一次生成追问）'}

现在请你根据【本轮解读的内容】，生成 3 个「可点击追问按钮」，让用户继续深挖这个主题。

必须严格满足：

1. **三个问题分别对应**：
   - **"curiosity"**：根据优点、潜力、机会，让用户好奇"我还能更好么？"、"这个优势能持续多久？"、"还有哪些机会没被提到？"
   - **"warning"**：根据隐患、冲突、起伏期，制造一点点紧张感，但不要吓人。例如"这个风险什么时候最容易出现？"、"需要注意哪些信号？"
   - **"action"**：根据已经给出的建议或方向，引导"具体怎么做、什么时候做"。例如"这个建议从什么时候开始执行？"、"第一步应该做什么？"

2. **每个问题 10–18 个字**，口语化，像按钮标题，**不要用问号结尾**（前端会统一添加问号）。

3. **必须和上面的解读内容强相关**，优先抓住你解读中"点了一下但没展开"的部分，或者用户可能关心的延伸点。

4. **尽量引用解读中的关键词**（某个阶段、某种关系、某个年份、某个五行、某个格局特征等），让追问看起来是"针对刚才解读的深度挖掘"。

5. **如果某个候选问题和历史 askedFollowups 很相似**，请换一个新的角度或焦点，不要重复。例如历史问过"什么时候适合跳槽？"，这次可以问"跳槽时需要注意什么？"或"哪些行业更适合我？"。

6. **不要出现空洞问题**，例如：
   - ❌ "还有什么想问的？"
   - ❌ "要不要继续聊聊？"
   - ❌ "你觉得呢？"
   - ✅ "这个优势在流年会有变化吗？"
   - ✅ "如果遇到这个风险该怎么应对？"
   - ✅ "这个建议从什么时候开始执行？"

7. **只输出 JSON**，不要多余解释、不要 Markdown 代码块标记、不要其他文字。

输出格式（严格 JSON，不要任何其他内容）：

{
  "followups": [
    { "type": "curiosity", "question": "..." },
    { "type": "warning", "question": "..." },
    { "type": "action", "question": "..." }
  ]
}`;
}

/**
 * 获取兜底追问模板
 * 
 * 当 LLM 生成失败或解析失败时使用
 * 
 * @param scene - 追问场景
 * @returns 3 个兜底追问问题（curiosity / warning / action）
 */
export function buildFallbackFollowups(scene: FollowupScene): FollowupQuestion[] {
  return FALLBACK_FOLLOWUPS[scene] || FALLBACK_FOLLOWUPS['chat-general'];
}

