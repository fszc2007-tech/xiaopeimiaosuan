/**
 * 深色主題配色
 * 
 * 設計原則：
 * - background: 接近純黑但不純黑（避免 OLED 過黑造成眩光差異）
 * - surface/card: 比 background 亮一級，用於卡片底
 * - textPrimary: 接近白但非純白
 * - textSecondary: 降低亮度 20-30%
 * - border/divider: 在 dark 下要比 light 更"弱"
 * - primary: 品牌綠保持，但可能需要微調對比度
 * - shadow: dark 下陰影更克制
 */

import { ColorTokens } from './colorTokens';

export const darkColors: ColorTokens = {
  // ===== 背景層級 =====
  background: '#1a1a1a',         // 接近純黑但不純黑
  surface: '#2d2d2d',            // 比 background 亮一級
  card: '#2d2d2d',              // 卡片底色

  // ===== 文字層級 =====
  textPrimary: '#f5f5f5',        // 接近白但非純白
  textSecondary: '#9ca3af',     // 降低亮度 20-30%
  textTertiary: '#6b7280',      // 三級文字

  // ===== 邊框與分隔 =====
  border: '#404040',             // 在 dark 下要比 light 更"弱"
  divider: '#404040',           // 分隔線

  // ===== 品牌主色 =====
  primary: '#52b788',            // 品牌綠保持
  primaryPressed: '#6bc89a',     // 按下態（變淺，提高可見性）
  primaryLight: '#2d6a4f',       // 淺主色（在深色下變深）
  primaryTextOnPrimary: '#ffffff', // 主色上的文字（白色，確保可讀）

  // ===== 品牌輔助色 =====
  brandGreen: '#52b788',         // 主綠色（兼容舊代碼）
  brandBlue: '#7aa3a8',          // 晚波藍（提高亮度）
  brandOrange: '#fb8a5a',        // 莓鶯紅（提高亮度）
  brandBluePressed: '#5f8489',   // 藍色按下態

  // ===== 柔色背景（深色版本）=====
  greenSoftBg: '#1e3a2e',        // 深綠底
  blueSoftBg: '#1e2d31',         // 深藍底
  orangeSoftBg: '#3d2a1e',       // 深橘底
  redSoftBg: '#3d1e1e',          // 深紅底

  // ===== 狀態色 =====
  success: '#4ade80',            // 成功（提高亮度）
  error: '#f87171',              // 錯誤（微調）
  warning: '#fcd34d',            // 警告（提高亮度）
  info: '#7aa3a8',               // 信息（提高亮度）
  danger: '#f87171',             // 危險（等同 error）

  // ===== 互動態 =====
  disabledBg: '#2d2d2d',         // 禁用背景
  disabledText: '#6b7280',       // 禁用文字

  // ===== Pro 相關 =====
  yellowPro: '#fcd34d',          // Pro 標識顏色（提高亮度）
  brandRed: '#f87171',           // 紅色品牌色

  // ===== 陰影 =====
  shadow: 'rgba(0, 0, 0, 0.3)',  // dark 下陰影更克制

  // ===== 兼容舊代碼 =====
  ink: '#f5f5f5',                // 等同 textPrimary
  bg: '#1a1a1a',                 // 等同 background
  cardBg: '#2d2d2d',             // 等同 card
};

// 默認導出
export default darkColors;

