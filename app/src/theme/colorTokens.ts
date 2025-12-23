/**
 * 顏色 Token 類型定義
 * 
 * 語義 Token 結構：
 * - light 和 dark 都必須完整覆蓋
 * - 確保類型安全
 */

export interface ColorTokens {
  // ===== 背景層級 =====
  background: string;      // 頁面底色
  surface: string;         // 表面（卡片、輸入框等）
  card: string;           // 卡片底色（可與 surface 相同）

  // ===== 文字層級 =====
  textPrimary: string;     // 主文字（標題、正文）
  textSecondary: string;   // 次文字（說明、placeholder）
  textTertiary: string;   // 三級文字（輔助信息）

  // ===== 邊框與分隔 =====
  border: string;         // 邊框、分割線
  divider: string;        // 分隔線（可與 border 相同）

  // ===== 品牌主色 =====
  primary: string;        // 主綠色（品牌色，保持不變）
  primaryPressed: string; // 按下態
  primaryLight: string;   // 淺主色：輕提示、次要按鈕
  primaryTextOnPrimary: string; // 主色上的文字（通常是白色，確保可讀）

  // ===== 品牌輔助色 =====
  brandGreen: string;      // 主綠色（兼容舊代碼）
  brandBlue: string;       // 晚波藍：次要操作、信息展示
  brandOrange: string;     // 莓鶯紅：數據、高亮文字、警示
  brandBluePressed: string; // 藍色按下態

  // ===== 柔色背景（Tag / Icon / 提示用）=====
  greenSoftBg: string;     // 淺綠底，輕提示、示例 chip
  blueSoftBg: string;      // 淺藍底
  orangeSoftBg: string;    // 淺橘底，警示/提醒
  redSoftBg: string;       // 淺紅底（危險操作）

  // ===== 狀態色 =====
  success: string;         // 成功
  error: string;           // 錯誤
  warning: string;         // 警告
  info: string;           // 信息
  danger: string;         // 危險（等同 error）

  // ===== 互動態 =====
  disabledBg: string;      // 禁用背景
  disabledText: string;    // 禁用文字

  // ===== Pro 相關 =====
  yellowPro: string;       // Pro 標識顏色
  brandRed: string;        // 紅色品牌色

  // ===== 陰影 =====
  shadow: string;          // 陰影（dark 下更克制）

  // ===== 兼容舊代碼 =====
  ink: string;             // 等同 textPrimary
  bg: string;              // 等同 background
  cardBg: string;          // 等同 card
}

// 導出類型
export type ColorKey = keyof ColorTokens;

