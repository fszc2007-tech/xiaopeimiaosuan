/**
 * 大運序列組件
 * 
 * 設計文檔：app.doc/features/基本信息設計文檔.md（大運流年部分）
 * 
 * 功能：
 * - 橫向滾動的大運卡片列表
 * - 展示干支、年齡區間、十神
 * - 高亮當前大運
 * - 可點擊卡片查看詳情/一鍵解讀
 * 
 * 數據來源：chart.fortune.luckCycle
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { colors, fontSizes, fontWeights, spacing, radius } from '@/theme';
import { normalizeToZhHK } from '@/utils/normalizeText';

// ===== 类型定义 =====
export interface LuckCycleData {
  id: string;                // 唯一 ID，如 "甲子-31"
  stemBranch: string;        // "甲子"
  shishen: string;           // 十神（如 "偏财"）
  startAge: number;          // 31
  endAge: number;            // 41（下一运起运虚岁，不包含）
  startYear: number;         // 比如 2025
  endYear: number;           // 比如 2035（下一运起运年，不包含）
  favourLevel: 'good' | 'wave' | 'flat';  // 顺 / 波动 / 平
  toneTag: string;           // 一行简评，例如 "整体偏顺"
  keywords: string[];        // 3–5 个关键词
  isCurrent: boolean;        // 是否当前大运
  // 向后兼容字段（可选）
  ganzhi?: string;           // 干支组合（兼容旧数据）
  stem?: string;             // 大运天干（兼容旧数据）
  branch?: string;           // 大运地支（兼容旧数据）
  ageRange?: string;         // 年龄区间字符串（兼容旧数据）
}

interface LuckCycleListProps {
  luckCycles: LuckCycleData[];
  startAge: number;              // 起运年龄
  onLuckPress?: (luck: LuckCycleData, index: number) => void;
}

// ===== 主组件 =====
export const LuckCycleList: React.FC<LuckCycleListProps> = ({
  luckCycles,
  startAge,
  onLuckPress,
}) => {
  const { t } = useTranslation();
  const scrollViewRef = useRef<ScrollView>(null);

  // 自動滾動到當前大運，並居中顯示
  useEffect(() => {
    const currentIndex = luckCycles.findIndex(luck => luck.isCurrent);
    if (currentIndex >= 0 && scrollViewRef.current) {
      // 延迟滚动，确保布局完成
      setTimeout(() => {
        const screenWidth = Dimensions.get('window').width;
        const cardWidth = CARD_WIDTH + spacing.sm;
        // 計算居中位置：當前卡片位置 - 屏幕寬度的一半 + 卡片寬度的一半
        const scrollX = currentIndex * cardWidth - (screenWidth / 2) + (CARD_WIDTH / 2);
        scrollViewRef.current?.scrollTo({
          x: Math.max(0, scrollX), // 确保不滚动到负值
          animated: true,
        });
      }, 300);
    }
  }, [luckCycles]);

  return (
    <View style={styles.container}>
      {/* 起运信息 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('charts.luckCycle.startAge')}</Text>
        <Text style={styles.headerValue}>{startAge} {t('charts.luckCycle.age')}</Text>
      </View>

      {/* 大运序列 */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {luckCycles.map((luck, index) => (
          <LuckCard
            key={index}
            luck={luck}
            index={index}
            onPress={() => onLuckPress?.(luck, index)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

// ===== 大运卡片组件 =====
interface LuckCardProps {
  luck: LuckCycleData;
  index: number;
  onPress: () => void;
}

// 颜色映射（使用 theme 颜色，避免硬编码）
const getFavourColor = (level?: 'good' | 'wave' | 'flat'): string => {
  switch (level) {
    case 'good':
      return colors.success;  // 成功色（深绿）
    case 'wave':
      return colors.brandOrange;  // 橙色
    case 'flat':
      return colors.textSecondary;  // 灰色
    default:
      return colors.textSecondary;
  }
};

const LuckCard: React.FC<LuckCardProps> = ({ luck, index, onPress }) => {
  const { t } = useTranslation();
  
  // 动画值
  const scaleAnim = useSharedValue(0.8);
  const opacityAnim = useSharedValue(0);
  
  // 根据 favourLevel 设置卡片颜色
  const favourColor = getFavourColor(luck.favourLevel);
  
  // 启动动画
  useEffect(() => {
    scaleAnim.value = withDelay(
      index * 80, // 错开延迟
      withSpring(1, {
        damping: 15,
        stiffness: 100,
      })
    );

    opacityAnim.value = withDelay(
      index * 80,
      withSpring(1, {
        damping: 20,
      })
    );
  }, [index]);

  // 动画样式
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleAnim.value }],
      opacity: opacityAnim.value,
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        style={({ pressed }) => [
          styles.card,
          // 只有當前大運顯示綠色邊框
          luck.isCurrent && styles.cardCurrent,
          pressed && styles.cardPressed,
        ]}
        onPress={onPress}
      >
        {/* 當前標記 */}
        {luck.isCurrent && (
          <View style={styles.currentBadge}>
            <Text style={styles.currentBadgeText}>{t('charts.luckCycle.current')}</Text>
          </View>
        )}

        {/* 干支（大字） */}
        <Text style={styles.ganzhi}>{luck.stemBranch || luck.ganzhi}</Text>

        {/* 十神 */}
        <Text style={styles.shishen}>{normalizeToZhHK(luck.shishen)}</Text>

        {/* 年龄区间 */}
        <View style={styles.ageRangeContainer}>
          <Text style={styles.ageRange}>
            {luck.ageRange || `${luck.startAge}–${luck.endAge}${t('charts.luckCycle.age')}`}
          </Text>
        </View>

        {/* 起止年份 */}
        {luck.startYear && luck.endYear && (
          <Text style={styles.yearRange}>
            {luck.startYear} – {luck.endYear}
          </Text>
        )}

        {/* 简评标签 */}
        {luck.toneTag && (
          <Text 
            style={[styles.toneTag, { color: getFavourColor(luck.favourLevel) }]}
            numberOfLines={2}
          >
            {normalizeToZhHK(luck.toneTag)}
          </Text>
        )}

        {/* 底部按钮 - 点击可弹出底部 Sheet 查看详情 */}
        <View style={styles.actionButtonContainer}>
          <Text 
            style={styles.actionButton}
            numberOfLines={1}
          >
            👉 {t('charts.luckCycle.interpret')}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
};

// ===== 样式 =====
const CARD_WIDTH = 160;
const CARD_HEIGHT = 220;

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },

  // 起运信息
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  headerTitle: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginRight: spacing.sm,
  },
  headerValue: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    color: colors.primary,
  },

  // 滚动容器
  scrollContent: {
    paddingHorizontal: spacing.sm,
    gap: spacing.sm,
  },

  // 大运卡片（默认无边框）
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: colors.cardBg,
    borderRadius: radius.lg,
    borderWidth: 0,  // 默认无边框
    borderColor: 'transparent',
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
    paddingTop: spacing.lg,
  },
  // 當前大運：綠色邊框
  cardCurrent: {
    backgroundColor: colors.greenSoftBg,
    borderWidth: 2,
    borderColor: colors.success,  // 使用 theme 中的成功色（深绿）
  },
  cardPressed: {
    opacity: 0.7,
  },

  // 当前标记
  currentBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  currentBadgeText: {
    fontSize: 10,
    color: colors.cardBg,  // 使用 theme 白色
    fontWeight: fontWeights.semibold,
  },

  // 干支
  ganzhi: {
    fontSize: fontSizes.xxl || 24,
    fontWeight: fontWeights.bold,
    color: colors.ink,
    marginBottom: spacing.xs,
  },

  // 十神
  shishen: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    color: colors.brandGreen,
    marginBottom: spacing.xs,
  },

  // 年龄区间
  ageRangeContainer: {
    backgroundColor: colors.disabledBg,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginTop: spacing.xs,
    width: '100%',
  },
  ageRange: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    fontWeight: fontWeights.medium,
    textAlign: 'center',
  },

  // 年份区间
  yearRange: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
    width: '100%',
  },
  
  // 简评标签
  toneTag: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    marginTop: spacing.sm,
    textAlign: 'center',
    paddingHorizontal: spacing.xs,
    width: '100%',
    flexWrap: 'wrap',
  },
  
  // 底部按钮容器
  actionButtonContainer: {
    marginTop: 'auto',
    width: '100%',
  },
  // 底部按钮（统一为带背景的按钮样式，与流年卡片一致）
  actionButton: {
    fontSize: fontSizes.sm,
    color: colors.cardBg,  // 白色文字
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,  // 主绿色背景
    textAlign: 'center',
    width: '100%',
    fontWeight: fontWeights.semibold,
  },
});

