/**
 * 喜忌用神流程图组件（第一版 - 简洁版）
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontWeights, spacing } from '@/theme';
import {
  WUXING_COLORS,
  getWuxingRelation,
  getGodsLevel,
} from '@/constants/wuxing';

interface GodsFlowChartProps {
  gods: {
    favorable: string[];
    unfavorable: string[];
    neutral?: string[];
  };
  dayMasterWuxing: string;
}

export const GodsFlowChart: React.FC<GodsFlowChartProps> = ({
  gods,
  dayMasterWuxing,
}) => {
  if (!gods || !gods.favorable || !gods.unfavorable) {
    return null;
  }

  // 渲染喜用神
  const renderFavorableGods = () => {
    return gods.favorable.map((element, index) => {
      const wuxingColor = WUXING_COLORS[element as keyof typeof WUXING_COLORS];
      const relation = getWuxingRelation(element, dayMasterWuxing);
      const level = getGodsLevel(index, true);

      return (
        <View key={`favorable-${element}-${index}`} style={styles.flowRow}>
          <Text style={styles.relationText}>{relation}</Text>
          <Text style={styles.arrow}>→</Text>
          <View
            style={[
              styles.elementBadge,
              { backgroundColor: wuxingColor?.bg || '#f3f4f6' },
            ]}
          >
            <Text style={[styles.elementText, { color: wuxingColor?.main }]}>
              {element}
            </Text>
          </View>
          <Text style={styles.arrow}>→</Text>
          <Text style={[styles.levelText, styles.favorableLevel]}>{level}</Text>
        </View>
      );
    });
  };

  // 渲染忌神
  const renderUnfavorableGods = () => {
    return [...gods.unfavorable].reverse().map((element, index) => {
      const wuxingColor = WUXING_COLORS[element as keyof typeof WUXING_COLORS];
      const relation = getWuxingRelation(element, dayMasterWuxing);
      const originalIndex = gods.unfavorable.length - 1 - index;
      const level = getGodsLevel(originalIndex, false);

      return (
        <View key={`unfavorable-${element}-${index}`} style={styles.flowRow}>
          <Text style={styles.relationText}>{relation}</Text>
          <Text style={styles.arrow}>→</Text>
          <View
            style={[
              styles.elementBadge,
              { backgroundColor: wuxingColor?.bg || '#f3f4f6' },
            ]}
          >
            <Text style={[styles.elementText, { color: wuxingColor?.main }]}>
              {element}
            </Text>
          </View>
          <Text style={styles.arrow}>→</Text>
          <Text style={[styles.levelText, styles.unfavorableLevel]}>{level}</Text>
        </View>
      );
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>喜忌用神流程</Text>
        <Text style={styles.subtitle}>日主：{dayMasterWuxing}</Text>
      </View>

      <View style={styles.flowContainer}>
        {renderFavorableGods()}
        {renderUnfavorableGods()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 16,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
    marginRight: 8,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  flowContainer: {
    gap: 12,
  },
  flowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  relationText: {
    fontSize: 14,
    color: colors.textSecondary,
    minWidth: 70,
  },
  arrow: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  elementBadge: {
    minWidth: 48,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  elementText: {
    fontSize: 15,
    fontWeight: fontWeights.semibold,
  },
  levelText: {
    fontSize: 14,
    fontWeight: fontWeights.medium,
    flex: 1,
  },
  favorableLevel: {
    color: '#059669',
  },
  unfavorableLevel: {
    color: '#DC2626',
  },
});
