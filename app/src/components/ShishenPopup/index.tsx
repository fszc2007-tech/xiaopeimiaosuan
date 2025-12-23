/**
 * 十神解读弹窗组件
 * 
 * 设计文档：复用神煞解读弹窗设计
 * 
 * 功能：
 * - 显示十神解读内容
 * - 伪流式动画展示
 * - 推荐提问
 * - 跳转聊天页面
 * - 显示喜神/忌神标签
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
import { shishenService, ShishenReadingDto, GenderType } from '@/services/api/shishenService';
import { getShishenCode, getPillarType } from '@/utils/shishenMapping';
import { useTranslation } from 'react-i18next';
import { normalizeToZhHK } from '@/utils/normalizeText';

interface ShishenPopupProps {
  visible: boolean;
  shishenName: string; // 十神名称（中文）
  pillarLabel: string; // 柱位标签（如 "年柱"、"月柱"）
  chartId: string; // 命盘 ID（用于显示）
  chartProfileId: string; // 命盘档案 ID（用于 API 调用）
  gender: GenderType; // 性別（必填，排盤時必然有性別）
  onClose: () => void;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ShishenPopup: React.FC<ShishenPopupProps> = ({
  visible,
  shishenName,
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
  const [data, setData] = useState<ShishenReadingDto | null>(null);

  // 动画值
  const step1Opacity = useRef(new Animated.Value(0)).current;
  const step1TranslateY = useRef(new Animated.Value(10)).current;
  const step2Opacity = useRef(new Animated.Value(0)).current;
  const step2TranslateY = useRef(new Animated.Value(10)).current;

  // 获取十神代码和柱位类型
  const shishenCode = getShishenCode(shishenName);
  const pillarType = getPillarType(pillarLabel);

  // 调试日志
  useEffect(() => {
    if (visible) {
      console.log('[ShishenPopup] 弹窗打开:', {
        shishenName,
        pillarLabel,
        shishenCode,
        pillarType,
      });
    }
  }, [visible, shishenName, pillarLabel, shishenCode, pillarType]);

  // 加载数据
  useEffect(() => {
    if (!visible) {
      return;
    }
    
    // 映射失败时显示错误
    if (!shishenCode || !pillarType) {
      console.warn('[ShishenPopup] 映射失败:', {
        shishenCode,
        pillarType,
        shishenName,
        pillarLabel,
      });
      setError(`暫無「${normalizeToZhHK(shishenName)}」的解讀資料`);
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
        console.log('[ShishenPopup] 開始載入數據:', { shishenCode, pillarType, gender, chartId });
        const reading = await shishenService.getReading(shishenCode, pillarType, gender, chartId);
        console.log('[ShishenPopup] 數據載入成功:', reading);
        setData(reading);

        // 启动动画
        startAnimations();
      } catch (err: any) {
        console.error('[ShishenPopup] 數據載入失敗:', err);
        setError(err.message || '獲取十神解讀失敗');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [visible, shishenCode, pillarType, gender, chartId]);

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
    if (!shishenCode || !pillarType) return;

    onClose();
    navigation.navigate('Chat', {
      conversationId: 'new',
      question,
      masterId: chartProfileId,
      source: 'shen_sha_popup', // 复用神煞弹窗的 source
      shenShaCode: shishenCode, // 复用神煞的参数名
      pillarType,
    });
  };

  // 处理主 CTA 点击
  const handleCTAClick = () => {
    if (!shishenCode || !pillarType) return;

    const question = `${normalizeToZhHK(shishenName)}對我的影響是什麼？`;
    onClose();
    navigation.navigate('Chat', {
      conversationId: 'new',
      question,
      masterId: chartProfileId,
      source: 'shen_sha_popup', // 复用神煞弹窗的 source
      shenShaCode: shishenCode, // 复用神煞的参数名
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

  // 获取喜神/忌神标签文本
  const getFavorStatusText = (status?: 'favorable' | 'unfavorable' | 'neutral') => {
    if (!status || status === 'neutral') return null;
    return status === 'favorable' ? '喜神' : '忌神';
  };

  // 获取喜神/忌神标签样式
  const getFavorStatusStyle = (status?: 'favorable' | 'unfavorable' | 'neutral') => {
    if (!status || status === 'neutral') {
      return { backgroundColor: colors.disabledBg, color: colors.ink };
    }
    return status === 'favorable'
      ? { backgroundColor: colors.greenSoftBg, color: colors.brandGreen }
      : { backgroundColor: colors.orangeSoftBg, color: colors.ink };
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      testID="shishen-popup-modal"
    >
      <Pressable style={styles.overlay} onPress={onClose} testID="shishen-popup-overlay">
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()} testID="shishen-popup-sheet">
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={true}
          >
            {/* 拖拽指示器 */}
            <View style={styles.dragIndicator} />

            {/* 标题区（Step 0 - 立即显示） */}
            <View style={styles.titleSection} testID="shishen-popup-title-section">
              <View style={styles.titleHeader}>
                <Text style={styles.pillarLabel} testID="shishen-popup-pillar-label">{pillarLabel} · 解讀</Text>
                <Pressable onPress={handleCTAClick} style={styles.readButton}>
                  <Text style={styles.readButtonText}>小佩解讀 →</Text>
                </Pressable>
              </View>
              <View style={styles.titleRow} testID="shishen-popup-title-row">
                <Text style={styles.title} testID="shishen-popup-title">{normalizeToZhHK(shishenName)}</Text>
                {data && (
                  <View style={styles.badgeContainer}>
                    {/* 第一个标签：十神本身的标签 */}
                    {data.badge_text && (
                      <View style={[styles.badge, getBadgeStyle(data.type)]}>
                        <Text style={[styles.badgeText, { color: getBadgeStyle(data.type).color }]}>
                          {data.badge_text}
                        </Text>
                      </View>
                    )}
                    {/* 第二个标签：喜神/忌神（动态） */}
                    {getFavorStatusText(data.favor_status) && (
                      <View style={[styles.badge, getFavorStatusStyle(data.favor_status)]}>
                        <Text style={[styles.badgeText, { color: getFavorStatusStyle(data.favor_status).color }]}>
                          {getFavorStatusText(data.favor_status)}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            </View>

            {/* 加载状态 */}
            {loading && (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>載入中...</Text>
              </View>
            )}

            {/* 错误状态 */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* 内容区 */}
            {data && !loading && !error && (
              <>
                {/* Step 1: 核心含义（动画） */}
                <Animated.View
                  style={[
                    styles.contentSection,
                    {
                      opacity: step1Opacity,
                      transform: [{ translateY: step1TranslateY }],
                    },
                  ]}
                  testID="shishen-popup-content-section"
                >
                  {data.pillar_explanation && data.pillar_explanation.length > 0 && (
                    <Text style={styles.contentText}>
                      {data.pillar_explanation[0].text}
                    </Text>
                  )}
                </Animated.View>

                {/* Step 2: 推荐提问（动画） */}
                {data.recommended_questions && data.recommended_questions.length > 0 && (
                  <Animated.View
                    style={[
                      styles.questionsSection,
                      {
                        opacity: step2Opacity,
                        transform: [{ translateY: step2TranslateY }],
                      },
                    ]}
                    testID="shishen-popup-questions-section"
                  >
                    <Text style={styles.questionsTitle}>推薦提問</Text>
                    {data.recommended_questions.map((question, index) => (
                      <Pressable
                        key={index}
                        style={styles.questionItem}
                        onPress={() => handleQuestionClick(question)}
                      >
                        <Text style={styles.questionText}>{question}</Text>
                        <Text style={styles.questionArrow}>→</Text>
                      </Pressable>
                    ))}
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
  badgeContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  badgeText: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.medium,
  },
  loadingContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: fontSizes.base,
    color: colors.textSecondary,
  },
  errorContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  errorText: {
    fontSize: fontSizes.base,
    color: colors.error,
  },
  contentSection: {
    marginBottom: spacing.lg,
  },
  contentText: {
    fontSize: fontSizes.base,
    lineHeight: 24,
    color: colors.ink,
  },
  questionsSection: {
    marginTop: spacing.lg,
  },
  questionsTitle: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  questionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.disabledBg,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
  questionText: {
    flex: 1,
    fontSize: fontSizes.sm,
    color: colors.ink,
  },
  questionArrow: {
    fontSize: fontSizes.base,
    color: colors.brandBlue,
    marginLeft: spacing.sm,
  },
});

