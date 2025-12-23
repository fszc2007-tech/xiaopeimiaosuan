/**
 * 顶部状态卡组件
 * 
 * 功能：
 * - 显示会员类型和到期时间
 * - 即将到期时显示警告提示
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Crown, AlertCircle } from 'lucide-react-native';
import { colors, fontSizes, fontWeights, spacing, radius } from '@/theme';
import { MembershipState } from '../utils/membershipState';
import { getPlanLabel, formatDate, getDaysUntilExpiry } from '../utils/membershipState';

interface StatusCardProps {
  membershipState: MembershipState;
  plan: 'monthly' | 'quarterly' | 'yearly' | null;
  expiresAt: string | null;
}

export const StatusCard: React.FC<StatusCardProps> = ({
  membershipState,
  plan,
  expiresAt,
}) => {
  // 获取标题
  const getTitle = () => {
    if (membershipState === 'pro_expiring') {
      return '小佩會員 · 即將到期';
    }
    return '小佩會員 · 使用中';
  };

  // 获取警告提示
  const getWarningMessage = () => {
    if (membershipState === 'pro_expiring' && expiresAt) {
      const days = getDaysUntilExpiry(expiresAt);
      return `⚠️ 距離本期到期還有 ${days} 天，別忘了留意訂閱狀態。`;
    }
    return null;
  };

  const warningMessage = getWarningMessage();

  return (
    <View style={styles.container}>
      {/* 即将到期警告 */}
      {warningMessage && (
        <View style={styles.warningBanner}>
          <AlertCircle size={16} color={colors.warning} />
          <Text style={styles.warningText}>{warningMessage}</Text>
        </View>
      )}

      {/* 主卡片 */}
      <View style={styles.card}>
        {/* 标题和标签 */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Crown size={24} color={colors.primary} />
            <Text style={styles.title}>{getTitle()}</Text>
          </View>
          {plan && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{getPlanLabel(plan)}</Text>
            </View>
          )}
        </View>

        {/* 主文案 */}
        <View style={styles.content}>
          <Text style={styles.mainText}>感謝你成為小佩會員。</Text>
          <Text style={styles.mainText}>之後小佩會陪你一起看懂自己的節奏。</Text>
        </View>

        {/* 到期时间 */}
        {expiresAt && (
          <Text style={styles.expiryText}>
            本期至 {formatDate(expiresAt)}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  warningText: {
    flex: 1,
    fontSize: fontSizes.sm,
    color: '#F57C00',
    lineHeight: 20,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  title: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.text,
  },
  badge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  badgeText: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.medium,
    color: colors.primary,
  },
  content: {
    marginBottom: spacing.md,
    gap: 4,
  },
  mainText: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  expiryText: {
    fontSize: fontSizes.sm,
    color: colors.textTertiary,
  },
});

