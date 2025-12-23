/**
 * 当前命盘选择器组件
 * 
 * 功能：
 * - 展示当前命盘信息（有命盘状态）
 * - 无命盘时引导创建（无命盘状态）
 * - 支持切换命盘（底部弹窗选择器）
 * - 支持新建命盘
 * - 保留管理命盘入口
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { X } from 'lucide-react-native';
import { Card, Button } from '@/components/common';
import { colors, fontSizes, fontWeights, spacing, radius } from '@/theme';
import { ChartProfile } from '@/types';
import { SCREEN_NAMES } from '@/constants/routes';
import { useTranslation } from 'react-i18next';

interface CurrentChartSelectorProps {
  currentChartId: string | null;
  charts: ChartProfile[];
  currentChart: ChartProfile | null;
  onSwitchChart: (chartId: string) => void;
  onCreateChart: () => void;
  onManageCharts?: () => void;
}

/**
 * 获取生肖（根据出生年份）
 */
const getZodiac = (birthday: string | undefined): string => {
  if (!birthday) return '';
  try {
    const year = parseInt(birthday.split('-')[0], 10);
    if (isNaN(year)) return '';
    const zodiacs = ['猴', '雞', '狗', '豬', '鼠', '牛', '虎', '兔', '龍', '蛇', '馬', '羊'];
    return zodiacs[year % 12];
  } catch (error) {
    console.warn('[getZodiac] 解析生日失败:', birthday, error);
    return '';
  }
};

/**
 * 格式化日期显示
 */
const formatDate = (birthday: string | undefined): string => {
  if (!birthday) return '';
  return birthday; // YYYY-MM-DD 格式直接返回
};

export const CurrentChartSelector: React.FC<CurrentChartSelectorProps> = ({
  currentChartId,
  charts,
  currentChart,
  onSwitchChart,
  onCreateChart,
  onManageCharts,
}) => {
  const { t } = useTranslation();
  const [showSelector, setShowSelector] = useState(false);

  // 只有在首次加载且没有选择时才自动选择默认命盘
  // 如果用户已经手动选择过，则不会被自动覆盖
  useEffect(() => {
    // 只有当命盘列表有数据且当前没有选择时，才自动选择
    // 这通常发生在首次加载时，用户还没有手动选择过
    if (charts.length > 0 && !currentChartId) {
      // 使用第一个命盘（或按最近查看排序后的第一个）
      const sortedByRecent = [...charts].sort((a, b) => {
        const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return timeB - timeA; // 降序，最新的在前
      });
      const targetChart = sortedByRecent[0] || charts[0];
      if (targetChart) {
        onSwitchChart(targetChart.chartProfileId);
      }
    }
  }, [charts, currentChartId, onSwitchChart]);

  // 无命盘状态：如果没有命盘列表，才显示新建提示
  if (charts.length === 0) {
    return (
      <Card style={styles.container}>
        <Text style={styles.title}>{t('xiaopei.currentChart')}</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>{t('xiaopei.noChartYet')}</Text>
          <Button 
            title={t('xiaopei.goCreateChart')}
            onPress={onCreateChart} 
            style={styles.createButton}
            size="small"
          />
        </View>
      </Card>
    );
  }

  // 如果正在加载或还没有选中（等待 useEffect 自动选择），显示第一个命盘的信息
  if (!currentChart || !currentChartId) {
    const firstChart = charts[0];
    if (firstChart) {
      const genderText = firstChart.gender === 'male' ? '男' : '女';
      const zodiac = getZodiac(firstChart.birthday);
      return (
        <Card style={styles.container}>
          <Text style={styles.title}>{t('xiaopei.currentChart')}</Text>
          <View style={styles.content}>
            <View style={styles.info}>
              <Text style={styles.mainInfo}>
                {firstChart.name} · {genderText} · {formatDate(firstChart.birthday)} · {t('xiaopei.zodiac')}{zodiac}
              </Text>
              <Text style={styles.hint}>
                {t('xiaopei.currentChartHint', { name: firstChart.name })}
              </Text>
            </View>
            <Pressable
              onPress={() => setShowSelector(true)}
              style={styles.switchButton}
            >
              <Text style={styles.switchButtonText}>{t('xiaopei.switchChart')} →</Text>
            </Pressable>
          </View>
        </Card>
      );
    }
  }

  // 有命盘状态
  const genderText = currentChart.gender === 'male' ? '男' : '女';
  const zodiac = getZodiac(currentChart.birthday);
  
  // 安全检查：如果关键字段缺失，显示默认值
  if (!currentChart.birthday) {
    console.warn('[CurrentChartSelector] 命盘数据不完整:', currentChart);
  }

  return (
    <>
      <Card style={styles.container}>
        <Text style={styles.title}>{t('xiaopei.currentChart')}</Text>
        <View style={styles.content}>
          <View style={styles.info}>
            <Text style={styles.mainInfo}>
              {currentChart.name} · {genderText} · {formatDate(currentChart.birthday)} · {t('xiaopei.zodiac')}{zodiac}
            </Text>
            <Text style={styles.hint}>
              {t('xiaopei.currentChartHint', { name: currentChart.name })}
            </Text>
          </View>
          <Pressable
            onPress={() => setShowSelector(true)}
            style={styles.switchButton}
          >
            <Text style={styles.switchButtonText}>{t('xiaopei.switchChart')} →</Text>
          </Pressable>
        </View>
      </Card>

      {/* 命盘选择器（底部弹窗） */}
      <Modal
        visible={showSelector}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* 标题栏 */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('xiaopei.selectChart')}</Text>
              <Pressable
                onPress={() => setShowSelector(false)}
                style={styles.closeButton}
              >
                <X size={24} color={colors.textSecondary} />
              </Pressable>
            </View>

            {/* 命盘列表 */}
            <ScrollView style={styles.selectorList}>
              {charts.map((chart) => {
                const isSelected = chart.chartProfileId === currentChartId;
                const chartGenderText = chart.gender === 'male' ? '男' : '女';
                const chartZodiac = getZodiac(chart.birthday);
                
                // 安全检查
                if (!chart.birthday) {
                  console.warn('[CurrentChartSelector] 命盘数据不完整:', chart);
                }

                return (
                  <Pressable
                    key={chart.chartProfileId}
                    style={({ pressed }) => [
                      styles.selectorItem,
                      pressed && styles.selectorItemPressed,
                      isSelected && styles.selectorItemCurrent,
                    ]}
                    onPress={() => {
                      onSwitchChart(chart.chartProfileId);
                      setShowSelector(false);
                    }}
                  >
                    <View style={styles.selectorItemInfo}>
                      <Text style={styles.selectorItemName}>{chart.name}</Text>
                      <Text style={styles.selectorItemDetail}>
                        {chartGenderText} · {formatDate(chart.birthday)} · {chartZodiac}
                      </Text>
                    </View>
                    {isSelected && (
                      <View style={styles.currentTag}>
                        <Text style={styles.currentTagText}>{t('xiaopei.currentlyUsing')}</Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* 底部按钮 */}
            <View style={styles.modalFooter}>
              <Button
                title={t('xiaopei.createNewChart')}
                onPress={() => {
                  setShowSelector(false);
                  onCreateChart();
                }}
                style={styles.createButtonInSelector}
              />
              {onManageCharts && (
                <Button
                  onPress={() => {
                    setShowSelector(false);
                    onManageCharts();
                  }}
                  variant="text"
                  style={styles.manageButton}
                >
                  {t('xiaopei.manageAllCharts')}
                </Button>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.bold,
    color: colors.ink,
    marginBottom: spacing.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  info: {
    flex: 1,
    marginRight: spacing.md,
  },
  mainInfo: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  hint: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  switchButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  switchButtonText: {
    fontSize: fontSizes.sm,
    color: colors.primary,
    fontWeight: fontWeights.medium,
  },
  // 无命盘状态（优化版）
  emptyState: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  emptyTitle: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    flex: 1,
    marginRight: spacing.md,
  },
  createButton: {
    // 使用 Button 组件的 size="small" 来控制高度
  },
  // 弹窗样式
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '70%',
    paddingBottom: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.bold,
    color: colors.ink,
  },
  closeButton: {
    padding: spacing.xs,
  },
  selectorList: {
    maxHeight: 400,
    paddingHorizontal: spacing.lg,
  },
  selectorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  selectorItemPressed: {
    backgroundColor: colors.blueSoftBg,
  },
  selectorItemCurrent: {
    // 移除背景颜色，仅保留"當前使用"标签标识
  },
  selectorItemInfo: {
    flex: 1,
  },
  selectorItemName: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  selectorItemDetail: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
  },
  currentTag: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  currentTagText: {
    fontSize: fontSizes.xs,
    color: '#FFFFFF',
    fontWeight: fontWeights.medium,
  },
  modalFooter: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  createButtonInSelector: {
    width: '100%',
  },
  manageButton: {
    width: '100%',
  },
});

