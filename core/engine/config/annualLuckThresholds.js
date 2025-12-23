/**
 * 流年评分与标签阈值配置
 * 
 * 用途：
 * - 集中管理所有阈值，方便调参
 * - 支持 A/B 测试
 * - 避免硬编码
 */

export const ANNUAL_LUCK_THRESHOLDS = {
  // favourLevel 阈值（基于 overall 分数）
  favourLevel: {
    good: 30,        // ≥ 30 → 'good'
    mixedUpper: 10,  // ≥ 10 → 'mixed'
    mixedLower: -10, // ≤ -10 → 'mixed'
    bad: -30,        // ≤ -30 → 'bad'
    // 其他情况 → 'neutral'
  },
  
  // highlightTag 阈值（基于 overall 分数）
  highlightTag: {
    opportunity: 25,  // ≥ 25 且 isFavour → 'opportunity'（降低阈值，让更多好年份显示）
    smooth: 10,       // ≥ 10 且 isFavour → 'smooth'（降低阈值）
    stress: -40,      // ≤ -40 → 'stress'（但会被语气保护层拦截）
    trial: -15,       // ≤ -15 → 'trial'（降低阈值，让更多差年份显示）
    // 其他情况（-15 ~ 10）→ 'adjust'
  },
  
  // 阶段修正系数（与行运节奏联动）
  stageFactor: {
    '打基础期': 0.9,      // 打基础期：标签偏温和
    '拓展冲刺期': 1.1,   // 冲刺期：高分更容易给到 'opportunity'
    '调整转折期': 1.0,   // 调整期：不修正
    '沉淀收获期': 1.0,   // 收获期：不修正
  },
  
  // 语气保护层（防止极端标签）
  toneProtection: {
    // 即使分数很低，也不输出 'stress'，统一用 'trial' 或 'adjust'
    maxNegativeTag: 'trial',  // 最负面的标签只能是 'trial'
    minPositiveTag: 'adjust', // 最正面的标签至少是 'adjust'
  },
};

