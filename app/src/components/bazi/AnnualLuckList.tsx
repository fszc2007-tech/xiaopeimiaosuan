/**
 * 未來十年流年列表組件（橫向卡片佈局）
 * 
 * 參考文檔：
 * - 大運時間軸卡片優化方案-最終版.md
 */

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, fontSizes, fontWeights, spacing, radius } from '@/theme';
import { normalizeToZhHK } from '@/utils/normalizeText';

// ===== 类型定义 =====
export interface AnnualLuckBrief {
  year: number;
  ganzhi: string;
  shishen: string;  // 十神（与系统其他部分保持一致）
  favourLevel: 'good' | 'mixed' | 'bad' | 'neutral';
  highlightTag: 'opportunity' | 'smooth' | 'stress' | 'trial' | 'adjust';
  scores?: {
    overall: number;  // 内部分数，用于排序和调参（不用于前端显示）
  };
  meta?: {
    luckIndex: number;
    inCurrentLuck: boolean;
    isCurrentYear: boolean;
  };
}

interface AnnualLuckListProps {
  data: AnnualLuckBrief[];
  onPressDetail: (year: number) => void;
  onPressAsk: (year: number, data: AnnualLuckBrief) => void;
}

// ===== 卡片尺寸 =====
// 统一与大运卡片的比例，但稍小一点以区分层级
const CARD_WIDTH = 150;
const CARD_HEIGHT = 200;

// ===== 主组件 =====
export const AnnualLuckList: React.FC<AnnualLuckListProps> = ({
  data,
  onPressDetail,
  onPressAsk,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  
  // 自動滾動到當前年份
  useEffect(() => {
    const currentIndex = data.findIndex(item => item.meta?.isCurrentYear);
    if (currentIndex >= 0 && scrollViewRef.current) {
      setTimeout(() => {
        const screenWidth = Dimensions.get('window').width;
        const cardWidth = CARD_WIDTH + spacing.sm;
        const scrollX = currentIndex * cardWidth - (screenWidth / 2) + (CARD_WIDTH / 2);
        scrollViewRef.current?.scrollTo({
          x: Math.max(0, scrollX),
          animated: true,
        });
      }, 300);
    }
  }, [data]);
  
  // 查找跨大运的位置
  const getDividerIndex = (index: number): boolean => {
    if (index === 0) return false;
    const prev = data[index - 1];
    const current = data[index];
    return prev.meta?.luckIndex !== current.meta?.luckIndex;
  };
  
  return (
    <ScrollView
      ref={scrollViewRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {data.map((item, index) => {
        const showDivider = getDividerIndex(index);
        
        return (
          <View key={item.year} style={styles.cardWrapper}>
            {showDivider && (
              <View style={styles.divider}>
                <Text style={styles.dividerText}>下一步大運</Text>
              </View>
            )}
            <YearCard
              data={item}
              onPressDetail={onPressDetail}
              onPressAsk={onPressAsk}
            />
          </View>
        );
      })}
    </ScrollView>
  );
};

// ===== 年份卡片组件 =====
interface YearCardProps {
  data: AnnualLuckBrief;
  onPressDetail: (year: number) => void;
  onPressAsk: (year: number, data: AnnualLuckBrief) => void;
}

const YearCard: React.FC<YearCardProps> = ({ data, onPressDetail, onPressAsk }) => {
  const { t } = useTranslation();
  const isCurrentYear = data.meta?.isCurrentYear || data.year === new Date().getFullYear();
  
  // 获取标签颜色（使用 theme 颜色，避免硬编码）
  const getTagColor = (favourLevel: string) => {
    switch (favourLevel) {
      case 'good':
        return colors.success;  // 成功色（深绿）
      case 'bad':
        return colors.brandOrange;  // 橙色
      case 'mixed':
        return colors.textSecondary;  // 灰色
      default:
        return colors.textSecondary;
    }
  };
  
  return (
    <Pressable
      style={[styles.card, isCurrentYear && styles.cardCurrent]}
      onPress={() => onPressDetail(data.year)}
    >
      {/* 當前年份標記 */}
      {isCurrentYear && (
        <View style={styles.currentBadge}>
          <Text style={styles.currentBadgeText}>今年</Text>
        </View>
      )}
      
      {/* 年份（大字） */}
      <Text style={styles.year}>{data.year}</Text>
      
      {/* 干支 */}
      <Text style={styles.ganzhi}>{data.ganzhi}</Text>
      
      {/* 十神 */}
      <Text style={styles.shishen}>{normalizeToZhHK(data.shishen)}</Text>
      
      {/* 标签 */}
      <View style={[styles.tag, { backgroundColor: getTagColor(data.favourLevel) + '20' }]}>
        <Text style={[styles.tagText, { color: getTagColor(data.favourLevel) }]}>
          {t(`annual.tag.${data.highlightTag}`)}
        </Text>
      </View>
      
      {/* 问这一年按钮 */}
      <View style={styles.askButtonContainer}>
        <Pressable
          style={styles.askButton}
          onPress={(e) => {
            e.stopPropagation();
            onPressAsk(data.year, data);
          }}
        >
          <Text style={styles.askText}>{t('annual.askYear')}</Text>
        </Pressable>
      </View>
    </Pressable>
  );
};

// ===== 样式 =====
const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing.sm,
    gap: spacing.sm,
  },
  cardWrapper: {
    position: 'relative',
  },
  divider: {
    position: 'absolute',
    left: -spacing.sm,
    top: CARD_HEIGHT / 2 - 10,
    zIndex: 10,
    backgroundColor: colors.cardBg,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dividerText: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    fontWeight: fontWeights.semibold,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: colors.cardBg,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'flex-start',
    position: 'relative',
    paddingTop: spacing.lg,
  },
  cardCurrent: {
    backgroundColor: colors.greenSoftBg,
    borderWidth: 2,
    borderColor: colors.success,  // 使用 theme 中的成功色（深绿）
  },
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
  year: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  ganzhi: {
    fontSize: fontSizes.xxl || 24,
    fontWeight: fontWeights.bold,
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  shishen: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    color: colors.brandGreen || colors.primary,
    marginBottom: spacing.sm,
  },
  tag: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    borderRadius: radius.sm,
    marginBottom: spacing.sm,
    minWidth: 80,
    alignItems: 'center',
  },
  tagText: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold,
  },
  askButtonContainer: {
    marginTop: 'auto',
    width: '100%',
  },
  askButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    width: '100%',
    alignItems: 'center',
  },
  askText: {
    fontSize: fontSizes.sm,  // 统一字体大小
    fontWeight: fontWeights.semibold,
    color: colors.cardBg,  // 使用 theme 白色
  },
});
