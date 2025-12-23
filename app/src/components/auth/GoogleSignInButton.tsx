/**
 * Google 登录按钮组件
 * 
 * 功能：
 * - Google Sign-In SDK 集成
 * - Android Play Services 前置检查
 * - 错误处理和提示
 * - Google 品牌样式
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Platform } from 'react-native';
import { colors, fontSizes, fontWeights, spacing, radius } from '@/theme';
import { GOOGLE_CONFIG } from '@/config/google';

// 条件导入：检查是否在 Development Build 中
let GoogleSignin: any = null;
let statusCodes: any = null;
let isGoogleSignInAvailable = false;
let moduleLoadError: any = null;

// #region agent log
fetch('http://127.0.0.1:7243/ingest/a96a12ed-318a-4e03-9333-94a90fa8074e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'GoogleSignInButton.tsx:21',message:'Attempting to load Google Sign-In module',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
// #endregion

try {
  const googleSignInModule = require('@react-native-google-signin/google-signin');
  
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/a96a12ed-318a-4e03-9333-94a90fa8074e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'GoogleSignInButton.tsx:26',message:'Module loaded successfully',data:{hasGoogleSignin:!!googleSignInModule.GoogleSignin,hasStatusCodes:!!googleSignInModule.statusCodes,moduleKeys:Object.keys(googleSignInModule)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  
  GoogleSignin = googleSignInModule.GoogleSignin;
  statusCodes = googleSignInModule.statusCodes;
  isGoogleSignInAvailable = true;
  
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/a96a12ed-318a-4e03-9333-94a90fa8074e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'GoogleSignInButton.tsx:33',message:'Google Sign-In available',data:{isGoogleSignInAvailable:true},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
} catch (error: any) {
  moduleLoadError = error;
  
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/a96a12ed-318a-4e03-9333-94a90fa8074e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'GoogleSignInButton.tsx:38',message:'Module load failed',data:{errorMessage:error?.message,errorStack:error?.stack,errorName:error?.name,errorCode:error?.code},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  
  console.warn('[GoogleSignIn] ⚠️ Google Sign-In 模块不可用:', error?.message || error);
  isGoogleSignInAvailable = false;
}

interface GoogleSignInButtonProps {
  onSuccess: (idToken: string) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onSuccess,
  onError,
  disabled = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // 初始化 Google Sign-In
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/a96a12ed-318a-4e03-9333-94a90fa8074e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'GoogleSignInButton.tsx:60',message:'useEffect triggered',data:{isGoogleSignInAvailable,hasGoogleSignin:!!GoogleSignin,hasStatusCodes:!!statusCodes,moduleLoadError:moduleLoadError?.message},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    
    if (isGoogleSignInAvailable) {
      initializeGoogleSignIn();
    } else {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/a96a12ed-318a-4e03-9333-94a90fa8074e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'GoogleSignInButton.tsx:67',message:'Google Sign-In not available',data:{moduleLoadError:moduleLoadError?.message,errorStack:moduleLoadError?.stack},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      
      console.warn('[GoogleSignIn] ⚠️ 需要 Development Build 才能使用 Google 登录');
      if (moduleLoadError) {
        console.error('[GoogleSignIn] 错误详情:', moduleLoadError);
      }
    }
  }, []);

  const initializeGoogleSignIn = async () => {
    if (!isGoogleSignInAvailable || !GoogleSignin) {
      onError('Google 登录需要 Development Build，请使用 npx expo run:ios 或 npx expo run:android');
      return;
    }

    try {
      GoogleSignin.configure({
        // ⚠️ P0 必须：webClientId 必须是 Web 类型的 Client ID
        // 只有配置了有效的 webClientId，idToken 才会非空
        webClientId: GOOGLE_CONFIG.webClientId,
        
        // iOS 专用（可选，如果 config plugin 已配置，可以省略）
        iosClientId: Platform.OS === 'ios' ? GOOGLE_CONFIG.iosClientId : undefined,
        
        offlineAccess: false,
        scopes: GOOGLE_CONFIG.scopes,
      });
      
      setInitialized(true);
      
      if (__DEV__) {
        console.log('[GoogleSignIn] ✅ 初始化成功');
      }
    } catch (error) {
      console.error('[GoogleSignIn] ❌ 初始化失败:', error);
      onError('Google 登录初始化失败');
    }
  };

  // P1 建议：Android Play Services 检查
  const checkPlayServices = async (): Promise<boolean> => {
    if (!isGoogleSignInAvailable || !GoogleSignin) {
      return false;
    }

    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      return true;
    } catch (error: any) {
      console.error('[GoogleSignIn] ❌ Play Services 不可用:', error);
      
      if (statusCodes && error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        onError('Google Play 服务不可用，请使用手机号登录');
      } else {
        onError('设备不支持 Google 登录，请使用手机号登录');
      }
      
      return false;
    }
  };

  const handleGoogleSignIn = async () => {
    if (!isGoogleSignInAvailable || !GoogleSignin) {
      onError('Google 登录需要 Development Build\n请运行: npx expo run:ios 或 npx expo run:android');
      return;
    }

    if (!initialized) {
      onError('Google 登录未初始化，请稍后再试');
      return;
    }

    try {
      setLoading(true);

      // P1 建议：Android 侧增加 Play Services 前置检查
      const hasPlayServices = await checkPlayServices();
      if (!hasPlayServices) {
        return;
      }

      // 调起 Google Sign-In（v16+ API：signIn() 直接返回 idToken）
      const response = await GoogleSignin.signIn();
      
      if (__DEV__) {
        console.log('[GoogleSignIn] signIn response:', JSON.stringify(response, null, 2));
      }
      
      // v16+ 返回格式：{ type: 'success', data: { idToken, user } } 或 { type: 'cancelled' }
      // 检查是否取消
      if (response.type === 'cancelled') {
        if (__DEV__) {
          console.log('[GoogleSignIn] ℹ️ 用户取消授权');
        }
        return;
      }
      
      // 获取 idToken（v16+ 格式）
      const idToken = response.data?.idToken || response.idToken;
      
      if (!idToken) {
        throw new Error('未获取到 idToken，请检查 webClientId 配置');
      }

      if (__DEV__) {
        console.log('[GoogleSignIn] ✅ 登录成功，获取到 idToken');
      }

      // 回调成功（传递 idToken 给父组件）
      onSuccess(idToken);

    } catch (error: any) {
      console.error('[GoogleSignIn] ❌ 登录失败:', error);

      // P2 错误码区分（客户端错误）
      if (statusCodes && error.code === statusCodes.SIGN_IN_CANCELLED) {
        // 用户取消授权（不显示错误提示，静默处理）
        if (__DEV__) {
          console.log('[GoogleSignIn] ℹ️ 用户取消授权');
        }
      } else if (statusCodes && error.code === statusCodes.IN_PROGRESS) {
        onError('登录正在进行中，请稍候');
      } else if (statusCodes && error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        onError('Google Play 服务不可用，请使用手机号登录');
      } else {
        onError('Google 登录失败，请重试');
      }
    } finally {
      setLoading(false);
    }
  };

  // 如果 Google Sign-In 不可用，显示提示
  if (!isGoogleSignInAvailable) {
    return (
      <View style={[styles.button, styles.buttonDisabled]}>
        <View style={styles.logoContainer}>
          <GoogleLogo />
        </View>
        <Text style={[styles.buttonText, styles.buttonTextDisabled]}>
          需要 Development Build
        </Text>
      </View>
    );
  }

  return (
    <Pressable
      disabled={disabled || loading || !initialized}
      onPress={handleGoogleSignIn}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed,
        (disabled || !initialized) && styles.buttonDisabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#ffffff" />
      ) : (
        <>
          {/* Google Logo */}
          <View style={styles.logoContainer}>
            <GoogleLogo />
          </View>
          
          {/* 按钮文字 */}
          <Text style={[styles.buttonText, (disabled || !initialized) && styles.buttonTextDisabled]}>
            使用 Google 登錄
          </Text>
        </>
      )}
    </Pressable>
  );
};

// Google Logo SVG 组件（简化版本）
const GoogleLogo: React.FC = () => (
  <View style={styles.logo}>
    <Text style={styles.logoText}>G</Text>
  </View>
);

const styles = StyleSheet.create({
  button: {
    height: 52,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonPressed: {
    backgroundColor: colors.primaryDark,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  logoContainer: {
    marginRight: spacing.sm,
  },
  logo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: fontWeights.bold,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
  },
  buttonTextDisabled: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
});

