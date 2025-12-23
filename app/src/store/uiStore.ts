/**
 * UI 狀態管理
 * 
 * 職責：
 * - 主題管理（themeMode / resolvedTheme）
 * - 語言管理
 * - 底部抽屜狀態
 * - 全局 UI 狀態
 * 
 * 遵循規範：
 * - Store 命名：useUIStore
 * - Action 命名：set/show/hide/toggle/reset
 * - 持久化：是（僅 themeMode 和 language）
 * 
 * 主題設計：
 * - themeMode: 用戶選擇（system/light/dark），持久化
 * - resolvedTheme: 實際生效（light/dark），不持久化，每次啟動推導
 * - hasHydrated: 用於避免首屏閃爍
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  ThemeMode, 
  ResolvedTheme, 
  getResolvedTheme, 
  subscribeAppearanceChanges,
  unsubscribeAppearanceChanges 
} from '@/theme/themeResolver';

// ===== 類型定義 =====
interface UIState {
  // ===== State =====
  themeMode: ThemeMode;           // 用戶選擇（持久化）
  resolvedTheme: ResolvedTheme;   // 實際生效（不持久化）
  hasHydrated: boolean;           // 避免閃爍
  language: 'zh-CN' | 'zh-HK';
  bottomSheetVisible: boolean;
  bottomSheetContent: 'filter' | 'menu' | null;
  
  // ===== Actions =====
  // 設置主題模式
  setThemeMode: (mode: ThemeMode) => void;
  
  // 同步 resolvedTheme（system 時響應 OS）
  syncResolvedTheme: () => void;
  
  // 初始化主題（App 啟動時調用）
  initTheme: () => void;
  
  // 設置 hydration 狀態（內部使用）
  _setHasHydrated: (hydrated: boolean) => void;
  
  // 設置語言
  setLanguage: (language: 'zh-CN' | 'zh-HK') => void;
  
  // 顯示底部抽屜
  showBottomSheet: (content: 'filter' | 'menu') => void;
  
  // 隱藏底部抽屜
  hideBottomSheet: () => void;
  
  // 重置狀態
  reset: () => void;
  
  // ===== 兼容舊代碼 =====
  // @deprecated 使用 setThemeMode 代替
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

// 初始狀態
const initialState = {
  themeMode: 'system' as ThemeMode,
  resolvedTheme: 'light' as ResolvedTheme,
  hasHydrated: false,
  language: 'zh-HK' as const, // 默認繁體中文（香港）
  bottomSheetVisible: false,
  bottomSheetContent: null as 'filter' | 'menu' | null,
  // 兼容舊代碼
  theme: 'light' as const,
};

// 訂閱取消函數
let unsubscribe: (() => void) | null = null;

/**
 * 設置系統外觀監聽
 * @param set Zustand set 函數
 * @param currentThemeMode 當前主題模式
 */
const setupAppearanceListener = (
  set: (state: Partial<UIState>) => void,
  currentThemeMode: ThemeMode
) => {
  // 取消舊訂閱
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
  
  // 只在 system 模式下訂閱
  if (currentThemeMode === 'system') {
    unsubscribe = subscribeAppearanceChanges((colorScheme) => {
      set({ resolvedTheme: colorScheme });
    });
  }
};

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      /**
       * 設置主題模式
       * - 更新 themeMode
       * - 重新計算 resolvedTheme
       * - 重新設置系統外觀監聽
       */
      setThemeMode: (mode: ThemeMode) => {
        const resolved = getResolvedTheme(mode);
        set({ 
          themeMode: mode, 
          resolvedTheme: resolved,
          // 兼容舊代碼
          theme: resolved,
        });
        
        // 重新設置系統外觀監聽
        setupAppearanceListener(set, mode);
      },
      
      /**
       * 同步 resolvedTheme
       * - 從當前 themeMode 推導 resolvedTheme
       * - 設置系統外觀監聽（如果是 system 模式）
       */
      syncResolvedTheme: () => {
        const { themeMode } = get();
        const resolved = getResolvedTheme(themeMode);
        set({ 
          resolvedTheme: resolved,
          // 兼容舊代碼
          theme: resolved,
        });
        
        // 設置系統外觀監聯
        setupAppearanceListener(set, themeMode);
      },
      
      /**
       * 初始化主題
       * - App 啟動時調用
       * - 計算初始 resolvedTheme
       * - 設置系統外觀監聽
       * - 標記 hydration 完成
       */
      initTheme: () => {
        const { themeMode } = get();
        const resolved = getResolvedTheme(themeMode);
        
        set({ 
          resolvedTheme: resolved,
          hasHydrated: true,
          // 兼容舊代碼
          theme: resolved,
        });
        
        // 設置系統外觀監聽
        setupAppearanceListener(set, themeMode);
      },
      
      /**
       * 設置 hydration 狀態（內部使用）
       */
      _setHasHydrated: (hydrated: boolean) => set({ hasHydrated: hydrated }),
      
      /**
       * 設置語言
       */
      setLanguage: (language) => set({ language }),
      
      /**
       * 顯示底部抽屜
       */
      showBottomSheet: (content) => set({ 
        bottomSheetVisible: true, 
        bottomSheetContent: content,
      }),
      
      /**
       * 隱藏底部抽屜
       */
      hideBottomSheet: () => set({ 
        bottomSheetVisible: false,
        bottomSheetContent: null,
      }),
      
      /**
       * 重置狀態
       */
      reset: () => {
        // 取消訂閱
        if (unsubscribe) {
          unsubscribe();
          unsubscribe = null;
        }
        set(initialState);
      },
      
      // ===== 兼容舊代碼 =====
      /**
       * @deprecated 使用 setThemeMode 代替
       */
      setTheme: (theme: 'light' | 'dark') => {
        set({ 
          themeMode: theme, 
          resolvedTheme: theme,
          theme,
        });
        // 手動設置時取消系統監聽
        setupAppearanceListener(set, theme);
      },
    }),
    {
      name: 'xiaopei-ui-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // 只持久化 themeMode 和 language，resolvedTheme 每次啟動推導
      partialize: (state) => ({
        themeMode: state.themeMode,
        language: state.language,
        // 兼容舊代碼
        theme: state.theme,
      }),
      // rehydrate 完成後的回調
      onRehydrateStorage: () => (state) => {
        if (state) {
          // 從持久化的 themeMode 推導 resolvedTheme
          const resolved = getResolvedTheme(state.themeMode);
          // 注意：這裡不能直接 set，需要在 initTheme 中處理
        }
      },
    }
  )
);

// ===== Hook 導出 =====

/**
 * 獲取主題模式
 */
export const useThemeMode = () => useUIStore((state) => state.themeMode);

/**
 * 獲取實際生效的主題
 */
export const useResolvedTheme = () => useUIStore((state) => state.resolvedTheme);

/**
 * 獲取 hydration 狀態
 */
export const useHasHydrated = () => useUIStore((state) => state.hasHydrated);
