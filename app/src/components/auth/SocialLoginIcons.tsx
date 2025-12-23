/**
 * 社交登录图标组件
 * 
 * 功能：
 * - 显示 Google、Apple、WeChat 图标按钮
 * - 黑色图标 + 灰色圆底
 * - 不显示文字标签
 * - 支持禁用状态和点击回调
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { AntDesign, FontAwesome5 } from '@expo/vector-icons';
import { spacing } from '@/theme';

export type SocialProvider = 'google' | 'apple' | 'wechat';

interface SocialLoginIconsProps {
  onPress: (provider: SocialProvider) => void;
  disabled?: boolean;
  enabledProviders?: SocialProvider[];
}

// 渲染图标
const renderIcon = (provider: SocialProvider) => {
  const iconColor = '#000000';
  const iconSize = 22;
  
  switch (provider) {
    case 'google':
      return <AntDesign name="google" size={iconSize} color={iconColor} />;
    case 'apple':
      return <FontAwesome5 name="apple" size={iconSize} color={iconColor} />;
    case 'wechat':
      return <FontAwesome5 name="weixin" size={iconSize} color={iconColor} />;
    default:
      return null;
  }
};

export const SocialLoginIcons: React.FC<SocialLoginIconsProps> = ({
  onPress,
  disabled = false,
  enabledProviders = ['google', 'apple', 'wechat'],
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconsRow}>
        {enabledProviders.map((provider) => (
          <Pressable
            key={provider}
            style={({ pressed }) => [
              styles.iconButton,
              pressed && styles.iconButtonPressed,
              disabled && styles.iconButtonDisabled,
            ]}
            onPress={() => onPress(provider)}
            disabled={disabled}
          >
            <View style={styles.iconCircle}>
              {renderIcon(provider)}
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  iconsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  iconButton: {
    alignItems: 'center',
  },
  iconButtonPressed: {
    opacity: 0.7,
  },
  iconButtonDisabled: {
    opacity: 0.4,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E8E8E8', // 更明显的灰色底
    justifyContent: 'center',
    alignItems: 'center',
  },
});

