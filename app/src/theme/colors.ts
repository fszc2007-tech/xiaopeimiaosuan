/**
 * 顏色配置
 * 
 * @deprecated 此文件為兼容舊代碼保留
 * 新代碼請使用：
 * - import { useColors } from '@/theme' 獲取響應主題的顏色
 * - import { colors } from '@/theme' 獲取靜態顏色（不響應主題切換）
 * 
 * 此文件導出的 colors 等同於 lightColors，不會響應主題切換
 */

// 從 colors.light.ts 導入並重新導出
export { lightColors as colors } from './colors.light';

// 為了向後兼容，也導出解構後的顏色值
import { lightColors } from './colors.light';

// 兼容舊代碼：直接訪問顏色屬性
export const {
  ink,
  textSecondary,
  primary,
  primaryPressed,
  primaryLight,
  brandGreen,
  brandBlue,
  brandOrange,
  bg,
  cardBg,
  border,
  greenSoftBg,
  blueSoftBg,
  orangeSoftBg,
  success,
  error,
  warning,
  info,
  brandBluePressed,
  disabledBg,
  disabledText,
} = lightColors;
