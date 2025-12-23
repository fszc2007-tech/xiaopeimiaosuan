/**
 * 命盘总览 Tab
 * 
 * UI 优化版本 - 与基本信息页面统一风格
 * 
 * 参考文档：
 * - app.doc/features/命盤總覽设计文档.md
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { RootStackParamList } from '@/types/navigation';
import { BaziChartDto } from '@/types';
import { colors, fontSizes, fontWeights, spacing, radius } from '@/theme';
import { FourPillarsTable } from '@/components/bazi';
import { ShenShaPopup } from '@/components/ShenShaPopup';
import { ShishenPopup } from '@/components/ShishenPopup';
import { normalizeToZhHK } from '@/utils/normalizeText';
import { toTraditional } from '@/utils/shishenMapping';

interface ChartOverviewTabProps {
  chartData: BaziChartDto;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ChartOverviewTab: React.FC<ChartOverviewTabProps> = ({ chartData }) => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  
  const { profile, result } = chartData;
  
  // 神煞弹窗状态
  const [shenShaPopupVisible, setShenShaPopupVisible] = useState(false);
  const [selectedShenSha, setSelectedShenSha] = useState<{ name: string; pillarLabel: string } | null>(null);
  
  // 十神弹窗状态
  const [shishenPopupVisible, setShishenPopupVisible] = useState(false);
  const [selectedShishen, setSelectedShishen] = useState<{ name: string; pillarLabel: string } | null>(null);
  
  // 一键解读：跳转聊天页并自动发送问题
  const handleOneClickRead = (sectionKey: string, defaultQuestion: string) => {
    navigation.navigate('Chat', {
      conversationId: 'new',
      question: defaultQuestion,
      masterId: profile.chartProfileId,
      source: 'overview_card',
      sectionKey,
    });
  };
  
  // 处理神煞点击
  const handleShenShaPress = (shenSha: string, pillarName: string) => {
    setSelectedShenSha({ name: shenSha, pillarLabel: pillarName });
    setShenShaPopupVisible(true);
  };
  
  // 处理副星（十神）点击
  const handleShishenPress = (shishen: string, pillarName: string) => {
    setSelectedShishen({ name: shishen, pillarLabel: pillarName });
    setShishenPopupVisible(true);
  };
  
  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* 四柱总表 */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{t('charts.fourPillars.title')}</Text>
          </View>
          {result?.pillars && (
            <FourPillarsTable
              pillars={result.pillars}
              onShenShaPress={handleShenShaPress}
              onShishenPress={handleShishenPress}
            />
          )}
        </View>
      
        {/* 命格總評卡 */}
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.7}
          onPress={() => handleOneClickRead('minggeSummary', '請詳細解讀我的命格總評')}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>命格總評</Text>
            <Text style={styles.oneClickReadTag}>{t('chartDetail.overview.oneClickRead')}</Text>
          </View>
          {result?.analysis?.minggeSummary ? (() => {
            const minggeSummary = result.analysis.minggeSummary; // 提取变量以帮助 TypeScript 类型收窄
            return (
              <View style={styles.indicatorContainer}>
                {/* 1. 日主體質 */}
                <View style={styles.indicatorRow}>
                  <Text style={styles.indicatorLabel}>日主體質：</Text>
                  <Text style={styles.indicatorValue}>
                    {minggeSummary.dayMaster.level} · {minggeSummary.dayMaster.score}/100
                  </Text>
                </View>
                
                {/* 2. 主格局 */}
                <View style={styles.indicatorRow}>
                  <Text style={styles.indicatorLabel}>主格局：</Text>
                  <Text style={styles.indicatorValue}>
                    {toTraditional(minggeSummary.mainPattern.name)}
                    {minggeSummary.mainPattern.secondaryPatterns && 
                     minggeSummary.mainPattern.secondaryPatterns.length > 0 && (
                      ' · ' + minggeSummary.mainPattern.secondaryPatterns.map(p => toTraditional(p.name)).join(' · ')
                    )}
                  </Text>
                </View>
                
                {/* 3. 命局綜合評分 */}
                <View style={styles.indicatorRow}>
                  <Text style={styles.indicatorLabel}>命局綜合評分：</Text>
                  <Text style={styles.indicatorValue}>
                    {minggeSummary.overallScore.score}/100 · {minggeSummary.overallScore.grade}
                  </Text>
                </View>
                
                {/* 4. 格局清浊度 */}
                <View style={styles.indicatorRow}>
                  <Text style={styles.indicatorLabel}>格局清浊度：</Text>
                  <Text style={styles.indicatorValue}>
                    {toTraditional(minggeSummary.patternPurity.level)}
                  </Text>
                </View>
                
                {/* 5. 破格因素 */}
                <View style={styles.indicatorRow}>
                  <Text style={styles.indicatorLabel}>破格因素：</Text>
                  <View style={styles.tagContainer}>
                    {minggeSummary.breakingFactors.hasBreaking ? (
                      minggeSummary.breakingFactors.tags.map((tag, idx) => (
                        <Text key={idx} style={styles.tagTextInline}>
                          {normalizeToZhHK(tag)}{idx < minggeSummary.breakingFactors.tags.length - 1 ? ' · ' : ''}
                        </Text>
                      ))
                    ) : (
                      <Text style={styles.tagTextInline}>無明顯破格</Text>
                    )}
                  </View>
                </View>
                
                {/* 6. 救應因素 */}
                <View style={styles.indicatorRow}>
                  <Text style={styles.indicatorLabel}>救應因素：</Text>
                  <View style={styles.tagContainer}>
                    {minggeSummary.remedyFactors.hasRemedy ? (
                      minggeSummary.remedyFactors.tags.map((tag, idx) => (
                        <Text key={idx} style={styles.tagTextInline}>
                          {normalizeToZhHK(tag)}{idx < minggeSummary.remedyFactors.tags.length - 1 ? ' · ' : ''}
                        </Text>
                      ))
                    ) : (
                      <Text style={styles.tagTextInline}>暫無明顯救應</Text>
                    )}
                  </View>
                </View>
              
                {/* 7. 調候得失 */}
                <View style={styles.indicatorRow}>
                  <Text style={styles.indicatorLabel}>調候得失：</Text>
                  <Text style={styles.indicatorValue}>
                    {minggeSummary.tiaohou.suggestionBrief || minggeSummary.tiaohou.label}
                  </Text>
                </View>
              </View>
            );
          })() : (
            <View>
              <Text style={styles.placeholderText}>命格總評（待實現）</Text>
              {__DEV__ && (
                <Text style={[styles.placeholderText, { fontSize: 12, marginTop: 8 }]}>
                  提示：如果这是旧命盘，请重新计算以获取完整数据
                </Text>
              )}
            </View>
          )}
        </TouchableOpacity>
      
        {/* 用神格局卡 */}
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.7}
          onPress={() => handleOneClickRead('yongshenPattern', '請詳細解讀我的用神格局')}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>用神格局</Text>
            <Text style={styles.oneClickReadTag}>{t('chartDetail.overview.oneClickRead')}</Text>
          </View>
          {result?.analysis?.yongshenPattern ? (
            <View style={styles.indicatorContainer}>
              {/* 主用神 */}
              <View style={styles.indicatorRow}>
                <Text style={styles.indicatorLabel}>主用神：</Text>
                <Text style={styles.indicatorValue}>
                  {result.analysis.yongshenPattern.mainYongshen.elements.join('、')}
                  {result.analysis.yongshenPattern.mainYongshen.type === '複合用神' ? '（複合）' : ''}
                </Text>
              </View>
              
              {/* 辅喜五行 */}
              {result.analysis.yongshenPattern.assistElements.length > 0 && (
                <View style={styles.indicatorRow}>
                  <Text style={styles.indicatorLabel}>辅喜五行：</Text>
                  <View style={styles.tagContainer}>
                    {result.analysis.yongshenPattern.assistElements.map((el, idx) => (
                      <View key={idx} style={styles.tag}>
                        <Text style={styles.tagText}>{el}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              
              {/* 忌神 */}
              <View style={styles.indicatorRow}>
                <Text style={styles.indicatorLabel}>忌神：</Text>
                <View style={styles.tagContainer}>
                  {result.analysis.yongshenPattern.tabooElements.map((el, idx) => (
                    <View key={idx} style={[styles.tag, styles.tagNegative]}>
                      <Text style={[styles.tagText, styles.tagTextNegative]}>{el}</Text>
                    </View>
                  ))}
                </View>
              </View>
              
              {/* 用神力度 */}
              <View style={styles.indicatorRow}>
                <Text style={styles.indicatorLabel}>用神力度：</Text>
                <Text style={styles.indicatorValue}>
                  {result.analysis.yongshenPattern.yongshenPower.score}/100 · {result.analysis.yongshenPattern.yongshenPower.level}
                </Text>
              </View>
              
              {/* 流通等级 */}
              <View style={styles.indicatorRow}>
                <Text style={styles.indicatorLabel}>流通等級：</Text>
                <Text style={styles.indicatorValue}>
                  {result.analysis.yongshenPattern.flow.level}
                  {result.analysis.yongshenPattern.flow.score !== undefined && 
                    ` (${result.analysis.yongshenPattern.flow.score}/100)`}
                </Text>
              </View>
              
              {/* 體用平衡 */}
              <View style={styles.indicatorRow}>
                <Text style={styles.indicatorLabel}>體用平衡：</Text>
                <Text style={styles.indicatorValue}>
                  {result.analysis.yongshenPattern.tiYongBalance.level}
                </Text>
              </View>
              
              {/* 做功格局 */}
              {result.analysis.yongshenPattern.workPatterns.mainLine && (
                <View style={styles.indicatorRow}>
                  <Text style={styles.indicatorLabel}>核心做功：</Text>
                  <Text style={styles.indicatorValue}>
                    {result.analysis.yongshenPattern.workPatterns.mainLine} · {result.analysis.yongshenPattern.workPatterns.strength}
                  </Text>
                </View>
              )}
              
              {/* 调候标签（可选） */}
              {result.analysis.yongshenPattern.tiaohouLabel && (
                <View style={styles.indicatorRow}>
                  <Text style={styles.indicatorLabel}>調候：</Text>
                  <Text style={styles.indicatorValue}>
                    {result.analysis.yongshenPattern.tiaohouLabel}
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <Text style={styles.placeholderText}>用神格局（待實現）</Text>
          )}
        </TouchableOpacity>
      
        {/* 官財格局卡 */}
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.7}
          onPress={() => handleOneClickRead('guancaiPattern', '請詳細解讀我的官財格局')}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>官財格局</Text>
            <Text style={styles.oneClickReadTag}>{t('chartDetail.overview.oneClickRead')}</Text>
          </View>
          {result?.analysis?.guancaiPattern ? (
            <View style={styles.indicatorContainer}>
              {/* 事业格局 */}
              <View style={styles.indicatorRow}>
                <Text style={styles.indicatorLabel}>事業格局：</Text>
                <Text style={styles.indicatorValue}>
                  {normalizeToZhHK(result.analysis.guancaiPattern.careerPattern.officerType)} · {normalizeToZhHK(result.analysis.guancaiPattern.careerPattern.strength.level)} · {normalizeToZhHK(result.analysis.guancaiPattern.careerPattern.structureTag)}
                </Text>
              </View>
              
              {/* 财星格局 */}
              <View style={styles.indicatorRow}>
                <Text style={styles.indicatorLabel}>財星格局：</Text>
                <Text style={styles.indicatorValue}>
                  {normalizeToZhHK(result.analysis.guancaiPattern.wealthPattern.wealthType)} · {normalizeToZhHK(result.analysis.guancaiPattern.wealthPattern.strength.level)} · {normalizeToZhHK(result.analysis.guancaiPattern.wealthPattern.rooting)}
                </Text>
              </View>
              
              {/* 赚钱模式 */}
              <View style={styles.indicatorRow}>
                <Text style={styles.indicatorLabel}>賺錢模式：</Text>
                <Text style={styles.indicatorValue}>
                  {normalizeToZhHK(result.analysis.guancaiPattern.incomeMode.mainMode)}
                </Text>
              </View>
              
              {/* 赚钱模式标签 */}
              {result.analysis.guancaiPattern.incomeMode.tags.length > 0 && (
                <View style={styles.indicatorRow}>
                  <Text style={styles.indicatorLabel}></Text>
                  <View style={styles.tagContainer}>
                    {result.analysis.guancaiPattern.incomeMode.tags.map((tag, idx) => (
                      <View key={idx} style={styles.tag}>
                        <Text style={styles.tagText}>{normalizeToZhHK(tag)}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              
              {/* 官財穩定度 */}
              <View style={styles.indicatorRow}>
                <Text style={styles.indicatorLabel}>官財穩定度：</Text>
                <Text style={styles.indicatorValue}>
                  事業 {normalizeToZhHK(result.analysis.guancaiPattern.stability.career)} · 財運 {normalizeToZhHK(result.analysis.guancaiPattern.stability.wealth)}
                </Text>
              </View>
              
              {/* 風險因素 */}
              {result.analysis.guancaiPattern.riskFactors.tags.length > 0 && (
                <View style={styles.indicatorRow}>
                  <Text style={styles.indicatorLabel}>風險因素：</Text>
                  <View style={styles.tagContainer}>
                    {result.analysis.guancaiPattern.riskFactors.tags.map((tag, idx) => (
                      <View key={idx} style={[styles.tag, styles.tagNegative]}>
                        <Text style={[styles.tagText, styles.tagTextNegative]}>{normalizeToZhHK(tag)}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              
              {/* 助力因素 */}
              {result.analysis.guancaiPattern.supportFactors.tags.length > 0 && (
                <View style={styles.indicatorRow}>
                  <Text style={styles.indicatorLabel}>助力因素：</Text>
                  <View style={styles.tagContainer}>
                    {result.analysis.guancaiPattern.supportFactors.tags.map((tag, idx) => (
                      <View key={idx} style={styles.tag}>
                        <Text style={styles.tagText}>{normalizeToZhHK(tag)}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              
              {/* 做功主線 */}
              {result.analysis.guancaiPattern.workPatterns.mainLine && (
                <View style={styles.indicatorRow}>
                  <Text style={styles.indicatorLabel}>做功主線：</Text>
                  <Text style={styles.indicatorValue}>
                    {normalizeToZhHK(result.analysis.guancaiPattern.workPatterns.mainLine)}
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <Text style={styles.placeholderText}>官財格局（待實現）</Text>
          )}
        </TouchableOpacity>
      
        {/* 能量流通卡 */}
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.7}
          onPress={() => handleOneClickRead('energyFlow', '請詳細解讀我的能量流通')}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{t('chartDetail.overview.energyFlow')}</Text>
            <Text style={styles.oneClickReadTag}>{t('chartDetail.overview.oneClickRead')}</Text>
          </View>
          {result?.analysis?.energyFlow ? (
            <View style={styles.indicatorContainer}>
              {/* 做功路径数量 */}
              <View style={styles.indicatorRow}>
                <Text style={styles.indicatorLabel}>{t('chartDetail.overview.workPath')}：</Text>
                <Text style={styles.indicatorValue}>
                  {result.analysis.energyFlow.workPathCount}{t('chartDetail.overview.pathUnit')}
                </Text>
              </View>
              
              {/* 核心做功路径 */}
              {result.analysis.energyFlow.coreWorkPaths && result.analysis.energyFlow.coreWorkPaths.length > 0 && (
                <View style={styles.indicatorRow}>
                  <Text style={styles.indicatorLabel}>{t('chartDetail.overview.coreWork')}：</Text>
                  <View style={styles.tagContainer}>
                    {result.analysis.energyFlow.coreWorkPaths.map((path, idx) => (
                      <View key={idx} style={styles.tag}>
                        <Text style={styles.tagText}>{normalizeToZhHK(path.label)}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              
              {/* 流通度分数 */}
              <View style={styles.indicatorRow}>
                <Text style={styles.indicatorLabel}>{t('chartDetail.overview.flowScore')}：</Text>
                <Text style={styles.indicatorValue}>
                  {Math.round(result.analysis.energyFlow.flowScore)}%
                </Text>
              </View>
            </View>
          ) : (
            <Text style={styles.placeholderText}>{t('chartDetail.overview.energyFlow')}（待實現）</Text>
          )}
        </TouchableOpacity>
      
        {/* 宫位六亲卡 */}
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.7}
          onPress={() => handleOneClickRead('palaceSixKin', '請詳細解讀我的宮位六親')}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{t('chartDetail.overview.palaces')}</Text>
            <Text style={styles.oneClickReadTag}>{t('chartDetail.overview.oneClickRead')}</Text>
          </View>
          {result?.analysis?.palaces?.fourPillarsPalaces ? (
            <View style={styles.indicatorContainer}>
              {result.pillars && (
                <>
                  <View style={styles.indicatorRow}>
                    <Text style={styles.indicatorLabel}>{t('charts.fourPillars.yearPillar')}：</Text>
                    <Text style={styles.indicatorValue}>
                      {result.pillars.year.stem}{result.pillars.year.branch} - {result.analysis.palaces.fourPillarsPalaces.year.meanings.map(m => normalizeToZhHK(m)).join('、')}
                    </Text>
                  </View>
                  <View style={styles.indicatorRow}>
                    <Text style={styles.indicatorLabel}>{t('charts.fourPillars.monthPillar')}：</Text>
                    <Text style={styles.indicatorValue}>
                      {result.pillars.month.stem}{result.pillars.month.branch} - {result.analysis.palaces.fourPillarsPalaces.month.meanings.map(m => normalizeToZhHK(m)).join('、')}
                    </Text>
                  </View>
                  <View style={styles.indicatorRow}>
                    <Text style={styles.indicatorLabel}>{t('charts.fourPillars.dayPillar')}：</Text>
                    <Text style={styles.indicatorValue}>
                      {result.pillars.day.stem}{result.pillars.day.branch} - {result.analysis.palaces.fourPillarsPalaces.day.meanings.map(m => normalizeToZhHK(m)).join('、')}
                    </Text>
                  </View>
                  <View style={styles.indicatorRow}>
                    <Text style={styles.indicatorLabel}>{t('charts.fourPillars.hourPillar')}：</Text>
                    <Text style={styles.indicatorValue}>
                      {result.pillars.hour.stem}{result.pillars.hour.branch} - {result.analysis.palaces.fourPillarsPalaces.hour.meanings.map(m => normalizeToZhHK(m)).join('、')}
                    </Text>
                  </View>
                </>
              )}
            </View>
          ) : (
          <Text style={styles.placeholderText}>宮位指標（待實現）</Text>
          )}
        </TouchableOpacity>
      
        {/* 行运节奏卡（替换原行运概况卡） */}
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.7}
          onPress={() => handleOneClickRead('luckRhythm', '請詳細解讀我的行運節奏')}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{t('chartDetail.overview.luckRhythm')}</Text>
            <Text style={styles.oneClickReadTag}>{t('chartDetail.overview.oneClickRead')}</Text>
          </View>
          {result?.analysis?.luckRhythm ? (
            <View style={styles.indicatorContainer}>
              {/* 当前阶段 */}
              <View style={styles.indicatorRow}>
                <Text style={styles.indicatorLabel}>{t('chartDetail.overview.currentStage')}：</Text>
                <Text style={styles.indicatorValue}>
                  {normalizeToZhHK(result.analysis.luckRhythm.currentLuck.stage)}
                </Text>
              </View>
              
              {/* 节奏强度 */}
              <View style={styles.indicatorRow}>
                <Text style={styles.indicatorLabel}>{t('chartDetail.overview.rhythmIntensity')}：</Text>
                <Text style={styles.indicatorValue}>
                  {normalizeToZhHK(result.analysis.luckRhythm.currentLuck.intensity)}
                </Text>
              </View>
              
              {/* 主领域 */}
              {result.analysis.luckRhythm.currentLuck.mainDomains.length > 0 && (
                <View style={styles.indicatorRow}>
                  <Text style={styles.indicatorLabel}>{t('chartDetail.overview.mainDomain')}：</Text>
                  <View style={styles.tagContainer}>
                    {result.analysis.luckRhythm.currentLuck.mainDomains.map((domain, idx) => (
                      <View key={idx} style={styles.tag}>
                        <Text style={styles.tagText}>{normalizeToZhHK(domain)}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              
              {/* 当前大运 */}
              <View style={styles.indicatorRow}>
                <Text style={styles.indicatorLabel}>{t('chartDetail.overview.currentDaYun')}：</Text>
                <Text style={styles.indicatorValue}>
                  {normalizeToZhHK(result.analysis.luckRhythm.currentLuck.label)} · {normalizeToZhHK(result.analysis.luckRhythm.currentLuck.ageRange)}
                </Text>
              </View>
              
              {/* 当前流年 */}
              <View style={styles.indicatorRow}>
                <Text style={styles.indicatorLabel}>{t('chartDetail.overview.currentFlowYear')}：</Text>
                <Text style={styles.indicatorValue}>
                  {result.analysis.luckRhythm.currentYear.year}年 · {normalizeToZhHK(result.analysis.luckRhythm.currentYear.effect)}
                </Text>
              </View>
              
              {/* 未来趋势 */}
              <View style={styles.indicatorRow}>
                <Text style={styles.indicatorLabel}>{t('chartDetail.overview.futureTrend')}：</Text>
                <Text style={styles.indicatorValue}>
                  {normalizeToZhHK(result.analysis.luckRhythm.comingYearsTrend.tendency)}
                </Text>
              </View>
              
              {/* 阶段转换提示（可选） */}
              {result.analysis.luckRhythm.prevNextLuckSummary.stageShiftHint ? (
                <View style={styles.indicatorRow}>
                  <Text style={styles.indicatorLabel}>{t('chartDetail.overview.stageTransition')}：</Text>
                  <Text style={styles.indicatorValue}>
                    {normalizeToZhHK(result.analysis.luckRhythm.prevNextLuckSummary.stageShiftHint)}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : (
            <Text style={styles.placeholderText}>行运节奏（待實現）</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
      
      {/* 神煞解读弹窗 */}
      {selectedShenSha && result?.chartId && (
        <ShenShaPopup
          visible={shenShaPopupVisible}
          shenShaName={selectedShenSha.name}
          pillarLabel={selectedShenSha.pillarLabel}
          chartId={result.chartId}
          chartProfileId={profile.chartProfileId}
          gender={profile.gender}
          onClose={() => {
            setShenShaPopupVisible(false);
            setSelectedShenSha(null);
          }}
        />
      )}
      
      {/* 十神解读弹窗（副星） */}
      {selectedShishen && result?.chartId && (
        <ShishenPopup
          visible={shishenPopupVisible}
          shishenName={selectedShishen.name}
          pillarLabel={selectedShishen.pillarLabel}
          chartId={result.chartId}
          chartProfileId={profile.chartProfileId}
          gender={profile.gender}
          onClose={() => {
            setShishenPopupVisible(false);
            setSelectedShishen(null);
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: spacing.lg,
  },
  
  // 卡片样式
  card: {
    backgroundColor: '#ffffff',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.md,
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: fontWeights.bold,
    color: colors.ink,
  },
  cardSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  oneClickReadTag: {
    fontSize: fontSizes.sm, // 统一字体大小：与基本信息页面的小佩解读一致
    color: colors.primary,
    fontWeight: fontWeights.semibold,
  },
  placeholderText: {
    fontSize: fontSizes.base,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  
  // 指标显示样式
  indicatorContainer: {
    gap: spacing.sm,
  },
  indicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
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
  
  // 因素标签样式
  factorsContainer: {
    marginTop: spacing.xs,
  },
  factorsLabel: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  factorsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  factorTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    backgroundColor: colors.border,
  },
  factorTagActive: {
    backgroundColor: colors.greenSoftBg,
  },
  factorTagText: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
  },
  factorTagTextActive: {
    color: colors.primary,
    fontWeight: fontWeights.semibold,
  },
  
  // 标签容器样式
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
  tagNegative: {
    backgroundColor: colors.border,
  },
  tagText: {
    fontSize: fontSizes.xs,
    color: colors.primary,
    fontWeight: fontWeights.semibold,
  },
  tagTextNegative: {
    color: colors.textSecondary,
  },
  tagTextInline: {
    fontSize: fontSizes.sm,
    color: colors.ink,
    fontWeight: fontWeights.regular,
  },
});

