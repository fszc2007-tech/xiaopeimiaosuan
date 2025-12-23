/**
 * 主題 Provider
 * 
 * 職責：
 * - 根容器背景色
 * - StatusBar style
 * - 提供主題相關的 Hook
 * 
 * 設計原則：
 * - 放在 App 根部
 * - 使用 Zustand store 管理狀態
 * - 提供 useTheme / useColors hook
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useUIStore, useResolvedTheme, useThemeMode } from '@/store/uiStore';
import { getColors } from './index';
import { ThemeMode, ResolvedTheme } from './themeResolver';
import { ColorTokens } from './colorTokens';

// ===== 類型定義 =====
interface ThemeContextValue {
  themeMode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  colors: ColorTokens;
  setThemeMode: (mode: ThemeMode) => void;
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

// ===== Provider 組件 =====
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const resolvedTheme = useResolvedTheme();
  const colors = getColors(resolvedTheme);
  
  // 初始化主題（設置系統外觀監聽）
  useEffect(() => {
    const initTheme = useUIStore.getState().initTheme;
    initTheme();
    
    // 清理：取消訂閱（在 reset 中處理）
    return () => {
      // 如果需要，可以在這裡取消訂閱
    };
  }, []);
  
  return (
    <>
      {/* StatusBar 根據主題設置 */}
      <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
      
      {/* 根容器背景色 */}
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {children}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

// ===== Hooks =====

/**
 * 獲取主題相關狀態和方法
 * 
 * @returns {Object} 主題上下文
 * - themeMode: 用戶選擇的主題模式
 * - resolvedTheme: 實際生效的主題
 * - colors: 當前主題的顏色 Token
 * - setThemeMode: 設置主題模式的方法
 * 
 * @example
 * const { colors, setThemeMode, themeMode } = useTheme();
 * // 切換到深色模式
 * setThemeMode('dark');
 * // 使用顏色
 * <View style={{ backgroundColor: colors.background }} />
 */
export const useTheme = (): ThemeContextValue => {
  const themeMode = useThemeMode();
  const resolvedTheme = useResolvedTheme();
  const setThemeMode = useUIStore((state) => state.setThemeMode);
  const colors = getColors(resolvedTheme);
  
  return {
    themeMode,
    resolvedTheme,
    colors,
    setThemeMode,
  };
};

/**
 * 僅獲取顏色 Token
 * 
 * @returns {ColorTokens} 當前主題的顏色 Token
 * 
 * @example
 * const colors = useColors();
 * <View style={{ backgroundColor: colors.card }} />
 */
export const useColors = (): ColorTokens => {
  const resolvedTheme = useResolvedTheme();
  return getColors(resolvedTheme);
};

// 默認導出
export default ThemeProvider;

