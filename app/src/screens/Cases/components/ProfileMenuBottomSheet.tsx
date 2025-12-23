/**
 * 檔案操作菜單彈窗
 * 
 * 功能：
 * - 編輯檔案信息
 * - 刪除檔案
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { Trash2, X } from 'lucide-react-native';
import { colors, fontSizes, fontWeights, spacing, radius } from '@/theme';
import { useTranslation } from 'react-i18next';

interface ProfileMenuBottomSheetProps {
  visible: boolean;
  profileName: string;
  onClose: () => void;
  onDelete: () => void;
}

export const ProfileMenuBottomSheet: React.FC<ProfileMenuBottomSheetProps> = ({
  visible,
  profileName,
  onClose,
  onDelete,
}) => {
  const { t } = useTranslation();

  const handleDelete = () => {
    // 先触发删除确认（由父组件处理），不关闭菜单弹窗
    // 删除确认弹窗会处理关闭菜单的逻辑
    onDelete();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          {/* 頂部信息 */}
          <View style={styles.header}>
            <View>
              <Text style={styles.profileName}>{profileName}</Text>
            </View>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <X color={colors.textSecondary} size={20} />
            </Pressable>
          </View>

          {/* 操作菜單 */}
          <View style={styles.menu}>
            <MenuItem
              icon={Trash2}
              iconColor={colors.brandRed}
              label={t('cases.deleteProfile')}
              desc={t('cases.deleteProfileDesc')}
              onPress={handleDelete}
              destructive
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

// 菜单项组件
interface MenuItemProps {
  icon: React.ComponentType<{ color: string; size: number }>;
  iconColor: string;
  label: string;
  desc: string;
  destructive?: boolean;
  onPress: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon: Icon,
  iconColor,
  label,
  desc,
  destructive,
  onPress,
}) => (
  <Pressable
    style={({ pressed }) => [
      styles.menuItem,
      pressed && styles.menuItemPressed,
    ]}
    onPress={onPress}
  >
    <View style={[styles.iconContainer, { backgroundColor: `${iconColor}20` }]}>
      <Icon color={iconColor} size={20} />
    </View>
    <View style={styles.menuItemContent}>
      <Text style={[styles.menuItemLabel, destructive && styles.menuItemLabelDestructive]}>
        {label}
      </Text>
      <Text style={styles.menuItemDesc}>{desc}</Text>
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.cardBg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingBottom: spacing.xl,
  },
  
  // 顶部
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  profileName: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  closeButton: {
    padding: spacing.xs,
  },
  
  // 菜单
  menu: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemPressed: {
    opacity: 0.6,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemLabel: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    color: colors.ink,
    marginBottom: 2,
  },
  menuItemLabelDestructive: {
    color: colors.brandRed,
  },
  menuItemDesc: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
});

