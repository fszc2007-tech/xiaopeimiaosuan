/**
 * 神煞解读弹窗组件
 * 
 * 设计文档：app.doc/features/神煞解讀彈窗設計.md
 * 
 * 功能：
 * - 显示神煞解读内容
 * - 伪流式动画展示
 * - 推荐提问
 * - 跳转聊天页面
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, fontSizes, fontWeights, spacing, radius } from '@/theme';
import { RootStackParamList } from '@/types/navigation';
import { shenshaService, ShenshaReadingDto, GenderType } from '@/services/api/shenshaService';
import { getShenshaCode, getPillarType } from '@/utils/shenshaMapping';
import { useTranslation } from 'react-i18next';
import { normalizeToZhHK } from '@/utils/normalizeText';

interface ShenShaPopupProps {
  visible: boolean;
  shenShaName: string; // 神煞名称（中文）
  pillarLabel: string; // 柱位标签（如 "年柱"、"月柱"）
  chartId: string; // 命盘 ID（用于显示）
  chartProfileId: string; // 命盘档案 ID（用于 API 调用）
  gender: GenderType; // 性別（必填，排盤時必然有性別）
  onClose: () => void;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ShenShaPopup: React.FC<ShenShaPopupProps> = ({
  visible,
  shenShaName,
  pillarLabel,
  chartId,
  chartProfileId,
  gender,
  onClose,
}) => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ShenshaReadingDto | null>(null);

  // 动画值
  const step1Opacity = useRef(new Animated.Value(0)).current;
  const step1TranslateY = useRef(new Animated.Value(10)).current;
  const step2Opacity = useRef(new Animated.Value(0)).current;
  const step2TranslateY = useRef(new Animated.Value(10)).current;

  // 获取神煞代码和柱位类型
  const shenshaCode = getShenshaCode(shenShaName);
  const pillarType = getPillarType(pillarLabel);

  // 调试日志
  useEffect(() => {
    if (visible) {
      console.log('[ShenShaPopup] 弹窗打开:', {
        shenShaName,
        pillarLabel,
        shenshaCode,
        pillarType,
      });
    }
  }, [visible, shenShaName, pillarLabel, shenshaCode, pillarType]);

  // 加载数据
  useEffect(() => {
    if (!visible) {
      return;
    }
    
    // 映射失败时显示错误
    if (!shenshaCode || !pillarType) {
      console.warn('[ShenShaPopup] 映射失败:', {
        shenshaCode,
        pillarType,
        shenShaName,
        pillarLabel,
      });
      setError(`暫無「${normalizeToZhHK(shenShaName)}」的解讀資料`);
      setLoading(false);
      setData(null);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      setError(null);
      setData(null);

      // 重置动画
      step1Opacity.setValue(0);
      step1TranslateY.setValue(10);
      step2Opacity.setValue(0);
      step2TranslateY.setValue(10);

      try {
        console.log('[ShenShaPopup] 開始載入數據:', { shenshaCode, pillarType, gender });
        const reading = await shenshaService.getReading(shenshaCode, pillarType, gender);
        console.log('[ShenShaPopup] 數據載入成功:', reading);
        setData(reading);

        // 启动动画
        startAnimations();
      } catch (err: any) {
        console.error('[ShenShaPopup] 數據載入失敗:', err);
        setError(err.message || t('shensha.loadFailed') || '獲取神煞解讀失敗');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [visible, shenshaCode, pillarType, gender]);

  // 启动动画
  const startAnimations = () => {
    // Step 1: 核心含义（150ms）
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(step1Opacity, {
          toValue: 1,
          duration: 250,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(step1TranslateY, {
          toValue: 0,
          duration: 250,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    }, 150);

    // Step 2: 推荐提问（350ms）
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(step2Opacity, {
          toValue: 1,
          duration: 250,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(step2TranslateY, {
          toValue: 0,
          duration: 250,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    }, 350);
  };

  // 处理推荐提问点击
  const handleQuestionClick = (question: string) => {
    if (!shenshaCode || !pillarType) return;

    onClose();
    navigation.navigate('Chat', {
      conversationId: 'new',
      question,
      masterId: chartProfileId, // 使用 chartProfileId 而不是 chartId
      source: 'shen_sha_popup',
      shenShaCode: shenshaCode,
      pillarType,
    });
  };

  // 处理主 CTA 点击
  const handleCTAClick = () => {
    if (!shenshaCode || !pillarType) return;

    const question = `${normalizeToZhHK(shenShaName)}對我的影響是什麼？`;
    onClose();
    navigation.navigate('Chat', {
      conversationId: 'new',
      question,
      masterId: chartProfileId, // 使用 chartProfileId 而不是 chartId
      source: 'shen_sha_popup',
      shenShaCode: shenshaCode,
      pillarType,
    });
  };


  // 获取徽标样式
  const getBadgeStyle = (type: 'auspicious' | 'inauspicious' | 'neutral') => {
    switch (type) {
      case 'auspicious':
        return { backgroundColor: colors.greenSoftBg, color: colors.brandGreen };
      case 'inauspicious':
        return { backgroundColor: colors.orangeSoftBg, color: colors.ink };
      case 'neutral':
        return { backgroundColor: colors.blueSoftBg, color: colors.brandBlue };
      default:
        return { backgroundColor: colors.blueSoftBg, color: colors.brandBlue };
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      testID="shensha-popup-modal"
    >
      <Pressable style={styles.overlay} onPress={onClose} testID="shensha-popup-overlay">
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()} testID="shensha-popup-sheet">
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={true}
          >
            {/* 拖拽指示器 */}
            <View style={styles.dragIndicator} />

            {/* 标题区（Step 0 - 立即显示） */}
            <View style={styles.titleSection} testID="shensha-popup-title-section">
              <View style={styles.titleHeader}>
                <Text style={styles.pillarLabel} testID="shensha-popup-pillar-label">{pillarLabel} · {t('shensha.interpret')}</Text>
                <Pressable onPress={handleCTAClick} style={styles.readButton}>
                  <Text style={styles.readButtonText}>小佩解讀 →</Text>
                </Pressable>
              </View>
              <View style={styles.titleRow} testID="shensha-popup-title-row">
                <Text style={styles.title} testID="shensha-popup-title">{normalizeToZhHK(shenShaName)}</Text>
                {data && (
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor: getBadgeStyle(data.type).backgroundColor,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        { color: getBadgeStyle(data.type).color },
                      ]}
                    >
                      {normalizeToZhHK(data.badge_text)}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* 加载状态 */}
            {loading && (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>{t('shensha.loading')}</Text>
              </View>
            )}

            {/* 错误状态 */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* 内容区域 - 确保始终显示，即使数据加载中 */}
            {!loading && !error && data && (
              <>
                {/* Step 1: 柱位特定解读（用户提供的数据） */}
                <Animated.View
                  style={[
                    styles.stepContainer,
                    {
                      opacity: step1Opacity,
                      transform: [{ translateY: step1TranslateY }],
                    },
                  ]}
                >
                  <View style={styles.summaryCard}>
                    <Text style={styles.summaryText}>
                      {normalizeToZhHK(
                        data.pillar_explanation && data.pillar_explanation.length > 0
                          ? data.pillar_explanation[0].text
                          : data.summary
                      )}
                    </Text>
                  </View>
                </Animated.View>

                {/* Step 2: 推荐提问区 */}
                {data.recommended_questions && data.recommended_questions.length > 0 && (
                  <Animated.View
                    style={[
                      styles.stepContainer,
                      {
                        opacity: step2Opacity,
                        transform: [{ translateY: step2TranslateY }],
                      },
                    ]}
                  >
                    <Text style={styles.sectionTitle}>{t('shensha.recommendedQuestionsTitle')}</Text>
                    <View style={styles.questionsContainer}>
                      {data.recommended_questions.slice(0, 4).map((question, index) => (
                        <Pressable
                          key={index}
                          style={styles.questionChip}
                          onPress={() => handleQuestionClick(question)}
                        >
                          <Text style={styles.questionChipText}>{normalizeToZhHK(question)}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </Animated.View>
                )}
              </>
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.cardBg || '#FFFFFF', // 使用白色背景，确保文字可见
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    height: Dimensions.get('window').height * 0.6, // 半屏高度
    maxHeight: '90%', // 最大高度限制
    paddingTop: spacing.xs, // 减少顶部内边距：4px
  },
  scrollView: {
    flex: 1,
    maxHeight: '100%', // 确保不超出容器
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: spacing.sm, // 减少顶部内边距：8px（为拖拽指示器留空间）
    paddingBottom: spacing.xl + 40, // 底部内边距
    flexGrow: 1, // 确保内容可以撑开
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: colors.disabledBg,
    borderRadius: radius.pill,
    alignSelf: 'center',
    marginBottom: spacing.xs, // 减少间距：4px
  },
  titleSection: {
    marginBottom: spacing.xs / 2, // 极小间距：4px
  },
  titleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm, // 统一间距：sm (8px)
  },
  pillarLabel: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    lineHeight: 18, // 统一行间距：xs 字体使用 18
  },
  readButton: {
    paddingVertical: spacing.xs / 2,
    paddingHorizontal: spacing.xs,
  },
  readButtonText: {
    fontSize: fontSizes.sm,
    color: colors.primary,
    fontWeight: fontWeights.medium,
    lineHeight: 20, // 统一行间距：sm 字体使用 20
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm, // 统一间距：sm (8px)
  },
  title: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.ink,
    lineHeight: 24, // 统一行间距
  },
  badge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs / 2,
    borderRadius: radius.pill,
    marginLeft: spacing.sm,
  },
  badgeText: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.medium,
    lineHeight: 18, // 统一行间距：xs 字体使用 18
  },
  loadingContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: fontSizes.base,
    color: colors.textSecondary,
    lineHeight: 24, // 统一行间距：base 字体使用 24
  },
  errorContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  errorText: {
    fontSize: fontSizes.base,
    color: colors.error,
    lineHeight: 24, // 统一行间距：base 字体使用 24
  },
  stepContainer: {
    marginTop: spacing.sm, // 8px
  },
  shortTitle: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    color: colors.ink,
    lineHeight: 24, // 统一行间距：base 字体使用 24
  },
  summaryCard: {
    backgroundColor: colors.disabledBg,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginTop: 6, // 6px
  },
  summaryText: {
    fontSize: fontSizes.sm,
    color: colors.ink,
    lineHeight: 20, // 统一行间距：sm 字体使用 20
  },
  sectionTitle: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
    marginBottom: spacing.md, // 统一间距：12px
    lineHeight: 20, // 统一行间距：sm 字体使用 20
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  bulletDot: {
    fontSize: fontSizes.base,
    color: colors.brandBlue,
    marginRight: spacing.xs,
  },
  bulletText: {
    flex: 1,
    fontSize: fontSizes.sm,
    color: colors.ink,
    lineHeight: 20, // 统一行间距：sm 字体使用 20
  },
  positionText: {
    fontSize: fontSizes.sm,
    color: colors.ink,
    lineHeight: 20, // 统一行间距：sm 字体使用 20
  },
  questionsContainer: {
    flexDirection: 'column', // 改为纵向布局，每个问题占一行
    gap: spacing.sm, // 问题之间的间距：8px
    marginTop: 0,
  },
  questionChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm, // 增加垂直内边距
    borderRadius: radius.md, // 改为圆角矩形，更整齐
    backgroundColor: colors.blueSoftBg,
    alignSelf: 'flex-start', // 宽度自适应内容
  },
  questionChipText: {
    fontSize: fontSizes.sm,
    color: colors.ink,
    lineHeight: 20,
  },
  ctaButton: {
    backgroundColor: colors.ink,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  ctaButtonText: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    color: '#FFFFFF',
    lineHeight: 24, // 统一行间距：base 字体使用 24
  },
});

