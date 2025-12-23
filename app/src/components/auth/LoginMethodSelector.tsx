/**
 * 登录方式选择组件
 * 
 * 功能：
 * - 协议确认前置（在选择登录方式之前必须勾选协议）
 * - 登录方式选择（手机号 + Google）
 * - 根据 app_region 动态显示 Google 按钮（HK 显示，CN 不显示）
 * - 未勾选协议时点击会提示并震动
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, Vibration, Platform } from 'react-native';
import { colors, fontSizes, fontWeights, spacing, radius } from '@/theme';
import { Phone } from 'lucide-react-native';

// 检查是否在 Development Build 中（Google Sign-In 可用）
let isGoogleSignInAvailable = false;
try {
  require('@react-native-google-signin/google-signin');
  isGoogleSignInAvailable = true;
} catch (error) {
  // Expo Go 中无法加载原生模块
  isGoogleSignInAvailable = false;
}

export type LoginMethod = 'phone' | 'google';

interface LoginMethodSelectorProps {
  onSelectMethod: (method: LoginMethod) => void;
  agreementChecked: boolean;
  onAgreementError: () => void;
  appRegion: 'HK' | 'CN';
}

export const LoginMethodSelector: React.FC<LoginMethodSelectorProps> = ({
  onSelectMethod,
  agreementChecked,
  onAgreementError,
  appRegion,
}) => {
  // 处理登录方式选择
  const handleSelectMethod = (method: LoginMethod) => {
    // 检查协议是否已勾选
    if (!agreementChecked) {
      // 震动反馈（P2 优化）
      if (Platform.OS === 'ios') {
        Vibration.vibrate();
      } else {
        Vibration.vibrate(50);
      }
      
      // 触发错误回调
      onAgreementError();
      return;
    }

    // 已勾选协议，继续登录
    onSelectMethod(method);
  };

  // P0 地区策略：HK 才显示 Google（前端校验）
  // 同时检查是否在 Development Build 中（Expo Go 中隐藏）
  const showGoogleLogin = appRegion === 'HK' && isGoogleSignInAvailable;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>选择登录方式</Text>
      
      <View style={styles.buttonsContainer}>
        {/* 手机号登录按钮 */}
        <Pressable
          onPress={() => handleSelectMethod('phone')}
          style={({ pressed }) => [
            styles.methodButton,
            pressed && styles.methodButtonPressed,
          ]}
        >
          <View style={styles.methodIconContainer}>
            <Phone size={24} color={colors.primary} />
          </View>
          <Text style={styles.methodText}>手机号登录</Text>
        </Pressable>

        {/* Google 登录按钮（仅 HK 显示） */}
        {showGoogleLogin && (
          <Pressable
            onPress={() => handleSelectMethod('google')}
            style={({ pressed }) => [
              styles.methodButton,
              pressed && styles.methodButtonPressed,
            ]}
          >
            <View style={styles.methodIconContainer}>
              <GoogleIcon />
            </View>
            <Text style={styles.methodText}>Google 登录</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

// Google Icon 组件（简化版本）
const GoogleIcon: React.FC = () => (
  <View style={styles.googleIcon}>
    <Text style={styles.googleIconText}>G</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  title: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  methodButton: {
    flex: 1,
    maxWidth: 150,
    aspectRatio: 1,
    backgroundColor: '#ffffff',
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  methodButtonPressed: {
    backgroundColor: colors.bgSecondary,
    borderColor: colors.primary,
  },
  methodIconContainer: {
    marginBottom: spacing.md,
  },
  methodText: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    color: colors.text,
    textAlign: 'center',
  },
  googleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleIconText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: fontWeights.bold,
  },
});

