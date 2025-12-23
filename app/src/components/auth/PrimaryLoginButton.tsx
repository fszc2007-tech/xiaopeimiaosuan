/**
 * 主登录按钮组件
 * 
 * 功能：
 * - 全宽大按钮
 * - 深色背景 + 白色图标/文字
 * - 支持 loading 状态
 */

import React from 'react';
import { Text, StyleSheet, Pressable, ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, fontSizes, fontWeights, radius } from '@/theme';

interface PrimaryLoginButtonProps {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  iconName?: keyof typeof Ionicons.glyphMap;
  label: string;
}

export const PrimaryLoginButton: React.FC<PrimaryLoginButtonProps> = ({
  onPress,
  loading = false,
  disabled = false,
  iconName,
  label,
}) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed,
        disabled && styles.buttonDisabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <View style={styles.content}>
          {iconName && (
            <Ionicons name={iconName} size={22} color="#FFFFFF" style={styles.icon} />
          )}
          <Text style={styles.buttonText}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 52,
    backgroundColor: '#1A1A1A', // 深色背景
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  buttonPressed: {
    backgroundColor: '#333333',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: spacing.sm,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
  },
});

