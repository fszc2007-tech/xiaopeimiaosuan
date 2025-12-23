/**
 * 大運流年 Tab
 * 
 * 參考文檔：
 * - app.doc/features/基本信息設計文檔.md（大運流年部分）
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from '@/types/navigation';
import { BaziChartDto } from '@/types';
import { colors, fontSizes, fontWeights, spacing, radius } from '@/theme';
import { TimeCoordinateCard, TimeCoordinateVM } from '@/components/bazi/TimeCoordinateCard';
import { LuckCycleList } from '@/components/bazi/LuckCycleList';
import { AnnualLuckList, AnnualLuckBrief } from '@/components/bazi/AnnualLuckList';

interface LuckTimelineTabProps {
  chartData: BaziChartDto;
}

export const LuckTimelineTab: React.FC<LuckTimelineTabProps> = ({ chartData }) => {
  const { t } = useTranslation();
  const { result, profile } = chartData;
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // 計算當前年齡
  const getCurrentAge = () => {
    if (!profile?.birthdayGregorian) return 0;
    const birthYear = new Date(profile.birthdayGregorian).getFullYear();
    const currentYear = new Date().getFullYear();
    return currentYear - birthYear;
  };

  // 使用 derived.luckCycle 數據（適配層已處理好的數據）
  const luckCyclesWithCurrent = result?.derived?.luckCycle || [];
  
  // 獲取起運年齡
  const startAge = result?.derived?.qi_yun?.years || result?.derived?.start_age || 0;

  // ✅ DTO -> VM 映射函數（輕量轉換層，預留擴展）
  const mapTimeCoordinateDtoToVm = (dto?: any): TimeCoordinateVM | null => {
    if (!dto) return null;
    // 目前結構一致，直接返回（預留這層方便以後擴展）
    return dto as TimeCoordinateVM;
  };

  // ✅ 從 chartData 中提取 timeCoordinate DTO
  const timeCoordinateDto = result?.analysis?.timeCoordinate;
  
  // ✅ 映射 DTO -> VM
  const timeCoordinateVM = mapTimeCoordinateDtoToVm(timeCoordinateDto);
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* ✅ 時間坐標卡片（替換大運序列） */}
      <TimeCoordinateCard
        timeCoordinate={timeCoordinateVM}
        loading={false}
        chartId={result.chartId}
        chartProfileId={profile.chartProfileId}
      />
      
      {/* 大運時間軸卡片（替換當前流年） */}
      {luckCyclesWithCurrent.length > 0 && (
        <LuckCycleList
          luckCycles={luckCyclesWithCurrent}
          startAge={startAge}
          onLuckPress={(luck, index) => {
            // 跳轉到聊天頁面，傳遞大運解讀問題
            navigation.navigate('Chat', {
              conversationId: 'new',
              question: `幫我解讀一下${luck.stemBranch}大運（${luck.startAge}–${luck.endAge}歲），這步大運的整體趨勢和需要注意的地方。`,
              masterId: profile.chartProfileId,
              source: 'luck_cycle_card',
              sectionKey: 'luck_cycle',
            });
          }}
        />
      )}
      
      {/* 未來十年流年列表 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('chartDetail.luckTimeline.annualList')}</Text>
        {(() => {
          // 調試：檢查數據是否存在
          const annualBrief = result?.analysis?.luckRhythm?.annualBrief;
          console.log('[LuckTimelineTab] annualBrief 检查:', {
            hasAnalysis: !!result?.analysis,
            hasLuckRhythm: !!result?.analysis?.luckRhythm,
            hasAnnualBrief: !!annualBrief,
            annualBriefLength: annualBrief?.length || 0,
            annualBriefSample: annualBrief?.[0] || null,
          });
          
          if (annualBrief && annualBrief.length > 0) {
            return (
              <AnnualLuckList
                data={annualBrief}
                onPressDetail={(year) => {
                  // TODO: 打开流年详情弹窗
                  console.log('打开流年详情:', year);
                }}
                onPressAsk={(year, data) => {
                  navigation.navigate('Chat', {
                    conversationId: 'new',
                    question: `我想問一下我在 ${year} 年整體的運勢，重點幫我看事業和財運。`,
                    masterId: profile.chartProfileId,
                    source: 'annual_luck_ask',
                    context: {
                      chartId: profile.chartProfileId,
                      year,
                      luckIndex: data.meta?.luckIndex,
                    },
                  });
                }}
              />
            );
          }
          
          return <Text style={styles.placeholderText}>{t('annual.empty.noData')}</Text>;
        })()}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  cardTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  placeholderText: {
    fontSize: fontSizes.base,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  
  // 流年流月显示样式
  indicatorContainer: {
    gap: spacing.sm,
  },
  flowItem: {
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  indicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    flexWrap: 'wrap',
  },
  indicatorLabel: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    minWidth: 80,
  },
  indicatorValue: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
    flex: 1,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    flex: 1,
  },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    backgroundColor: colors.greenSoftBg,
  },
  tagText: {
    fontSize: fontSizes.xs,
    color: colors.primary,
    fontWeight: fontWeights.semibold,
  },
});

