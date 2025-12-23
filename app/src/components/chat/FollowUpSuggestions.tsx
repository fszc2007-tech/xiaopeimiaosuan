/**
 * 追问建议组件
 * 
 * 功能：
 * - 显示 AI 回复后的追问建议（Chip 样式）
 * - 点击追问建议 = 发送该消息
 * - 流畅的淡入动画
 * 
 * 数据来源：message.followUps (string[])
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { MessageCircle } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { colors, fontSizes, fontWeights, spacing, radius } from '@/theme';

// ===== 类型定义 =====
interface FollowUpSuggestionsProps {
  suggestions: string[];
  onSuggestionPress: (suggestion: string) => void;
  delay?: number;
}

// ===== 主组件 =====
export const FollowUpSuggestions: React.FC<FollowUpSuggestionsProps> = ({
  suggestions,
  onSuggestionPress,
  delay = 500,
}) => {
  const { t } = useTranslation();

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* 标题 */}
      <View style={styles.header}>
        <MessageCircle color={colors.textSecondary} size={14} />
        <Text style={styles.headerText}>{t('followUp.title')}</Text>
      </View>

      {/* 建议列表 */}
      <View style={styles.suggestionsContainer}>
        {suggestions.map((suggestion, index) => (
          <SuggestionChip
            key={index}
            suggestion={suggestion}
            onPress={() => onSuggestionPress(suggestion)}
            delay={delay + index * 100} // 错开延迟
          />
        ))}
      </View>
    </View>
  );
};

// ===== 单个建议 Chip =====
interface SuggestionChipProps {
  suggestion: string;
  onPress: () => void;
  delay: number;
}

const SuggestionChip: React.FC<SuggestionChipProps> = ({
  suggestion,
  onPress,
  delay,
}) => {
  // 动画值
  const opacityAnim = useSharedValue(0);
  const scaleAnim = useSharedValue(0.8);

  // 启动动画
  useEffect(() => {
    opacityAnim.value = withDelay(
      delay,
      withSpring(1, {
        damping: 20,
      })
    );

    scaleAnim.value = withDelay(
      delay,
      withSpring(1, {
        damping: 15,
        stiffness: 100,
      })
    );
  }, [delay]);

  // 动画样式
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacityAnim.value,
      transform: [
        {
          scale: scaleAnim.value,
        },
      ],
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        style={({ pressed }) => [
          styles.chip,
          pressed && styles.chipPressed,
        ]}
        onPress={onPress}
      >
        <Text style={styles.chipText} numberOfLines={2}>
          {suggestion}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

// ===== 样式 =====
const styles = StyleSheet.create({
  container: {
    marginTop: spacing.sm,
    marginLeft: 44, // 对齐 AI 消息气泡（头像宽度 + 间距）
  },

  // 标题区
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.xs,
  },
  headerText: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
  },

  // 建议列表
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },

  // Chip 样式
  chip: {
    backgroundColor: colors.blueSoftBg,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary + '30', // 30% 透明度
    maxWidth: '90%',
  },
  chipPressed: {
    backgroundColor: colors.primary + '20',
    opacity: 0.8,
  },
  chipText: {
    fontSize: fontSizes.sm,
    color: colors.primary,
    fontWeight: fontWeights.medium,
    lineHeight: 18,
  },
});

