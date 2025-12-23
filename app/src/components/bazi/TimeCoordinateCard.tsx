/**
 * 時間坐標卡片組件
 * 
 * 顯示當前大運、流年、流月信息，並提供「一鍵問今年」入口
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/navigation';
import { colors, fontSizes, fontWeights, spacing, radius } from '@/theme';
import { normalizeToZhHK } from '@/utils/normalizeText';
import { useTranslation } from 'react-i18next';
import { toTraditionalShishen } from '@/utils/shishenMapping';

/**
 * 时间坐标 ViewModel（前端组件使用）
 */
export type TimeCoordinateVM = {
  currentDaYun: {
    stemBranch: string;
    tenGod: string;
    ageRange: [number, number];
    startYear?: number;
    endYear?: number;
    phaseText: string;     // 给用户看的（'加速期' | '调整期' | '平稳期'）
    phaseTag?: 'accelerate' | 'adjust' | 'stable';  // 用于逻辑判断和颜色映射
    favourLevel?: 'good' | 'neutral' | 'tense';    // 用于配色
  };
  currentLiuNian?: {
    stemBranch: string;
    year: number;
    tenGod: string;
    shortTag?: string;
    riskTag?: string;
  };
  currentLiuYue?: {
    stemBranch: string;
    year: number;
    monthIndex?: number;
    tenGod: string;
    shortTip?: string;
  };
};

interface TimeCoordinateCardProps {
  timeCoordinate: TimeCoordinateVM | null;  // ✅ 使用 ViewModel 类型
  loading?: boolean;
  chartId: string;
  chartProfileId: string;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const TimeCoordinateCard: React.FC<TimeCoordinateCardProps> = ({ 
  timeCoordinate, 
  loading = false,
  chartId,
  chartProfileId,
}) => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  
  // Loading 状态：显示骨架屏
  if (loading) {
    return <TimeCoordinateCardSkeleton />;
  }
  
  // 数据缺失：整卡隐藏
  if (!timeCoordinate || !timeCoordinate.currentDaYun) {
    return null;
  }
  
  const { currentDaYun, currentLiuNian, currentLiuYue } = timeCoordinate;
  
  // 处理 CTA 按钮点击（参数规范）
  // ✅ 统一命名：前端导航参数使用 question，后端 API 使用 message
  const handlePressYearChat = () => {
    navigation.navigate('Chat', {
      conversationId: 'new',
      question: '小佩，幫我講講我今年整體的行運節奏和機會風險。',  // ✅ 前端導航參數（ChatScreen 讀取 question）
      source: 'time_coordinate_card',
      sectionKey: 'year_rhythm',
      masterId: chartProfileId,
    });
  };
  
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t('timeCoordinate.title')}</Text>
      
      {/* 當前大運（必需，一定顯示） */}
      <TimeRow
        label={t('timeCoordinate.currentDaYun')}
        main={`${currentDaYun.stemBranch} · ${toTraditionalShishen(currentDaYun.tenGod)}`}
        sub={`（${currentDaYun.ageRange[0]}–${currentDaYun.ageRange[1]}${t('timeCoordinate.ageUnit')}）`}
        tag={normalizeToZhHK(currentDaYun.phaseText)}
        tagColor={getPhaseTagColor(currentDaYun.phaseTag)}
      />
      
      {/* 當前流年（可選，缺失時不顯示） */}
      {currentLiuNian && (
        <TimeRow
          label={t('timeCoordinate.currentFlowYear')}
          main={`${currentLiuNian.stemBranch}（${currentLiuNian.year}） · ${toTraditionalShishen(currentLiuNian.tenGod)}`}
          tag={normalizeToZhHK(currentLiuNian.shortTag || '數據生成中')}
        />
      )}
      
      {/* 當前流月（可選，缺失時不顯示） */}
      {currentLiuYue && (
        <TimeRow
          label={t('timeCoordinate.currentFlowMonth')}
          main={`${currentLiuYue.stemBranch} · ${toTraditionalShishen(currentLiuYue.tenGod)}`}
          tag={normalizeToZhHK(currentLiuYue.shortTip || '數據生成中')}
        />
      )}
      
      {/* CTA 按钮 */}
      <TouchableOpacity
        style={styles.ctaButton}
        onPress={handlePressYearChat}
        activeOpacity={0.7}
      >
        <Text style={styles.ctaText}>{t('timeCoordinate.ctaButton')}</Text>
      </TouchableOpacity>
    </View>
  );
};

/**
 * 骨架屏组件（Loading 状态）
 */
const TimeCoordinateCardSkeleton: React.FC = () => {
  return (
    <View style={styles.card}>
      <View style={styles.skeletonTitle} />
      <View style={styles.skeletonRow} />
      <View style={styles.skeletonRow} />
      <View style={styles.skeletonRow} />
      <View style={styles.skeletonButton} />
    </View>
  );
};

/**
 * 时间行组件
 */
interface TimeRowProps {
  label: string;
  main: string;
  sub?: string;
  tag?: string;
  tagColor?: string;
}

const TimeRow: React.FC<TimeRowProps> = ({ label, main, sub, tag, tagColor }) => {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowMain}>
        <Text style={styles.rowMainText}>
          {main}
          {sub && <Text style={styles.rowSubText}>{sub}</Text>}
        </Text>
      </View>
      {tag && (
        <View style={[styles.tag, tagColor && { backgroundColor: tagColor + '20' }]}>
          <Text style={[styles.tagText, tagColor && { color: tagColor }]}>
            {tag}
          </Text>
        </View>
      )}
    </View>
  );
};

/**
 * 根据 phaseTag 返回颜色
 */
function getPhaseTagColor(phaseTag?: string): string | undefined {
  switch (phaseTag) {
    case 'accelerate':
      return colors.primary;  // 加速期 → 主绿色
    case 'adjust':
      return colors.brandOrange; // 调整期 → 橙色
    case 'stable':
      return colors.textSecondary; // 平稳期 → 中性灰
    default:
      return undefined;
  }
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    marginBottom: spacing.md,
    // 与 ChartOverviewTab 中其他卡片样式保持一致
    marginHorizontal: 0, // 全宽显示
  },
  title: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.ink,
    marginBottom: spacing.md,
    // 与 ChartOverviewTab 中 cardTitle 样式保持一致
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  rowLabel: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    minWidth: 80,
  },
  rowMain: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  rowMainText: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
  },
  rowSubText: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  tag: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.xs,
    backgroundColor: colors.border,
  },
  tagText: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
  },
  ctaButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    color: '#ffffff',
  },
  // 骨架屏样式
  skeletonTitle: {
    height: 20,
    width: 120,
    backgroundColor: colors.border,
    borderRadius: radius.xs,
    marginBottom: spacing.md,
  },
  skeletonRow: {
    height: 16,
    backgroundColor: colors.border,
    borderRadius: radius.xs,
    marginBottom: spacing.sm,
  },
  skeletonButton: {
    height: 40,
    backgroundColor: colors.border,
    borderRadius: radius.md,
    marginTop: spacing.md,
  },
});

