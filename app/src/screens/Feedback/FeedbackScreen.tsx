/**
 * 意见反馈页面
 * 
 * 设计文档：app.doc/features/我的-二级-意见反馈和客服设计文档.md (1.2节)
 * 
 * 功能：
 * - Tab 切换（使用建议/遇到问题）
 * - 文本输入（0-500字）
 * - 联系方式输入（必填）
 * - 开关选项（接受联系/上传日志）
 * - 提交反馈
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Switch,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react-native';
import { BackButton } from '@/components/common/BackButton';
import { colors, fontSizes, fontWeights, spacing, radius, shadows } from '@/theme';
import { feedbackService } from '@/services/api';

// ===== 类型定义 =====
type FeedbackType = 'suggest' | 'problem';

// ===== 主组件 =====
export const FeedbackScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();

  // 状态
  const [selectedType, setSelectedType] = useState<FeedbackType>('suggest');
  const [suggestContent, setSuggestContent] = useState('');
  const [problemContent, setProblemContent] = useState('');
  const [contact, setContact] = useState('');
  const [showThankYou, setShowThankYou] = useState(false);

  // 根据当前tab获取对应的content
  const content = selectedType === 'suggest' ? suggestContent : problemContent;
  const setContent = selectedType === 'suggest' ? setSuggestContent : setProblemContent;

  // Tab 配置
  const tabs = [
    { key: 'suggest' as FeedbackType, label: t('feedback.tabSuggest') },
    { key: 'problem' as FeedbackType, label: t('feedback.tabProblem') },
  ];

  // 说明文字
  const descriptions = {
    suggest: t('feedback.descriptionSuggest'),
    problem: t('feedback.descriptionProblem'),
  };

  // Placeholder
  const placeholders = {
    suggest: t('feedback.placeholderSuggest'),
    problem: t('feedback.placeholderProblem'),
  };

  // 处理提交
  const handleSubmit = async () => {
    // 表单验证
    if (!content.trim()) {
      Alert.alert(t('feedback.alertTitle'), t('feedback.pleaseEnterContent'));
      return;
    }

    // 调用 API 提交反馈
    try {
      await feedbackService.submit({
        type: selectedType,
        content,
        contact: contact.trim() || undefined,
      });

      // 提交成功后清空表单
      if (selectedType === 'suggest') {
        setSuggestContent('');
      } else {
        setProblemContent('');
      }
      setContact('');
      
      // 显示感谢页
      setShowThankYou(true);
    } catch (error: any) {
      console.error('[Feedback] 提交失败:', error);
      Alert.alert(
        t('feedback.submitFailed'), 
        error.message || t('feedback.submitFailedMessage')
      );
    }
  };

  // 处理取消
  const handleCancel = () => {
    if (content.trim() || contact.trim()) {
      Alert.alert(t('feedback.confirmCancel'), t('feedback.confirmCancelMessage'), [
        { text: t('feedback.continueEditing'), style: 'cancel' },
        {
          text: t('feedback.confirmDiscard'),
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ]);
    } else {
      navigation.goBack();
    }
  };

  // 处理感谢页关闭
  const handleThankYouClose = () => {
    setShowThankYou(false);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton />
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Tab 切换 */}
        <View style={styles.tabContainer}>
          <View style={styles.tabBackground}>
            {tabs.map((tab) => (
              <Pressable
                key={tab.key}
                style={[
                  styles.tab,
                  selectedType === tab.key && styles.tabActive,
                ]}
                onPress={() => setSelectedType(tab.key)}
              >
                <Text
                  style={[
                    styles.tabText,
                    selectedType === tab.key && styles.tabTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* 说明文字 */}
        <Text style={styles.description}>{descriptions[selectedType]}</Text>

        {/* 文本输入框 */}
        <View style={styles.card}>
          <TextInput
            style={styles.textArea}
            placeholder={placeholders[selectedType]}
            placeholderTextColor={colors.textSecondary}
            multiline
            maxLength={500}
            value={content}
            onChangeText={setContent}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{content.length} / 500</Text>
        </View>

        {/* 联系方式输入 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('feedback.contactLabel')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('feedback.contactPlaceholder')}
            placeholderTextColor={colors.textSecondary}
            value={contact}
            onChangeText={setContact}
          />
        </View>

        {/* 底部按钮 */}
        <View style={styles.buttonRow}>
          <Pressable
            style={({ pressed }) => [
              styles.cancelButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleCancel}
          >
            <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.submitButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>{t('feedback.submit')}</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* 感谢页弹窗 */}
      <ThankYouModal visible={showThankYou} onClose={handleThankYouClose} />
    </SafeAreaView>
  );
};

// ===== 感谢页组件 =====
interface ThankYouModalProps {
  visible: boolean;
  onClose: () => void;
}

const ThankYouModal: React.FC<ThankYouModalProps> = ({ visible, onClose }) => {
  const { t } = useTranslation();
  
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.thankYouOverlay}>
        <View style={styles.thankYouContainer}>
          {/* 图标 */}
          <Sparkles color={colors.brandGreen} size={48} />

          {/* 标题 */}
          <Text style={styles.thankYouTitle}>{t('feedback.thankYouTitle')}</Text>

          {/* 描述 */}
          <Text style={styles.thankYouDesc}>
            {t('feedback.thankYouMessage')}
          </Text>

          {/* 按钮 */}
          <Pressable
            style={({ pressed }) => [
              styles.thankYouButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={onClose}
          >
            <Text style={styles.thankYouButtonText}>{t('common.confirm')}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

// ===== 样式 =====
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 44,
  },
  headerRight: {
    width: 40,
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'],
  },

  // Tab 切换
  tabContainer: {
    marginBottom: spacing.md,
  },
  tabBackground: {
    flexDirection: 'row',
    backgroundColor: colors.disabledBg,
    borderRadius: radius.pill,
    padding: spacing.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.bg,
    ...shadows.card,
  },
  tabText: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.ink,
    fontWeight: fontWeights.medium,
  },

  // 说明文字
  description: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.md,
  },

  // 卡片
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: radius.lg,
    ...shadows.card,
    padding: spacing.md,
    marginBottom: spacing.md,
  },

  // 文本输入框
  textArea: {
    fontSize: fontSizes.sm,
    color: colors.ink,
    minHeight: 120,
    maxHeight: 200,
    textAlignVertical: 'top',
    marginBottom: spacing.xs,
  },
  charCount: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    textAlign: 'right',
  },

  // 联系方式输入
  cardTitle: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  input: {
    fontSize: fontSizes.sm,
    color: colors.ink,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    height: 44,
  },

  // 开关选项
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  switchRowLast: {
    marginBottom: 0,
  },
  switchTextContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  switchLabel: {
    fontSize: fontSizes.base,
    color: colors.ink,
    marginBottom: 2,
  },
  switchDesc: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
  },

  // 底部按钮
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    fontWeight: fontWeights.medium,
  },
  submitButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: fontSizes.sm,
    color: '#FFFFFF',
    fontWeight: fontWeights.medium,
  },
  buttonPressed: {
    opacity: 0.7,
  },

  // 感谢页
  thankYouOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  thankYouContainer: {
    backgroundColor: colors.cardBg,
    borderRadius: radius.lg,
    ...shadows.card,
    padding: spacing.xl,
    maxWidth: 320,
    width: '100%',
    alignItems: 'center',
  },
  thankYouTitle: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  thankYouDesc: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  thankYouButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    width: '100%',
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thankYouButtonText: {
    fontSize: fontSizes.sm,
    color: '#FFFFFF',
    fontWeight: fontWeights.medium,
  },
});

