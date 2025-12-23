/**
 * 统一的返回按钮组件
 * 
 * 用于所有系统页面，保持UI交互体验一致
 */

import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import { colors, spacing } from '@/theme';

interface BackButtonProps {
  onPress?: () => void;
  size?: number;
  color?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({
  onPress,
  size = 24,
  color = colors.ink,
}) => {
  const navigation = useNavigation();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <Pressable
      style={styles.button}
      onPress={handlePress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <ChevronLeft size={size} color={color} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
});





