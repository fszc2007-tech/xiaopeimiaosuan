/**
 * 联系客服弹窗组件
 * 
 * 设计文档：app.doc/features/我的-二级-意见反馈和客服设计文档.md (2.2节)
 * 
 * 功能：
 * - 展示客服微信号
 * - 复制微信号到剪贴板
 * - 尝试打开微信应用
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { X } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { useTranslation } from 'react-i18next';
import { colors, fontSizes, fontWeights, spacing, radius } from '@/theme';

// ===== 客服配置 =====
const CUSTOMER_SERVICE = {
  wechatId: 'xiaopei_service',
  serviceHours: '10:00–22:00',
  serviceDescription: '如有支付或使用問題都可以聯繫我。',
};

// ===== 组件属性 =====
interface CustomerServiceModalProps {
  visible: boolean;
  onClose: () => void;
}

// ===== 主组件 =====
export const CustomerServiceModal: React.FC<CustomerServiceModalProps> = ({
  visible,
  onClose,
}) => {
  const { t } = useTranslation();
  
  // 复制微信号
  const handleCopyWechatId = async () => {
    await Clipboard.setStringAsync(CUSTOMER_SERVICE.wechatId);
    Alert.alert(
      t('support.copied'), 
      t('support.copiedMessage', { wechatId: CUSTOMER_SERVICE.wechatId })
    );
  };

  // 复制并跳转微信
  const handleCopyAndOpenWechat = async () => {
    // 先复制微信号
    await Clipboard.setStringAsync(CUSTOMER_SERVICE.wechatId);

    // 尝试打开微信
    try {
      const wechatUrl = Platform.OS === 'ios' ? 'weixin://' : 'weixin://';
      const canOpen = await Linking.canOpenURL(wechatUrl);

      if (canOpen) {
        await Linking.openURL(wechatUrl);
      } else {
        Alert.alert(
          t('support.cannotOpenWechat'),
          t('support.cannotOpenWechatMessage'),
          [
            {
              text: t('support.ok'),
              onPress: onClose,
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert(
        t('support.openWechatFailed'),
        t('support.openWechatFailedMessage', { wechatId: CUSTOMER_SERVICE.wechatId }),
        [
          {
            text: t('support.ok'),
            onPress: onClose,
          },
        ]
      );
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* 遮罩层 */}
      <Pressable style={styles.overlay} onPress={onClose}>
        {/* 弹窗容器 */}
        <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
          {/* 拖拽指示器 */}
          <View style={styles.dragIndicator} />

          {/* 标题 */}
          <Text style={styles.title}>{t('support.title')}</Text>

          {/* 微信号显示 */}
          <View style={styles.wechatIdContainer}>
            <Text style={styles.wechatLabel}>{t('support.wechatId')}：</Text>
            <Text style={styles.wechatId}>{CUSTOMER_SERVICE.wechatId}</Text>
          </View>

          {/* 服务时间说明 */}
          <Text style={styles.serviceInfo}>
            {t('support.serviceHours')}：{CUSTOMER_SERVICE.serviceHours}，
            {t('support.serviceDescription')}
          </Text>

          {/* 操作按钮区域 */}
          <View style={styles.buttonRow}>
            <Pressable
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleCopyWechatId}
            >
              <Text style={styles.secondaryButtonText}>{t('support.copyWechatId')}</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleCopyAndOpenWechat}
            >
              <Text style={styles.primaryButtonText}>{t('support.copyAndOpen')}</Text>
            </Pressable>
          </View>

          {/* 取消按钮 */}
          <Pressable
            style={({ pressed }) => [
              styles.cancelButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={onClose}
          >
            <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

// ===== 样式 =====
const styles = StyleSheet.create({
  // 遮罩层
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },

  // 弹窗容器
  modalContainer: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    maxHeight: '60%',
  },

  // 拖拽指示器
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: colors.disabledBg,
    borderRadius: radius.pill,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },

  // 标题
  title: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: spacing.md,
  },

  // 微信号显示
  wechatIdContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  wechatLabel: {
    fontSize: fontSizes.sm,
    color: colors.ink,
  },
  wechatId: {
    fontSize: fontSizes.sm,
    color: colors.ink,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: fontWeights.medium,
  },

  // 服务时间说明
  serviceInfo: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: spacing.lg,
  },

  // 按钮行
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },

  // 次要按钮
  secondaryButton: {
    flex: 1,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    fontWeight: fontWeights.medium,
  },

  // 主要按钮
  primaryButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: fontSizes.sm,
    color: '#FFFFFF',
    fontWeight: fontWeights.medium,
  },

  // 取消按钮
  cancelButton: {
    borderRadius: radius.pill,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },

  // 按钮按下状态
  buttonPressed: {
    opacity: 0.7,
  },
});

