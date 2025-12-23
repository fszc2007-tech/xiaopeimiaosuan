/**
 * 我的页面
 * 
 * 功能：
 * - 个人信息展示
 * - 我的命理（命盘/解读/聊天记录）
 * - 小佩服务（Pro/时运提醒/学堂）
 * - 工具与帮助（邀请/反馈/设置）
 * 
 * 参考文档：app.doc/features/我的-一级设计文档.md
 */

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  User,
  FileText,
  MessageCircle,
  Crown,
  UserPlus,
  MessageSquare,
  Settings,
  ChevronRight,
  Headphones,
} from 'lucide-react-native';
import { colors, fontSizes, fontWeights, spacing, radius } from '@/theme';
import { SCREEN_NAMES } from '@/constants/routes';
import { CustomerServiceModal } from '@/components/CustomerServiceModal';
import { useAuthStore, useIsAuthenticated } from '@/store';
import { useTranslation } from 'react-i18next';
import { getMembershipState } from '@/screens/ProMemberCenter/utils/membershipState';

// 类型定义
interface UserProfile {
  userId: string;
  phone?: string;
  email?: string;
  isPro: boolean;
  proExpiresAt?: string;
  proType?: 'monthly' | 'annual';
  chartCount: number;
}

export const MeScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCustomerService, setShowCustomerService] = useState(false);
  
  // 🔧 调试：直接读取 authStore 状态（稳定引用）
  const isAuthenticated = useIsAuthenticated(); // 🔥 使用安全的 hook，确保返回布尔值
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const updateUser = useAuthStore((state) => state.updateUser);
  
  // ✅ 统一登录状态判断：只认 authStore
  const isLoggedIn = isAuthenticated && !!user;
  
  // 🔧 调试：监听会员状态变化
  React.useEffect(() => {
    console.log('[MeScreen] 會員狀態變化:', {
      isLoggedIn,
      isPro: user?.isPro,
      proExpiresAt: user?.proExpiresAt,
      proPlan: user?.proPlan,
    });
  }, [isLoggedIn, user?.isPro, user?.proExpiresAt, user?.proPlan]);

  // 获取用户信息
  const fetchProfile = useCallback(async () => {
    // 🔧 调试日志
    console.log('[MeScreen] authStore 状态:', {
      isAuthenticated,
      hasUser: !!user,
      phone: user?.phone,
      hasToken: !!token,
      tokenLength: token?.length,
    });
    
    // ✅ 检查 token 是否存在
    if (!token || token.length === 0) {
      console.warn('[MeScreen] ⚠️ token 不存在，跳过 API 请求');
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      
      console.log('[MeScreen] ✅ 开始请求 API，token 长度:', token.length);
      
      // 调用 Core API
      const { authApi, baziApi } = await import('@/services/api');
      const userInfo = await authApi.getMe();
      
      // 获取命盘数量
      const chartsData = await baziApi.getCharts({ limit: 1000 });
      
      const profileData: UserProfile = {
        userId: userInfo.userId,
        phone: userInfo.phone,
        email: userInfo.email,
        isPro: userInfo.isPro,
        proExpiresAt: userInfo.proExpiresAt,
        proType: userInfo.proType,
        chartCount: chartsData.total,
      };
      
      setProfile(profileData);
      
      // 🔥 同步更新 authStore，确保会员状态显示一致
      console.log('[MeScreen] 從後端獲取用戶信息:', {
        isPro: userInfo.isPro,
        proExpiresAt: userInfo.proExpiresAt,
        proType: userInfo.proType,
      });
      
      updateUser({
        isPro: userInfo.isPro,
        proExpiresAt: userInfo.proExpiresAt,
        proPlan: userInfo.proType as 'monthly' | 'quarterly' | 'yearly' | undefined,
      });
      
      console.log('[MeScreen] ✅ authStore 已同步更新');
    } catch (error: any) {
      console.error('[MeScreen] ❌ Failed to fetch profile:', {
        message: error.message,
        code: error.code,
        response: error.response,
        responseData: error.response?.data,
        status: error.response?.status,
        requestHeaders: error.config?.headers,
        hasAuthHeader: !!error.config?.headers?.Authorization,
      });
      
      // 详细打印 Authorization header
      if (error.config?.headers?.Authorization) {
        console.log('[MeScreen] 📡 请求头中的 Authorization:', 
          error.config.headers.Authorization.substring(0, 50) + '...'
        );
      } else {
        console.error('[MeScreen] ❌ 请求头中没有 Authorization！');
      }
      
      Alert.alert('错误', error.response?.data?.error?.message || error.message || '获取用户信息失败');
    } finally {
      setIsLoading(false);
    }
  }, []); // ✅ 移除依赖，避免无限循环

  // 页面聚焦时刷新
  useFocusEffect(
    useCallback(() => {
      // ✅ 只有在已认证且有 token 时才获取数据
      if (isAuthenticated && token && token.length > 0) {
        console.log('[MeScreen] 页面聚焦，开始获取数据');
        fetchProfile();
      } else {
        console.log('[MeScreen] 未登录状态，跳过数据获取');
      }
    }, [fetchProfile, token, isAuthenticated])
  );

  // 处理导航
  const handleNavigate = (screenName: string, params?: any) => {
    navigation.navigate(screenName as any, params);
  };

  // 格式化 Pro 到期时间
  const formatProExpiry = (expiresAt?: string) => {
    if (!expiresAt) return '';
    const date = new Date(expiresAt);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <View testID="me-screen" style={styles.screen}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      
      {/* 个人信息卡片 */}
      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          {/* 头像 */}
          <View style={styles.avatar}>
            <User color={colors.primary} size={32} />
          </View>
          
          {/* 信息 */}
          <View style={styles.profileInfo}>
            <Text style={styles.profilePhone}>
              {isLoggedIn
                ? (user.phone ?? user.email ?? t('me.notLoggedIn'))
                : t('me.notLoggedIn')}
            </Text>
            {isLoggedIn && user.isPro ? (
              <View style={styles.proTag}>
                <Crown color={colors.yellowPro} size={14} />
                <Text style={styles.proTagText}>
                  小佩 Pro · 至 {formatProExpiry(user.proExpiresAt)}
                </Text>
              </View>
            ) : (
              <Text style={styles.profileDesc}>免費用戶</Text>
            )}
          </View>
          
          {/* 设置按钮 */}
          <Pressable
            style={styles.settingsButton}
            onPress={() => handleNavigate(SCREEN_NAMES.SETTINGS)}
          >
            <Settings color={colors.textSecondary} size={20} />
          </Pressable>
        </View>
      </View>

      {/* 我的命理 */}
      <Section title={t('me.myMingLi')}>
        <Cell
          icon={FileText}
          iconBg={colors.greenSoftBg}
          iconColor={colors.primary}
          label={t('me.myCharts')}
          desc={`${profile?.chartCount || 0} 張命盤`}
          onPress={() => handleNavigate(SCREEN_NAMES.CASES)}
        />
        <Cell
          icon={MessageCircle}
          iconBg={colors.greenSoftBg}
          iconColor={colors.brandGreen}
          label="我的解讀"
          desc={t('me.chatHistoryDesc')}
          onPress={() => handleNavigate(SCREEN_NAMES.CHAT_HISTORY)}
        />
      </Section>

      {/* 小佩服务 */}
      <Section title={t('me.xiaopeiService')}>
        {(() => {
          // 获取会员状态
          const membershipState = getMembershipState(profile?.isPro, profile?.proExpiresAt);
          
          // 根据状态决定跳转到哪个页面
          const shouldShowMemberCenter = 
            membershipState === 'pro_active' || membershipState === 'pro_expiring';
          
          return (
            <Cell
              icon={Crown}
              iconBg={shouldShowMemberCenter ? colors.greenSoftBg : '#FFF8F0'}
              iconColor={shouldShowMemberCenter ? colors.primary : colors.brandOrange}
              label={shouldShowMemberCenter ? '小佩會員' : t('me.upgradePro')}
              desc={shouldShowMemberCenter ? '查看會員狀態與權益' : t('me.upgradeProDesc')}
              badge={shouldShowMemberCenter ? undefined : t('me.recommended')}
              onPress={() => 
                handleNavigate(
                  shouldShowMemberCenter 
                    ? SCREEN_NAMES.PRO_MEMBER_CENTER 
                    : SCREEN_NAMES.PRO_SUBSCRIPTION
                )
              }
            />
          );
        })()}
      </Section>

      {/* 工具与帮助 */}
      <Section title={t('me.toolsAndHelp')}>
        <Cell
          icon={UserPlus}
          iconBg={colors.greenSoftBg}
          iconColor={colors.primary}
          label={t('me.inviteFriends')}
          desc={t('me.inviteFriendsDesc')}
          onPress={() => handleNavigate(SCREEN_NAMES.INVITE_FRIENDS)}
        />
        <Cell
          icon={MessageSquare}
          iconBg={colors.greenSoftBg}
          iconColor={colors.brandGreen}
          label={t('me.feedback')}
          desc={t('me.feedbackDesc')}
          onPress={() => handleNavigate(SCREEN_NAMES.FEEDBACK)}
        />
        <Cell
          icon={Headphones}
          iconBg={colors.greenSoftBg}
          iconColor={colors.primary}
          label="聯繫客服"
          desc="微信客服，隨時解答"
          onPress={() => setShowCustomerService(true)}
        />
      </Section>

      {/* 底部空白 */}
      <View style={styles.footer} />
    </ScrollView>

    {/* 联系客服弹窗 */}
    <CustomerServiceModal
      visible={showCustomerService}
      onClose={() => setShowCustomerService(false)}
    />
  </View>
  );
};

// Section 组件
interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionContent}>{children}</View>
  </View>
);

// Cell 组件
interface CellProps {
  icon: React.ComponentType<{ color: string; size: number }>;
  iconBg: string;
  iconColor: string;
  label: string;
  desc?: string;
  badge?: string;
  disabled?: boolean;
  onPress?: () => void;
}

const Cell: React.FC<CellProps> = ({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  desc,
  badge,
  disabled,
  onPress,
}) => {
  // 确保 disabled 始终是布尔值
  const isDisabled = Boolean(disabled);
  const hasOnPress = Boolean(onPress);

  const handlePress = () => {
    if (isDisabled) {
      Alert.alert('提示', '此功能敬請期待');
      return;
    }
    onPress?.();
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.cell,
        pressed && styles.cellPressed,
        isDisabled && styles.cellDisabled,
      ]}
      onPress={handlePress}
      disabled={Boolean(!hasOnPress || isDisabled)}
    >
      {/* 图标 */}
      <View style={[styles.cellIcon, { backgroundColor: iconBg }]}>
        <Icon color={iconColor} size={20} />
      </View>

      {/* 文字 */}
      <View style={styles.cellContent}>
        <View style={styles.cellLabelRow}>
          <Text style={styles.cellLabel}>{label}</Text>
          {badge && (
            <View style={styles.cellBadge}>
              <Text style={styles.cellBadgeText}>{badge}</Text>
            </View>
          )}
        </View>
        {desc && <Text style={styles.cellDesc}>{desc}</Text>}
      </View>

      {/* 箭头 */}
      {!isDisabled && <ChevronRight color={colors.textSecondary} size={16} />}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingBottom: spacing['2xl'],
  },

  // 个人信息卡片
  profileCard: {
    backgroundColor: colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    padding: spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.greenSoftBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  profilePhone: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  proTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  proTagText: {
    fontSize: fontSizes.xs,
    color: colors.yellowPro,
  },
  profileDesc: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  settingsButton: {
    padding: spacing.xs,
  },

  // Section
  section: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionContent: {
    backgroundColor: colors.cardBg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },

  // Cell
  cell: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cellPressed: {
    backgroundColor: colors.greenSoftBg,
    opacity: 0.8,
  },
  cellDisabled: {
    opacity: 0.5,
  },
  cellIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  cellContent: {
    flex: 1,
  },
  cellLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  cellLabel: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    color: colors.ink,
    marginRight: spacing.xs,
  },
  cellBadge: {
    backgroundColor: colors.redSoftBg,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  cellBadgeText: {
    fontSize: fontSizes.xs,
    color: colors.brandRed,
  },
  cellDesc: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },

  footer: {
    height: spacing['2xl'],
  },
});

