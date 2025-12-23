/**
 * 使用情况卡组件
 * 
 * 功能：
 * - 显示今日 AI 使用次数
 * - 显示进度条
 * - 提供跳转到提问的按钮
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MessageCircle } from 'lucide-react-native';
import { colors, fontSizes, fontWeights, spacing, radius } from '@/theme';

interface UsageCardProps {
  aiCallsToday: number;
  aiDailyLimit: number;
  onAskQuestion: () => void;
}

export const UsageCard: React.FC<UsageCardProps> = ({
  aiCallsToday,
  aiDailyLimit,
  onAskQuestion,
}) => {
  // 计算进度百分比（处理边界情况）
  const progress = Math.min(1, aiCallsToday / aiDailyLimit);
  const progressPercent = Math.round(progress * 100);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* 标题 */}
        <Text style={styles.title}>今日使用情況</Text>

        {/* 使用次数 */}
        <Text style={styles.usage}>
          今日已使用 <Text style={styles.usageHighlight}>{aiCallsToday}</Text> /{' '}
          {aiDailyLimit} 次 AI 解讀
        </Text>

        {/* 进度条 */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${progressPercent}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>{progressPercent}%</Text>
        </View>

        {/* 小字提示 */}
        <Text style={styles.resetText}>每日 00:00 自動重置</Text>

        {/* 鼓励文案 */}
        <Text style={styles.encouragement}>問得越多，小佩越懂你。</Text>

        {/* 按钮 */}
        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={onAskQuestion}
        >
          <MessageCircle size={18} color={colors.white} />
          <Text style={styles.buttonText}>去問小佩</Text>
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
  usage: {
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  usageHighlight: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.primary,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.border,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
  },
  progressText: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    color: colors.textSecondary,
    minWidth: 40,
    textAlign: 'right',
  },
  resetText: {
    fontSize: fontSizes.xs,
    color: colors.textTertiary,
    marginBottom: spacing.sm,
  },
  encouragement: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    fontStyle: 'italic',
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

