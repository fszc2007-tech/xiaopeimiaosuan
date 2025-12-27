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
      {/* 标题 - 使用与神煞解读一致的样式 */}
      <Text style={styles.sectionTitle}>{t('shensha.recommendedQuestionsTitle')}</Text>

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
        <Text 
          style={styles.chipText} 
          numberOfLines={1}
          ellipsizeMode="tail"
        >
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
    marginLeft: 0, // 完全靠左对齐
  },

  // 标题 - 使用与神煞解读一致的样式
  sectionTitle: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
    marginBottom: spacing.md,
    lineHeight: 20,
  },

  // 建议列表 - 垂直排列，靠左对齐（与神煞解读一致）
  suggestionsContainer: {
    flexDirection: 'column',
    flexWrap: 'nowrap',
    gap: spacing.sm, // 与神煞解读一致：8px
    marginTop: 0,
  },

  // Chip 样式 - 使用与神煞解读一致的样式
  chip: {
    paddingHorizontal: spacing.md, // 与神煞解读一致：12px
    paddingVertical: spacing.sm, // 与神煞解读一致：8px
    borderRadius: radius.md, // 与神煞解读一致：圆角矩形
    backgroundColor: colors.blueSoftBg, // 与神煞解读一致：浅蓝背景
    alignSelf: 'flex-start', // 靠左对齐，宽度自适应内容
    borderWidth: 0, // 无边框（与神煞解读一致）
  },
  chipPressed: {
    backgroundColor: colors.primary + '20',
    opacity: 0.8,
  },
  chipText: {
    fontSize: fontSizes.sm, // 与神煞解读一致：14px
    color: colors.ink, // 与神煞解读一致：主文字颜色
    lineHeight: 20, // 与神煞解读一致：20px
    fontWeight: fontWeights.regular, // 普通字重（与神煞解读一致）
  },
});

