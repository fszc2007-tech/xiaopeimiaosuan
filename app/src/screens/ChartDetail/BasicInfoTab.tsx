/**
 * 基本信息 Tab
 * 
 * UI 优化版本 - 统一配色方案
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  User, 
  Calendar, 
  MapPin, 
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BaziChartDto } from '@/types';
import { RootStackParamList } from '@/types/navigation';
import { colors, fontSizes, fontWeights, spacing, radius } from '@/theme';
import { WuXingChart } from '@/components/charts/WuXingChart';
import { DayMasterStrengthBar } from '@/components/charts/DayMasterStrengthBar';
import { HiddenStemsCard, FourPillarsCard, GodsFlowChart } from '@/components/bazi';
import { WUXING_COLORS, getStemWuxing } from '@/constants/wuxing';
import { normalizeToZhHK } from '@/utils/normalizeText';
import { dayStemService, DayStemReadingDto } from '@/services/api/dayStemService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface BasicInfoTabProps {
  chartData: BaziChartDto;
}


export const BasicInfoTab: React.FC<BasicInfoTabProps> = ({ chartData }) => {
  const { profile, result } = chartData;
  const navigation = useNavigation<NavigationProp>();
  
  // 日主解读数据
  const [dayStemReading, setDayStemReading] = useState<DayStemReadingDto | null>(null);
  const [loadingReading, setLoadingReading] = useState(false);
  
  // 獲取日主五行顏色
  const dayMasterWuxing = result?.analysis?.dayMaster?.wuxing || '水';
  const dayMasterColor = WUXING_COLORS[dayMasterWuxing as keyof typeof WUXING_COLORS] || WUXING_COLORS['水'];
  
  // 獲取日主強弱（後端返回的可能是簡體，需要轉換）
  const rawStrengthLabel = result?.analysis?.dayMaster?.strengthLabel || '平衡';
  const strengthLabel = normalizeToZhHK(rawStrengthLabel) as '從弱' | '身弱' | '平衡' | '身強' | '從強';
  
  // 获取日主天干
  const dayStem = result?.pillars?.day?.stem;
  
  // 加载日主解读
  useEffect(() => {
    if (dayStem) {
      setLoadingReading(true);
      dayStemService.getReading(dayStem)
        .then(setDayStemReading)
        .catch((error) => {
          console.error('获取日主解读失败:', error);
        })
        .finally(() => {
          setLoadingReading(false);
        });
    }
  }, [dayStem]);
  
  // 一鍵解讀：跳轉聊天頁並自動發送問題
  const handleWuXingRead = () => {
    navigation.navigate('Chat', {
      conversationId: 'new',
      question: '請詳細解讀我的五行分佈情況',
      masterId: profile.chartProfileId,
      source: 'basic_info_card',
      sectionKey: 'wuxing_distribution',
    });
  };
  
  // 日主強弱解讀：跳轉聊天頁並自動發送問題
  const handleDayMasterRead = () => {
    navigation.navigate('Chat', {
      conversationId: 'new',
      question: '請詳細解讀我的日主強弱情況',
      masterId: profile.chartProfileId,
      source: 'basic_info_card',
      sectionKey: 'daymaster_strength',
    });
  };
  
  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* 命盘档案 */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>基本資訊</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>姓名</Text>
            <Text style={styles.infoValue}>{profile.name}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>性別</Text>
            <Text style={styles.infoValue}>{profile.gender === 'male' ? '男' : '女'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>公曆</Text>
            <Text style={styles.infoValue}>{profile.birthdayGregorian}</Text>
          </View>
          
          {profile.birthdayLunar && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>農曆</Text>
              <Text style={styles.infoValue}>{profile.birthdayLunar}</Text>
            </View>
          )}
          
          {profile.location && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>出生地</Text>
              <Text style={styles.infoValue}>{profile.location}</Text>
            </View>
          )}
        </View>
        
      {/* 日主概览 */}
      {result?.analysis?.dayMaster && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>日主概覽</Text>
          </View>

          {loadingReading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#667eea" />
              <Text style={styles.loadingText}>加載中...</Text>
            </View>
          ) : dayStemReading ? (
            <>
              {/* 获取五行对应的颜色 */}
              {(() => {
                const elementColor = WUXING_COLORS[dayStemReading.element as keyof typeof WUXING_COLORS] || WUXING_COLORS['水'];
                
                return (
                  <>
                    {/* 日主标识 */}
                    <View style={[styles.dayStemBadge, { backgroundColor: elementColor.bg }]}>
                      <Text style={[styles.dayStemText, { color: elementColor.main }]}>{dayStemReading.stem}</Text>
                    </View>
                    
                    {/* 属性标签 */}
                    <View style={styles.attributeRow}>
                      <View style={[styles.attributeTag, { backgroundColor: elementColor.light }]}>
                        <Text style={styles.attributeLabel}>五行</Text>
                        <Text style={[styles.attributeValue, { color: elementColor.main }]}>{dayStemReading.element}</Text>
                      </View>
                      <View style={styles.attributeTag}>
                        <Text style={styles.attributeLabel}>陰陽</Text>
                        <Text style={styles.attributeValue}>{dayStemReading.yinYang}</Text>
                      </View>
                    </View>
                    
                    {/* 描述文案 */}
                    <View style={[styles.descriptionBox, { borderLeftColor: elementColor.main }]}>
                      <Text style={styles.description}>{dayStemReading.description}</Text>
                    </View>
                  </>
                );
              })()}
            </>
          ) : (
            <View style={styles.dayMasterInfo}>
              <View style={styles.dayMasterRow}>
                <Text style={styles.dayMasterLabel}>日主</Text>
                <Text style={styles.dayMasterValue}>
                  {result.analysis.dayMaster.gan}{result.analysis.dayMaster.zhi}
                </Text>
              </View>
              <View style={styles.dayMasterRow}>
                <Text style={styles.dayMasterLabel}>五行</Text>
                <Text style={styles.dayMasterValue}>
                  {result.analysis.dayMaster.wuxing}
                </Text>
              </View>
              <View style={styles.dayMasterRow}>
                <Text style={styles.dayMasterLabel}>陰陽</Text>
                <Text style={styles.dayMasterValue}>
                  {result.analysis.dayMaster.yinyang}
                </Text>
              </View>
            </View>
          )}
        </View>
      )}

      {/* 日主強弱 */}
      {result?.analysis?.dayMaster && (
        <View style={styles.card}>
          <DayMasterStrengthBar
            data={{
              score: result.analysis.dayMaster.strength / 100, // 轉換為 0-1
              band: normalizeToZhHK(result.analysis.dayMaster.strengthLabel) as '從弱' | '身弱' | '平衡' | '身強' | '從強',
              // ✅ 修復：使用後端返回的真實數據，不再硬編碼
              detail: result.analysis.strengthAnalysis?.detail ? {
                season: result.analysis.strengthAnalysis.detail.w_month || 0,
                root: result.analysis.strengthAnalysis.detail.root || 0,
                help: result.analysis.strengthAnalysis.detail.help || 0,
                drain: result.analysis.strengthAnalysis.detail.drain || 0,
              } : undefined,
            }}
            showDetail={true}
            onReadPress={handleDayMasterRead}
          />
        </View>
      )}

      {/* 五行分佈 */}
      {result?.analysis?.wuxingPercent && (
        <View style={styles.card}>
          <WuXingChart
            data={result.analysis.wuxingPercent}
            onReadPress={handleWuXingRead}
          />
        </View>
      )}

      {/* 含藏干统计 - 新版 UI */}
      {result?.pillars && result?.analysis?.hiddenStems && (
        <View style={styles.card}>
          <HiddenStemsCard
            pillars={result.pillars}
            hiddenStems={result.analysis.hiddenStems}
          />
        </View>
      )}

      {/* 喜忌用神 */}
      {result?.analysis?.gods && result?.pillars && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>喜忌用神</Text>
          </View>

          {/* 四柱卡片 */}
          <FourPillarsCard
            pillars={result.pillars}
            dayMasterWuxing={dayMasterWuxing}
            strengthLabel={strengthLabel}
          />

          {/* 喜忌用神流程图 */}
          <View style={{ marginTop: spacing.sm }}>
            <GodsFlowChart
              gods={result.analysis.gods}
              dayMasterWuxing={dayMasterWuxing}
            />
          </View>
        </View>
      )}
      </ScrollView>
    </View>
  );
};


// ===== 样式 =====
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5', // 浅灰色背景
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: spacing.lg,
    // 不設置左右 padding，讓卡片與屏幕邊緣對齊
  },

  // 卡片样式（全宽，只有上边框）
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
    fontSize: 16,
    fontWeight: fontWeights.bold,
    color: colors.ink,
  },

  // 基本信息样式
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    width: 60,
    fontSize: 14,
    fontWeight: fontWeights.medium,
    color: colors.ink,
  },
  infoValue: {
    flex: 1,
    fontSize: 15,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
  },

  // 日主概览样式
  dayMasterInfo: {
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  dayMasterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  dayMasterLabel: {
    fontSize: 14,
    fontWeight: fontWeights.medium,
    color: colors.ink,
  },
  dayMasterValue: {
    fontSize: 16,
    fontWeight: fontWeights.bold,
    color: colors.ink,
  },
  descriptionBox: {
    backgroundColor: '#f8fafc',
    borderLeftWidth: 3,
    // borderLeftColor: 动态设置（根据五行）
    borderRadius: 8,
    padding: 14,
    marginTop: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: '#374151',
  },
  
  // 日主概览新样式
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
  },
  dayStemBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    // backgroundColor: 动态设置
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 12,
  },
  dayStemText: {
    fontSize: 28,
    fontWeight: 'bold',
    // color: 动态设置（根据五行）
  },
  dayStemTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  attributeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 12,
  },
  attributeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  attributeLabel: {
    fontSize: 13,
    color: '#6b7280',
  },
  attributeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
});
