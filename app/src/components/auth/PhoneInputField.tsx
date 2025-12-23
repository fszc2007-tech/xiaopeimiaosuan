/**
 * 手机号输入组件
 * 
 * 功能：
 * - 区号选择和手机号输入整合在一个框内
 * - 点击区号展开下拉列表
 * - 根据用户地区自动选择默认区号
 * - 繁体字标签
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontSizes, fontWeights, spacing, radius } from '@/theme';
import { useUIStore } from '@/store';

// 区号数据（繁体字）
export interface CountryCodeOption {
  code: string;
  label: string;
  region: string;
}

export const COUNTRY_CODE_OPTIONS: CountryCodeOption[] = [
  { code: '+852', label: '+852（中國香港）', region: 'HK' },
  { code: '+86', label: '+86（中國大陸）', region: 'CN' },
  { code: '+853', label: '+853（中國澳門）', region: 'MO' },
  { code: '+886', label: '+886（中國台灣）', region: 'TW' },
  { code: '+65', label: '+65（新加坡）', region: 'SG' },
  { code: '+60', label: '+60（馬來西亞）', region: 'MY' },
];

interface PhoneInputFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  countryCode: string;
  onCountryCodeChange: (code: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
}

export const PhoneInputField: React.FC<PhoneInputFieldProps> = ({
  value,
  onChangeText,
  countryCode,
  onCountryCodeChange,
  placeholder = '請輸入手機號',
  error,
  disabled = false,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownHeight] = useState(new Animated.Value(0));
  const appRegion = useUIStore((state) => state.language === 'zh-HK' ? 'HK' : 'CN');

  // 根据用户地区自动选择默认区号
  useEffect(() => {
    if (!countryCode) {
      const defaultCode = appRegion === 'HK' ? '+852' : '+86';
      onCountryCodeChange(defaultCode);
    }
  }, [appRegion]);

  // 展开/收起动画
  const toggleDropdown = () => {
    if (disabled) return;
    
    const toValue = isDropdownOpen ? 0 : COUNTRY_CODE_OPTIONS.length * 48;
    
    Animated.timing(dropdownHeight, {
      toValue,
      duration: 200,
      useNativeDriver: false,
    }).start();
    
    setIsDropdownOpen(!isDropdownOpen);
  };

  // 选择区号
  const handleSelectCode = (code: string) => {
    onCountryCodeChange(code);
    
    Animated.timing(dropdownHeight, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    
    setIsDropdownOpen(false);
  };

  // 点击输入框时收起下拉
  const handleInputFocus = () => {
    if (isDropdownOpen) {
      Animated.timing(dropdownHeight, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
      setIsDropdownOpen(false);
    }
  };

  // 处理输入（只允许数字）
  const handleChangeText = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, '');
    onChangeText(numericValue);
  };

  return (
    <View style={styles.container}>
      {/* 主输入框 */}
      <View style={[
        styles.inputContainer,
        isDropdownOpen && styles.inputContainerOpen,
        error && styles.inputContainerError,
      ]}>
        {/* 区号选择区域 */}
        <Pressable 
          style={styles.codeSelector} 
          onPress={toggleDropdown}
          disabled={disabled}
        >
          <Text style={styles.codeText}>{countryCode}</Text>
          <Ionicons 
            name={isDropdownOpen ? 'chevron-up' : 'chevron-down'} 
            size={16} 
            color={colors.textSecondary} 
          />
        </Pressable>

        {/* 分隔线 */}
        <View style={styles.divider} />

        {/* 手机号输入 */}
        <TextInput
          style={styles.textInput}
          value={value}
          onChangeText={handleChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          keyboardType="number-pad"
          onFocus={handleInputFocus}
          editable={!disabled}
          underlineColorAndroid="transparent"
          selectionColor={colors.primary}
        />
      </View>

      {/* 下拉列表 */}
      <Animated.View style={[styles.dropdown, { height: dropdownHeight }]}>
        {COUNTRY_CODE_OPTIONS.map((option, index) => (
          <Pressable
            key={option.code}
            style={[
              styles.dropdownItem,
              countryCode === option.code && styles.dropdownItemSelected,
              index === COUNTRY_CODE_OPTIONS.length - 1 && styles.dropdownItemLast,
            ]}
            onPress={() => handleSelectCode(option.code)}
          >
            <Text style={[
              styles.dropdownItemText,
              countryCode === option.code && styles.dropdownItemTextSelected,
            ]}>
              {option.label}
            </Text>
            {countryCode === option.code && (
              <Ionicons name="checkmark" size={20} color={colors.ink} />
            )}
          </Pressable>
        ))}
      </Animated.View>

      {/* 错误提示 */}
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    height: 52,
    paddingHorizontal: spacing.md,
    overflow: 'hidden',
  },
  inputContainerOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  inputContainerError: {
    borderWidth: 1,
    borderColor: colors.error,
  },
  codeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: spacing.md,
  },
  codeText: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    color: colors.ink,
    marginRight: spacing.xs,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#E0E0E0',
    marginRight: spacing.md,
  },
  textInput: {
    flex: 1,
    fontSize: fontSizes.base,
    color: colors.ink,
    padding: 0,
    margin: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  dropdown: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 48,
    paddingHorizontal: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  dropdownItemSelected: {
    backgroundColor: '#F5F5F5',
  },
  dropdownItemLast: {
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  dropdownItemText: {
    fontSize: fontSizes.base,
    color: colors.ink,
  },
  dropdownItemTextSelected: {
    fontWeight: fontWeights.medium,
  },
  errorText: {
    fontSize: fontSizes.sm,
    color: colors.error,
    marginTop: spacing.xs,
    marginLeft: spacing.md,
  },
});

