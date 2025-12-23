/**
 * 淺色主題配色
 * 
 * 語義 Token 設計：
 * - 所有顏色按語義分組
 * - light 和 dark 必須完整覆蓋
 * - 品牌主色保持不變，確保品牌一致性
 */

import { ColorTokens } from './colorTokens';

export const lightColors: ColorTokens = {
  // ===== 背景層級 =====
  background: '#f5f5f5',        // 頁面底色
  surface: '#ffffff',            // 表面（卡片、輸入框等）
  card: '#ffffff',              // 卡片底色

  // ===== 文字層級 =====
  textPrimary: '#32343a',       // 主文字（標題、正文）
  textSecondary: '#6b7280',     // 次文字（說明、placeholder）
  textTertiary: '#9ca3af',      // 三級文字（輔助信息）

  // ===== 邊框與分隔 =====
  border: '#e5e7eb',            // 邊框、分割線
  divider: '#e5e7eb',           // 分隔線

  // ===== 品牌主色 =====
  primary: '#52b788',           // 主綠色（品牌色）
  primaryPressed: '#2d6a4f',    // 按下態
  primaryLight: '#95d5b2',      // 淺主色：輕提示、次要按鈕
  primaryTextOnPrimary: '#ffffff', // 主色上的文字（白色）

  // ===== 品牌輔助色 =====
  brandGreen: '#52b788',        // 主綠色（兼容舊代碼）
  brandBlue: '#648e93',         // 晚波藍：次要操作、信息展示
  brandOrange: '#f9723d',       // 莓鶯紅：數據、高亮文字、警示
  brandBluePressed: '#50747a',  // 藍色按下態

  // ===== 柔色背景（Tag / Icon / 提示用）=====
  greenSoftBg: '#d8f3dc',       // 淺綠底，輕提示、示例 chip
  blueSoftBg: '#e5edf0',        // 淺藍底
  orangeSoftBg: '#fff2e9',      // 淺橘底，警示/提醒
  redSoftBg: '#fee2e2',         // 淺紅底（危險操作）

  // ===== 狀態色 =====
  success: '#40916c',           // 成功：深綠
  error: '#f97373',             // 錯誤：紅色
  warning: '#fbbf24',           // 警告：黃色
  info: '#648e93',              // 信息：藍綠
  danger: '#f97373',            // 危險（等同 error）

  // ===== 互動態 =====
  disabledBg: '#f3f4f6',        // 禁用背景
  disabledText: '#9ca3af',      // 禁用文字

  // ===== Pro 相關 =====
  yellowPro: '#fbbf24',         // Pro 標識顏色
  brandRed: '#ef4444',          // 紅色品牌色

  // ===== 陰影 =====
  shadow: 'rgba(0, 0, 0, 0.1)', // 淺色下正常陰影

  // ===== 兼容舊代碼 =====
  ink: '#32343a',               // 等同 textPrimary
  bg: '#f5f5f5',                // 等同 background
  cardBg: '#ffffff',            // 等同 card
};

// 默認導出（兼容舊用法）
export default lightColors;

