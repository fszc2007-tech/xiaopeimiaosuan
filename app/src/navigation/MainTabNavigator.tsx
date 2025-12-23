/**
 * 底部导航器
 * 
 * Tab 结构：
 * - Cases（档案）
 * - XiaoPeiHome（小佩主页，中间悬浮按钮）
 * - Me（我的）
 * 
 * 注意：「排盤」Tab 是快捷跳转，不是真正的 Screen
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SCREEN_NAMES } from '@/constants/routes';
import { MainTabsParamList } from '@/types/navigation';
import { useTranslation } from 'react-i18next';
import { colors } from '@/theme';

// Screens
import { CasesScreen } from '@/screens/Cases';
import { XiaoPeiHomeScreen } from '@/screens/XiaoPeiHome';
import { MeScreen } from '@/screens/Me';

// Icons (using lucide-react-native)
import { FolderOpen, Home, User } from 'lucide-react-native';

const Tab = createBottomTabNavigator<MainTabsParamList>();

export const MainTabNavigator: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.cardBg,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
        },
        headerStyle: {
          backgroundColor: colors.bg,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 16,
          color: colors.ink,
        },
      }}
    >
      <Tab.Screen
        name={SCREEN_NAMES.CASES}
        component={CasesScreen}
        options={{
          title: t('tabs.cases'),
          tabBarIcon: ({ color, size }) => (
            <FolderOpen color={color} size={size} />
          ),
          tabBarTestID: 'tab-cases',
        }}
      />
      
      <Tab.Screen
        name={SCREEN_NAMES.XIAOPEI_HOME}
        component={XiaoPeiHomeScreen}
        options={{
          title: t('tabs.xiaopei'),
          tabBarIcon: ({ color, size }) => (
            <Home color={color} size={size} />
          ),
          tabBarTestID: 'tab-xiaopei-home',
        }}
      />
      
      <Tab.Screen
        name={SCREEN_NAMES.ME}
        component={MeScreen}
        options={{
          title: t('tabs.me'),
          tabBarIcon: ({ color, size }) => (
            <User color={color} size={size} />
          ),
          tabBarTestID: 'tab-me',
        }}
      />
    </Tab.Navigator>
  );
};

