/**
 * 会员权益卡组件
 * 
 * 功能：
 * - 显示会员权益列表
 * - 使用「已解锁」的语气
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { colors, fontSizes, fontWeights, spacing, radius } from '@/theme';

interface BenefitsCardProps {
  aiDailyLimit: number;
  maxCharts: number | null; // null 表示无限制
}

export const BenefitsCard: React.FC<BenefitsCardProps> = ({
  aiDailyLimit,
  maxCharts,
}) => {
  // 获取命盘数量文案
  const getChartsText = () => {
    if (maxCharts === null || maxCharts === 0) {
      return '可保存無限制命盤';
    }
    return `可保存 ${maxCharts} 個命盤`;
  };

  const benefits = [
    `每天 ${aiDailyLimit} 次 AI 解讀與問答`,
    '可使用全部八字功能與工具',
    getChartsText(),
    '新功能會優先開放給小佩會員嘗鮮',
  ];

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* 标题 */}
        <Text style={styles.title}>會員權益</Text>

        {/* 权益列表 */}
        <View style={styles.benefitsList}>
          {benefits.map((benefit, index) => (
            <View key={index} style={styles.benefitItem}>
              <View style={styles.checkIcon}>
                <Check size={16} color={colors.success} strokeWidth={3} />
              </View>
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </View>

        {/* 底部小字 */}
        <Text style={styles.footer}>
          後續有新功能會優先開放給小佩會員。
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  benefitsList: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  checkIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  benefitText: {
    flex: 1,
    fontSize: fontSizes.md,
    color: colors.text,
    lineHeight: 22,
  },
  footer: {
    fontSize: fontSizes.sm,
    color: colors.textTertiary,
    lineHeight: 20,
  },
});

