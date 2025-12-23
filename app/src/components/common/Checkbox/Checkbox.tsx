/**
 * Checkbox 勾選框組件
 * 
 * 用於表單選擇、條款確認等場景
 */

import React from 'react';
import { Pressable, View, StyleSheet, Animated } from 'react-native';
import { Check } from 'lucide-react-native';
import { colors, radius } from '@/theme';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  error?: boolean;
  testID?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  disabled = false,
  error = false,
  testID,
}) => {
  const [scale] = React.useState(new Animated.Value(1));

  const handlePress = () => {
    if (disabled) return;

    // 點擊動畫
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onChange(!checked);
  };

  return (
    <Pressable
      testID={testID}
      onPress={handlePress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.container,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Animated.View
        style={[
          styles.checkbox,
          checked && styles.checkboxChecked,
          error && styles.checkboxError,
          disabled && styles.checkboxDisabled,
          { transform: [{ scale }] },
        ]}
      >
        {checked && (
          <Check
            size={16}
            color={disabled ? colors.textTertiary : colors.white}
            strokeWidth={3}
          />
        )}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 4, // 增大點擊區域
  },
  pressed: {
    opacity: 0.7,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.brandGreen,
    borderColor: colors.brandGreen,
  },
  checkboxError: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  checkboxDisabled: {
    backgroundColor: colors.cardBg,
    borderColor: colors.border,
    opacity: 0.5,
  },
});

