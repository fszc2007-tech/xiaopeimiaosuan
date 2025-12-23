/**
 * 命盘详情页 / ChartDetailScreen
 * 
 * 参考文档：
 * - app.doc/features/基本信息设计文档.md
 * - app.doc/features/命盤總覽设计文档.md
 * - app.doc/前端路由与页面结构设计文档.md
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '@/types/navigation';
import { colors, fontSizes, fontWeights, spacing, radius } from '@/theme';
import { BackButton } from '@/components/common/BackButton';
import { chartService } from '@/services/api';
import { BaziChartDto } from '@/types';

import { BasicInfoTab } from './BasicInfoTab';
import { ChartOverviewTab } from './ChartOverviewTab';
import { LuckTimelineTab } from './LuckTimelineTab';

type ChartDetailRouteProps = RouteProp<RootStackParamList, 'ChartDetail'>;

type TabKey = 'basicInfo' | 'chartOverview' | 'luckTimeline';

export const ChartDetailScreen: React.FC = () => {
  const route = useRoute<ChartDetailRouteProps>();
  const navigation = useNavigation();
  
  const { chartId } = route.params;
  
  const [activeTab, setActiveTab] = useState<TabKey>('basicInfo');
  const [chartData, setChartData] = useState<BaziChartDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    loadChartData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartId]);
  
  const loadChartData = async () => {
    try {
      setIsLoading(true);
      
      // ✅ chartService.getChartDetail 使用辅助函数，直接返回数据（不是 ApiResponse）
      const data = await chartService.getChartDetail(chartId);
      
      console.log('📥 命盘详情响应:', data);
      
      if (data) {
        setChartData(data);
        console.log('✅ 命盘数据设置成功');
      } else {
        console.error('❌ 命盘数据为空');
      }
    } catch (error: any) {
      console.error('❌ 加载命盘数据失败:', error);
      // TODO: 显示错误提示
    } finally {
      setIsLoading(false);
    }
  };
  
  const tabs = [
    { key: 'basicInfo' as TabKey, label: '基本資訊' },
    { key: 'chartOverview' as TabKey, label: '命盤總覽' },
    { key: 'luckTimeline' as TabKey, label: '大運流年' },
  ];
  
  const renderTabContent = () => {
    if (!chartData) return null;
    
    switch (activeTab) {
      case 'basicInfo':
        return <BasicInfoTab chartData={chartData} />;
      case 'chartOverview':
        return <ChartOverviewTab chartData={chartData} />;
      case 'luckTimeline':
        return <LuckTimelineTab chartData={chartData} />;
      default:
        return null;
    }
  };
  
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>加載中...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* 顶部栏 */}
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>{chartData?.profile?.name || '命盤詳情'}</Text>
        <View style={styles.headerRight} />
      </View>
      
      {/* Tab 栏 */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabItem}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab.key && styles.tabTextActive,
            ]}>
              {tab.label}
            </Text>
            {activeTab === tab.key && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Tab 内容 */}
      {renderTabContent()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSizes.base,
    color: colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.bg,
  },
  headerTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
  },
  headerRight: {
    width: 44,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  tabText: {
    fontSize: fontSizes.base,
    color: colors.ink,
    fontWeight: fontWeights.regular,
  },
  tabTextActive: {
    color: colors.ink,
    fontWeight: fontWeights.semibold,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    width: '60%',
    height: 2,
    backgroundColor: colors.primary,
  },
});

