/**
 * 登录/注册页面
 * 
 * 功能：
 * - 单页面架构（登录/注册共用）
 * - 支持手机号登录（主按钮）
 * - 支持 Google/Apple/WeChat 登录（底部图标）
 * - 支持验证码验证
 * - 首次登录即自动注册
 * - 用户协议确认
 * - 区号选择
 * 
 * 参考文档：注册登录设计文档.md、Google一键登录设计方案-v1.1-可执行版.md
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Animated, SafeAreaView, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input, Logo } from '@/components/common';
import { MessageDialog } from '@/components/common/MessageDialog/MessageDialog';
import { SocialLoginIcons, PrimaryLoginButton, OtpInputWithRef, PhoneInputField, AgreementConfirmDialog, GoogleLoginSheet, type SocialProvider } from '@/components/auth';
import { colors, fontSizes, fontWeights, spacing, radius } from '@/theme';
import { useAuthStore, useUIStore } from '@/store';
import { authService } from '@/services/api';
// 不再需要旧的 COUNTRY_CODES

type AuthStep = 'home' | 'phone-input' | 'phone-otp';

export const AuthScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const login = useAuthStore((state) => state.login);
  const appRegion = useUIStore((state) => state.language === 'zh-HK' ? 'HK' : 'CN');
  
  // 登录方式状态
  const [authStep, setAuthStep] = useState<AuthStep>('home');
  
  // 区号选择（根据地区自动选择）
  const [countryCode, setCountryCode] = useState<string>(appRegion === 'HK' ? '+852' : '+86');
  
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [phoneError, setPhoneError] = useState('');
  
  // 用户协议勾选
  const [agreementChecked, setAgreementChecked] = useState(false);
  const [agreementError, setAgreementError] = useState(false);
  
  // 短信发送次数上限弹窗
  const [showSmsLimitDialog, setShowSmsLimitDialog] = useState(false);
  
  // 协议确认弹窗
  const [showAgreementConfirmDialog, setShowAgreementConfirmDialog] = useState(false);
  
  // 待执行的操作（用户同意协议后执行）
  const [pendingAction, setPendingAction] = useState<'phone' | 'google' | 'apple' | 'wechat' | null>(null);
  
  // 即将上线弹窗
  const [showComingSoonDialog, setShowComingSoonDialog] = useState(false);
  
  // Google 登录半屏弹窗
  const [showGoogleSheet, setShowGoogleSheet] = useState(false);
  
  // 登录失败弹窗
  const [showLoginFailedDialog, setShowLoginFailedDialog] = useState(false);
  const [loginFailedMessage, setLoginFailedMessage] = useState('');
  
  // OTP 输入组件 ref
  const otpInputRef = useRef<{ clear: () => void }>(null);
  
  // 错误提示动画
  const errorOpacity = useState(new Animated.Value(0))[0];

  // 验证码倒计时
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // 错误提示动画效果
  useEffect(() => {
    if (error) {
      Animated.sequence([
        Animated.timing(errorOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.timing(errorOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [error]);

  // 验证手机号格式
  const validatePhone = (phoneNumber: string): boolean => {
    // 根据区号验证手机号格式
    if (countryCode === '+86') {
      // 中国大陆：11位，以1开头
      const phoneRegex = /^1[3-9]\d{9}$/;
      return phoneRegex.test(phoneNumber);
    } else if (countryCode === '+852') {
      // 香港：8位
      const phoneRegex = /^\d{8}$/;
      return phoneRegex.test(phoneNumber);
    } else {
      // 其他区域：至少6位数字
      return phoneNumber.length >= 6;
    }
  };

  // 处理手机号输入
  const handlePhoneChange = (value: string) => {
    // 只保留数字
    const numericValue = value.replace(/[^0-9]/g, '');
    setPhone(numericValue);
    setError('');
    setPhoneError('');
    
    // 实时验证（只在输入足够长度后验证）
    const minLength = countryCode === '+86' ? 11 : (countryCode === '+852' ? 8 : 6);
    if (numericValue.length >= minLength && !validatePhone(numericValue)) {
      setPhoneError('請輸入正確的手機號');
    }
  };

  // 处理查看政策
  const handleViewPolicy = (type: 'privacy' | 'agreement' | 'pics') => {
    navigation.navigate('PolicyViewer' as never, { type } as never);
  };

  // 发送验证码
  const handleSendOtp = async () => {
    // 检查用户协议
    if (!agreementChecked) {
      setAgreementError(true);
      return;
    }
    setAgreementError(false);
    
    if (!phone) {
      setError('請輸入手機號');
      return;
    }
    
    if (!validatePhone(phone)) {
      setPhoneError('請輸入正確的手機號');
      return;
    }
    
    setLoading(true);
    setError('');
    setPhoneError('');
    
    try {
      // 构造 E.164 格式手机号
      const fullPhone = `${countryCode.code}${phone}`;
      const region = countryCode.code === '+86' ? 'cn' : 'hk';
      
      console.log('📱 发送验证码请求:', { fullPhone, region });
      
      // 调用真实 API 发送验证码
      await authService.requestOtp({
        phone: fullPhone,
        region,
      });
      
      console.log('✅ 验证码发送成功');
      setOtpSent(true);
      setCountdown(60);
    } catch (err: any) {
      console.error('❌ 发送验证码失败:', err);
      
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/a96a12ed-318a-4e03-9333-94a90fa8074e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthScreen.tsx:159',message:'error caught',data:{errorMessage:err.message,errorResponse:err.response?.data,errorCode:err.response?.data?.error?.code,errorMsg:err.response?.data?.error?.message,fullError:JSON.stringify(err)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'ALL'})}).catch(()=>{});
      // #endregion
      
      // 提取错误消息（可能来自多个位置）
      const errorMessage = 
        err.response?.data?.error?.message ||  // 后端返回的错误消息
        err.message ||                          // Axios 错误消息
        '發送驗證碼失敗';
      
      // 检查是否是短信发送次数上限错误，显示弹窗
      if (errorMessage.includes('今日短信發送次數已達上限') || 
          errorMessage.includes('短信發送次數已達上限') ||
          errorMessage.includes('Daily SMS limit exceeded') ||
          err.response?.data?.error?.code === 'SMS_DAILY_LIMIT_EXCEEDED') {
        setShowSmsLimitDialog(true);
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // 处理主按钮点击（手机号登录）
  const handlePhoneLoginPress = () => {
    if (!agreementChecked) {
      setPendingAction('phone');
      setShowAgreementConfirmDialog(true);
      return;
    }
    setAuthStep('phone-input');
  };

  // 处理"下一步"按钮点击（发送验证码并进入验证码页）
  const handleNextStep = async () => {
    if (!phone) {
      setError('請輸入手機號');
      return;
    }
    
    if (!validatePhone(phone)) {
      setPhoneError('請輸入正確的手機號');
      return;
    }
    
    setLoading(true);
    setError('');
    setPhoneError('');
    
    try {
      const fullPhone = `${countryCode}${phone}`;
      const region = countryCode === '+86' ? 'cn' : 'hk';
      
      console.log('📱 发送验证码请求:', { fullPhone, region });
      
      await authService.requestOtp({
        phone: fullPhone,
        region,
      });
      
      console.log('✅ 验证码发送成功');
      setOtpSent(true);
      setCountdown(60);
      setAuthStep('phone-otp'); // 进入验证码页
    } catch (err: any) {
      console.error('❌ 发送验证码失败:', err);
      
      const errorMessage = 
        err.response?.data?.error?.message ||
        err.message ||
        '發送驗證碼失敗';
      
      if (errorMessage.includes('今日短信發送次數已達上限') || 
          errorMessage.includes('短信發送次數已達上限') ||
          errorMessage.includes('Daily SMS limit exceeded') ||
          err.response?.data?.error?.code === 'SMS_DAILY_LIMIT_EXCEEDED') {
        setShowSmsLimitDialog(true);
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // 处理验证码输入完成（自动提交）
  const handleOtpComplete = async (otpValue: string) => {
    setOtp(otpValue);
    setLoading(true);
    setError('');
    
    try {
      const fullPhone = `${countryCode}${phone}`;
      const channel = countryCode === '+86' ? 'cn' : 'hk';
      
      console.log('📞 调用登录 API:', { fullPhone, channel });
      
      const response = await authService.loginOrRegister({
        phone: fullPhone,
        code: otpValue,
        channel,
      });
      
      console.log('✅ 登录成功:', {
        userId: response.user.userId,
        phone: response.user.phone,
        hasToken: !!response.token,
      });
      
      await login(response.user, response.token);
      
      console.log('✅ Token 已保存到 AsyncStorage，准备跳转');
    } catch (err: any) {
      console.error('❌ 登录失败:', err);
      
      // 显示登录失败弹窗
      const errorMessage = err.response?.data?.error?.message || err.message || '校驗碼校驗失敗';
      setLoginFailedMessage(errorMessage);
      setShowLoginFailedDialog(true);
    } finally {
      setLoading(false);
    }
  };

  // 处理登录失败弹窗关闭
  const handleLoginFailedConfirm = () => {
    setShowLoginFailedDialog(false);
    setOtp('');
    // 清空 OTP 输入框
    otpInputRef.current?.clear();
  };

  // 重新发送验证码
  const handleResendOtp = async () => {
    if (countdown > 0) return;
    
    setLoading(true);
    setError('');
    
    try {
      const fullPhone = `${countryCode}${phone}`;
      const region = countryCode === '+86' ? 'cn' : 'hk';
      
      await authService.requestOtp({
        phone: fullPhone,
        region,
      });
      
      setCountdown(60);
    } catch (err: any) {
      console.error('❌ 重新发送验证码失败:', err);
      const errorMessage = err.response?.data?.error?.message || err.message || '發送驗證碼失敗';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 返回手机号输入页（保留手机号）
  const handleBackToPhoneInput = () => {
    setAuthStep('phone-input');
    setOtp('');
    setError('');
  };

  // 处理社交登录图标点击
  const handleSocialLoginPress = (provider: SocialProvider) => {
    if (!agreementChecked) {
      setPendingAction(provider);
      setShowAgreementConfirmDialog(true);
      return;
    }
    
    executeSocialLogin(provider);
  };

  // 执行社交登录
  const executeSocialLogin = (provider: SocialProvider) => {
    if (provider === 'google') {
      // Google 登录（仅 HK 可用）
      if (appRegion !== 'HK') {
        setError('Google 登錄僅在香港地區可用');
        return;
      }
      setShowGoogleSheet(true);
    } else if (provider === 'apple') {
      // Apple 登录（即将上线）
      setShowComingSoonDialog(true);
    } else if (provider === 'wechat') {
      // WeChat 登录（即将上线）
      setShowComingSoonDialog(true);
    }
  };

  // 处理协议弹窗 - 同意
  const handleAgreementAgree = () => {
    setAgreementChecked(true);
    setAgreementError(false);
    setShowAgreementConfirmDialog(false);
    
    // 执行待定操作
    if (pendingAction === 'phone') {
      setAuthStep('phone-input');
    } else if (pendingAction === 'google') {
      setShowGoogleSheet(true);
    } else if (pendingAction) {
      executeSocialLogin(pendingAction);
    }
    setPendingAction(null);
  };

  // 处理协议弹窗 - 不同意
  const handleAgreementDisagree = () => {
    setShowAgreementConfirmDialog(false);
    setPendingAction(null);
  };

  // 登录（手机号）
  const handleLogin = async () => {
    if (!phone || !otp) {
      setError('請填寫完整信息');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // 构造 E.164 格式手机号
      const fullPhone = `${countryCode.code}${phone}`;
      const channel = countryCode.code === '+86' ? 'cn' : 'hk';
      
      console.log('📞 调用登录 API:', { fullPhone, channel });
      
      const response = await authService.loginOrRegister({
        phone: fullPhone,
        code: otp,
        channel,
      });
      
      console.log('✅ 登录成功:', {
        userId: response.user.userId,
        phone: response.user.phone,
        hasToken: !!response.token,
      });
      
      // 🔥 等待 Token 保存完成
      await login(response.user, response.token);
      
      console.log('✅ Token 已保存到 AsyncStorage，准备跳转');
      // 导航由 RootNavigator 自动处理
    } catch (err: any) {
      console.error('❌ 登录失败:', err);
      setError(err.message || '登錄失敗');
    } finally {
      setLoading(false);
    }
  };

  // Google 登录成功回调
  const handleGoogleLoginSuccess = async (idToken: string) => {
    setLoading(true);
    setError('');

    try {
      console.log('[Google Login] 📞 调用 third_party_login API');

      const response = await authService.thirdPartyLogin({
        provider: 'google',
        idToken,
        app_region: appRegion,
      });

      console.log('[Google Login] ✅ 登录成功:', {
        userId: response.user.userId,
        email: response.user.email,
        status: response.user.status,
        deleteScheduledAt: response.user.deleteScheduledAt,
        first_login: response.first_login,
        hasToken: !!response.token,
      });

      // ✅ 直接使用返回的完整用户数据（包含 status 和 deleteScheduledAt）
      // 🔥 等待 Token 保存完成
      await login(response.user, response.token);
      
      // 关闭 Google 登录弹窗
      setShowGoogleSheet(false);

      console.log('[Google Login] ✅ Token 已保存到 AsyncStorage，准备跳转');
      // 导航由 RootNavigator 自动处理
    } catch (err: any) {
      console.error('[Google Login] ❌ 登录失败:', err);
      
      // P2 错误码区分（服务端错误）
      const errorMessage = err.response?.data?.error?.message || err.message || 'Google 登錄失敗';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Google 登录错误回调
  const handleGoogleLoginError = (errorMessage: string) => {
    // 不关闭弹窗，让用户可以重试
    setError(errorMessage);
  };

  // 返回首页
  const handleBackToHome = () => {
    setAuthStep('home');
    setError('');
    setPhoneError('');
    setOtpSent(false);
    setPhone('');
    setOtp('');
  };

  // 渲染首页
  const renderHome = () => (
    <View style={styles.homeContainer}>
      {/* 上方弹性留白 */}
      <View style={styles.topSpacer} />

      {/* Logo 区域（垂直居中） */}
      <View style={styles.logoSection}>
        <Logo size="large" />
        <Text style={styles.appName}>小佩妙算</Text>
        <Text style={styles.slogan}>專業八字命理分析</Text>
      </View>

      {/* 下方弹性留白 */}
      <View style={styles.spacer} />

      {/* 登录区域 */}
      <View style={styles.loginSection}>
        {/* 主登录按钮 - 手机号 */}
        <PrimaryLoginButton
          iconName="call"
          label="手機號登錄"
          onPress={handlePhoneLoginPress}
          disabled={loading}
        />

        {/* 社交登录图标 */}
        <SocialLoginIcons
          onPress={handleSocialLoginPress}
          enabledProviders={appRegion === 'HK' ? ['google', 'apple', 'wechat'] : ['apple', 'wechat']}
        />
      </View>

      {/* 底部协议区域 */}
      <View style={styles.bottomSection}>
        <Pressable 
          style={styles.agreementRow} 
          onPress={() => {
            setAgreementChecked(!agreementChecked);
            if (!agreementChecked) {
              setAgreementError(false);
              setError('');
            }
          }}
        >
          <View style={[styles.checkbox, agreementChecked && styles.checkboxChecked]}>
            {agreementChecked && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
          </View>
          <Text style={styles.agreementText}>
            我已閱讀並同意
            <Text style={styles.link} onPress={() => handleViewPolicy('privacy')}>《隱私政策》</Text>
            <Text style={styles.link} onPress={() => handleViewPolicy('agreement')}>《用戶協議》</Text>
            及
            <Text style={styles.link} onPress={() => handleViewPolicy('pics')}>《個人資料收集聲明》</Text>
          </Text>
        </Pressable>
      </View>
    </View>
  );

  // 渲染手机号输入页（第一步）
  const renderPhoneInput = () => (
    <SafeAreaView style={styles.stepContainer}>
      {/* 顶部返回按钮 */}
      <Pressable style={styles.backButton} onPress={handleBackToHome}>
        <Ionicons name="chevron-back" size={28} color={colors.ink} />
      </Pressable>

      {/* 标题区域 */}
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>手機號登錄</Text>
        <Text style={styles.stepSubtitle}>輸入手機號完成登錄</Text>
      </View>

      {/* 手机号输入 */}
      <View style={styles.stepContent}>
        <PhoneInputField
          value={phone}
          onChangeText={handlePhoneChange}
          countryCode={countryCode}
          onCountryCodeChange={setCountryCode}
          placeholder="請輸入手機號"
          error={phoneError}
          disabled={loading}
        />

        {/* 下一步按钮 */}
        <Pressable
          style={[
            styles.nextButton,
            (!phone || !!phoneError || loading) && styles.nextButtonDisabled,
          ]}
          onPress={handleNextStep}
          disabled={!phone || !!phoneError || loading}
        >
          <Text style={[
            styles.nextButtonText,
            (!phone || !!phoneError || loading) && styles.nextButtonTextDisabled,
          ]}>
            {loading ? '發送中...' : '下一步'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );

  // 渲染验证码输入页（第二步）
  const renderPhoneOtp = () => (
    <SafeAreaView style={styles.stepContainer}>
      {/* 顶部返回按钮 */}
      <Pressable style={styles.backButton} onPress={handleBackToPhoneInput}>
        <Ionicons name="chevron-back" size={28} color={colors.ink} />
      </Pressable>

      {/* 标题区域 */}
      <View style={styles.otpHeader}>
        <Text style={styles.otpTitle}>輸入6位驗證碼</Text>
        <Text style={styles.otpSubtitle}>
          驗證碼已發送至 {countryCode} {phone}
        </Text>
      </View>

      {/* 验证码输入 */}
      <View style={styles.otpContent}>
        <View style={styles.otpContainer}>
          <OtpInputWithRef
            ref={otpInputRef}
            length={6}
            onComplete={handleOtpComplete}
            disabled={loading}
          />
        </View>

        {/* 重新发送 */}
        <Pressable
          style={styles.resendButton}
          onPress={handleResendOtp}
          disabled={countdown > 0 || loading}
        >
          <Text style={[
            styles.resendText,
            countdown > 0 && styles.resendTextDisabled,
          ]}>
            {countdown > 0 ? `重新發送 ${countdown}s` : '重新發送'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );

  return (
    <KeyboardAvoidingView
      testID="auth-screen"
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          authStep === 'home' && styles.scrollContentHome,
          (authStep === 'phone-input' || authStep === 'phone-otp') && styles.scrollContentStep,
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {authStep === 'home' && renderHome()}
        {authStep === 'phone-input' && renderPhoneInput()}
        {authStep === 'phone-otp' && renderPhoneOtp()}
      </ScrollView>

      {/* 短信发送次数上限弹窗 */}
      <MessageDialog
        visible={showSmsLimitDialog}
        type="warning"
        title="提示"
        message="今日短信發送次數已達上限，請明天再試"
        confirmText="確認"
        onConfirm={() => setShowSmsLimitDialog(false)}
      />

      {/* 协议确认弹窗 */}
      <AgreementConfirmDialog
        visible={showAgreementConfirmDialog}
        onAgree={handleAgreementAgree}
        onDisagree={handleAgreementDisagree}
        onViewPolicy={handleViewPolicy}
      />

      {/* 即将上线弹窗 */}
      <MessageDialog
        visible={showComingSoonDialog}
        type="info"
        title="敬請期待"
        message="該登錄方式即將上線"
        confirmText="確認"
        onConfirm={() => setShowComingSoonDialog(false)}
      />

      {/* 登录失败弹窗 */}
      <MessageDialog
        visible={showLoginFailedDialog}
        type="error"
        title="登錄失敗"
        message={loginFailedMessage}
        confirmText="我知道了"
        onConfirm={handleLoginFailedConfirm}
      />

      {/* Google 登录半屏弹窗 */}
      <GoogleLoginSheet
        visible={showGoogleSheet}
        onClose={() => setShowGoogleSheet(false)}
        onSuccess={handleGoogleLoginSuccess}
        onError={handleGoogleLoginError}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.lg,
    justifyContent: 'center',
  },
  scrollContentHome: {
    justifyContent: 'flex-start',
    paddingTop: 0,
  },
  scrollContentStep: {
    justifyContent: 'flex-start',
    paddingTop: 0,
    paddingHorizontal: 0,
  },
  // 两步登录流程样式
  stepContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginTop: spacing.md,
  },
  stepHeader: {
    marginTop: spacing.xl,
    marginBottom: spacing['2xl'],
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: fontWeights.bold,
    color: colors.ink,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: fontSizes.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  stepContent: {
    paddingHorizontal: spacing.md,
  },
  nextButton: {
    height: 52,
    backgroundColor: '#1A1A1A',
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  nextButtonText: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: '#FFFFFF',
  },
  nextButtonTextDisabled: {
    color: '#9E9E9E',
  },
  otpHeader: {
    alignItems: 'center',
    marginTop: spacing['2xl'],
    marginBottom: spacing.xl,
  },
  otpTitle: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  otpSubtitle: {
    fontSize: fontSizes.base,
    color: colors.textSecondary,
  },
  otpContent: {
    paddingHorizontal: spacing.md,
  },
  otpContainer: {
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.xl,
  },
  resendButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  resendText: {
    fontSize: fontSizes.base,
    color: colors.textSecondary,
  },
  resendTextDisabled: {
    color: colors.border,
  },
  // 首页布局
  homeContainer: {
    flex: 1,
    minHeight: '100%',
  },
  topSpacer: {
    flex: 1,
  },
  logoSection: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 28,
    fontWeight: fontWeights.bold,
    color: colors.ink,
    marginTop: spacing.lg,
  },
  slogan: {
    fontSize: fontSizes.base,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  spacer: {
    flex: 1,
  },
  loginSection: {
    paddingHorizontal: spacing.md,
  },
  bottomSection: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
    paddingTop: spacing.lg,
  },
  agreementRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginRight: spacing.sm,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  agreementText: {
    flex: 1,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  link: {
    color: colors.primary,
  },
  // 原有样式
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  title: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
    color: colors.ink,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSizes.base,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  agreementSection: {
    marginBottom: spacing.xl,
  },
  form: {
    marginBottom: spacing.xl,
  },
  inputLabel: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  errorContainer: {
    backgroundColor: '#FEE',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  errorText: {
    fontSize: fontSizes.sm,
    color: colors.error,
    fontWeight: fontWeights.medium,
  },
  hint: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
