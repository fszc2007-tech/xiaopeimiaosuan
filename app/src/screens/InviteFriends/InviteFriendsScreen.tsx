/**
 * 邀请好友页面
 * 
 * 设计文档：app.doc/features/我的-二级-邀请好友和设置设计文档.md (1.2节)
 * 
 * 功能：
 * - 展示邀请码
 * - 复制邀请码
 * - 生成邀请海报（显示"敬请期待"）
 * - 邀请统计（可选）
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Gift, Copy, ImageIcon } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { colors, fontSizes, fontWeights, spacing, radius, shadows } from '@/theme';

// ===== 主组件 =====
export const InviteFriendsScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const [inviteCode, setInviteCode] = useState<string>('');
  const [inviteCount, setInviteCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isApiAvailable, setIsApiAvailable] = useState(false);

  // 加载邀请码
  useEffect(() => {
    loadInviteCode();
  }, []);

  const loadInviteCode = async () => {
    try {
      setIsLoading(true);

      // TODO: 调用 API 获取邀请码
      // const response = await inviteApi.getCode();
      // setInviteCode(response.invite_code);
      // setInviteCount(response.invite_count || 0);
      // setIsApiAvailable(true);

      // 检查 API 是否可用
      // 如果不可用，保持 isApiAvailable = false
      setIsApiAvailable(false);
    } catch (error: any) {
      console.error('Failed to load invite code:', error);
      setIsApiAvailable(false);
    } finally {
      setIsLoading(false);
    }
  };

  // 复制邀请码
  const handleCopyInviteCode = async () => {
    if (!inviteCode) {
      Alert.alert(t('invite.alertTitle'), t('invite.loadFailed'));
      return;
    }

    await Clipboard.setStringAsync(inviteCode);
    Alert.alert(t('invite.copied'), t('invite.copiedMessage', { code: inviteCode }));
  };

  // 生成邀请海报
  const handleGeneratePoster = () => {
    Alert.alert(t('invite.comingSoon'), t('invite.posterComingSoon'));
  };

  // 如果 API 不可用，显示"开发中"
  if (!isLoading && !isApiAvailable) {
    return (
      <View style={styles.container}>
        <View style={styles.devContainer}>
          <Gift size={64} color={colors.textSecondary} strokeWidth={1} />
          <Text style={styles.devTitle}>{t('invite.inDevelopment')}</Text>
          <Text style={styles.devDesc}>
            {t('invite.inDevelopmentMessage')}
          </Text>
        </View>
      </View>
    );
  }

  // 加载中
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 页面标题和说明 */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('invite.pageTitle')}</Text>
          <Text style={styles.description}>
            {t('invite.pageDescription')}
          </Text>
        </View>

        {/* 邀请码卡片 */}
        <View style={styles.inviteCodeCard}>
          <Text style={styles.inviteCodeLabel}>{t('invite.myInviteCode')}</Text>
          <View style={styles.inviteCodeRow}>
            <Text style={styles.inviteCode}>{inviteCode}</Text>
            <Pressable
              style={({ pressed }) => [
                styles.copyButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleCopyInviteCode}
            >
              <Copy color="#FFFFFF" size={16} />
              <Text style={styles.copyButtonText}>{t('invite.copy')}</Text>
            </Pressable>
          </View>
        </View>

        {/* 生成邀请海报按钮 */}
        <Pressable
          style={({ pressed }) => [
            styles.posterButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleGeneratePoster}
        >
          <ImageIcon color={colors.primary} size={20} />
          <Text style={styles.posterButtonText}>{t('invite.generatePoster')}</Text>
        </Pressable>

        {/* 邀请统计（可选） */}
        {inviteCount > 0 && (
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>{t('invite.inviteStats')}</Text>
            <Text style={styles.statsValue}>{t('invite.invitedCount', { count: inviteCount })}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

// ===== 样式 =====
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['2xl'],
  },

  // 页面标题
  header: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },

  // 邀请码卡片
  inviteCodeCard: {
    backgroundColor: colors.disabledBg,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  inviteCodeLabel: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  inviteCodeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inviteCode: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
    fontFamily: 'monospace',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: 4,
  },
  copyButtonText: {
    fontSize: fontSizes.sm,
    color: '#FFFFFF',
    fontWeight: fontWeights.medium,
  },

  // 生成海报按钮
  posterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    height: 44,
    gap: spacing.xs,
  },
  posterButtonText: {
    fontSize: fontSizes.sm,
    color: colors.primary,
    fontWeight: fontWeights.medium,
  },

  // 邀请统计
  statsCard: {
    backgroundColor: colors.cardBg,
    borderRadius: radius.lg,
    ...shadows.card,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  statsTitle: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  statsValue: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },

  // 按钮按下状态
  buttonPressed: {
    opacity: 0.7,
  },

  // 开发中提示
  devContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['2xl'],
  },
  devTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  devDesc: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },

  // 加载中
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
});

