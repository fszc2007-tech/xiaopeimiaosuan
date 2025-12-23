/**
 * Button 组件
 * 
 * 遵循 UI_SPEC.md 设计规范
 */

import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, fontSizes, fontWeights, radius, spacing } from '@/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  testID?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  testID,
}) => {
  const sizeStyles = {
    small: { height: 36, paddingHorizontal: spacing.md },
    medium: { height: 48, paddingHorizontal: spacing.lg },
    large: { height: 56, paddingHorizontal: spacing.xl },
  };

  const textSizeStyles = {
    small: { fontSize: fontSizes.sm },
    medium: { fontSize: fontSizes.base },
    large: { fontSize: fontSizes.lg },
  };

  // 确保 disabled 和 loading 始终是布尔值
  const isDisabled = Boolean(disabled);
  const isLoading = Boolean(loading);

  return (
    <Pressable
      testID={testID}
      disabled={isDisabled || isLoading}
      onPress={isDisabled || isLoading ? undefined : onPress}
      style={({ pressed }) => [
        styles.base,
        sizeStyles[size],
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'ghost' && styles.ghost,
        pressed && variant === 'primary' && styles.primaryPressed,
        pressed && variant === 'secondary' && styles.secondaryPressed,
        isDisabled && styles.disabled,
        fullWidth && styles.fullWidth,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : colors.primary} />
      ) : (
        <Text
          style={[
            styles.text,
            textSizeStyles[size],
            variant === 'primary' && styles.primaryText,
            variant === 'secondary' && styles.secondaryText,
            variant === 'ghost' && styles.ghostText,
            isDisabled && styles.disabledText,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.md,
  },
  fullWidth: {
    width: '100%',
  },
  
  // Primary variant
  primary: {
    backgroundColor: colors.primary,
  },
  primaryPressed: {
    backgroundColor: colors.primaryPressed,
  },
  primaryText: {
    color: '#ffffff',
    fontWeight: fontWeights.semibold,
  },
  
  // Secondary variant
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  secondaryPressed: {
    backgroundColor: colors.greenSoftBg,
  },
  secondaryText: {
    color: colors.primary,
    fontWeight: fontWeights.semibold,
  },
  
  // Ghost variant
  ghost: {
    backgroundColor: 'transparent',
  },
  ghostText: {
    color: colors.primary,
    fontWeight: fontWeights.medium,
  },
  
  // Disabled state
  disabled: {
    backgroundColor: colors.disabledBg,
    borderColor: colors.disabledBg,
  },
  disabledText: {
    color: colors.disabledText,
  },
  
  text: {
    textAlign: 'center',
  },
});

