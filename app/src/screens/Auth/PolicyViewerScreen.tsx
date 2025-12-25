/**
 * PolicyViewerScreen 政策文檔查看頁面
 * 
 * 用於展示私隱政策、用戶協議、個人資料收集聲明等 Markdown 文檔
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Text } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import Markdown from 'react-native-markdown-display';
import { BackButton } from '@/components/common';
import { colors, fontSizes, fontWeights, spacing, radius } from '@/theme';

type PolicyType = 'privacy' | 'agreement' | 'pics';

type PolicyViewerRouteProp = RouteProp<{ PolicyViewer: { type: PolicyType } }, 'PolicyViewer'>;
type PolicyViewerNavigationProp = NativeStackNavigationProp<{ PolicyViewer: { type: PolicyType } }>;

import { privacyPolicy, userAgreement, pics } from '@/assets/policies/policies';

interface PolicyConfig {
  title: string;
  markdownFile: string;
}

const POLICY_CONFIG: Record<PolicyType, PolicyConfig> = {
  privacy: {
    title: '私隱政策',
    markdownFile: privacyPolicy,
  },
  agreement: {
    title: '用戶協議',
    markdownFile: userAgreement,
  },
  pics: {
    title: '個人資料收集聲明',
    markdownFile: pics,
  },
};

export const PolicyViewerScreen: React.FC = () => {
  const route = useRoute<PolicyViewerRouteProp>();
  const navigation = useNavigation<PolicyViewerNavigationProp>();
  const { type } = route.params;

  const [loading, setLoading] = useState(true);
  const [markdownContent, setMarkdownContent] = useState<string>('');

  const config = POLICY_CONFIG[type];

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: config.title,
      headerLeft: () => <BackButton />,
    });
  }, [navigation, config.title]);

  // 加载 Markdown 内容
  useEffect(() => {
    // Markdown 内容已经作为字符串导入，直接使用
    setMarkdownContent(config.markdownFile);
    setLoading(false);
  }, [config.markdownFile]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.brandGreen} />
          <Text style={styles.loadingText}>載入中...</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
          <Markdown style={markdownStyles}>
            {markdownContent}
          </Markdown>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

// ===== Markdown 样式配置（复用 ChatScreen 的样式）=====
const markdownStyles = {
  // 正文
  body: {
    fontSize: fontSizes.base,
    lineHeight: 24,
    color: colors.ink,
    paddingLeft: spacing.lg,
    paddingRight: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  // 一级标题 (#)
  heading1: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
    color: colors.ink,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    lineHeight: 32,
  },
  // 二级标题 (##)
  heading2: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.bold,
    color: colors.ink,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    lineHeight: 28,
  },
  // 三级标题 (###)
  heading3: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    lineHeight: 24,
  },
  // 四级标题 (####)
  heading4: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    lineHeight: 22,
  },
  // 粗体
  strong: {
    fontWeight: fontWeights.bold,
    color: colors.ink,
  },
  // 段落
  paragraph: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    lineHeight: 24,
  },
  // 列表项
  listItem: {
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
    flexDirection: 'row' as const,
  },
  // 无序列表
  bullet_list: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  // 有序列表
  ordered_list: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  // 链接
  link: {
    color: colors.primary,
    textDecorationLine: 'underline' as const,
  },
  // 水平分割线
  hr: {
    backgroundColor: colors.border,
    height: 1,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSizes.base,
    color: colors.textSecondary,
  },
});

