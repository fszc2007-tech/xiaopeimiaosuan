/**
 * 公共类型定义
 * 
 * 用于各专线（LoveChatContext、JobChangeChatContext、InvestChatContext 等）共享的类型
 */

/**
 * 十神权重聚合类型（各专线共用）
 * 
 * 用于 LoveChatContext、JobChangeChatContext、InvestChatContext 等
 */
export interface TenGodWeightsAgg {
  guan: number;      // 官（聚合 zGuan + sha）
  cai: number;       // 财
  shishang: number;   // 食伤（聚合 shi + shang）
  bijie: number;     // 比劫（聚合 bi + jie）
  yin: number;       // 印（聚合 zYin + pYin）
}

/**
 * 五行分布类型（各专线共用）
 * 
 * 直接对应 engine 的 wuxingPercent，保持 key 为中文
 */
export interface WuXingPercent {
  木: number;
  火: number;
  土: number;
  金: number;
  水: number;
}





