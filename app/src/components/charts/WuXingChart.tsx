/**
 * 五行分布图表组件（横向条形图）
 * 
 * 重新设计 - 专业版本
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, fontSizes, fontWeights, spacing } from '@/theme';
import { WUXING_COLORS } from '@/constants/wuxing';

// ===== 类型定义 =====
export interface WuXingData {
  '木': number;
  '火': number;
  '土': number;
  '金': number;
  '水': number;
}

interface WuXingChartProps {
  data: WuXingData;
  height?: number;
  onElementPress?: (element: string) => void;
  onReadPress?: () => void; // 点击"小佩解读"的回调
}

// ===== 五行配置（使用统一配色）=====
const WUXING_CONFIG = [
  { 
    key: '木', 
    label: '木', 
    color: WUXING_COLORS['木'].main,
    bgColor: WUXING_COLORS['木'].light,
  },
  { 
    key: '火', 
    label: '火', 
    color: WUXING_COLORS['火'].main,
    bgColor: WUXING_COLORS['火'].light,
  },
  { 
    key: '土', 
    label: '土', 
    color: WUXING_COLORS['土'].main,
    bgColor: WUXING_COLORS['土'].light,
  },
  { 
    key: '金', 
    label: '金', 
    color: WUXING_COLORS['金'].main,
    bgColor: WUXING_COLORS['金'].light,
  },
  { 
    key: '水', 
    label: '水', 
    color: WUXING_COLORS['水'].main,
    bgColor: WUXING_COLORS['水'].light,
  },
];

// ===== 主组件 =====
export const WuXingChart: React.FC<WuXingChartProps> = ({
  data,
  onReadPress,
}) => {
  return (
    <View style={styles.container}>
      {/* 标题 */}
      <View style={styles.header}>
        <Text style={styles.title}>五行分佈</Text>
        {onReadPress && (
          <TouchableOpacity onPress={onReadPress} activeOpacity={0.6}>
            <Text style={styles.readButton}>小佩解讀 →</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 图表区域 */}
      <View style={styles.chartContainer}>
        {WUXING_CONFIG.map((config, index) => {
          const percentage = data[config.key as keyof WuXingData] || 0;
          return (
            <WuXingBar
              key={config.key}
              label={config.label}
              percentage={percentage}
              color={config.color}
              bgColor={config.bgColor}
            />
          );
        })}
      </View>

      {/* 图例说明 */}
      <View style={styles.legend}>
        <Text style={styles.legendIcon}>💡</Text>
        <Text style={styles.legendText}>百分比為綜合計算結果，總和為 100%</Text>
      </View>
    </View>
  );
};

// ===== 单个条形组件 =====
interface WuXingBarProps {
  label: string;
  percentage: number;
  color: string;
  bgColor: string;
}

const WuXingBar: React.FC<WuXingBarProps> = ({
  label,
  percentage,
  color,
  bgColor,
}) => {
  return (
    <View style={styles.barRow}>
      {/* 标签 */}
      <Text style={[styles.label, { color }]}>{label}</Text>

      {/* 进度条（使用统一的浅绿色背景） */}
      <View style={styles.barTrack}>
        <View
          style={[
            styles.barFill,
            { backgroundColor: color, width: `${percentage}%` },
          ]}
        />
      </View>

      {/* 百分比 */}
      <Text style={[styles.percentage, { color }]}>
        {percentage}%
      </Text>
    </View>
  );
};

// ===== 样式 =====
const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
  },

  // 标题
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.bold,
    color: colors.ink,
    lineHeight: 22,
  },
  readButton: {
    fontSize: fontSizes.sm,
    color: colors.primary,
    fontWeight: fontWeights.medium,
  },
  subtitle: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },

  // 图表容器
  chartContainer: {
    gap: 8,
    marginBottom: spacing.md,
  },

  // 单行
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 40,
  },

  // 标签
  label: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    width: 36,
    textAlign: 'left',
    lineHeight: 24,
  },

  // 进度条轨道（统一浅绿色背景，与含藏干统计一致）
  barTrack: {
    flex: 1,
    height: 24,
    backgroundColor: colors.greenSoftBg, // 统一浅绿色轨道
    borderRadius: 999,
    marginHorizontal: 10,
    overflow: 'hidden',
  },

  // 进度条填充
  barFill: {
    height: '100%',
    borderRadius: 999,
  },

  // 百分比
  percentage: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.bold,
    width: 50,
    textAlign: 'right',
    lineHeight: 24,
  },

  // 图例
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: spacing.sm,
    minHeight: 32,
  },
  legendIcon: {
    fontSize: fontSizes.sm,
    lineHeight: 20,
  },
  legendText: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});

