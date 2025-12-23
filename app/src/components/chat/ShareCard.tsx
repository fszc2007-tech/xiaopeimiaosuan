/**
 * 分享卡片组件（用于生成分享图片）
 * 
 * 注意：此组件用于截图分享，实际渲染时会被隐藏
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSizes, fontWeights, spacing, radius } from '@/theme';

interface ShareCardProps {
  question?: string;
  answer: string;
}

export const ShareCard = React.forwardRef<View, ShareCardProps>(({ question, answer }, ref) => {
  return (
    <View ref={ref} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>與小佩聊天</Text>
      </View>
      
      {question && (
        <View style={styles.questionSection}>
          <Text style={styles.sectionLabel}>提問</Text>
          <Text style={styles.questionText}>{question}</Text>
        </View>
      )}
      
      <View style={styles.answerSection}>
        <Text style={styles.sectionLabel}>小佩回答</Text>
        <Text style={styles.answerText}>{answer}</Text>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>小佩妙算</Text>
      </View>
    </View>
  );
});

ShareCard.displayName = 'ShareCard';

const styles = StyleSheet.create({
  container: {
    width: 320,
    padding: spacing.lg,
    backgroundColor: colors.cardBg,
    borderRadius: radius.lg,
  },
  header: {
    marginBottom: spacing.md,
  },
  headerTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.ink,
  },
  questionSection: {
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  questionText: {
    fontSize: fontSizes.md,
    color: colors.ink,
    lineHeight: 22,
  },
  answerSection: {
    marginBottom: spacing.md,
  },
  answerText: {
    fontSize: fontSizes.md,
    color: colors.ink,
    lineHeight: 22,
    marginTop: spacing.xs,
  },
  footer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});


