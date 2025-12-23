/**
 * 小佩 App 主入口
 * 
 * 職責：
 * 1. 初始化 i18n
 * 2. 初始化主題系統
 * 3. 掛載導航器
 * 4. 提供全局 SafeAreaProvider
 */

import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { RootNavigator } from './src/navigation/RootNavigator';
import { initializeAuth } from './src/utils/initializeAuth';
import { navigationRef } from './src/navigation/navigationRef';
import { initApiAuth } from './src/store/authApiAdapter';
import { ThemeProvider, getColors } from './src/theme';
import { useUIStore, useHasHydrated, useResolvedTheme } from './src/store/uiStore';
import Toast from 'react-native-toast-message';
import './src/i18n'; // 初始化 i18n

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const hasHydrated = useHasHydrated();
  const resolvedTheme = useResolvedTheme();
  
  // 獲取當前主題的顏色用於加載畫面
  const colors = getColors(resolvedTheme);

  useEffect(() => {
    async function prepare() {
      try {
        console.log('[App] ==================== App 啟動 ====================');
        
        // 🔥🔥🔥 臨時：強制清除問題數據（只執行一次）
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
        const clearFlag = await AsyncStorage.getItem('__xiaopei_v4_cleared__');
        if (clearFlag !== 'true') {
          console.log('[App] 🔥 首次運行 v4，清除所有舊數據...');
          await AsyncStorage.removeItem('xiaopei-auth-storage');
          await AsyncStorage.setItem('__xiaopei_v4_cleared__', 'true');
          console.log('[App] ✅ 舊數據已清除');
        }
        
        // 1. 初始化認證（從 AsyncStorage 恢復 Token）
        await initializeAuth();
        
        // 2. 初始化 API Client 認證配置（必須在 initializeAuth 之後）
        initApiAuth();
        
        // 3. 初始化主題（設置系統外觀監聽）
        const { initTheme } = useUIStore.getState();
        initTheme();
        console.log('[App] ✅ 主題系統初始化完成');
        
        console.log('[App] ==================== 初始化完成 ====================');
        setIsInitialized(true);
      } catch (error) {
        console.error('[App] 初始化失敗:', error);
        setIsInitialized(true); // 即使失敗也要繼續
      }
    }

    prepare();
  }, []);

  // 等待認證和主題初始化完成（避免首屏閃爍）
  if (!isInitialized || !hasHydrated) {
    return (
      <SafeAreaProvider>
        <View style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center', 
          backgroundColor: colors.background 
        }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
        <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
      </SafeAreaProvider>
    );
  }

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <NavigationContainer ref={navigationRef}>
          <View testID="app-root" style={{ flex: 1 }}>
            <RootNavigator />
          </View>
        </NavigationContainer>
        <Toast />
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
