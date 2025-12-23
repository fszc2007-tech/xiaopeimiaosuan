/**
 * 消息提示弹窗组件
 * 
 * 用于替换系统 Alert，显示成功、错误、警告、信息等消息
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Platform,
} from 'react-native';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react-native';
import { colors, fontSizes, fontWeights, spacing, radius, shadows } from '@/theme';

export type MessageType = 'success' | 'error' | 'warning' | 'info';

interface MessageDialogProps {
  visible: boolean;
  type?: MessageType;
  title: string;
  message?: string;
  confirmText?: string;
  onConfirm: () => void;
}

export const MessageDialog: React.FC<MessageDialogProps> = ({
  visible,
  type = 'info',
  title,
  message,
  confirmText = '確定',
  onConfirm,
}) => {
  // 根据类型选择图标和颜色
  const getIconAndColor = () => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          iconColor: colors.success,
          buttonColor: colors.success, // 使用绿色主题
          backgroundColor: '#d8f3dc',
        };
      case 'error':
        return {
          icon: XCircle,
          iconColor: colors.error,
          buttonColor: colors.error,
          backgroundColor: '#fee2e2',
        };
      case 'warning':
        return {
          icon: AlertCircle,
          iconColor: colors.warning,
          buttonColor: colors.warning,
          backgroundColor: '#fef3c7',
        };
      case 'info':
      default:
        return {
          icon: Info,
          iconColor: colors.info,
          buttonColor: colors.info,
          backgroundColor: '#e5edf0',
        };
    }
  };

  const { icon: Icon, iconColor, buttonColor, backgroundColor } = getIconAndColor();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onConfirm}
    >
      <Pressable style={styles.overlay} onPress={onConfirm}>
        <Pressable style={styles.dialog} onPress={(e) => e.stopPropagation()}>
          {/* 图标 */}
          <View style={[styles.iconContainer, { backgroundColor }]}>
            <Icon color={iconColor} size={32} />
          </View>
          
          {/* 标题 */}
          <Text style={styles.title}>{title}</Text>
          
          {/* 内容 */}
          {message && <Text style={styles.message}>{message}</Text>}
          
          {/* 确认按钮 */}
          <Pressable
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: buttonColor },
              pressed && styles.buttonPressed,
            ]}
            onPress={onConfirm}
          >
            <Text style={styles.buttonText}>{confirmText}</Text>
          </Pressable>
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
    paddingHorizontal: spacing.lg,
  },
  dialog: {
    backgroundColor: colors.cardBg,
    borderRadius: radius.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    ...shadows.card,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: fontSizes.base,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    minHeight: 48,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  buttonText: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.bold,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});

