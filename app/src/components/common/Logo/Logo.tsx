/**
 * Logo 组件
 * 
 * 使用场景：
 * 1. 登录/注册页面 - 大尺寸 Logo
 * 2. 聊天页小佩头像 - 小尺寸圆形 Logo
 * 3. 启动页 - 居中 Logo
 */

import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/theme';

interface LogoProps {
  /**
   * Logo 尺寸
   * - 'small': 40x40 (聊天头像)
   * - 'medium': 80x80 (默认)
   * - 'large': 120x120 (登录页)
   */
  size?: 'small' | 'medium' | 'large';
  
  /**
   * 是否为圆形（用于聊天头像）
   */
  circular?: boolean;
}

const sizeMap = {
  small: 40,
  medium: 80,
  large: 120,
};

// 小佩 AI 头像 - 直接导入图片
const xiaopeiLogo = require('../../../../assets/images/xiaopei-avatar.png');

export const Logo: React.FC<LogoProps> = ({ 
  size = 'medium',
  circular = false,
}) => {
  const logoSize = sizeMap[size];
  
  return (
    <View style={styles.container}>
      {/* Logo 图片 - 无边框 */}
      {xiaopeiLogo ? (
        <Image 
          source={xiaopeiLogo}
          style={{
            width: logoSize,
            height: logoSize,
            borderRadius: circular ? logoSize / 2 : 12,
          }}
          resizeMode="cover"
        />
      ) : (
        // 占位符：简单的灰色背景
        <View style={[
          styles.placeholder,
          {
            width: logoSize,
            height: logoSize,
            borderRadius: circular ? logoSize / 2 : 12,
          }
        ]}>
          <View style={styles.textContainer}>
            <View style={[styles.textLine, { width: '60%', height: 3 }]} />
            <View style={[styles.textLine, { width: '80%', height: 3, marginTop: 4 }]} />
            <View style={[styles.textLine, { width: '70%', height: 3, marginTop: 4 }]} />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
  },
  textLine: {
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
});

