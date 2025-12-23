/**
 * 小佩場景 Topic 配置表（單一真相源）
 * 
 * 硬約定：
 * - 所有 topic 配置必須在此統一管理
 * - 默認問題必須從此配置表獲取，不允許手寫
 * - 舊 key → 新枚舉映射為硬約定，不允許隨意修改
 */

import { Sparkles, HeartHandshake, BriefcaseBusiness, Wallet, Home as HomeIcon, GraduationCap } from 'lucide-react-native';

// 前端內部使用的 key（保持現有代碼兼容）
export type TopicKey = 'peach' | 'marriage' | 'career' | 'wealth' | 'family' | 'rhythm';

// 後端枚舉值（英文）
export type TopicEnum = 'LOVE' | 'EXAM' | 'MARRIAGE' | 'JOB' | 'FAMILY' | 'WEALTH';

export interface TopicMeta {
  enum: TopicEnum;
  title: string;
  subtitleTags: string[];
  defaultQuestion: string;
  icon: React.ComponentType<{ color: string; size: number }>;
}

/**
 * 舊 key → 新枚舉對應表（硬約定）
 * 
 * | 舊 key（當前代碼裡的） | 新枚舉（發給後端） | 中文標題 |
 * |---------------------|-----------------|---------|
 * | `peach`             | `LOVE`          | 戀愛·桃花 |
 * | `rhythm`            | `EXAM`          | 考研·考公 |
 * | `marriage`          | `MARRIAGE`      | 結婚·婚姻 |
 * | `career`            | `JOB`           | 工作·跳槽 |
 * | `family`           | `FAMILY`        | 婆媳·關係 |
 * | `wealth`            | `WEALTH`        | 投資·理財 |
 */
export const TOPIC_META: Record<TopicKey, TopicMeta> = {
  peach: {
    enum: 'LOVE',
    title: '戀愛·桃花',
    subtitleTags: ['心動', '曖昧', '冷戰'],
    defaultQuestion: '基於當前命盤，幫我解讀一下最近的戀愛桃花和感情運勢。',
    icon: Sparkles,
  },
  rhythm: {
    enum: 'EXAM',
    title: '考研·考公',
    subtitleTags: ['擇校', '備考', '上岸'],
    defaultQuestion: '基於當前命盤，幫我看看考研/考公相關的整體學業和考試運勢。',
    icon: GraduationCap,
  },
  marriage: {
    enum: 'MARRIAGE',
    title: '結婚·婚姻',
    subtitleTags: ['婚期', '彩禮', '矛盾'],
    defaultQuestion: '基於當前命盤，幫我看看婚姻相關的運勢，比如結婚節奏、婚姻穩定度。',
    icon: HeartHandshake,
  },
  career: {
    enum: 'JOB',
    title: '工作·跳槽',
    subtitleTags: ['漲薪', '離職', '方向'],
    defaultQuestion: '基於當前命盤，幫我看看工作和跳槽方面的運勢與機會。',
    icon: BriefcaseBusiness,
  },
  family: {
    enum: 'FAMILY',
    title: '婆媳·關係',
    subtitleTags: ['帶娃', '矛盾', '同住'],
    defaultQuestion: '基於當前命盤，幫我看看與長輩/婆媳關係的相處和矛盾情況。',
    icon: HomeIcon,
  },
  wealth: {
    enum: 'WEALTH',
    title: '投資·理財',
    subtitleTags: ['股票', '基金', '買房'],
    defaultQuestion: '基於當前命盤，幫我看看近期的財富、投資和理財運勢。',
    icon: Wallet,
  },
};

/**
 * 工具函數：根據 key 獲取枚舉值
 */
export const getTopicEnum = (key: TopicKey): TopicEnum => {
  return TOPIC_META[key].enum;
};

/**
 * 工具函數：根據枚舉值獲取 key
 */
export const getTopicKey = (enumValue: TopicEnum): TopicKey | null => {
  const entry = Object.entries(TOPIC_META).find(([_, meta]) => meta.enum === enumValue);
  return entry ? (entry[0] as TopicKey) : null;
};

/**
 * 根據 key 生成 TOPICS 數組（用於 XiaoPeiHomeScreen）
 */
export const getTopicsArray = () => {
  return Object.entries(TOPIC_META).map(([key, meta]) => ({
    key: key as TopicKey,
    label: meta.title,
    desc: meta.subtitleTags.join('、'),
    icon: meta.icon,
    defaultQuestion: meta.defaultQuestion,
  }));
};

