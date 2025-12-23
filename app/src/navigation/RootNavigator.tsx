/**
 * 根导航器
 * 
 * 架构：
 * - Auth（登录/注册）
 * - MainTabs（底部导航）
 * - 全屏页面（Chat, ManualBazi, ChartDetail 等）
 */

import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SCREEN_NAMES } from '@/constants/routes';
import { RootStackParamList } from '@/types/navigation';
import { useIsAuthenticated, useAuthStore } from '@/store/authStore';
// ⚠️ 临时移除：useHasHydrated
import { colors } from '@/theme';

// Screens
import { AuthScreen } from '@/screens/Auth';
import { PolicyViewerScreen } from '@/screens/Auth/PolicyViewerScreen';
import { MainTabNavigator } from './MainTabNavigator';
import { ChatScreen } from '@/screens/Chat';
import { ManualBaziScreen } from '@/screens/ManualBazi';
import { ChartDetailScreen } from '@/screens/ChartDetail';
import { ProSubscriptionScreen } from '@/screens/ProSubscription/ProSubscriptionScreen';
import { ProMemberCenterScreen } from '@/screens/ProMemberCenter';
import { ChatHistoryScreen } from '@/screens/ChatHistory/ChatHistoryScreen';
import { SettingsScreen } from '@/screens/Settings/SettingsScreen';
import { ThemeSettingsScreen } from '@/screens/Settings/ThemeSettingsScreen';
import { AboutXiaopeiScreen } from '@/screens/AboutXiaopei';
import { FeedbackScreen } from '@/screens/Feedback/FeedbackScreen';
import { InviteFriendsScreen } from '@/screens/InviteFriends/InviteFriendsScreen';
import { ReadingsScreen } from '@/screens/Readings/ReadingsScreen';
import { AccountDeletionPendingScreen } from '@/screens/AccountDeletionPending';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  // 🔥 使用安全的 hook 确保 isAuthenticated 始终是布尔值
  const isAuthenticated = useIsAuthenticated();
  const user = useAuthStore((state) => state.user);
  
  // ✅ 简化：直接使用 hook 返回的布尔值（已经过类型保护）
  const isLoggedIn = isAuthenticated;
  
  // 檢查用戶是否處於待刪除狀態
  const isPendingDelete = isLoggedIn && user?.status === 'PENDING_DELETE';

  // 记录认证状态变化
  React.useEffect(() => {
    import('@/utils/logger').then(({ logger }) => {
      logger.navigation('认证状态变化', {
        // hasHydrated,
        isAuthenticated,
        isLoggedIn,
        isPendingDelete,
        userStatus: user?.status,
        type: typeof isAuthenticated,
      });
    });
  }, [isAuthenticated, isLoggedIn, isPendingDelete, user?.status]);
  
  // ⚠️ 临时：跳过 hydration 等待
  // if (!hasHydrated) {
  //   return (
  //     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg }}>
  //       <ActivityIndicator size="large" color={colors.primary} />
  //     </View>
  //   );
  // }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {isLoggedIn === false ? (
        // 未登录：显示登录页 + 政策查看页
        <>
          <Stack.Screen name={SCREEN_NAMES.AUTH} component={AuthScreen} />
          <Stack.Screen 
            name="PolicyViewer" 
            component={PolicyViewerScreen}
            options={{ headerShown: true }}
          />
        </>
      ) : isPendingDelete ? (
        // 已登录但帳號待刪除：顯示 Blocking page
        <>
          <Stack.Screen 
            name={SCREEN_NAMES.ACCOUNT_DELETION_PENDING} 
            component={AccountDeletionPendingScreen}
          />
        </>
      ) : (
        // 已登录且帳號正常：显示主应用
        <>
          <Stack.Screen name={SCREEN_NAMES.MAIN_TABS} component={MainTabNavigator} />
          
          {/* 全屏页面 */}
          <Stack.Screen name={SCREEN_NAMES.CHAT} component={ChatScreen} />
          <Stack.Screen name={SCREEN_NAMES.MANUAL_BAZI} component={ManualBaziScreen} />
          <Stack.Screen name={SCREEN_NAMES.CHART_DETAIL} component={ChartDetailScreen} />
          
          {/* Me 模块二级页面 */}
          <Stack.Screen name={SCREEN_NAMES.CHAT_HISTORY} component={ChatHistoryScreen} />
          <Stack.Screen name={SCREEN_NAMES.READINGS} component={ReadingsScreen} />
          <Stack.Screen name={SCREEN_NAMES.SETTINGS} component={SettingsScreen} />
          <Stack.Screen name={SCREEN_NAMES.THEME_SETTINGS} component={ThemeSettingsScreen} />
          <Stack.Screen name={SCREEN_NAMES.ABOUT_XIAOPEI} component={AboutXiaopeiScreen} />
          <Stack.Screen name={SCREEN_NAMES.FEEDBACK} component={FeedbackScreen} />
          <Stack.Screen name={SCREEN_NAMES.INVITE_FRIENDS} component={InviteFriendsScreen} />
          
          {/* Pro 模块 */}
          <Stack.Screen name={SCREEN_NAMES.PRO_SUBSCRIPTION} component={ProSubscriptionScreen} />
          <Stack.Screen name={SCREEN_NAMES.PRO_MEMBER_CENTER} component={ProMemberCenterScreen} />

          {/* 政策文檔查看（登錄後也可查看） */}
          <Stack.Screen 
            name="PolicyViewer" 
            component={PolicyViewerScreen}
            options={{ headerShown: true }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

