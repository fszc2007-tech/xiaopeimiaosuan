/**
 * 订阅管理卡组件
 * 
 * 功能：
 * - 显示当前订阅方案和价格
 * - 显示下一次扣款日期
 * - 显示扣款平台
 * - 提供管理订阅按钮
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Settings } from 'lucide-react-native';
import { colors, fontSizes, fontWeights, spacing, radius } from '@/theme';
import { getPriceLabel, formatDate } from '../utils/membershipState';

interface ManagementCardProps {
  plan: 'monthly' | 'quarterly' | 'yearly';
  expiresAt: string;
  onManageSubscription: () => void;
}

export const ManagementCard: React.FC<ManagementCardProps> = ({
  plan,
  expiresAt,
  onManageSubscription,
}) => {
  // 获取方案名称
  const getPlanName = () => {
    switch (plan) {
      case 'monthly':
        return '月付方案';
      case 'quarterly':
        return '季付方案';
      case 'yearly':
        return '年付方案';
      default:
        return '';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* 标题 */}
        <Text style={styles.title}>訂閱管理</Text>

        {/* 当前方案 */}
        <View style={styles.infoRow}>
          <Text style={styles.label}>當前方案</Text>
          <Text style={styles.value}>
            目前為 {getPlanName()} · {getPriceLabel(plan)}
          </Text>
        </View>

        {/* 下一次扣款 */}
        <View style={styles.infoRow}>
          <Text style={styles.label}>下一次扣款日</Text>
          <Text style={styles.value}>{formatDate(expiresAt)}</Text>
        </View>

        {/* 扣款平台 */}
        <View style={styles.infoRow}>
          <Text style={styles.label}>扣款平台</Text>
          <Text style={styles.value}>由 App Store 代扣款</Text>
        </View>

        {/* 小字提示 */}
        <Text style={styles.hint}>
          若想調整或取消續訂，請在 App Store 的訂閱管理中操作。
        </Text>

        {/* 按钮 */}
        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={onManageSubscription}
        >
          <Settings size={18} color={colors.white} />
          <Text style={styles.buttonText}>管理訂閱</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
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
  title: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  label: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    flex: 0,
    minWidth: 100,
  },
  value: {
    fontSize: fontSizes.md,
    color: colors.text,
    fontWeight: fontWeights.medium,
    flex: 1,
    textAlign: 'right',
  },
  hint: {
    fontSize: fontSizes.sm,
    color: colors.textTertiary,
    lineHeight: 20,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    gap: spacing.xs,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
    color: colors.white,
  },
});

