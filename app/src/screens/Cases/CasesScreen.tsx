/**
 * 命盘档案页面
 * 
 * 功能：
 * - 展示命盘档案列表
 * - 当前命主管理
 * - 搜索与筛选
 * - 新增/编辑/删除档案
 * 
 * 参考文档：app.doc/features/檔案－命盤列表設計文檔.md
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Plus, FolderOpen, MoreHorizontal } from 'lucide-react-native';
import { colors, fontSizes, fontWeights, spacing, radius } from '@/theme';
import { SCREEN_NAMES } from '@/constants/routes';
import { RelationType } from './components/FilterBottomSheet';
import { ProfileMenuBottomSheet } from './components/ProfileMenuBottomSheet';
import { MessageDialog, MessageType, ConfirmDialog } from '@/components/common';
import { useTranslation } from 'react-i18next';

interface ChartProfile {
  profileId: string;
  userId: string;
  chartId: string;
  name: string;
  relationType: RelationType;
  relationLabel?: string;
  isSelf: boolean;
  notes?: string;
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  birthHour: number;
  birthMinute?: number;
  gender: 'male' | 'female';
  createdAt: string;
  lastViewedAt?: string;
}

export const CasesScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [profiles, setProfiles] = useState<ChartProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // 菜单弹窗状态
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<ChartProfile | null>(null);
  
  // 删除确认弹窗状态
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<ChartProfile | null>(null);
  
  const [messageDialog, setMessageDialog] = useState<{
    visible: boolean;
    type: MessageType;
    title: string;
    message?: string;
  }>({
    visible: false,
    type: 'info',
    title: '',
  });

  // 获取档案列表
  const fetchProfiles = useCallback(async (isRefresh = false) => {
    // ✅ 检查 token 是否存在
    const { useAuthStore } = await import('@/store');
    const token = useAuthStore.getState().token;
    
    if (!token || token.length === 0) {
      console.warn('[CasesScreen] ⚠️ token 不存在，跳过 API 请求');
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }
    
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      console.log('[CasesScreen] ✅ 开始请求 API，token 长度:', token.length);

      // 调用 Core API
      const { baziApi } = await import('@/services/api');
      const data = await baziApi.getCharts({
        limit: 100,
      });
      
      console.log('[CasesScreen] ✅ API 返回数据:', {
        profilesCount: data.profiles?.length || 0,
        profiles: data.profiles,
      });
      
      setProfiles(data.profiles || []);
    } catch (error: any) {
      // 统一错误信息提取
      const errorMessage = 
        error?.response?.data?.error?.message || 
        error?.message || 
        error?.code || 
        t('error.notFound');
      
      const errorCode = error?.code || error?.response?.data?.error?.code || 'UNKNOWN_ERROR';
      const statusCode = error?.response?.status || error?.status;
      
      console.error('[CasesScreen] ❌ Failed to fetch profiles:', {
        message: errorMessage,
        code: errorCode,
        status: statusCode,
        response: error.response?.data,
        fullError: error,
        errorType: error instanceof Error ? 'Error' : typeof error,
      });
      
      // 根据错误类型显示不同的提示
      let userMessage = errorMessage;
      if (errorCode === 'NETWORK_ERROR' || !statusCode) {
        userMessage = t('error.network') || '网络连接失败，请检查网络设置';
      } else if (statusCode === 401) {
        userMessage = t('error.unauthorized') || '登录已过期，请重新登录';
      } else if (statusCode === 403) {
        userMessage = t('error.forbidden') || '权限不足';
      } else if (statusCode >= 500) {
        userMessage = t('error.server') || '服务器错误，请稍后重试';
      }
      
      Alert.alert(t('dialog.error'), userMessage);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // 页面聚焦时刷新
  useFocusEffect(
    useCallback(() => {
      // ✅ 检查认证状态
      const checkAndFetch = async () => {
        const { getIsAuthenticated } = await import('@/store');
        const isAuthenticated = getIsAuthenticated(); // 🔥 使用安全的函数，确保返回布尔值
        
        if (isAuthenticated) {
          fetchProfiles();
        } else {
          console.log('[CasesScreen] 未登录状态，跳过数据获取');
        }
      };
      
      checkAndFetch();
    }, [fetchProfiles])
  );

  // 下拉刷新
  const handleRefresh = () => {
    fetchProfiles(true);
  };

  // 点击档案卡片
  const handleProfilePress = (profile: ChartProfile) => {
    navigation.navigate(SCREEN_NAMES.CHART_DETAIL as any, {
      chartId: profile.chartId,
      masterId: profile.profileId,
    });
  };

  // 新增命盘
  const handleAddProfile = () => {
    navigation.navigate(SCREEN_NAMES.MANUAL_BAZI as any, {
      from: 'cases',
    });
  };

  // 点击更多按钮（三个点）
  const handleMorePress = (profile: ChartProfile) => {
    setSelectedProfile(profile);
    setMenuVisible(true);
  };

  // 关闭菜单
  const handleCloseMenu = () => {
    setMenuVisible(false);
    setSelectedProfile(null);
  };

  // 触发删除确认弹窗
  const handleDelete = () => {
    if (selectedProfile) {
      setProfileToDelete(selectedProfile);
      setDeleteDialogVisible(true);
      setMenuVisible(false);
    }
  };

  // 确认删除
  const handleConfirmDelete = async () => {
    if (!profileToDelete) return;
    
    setDeleteDialogVisible(false);
    const profile = profileToDelete;
    
    // 清空相关状态
    setProfileToDelete(null);
    setSelectedProfile(null);

    try {
      const { baziApi } = await import('@/services/api');
      // 如果 chartId 不存在，使用 profileId 删除
      const idToDelete = profile.chartId || profile.profileId;
      await baziApi.deleteChart(idToDelete);
      
      // 刷新列表
      fetchProfiles(true);
      
      // 显示成功消息
      setMessageDialog({
        visible: true,
        type: 'success',
        title: '成功',
        message: '檔案已刪除',
      });
    } catch (error: any) {
      console.error('[CasesScreen] Delete error:', error);
      const errorMessage = error.response?.data?.error?.message || error.message || t('cases.deleteFailed');
      
      // 显示错误消息
      setMessageDialog({
        visible: true,
        type: 'error',
        title: t('dialog.error'),
        message: errorMessage,
      });
    }
  };

  // 取消删除
  const handleCancelDelete = () => {
    setDeleteDialogVisible(false);
    setProfileToDelete(null);
  };

  // 调试日志
  console.log('[CasesScreen] 📊 数据状态:', {
    profilesCount: profiles.length,
    isLoading,
    isRefreshing,
  });

  // 渲染空状态
  if (!isLoading && profiles.length === 0) {
    return (
      <View style={styles.container}>
        {/* 顶部栏 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('cases.title')}</Text>
          <Pressable style={styles.addButton} onPress={handleAddProfile}>
            <Plus color={colors.primary} size={20} />
            <Text style={styles.addButtonText}>{t('cases.addNew')}</Text>
          </Pressable>
        </View>

        {/* 空状态 */}
        <View style={styles.emptyContainer}>
          <FolderOpen color={colors.textSecondary} size={80} strokeWidth={1} />
          <Text style={styles.emptyTitle}>{t('cases.emptyState')}</Text>
          <Text style={styles.emptyDesc}>
            {t('cases.emptyHint')}
          </Text>
          <Pressable style={styles.emptyButton} onPress={handleAddProfile}>
            <Text style={styles.emptyButtonText}>{t('cases.createForSelf')}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View testID="cases-screen" style={styles.container}>
      {/* 顶部栏 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('cases.title')}</Text>
        <Pressable style={styles.addButton} onPress={handleAddProfile}>
          <Plus color={colors.primary} size={20} />
          <Text style={styles.addButtonText}>{t('cases.addNew')}</Text>
        </Pressable>
      </View>

      {/* 操作菜单弹窗 */}
      {selectedProfile && (
        <ProfileMenuBottomSheet
          visible={menuVisible}
          profileName={selectedProfile.name}
          onClose={handleCloseMenu}
          onDelete={handleDelete}
        />
      )}

      {/* 删除确认弹窗 */}
      {profileToDelete && (
        <ConfirmDialog
          visible={deleteDialogVisible}
          title={t('cases.confirmDelete')}
          message={t('cases.confirmDeleteMessageWithName', { name: profileToDelete.name })}
          confirmText={t('common.delete')}
          cancelText={t('common.cancel')}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          destructive
        />
      )}

      {/* 档案列表 */}
      <ScrollView
        style={styles.listContainer}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {/* 命盘列表 */}
        {profiles.length > 0 && (
          <View style={styles.section}>
            {profiles.map((profile) => (
              <ProfileCard
                key={profile.profileId}
                profile={profile}
                onPress={() => handleProfilePress(profile)}
                onMorePress={() => handleMorePress(profile)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* 消息提示弹窗 */}
      <MessageDialog
        visible={messageDialog.visible}
        type={messageDialog.type}
        title={messageDialog.title}
        message={messageDialog.message}
        onConfirm={() => setMessageDialog({ ...messageDialog, visible: false })}
      />
    </View>
  );
};

// 命盘卡片组件
interface ProfileCardProps {
  profile: ChartProfile;
  onPress: () => void;
  onMorePress: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ profile, onPress, onMorePress }) => {
  const { t } = useTranslation();
  const relationLabels: Record<RelationType, string> = {
    self: t('cases.relationSelf'),
    partner: t('cases.relationPartner'),
    parent: t('cases.relationParent'),
    child: t('cases.relationChild'),
    friend: t('cases.relationFriend'),
    other: t('cases.relationOther'),
  };

  return (
    <Pressable
      style={styles.profileCard}
      onPress={onPress}
    >
      <View style={styles.profileCardContent}>
        {/* 头像 */}
        <View style={styles.profileAvatar}>
          <Text style={styles.profileAvatarText}>
            {profile.name.charAt(0)}
          </Text>
        </View>

        {/* 信息区 */}
        <View style={styles.profileInfo}>
          <View style={styles.profileNameRow}>
            <Text style={styles.profileName}>{profile.name}</Text>
          </View>
          
          <Text style={styles.profileMeta}>
            {relationLabels[profile.relationType]} · {profile.birthYear}-
            {String(profile.birthMonth).padStart(2, '0')}-
            {String(profile.birthDay).padStart(2, '0')} {String(profile.birthHour).padStart(2, '0')}:
            {String(profile.birthMinute || 0).padStart(2, '0')}
          </Text>
        </View>

        {/* 更多按钮（三个点） */}
        <Pressable
          style={styles.moreButton}
          onPress={(e) => {
            e.stopPropagation();
            onMorePress();
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MoreHorizontal color={colors.textSecondary} size={20} />
        </Pressable>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  
  // 顶部栏
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    color: colors.ink,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addButtonText: {
    fontSize: fontSizes.sm,
    color: colors.primary,
  },
  
  // 列表
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  
  // 档案卡片
  profileCard: {
    backgroundColor: colors.cardBg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  profileCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.greenSoftBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  profileAvatarText: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    color: colors.primary,
  },
  profileInfo: {
    flex: 1,
  },
  profileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  profileName: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
    marginRight: spacing.xs,
  },
  profileMeta: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  moreButton: {
    padding: spacing.xs,
  },
  
  // 空状态
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['2xl'],
  },
  emptyTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyDesc: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  emptyButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  emptyButtonText: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold,
    color: '#FFFFFF',
  },
});
