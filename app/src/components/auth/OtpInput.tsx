/**
 * 6位验证码输入组件
 * 
 * 功能：
 * - 6个独立的输入格子
 * - 自动聚焦和跳转
 * - 输入完成后自动回调
 * - 支持删除和清空
 */

import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { colors, spacing, radius, fontSizes, fontWeights } from '@/theme';

interface OtpInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  onClear?: () => void;
  disabled?: boolean;
  autoFocus?: boolean;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  onComplete,
  onClear,
  disabled = false,
  autoFocus = true,
}) => {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // 自动聚焦第一个输入框
  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [autoFocus]);

  // 检查是否输入完成
  useEffect(() => {
    const otpValue = otp.join('');
    if (otpValue.length === length && !otp.includes('')) {
      onComplete(otpValue);
    }
  }, [otp, length, onComplete]);

  // 处理输入
  const handleChange = (text: string, index: number) => {
    if (disabled) return;

    // 只允许数字
    const digit = text.replace(/[^0-9]/g, '');
    
    if (digit.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = digit;
      setOtp(newOtp);

      // 自动跳转到下一个输入框
      if (digit && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    } else if (digit.length > 1) {
      // 处理粘贴多位数字的情况
      const digits = digit.slice(0, length - index).split('');
      const newOtp = [...otp];
      digits.forEach((d, i) => {
        if (index + i < length) {
          newOtp[index + i] = d;
        }
      });
      setOtp(newOtp);
      
      // 聚焦到最后一个填入的位置或末尾
      const nextIndex = Math.min(index + digits.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  // 处理删除
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // 当前格子为空，删除上一个格子的内容并聚焦
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      } else {
        // 清空当前格子
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  // 清空验证码
  const clear = () => {
    setOtp(Array(length).fill(''));
    inputRefs.current[0]?.focus();
    onClear?.();
  };

  // 暴露清空方法
  React.useImperativeHandle(
    React.useRef(null),
    () => ({ clear }),
    [clear]
  );

  return (
    <View style={styles.container}>
      {otp.map((digit, index) => (
        <View
          key={index}
          style={[
            styles.box,
            digit ? styles.boxFilled : null,
          ]}
        >
          <TextInput
            ref={(ref) => (inputRefs.current[index] = ref)}
            style={styles.input}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
            editable={!disabled}
            caretHidden={false}
            autoFocus={index === 0 && autoFocus}
          />
        </View>
      ))}
    </View>
  );
};

// 创建一个带有 ref 的版本
export const OtpInputWithRef = React.forwardRef<
  { clear: () => void },
  OtpInputProps
>((props, ref) => {
  const [otp, setOtp] = useState<string[]>(Array(props.length || 6).fill(''));
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const length = props.length || 6;

  // 自动聚焦第一个输入框
  useEffect(() => {
    if (props.autoFocus !== false && inputRefs.current[0]) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [props.autoFocus]);

  // 检查是否输入完成
  useEffect(() => {
    const otpValue = otp.join('');
    if (otpValue.length === length && !otp.includes('')) {
      props.onComplete(otpValue);
    }
  }, [otp, length, props.onComplete]);

  // 清空验证码
  const clear = () => {
    setOtp(Array(length).fill(''));
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
    props.onClear?.();
  };

  // 暴露清空方法
  React.useImperativeHandle(ref, () => ({ clear }), []);

  // 处理输入
  const handleChange = (text: string, index: number) => {
    if (props.disabled) return;

    const digit = text.replace(/[^0-9]/g, '');
    
    if (digit.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = digit;
      setOtp(newOtp);

      if (digit && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    } else if (digit.length > 1) {
      const digits = digit.slice(0, length - index).split('');
      const newOtp = [...otp];
      digits.forEach((d, i) => {
        if (index + i < length) {
          newOtp[index + i] = d;
        }
      });
      setOtp(newOtp);
      
      const nextIndex = Math.min(index + digits.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  return (
    <View style={styles.container}>
      {otp.map((digit, index) => (
        <View
          key={index}
          style={[
            styles.box,
            digit ? styles.boxFilled : null,
          ]}
        >
          <TextInput
            ref={(r) => (inputRefs.current[index] = r)}
            style={styles.input}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
            editable={!props.disabled}
            caretHidden={false}
            autoFocus={index === 0 && props.autoFocus !== false}
          />
        </View>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  box: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: 52,
    backgroundColor: '#F8F8F8',
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D0D0D0',
  },
  boxFilled: {
    backgroundColor: '#FFFFFF',
    borderColor: colors.primary,
    borderWidth: 2,
  },
  input: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
    color: '#1A1A1A',
  },
});

