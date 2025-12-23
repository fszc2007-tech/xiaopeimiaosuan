/**
 * 筛选弹窗组件
 * 
 * 功能：
 * - 按关系类型筛选命盘
 * - 排序方式选择
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { X, Check } from 'lucide-react-native';
import { colors, fontSizes, fontWeights, spacing, radius } from '@/theme';
import { useTranslation } from 'react-i18next';

export type RelationType = 'self' | 'partner' | 'parent' | 'child' | 'friend' | 'other';
export type SortByType = 'recent' | 'created' | 'relation';

interface FilterBottomSheetProps {
  visible: boolean;
  selectedTypes: RelationType[];
  sortBy: SortByType;
  onClose: () => void;
  onApply: (types: RelationType[], sortBy: SortByType) => void;
}

// 这些选项会在组件内部通过 i18n 生成

export const FilterBottomSheet: React.FC<FilterBottomSheetProps> = ({
  visible,
  selectedTypes,
  sortBy,
  onClose,
  onApply,
}) => {
  const { t } = useTranslation();
  const [tempTypes, setTempTypes] = useState<RelationType[]>(selectedTypes);
  const [tempSortBy, setTempSortBy] = useState<SortByType>(sortBy);

  // 动态生成关系选项（使用 i18n）
  const RELATION_OPTIONS: Array<{ key: RelationType; label: string }> = [
    { key: 'self', label: t('cases.relationSelf') },
    { key: 'partner', label: t('cases.relationPartner') },
    { key: 'parent', label: t('cases.relationParent') },
    { key: 'child', label: t('cases.relationChild') },
    { key: 'friend', label: t('cases.relationFriend') },
    { key: 'other', label: t('cases.relationOther') },
  ];

  // 动态生成排序选项（使用 i18n）
  const SORT_OPTIONS: Array<{ key: SortByType; label: string; desc: string }> = [
    { key: 'recent', label: t('cases.sortRecent'), desc: t('cases.sortRecentDesc') },
    { key: 'created', label: t('cases.sortCreated'), desc: t('cases.sortCreatedDesc') },
    { key: 'relation', label: t('cases.sortRelation'), desc: t('cases.sortRelationDesc') },
  ];

  // 切换关系类型选择
  const toggleType = (type: RelationType) => {
    if (tempTypes.includes(type)) {
      setTempTypes(tempTypes.filter((t) => t !== type));
    } else {
      setTempTypes([...tempTypes, type]);
    }
  };

  // 重置筛选
  const handleReset = () => {
    setTempTypes([]);
    setTempSortBy('recent');
  };

  // 应用筛选
  const handleApply = () => {
    onApply(tempTypes, tempSortBy);
    onClose();
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
          {/* 顶部栏 */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{t('cases.filterBy')}</Text>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <X color={colors.textSecondary} size={20} />
            </Pressable>
          </View>

          {/* 关系类型 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('cases.relationType')}</Text>
            <View style={styles.chipContainer}>
              {RELATION_OPTIONS.map((option) => (
                <Pressable
                  key={option.key}
                  style={[
                    styles.chip,
                    tempTypes.includes(option.key) && styles.chipSelected,
                  ]}
                  onPress={() => toggleType(option.key)}
                >
                  {tempTypes.includes(option.key) && (
                    <Check color={colors.primary} size={14} />
                  )}
                  <Text
                    style={[
                      styles.chipText,
                      tempTypes.includes(option.key) && styles.chipTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* 排序方式 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('cases.sortBy')}</Text>
            {SORT_OPTIONS.map((option) => (
              <Pressable
                key={option.key}
                style={styles.sortOption}
                onPress={() => setTempSortBy(option.key)}
              >
                <View style={styles.sortOptionContent}>
                  <Text style={styles.sortOptionLabel}>{option.label}</Text>
                  <Text style={styles.sortOptionDesc}>{option.desc}</Text>
                </View>
                {tempSortBy === option.key && (
                  <Check color={colors.primary} size={20} />
                )}
              </Pressable>
            ))}
          </View>

          {/* 底部按钮 */}
          <View style={styles.footer}>
            <Pressable style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>{t('common.reset')}</Text>
            </Pressable>
            <Pressable style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>{t('common.apply')}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

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
    maxHeight: '80%',
  },
  
  // 顶部栏
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
  },
  closeButton: {
    padding: spacing.xs,
  },
  
  // Section
  section: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
    marginBottom: spacing.md,
  },
  
  // 关系类型 Chips
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
    gap: 4,
  },
  chipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.greenSoftBg,
  },
  chipText: {
    fontSize: fontSizes.sm,
    color: colors.ink,
  },
  chipTextSelected: {
    color: colors.primary,
    fontWeight: fontWeights.medium,
  },
  
  // 排序选项
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sortOptionContent: {
    flex: 1,
  },
  sortOptionLabel: {
    fontSize: fontSizes.base,
    color: colors.ink,
    marginBottom: 4,
  },
  sortOptionDesc: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
  },
  
  // 底部按钮
  footer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  resetButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: fontSizes.base,
    color: colors.ink,
    fontWeight: fontWeights.medium,
  },
  applyButton: {
    flex: 2,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: fontSizes.base,
    color: '#FFFFFF',
    fontWeight: fontWeights.semibold,
  },
});

