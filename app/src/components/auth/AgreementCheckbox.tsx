/**
 * AgreementCheckbox 條款勾選組件
 * 
 * 用於登錄頁面的私隱政策和用戶協議確認
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Checkbox } from '@/components/common';
import { colors, fontSizes, fontWeights, spacing } from '@/theme';

export type PolicyType = 'privacy' | 'agreement' | 'pics';

interface AgreementCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  onViewPolicy: (type: PolicyType) => void;
  error?: boolean;
  testID?: string;
}

export const AgreementCheckbox: React.FC<AgreementCheckboxProps> = ({
  checked,
  onChange,
  onViewPolicy,
  error = false,
  testID,
}) => {
  const [shakeAnim] = React.useState(new Animated.Value(0));

  // 閃爍動畫（錯誤提示時）
  React.useEffect(() => {
    if (error) {
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [error, shakeAnim]);

  return (
    <Animated.View
      testID={testID}
      style={[
        styles.container,
        error && styles.containerError,
        { transform: [{ translateX: shakeAnim }] },
      ]}
    >
      <Pressable
        onPress={() => onChange(!checked)}
        style={styles.row}
      >
        <View style={styles.checkboxWrapper}>
          <Checkbox
            checked={checked}
            onChange={onChange}
            error={error}
            testID={`${testID}-checkbox`}
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.text}>
            我已閱讀並同意
            <Text
              style={styles.link}
              onPress={() => onViewPolicy('privacy')}
            >
              《私隱政策》
            </Text>
            <Text
              style={styles.link}
              onPress={() => onViewPolicy('agreement')}
            >
              《用戶協議》
            </Text>
            及
            <Text
              style={styles.link}
              onPress={() => onViewPolicy('pics')}
            >
              《個人資料收集聲明》
            </Text>
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  containerError: {
    backgroundColor: '#FEE',
    borderWidth: 1,
    borderColor: colors.error,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkboxWrapper: {
    marginTop: 2, // 與文字對齊
  },
  textContainer: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  text: {
    fontSize: fontSizes.sm,
    lineHeight: fontSizes.sm * 1.5,
    color: colors.textSecondary,
    fontWeight: fontWeights.regular,
  },
  link: {
    color: colors.brandBlue,
    fontWeight: fontWeights.medium,
    textDecorationLine: 'underline',
  },
});

