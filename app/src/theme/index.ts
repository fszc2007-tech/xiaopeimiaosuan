/**
 * 主題系統統一導出
 * 
 * 設計原則：
 * - 兼容舊代碼：保留 colors 導出
 * - 新代碼推薦使用 useTheme() / useColors()
 * - 逐步遷移現有代碼
 */

// ===== 類型導出 =====
export * from './colorTokens';
export * from './themeResolver';

// ===== 配色導出 =====
export { lightColors } from './colors.light';
export { darkColors } from './colors.dark';

// ===== 主題解析 =====
import { lightColors } from './colors.light';
import { darkColors } from './colors.dark';
import { ResolvedTheme } from './themeResolver';
import { ColorTokens } from './colorTokens';

/**
 * 根據 resolvedTheme 獲取顏色 Token
 * @param resolvedTheme 實際生效的主題
 * @returns 對應的顏色 Token
 */
export const getColors = (resolvedTheme: ResolvedTheme): ColorTokens => {
  return resolvedTheme === 'dark' ? darkColors : lightColors;
};

// ===== 兼容舊代碼 =====
/**
 * @deprecated 使用 useColors() 或 getColors(resolvedTheme) 代替
 * 
 * 為了兼容現有代碼，保留 colors 導出
 * 注意：這是一個靜態對象，不會響應主題切換
 * 如需響應主題切換，請使用 useColors() hook
 */
export const colors = lightColors;

// ===== Provider 和 Hook 導出 =====
export { ThemeProvider, useTheme, useColors } from './ThemeProvider';

// ===== 其他模塊導出 =====
export * from './typography';
export * from './layout';
