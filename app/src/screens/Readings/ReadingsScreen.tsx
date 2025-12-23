/**
 * 我的解读页面
 * 
 * 设计文档：app.doc/features/我的-二级-内容查看页面设计文档.md (1.2节)
 * 
 * 功能：
 * - 展示解读列表
 * - 按主题筛选（可选）
 * - 跳转到解读详情
 * 
 * 注意：如果数据不具备，显示"开发中"提示
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { BookOpen, Sparkles } from 'lucide-react-native';
import { colors, fontSizes, fontWeights, spacing, radius, shadows } from '@/theme';

// ===== 类型定义 =====
type ThemeKey = 'wealth' | 'career' | 'marriage' | 'health' | 'general';

interface ReadingItem {
  readingId: string;
  title: string;
  theme: ThemeKey;
  summary: string;
  chartId: string;
  chartName: string;
  createdAt: string;
  isFavorite: boolean;
}

// ===== 主组件 =====
export const ReadingsScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  
  // 主题配置（使用函数以支持i18n）
  const getThemeLabel = (theme: ThemeKey): string => {
    const labels: Record<ThemeKey, string> = {
      wealth: t('readings.themeWealth'),
      career: t('readings.themeCareer'),
      marriage: t('readings.themeMarriage'),
      health: t('readings.themeHealth'),
      general: t('readings.themeGeneral'),
    };
    return labels[theme];
  };

  const [readings, setReadings] = useState<ReadingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isApiAvailable, setIsApiAvailable] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<ThemeKey | null>(null);

  // 加载解读列表
  useEffect(() => {
    loadReadings();
  }, []);

  const loadReadings = async () => {
    try {
      setIsLoading(true);

      // TODO: 调用 API 获取解读列表
      // const response = await readingApi.getList({
      //   theme: selectedTheme,
      // });
      // setReadings(response.readings);
      // setIsApiAvailable(true);

      // 检查 API 是否可用
      // 如果不可用，保持 isApiAvailable = false
      setIsApiAvailable(false);
    } catch (error: any) {
      console.error('Failed to load readings:', error);
      setIsApiAvailable(false);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理解读点击
  const handleReadingPress = (reading: ReadingItem) => {
    // TODO: 跳转到解读详情页面
    // navigation.navigate('ReadingDetail', { readingId: reading.readingId });
  };

  // 如果 API 不可用，显示"开发中"
  if (!isLoading && !isApiAvailable) {
    return (
      <View style={styles.container}>
        <View style={styles.devContainer}>
          <BookOpen size={64} color={colors.textSecondary} strokeWidth={1} />
          <Text style={styles.devTitle}>{t('readings.inDevelopment')}</Text>
          <Text style={styles.devDesc}>
            {t('readings.inDevelopmentMessage')}
          </Text>
        </View>
      </View>
    );
  }

  // 加载中
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </View>
    );
  }

  // 空状态
  if (readings.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Sparkles size={64} color={colors.textSecondary} strokeWidth={1} />
          <Text style={styles.emptyTitle}>{t('readings.emptyTitle')}</Text>
          <Text style={styles.emptyDesc}>
            {t('readings.emptyDescription')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 页面标题和说明 */}
        <View style={styles.header}>
          <Text style={styles.title}>解讀歸檔</Text>
          <Text style={styles.description}>
            這裡會集中展示你所有的命理分析卡和重要解讀，方便隨時回看。
          </Text>
        </View>

        {/* 筛选 Chips（可选） */}
        {/* <View style={styles.filterContainer}>
          {Object.entries(THEME_LABELS).map(([key, label]) => (
            <Pressable
              key={key}
              style={[
                styles.filterChip,
                selectedTheme === key && styles.filterChipActive,
              ]}
              onPress={() => setSelectedTheme(key as ThemeKey)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedTheme === key && styles.filterChipTextActive,
                ]}
              >
                {label}
              </Text>
            </Pressable>
          ))}
        </View> */}

        {/* 解读列表 */}
        {readings.map((reading) => (
          <Pressable
            key={reading.readingId}
            style={({ pressed }) => [
              styles.readingCard,
              pressed && styles.readingCardPressed,
            ]}
            onPress={() => handleReadingPress(reading)}
          >
            <Text style={styles.readingTheme}>
              {THEME_LABELS[reading.theme]}
            </Text>
            <Text style={styles.readingTitle}>{reading.title}</Text>
            <Text style={styles.readingDate}>
              生成時間：{new Date(reading.createdAt).toLocaleDateString('zh-HK')}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

// ===== 样式 =====
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['2xl'],
  },

  // 页面标题
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },

  // 筛选 Chips
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  filterChip: {
    backgroundColor: colors.disabledBg,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  filterChipActive: {
    backgroundColor: colors.greenSoftBg,
  },
  filterChipText: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.primary,
    fontWeight: fontWeights.medium,
  },

  // 解读卡片
  readingCard: {
    backgroundColor: colors.cardBg,
    borderRadius: radius.lg,
    ...shadows.card,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  readingCardPressed: {
    opacity: 0.7,
  },
  readingTheme: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  readingTitle: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  readingDate: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
  },

  // 开发中提示
  devContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['2xl'],
  },
  devTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  devDesc: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  // 加载中
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },

  // 空状态
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['2xl'],
  },
  emptyTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyDesc: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

