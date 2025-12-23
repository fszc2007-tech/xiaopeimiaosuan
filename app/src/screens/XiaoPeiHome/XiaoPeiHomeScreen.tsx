/**
 * 小佩主页
 * 
 * 功能：
 * - 展示当前命盘信息（CurrentChartSelector）
 * - 6 个话题入口（使用 TOPIC_META 配置表）
 * - 大家常问示例
 * - 自由输入框
 * - 跳转到聊天页时传递参数（topic, chart_id, question）
 * 
 * 参考文档：
 * - 小佩主页设计文档.md
 * - 小佩命盘选择功能优化方案-对比版.md
 */

import React, { useState, useMemo, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { colors, fontSizes, fontWeights, spacing, radius } from '@/theme';
import { useChartStore } from '@/store/chartStore';
import { SCREEN_NAMES } from '@/constants/routes';
import { TOPIC_META, getTopicsArray, type TopicKey } from '@/constants/xiaopeiTopics';
import { CurrentChartSelector } from './components/CurrentChartSelector';
import { ConfirmDialog } from '@/components/common';

// 使用 TOPIC_META 生成 TOPICS 数组
const TOPICS = getTopicsArray();

// 大家常问（默认话题：桃花）
const COMMON_QUESTIONS = [
  '最近桃花运怎么样，会不会有新的暧昧？',
  '我适合怎样的恋爱节奏，慢热还是一见钟情？',
  '这一两年适合多社交、多玩一点吗？',
];

export const XiaoPeiHomeScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { charts, currentChartId, setCurrentChartId, setCharts } = useChartStore();
  const [showCreateChartDialog, setShowCreateChartDialog] = useState(false);
  
  // 使用 ref 保存最新的 currentChartId，避免闭包问题
  const currentChartIdRef = useRef(currentChartId);
  currentChartIdRef.current = currentChartId;

  // 计算属性：通过 currentChartId 从 charts 列表获取 currentChart（单一真相源）
  const currentChart = useMemo(
    () => charts.find(c => c.chartProfileId === currentChartId) ?? null,
    [charts, currentChartId]
  );

  // 获取命盘列表
  const fetchCharts = useCallback(async () => {
    try {
      // 检查 token 是否存在
      const { useAuthStore } = await import('@/store');
      const token = useAuthStore.getState().token;
      
      if (!token || token.length === 0) {
        console.log('[XiaoPeiHomeScreen] ⚠️ token 不存在，跳过 API 请求');
        return;
      }

      // 调用 Core API 获取命盘列表
      const { baziApi } = await import('@/services/api');
      const data = await baziApi.getCharts({ limit: 100 });
      
      // 映射 API 返回的 profiles 到 ChartProfile 格式（store 需要的格式）
      // API 返回格式：profileId, birthYear, birthMonth, birthDay, birthHour, birthMinute
      // Store 需要格式：chartProfileId, birthday (YYYY-MM-DD), birthTime (HH:mm:ss)
      const mappedProfiles = data.profiles.map((profile: any) => {
        // 安全检查：确保所有必需字段都存在
        if (!profile.profileId || !profile.birthYear || !profile.birthMonth || !profile.birthDay) {
          console.warn('[XiaoPeiHomeScreen] 命盘数据不完整，跳过:', profile);
          return null;
        }
        
        return {
          chartProfileId: profile.profileId, // profileId → chartProfileId
          userId: profile.userId,
          name: profile.name || t('dialog.unnamed'),
          relationType: profile.relationType || 'self',
          birthday: `${profile.birthYear}-${String(profile.birthMonth).padStart(2, '0')}-${String(profile.birthDay).padStart(2, '0')}`, // 组合为 YYYY-MM-DD
          birthTime: profile.birthHour !== undefined
            ? (profile.birthMinute !== undefined 
                ? `${String(profile.birthHour).padStart(2, '0')}:${String(profile.birthMinute).padStart(2, '0')}:00`
                : `${String(profile.birthHour).padStart(2, '0')}:00:00`)
            : '00:00:00', // 组合为 HH:mm:ss，默认 00:00:00
          gender: profile.gender || 'male',
          calendarType: 'solar' as const, // 默认公历
          useTrueSolarTime: false, // 默认值
          baziChartId: profile.chartId, // chartId → baziChartId
          createdAt: profile.createdAt || new Date().toISOString(),
          updatedAt: profile.lastViewedAt || profile.createdAt || new Date().toISOString(), // 使用 lastViewedAt 或 createdAt
        };
      }).filter((profile): profile is NonNullable<typeof profile> => profile !== null); // 过滤掉 null 值
      
      // 更新 store（setCharts 会自动校验并恢复 currentChartId）
      // 重要：只有在 currentChartId 为 null 或当前选择的命盘不在列表中时，才自动选择默认命盘
      // 如果用户已经手动选择过，则保持用户的选择不变
      
      // 先获取当前的 currentChartId（用户可能已经手动选择过）
      // 使用 ref 获取最新值，避免闭包问题
      const userSelectedChartId = currentChartIdRef.current;
      
      // 更新命盘列表（setCharts 内部会处理：如果 userSelectedChartId 不在列表中，会自动恢复）
      setCharts(mappedProfiles);
      
      // 只有在以下情况才自动设置：
      // 1. 当前没有选择任何命盘（userSelectedChartId 为 null）
      // 2. 当前选择的命盘不在列表中（setCharts 内部已处理，这里不再重复设置）
      // 如果用户已经手动选择过且该命盘仍在列表中，则不会被自动覆盖
      if (!userSelectedChartId && mappedProfiles.length > 0) {
        // 只有在没有选择时才自动选择默认命盘
        let targetChartId: string | null = null;
        
        // 优先级 1：使用最近查看的命盘（按 updatedAt 排序）
        const sortedByRecent = [...mappedProfiles].sort((a, b) => {
          const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
          const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
          return timeB - timeA; // 降序，最新的在前
        });
        targetChartId = sortedByRecent[0].chartProfileId;
        
        if (targetChartId) {
          setCurrentChartId(targetChartId);
        }
      } else if (mappedProfiles.length === 0 && userSelectedChartId) {
        // 如果命盘列表为空，清空 currentChartId
        setCurrentChartId(null);
      }
    } catch (error: any) {
      console.error('[XiaoPeiHomeScreen] ❌ Failed to fetch charts:', error);
      // 静默失败，不影响页面显示
    }
  }, [setCharts, setCurrentChartId]);

  // 页面聚焦时刷新命盘列表
  useFocusEffect(
    useCallback(() => {
      fetchCharts();
    }, [fetchCharts])
  );

  // 处理话题点击（硬约定：必须拦截无命盘情况）
  const handleTopicPress = (topicKey: TopicKey) => {
    if (!currentChartId) {
      // 硬约定：必须弹窗拦截，不允许仅 console.warn
      setShowCreateChartDialog(true);
      return;
    }

    // 获取 topic 配置
    const topicMeta = TOPIC_META[topicKey];
    
    // 硬约定：question 必须从配置表获取，不允许手写
    const questionText = topicMeta.defaultQuestion;

    // 跳转到聊天页，携带统一参数
    navigation.navigate(SCREEN_NAMES.CHAT as any, {
      topic: topicMeta.enum,  // 后端枚举值（'LOVE' 等，后端会识别为恋爱专线）
      masterId: currentChartId,  // 使用 masterId 作为参数名（与导航类型定义一致）
      question: questionText,
      source: 'xiaopei_topic_card',
    });
  };

  // 处理常见问题点击
  const handleCommonQuestionPress = (q: string) => {
    if (!currentChartId) {
      // 硬约定：必须弹窗拦截
      setShowCreateChartDialog(true);
      return;
    }

    // 大家常问默认使用恋爱·桃花话题
    const topicMeta = TOPIC_META.peach;

    navigation.navigate(SCREEN_NAMES.CHAT as any, {
      topic: topicMeta.enum,  // 'LOVE'
      masterId: currentChartId,  // 使用 masterId 作为参数名
      question: q,
      source: 'xiaopei_common_question',
    });
  };

  return (
    <ScrollView testID="xiaopei-home-screen" style={styles.container} contentContainerStyle={styles.content}>
      {/* 当前命盘组件（替换原有的命主信息卡片） */}
      <CurrentChartSelector
        currentChartId={currentChartId}
        charts={charts}
        currentChart={currentChart}
        onSwitchChart={(chartId) => {
          setCurrentChartId(chartId);
        }}
        onCreateChart={() => {
          navigation.navigate(SCREEN_NAMES.MANUAL_BAZI as any, {
            returnTo: SCREEN_NAMES.XIAOPEI_HOME,
          });
        }}
        onManageCharts={() => {
          navigation.navigate(SCREEN_NAMES.CASES as any);
        }}
      />

      {/* 话题入口 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('xiaopei.whereToStart')}</Text>
        <View style={styles.topicsGrid}>
          {TOPICS.map((topic) => (
            <Pressable
              key={topic.key}
              style={({ pressed }) => [
                styles.topicItem,
                pressed && styles.topicItemPressed,
              ]}
              onPress={() => handleTopicPress(topic.key)}
            >
              <View style={styles.topicIconContainer}>
                <topic.icon color={colors.brandGreen} size={20} />
              </View>
              <Text style={styles.topicLabel}>{topic.label}</Text>
              <Text style={styles.topicDesc} numberOfLines={2}>
                {topic.desc}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* 大家常问 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('xiaopei.commonQuestions')}</Text>
        <Text style={styles.sectionHint}>{t('xiaopei.commonQuestionsHint')}</Text>
        {COMMON_QUESTIONS.map((q, index) => (
          <Pressable
            key={index}
            style={({ pressed }) => [
              styles.questionItem,
              pressed && styles.questionItemPressed,
            ]}
            onPress={() => handleCommonQuestionPress(q)}
          >
            <Text style={styles.questionText}>{q}</Text>
          </Pressable>
        ))}
      </View>

      {/* 创建命盘提示弹窗 */}
      <ConfirmDialog
        visible={showCreateChartDialog}
        title={t('dialog.needCreateChart')}
        message={t('dialog.needCreateChartMessage')}
        cancelText={t('common.cancel')}
        confirmText={t('dialog.goCreateChart')}
        onCancel={() => setShowCreateChartDialog(false)}
        onConfirm={() => {
          setShowCreateChartDialog(false);
          navigation.navigate(SCREEN_NAMES.MANUAL_BAZI as any, {
            returnTo: SCREEN_NAMES.XIAOPEI_HOME,
          });
        }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  
  
  // 话题区
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
    marginBottom: spacing.md,
  },
  sectionHint: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  topicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  topicItem: {
    width: '48%',
    height: 120,
    backgroundColor: colors.cardBg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    justifyContent: 'flex-start',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  topicItemPressed: {
    backgroundColor: colors.blueSoftBg,
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  topicIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.greenSoftBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  topicLabel: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.bold,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: 2,
    lineHeight: 18,
  },
  topicDesc: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  
  // 常见问题
  questionItem: {
    backgroundColor: colors.blueSoftBg,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  questionItemPressed: {
    opacity: 0.7,
  },
  questionText: {
    fontSize: fontSizes.sm,
    color: colors.ink,
  },
});

