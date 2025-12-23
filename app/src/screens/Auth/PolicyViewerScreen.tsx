/**
 * PolicyViewerScreen 政策文檔查看頁面
 * 
 * 用於展示私隱政策、用戶協議、個人資料收集聲明等 PDF 文檔
 */

import React from 'react';
import { View, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BackButton } from '@/components/common';
import { colors } from '@/theme';
import { ENV } from '@/config/env';

type PolicyType = 'privacy' | 'agreement' | 'pics';

type PolicyViewerRouteProp = RouteProp<{ PolicyViewer: { type: PolicyType } }, 'PolicyViewer'>;
type PolicyViewerNavigationProp = NativeStackNavigationProp<{ PolicyViewer: { type: PolicyType } }>;

interface PolicyConfig {
  title: string;
  filename: string;
}

const POLICY_CONFIG: Record<PolicyType, PolicyConfig> = {
  privacy: {
    title: '私隱政策',
    filename: 'miaosuan_privacy_policy_zh-HK.pdf',
  },
  agreement: {
    title: '用戶協議',
    filename: 'miaosuan_user_agreement_zh-HK.pdf',
  },
  pics: {
    title: '個人資料收集聲明',
    filename: 'miaosuan_PICS_zh-HK.pdf',
  },
};

export const PolicyViewerScreen: React.FC = () => {
  const route = useRoute<PolicyViewerRouteProp>();
  const navigation = useNavigation<PolicyViewerNavigationProp>();
  const { type } = route.params;

  const config = POLICY_CONFIG[type];
  // 添加時間戳參數繞過緩存
  const pdfUrl = `${ENV.API_BASE_URL}/public/docs/${config.filename}?t=${Date.now()}`;

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: config.title,
      headerLeft: () => <BackButton />,
    });
  }, [navigation, config.title]);

  // 載入指示器
  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.brandGreen} />
    </View>
  );

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: pdfUrl }}
        style={styles.webview}
        startInLoadingState={true}
        renderLoading={renderLoading}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('WebView 載入錯誤:', nativeEvent);
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error('HTTP 錯誤:', nativeEvent.statusCode);
        }}
        // iOS 特殊配置
        allowsBackForwardNavigationGestures={Platform.OS === 'ios'}
        // Android 特殊配置
        androidHardwareAccelerationDisabled={false}
        // 通用配置
        javaScriptEnabled={true}
        domStorageEnabled={true}
        cacheEnabled={false}
        incognito={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
  },
});

