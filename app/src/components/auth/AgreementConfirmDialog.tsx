/**
 * 隐私协议确认弹窗
 * 
 * 功能：
 * - 双按钮：不同意 / 同意
 * - 协议链接可点击
 * - 点击"同意"自动勾选并进入登录
 */

import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';
import { colors, fontSizes, fontWeights, spacing, radius } from '@/theme';

interface AgreementConfirmDialogProps {
  visible: boolean;
  onAgree: () => void;
  onDisagree: () => void;
  onViewPolicy: (type: 'privacy' | 'agreement' | 'pics') => void;
}

export const AgreementConfirmDialog: React.FC<AgreementConfirmDialogProps> = ({
  visible,
  onAgree,
  onDisagree,
  onViewPolicy,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDisagree}
    >
      <Pressable style={styles.overlay} onPress={onDisagree}>
        <Pressable style={styles.dialog} onPress={(e) => e.stopPropagation()}>
          {/* 标题 */}
          <Text style={styles.title}>服務協議及隱私保護</Text>

          {/* 内容 */}
          <Text style={styles.content}>
            我已閱讀並同意
            <Text style={styles.link} onPress={() => onViewPolicy('privacy')}>《隱私政策》</Text>
            <Text style={styles.link} onPress={() => onViewPolicy('agreement')}>《用戶協議》</Text>
            及
            <Text style={styles.link} onPress={() => onViewPolicy('pics')}>《個人資料收集聲明》</Text>
          </Text>

          {/* 按钮区域 */}
          <View style={styles.buttonRow}>
            {/* 不同意按钮 */}
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.buttonDisagree,
                pressed && styles.buttonDisagreePressed,
              ]}
              onPress={onDisagree}
            >
              <Text style={styles.buttonDisagreeText}>不同意</Text>
            </Pressable>

            {/* 同意按钮 */}
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.buttonAgree,
                pressed && styles.buttonAgreePressed,
              ]}
              onPress={onAgree}
            >
              <Text style={styles.buttonAgreeText}>同意</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  dialog: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 340,
  },
  title: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  content: {
    fontSize: fontSizes.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  link: {
    color: colors.primary,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisagree: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  buttonDisagreePressed: {
    backgroundColor: '#F5F5F5',
  },
  buttonDisagreeText: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    color: colors.ink,
  },
  buttonAgree: {
    backgroundColor: '#1A1A1A',
  },
  buttonAgreePressed: {
    backgroundColor: '#333333',
  },
  buttonAgreeText: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    color: '#FFFFFF',
  },
});

