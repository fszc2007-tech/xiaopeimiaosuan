/**
 * 日主强弱评分条组件
 * 
 * 功能：
 * - 显示日主强弱评分（0.0 - 1.0）
 * - 渐变色进度条
 * - 分档标记（从弱/身弱/平衡/身强/从强）
 * - 流畅的动画效果
 * - 当前等级高亮
 * 
 * 数据来源：chart.analysis.dayMaster
 * 格式：{ score: 0.65, band: '身强', detail: {...} }
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
  interpolateColor,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { colors, fontSizes, fontWeights, spacing, radius } from '@/theme';
import { useTranslation } from 'react-i18next';
import { normalizeToZhHK } from '@/utils/normalizeText';

// ===== 类型定义 =====
export interface DayMasterStrength {
  score: number; // 0.0 - 1.0
  band: '从弱' | '身弱' | '身偏弱' | '平衡' | '身偏强' | '身强' | '从强';
  detail?: {
    season?: number;
    root?: number;
    help?: number;
    drain?: number;
    biPower?: number;      // 比劫力量
    printPower?: number;   // 印星力量
    helpPower?: number;    // 总帮扶力量
    drainPower?: number;   // 有效耗身力量
  };
}

interface DayMasterStrengthBarProps {
  data: DayMasterStrength;
  height?: number;
  showDetail?: boolean;
  onReadPress?: () => void; // 点击"小佩解读"的回调
}

// ===== 配置常量（绿色主题）=====
// 注意：这些标签会在组件内部通过 normalizeToZhHK 转换
// V3.0：增加身偏弱和身偏强（7档）
const BAND_CONFIG = [
  { position: 0, label: '從弱', color: colors.primary },       // 主绿色
  { position: 0.22, label: '身弱', color: colors.primary },    // 主绿色
  { position: 0.35, label: '身偏弱', color: colors.primary },  // 主绿色 - V3.0 新增
  { position: 0.5, label: '平衡', color: colors.primary },     // 主绿色
  { position: 0.62, label: '身偏強', color: colors.primary },  // 主绿色 - V3.0 新增
  { position: 0.75, label: '身強', color: colors.primary },    // 主绿色
  { position: 1.0, label: '從強', color: colors.primary },     // 主绿色
];

// 渐变色配置（绿色渐变）
const GRADIENT_COLORS = [
  { offset: '0%', color: '#95d5b2' },    // 浅绿
  { offset: '25%', color: '#74c69d' },   // 中浅绿
  { offset: '50%', color: '#52b788' },   // 主绿色
  { offset: '75%', color: '#40916c' },   // 深绿
  { offset: '100%', color: '#2d6a4f' },  // 更深绿
];

// ===== 主组件 =====
export const DayMasterStrengthBar: React.FC<DayMasterStrengthBarProps> = ({
  data,
  height = 80,
  showDetail = true,
  onReadPress,
}) => {
  const { t } = useTranslation();
  const { score, band, detail } = data;
  
  // 转换 band 为繁体（后端可能返回简体）
  const normalizedBand = normalizeToZhHK(band);

  // 动画值
  const progressAnim = useSharedValue(0);
  const opacityAnim = useSharedValue(0);

  // 直接显示，不需要动画
  useEffect(() => {
    progressAnim.value = score;
    opacityAnim.value = 1;
  }, [score]);

  // 动画样式
  const animatedIndicatorStyle = useAnimatedStyle(() => {
    return {
      left: `${progressAnim.value * 100}%`,
      opacity: opacityAnim.value,
    };
  });

  // 获取指示器的颜色
  const indicatorColor = getColorForScore(score);

  return (
    <View style={styles.container}>
      {/* 标题和当前等级 */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('charts.dayMasterStrength.title')}</Text>
        {onReadPress && (
          <TouchableOpacity onPress={onReadPress} activeOpacity={0.6}>
            <Text style={styles.readButton}>{t('chartDetail.overview.oneClickRead')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 渐变进度条 */}
      <View style={styles.barContainer}>
        {/* 背景渐变条 */}
        <View style={styles.barBackground}>
          <Svg width="100%" height="100%">
            <Defs>
              <LinearGradient id="strengthGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                {GRADIENT_COLORS.map((item, index) => (
                  <Stop key={index} offset={item.offset} stopColor={item.color} stopOpacity="0.3" />
                ))}
              </LinearGradient>
            </Defs>
            <Rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="url(#strengthGradient)"
              rx="12"
            />
          </Svg>
        </View>

        {/* 当前位置指示器 */}
        <Animated.View style={[styles.indicator, animatedIndicatorStyle]}>
          <View style={[styles.indicatorDot, { backgroundColor: colors.primary, borderColor: colors.primary }]} />
        </Animated.View>
      </View>

      {/* 分档标签 */}
      <View style={styles.labelsContainer}>
        {BAND_CONFIG.map((config, index) => (
          <View
            key={index}
            style={[
              styles.labelWrapper,
              { left: `${config.position * 100}%` },
            ]}
          >
            <Text
              style={[
                styles.label,
                normalizedBand === config.label && styles.labelActive,
                { color: colors.ink },
              ]}
            >
              {config.label}
            </Text>
          </View>
        ))}
      </View>

      {/* 详细分解（可选） */}
      {showDetail && detail && (
        <View style={styles.detailContainer}>
          <Text style={styles.detailTitle}>{t('charts.dayMasterStrength.breakdown')}：</Text>
          <View style={styles.detailRow}>
            {detail.season !== undefined && (
              <DetailItem label="得令" value={detail.season} />
            )}
            {detail.root !== undefined && (
              <DetailItem label="得地" value={detail.root} />
            )}
            {detail.help !== undefined && (
              <DetailItem label="得助" value={detail.help} />
            )}
            {detail.drain !== undefined && (
              <DetailItem label="耗身" value={detail.drain} color={colors.brandOrange} />
            )}
          </View>
        </View>
      )}
    </View>
  );
};

// ===== 详细项组件 =====
interface DetailItemProps {
  label: string;
  value: number;
  color?: string;
}

const DetailItem: React.FC<DetailItemProps> = ({ label, value, color = colors.primary }) => {
  return (
    <View style={styles.detailItem}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, { color }]}>
        {Math.round(value * 100)}%
      </Text>
    </View>
  );
};

// ===== 工具函数 =====
const getBandColor = (band: string): string => {
  const config = BAND_CONFIG.find((c) => c.label === band);
  return config?.color || colors.ink;
};

// 根据分数计算当前的颜色（线性插值）
const getColorForScore = (score: number): string => {
  // 确保分数在 0-1 之间
  const clampedScore = Math.max(0, Math.min(1, score));
  
  // 找到分数所在的区间
  let startColor = GRADIENT_COLORS[0].color;
  let endColor = GRADIENT_COLORS[1].color;
  let progress = clampedScore * 4; // 0-4 之间
  
  if (clampedScore <= 0.25) {
    startColor = GRADIENT_COLORS[0].color;
    endColor = GRADIENT_COLORS[1].color;
    progress = clampedScore / 0.25;
  } else if (clampedScore <= 0.5) {
    startColor = GRADIENT_COLORS[1].color;
    endColor = GRADIENT_COLORS[2].color;
    progress = (clampedScore - 0.25) / 0.25;
  } else if (clampedScore <= 0.75) {
    startColor = GRADIENT_COLORS[2].color;
    endColor = GRADIENT_COLORS[3].color;
    progress = (clampedScore - 0.5) / 0.25;
  } else {
    startColor = GRADIENT_COLORS[3].color;
    endColor = GRADIENT_COLORS[4].color;
    progress = (clampedScore - 0.75) / 0.25;
  }
  
  // 简单的颜色插值（实际使用时可能需要更精确的计算）
  // 这里暂时返回起始颜色，因为在 StyleSheet 中无法动态计算颜色插值
  // 但我们可以根据区间返回对应的颜色
  if (clampedScore < 0.125) return GRADIENT_COLORS[0].color;
  if (clampedScore < 0.375) return GRADIENT_COLORS[1].color;
  if (clampedScore < 0.625) return GRADIENT_COLORS[2].color;
  if (clampedScore < 0.875) return GRADIENT_COLORS[3].color;
  return GRADIENT_COLORS[4].color;
};

// ===== 样式 =====
const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
  },

  // 标题区
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
  },
  readButton: {
    fontSize: fontSizes.sm,
    color: colors.primary,
    fontWeight: fontWeights.medium,
  },

  // 进度条区
  barContainer: {
    height: 32,
    marginBottom: spacing.md,
    position: 'relative',
  },
  barBackground: {
    height: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },

  // 当前位置指示器（改进版 - 垂直居中）
  indicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    marginLeft: -12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },

  // 分档标签
  labelsContainer: {
    height: 28,
    position: 'relative',
  },
  labelWrapper: {
    position: 'absolute',
    alignItems: 'center',
    marginLeft: -30,
    width: 60,
  },
  label: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.medium,
    textAlign: 'center',
  },
  labelActive: {
    fontWeight: fontWeights.bold,
    fontSize: fontSizes.sm,
  },

  // 详细分解
  detailContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  detailTitle: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  detailItem: {
    backgroundColor: colors.disabledBg,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailLabel: {
    fontSize: fontSizes.xs,
    color: colors.ink,
  },
  detailValue: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold,
  },
});

