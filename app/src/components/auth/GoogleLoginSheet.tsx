/**
 * Google 登录半屏弹窗
 * 
 * 功能：
 * - 底部半屏弹出
 * - 显示应用 Logo
 * - Google 登录按钮（使用系统统一 Button 风格）
 * - 点击遮罩或 X 关闭
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, Animated, Dimensions, Platform } from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSizes, fontWeights, spacing, radius } from '@/theme';
import { Logo } from '@/components/common';
import { GoogleSignInButton } from './GoogleSignInButton';

interface GoogleLoginSheetProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (idToken: string) => void;
  onError: (error: string) => void;
}

export const GoogleLoginSheet: React.FC<GoogleLoginSheetProps> = ({
  visible,
  onClose,
  onSuccess,
  onError,
}) => {
  const insets = useSafeAreaInsets();
  // 获取屏幕高度（考虑安全区域和华为 Mate 40 等设备）
  const { height: screenHeight } = Dimensions.get('window');
  // 计算弹窗高度：不超过屏幕的 50%，并考虑底部安全区域
  const maxSheetHeight = screenHeight * 0.5;
  const baseHeight = screenHeight * 0.45;
  // 华为 Mate 40 等设备适配：确保高度不超过屏幕 50%，并预留底部安全区域
  // 确保 sheetHeight 不会太小（至少保留 30% 的屏幕高度）
  const minSheetHeight = screenHeight * 0.3;
  // ⚠️ 关键修复：sheetHeight 需要加上 insets.bottom，确保弹窗底部在安全区域之上
  // 这样按钮就不会被底部导航栏遮挡
  const calculatedHeight = Math.max(minSheetHeight, maxSheetHeight - insets.bottom);
  const sheetHeight = Math.min(baseHeight, calculatedHeight) + insets.bottom;
  
  const translateY = useRef(new Animated.Value(sheetHeight)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // 弹出动画
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // 关闭动画
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: sheetHeight,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, sheetHeight]);

  const handleClose = () => {
    // 先播放关闭动画，再调用 onClose
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: sheetHeight,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={{ flex: 1 }} edges={[]}>
        {/* 遮罩层 */}
        <Animated.View style={[styles.overlay, { opacity }]}>
          <Pressable style={styles.overlayPressable} onPress={handleClose} />
        </Animated.View>

        {/* 底部弹窗 */}
        <Animated.View
          style={[
            styles.sheet,
            { 
              transform: [{ translateY }],
              height: sheetHeight,
            },
          ]}
        >
        {/* 头部 */}
        <View style={styles.header}>
          <Text style={styles.title}>通過 Google 登錄</Text>
          <Pressable style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* 内容区域 */}
        {/* ⚠️ 关键修复：paddingBottom 需要足够大，确保按钮在安全区域之上 */}
        {/* 增加更多底部间距，避免被 Android 底部导航栏遮挡 */}
        <View style={[styles.content, { paddingBottom: insets.bottom + spacing.xl + spacing.md }]}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Logo size="large" />
          </View>

          {/* 提示文字 */}
          <Text style={styles.description}>
            使用谷歌賬戶創建賬戶
          </Text>

          {/* Google 登录按钮 */}
          <View style={styles.buttonContainer}>
            <GoogleSignInButton
              onSuccess={onSuccess}
              onError={onError}
            />
          </View>
        </View>
      </Animated.View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayPressable: {
    flex: 1,
  },
  sheet: {
    position: 'absolute',
    // ⚠️ 关键修复：bottom 设置为 0，但 sheetHeight 已经包含了 insets.bottom
    // 这样弹窗底部会在安全区域之上，按钮不会被遮挡
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    // 华为 Mate 40 等设备适配：确保内容不会被底部安全区域遮挡
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  logoContainer: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  description: {
    fontSize: fontSizes.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  buttonContainer: {
    width: '100%',
  },
});

