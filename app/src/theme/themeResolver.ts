/**
 * 主題解析器
 * 
 * 職責：
 * - 解析 themeMode → resolvedTheme
 * - 管理系統外觀監聽
 * 
 * 設計原則：
 * - 全局只做一次解析，所有 UI 都只依 resolvedTheme 拿 token
 * - 純函數 + 訂閱管理
 */

import { Appearance } from 'react-native';

// 主題模式類型
export type ThemeMode = 'system' | 'light' | 'dark';

// 實際生效的主題類型
export type ResolvedTheme = 'light' | 'dark';

/**
 * 解析主題（純函數）
 * @param themeMode 用戶選擇的主題模式
 * @returns 實際生效的主題
 */
export function getResolvedTheme(themeMode: ThemeMode): ResolvedTheme {
  if (themeMode !== 'system') {
    return themeMode;
  }
  
  // system 模式下，從 OS 獲取
  const systemColorScheme = Appearance.getColorScheme();
  return systemColorScheme ?? 'light';  // null 時回退到 light
}

/**
 * 獲取當前系統外觀
 * @returns 系統外觀 'light' | 'dark'
 */
export function getSystemColorScheme(): ResolvedTheme {
  const colorScheme = Appearance.getColorScheme();
  return colorScheme ?? 'light';
}

// 訂閱管理
let appearanceSubscription: { remove: () => void } | null = null;

/**
 * 訂閱系統外觀變化
 * @param callback 外觀變化時的回調
 * @returns 取消訂閱的函數
 */
export function subscribeAppearanceChanges(
  callback: (colorScheme: ResolvedTheme) => void
): () => void {
  // 取消舊訂閱
  if (appearanceSubscription) {
    appearanceSubscription.remove();
    appearanceSubscription = null;
  }
  
  // 創建新訂閱
  appearanceSubscription = Appearance.addChangeListener(({ colorScheme }) => {
    const resolved: ResolvedTheme = colorScheme ?? 'light';
    callback(resolved);
  });
  
  // 返回取消訂閱的函數
  return () => {
    if (appearanceSubscription) {
      appearanceSubscription.remove();
      appearanceSubscription = null;
    }
  };
}

/**
 * 取消系統外觀訂閱
 */
export function unsubscribeAppearanceChanges(): void {
  if (appearanceSubscription) {
    appearanceSubscription.remove();
    appearanceSubscription = null;
  }
}

