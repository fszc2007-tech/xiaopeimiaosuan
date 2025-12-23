/**
 * 设置页面
 * 
 * 功能：
 * - 个人信息
 * - 通知设置
 * - 关于应用
 * - 退出登录
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  User,
  Bell,
  Info,
  LogOut,
  ChevronRight,
  Trash2,
  Palette,
  Type,
} from 'lucide-react-native';
import { BackButton } from '@/components/common/BackButton';
import { colors, fontSizes, fontWeights, spacing, radius } from '@/theme';
import { SCREEN_NAMES } from '@/constants/routes';
import { useAuthStore, useIsAuthenticated } from '@/store';
import { ConfirmDialog } from '@/components/common/ConfirmDialog/ConfirmDialog';
import { MessageDialog, MessageType } from '@/components/common/MessageDialog/MessageDialog';
import { useTranslation } from 'react-i18next';
import { accountService } from '@/services/api';

export const SettingsScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [pushEnabled, setPushEnabled] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false);
  const [showDeletionSuccessDialog, setShowDeletionSuccessDialog] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const isAuthenticated = useIsAuthenticated(); // 🔥 使用安全的 hook，确保返回布尔值
  const canLogout = isAuthenticated && !!user; // ✅ 双重检查

  // 处理退出登录
  const handleLogoutClick = async () => {
    const { logger } = await import('@/utils/logger');
    const currentState = useAuthStore.getState();
    
    logger.userAction('点击退出登录按钮', {
      isAuthenticated: currentState.isAuthenticated,
      hasUser: !!currentState.user,
      hasToken: !!currentState.token,
    });
    
    // 检查是否已登录
    if (!currentState.isAuthenticated || !currentState.user) {
      logger.warn('auth', '尝试退出但未登录', currentState);
      Alert.alert(t('dialog.tip'), t('dialog.notLoggedIn'));
      return;
    }
    
    setShowLogoutDialog(true);
  };

  const handleLogoutConfirm = async () => {
    const { logger } = await import('@/utils/logger');
    setShowLogoutDialog(false);
    
    try {
      logger.userAction('确认退出登录');
      // 🔥 等待 Token 清除完成（logout 现在是 async）
      await logout();
      logger.auth('已清除用户数据');
      
      setShowSuccessDialog(true);
      
      // 导航会自动由 RootNavigator 处理（检测到 isAuthenticated=false 后跳转到登录页）
    } catch (error: any) {
      logger.error('auth', '退出登录失败', error);
      setErrorMessage(error.message || t('dialog.logoutFailed'));
      setShowErrorDialog(true);
    }
  };

  const handleLogoutCancel = () => {
    import('@/utils/logger').then(({ logger }) => logger.userAction('取消退出登录'));
    setShowLogoutDialog(false);
  };

  // 處理註銷賬號點擊
  const handleDeleteAccountClick = () => {
    setShowDeleteAccountDialog(true);
  };

  // 確認註銷賬號
  const handleDeleteAccountConfirm = async () => {
    const { logger } = await import('@/utils/logger');
    setShowDeleteAccountDialog(false);
    setDeletingAccount(true);
    
    try {
      logger.userAction('確認註銷賬號');
      const result = await accountService.requestDeletion();
      logger.auth('註銷申請已提交', { deleteScheduledAt: result.deleteScheduledAt });
      
      // 顯示成功提示
      setShowDeletionSuccessDialog(true);
    } catch (error: any) {
      logger.error('auth', '註銷申請失敗', error);
      setErrorMessage(error.message || t('error.serverError'));
      setShowErrorDialog(true);
    } finally {
      setDeletingAccount(false);
    }
  };

  // 處理註銷成功確認（登出並跳轉到登入頁）
  const handleDeletionSuccessConfirm = async () => {
    setShowDeletionSuccessDialog(false);
    await logout();
  };

  const handleDeleteAccountCancel = () => {
    import('@/utils/logger').then(({ logger }) => logger.userAction('取消註銷賬號'));
    setShowDeleteAccountDialog(false);
  };

  // 跳转到关于小佩页面
  const handleAboutXiaopeiPress = () => {
    navigation.navigate(SCREEN_NAMES.ABOUT_XIAOPEI as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* 顶部导航栏 */}
      <View style={styles.header}>
        <BackButton />
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
      {/* 账号信息 - 去掉标题 */}
      <Section title="">
        <Cell
          icon={User}
          iconBg={colors.greenSoftBg}
          iconColor={colors.primary}
          label={t('dialog.personalInfo')}
          desc="修改手機號、郵箱等"
          onPress={() => Alert.alert(t('dialog.tip'), t('dialog.personalInfoEdit'))}
        />
      </Section>

      {/* 通知设置 */}
      <Section title={t('dialog.notificationSettings')}>
        <View style={styles.switchCell}>
          <View style={styles.switchCellContent}>
            <View style={[styles.cellIcon, { backgroundColor: colors.redSoftBg }]}>
              <Bell color={colors.brandRed} size={20} />
            </View>
            <View style={styles.cellTextContent}>
              <Text style={styles.cellLabel}>推送通知</Text>
              <Text style={styles.cellDesc}>接收時運提醒和重要消息</Text>
            </View>
          </View>
          <Switch
            value={pushEnabled}
            onValueChange={setPushEnabled}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
      </Section>

      {/* 显示设置 */}
      <Section title="顯示設置">
        <Cell
          icon={Palette}
          iconBg={colors.greenSoftBg}
          iconColor={colors.primary}
          label="主題設置"
          desc="選擇淺色、深色或跟隨系統"
          onPress={() => navigation.navigate(SCREEN_NAMES.THEME_SETTINGS as any)}
        />
        <Cell
          icon={Type}
          iconBg={colors.greenSoftBg}
          iconColor={colors.primary}
          label="字號設置"
          desc="調整應用字體大小（開發中）"
          onPress={() => Alert.alert('提示', '字號設置功能開發中')}
        />
      </Section>

      {/* 关于 */}
      <Section title={t('dialog.about')}>
        <Cell
          icon={Info}
          iconBg={colors.greenSoftBg}
          iconColor={colors.primary}
          label={t('dialog.aboutXiaopei')}
          desc="版本信息、開發團隊"
          onPress={handleAboutXiaopeiPress}
        />
      </Section>

      {/* 危險操作區域 */}
      {canLogout && (
        <Section title="">
          {/* 註銷賬號 */}
          <Cell
            icon={Trash2}
            iconBg={colors.redSoftBg}
            iconColor={colors.error}
            label="註銷賬號"
            desc="永久刪除您的賬號及所有相關數據"
            onPress={handleDeleteAccountClick}
          />
        </Section>
      )}

      {/* 退出登录 - 仅在已登录且有用户信息时显示 */}
      {canLogout && (
        <View style={styles.logoutSection}>
          <Pressable 
            style={({ pressed }) => [
              styles.logoutButton,
              pressed && styles.logoutButtonPressed,
            ]} 
            onPress={handleLogoutClick}
          >
            <LogOut color={colors.error} size={20} />
            <Text style={styles.logoutButtonText}>退出登錄</Text>
          </Pressable>
        </View>
      )}

      {/* 底部空白 */}
      <View style={styles.footer} />
      </ScrollView>

      {/* 退出登录确认对话框 */}
      <ConfirmDialog
        visible={showLogoutDialog}
        title="確認退出"
        message="確定要退出登錄嗎？"
        confirmText="退出"
        cancelText="取消"
        destructive={true}
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
      />

      {/* 退出成功提示 */}
      <MessageDialog
        visible={showSuccessDialog}
        type="success"
        title="成功"
        message="已退出登錄"
        confirmText="確定"
        onConfirm={() => setShowSuccessDialog(false)}
      />

      {/* 错误提示 */}
      <MessageDialog
        visible={showErrorDialog}
        type="error"
        title="錯誤"
        message={errorMessage}
        confirmText="確定"
        onConfirm={() => setShowErrorDialog(false)}
      />

      {/* 註銷賬號確認對話框 */}
      <ConfirmDialog
        visible={showDeleteAccountDialog}
        title="確認註銷賬號"
        message="註銷後，您的賬號及所有相關數據將被永久刪除，此操作無法撤銷。確定要繼續嗎？"
        confirmText="確認註銷"
        cancelText="取消"
        destructive={true}
        onConfirm={handleDeleteAccountConfirm}
        onCancel={handleDeleteAccountCancel}
      />

      {/* 註銷成功提示 */}
      <MessageDialog
        visible={showDeletionSuccessDialog}
        type="success"
        title="提交成功"
        message="您的註銷申請已提交，賬號將在 7 天後被永久刪除。在此期間您可以隨時撤銷此操作。"
        confirmText="確認"
        onConfirm={handleDeletionSuccessConfirm}
      />
    </SafeAreaView>
  );
};

// Section 组件
interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, children }) => (
  <View style={styles.section}>
    {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}
    <View style={styles.sectionContent}>{children}</View>
  </View>
);

// Cell 组件
interface CellProps {
  icon: React.ComponentType<{ color: string; size: number }>;
  iconBg: string;
  iconColor: string;
  label: string;
  desc?: string;
  onPress?: () => void;
}

const Cell: React.FC<CellProps> = ({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  desc,
  onPress,
}) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.cell,
        pressed && styles.cellPressed,
      ]}
      onPress={onPress}
    >
      <View style={[styles.cellIcon, { backgroundColor: iconBg }]}>
        <Icon color={iconColor} size={20} />
      </View>

      <View style={styles.cellTextContent}>
        <Text style={styles.cellLabel}>{label}</Text>
        {desc && <Text style={styles.cellDesc}>{desc}</Text>}
      </View>

      <ChevronRight color={colors.textSecondary} size={16} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingTop: spacing.xs,
    paddingBottom: spacing['2xl'],
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 44,
  },
  headerRight: {
    width: 40,
  },

  // Section
  section: {
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionContent: {
    backgroundColor: colors.cardBg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },

  // Cell
  cell: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cellPressed: {
    backgroundColor: colors.greenSoftBg,
    opacity: 0.8,
  },
  cellIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  cellTextContent: {
    flex: 1,
  },
  cellLabel: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    color: colors.ink,
    marginBottom: 2,
  },
  cellDesc: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },

  // Switch Cell
  switchCell: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  switchCellContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  // 退出登录
  logoutSection: {
    marginTop: spacing.lg,
    backgroundColor: colors.cardBg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    minHeight: 56, // 与 Cell 保持一致的高度
  },
  logoutButtonPressed: {
    backgroundColor: colors.greenSoftBg,
    opacity: 0.8,
  },
  logoutButtonText: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    color: colors.error,
  },

  footer: {
    height: spacing['2xl'],
  },
});

