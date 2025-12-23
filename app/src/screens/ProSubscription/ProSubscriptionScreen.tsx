/**
 * Pro 订阅页面（重構版）
 * 
 * 功能：
 * - 展示當前會員狀態與 AI 次數
 * - 展示權益對比表（精簡版）
 * - 訂閱計劃選擇（月/季/年）
 * - 假支付流程
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  Crown,
  Check,
  Heart,
} from 'lucide-react-native';
import { BackButton } from '@/components/common/BackButton';
import { MessageDialog } from '@/components/common/MessageDialog/MessageDialog';
import { colors, fontSizes, fontWeights, spacing, radius } from '@/theme';
import { proService, MembershipStatus } from '@/services/api/proService';
import { SCREEN_NAMES } from '@/constants/routes';
import { getMembershipState } from '@/screens/ProMemberCenter/utils/membershipState';
import { useAuthStore, useProStore } from '@/store';

type PlanType = 'monthly' | 'quarterly' | 'yearly';

interface Plan {
  type: PlanType;
  label: string;
  price: number;
  period: string;
  badge?: string;
  pricePerMonth?: string;
}

const PLANS: Plan[] = [
  {
    type: 'monthly',
    label: '按月訂閱',
    price: 39,
    period: '每月',
  },
  {
    type: 'quarterly',
    label: '按季訂閱',
    price: 99,
    period: '每季',
    pricePerMonth: '約 33 / 月',
  },
  {
    type: 'yearly',
    label: '按年訂閱',
    price: 348,
    period: '每年',
    pricePerMonth: '約 29 / 月',
  },
];

// 權益對比表數據（順序：AI 解讀 → 功能 → 命盤數量）
const BENEFITS = [
  {
    title: 'AI 解讀 / 問答',
    free: '首日 10 次，之後每天 5 次',
    pro: '每天 100 次，幾乎用不完，想問就問',
  },
  {
    title: '功能',
    free: '可體驗全部功能',
    pro: '全功能 + 高次數，適合長期追蹤與反覆提問',
  },
  {
    title: '命盤數量',
    free: '最多可保存 10 個命盤',
    pro: '命盤數量更寬鬆，方便長期使用與幫親友看盤',
  },
];

export const ProSubscriptionScreen: React.FC = () => {
  const navigation = useNavigation();
  const updateUser = useAuthStore((state) => state.updateUser);
  const setProStatus = useProStore((state) => state.setProStatus);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('yearly');
  const [status, setStatus] = useState<MembershipStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // 加載會員狀態
  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      setLoading(true);
      const data = await proService.getStatus();
      
      // 检查会员状态：如果是有效会员，跳转到会员中心
      const membershipState = getMembershipState(data.isPro, data.proExpiresAt);
      console.log('[ProSubscription] 会员状态:', membershipState);
      
      if (membershipState === 'pro_active' || membershipState === 'pro_expiring') {
        console.log('[ProSubscription] 用户已是有效会员，跳转到会员中心');
        navigation.replace(SCREEN_NAMES.PRO_MEMBER_CENTER as any);
        return;
      }
      
      // 只有非会员或已过期才继续显示销售页
      setStatus(data);
    } catch (error: any) {
      console.error('[ProSubscription] 加載狀態失敗:', error);
      // 如果是 401 未授权，可能是未登录，不显示错误
      // 其他错误也静默处理，显示默认状态
      if (error?.response?.status === 401) {
        console.log('[ProSubscription] 未登录，跳过状态加载');
      } else {
        console.error('[ProSubscription] API 错误详情:', {
          status: error?.response?.status,
          code: error?.code,
          message: error?.message,
          data: error?.response?.data,
        });
      }
      // 设置 status 为 null，让 UI 显示"无法载入状态信息"
      setStatus(null);
    } finally {
      setLoading(false);
    }
  };

  // 處理訂閱
  const handleSubscribe = async () => {
    const plan = PLANS.find((p) => p.type === selectedPlan);
    if (!plan) return;

    try {
      setSubscribing(true);
      
      // 調用統一訂閱接口（根據環境配置自動選擇 Mock 或正式 API）
      const response = await proService.subscribe({ plan: selectedPlan });
      
      console.log('[ProSubscription] 訂閱成功，後端返回:', {
        isPro: response.user.isPro,
        proExpiresAt: response.user.proExpiresAt,
        proPlan: response.user.proPlan,
      });
      
      // 🔥 更新 authStore 中的用戶會員狀態
      updateUser({
        isPro: response.user.isPro,
        proExpiresAt: response.user.proExpiresAt || undefined,
        proPlan: response.user.proPlan as 'monthly' | 'quarterly' | 'yearly' | undefined,
      });
      
      // 🔥 同時更新 proStore，確保兩個 store 狀態一致
      setProStatus(
        response.user.isPro,
        response.user.proPlan as 'monthly' | 'quarterly' | 'yearly' | undefined,
        response.user.proExpiresAt || undefined
      );
      
      console.log('[ProSubscription] ✅ authStore 和 proStore 已更新，顯示成功對話框');
      
      // 訂閱成功後先顯示成功對話框
      setShowSuccessDialog(true);
    } catch (error: any) {
      console.error('[ProSubscription] 訂閱失敗:', error);
      Alert.alert('訂閱失敗', error.message || '請稍後再試');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton />
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* 當前狀態卡片 */}
        <View style={styles.statusCard}>
          {loading ? (
            <View style={styles.statusLoading}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.statusLoadingText}>載入中…</Text>
            </View>
          ) : status ? (
            <>
              <View style={styles.statusHeader}>
                <Text style={styles.statusTitle}>
                  {status.isPro ? '小佩會員' : '免費用戶'}
                </Text>
                {status.isPro && (
                  <View style={styles.proBadge}>
                    <Crown color={colors.yellowPro} size={14} />
                  </View>
                )}
              </View>
              <Text style={styles.statusDesc}>
                {status.isPro
                  ? '已解鎖全部解讀與高額 AI 問答'
                  : '已解鎖基礎排盤與簡要解讀'}
              </Text>
              <View style={styles.statusDivider} />
              <Text style={styles.statusUsage}>
                今日解讀：{status.aiCallsToday} / {status.aiDailyLimit} 次
              </Text>
              {status.aiRemaining <= 0 && !status.isPro && (
                <Text style={styles.statusWarning}>
                  今天的免費次數已用完。升級小佩會員，每天可享 100 次 AI 解讀 / 問答。
                </Text>
              )}
            </>
          ) : (
            <View style={styles.statusErrorContainer}>
              <Text style={styles.statusError}>無法載入狀態信息</Text>
              <Text style={styles.statusErrorHint}>
                請確認已登入並檢查網絡連接
              </Text>
            </View>
          )}
        </View>

        {/* 綠色介紹卡片（情緒價值） */}
        {!status?.isPro && (
          <View style={styles.introCard}>
            <Heart color={colors.primary} size={24} style={styles.introIcon} />
            <Text style={styles.introText}>
              想慢慢看懂自己的節奏、常常有小問題想問時，{'\n'}
              <Text style={styles.introTextBold}>小佩會員更適合你：不用擔心次數，想問就問。</Text>
            </Text>
          </View>
        )}

        {/* 權益對比表 */}
        {!status?.isPro && (
          <View style={styles.benefitsSection}>
            <Text style={styles.benefitsTitle}>會員權益對比</Text>
            <View style={styles.benefitsTable}>
              {/* 表頭 */}
              <View style={styles.benefitsHeaderRow}>
                <View style={styles.benefitsHeaderCell}>
                  <Text style={styles.benefitsHeaderText}></Text>
                </View>
                <View style={styles.benefitsHeaderCell}>
                  <Text style={styles.benefitsHeaderText}>非會員</Text>
                </View>
                <View style={styles.benefitsHeaderCell}>
                  <Text style={[styles.benefitsHeaderText, styles.benefitsProText]}>
                    小佩會員
                  </Text>
                </View>
              </View>

              {/* 表格內容 */}
              {BENEFITS.map((benefit, index) => (
                <View key={index} style={styles.benefitsRow}>
                  <View style={styles.benefitsTitleCell}>
                    <Text style={styles.benefitsTitleText}>{benefit.title}</Text>
                  </View>
                  <View style={styles.benefitsCell}>
                    <Text style={styles.benefitsCellText}>{benefit.free}</Text>
                  </View>
                  <View style={[styles.benefitsCell, styles.benefitsProCell]}>
                    <Text style={[styles.benefitsCellText, styles.benefitsProText]}>
                      {benefit.pro}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* CTA 文案 */}
            <Text style={styles.benefitsCta}>
              想更自由地問小佩，{'\n'}
              <Text style={styles.benefitsCtaBold}>就升級成小佩會員吧。</Text>
            </Text>
          </View>
        )}

        {/* 訂閱計劃 */}
        {!status?.isPro && (
          <View style={styles.plans}>
            <Text style={styles.plansTitle}>選擇訂閱計劃</Text>
            {PLANS.map((plan) => (
              <Pressable
                key={plan.type}
                style={[
                  styles.planCard,
                  selectedPlan === plan.type && styles.planCardSelected,
                ]}
                onPress={() => setSelectedPlan(plan.type)}
              >
                {plan.badge && (
                  <View style={styles.planBadge}>
                    <Text style={styles.planBadgeText}>{plan.badge}</Text>
                  </View>
                )}

                <View style={styles.planContent}>
                  <View style={styles.planHeader}>
                    <Text style={styles.planLabel}>{plan.label}</Text>
                    {selectedPlan === plan.type && (
                      <View style={styles.checkIcon}>
                        <Check color="#FFFFFF" size={14} />
                      </View>
                    )}
                  </View>

                  <View style={styles.planPricing}>
                    <Text style={styles.planPrice}>HK$ {plan.price}</Text>
                    <Text style={styles.planPeriod}> / {plan.period}</Text>
                  </View>
                  
                  {plan.pricePerMonth && (
                    <Text style={styles.planPerMonth}>{plan.pricePerMonth}</Text>
                  )}
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {/* 已是會員的提示 */}
        {status?.isPro && (
          <View style={styles.alreadyProCard}>
            <Text style={styles.alreadyProText}>
              您已是小佩會員，感謝您的支持！
            </Text>
            {status.proExpiresAt && (
              <Text style={styles.alreadyProExpiry}>
                到期時間：{new Date(status.proExpiresAt).toLocaleDateString('zh-TW')}
              </Text>
            )}
          </View>
        )}
      </ScrollView>

      {/* 底部按鈕 */}
      {!status?.isPro && (
        <View style={styles.footer}>
          <Pressable
            style={[styles.subscribeButton, subscribing && styles.subscribeButtonDisabled]}
            onPress={handleSubscribe}
            disabled={subscribing}
          >
            {subscribing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.subscribeButtonText}>
                立即訂閱 - HK$ {PLANS.find((p) => p.type === selectedPlan)?.price}
              </Text>
            )}
          </Pressable>
        </View>
      )}

      {/* 訂閱成功對話框 */}
      <MessageDialog
        visible={showSuccessDialog}
        type="success"
        title="訂閱成功"
        message="恭喜您成為小佩會員！"
        confirmText="前往會員中心"
        onConfirm={() => {
          setShowSuccessDialog(false);
          navigation.replace(SCREEN_NAMES.PRO_MEMBER_CENTER as any);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  
  // 內容區
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: spacing.lg,
  },
  headerRight: {
    width: 44,
  },
  
  // 當前狀態卡片
  statusCard: {
    backgroundColor: colors.cardBg,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  statusLoadingText: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  statusTitle: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
  },
  proBadge: {
    marginLeft: spacing.sm,
  },
  statusDesc: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  statusDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  statusUsage: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    color: colors.ink,
  },
  statusWarning: {
    fontSize: fontSizes.sm,
    color: colors.brandRed,
    marginTop: spacing.sm,
  },
  statusErrorContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  statusError: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  statusErrorHint: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    textAlign: 'center',
    opacity: 0.7,
  },
  
  // 綠色介紹卡片
  introCard: {
    backgroundColor: colors.greenSoftBg,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  introIcon: {
    marginRight: spacing.sm,
  },
  introText: {
    flex: 1,
    fontSize: fontSizes.sm,
    color: colors.ink,
    lineHeight: 20,
  },
  introTextBold: {
    fontWeight: fontWeights.semibold,
  },
  
  // 權益對比表
  benefitsSection: {
    marginBottom: spacing.xl,
  },
  benefitsTitle: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  benefitsTable: {
    backgroundColor: colors.cardBg,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  benefitsHeaderRow: {
    flexDirection: 'row',
    backgroundColor: colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  benefitsHeaderCell: {
    flex: 1,
    padding: spacing.xs,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  benefitsHeaderText: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.textSecondary,
  },
  benefitsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  benefitsTitleCell: {
    flex: 1,
    padding: spacing.xs,
    paddingVertical: spacing.sm,
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
  benefitsTitleText: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.medium,
    color: colors.ink,
  },
  benefitsCell: {
    flex: 1,
    padding: spacing.xs,
    paddingVertical: spacing.sm,
    justifyContent: 'center',
  },
  benefitsProCell: {
    backgroundColor: colors.greenSoftBg,
  },
  benefitsCellText: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  benefitsProText: {
    color: colors.primary,
    fontWeight: fontWeights.medium,
  },
  benefitsCta: {
    fontSize: fontSizes.sm,
    color: colors.ink,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 20,
  },
  benefitsCtaBold: {
    fontWeight: fontWeights.semibold,
  },
  
  // 訂閱計劃
  plans: {
    marginBottom: spacing.lg,
  },
  plansTitle: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  planCard: {
    position: 'relative',
    backgroundColor: colors.cardBg,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  planCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.greenSoftBg,
  },
  planBadge: {
    position: 'absolute',
    top: -8,
    right: spacing.md,
    backgroundColor: '#FFE5E5',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xs,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: colors.brandRed,
  },
  planBadgeText: {
    fontSize: fontSizes.xs - 1,
    fontWeight: fontWeights.semibold,
    color: colors.brandRed,
  },
  planContent: {
    flex: 1,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  planLabel: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
  },
  checkIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planPricing: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.xs,
  },
  planPrice: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.ink,
  },
  planPeriod: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
  },
  planPerMonth: {
    fontSize: fontSizes.xs - 1,
    color: colors.textSecondary,
  },
  
  // 已是會員的提示
  alreadyProCard: {
    backgroundColor: colors.greenSoftBg,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  alreadyProText: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  alreadyProExpiry: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  
  // 底部按鈕
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
  subscribeButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  subscribeButtonDisabled: {
    opacity: 0.6,
  },
  subscribeButtonText: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    color: '#FFFFFF',
  },
});


