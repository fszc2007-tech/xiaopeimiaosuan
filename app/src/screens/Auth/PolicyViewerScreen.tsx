/**
 * PolicyViewerScreen 政策文檔查看頁面
 * 
 * 用於展示私隱政策、用戶協議、個人資料收集聲明等 PDF 文檔
 */

import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Platform, Text, Alert, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackButton } from '@/components/common';
import { colors, spacing } from '@/theme';
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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const config = POLICY_CONFIG[type];
  // 原始 PDF URL
  const rawPdfUrl = `${ENV.API_BASE_URL}/public/docs/${config.filename}`;
  
  // ⚠️ 修复：直接使用 PDF URL，不使用 Google Docs Viewer（可能被墙或网络问题）
  // Android WebView 在某些版本支持直接加载 PDF，如果不支持会触发错误处理
  // 如果直接加载失败，用户可以使用"在浏览器中打开"备用方案
  const pdfUrl = rawPdfUrl;

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: config.title,
      headerLeft: () => <BackButton />,
    });
  }, [navigation, config.title]);

  // 处理 WebView 错误
  const handleError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error('WebView 載入錯誤:', nativeEvent);
    setError('無法載入文檔，請檢查網絡連接');
    setLoading(false);
  };

  const handleHttpError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error('HTTP 錯誤:', nativeEvent.statusCode);
    if (nativeEvent.statusCode >= 400) {
      setError(`載入失敗 (錯誤碼: ${nativeEvent.statusCode})`);
      setLoading(false);
    }
  };

  // 处理加载完成
  const handleLoadEnd = () => {
    setLoading(false);
  };

  // 打开 PDF 链接（备用方案）
  const handleOpenInBrowser = async () => {
    try {
      const canOpen = await Linking.canOpenURL(rawPdfUrl);
      if (canOpen) {
        await Linking.openURL(rawPdfUrl);
      } else {
        Alert.alert('錯誤', '無法打開文檔');
      }
    } catch (err) {
      console.error('打開鏈接失敗:', err);
      Alert.alert('錯誤', '無法打開文檔');
    }
  };

  // 載入指示器
  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.brandGreen} />
      <Text style={styles.loadingText}>載入中...</Text>
    </View>
  );

  // 错误提示
  const renderError = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{error || '無法載入文檔'}</Text>
      <Text style={styles.errorHint} onPress={handleOpenInBrowser}>
        點擊此處在瀏覽器中打開
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {error ? (
        renderError()
      ) : (
        <WebView
          source={{ uri: pdfUrl }}
          style={styles.webview}
          startInLoadingState={true}
          renderLoading={renderLoading}
          onError={handleError}
          onHttpError={handleHttpError}
          onLoadEnd={handleLoadEnd}
          // iOS 特殊配置
          allowsBackForwardNavigationGestures={Platform.OS === 'ios'}
          // Android 特殊配置
          androidHardwareAccelerationDisabled={false}
          // 通用配置
          javaScriptEnabled={true}
          domStorageEnabled={true}
          cacheEnabled={false}
          incognito={true}
          // 添加 User-Agent（某些设备需要）
          userAgent={Platform.select({
            ios: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
            android: 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36',
          })}
        />
      )}
      {loading && !error && renderLoading()}
    </SafeAreaView>
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
  loadingText: {
    marginTop: spacing.md,
    fontSize: 14,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.bg,
  },
  errorText: {
    fontSize: 16,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  errorHint: {
    fontSize: 14,
    color: colors.brandGreen,
    textAlign: 'center',
    textDecorationLine: 'underline',
    marginTop: spacing.md,
  },
});

