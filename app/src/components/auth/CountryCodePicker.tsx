/**
 * 国家代码选择器组件
 * 
 * 功能：
 * - 显示当前选择的国家代码（如 "+852 🇭🇰"）
 * - 点击展开底部弹窗显示完整列表
 * - 支持滚动选择
 * - 根据语言显示对应的地区名称（繁体/简体）
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, fontSizes, fontWeights, spacing, radius } from '@/theme';
import { COUNTRY_CODES, type CountryCode } from '@/constants/countryCodeData';

interface CountryCodePickerProps {
  value: CountryCode;
  onChange: (countryCode: CountryCode) => void;
  disabled?: boolean;
}

export const CountryCodePicker: React.FC<CountryCodePickerProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const { i18n } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  
  const isSimplified = i18n.language === 'zh-CN';

  // #region agent log
  React.useEffect(() => {
    fetch('http://127.0.0.1:7243/ingest/a96a12ed-318a-4e03-9333-94a90fa8074e', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'CountryCodePicker.tsx:37',
        message: 'Modal visibility state changed',
        data: { modalVisible, disabled },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'A',
      }),
    }).catch(() => {});
  }, [modalVisible, disabled]);
  // #endregion

  const handleOpenModal = () => {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/a96a12ed-318a-4e03-9333-94a90fa8074e', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'CountryCodePicker.tsx:handleOpenModal',
        message: 'Opening modal',
        data: { disabled },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'B',
      }),
    }).catch(() => {});
    // #endregion
    if (!disabled) {
      setModalVisible(true);
    }
  };

  const handleCloseModal = () => {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/a96a12ed-318a-4e03-9333-94a90fa8074e', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'CountryCodePicker.tsx:handleCloseModal',
        message: 'Closing modal',
        data: { currentVisible: modalVisible },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'C',
      }),
    }).catch(() => {});
    // #endregion
    setModalVisible(false);
  };

  const handleSelect = (countryCode: CountryCode) => {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/a96a12ed-318a-4e03-9333-94a90fa8074e', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'CountryCodePicker.tsx:handleSelect',
        message: 'Country selected',
        data: { code: countryCode.code, name: countryCode.name },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'D',
      }),
    }).catch(() => {});
    // #endregion
    onChange(countryCode);
    setModalVisible(false);
  };

  const renderCountryItem = ({ item }: { item: CountryCode }) => {
    const isSelected = item.code === value.code;
    const displayName = isSimplified ? item.nameSimplified : item.name;
    
    return (
      <Pressable
        style={({ pressed }) => [
          styles.countryItem,
          isSelected && styles.countryItemSelected,
          pressed && styles.countryItemPressed,
        ]}
        onPress={() => handleSelect(item)}
      >
        <Text style={styles.countryFlag}>{item.flag}</Text>
        <View style={styles.countryInfo}>
          <Text style={[styles.countryName, isSelected && styles.countryNameSelected]}>
            {displayName}
          </Text>
          <Text style={[styles.countryCode, isSelected && styles.countryCodeSelected]}>
            {item.code}
          </Text>
        </View>
        {isSelected && (
          <Text style={styles.checkmark}>✓</Text>
        )}
      </Pressable>
    );
  };

  return (
    <>
      {/* 选择器按钮 */}
      <TouchableOpacity
        style={[styles.picker, disabled && styles.pickerDisabled]}
        onPress={handleOpenModal}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text style={styles.pickerFlag}>{value.flag}</Text>
        <Text style={styles.pickerCode}>{value.code}</Text>
        <Text style={styles.pickerArrow}>▼</Text>
      </TouchableOpacity>

      {/* 底部弹窗 */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={handleCloseModal}
        >
          <View style={styles.modalContent}>
            {/* 标题栏 */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isSimplified ? '选择国家/地区' : '選擇國家/地區'}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleCloseModal}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* 国家列表 */}
            <FlatList
              data={COUNTRY_CODES}
              renderItem={renderCountryItem}
              keyExtractor={(item) => item.code}
              style={styles.countryList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  // ===== 选择器按钮 =====
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    height: 48, // 與 Input 組件高度一致
    minWidth: 100,
  },
  pickerDisabled: {
    opacity: 0.5,
  },
  pickerFlag: {
    fontSize: fontSizes.lg,
    marginRight: spacing.xs,
  },
  pickerCode: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
    color: colors.ink,
    flex: 1,
  },
  pickerArrow: {
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },

  // ===== 弹窗 =====
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.cardBg, // 使用白色背景以提高對比度
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    height: '70%', // 使用固定高度而非 maxHeight，讓 FlatList 可以正確計算高度
    paddingBottom: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold,
    color: colors.ink,
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.bg,
  },
  closeButtonText: {
    fontSize: fontSizes.lg,
    color: colors.textSecondary,
  },

  // ===== 国家列表 =====
  countryList: {
    flex: 1,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '30', // 半透明
  },
  countryItemSelected: {
    backgroundColor: colors.primaryLight + '20', // 浅绿色背景
  },
  countryItemPressed: {
    backgroundColor: colors.bg,
  },
  countryFlag: {
    fontSize: fontSizes.xl,
    marginRight: spacing.md,
  },
  countryInfo: {
    flex: 1,
  },
  countryName: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  countryNameSelected: {
    color: colors.primary,
  },
  countryCode: {
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  countryCodeSelected: {
    color: colors.primary + 'CC', // 半透明
  },
  checkmark: {
    fontSize: fontSizes.xl,
    color: colors.primary,
    fontWeight: fontWeights.bold,
  },
});

