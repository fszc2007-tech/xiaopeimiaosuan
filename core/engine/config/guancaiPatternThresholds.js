/**
 * 官財格局稳定度判断阈值配置
 * 
 * Phase 1：定义但不使用（阈值写死在 buildGuancaiPattern 函数内）
 * Phase 2：从配置文件读取
 */

export const STABILITY_THRESHOLDS = {
  // 混乱度阈值（0-1）
  chaos: {
    stable: 0.2,        // < 0.2 → 穩定
    fairlyStable: 0.4,  // < 0.4 → 偏穩
    unstable: 0.7       // < 0.7 → 多變，否则 → 多波折/周期波動
  },
  
  // 破格数量阈值
  pogeCount: {
    officerMax: 3,      // 官杀相关破格数量上限（用于计算惩罚）
    wealthMax: 3        // 财星相关破格数量上限
  },
  
  // 强度等级阈值（0-100）
  strength: {
    veryStrong: 80,     // ≥ 80 → 很強
    strong: 65,         // ≥ 65 → 較強
    medium: 50          // ≥ 50 → 中等，否则 → 偏弱
  },
  
  // 根气强度阈值（0-1）
  rooting: {
    strong: 0.6,       // ≥ 0.6 → 有根
    partial: 0.3       // ≥ 0.3 → 部分有根，否则 → 無根
  }
};





