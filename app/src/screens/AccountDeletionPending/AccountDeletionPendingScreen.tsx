/**
 * 帳號待刪除 Blocking Page
 * 
 * 功能：
 * - 顯示帳號計劃刪除時間
 * - 提供撤銷註銷選項
 * - 提供登出選項
 * 
 * 參考文檔：app.doc/features/註銷賬號功能設計方案.md v1.1
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertTriangle, RefreshCw, LogOut } from 'lucide-react-native';
import { Button } from '@/components/common';
import { MessageDialog } from '@/components/common/MessageDialog/MessageDialog';
import { colors, fontSizes, fontWeights, spacing, radius } from '@/theme';
import { useAuthStore } from '@/store';
import { accountService } from '@/services/api';

export const AccountDeletionPendingScreen: React.FC = () => {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [deleteScheduledAt, setDeleteScheduledAt] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // 獲取刪除狀態
  useEffect(() => {
    fetchDeletionStatus();
  }, []);
  
  const fetchDeletionStatus = async () => {
    try {
      setLoading(true);
      const response = await accountService.getDeletionStatus();
      setDeleteScheduledAt(response.deleteScheduledAt);
    } catch (error: any) {
      console.error('[AccountDeletionPending] 獲取狀態失敗:', error);
      // 若用戶狀態已是 ACTIVE，則不應該在此頁面
      // 使用 user 中的 deleteScheduledAt 作為備用
      if (user?.deleteScheduledAt) {
        setDeleteScheduledAt(user.deleteScheduledAt);
      }
    } finally {
      setLoading(false);
    }
  };
  
  // 格式化日期
  const formatDate = (isoString: string | null): string => {
    if (!isoString) return '---';
    try {
      const date = new Date(isoString);
      // 使用用戶本地時區格式化
      return date.toLocaleDateString('zh-HK', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };
  
  // 撤銷註銷
  const handleCancelDeletion = async () => {
    try {
      setCancelling(true);
      await accountService.cancelDeletion();
      
      // 顯示成功提示
      setShowSuccessDialog(true);
    } catch (error: any) {
      console.error('[AccountDeletionPending] 撤銷失敗:', error);
      
      // 檢查是否已過期
      if (error?.code === 'CANNOT_CANCEL_DELETION_EXPIRED') {
        setErrorMessage('註銷申請已過期，無法撤銷');
      } else {
        setErrorMessage('撤銷註銷申請失敗，請稍後再試');
      }
      setShowErrorDialog(true);
    } finally {
      setCancelling(false);
    }
  };

  // 處理成功確認（登出並重新登入）
  const handleSuccessConfirm = async () => {
    setShowSuccessDialog(false);
    // 重新獲取用戶信息，RootNavigator 會自動處理導航
    // 需要重新登入獲取最新的用戶狀態
    await logout();
  };
  
  // 登出
  const handleLogout = async () => {
    await logout();
  };
  
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        {/* 警告圖標 */}
        <View style={styles.iconContainer}>
          <AlertTriangle size={64} color={colors.warning} />
        </View>
        
        {/* 標題 */}
        <Text style={styles.title}>賬號待刪除</Text>
        
        {/* 刪除時間 */}
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>
            您的賬號將於 {formatDate(deleteScheduledAt)} 被永久刪除
          </Text>
        </View>
        
        {/* 提示 */}
        <Text style={styles.hint}>在此期間您可以隨時撤銷此操作，恢復正常使用</Text>
        
        {/* 按鈕區域 */}
        <View style={styles.buttonContainer}>
          {/* 撤銷註銷按鈕 */}
          <Button
            title="撤銷註銷"
            onPress={handleCancelDeletion}
            loading={cancelling}
            disabled={cancelling}
            fullWidth
            icon={<RefreshCw size={20} color={colors.bg} />}
          />
          
          {/* 登出按鈕 */}
          <Button
            title="繼續註銷"
            onPress={handleLogout}
            variant="outline"
            fullWidth
            icon={<LogOut size={20} color={colors.textSecondary} />}
            style={styles.logoutButton}
          />
          
          {/* 說明文字 */}
          <Text style={styles.keepDeletionHint}>
            選擇繼續註銷將登出賬號，賬號將按計劃時間刪除
          </Text>
        </View>
      </View>

      {/* 撤銷成功提示 */}
      <MessageDialog
        visible={showSuccessDialog}
        type="success"
        title="撤銷成功"
        message="您的註銷申請已撤銷，賬號已恢復正常使用"
        confirmText="確認"
        onConfirm={handleSuccessConfirm}
      />

      {/* 錯誤提示 */}
      <MessageDialog
        visible={showErrorDialog}
        type="error"
        title="操作失敗"
        message={errorMessage}
        confirmText="確認"
        onConfirm={() => setShowErrorDialog(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.orangeSoftBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  infoCard: {
    backgroundColor: colors.cardBg,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.warning,
    width: '100%',
  },
  infoLabel: {
    fontSize: fontSizes.base,
    color: colors.ink,
    textAlign: 'center',
    lineHeight: 24,
  },
  hint: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing['2xl'],
  },
  buttonContainer: {
    width: '100%',
    gap: spacing.md,
  },
  logoutButton: {
    marginTop: spacing.sm,
  },
  keepDeletionHint: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});

export default AccountDeletionPendingScreen;

