/**
 * Pro 会员中心页面
 * 
 * 功能：
 * - 显示会员状态和权益
 * - 显示今日 AI 使用情况
 * - 提供订阅管理入口
 * 
 * 参考文档：app.doc/会员中心设计方案-最终版.md
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { BackButton } from '@/components/common/BackButton';
import { colors, spacing } from '@/theme';
import { proService, MembershipStatus } from '@/services/api/proService';
import { SCREEN_NAMES } from '@/constants/routes';
import Toast from 'react-native-toast-message';

// 导入组件
import { StatusCard } from './components/StatusCard';
import { UsageCard } from './components/UsageCard';
import { BenefitsCard } from './components/BenefitsCard';
import { ManagementCard } from './components/ManagementCard';

// 导入工具函数
import {
  getMembershipState,
  MembershipState,
  formatDate,
} from './utils/membershipState';

export const ProMemberCenterScreen: React.FC = () => {
  const navigation = useNavigation();
  const [status, setStatus] = useState<MembershipStatus | null>(null);
  const [membershipState, setMembershipState] = useState<MembershipState>('non_pro');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载数据
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('[ProMemberCenter] 开始加载会员状态');

      // 1. 获取会员状态
      const statusData = await proService.getStatus();
      console.log('[ProMemberCenter] 会员状态:', statusData);

      // 2. 判断状态
      const state = getMembershipState(statusData.isPro, statusData.proExpiresAt);
      console.log('[ProMemberCenter] 会员状态枚举:', state);

      // 3. 如果已过期或未订阅，直接跳转销售页
      if (state === 'pro_expired' || state === 'non_pro') {
        console.log('[ProMemberCenter] 会员已过期或未订阅，跳转到销售页');
        navigation.replace(SCREEN_NAMES.PRO_SUBSCRIPTION as any);
        
        if (state === 'pro_expired' && statusData.proExpiresAt) {
          Toast.show({
            type: 'info',
            text1: '會員已到期',
            text2: `你的小佩會員已於 ${formatDate(statusData.proExpiresAt)} 到期。`,
          });
        }
        return;
      }

      // 4. 只有 pro_active 或 pro_expiring 才能进入会员中心
      setMembershipState(state);
      setStatus(statusData);
    } catch (err: any) {
      console.error('[ProMemberCenter] 加载失败:', err);
      setError('暫時無法獲取會員資訊');
      Toast.show({
        type: 'error',
        text1: '加載失敗',
        text2: err.message || '暫時無法獲取會員資訊',
      });
    } finally {
      setLoading(false);
    }
  };

  // 管理订阅
  const handleManageSubscription = () => {
    console.log('[ProMemberCenter] 打开 iOS 订阅管理');
    
    // 打开 App Store 订阅管理页面
    const url = 'https://apps.apple.com/account/subscriptions';
    Linking.openURL(url).catch((err) => {
      console.error('[ProMemberCenter] 打开订阅管理失败:', err);
      Alert.alert('錯誤', '無法打開訂閱管理頁面');
    });
  };

  // 去提问
  const handleAskQuestion = () => {
    console.log('[ProMemberCenter] 跳转到聊天页面');
    
    // 跳转到首页（小佩 Home）
    navigation.navigate('MainTabs' as any, {
      screen: 'XiaoPeiHome',
    });
  };

  // 重试
  const handleRetry = () => {
    loadData();
  };

  // Loading 状态
  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <BackButton />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>加載中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error 状态
  if (error || !status) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <BackButton />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || '暫時無法獲取會員資訊'}</Text>
          <Pressable
            style={({ pressed }) => [
              styles.retryButton,
              pressed && styles.retryButtonPressed,
            ]}
            onPress={handleRetry}
          >
            <Text style={styles.retryButtonText}>重試一次</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <BackButton />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 顶部状态卡 */}
        <StatusCard
          membershipState={membershipState}
          plan={status.proPlan}
          expiresAt={status.proExpiresAt}
        />

        {/* 使用情况卡 */}
        <UsageCard
          aiCallsToday={status.aiCallsToday}
          aiDailyLimit={status.aiDailyLimit}
          onAskQuestion={handleAskQuestion}
        />

        {/* 会员权益卡 */}
        <BenefitsCard
          aiDailyLimit={status.aiDailyLimit}
          maxCharts={null} // 会员无限制
        />

        {/* 订阅管理卡 */}
        {status.proPlan && status.proExpiresAt && (
          <ManagementCard
            plan={status.proPlan}
            expiresAt={status.proExpiresAt}
            onManageSubscription={handleManageSubscription}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.lg,
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  retryButtonPressed: {
    opacity: 0.8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});

