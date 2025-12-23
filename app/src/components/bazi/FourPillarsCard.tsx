/**
 * 四柱卡片组件（喜忌用神版本）
 * 
 * 显示四柱天干地支，并根据身强身弱显示箭头趋势
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSizes, fontWeights, spacing, radius } from '@/theme';
import {
  WUXING_COLORS,
  getStemWuxing,
  getBranchWuxing,
  getPillarTrend,
} from '@/constants/wuxing';

interface Pillar {
  stem: string;
  branch: string;
}

interface FourPillarsCardProps {
  pillars: {
    year: Pillar;
    month: Pillar;
    day: Pillar;
    hour: Pillar;
  };
  dayMasterWuxing: string;
  strengthLabel: string;
}

export const FourPillarsCard: React.FC<FourPillarsCardProps> = ({
  pillars,
  dayMasterWuxing,
  strengthLabel,
}) => {
  const pillarKeys: Array<'year' | 'month' | 'day' | 'hour'> = ['year', 'month', 'day', 'hour'];
  const pillarLabels = ['年柱', '月柱', '日柱', '時柱'];

  // 安全检查：确保pillars存在
  if (!pillars || !pillars.year || !pillars.month || !pillars.day || !pillars.hour) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* 四柱标签行 */}
      <View style={styles.headerRow}>
        {pillarLabels.map((label, index) => (
          <View 
            key={label} 
            style={[
              styles.headerCell,
              index < pillarLabels.length - 1 && styles.headerCellBorder
            ]}
          >
            <Text style={styles.headerLabel}>{label}</Text>
          </View>
        ))}
      </View>

      {/* 四柱内容行 */}
      <View style={styles.contentRow}>
        {pillarKeys.map((key, index) => {
          const pillar = pillars[key];
          const stemWuxing = getStemWuxing(pillar.stem);
          const branchWuxing = getBranchWuxing(pillar.branch);
          
          const stemColor = WUXING_COLORS[stemWuxing as keyof typeof WUXING_COLORS];
          const branchColor = WUXING_COLORS[branchWuxing as keyof typeof WUXING_COLORS];
          
          // 计算箭头趋势（日柱天干不显示箭头）
          const stemTrend = index === 2 
            ? 'none' 
            : getPillarTrend(pillar.stem, dayMasterWuxing, strengthLabel, true);
          const branchTrend = getPillarTrend(pillar.branch, dayMasterWuxing, strengthLabel, false);
          
          return (
            <View 
              key={key} 
              style={[
                styles.pillarCell,
                index < pillarKeys.length - 1 && styles.pillarCellBorder
              ]}
            >
              {/* 天干行 */}
              <View style={styles.charRow}>
                <Text style={[styles.charLarge, { color: stemColor.main }]}>
                  {pillar.stem}
                </Text>
                {stemTrend !== 'none' && (
                  <Text style={[
                    styles.arrow,
                    stemTrend === 'up' ? styles.arrowUp : styles.arrowDown
                  ]}>
                    {stemTrend === 'up' ? '↑' : '↓'}
                  </Text>
                )}
              </View>
              
              {/* 地支行 */}
              <View style={styles.charRow}>
                <Text style={[styles.charSmall, { color: branchColor.main }]}>
                  {pillar.branch}
                </Text>
                {branchTrend !== 'none' && (
                  <Text style={[
                    styles.arrow,
                    branchTrend === 'up' ? styles.arrowUp : styles.arrowDown
                  ]}>
                    {branchTrend === 'up' ? '↑' : '↓'}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.brandGreen, // 系统统一绿色 #52b788
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  
  // 标签行
  headerRow: {
    flexDirection: 'row',
    backgroundColor: colors.brandGreen, // 系统统一绿色 #52b788
  },
  headerCell: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCellBorder: {
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.3)', // 白色半透明分隔线
  },
  headerLabel: {
    fontSize: 14,
    fontWeight: fontWeights.medium,
    color: '#ffffff', // 白色文字
  },
  
  // 内容行
  contentRow: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
  },
  pillarCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  pillarCellBorder: {
    borderRightWidth: 1,
    borderRightColor: colors.greenSoftBg, // 浅绿色分隔线
  },
  
  // 字符行
  charRow: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,  // 增加高度以适应更大的字体
    position: 'relative',  // ✅ 为绝对定位的箭头提供定位上下文
  },
  charLarge: {
    fontSize: 32,  // 天干：与含藏干统计保持一致
    fontWeight: fontWeights.bold,
    textAlign: 'center',
  },
  charSmall: {
    fontSize: 24,  // 地支：与含藏干统计保持一致
    fontWeight: fontWeights.semibold,
    textAlign: 'center',
  },
  
  // 箭头：使用绝对定位，不占用布局空间
  arrow: {
    position: 'absolute',  // ✅ 绝对定位
    right: -28,            // ✅ 位于文字右侧
    fontSize: 18,
    fontWeight: fontWeights.bold,
  },
  arrowUp: {
    color: '#10b981', // 绿色（喜用）
  },
  arrowDown: {
    color: '#ef4444', // 红色（忌神）
  },
});

