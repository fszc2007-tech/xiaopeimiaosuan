// src/theme/typography.ts

/**
 * 字体配置规范
 * 
 * iOS: 系统默认 San Francisco + 苹方 (PingFang SC)
 * Android: 系统默认 Roboto + 思源黑体
 * 
 * React Native 会自动选择系统字体，无需特别指定
 */

/**
 * 字号规范
 * 
 * 用途说明：
 * - xxs (10): Tab栏/底部导航文字
 * - xs (12): 次要说明/辅助文字、小标签、时间
 * - sm (14): 正文（主要阅读内容）、小按钮
 * - base (16): 正文舒适阅读、主按钮
 * - lg (18): 模块标题/卡片标题
 * - xl (20): 大标题/页面标题
 * - 2xl (22): 页面主标题、Banner标题
 * - 3xl (24): 特大标题
 */
export const fontSizes = {
  xxs: 10,   // Tab栏/导航栏
  xs: 12,    // 次要说明/辅助文字
  sm: 14,    // 正文、小按钮
  base: 16,  // 正文舒适阅读、主按钮
  lg: 18,    // 模块标题/卡片标题
  xl: 20,    // 大标题/页面标题
  '2xl': 22, // 页面主标题、Banner
  '3xl': 24, // 特大标题
};

/**
 * 字重规范
 * 
 * - regular (400): 正文、常规文字
 * - medium (500): 需要稍微突出的文字
 * - semibold (600): 标题、按钮、重要信息
 * - bold (700): 特别重要的标题
 */
export const fontWeights = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

/**
 * 行高规范
 * 
 * 计算方式：字号 * 行高倍数
 * 
 * - tight (1.2): 紧凑，用于标题
 * - normal (1.5): 正常，用于正文（14号字 → 21，16号字 → 24）
 * - relaxed (1.75): 舒适，用于长文阅读
 * 
 * 实际应用建议：
 * - 标题: 字号 * 1.2 ~ 1.3
 * - 正文 14: 行高 20-22
 * - 正文 16: 行高 22-24
 */
export const lineHeights = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
};

/**
 * 系统字体（默认）
 * 
 * React Native 默认使用系统字体：
 * - iOS: San Francisco (英文) + PingFang SC (中文)
 * - Android: Roboto (英文) + Noto Sans CJK (中文)
 * 
 * 无需特别指定 fontFamily，让系统自动选择最佳字体
 */
