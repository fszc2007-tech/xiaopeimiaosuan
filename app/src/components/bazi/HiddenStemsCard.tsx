/**
 * 含藏干统计卡片
 * 
 * 显示：
 * 1. 四柱表格（年月日时 + 天干地支 + 藏干）
 * 2. 五行统计条形图
 * 
 * 数据来源：result.pillars + result.analysis.hiddenStems
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { colors, fontSizes, fontWeights, spacing, radius } from '@/theme';
import { WUXING_COLORS, STEM_WUXING_MAP } from '@/constants/wuxing';
import type { BaziChartDto } from '@/types';

interface HiddenStemsCardProps {
  pillars: BaziChartDto['result']['pillars'];
  hiddenStems: Record<string, number>;
}

export const HiddenStemsCard: React.FC<HiddenStemsCardProps> = ({
  pillars,
  hiddenStems,
}) => {
  const pillarKeys: Array<'year' | 'month' | 'day' | 'hour'> = ['year', 'month', 'day', 'hour'];
  const pillarLabels = ['年柱', '月柱', '日柱', '時柱'];

  // 统计五行分布
  const wuxingStats = useMemo(() => {
    const stats: Record<string, number> = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
    
    Object.entries(hiddenStems).forEach(([stem, count]) => {
      const wuxing = STEM_WUXING_MAP[stem];
      if (wuxing) {
        stats[wuxing] += count;
      }
    });
    
    return stats;
  }, [hiddenStems]);

  // 计算最大值（满格基准）
  const maxCount = Math.max(...Object.values(wuxingStats), 1); // 至少为 1，避免除以 0

  return (
    <View style={styles.container}>
      <Text style={styles.title}>含藏干統計</Text>

      {/* 四柱表格 */}
      <View style={styles.tableCard}>
        {/* 表头 */}
        <View style={styles.tableHeader}>
          {pillarLabels.map((label, index) => (
            <View 
              key={label} 
              style={[
                styles.headerCell,
                index < pillarLabels.length - 1 && styles.headerCellBorder
              ]}
            >
              <Text style={styles.headerText}>{label}</Text>
            </View>
          ))}
        </View>

        {/* 表体 */}
        <View style={styles.tableBody}>
          {pillarKeys.map((key, index) => {
            const pillar = pillars[key];
            const stemWuxing = STEM_WUXING_MAP[pillar?.stem || ''] || '水';
            const stemColor = WUXING_COLORS[stemWuxing];

            return (
              <View 
                key={key} 
                style={[
                  styles.pillarColumn,
                  index < pillarKeys.length - 1 && styles.pillarColumnBorder
                ]}
              >
                {/* 天干地支 */}
                <View style={styles.mainStemBranch}>
                  <Text style={[styles.stemText, { color: stemColor.main }]}>
                    {pillar?.stem || '-'}
                  </Text>
                  <Text style={styles.branchText}>
                    {pillar?.branch || '-'}
                  </Text>
                </View>

                {/* 藏干 */}
                <View style={styles.hiddenStems}>
                  {(pillar?.canggan || []).map((stem, idx) => {
                    const wuxing = STEM_WUXING_MAP[stem] || '水';
                    const color = WUXING_COLORS[wuxing];
                    return (
                      <Text 
                        key={idx} 
                        style={[styles.hiddenStemText, { color: color.main }]}
                      >
                        {stem}
                      </Text>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* 五行统计条形图 */}
      <View style={styles.barsContainer}>
        {['木', '火', '土', '金', '水'].map((wuxing) => {
          const count = wuxingStats[wuxing] || 0;
          
          // 计算比例：该五行数量 / 最大值
          const ratio = count / maxCount;
          
          // 美化：最少 15%，最多 95%
          const finalRatio = Math.max(Math.min(ratio, 0.95), count > 0 ? 0.15 : 0);
          const percent = finalRatio * 100;
          
          const color = WUXING_COLORS[wuxing];

          return (
            <View key={wuxing} style={styles.barRow}>
              <Text style={[styles.barLabel, { color: color.main }]}>
                {wuxing}
              </Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${percent}%`,
                      backgroundColor: color.main,
                    },
                  ]}
                />
              </View>
              <Text style={styles.barText}>{count}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  
  title: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
    marginBottom: spacing.md,
  },

  // 表格卡片
  tableCard: {
    backgroundColor: colors.cardBg,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.brandGreen, // 绿色边框
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  // 表头
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: colors.brandGreen, // 绿色表头
  },
  headerCell: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  headerCellBorder: {
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerText: {
    fontSize: 14,
    fontWeight: fontWeights.medium,
    color: '#ffffff',
  },

  // 表体
  tableBody: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
  },
  pillarColumn: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
  },
  pillarColumnBorder: {
    borderRightWidth: 1,
    borderRightColor: colors.greenSoftBg, // 浅绿色分隔线
  },

  // 天干地支
  mainStemBranch: {
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  stemText: {
    fontSize: 32,
    fontWeight: fontWeights.bold,
    lineHeight: 36,
  },
  branchText: {
    fontSize: 24,
    fontWeight: fontWeights.semibold,
    color: '#8c6a43',
    marginTop: 2,
  },

  // 藏干
  hiddenStems: {
    alignItems: 'center',
    gap: 2,
  },
  hiddenStemText: {
    fontSize: 14,
    fontWeight: fontWeights.medium,
    lineHeight: 18,
  },

  // 条形图
  barsContainer: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  barLabel: {
    width: 24,
    fontSize: 16,
    fontWeight: fontWeights.semibold,
  },
  barTrack: {
    flex: 1,
    height: 24,
    backgroundColor: colors.greenSoftBg, // 浅绿色轨道
    borderRadius: 999,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 999,
  },
  barText: {
    width: 48,
    fontSize: 14,
    fontWeight: fontWeights.medium,
    color: '#444',
    textAlign: 'right',
  },
});

