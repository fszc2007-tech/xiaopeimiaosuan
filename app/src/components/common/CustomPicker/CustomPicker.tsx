/**
 * CustomPicker - 自定义选择器组件
 * 
 * 纯 JavaScript 实现，不依赖原生模块
 * 底部弹出 Modal，滚动选择
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { colors } from '@/theme';
import { useTranslation } from 'react-i18next';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PickerItem {
  label: string;
  value: string;
}

interface CustomPickerProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  items: PickerItem[];
  selectedValue: string;
  title?: string;
}

export const CustomPicker: React.FC<CustomPickerProps> = ({
  visible,
  onClose,
  onConfirm,
  items,
  selectedValue,
  title,
}) => {
  const { t } = useTranslation();
  const [tempValue, setTempValue] = useState(selectedValue);
  const displayTitle = title || t('common.select');
  const scrollViewRef = useRef<ScrollView>(null);
  const itemHeight = 56; // 每个选项的高度

  // 当 Modal 打开时，自动滚动到选中项
  useEffect(() => {
    if (visible && scrollViewRef.current) {
      const selectedIndex = items.findIndex(item => item.value === selectedValue);
      if (selectedIndex >= 0) {
        // 延迟滚动，确保 Modal 完全打开
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({
            y: selectedIndex * itemHeight - itemHeight * 2, // 让选中项显示在中间
            animated: true,
          });
        }, 300);
      }
    }
    // 重置 tempValue
    setTempValue(selectedValue);
  }, [visible, selectedValue, items]);

  const handleConfirm = () => {
    onConfirm(tempValue);
    onClose();
  };

  const handleCancel = () => {
    setTempValue(selectedValue); // 恢复原值
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={handleCancel}
        />
        
        <View style={styles.container}>
          {/* 顶部标题栏 */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
              <Text style={styles.cancelText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
            
            <Text style={styles.title}>{displayTitle}</Text>
            
            <TouchableOpacity onPress={handleConfirm} style={styles.confirmButton}>
              <Text style={styles.confirmText}>{t('common.confirm')}</Text>
            </TouchableOpacity>
          </View>

          {/* 选项列表 */}
          <ScrollView 
            ref={scrollViewRef}
            style={styles.listContainer}
            showsVerticalScrollIndicator={false}
            decelerationRate="fast"
          >
            {items.map((item) => {
              const isSelected = item.value === tempValue;
              return (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.item,
                    isSelected && styles.itemSelected,
                  ]}
                  onPress={() => setTempValue(item.value)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.itemText,
                    isSelected && styles.itemTextSelected,
                  ]}>
                    {item.label}
                  </Text>
                  {isSelected && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    flex: 1,
  },
  container: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: SCREEN_HEIGHT * 0.6,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
  },
  cancelButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cancelText: {
    fontSize: 16,
    color: '#999',
  },
  confirmButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  confirmText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  listContainer: {
    maxHeight: SCREEN_HEIGHT * 0.5,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    height: 56, // ✅ 固定高度，便于计算滚动位置
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  itemSelected: {
    backgroundColor: '#f0f4ff',
  },
  itemText: {
    fontSize: 16,
    color: '#333',
  },
  itemTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

